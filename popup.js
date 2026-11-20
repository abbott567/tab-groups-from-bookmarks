const list = document.getElementById("folders");

// Chrome's tab group colours, in the order Chrome shows them.
const COLORS = [
  { id: "grey", label: "Grey" },
  { id: "blue", label: "Blue" },
  { id: "red", label: "Red" },
  { id: "yellow", label: "Yellow" },
  { id: "green", label: "Green" },
  { id: "pink", label: "Pink" },
  { id: "purple", label: "Purple" },
  { id: "cyan", label: "Cyan" },
  { id: "orange", label: "Orange" },
];
const labelFor = (id) => COLORS.find((c) => c.id === id)?.label || id;
const status = document.getElementById("status");

function setStatus(text, isError = false) {
  status.textContent = text;
  status.classList.toggle("error", isError);
}

async function send(message) {
  const response = await chrome.runtime.sendMessage(message);
  if (!response?.ok) throw new Error(response?.error || "Something went wrong.");
  return response.result;
}

const empty = document.getElementById("empty");
const setupButton = document.getElementById("setup");

function showFolders(folders) {
  list.replaceChildren(...folders.map(renderRow));
  empty.hidden = folders.length > 0;
  list.hidden = folders.length === 0;
}

async function render() {
  try {
    showFolders(await send({ type: "list" }));
  } catch (err) {
    setStatus(err.message, true);
  }
}

// Demo setup: create "Tab Groups" with a demo folder, then show it.
setupButton.addEventListener("click", async () => {
  setupButton.disabled = true;
  setStatus("");
  try {
    showFolders(await send({ type: "setUpDemo" }));
    // The button has gone, so move keyboard focus to the new demo group.
    list.querySelector("button.open")?.focus();
  } catch (err) {
    setStatus(err.message, true);
  } finally {
    setupButton.disabled = false;
  }
});

function renderRow(folder) {
  const title = folder.title || "(untitled)";
  const li = document.createElement("li");
  const row = document.createElement("div");
  row.className = "row";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "open";
  const name = document.createElement("span");
  name.className = "name";
  name.textContent = title;
  const count = document.createElement("span");
  count.className = "count";
  count.textContent = `${folder.count} ${folder.count === 1 ? "tab" : "tabs"}`;
  button.append(name, count);
  button.addEventListener("click", () => open(folder.id));

  const swatch = document.createElement("button");
  swatch.type = "button";
  swatch.className = "swatch";
  swatch.setAttribute("aria-expanded", "false");

  const palette = document.createElement("div");
  palette.className = "palette";
  palette.hidden = true;
  palette.setAttribute("role", "group");
  palette.setAttribute("aria-label", `Colour for ${title}`);

  const showColor = (color) => {
    swatch.dataset.color = color;
    swatch.setAttribute("aria-label", `Colour for ${title}: ${labelFor(color)}. Change colour`);
    swatch.title = `Colour: ${labelFor(color)}`;
    for (const option of palette.children) {
      option.setAttribute("aria-pressed", String(option.dataset.color === color));
    }
  };

  for (const { id, label } of COLORS) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "color";
    option.dataset.color = id;
    option.title = label;
    option.setAttribute("aria-label", label);
    option.addEventListener("click", async () => {
      const previous = swatch.dataset.color;
      showColor(id);
      togglePalette(false);
      try {
        await send({ type: "setColor", folderId: folder.id, color: id });
      } catch (err) {
        showColor(previous);
        setStatus(err.message, true);
      }
    });
    palette.append(option);
  }

  const togglePalette = (open, { focus = true } = {}) => {
    palette.hidden = !open;
    swatch.setAttribute("aria-expanded", String(open));
    if (!focus) return;
    if (open) palette.querySelector('[aria-pressed="true"]')?.focus();
    else swatch.focus();
  };

  swatch.addEventListener("click", () => {
    const opening = palette.hidden;
    // Only one palette open at a time.
    for (const other of list.querySelectorAll(".palette:not([hidden])")) {
      other.hidden = true;
      other.closest("li").querySelector(".swatch").setAttribute("aria-expanded", "false");
    }
    togglePalette(opening);
  });
  palette.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation(); // don't close the whole popup
      togglePalette(false);
    }
  });

  showColor(folder.color);
  row.append(button, swatch);
  li.append(row, palette);
  return li;
}

async function open(folderId) {
  try {
    const { skipped } = await send({ type: "open", folderId });
    if (skipped) {
      // Keep the popup open so the message can be read.
      setStatus(
        `Skipped ${skipped} ${skipped === 1 ? "bookmark" : "bookmarks"} that Chrome won't let extensions open.`,
        true
      );
      return;
    }
    window.close();
  } catch (err) {
    setStatus(err.message, true);
  }
}

// Extension popups can't follow links themselves, so open them as tabs.
for (const link of document.querySelectorAll("footer a")) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    chrome.tabs.create({ url: link.href });
    window.close();
  });
}

render();
