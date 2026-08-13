# Reddit Liberated

A Chrome and Firefox extension that removes Reddit’s login wall so you can keep browsing without an account.

It strips:

- The center **“Join the most real place on the internet”** modal
- The Google **Sign in to Reddit** One Tap card
- The logged-out signup rail on the left
- NSFW / 18+ login walls and blur overlays
- App-install banners that lock the page
- The scroll lock Reddit applies while those overlays are up
- **Promoted posts**, sidebar ad units, comment-page ads, and Premium upsell banners

The header **Log In** button is left alone, so you can still sign in when you want to.

## Install in Chrome (or Edge / Brave / Arc)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select this folder: `Reddit no-popup`.
5. Visit [reddit.com](https://www.reddit.com) while logged out. The wall should be gone.

To use it in Incognito, click **Details** on the extension and enable **Allow in Incognito**.

## Install in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select `manifest.json` in this folder.
4. Visit [reddit.com](https://www.reddit.com) while logged out.

Firefox temporary add-ons are cleared when you quit the browser. Load the folder again after a restart.

To keep it permanently, zip this folder and install it as a signed add-on from [addons.mozilla.org](https://addons.mozilla.org), or keep using temporary load for personal use.

## Toolbar popup

Click the extension icon to turn login-wall blocking **On** or **Off**. Off reloads Reddit so the official login wall can show again.

**Hide ads** is a separate switch. It removes promoted feed posts, sidebar units, and comment ads. Turning it off brings those ads back without a reload.

## Files

| File | Role |
| --- | --- |
| `manifest.json` | Chrome MV3 + Firefox 109+ |
| `content.js` / `content.css` | Hide overlays, restore scrolling |
| `popup.html` / `popup.css` / `popup.js` | On/off control |
| `icons/` | Toolbar and store icons |

Works on `www.reddit.com`, `old.reddit.com`, `new.reddit.com`, and other `*.reddit.com` hosts.
