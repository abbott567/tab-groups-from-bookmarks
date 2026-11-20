const ROOT_FOLDER_TITLE = "Tab Groups";
const GROUP_COLORS = ["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"];
const MAP_KEY = "folderGroups"; // { [folderId]: groupId }
const COLORS_KEY = "folderColors"; // { [folderId]: color }, kept in local storage

// Created by the demo setup in the popup.
const DEMO_FOLDER = {
  title: "Craig Abbott",
  color: "pink",
  bookmarks: [
    { title: "craigabbott.co.uk", url: "https://www.craigabbott.co.uk" },
    { title: "Bluesky", url: "https://bsky.app/profile/craigabbott.co.uk" },
    { title: "LinkedIn", url: "https://www.linkedin.com/in/abbott567/" },
    { title: "GitHub", url: "https://github.com/abbott567" },
  ],
};

// ---------- Bookmarks ----------

function isRootTitle(title) {
  return (title || "").trim().toLowerCase() === ROOT_FOLDER_TITLE.toLowerCase();
}

// Every folder named "Tab Groups" (any case), wherever it lives.
async function getRootFolders() {
  const matches = await chrome.bookmarks.search(ROOT_FOLDER_TITLE);
  return matches.filter((node) => !node.url && isRootTitle(node.title));
}

async function listGroupFolders() {
  const roots = await getRootFolders();
  const folders = [];
  for (const root of roots) {
    const children = await chrome.bookmarks.getChildren(root.id);
    folders.push(...children.filter((node) => !node.url));
  }
  const colors = await getColors();
  return Promise.all(
    folders.map(async (folder) => {
      const items = await chrome.bookmarks.getChildren(folder.id);
      return {
        id: folder.id,
        title: folder.title,
        count: items.filter((n) => n.url).length,
        color: colors[folder.id] || defaultColor(folder.title),
      };
    })
  );
}

// Demo setup: use the "Tab Groups" folder on the bookmarks bar, creating it if
// it isn't there, and put a demo folder of bookmarks inside it. "Tab Groups"
// folders nested inside other folders are left alone.
async function setUpDemo() {
  const [tree] = await chrome.bookmarks.getTree();
  const bar = tree.children.find((node) => node.folderType === "bookmarks-bar") || tree.children[0];
  const barChildren = await chrome.bookmarks.getChildren(bar.id);
  const root =
    barChildren.find((node) => !node.url && isRootTitle(node.title)) ||
    (await chrome.bookmarks.create({ parentId: bar.id, title: ROOT_FOLDER_TITLE }));
  const demo = await chrome.bookmarks.create({ parentId: root.id, title: DEMO_FOLDER.title });
  for (const { title, url } of DEMO_FOLDER.bookmarks) {
    await chrome.bookmarks.create({ parentId: demo.id, title, url });
  }
  const colors = await getColors();
  colors[demo.id] = DEMO_FOLDER.color;
  await chrome.storage.local.set({ [COLORS_KEY]: colors });
  return listGroupFolders();
}

// ---------- Folder -> group mapping ----------

async function getMap() {
  const data = await chrome.storage.session.get(MAP_KEY);
  return data[MAP_KEY] || {};
}

async function setMapping(folderId, groupId) {
  const map = await getMap();
  if (groupId === undefined) delete map[folderId];
  else map[folderId] = groupId;
  await chrome.storage.session.set({ [MAP_KEY]: map });
}

chrome.tabGroups.onRemoved.addListener(async (group) => {
  const map = await getMap();
  for (const [folderId, groupId] of Object.entries(map)) {
    if (groupId === group.id) await setMapping(folderId, undefined);
  }
});

async function findExistingGroup(folderId, title) {
  const map = await getMap();
  const mappedId = map[folderId];
  if (mappedId !== undefined) {
    try {
      return await chrome.tabGroups.get(mappedId);
    } catch {
      await setMapping(folderId, undefined);
    }
  }
  // Fallback for groups opened before a service worker or browser restart.
  const groups = await chrome.tabGroups.query({ title });
  return groups.find((g) => g.title === title) || null;
}

