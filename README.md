# Reddit Liberated

**Remove the Reddit login popup. Hide promoted ads. Browse logged out on Chrome and Firefox.**

Reddit Liberated is a free [Chrome](https://github.com/HeavenlyCatCodes/reddit-liberated/releases/latest) and [Firefox](https://github.com/HeavenlyCatCodes/reddit-liberated/releases/latest) extension that takes down Reddit’s login wall so you can keep reading without an account. It also hides promoted posts and sidebar ads.

If Reddit blocks the page with “Join the most real place on the internet,” a Google Sign-in card, or an 18+ login gate, this extension removes that overlay and restores scrolling.

[Download the latest release](https://github.com/HeavenlyCatCodes/reddit-liberated/releases/latest)

| Browser | Zip |
| --- | --- |
| Chrome, Edge, Brave, Arc | [reddit-liberated-chrome-1.1.0.zip](https://github.com/HeavenlyCatCodes/reddit-liberated/releases/download/v1.1.0/reddit-liberated-chrome-1.1.0.zip) |
| Firefox | [reddit-liberated-firefox-1.1.0.zip](https://github.com/HeavenlyCatCodes/reddit-liberated/releases/download/v1.1.0/reddit-liberated-firefox-1.1.0.zip) |

## What Reddit Liberated removes

- The center **login / signup modal** (“Join the most real place on the internet”)
- The **Sign in to Reddit with Google** One Tap card
- The logged-out **signup rail** on the left
- **NSFW / 18+** login walls and blur overlays
- **Get the app** banners that lock the page
- The **scroll lock** Reddit applies while those overlays are up
- **Promoted posts**, sidebar ad units, comment-page ads, and Premium upsell banners

The header **Log In** button stays. Use it when you actually want an account. Official `/login` and `/register` pages are left alone.

Works on `www.reddit.com`, `old.reddit.com`, `new.reddit.com`, and other `*.reddit.com` hosts.

## Install on Chrome, Edge, Brave, or Arc

1. Download [reddit-liberated-chrome-1.1.0.zip](https://github.com/HeavenlyCatCodes/reddit-liberated/releases/download/v1.1.0/reddit-liberated-chrome-1.1.0.zip).
2. Unzip it to a folder you will keep (Chrome loads the extension from that path).
3. Open `chrome://extensions` (or `edge://extensions`).
4. Turn on **Developer mode** (top right).
5. Click **Load unpacked**.
6. Select the unzipped folder — the one that contains `manifest.json`.
7. Open [reddit.com](https://www.reddit.com) while logged out.

To use it in Incognito or InPrivate, open the extension **Details** and enable **Allow in Incognito**.

If Chrome says the extension was disabled after a restart, open `chrome://extensions` and turn it back on.

## Install on Firefox

1. Download [reddit-liberated-firefox-1.1.0.zip](https://github.com/HeavenlyCatCodes/reddit-liberated/releases/download/v1.1.0/reddit-liberated-firefox-1.1.0.zip).
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…**.
4. Choose the zip, or unzip it and choose `manifest.json`.
5. Open [reddit.com](https://www.reddit.com) while logged out.

Firefox removes temporary add-ons when you quit the browser. Load the same zip again after a restart. A permanent listing needs a signed add-on on [addons.mozilla.org](https://addons.mozilla.org).

## How to use it

Click the **Reddit Liberated** icon in the toolbar.

- **Walls down** — login popups, Google One Tap, and scroll locks stay stripped.
- **Hide ads** — promoted feed posts, sidebar units, and comment ads stay hidden. Turn this off if you want ads back without reloading.

## Privacy

The extension runs only on `*.reddit.com`. It uses the `storage` permission to remember your on/off switches. It does not collect analytics, sell data, or send anything to a third-party server.

## Build from source

```powershell
git clone https://github.com/HeavenlyCatCodes/reddit-liberated.git
cd reddit-liberated
powershell -File scripts\pack.ps1
```

That writes versioned zips to `dist/`:

- `reddit-liberated-chrome-1.1.0.zip`
- `reddit-liberated-firefox-1.1.0.zip`

Load the unzipped project folder as an unpacked extension if you are editing the code.

## FAQ

**Do I need a Reddit account?**  
No. This is for browsing while logged out.

**Will I still be able to log in?**  
Yes. The header Log In button still works.

**Does it hide promoted posts that look like normal posts?**  
Yes. It targets Reddit’s promoted-post markers on new Reddit and old Reddit, plus sidebar and comment-page ads.

**Why is the Firefox add-on gone after I close the browser?**  
Firefox only allows unsigned extensions as temporary add-ons. Load the zip again from `about:debugging` after a restart.

**Is this on the Chrome Web Store?**  
Not yet. Install it from the [GitHub release zips](https://github.com/HeavenlyCatCodes/reddit-liberated/releases/latest) with Developer mode.

## License

Use and share freely for personal browsing.
