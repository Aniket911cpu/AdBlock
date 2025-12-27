# AdBlock

AdBlock is a browser extension that blocks ads and manages custom blocking rules. This repository contains the extension source (manifest, background and content scripts), configuration and rules, UI for options and popup, and generated indexed rulesets.

## Features
- Block advertisements using declarative rulesets and script-based filtering.
- Options UI to configure behavior and manage local rules.
- Popup UI for quick status and controls.
- Includes generated indexed rulesets in `_metadata/generated_indexed_rulesets`.

## Installation (Development)
1. Open Chrome/Edge/Brave and go to `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select this project folder (the directory containing `manifest.json`).
4. The extension should appear in the toolbar; use the popup and options pages to test behavior.

To update code while developing:
- Edit source files (e.g., `background.js`, `content.js`, `options.js`).
- In the extensions page, click the refresh icon for the extension or click "Reload".

## Usage
- Click the extension icon to open the popup (`popup.html`).
- Open the Options page to edit preferences and rules (`options.html`).
- Certain behaviors are implemented in `background.js` and `content.js`.

## File overview
- `manifest.json`: Extension manifest and permission list.
- `background.js`: Background/service worker logic and rule management.
- `content.js`: Page-injected content script for runtime blocking logic.
- `popup.html`, `popup.js`, `popup.css`: Popup UI and logic.
- `options.html`, `options.js`, `options.css`: Options UI and settings.
- `rules.json`: Local rules for the extension.
- `_metadata/generated_indexed_rulesets/_ruleset1`: Generated ruleset used by the extension.
- `icons/`: Icon assets used by the extension.
- `Screenshots/`: Example screenshots used in the store or docs.
- `changelog.html`: Human-readable changelog.
- `feedback.html`, `feedback.js`: Feedback UI and handling.
- `survey.js`, `thank_you.html`, `uninstall_survey.html`: User survey and uninstall flow.

## Development

Prerequisites:
- A modern Chromium-based browser for testing (Chrome, Edge, Brave).

Workflow:
1. Make changes to the JS/HTML/CSS files in this directory.
2. Reload the unpacked extension in the browser's extensions page.
3. Open DevTools for the extension's popup or the inspected page to debug.

Build / Packaging:
- This project is distributed as an unpacked extension during development. To publish, follow the Chrome Web Store (or Edge Add-ons) packaging and upload procedures.

Testing:
- Manual testing is recommended: load the unpacked extension, visit pages with ads, and verify blocked elements.
- Use `console` logging in `background.js` / `content.js` while debugging.

## Rules and Privacy
- `rules.json` and the generated rulesets determine what is blocked. Review and adjust rules in the Options UI.
- This extension runs locally in the browser; no remote data collection is required by default. If you add telemetry, document it clearly and obtain consent.

## Contributing
- Fork the repo, implement improvements or fixes, and create a pull request.
- Open issues for bugs or feature requests.

## Troubleshooting
- If changes don't appear, reload the extension from the extensions page.
- Check the browser console (DevTools) for errors in `background.js` or `content.js`.

## Credits
- Icons and assets: see `icons/`.

## License
Specify your license in a `LICENSE` file if you plan to open-source this project. If none is present, contact the project owner for licensing terms.

---

If you'd like, I can also:
- Add a `LICENSE` file (e.g., MIT),
- Add a short `CONTRIBUTING.md` with contribution guidelines, or
- Create a packaged zip for store upload.