// ---------- Colours ----------

function defaultColor(title) {
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  return GROUP_COLORS[hash % GROUP_COLORS.length];
}

async function getColors() {
  const data = await chrome.storage.local.get(COLORS_KEY);
  return data[COLORS_KEY] || {};
}

async function colorFor(folderId, title) {
  const colors = await getColors();
  return colors[folderId] || defaultColor(title);
}

async function setFolderColor(folderId, color) {
  if (!GROUP_COLORS.includes(color)) throw new Error(`Unknown colour: ${color}`);
  const colors = await getColors();
  colors[folderId] = color;
  await chrome.storage.local.set({ [COLORS_KEY]: colors });

  // Recolour the group straight away if it's open.
  const [folder] = await chrome.bookmarks.get(folderId);
  const existing = await findExistingGroup(folderId, folder.title);
  if (existing) await chrome.tabGroups.update(existing.id, { color });
}

// Forget colours for folders that are deleted.
chrome.bookmarks.onRemoved.addListener(async (id) => {
  const colors = await getColors();
  if (id in colors) {
    delete colors[id];
    await chrome.storage.local.set({ [COLORS_KEY]: colors });
  }
});

// ---------- Opening ----------

async function openFolderAsGroup(folderId) {
  const [folder] = await chrome.bookmarks.get(folderId);
  const children = await chrome.bookmarks.getChildren(folderId);
  const urls = children.filter((n) => n.url).map((n) => n.url);
  if (urls.length === 0) {
    throw new Error(`"${folder.title}" has no bookmarks in it.`);
  }

  const existing = await findExistingGroup(folderId, folder.title);
  const oldTabs = existing ? await chrome.tabs.query({ groupId: existing.id }) : [];

  // Open where the old group was if possible, otherwise at the end of the focused window.
  let windowId;
  let index;
  if (oldTabs.length) {
    windowId = existing.windowId;
    index = Math.min(...oldTabs.map((t) => t.index));
  } else {
    const win = await chrome.windows.getLastFocused({ windowTypes: ["normal"] });
    windowId = win.id;
  }

  // Some bookmarks can't be opened by an extension, such as javascript:
  // bookmarklets. Skip those rather than leaving a half-built group.
  const newTabIds = [];
  let skipped = 0;
  for (const url of urls) {
    try {
      const tab = await chrome.tabs.create({
        windowId,
        url,
        active: false,
        ...(index !== undefined ? { index: index + newTabIds.length } : {}),
      });
      newTabIds.push(tab.id);
    } catch {
      skipped += 1;
    }
  }
  if (newTabIds.length === 0) {
    throw new Error(`Chrome couldn't open any of the bookmarks in "${folder.title}".`);
  }

  const groupId = await chrome.tabs.group({ tabIds: newTabIds, createProperties: { windowId } });
  await chrome.tabGroups.update(groupId, { title: folder.title, color: await colorFor(folderId, folder.title), collapsed: false });

  // Close the old tabs only after the new ones exist, so the window never empties.
  if (oldTabs.length) await chrome.tabs.remove(oldTabs.map((t) => t.id));

  await setMapping(folderId, groupId);
  await chrome.tabs.update(newTabIds[0], { active: true });
  await chrome.windows.update(windowId, { focused: true });
  return { opened: newTabIds.length, skipped };
}

// ---------- Messages from the popup ----------

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handlers = {
    list: () => listGroupFolders(),
    open: () => openFolderAsGroup(message.folderId),
    setColor: () => setFolderColor(message.folderId, message.color),
    setUpDemo: () => setUpDemo(),
  };
  const handler = handlers[message?.type];
  if (!handler) return false;

  handler()
    .then((result) => sendResponse({ ok: true, result }))
    .catch((err) => sendResponse({ ok: false, error: err.message }));
  return true; // keep the channel open for the async response
});
