# Contributing

Thank you for helping to improve Tab Groups from Bookmarks. Bug reports, ideas and pull requests are all welcome.

By taking part, you agree to follow the [code of conduct](CODE_OF_CONDUCT.md).

## Report a bug or suggest an idea

[Open an issue](https://github.com/abbott567/tab-groups-from-bookmarks/issues/new/choose) and choose the form that fits. Search the existing issues first, in case it has already been raised.

If you have found a security problem, do not open an issue. Follow the [security policy](SECURITY.md) instead.

## Make a change

For anything bigger than a small fix, open an issue first. This lets us agree on the approach before you spend time on it.

The extension is plain HTML, CSS and JavaScript. There is no build step and there are no dependencies to install.

1. Fork the repository and create a branch for your change.
2. Go to `chrome://extensions` and turn on **Developer mode**.
3. Select **Load unpacked** and choose your copy of the folder.
4. Make your change, then select the reload icon on the extension's card to pick it up.
5. Test it in Chrome, then open a pull request.

### What to test

There are no automated tests, so try your change by hand. Check that you can still:

- open a group, change its tabs, then open it again to reset it
- change a group's colour, both while it is open and while it is closed
- set up using demo content, when there is no "Tab Groups" folder

If you change the popup, also check it:

- using only a keyboard
- in both the light and dark system themes

### Things to keep in mind

- **Nothing leaves the device.** Do not add analytics, network requests or remotely hosted code. The [privacy policy](PRIVACY.md) promises this.
- **No dependencies or build step.** If your change needs either, raise it in an issue first.
- **No new permissions.** Adding one can make Chrome ask everyone who uses the extension to approve it again. If your change needs one, raise it in an issue first.
- **Plain British English.** Use "select" instead of "click", because not everyone uses a mouse.
- **Keep the docs in step.** If your change affects how the extension works, update the [README](README.md) too.

## Licence

By contributing, you agree that your work is released under the [MIT License](LICENSE).
