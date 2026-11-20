# Tab Groups from Bookmarks

A Chrome extension that opens a folder of saved bookmarks as a named tab group.

The saved bookmarks are the source of truth. Changing the open tabs, closing them or adding other tabs into the mix never changes the original snapshot. Opening the tab group again resets the group to your original bookmarked URLs.

## How to install it

1. Go to `chrome://extensions` and turn on **Developer mode**.
2. Select **Load unpacked** and choose this folder.
3. Optional: pin the extension to the toolbar from the puzzle-piece menu.

## How to set up your groups

The quickest way to start is to open the extension panel and choose **set up using demo content**. This creates a **Tab Groups** folder on your bookmarks bar, with a demo folder and bookmarks inside of it, so you can see how it works.

Alternatively, if you want to set it up manually yourself:

1. Create a bookmark folder called **Tab Groups**
2. Create a new folder inside of that folder and name it what you want your tab group to be called
3. Add bookmarks to the named group folder
4. Open the named group from the extension panel

### Structure

The easiest way to maintain the groups is to have one folder, with all of your nested folders inside of it. For example:

```
Tab Groups/
  Resources/
    ...
  Social Media/
    ...
  Work/
    ...
```

Alternatively, you can place multiple "Tab Groups" folders inside of other folders, and the extension will combine and list them automatically. For example:

```
Resources/
  Tab Groups/
    ...
Social Media/
  Tab Groups/
    ...
Work/
  Tab Groups/
    ...
```

Only bookmarks directly inside nested folders are opened. Subfolders are ignored.

## How to use it

Select the extension icon to open your groups. It will show the nested folder names as groups.

Select the round colour swatch next to a group to choose its colour. The colour is saved for that folder and used every time it opens. If the group is already open, it changes colour straight away.

Selecting a group from the list will open all of the bookmarks as a named group with the assigned colour. If that group is already open, it will reset it, closing all of the tabs and replacing them with the original bookmarked URLs.

## Releasing

1. Update `version` in `manifest.json`.
2. Run `./scripts/package.sh`. This builds `dist/tab-groups-from-bookmarks-<version>.zip`, which contains only the files the extension needs.
3. If the popup design has changed, run `python3 scripts/make-store-images.py` to update the screenshots and promo tile in `store/`. This needs Google Chrome.
4. Upload the zip in the [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole). The listing copy, permission justifications and images are in `STORE_LISTING.md`. The privacy policy is in `PRIVACY.md`.

The icon is drawn in `icons/icon.svg`. After editing it, run `python3 scripts/make-icons.py` to regenerate the PNG sizes. This needs [Pillow](https://pypi.org/project/pillow/) and Google Chrome.

## Credits

The design follows [craigabbott.co.uk](https://craigabbott.co.uk/). It uses [IBM Plex Sans](https://github.com/IBM/plex), licensed under the SIL Open Font License; see `fonts/OFL.txt`.
