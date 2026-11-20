# Chrome Web Store listing

The copy and answers for the Chrome Web Store submission form. This file is not included in the extension package.

## Name

Tab Groups from Bookmarks

The store takes this from `name` in `manifest.json`.

## Short description

Open folders of saved bookmarks as named tab groups. Reopen a group at any time to reset it to your original bookmarks.

The store takes this from `description` in `manifest.json`. It can be 132 characters at most.

## Detailed description

The store shows this as plain text, so it has no Markdown formatting.

```text
Tab Groups from Bookmarks opens a folder of saved bookmarks as a named tab group.

The saved bookmarks are the source of truth. Changing the open tabs, closing them or adding other tabs into the mix never changes the original snapshot. Opening the tab group again resets the group to your original bookmarked URLs.

How to set up your groups

The quickest way to start is to open the extension panel and choose "set up using demo content". This creates a "Tab Groups" folder on your bookmarks bar, with a demo folder and bookmarks inside of it, so you can see how it works.

Alternatively, if you want to set it up manually yourself:

1. Create a bookmark folder called "Tab Groups"
2. Create a new folder inside of that folder and name it what you want your tab group to be called
3. Add bookmarks to the named group folder
4. Open the named group from the extension panel

How to use it

Select the extension icon to open your groups. It will show the nested folder names as groups.

Select the round colour swatch next to a group to choose its colour. The colour is saved for that folder and used every time it opens. If the group is already open, it changes colour straight away.

Selecting a group from the list will open all of the bookmarks as a named group with the assigned colour. If that group is already open, it will reset it, closing all of the tabs and replacing them with the original bookmarked URLs.

Good to know

- You can have more than one "Tab Groups" folder. The extension will combine and list them automatically.
- Only bookmarks directly inside nested folders are opened. Subfolders are ignored.
- Bookmarks that Chrome won't let extensions open, such as bookmarklets, are skipped. The extension tells you when this happens.
- It follows your light or dark system theme.
- It works with a keyboard and screen readers, and in high contrast mode.
- You do not need an account, and nothing leaves your device.
```

## Category

Productivity › Workflow & Planning

## Language

English (United Kingdom)

## Single purpose

Opens a folder of saved bookmarks as a named Chrome tab group.

## Permission justifications

- **bookmarks**: Reads the nested folders inside the user's "Tab Groups" folders, to list them as groups and get the bookmarks to open. It only changes bookmarks when the user chooses "set up using demo content", which creates a "Tab Groups" folder on the bookmarks bar, with a demo folder and bookmarks inside of it.
- **tabGroups**: Creates the tab group for a folder, names it, sets its colour, and finds it again so it can be reset.
- **storage**: Saves the colour chosen for each group, and which open tab group belongs to which folder, on the user's device.

## Privacy practices

- **Remote code:** No, I am not using remote code. All JavaScript, CSS and fonts are packaged with the extension.
- **Data usage:** Leave every data type unticked. The extension does not collect any of them.
- **Certifications:** Tick all three. The extension does not sell or transfer user data, does not use it for unrelated purposes, and does not use it for credit decisions.
- **Privacy policy URL:** https://github.com/abbott567/tab-groups-from-bookmarks/blob/main/PRIVACY.md

## Additional fields

Both of these are optional.

- **Homepage URL:** https://github.com/abbott567/tab-groups-from-bookmarks
- **Support URL:** https://github.com/abbott567/tab-groups-from-bookmarks/issues

## Test instructions for reviewers

You do not need an account or a login.

1. Select the extension icon. With no "Tab Groups" folder in your bookmarks, the extension panel shows the setup instructions.
2. Select "set up using demo content". This creates a "Tab Groups" folder on the bookmarks bar, with a "Craig Abbott" folder and 4 bookmarks inside of it.
3. Select "Craig Abbott". Its 4 bookmarks open as a pink tab group called "Craig Abbott".
4. Change or close some of those tabs, then select "Craig Abbott" again. The group resets to the original 4 bookmarks.
5. Select the round colour swatch next to a group to choose its colour.

## Images

All of these are made by `python3 scripts/make-store-images.py` and saved in `store/`, apart from the store icon.

| Store field | File |
| --- | --- |
| Store icon, 128 × 128 | `icons/icon-128.png` |
| Screenshot 1, 1280 × 800 | `store/screenshot-1-groups.png` |
| Screenshot 2, 1280 × 800 | `store/screenshot-2-colours.png` |
| Screenshot 3, 1280 × 800 | `store/screenshot-3-setup.png` |
| Small promo tile, 440 × 280 | `store/promo-small-440x280.png` |
