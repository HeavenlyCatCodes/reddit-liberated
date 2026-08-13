# Changelog

All notable changes to Reddit Liberated are listed here.

## [1.2.2] — 2026-08-13

### Fixed

- NSFW posts no longer go **blank** after the overlay is removed. Media stays in place and unblurs.
- NSFW **videos** that showed “This video cannot be played” remount and load a real source.
- Deferred embeds (Redgifs / iframe videos) initialize instead of staying empty.
- The `over18` cookie is set immediately so the player can request the stream.
- Popup **toggles** stay inside the window instead of sliding off the edge.

## [1.2.0] — 2026-08-13

### Added

- **Show NSFW** option in the toolbar popup (on by default).
- Skips Reddit’s **View NSFW content** / **I’m over 18** click.
- Unblurs NSFW images and video in the feed and on post pages.
- Removes 18+ blocking dialogs and thumbnail overlays.
- Sets the `over18` cookie so NSFW communities and search stay open.

Turn **Show NSFW** off in the popup if you want the click-to-view gate back. That reloads the tab.

## [1.1.0] — 2026-08-13

### Added

- **Hide ads** option in the toolbar popup.
- Removes promoted feed posts on new Reddit and old Reddit.
- Hides sidebar ad units, comment-page ads, and Premium upsell banners.
- Chrome and Firefox release zips on GitHub Releases.

## [1.0.0] — 2026-08-13

### Added

- First release for Chrome and Firefox.
- Removes the center login / signup modal.
- Removes the Google Sign-in One Tap card.
- Hides the logged-out signup rail.
- Restores scrolling when Reddit locks the page.
- Toolbar popup to turn login-wall blocking on or off.

[1.2.2]: https://github.com/HeavenlyCatCodes/reddit-liberated/releases/tag/v1.2.2
[1.2.0]: https://github.com/HeavenlyCatCodes/reddit-liberated/releases/tag/v1.2.0
[1.1.0]: https://github.com/HeavenlyCatCodes/reddit-liberated/releases/tag/v1.1.0
[1.0.0]: https://github.com/HeavenlyCatCodes/reddit-liberated/tree/d25e9d2
