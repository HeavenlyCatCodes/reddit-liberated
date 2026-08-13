(() => {
  "use strict";

  const AUTH_PATHS = [
    "/login",
    "/register",
    "/account/register",
    "/account/login",
  ];

  const SELECTORS = [
    "#desktop-dynamic-upsell-dialog",
    '[id="desktop-dynamic-upsell-dialog"]',
    "#blocking-modal",
    "faceplate-modal#blocking-modal",
    "#blocking-modal-contents",
    "#nsfw-qr-dialog",
    ".rpl-bottom-sheet",
    "xpromo-nsfw-blocking-modal-desktop",
    "xpromo-nsfw-bypassable-modal-desktop",
    ".configured-xpromo-modal",
    "#credential_picker_container",
    "#credential_picker_iframe",
    "iframe#credential_picker_iframe",
    'iframe[src*="accounts.google.com/gsi"]',
    'div[id^="credential_picker"]',
    'shreddit-async-loader[bundlename*="xpromo"]',
    'shreddit-async-loader[bundlename*="Promo"]',
    'shreddit-async-loader[bundlename*="upsell"]',
    '[aria-label="Sign in to Reddit with Google"]',
  ];

  const WALL_PHRASES = [
    "join the most real place on the internet",
    "i already have an account",
    "sign in to reddit with google",
    "get the app to keep using reddit",
    "use the app to continue",
    "log in or sign up to view",
    "sign up to view this community",
    "log in to view this community",
    "you must be 18+ to view this community",
    "this content is for registered users",
  ];

  const SIDEBAR_PHRASES = [
    "join the most real place on the internet",
    "continue with google",
    "continue with email",
    "continue with apple",
    "continue with phone number",
  ];

  const SCROLL_LOCK_CLASSES = [
    "scroll-is-blocked",
    "rpl-scroll-lock",
    "scroll-disabled",
    "overflow-hidden",
  ];

  const AD_SELECTORS = [
    "shreddit-ad-post",
    "shreddit-comments-page-ad",
    "shreddit-sidebar-ad",
    "shreddit-ad-search-results",
    "shreddit-post[promoted]",
    'shreddit-post[promoted="true"]',
    "shreddit-post[is-promoted]",
    'shreddit-post[is-promoted="true"]',
    "article[promoted]",
    'article[aria-label="Advertisement"]',
    '[slot="promoted"]',
    '[data-testid="ad-post"]',
    '[data-before-content="promoted"]',
    'faceplate-tracker[noun="ad"]',
    'faceplate-tracker[noun="promoted"]',
    'shreddit-async-loader[bundlename*="ads_"]',
    'shreddit-async-loader[bundlename*="Ads"]',
    'shreddit-async-loader[bundlename*="sidebar_ad"]',
    ".promotedlink",
    ".thing.promoted",
    ".native-ad-container",
    ".premium-banner-outer",
    ".premium-banner",
  ];

  const AD_BADGE_TEXT = new Set(["promoted", "advertisement", "sponsored"]);

  const NSFW_BUTTON_PHRASES = new Set([
    "view nsfw content",
    "view nsfw",
    "see nsfw content",
    "see nsfw",
    "click to see nsfw",
    "click to view nsfw",
    "show nsfw",
    "show nsfw content",
    "i am 18 or older",
    "yes, i'm over 18",
    "yes i'm over 18",
    "i'm over 18",
    "i am over 18",
  ]);

  const LS_KEY = "__rnp_enabled";
  const LS_ADS = "__rnp_ads";
  const LS_NSFW = "__rnp_nsfw";
  const ext = typeof browser !== "undefined" ? browser : chrome;

  let enabled = true;
  let blockAds = true;
  let showNsfw = true;
  let observer = null;
  let sweepTimer = 0;
  let periodicTimer = 0;

  try {
    if (localStorage.getItem(LS_KEY) === "0") {
      enabled = false;
      document.documentElement.classList.add("rnp-off");
    }
    if (localStorage.getItem(LS_ADS) === "0") {
      blockAds = false;
      document.documentElement.classList.add("rnp-ads-off");
    }
    if (localStorage.getItem(LS_NSFW) === "0") {
      showNsfw = false;
      document.documentElement.classList.add("rnp-nsfw-off");
    }
  } catch {
    /* storage may be blocked */
  }

  function isAuthPage() {
    const path = location.pathname.toLowerCase();
    return AUTH_PATHS.some((item) => path === item || path.startsWith(`${item}/`));
  }

  function storageGet(defaults) {
    return new Promise((resolve) => {
      try {
        if (typeof browser !== "undefined" && browser.storage) {
          browser.storage.local.get(defaults).then(resolve, () => resolve(defaults));
          return;
        }
        ext.storage.local.get(defaults, (result) => resolve(result || defaults));
      } catch {
        resolve(defaults);
      }
    });
  }

  function setOver18Cookie() {
    if (!showNsfw) return;
    try {
      document.cookie =
        "over18=1; path=/; domain=.reddit.com; max-age=31536000; SameSite=Lax";
      document.cookie = "over18=1; path=/; max-age=31536000; SameSite=Lax";
    } catch {
      /* ignore */
    }
  }

  if (showNsfw) setOver18Cookie();

  function openNsfwHost(el) {
    if (!el) return;
    const reason = `${el.reason || ""}`.toLowerCase();
    if (reason === "spoiler") return;
    try {
      el.isNsfwAllowed = true;
      el.blurred = false;
      el.isBlurred = false;
      if ("_blur" in el) el._blur = false;
    } catch {
      /* ignore */
    }
    el.removeAttribute("is-nsfw-blocked");
    el.removeAttribute("blurred");
  }

  function projectXpromoMedia(el) {
    const root = el.shadowRoot;
    if (!root) return;
    if (!root.querySelector("slot[data-rnp]")) {
      const slot = document.createElement("slot");
      slot.dataset.rnp = "1";
      root.append(slot);
    }
    const prompt = root.querySelector(".prompt");
    if (prompt) prompt.style.setProperty("display", "none", "important");
  }

  function wrapProto(name, method, before) {
    customElements.whenDefined(name).then((ctor) => {
      const proto = ctor.prototype;
      if (!proto[method] || proto[method]._rnp) return;
      const original = proto[method];
      const wrapped = function wrappedMethod(...args) {
        if (showNsfw) before(this);
        return original.apply(this, args);
      };
      wrapped._rnp = true;
      proto[method] = wrapped;
    }).catch(() => {});
  }

  function hookNsfwComponents() {
    if (!window.customElements) return;
    wrapProto("shreddit-blurred-container", "render", openNsfwHost);
    wrapProto("shreddit-blurred-container", "update", openNsfwHost);
    wrapProto("community-highlight-card", "render", openNsfwHost);
    wrapProto("devvit2-blur-gate", "update", openNsfwHost);
    wrapProto("xpromo-nsfw-blocking-container", "update", projectXpromoMedia);
    wrapProto("shreddit-aspect-ratio", "connectedCallback", (el) => {
      el.removeAttribute("is-nsfw-blocked");
    });
    wrapProto("shreddit-embed", "update", (el) => {
      try {
        if (!el.mounted && typeof el.setupEmbed === "function") el.setupEmbed();
      } catch {
        /* ignore */
      }
    });
    wrapProto("shreddit-player", "connectedCallback", (el) => {
      try {
        el.isNsfwAllowed = true;
      } catch {
        /* ignore */
      }
    });
    wrapProto("shreddit-player-2", "connectedCallback", (el) => {
      try {
        el.isNsfwAllowed = true;
      } catch {
        /* ignore */
      }
    });

    if (!customElements.define._rnp) {
      const define = customElements.define.bind(customElements);
      customElements.define = function patchedDefine(name, Ctor, opts) {
        if (showNsfw && name === "shreddit-aspect-ratio") {
          class PatchedAspect extends Ctor {
            connectedCallback() {
              this.removeAttribute("is-nsfw-blocked");
              super.connectedCallback?.();
            }
            attributeChangedCallback(attr, oldVal, newVal) {
              if (attr === "is-nsfw-blocked") return;
              super.attributeChangedCallback?.(attr, oldVal, newVal);
            }
          }
          return define(name, PatchedAspect, opts);
        }
        if (showNsfw && (name === "shreddit-player" || name === "shreddit-player-2")) {
          class PatchedPlayer extends Ctor {
            connectedCallback() {
              try {
                this.isNsfwAllowed = true;
              } catch {
                /* ignore */
              }
              super.connectedCallback?.();
            }
          }
          return define(name, PatchedPlayer, opts);
        }
        return define(name, Ctor, opts);
      };
      customElements.define._rnp = true;
    }
  }

  hookNsfwComponents();

  function unlockScroll() {
    const roots = [document.documentElement, document.body].filter(Boolean);
    for (const node of roots) {
      for (const name of SCROLL_LOCK_CLASSES) {
        if (node.classList.contains(name)) node.classList.remove(name);
      }
      if (node.style.overflow === "hidden") node.style.overflow = "auto";
      if (node.style.pointerEvents === "none") node.style.pointerEvents = "";
      if (node.getAttribute("style")?.includes("overflow: hidden")) {
        node.style.setProperty("overflow", "auto", "important");
      }
    }
  }

  function unblur() {
    const targets = document.querySelectorAll(".sidebar-grid, shreddit-app, #main-content, main");
    for (const node of targets) {
      if (node.style.filter && node.style.filter.includes("blur")) {
        node.style.filter = "none";
      }
    }
  }

  function removeNode(node) {
    if (!node || !node.remove) return;
    try {
      node.remove();
    } catch {
      node.style.setProperty("display", "none", "important");
    }
  }

  function containsMainApp(node) {
    if (!node || !node.querySelector) return false;
    return Boolean(
      node.querySelector(
        "shreddit-app, shreddit-feed, #AppRouter-main, #main-content, reddit-feed"
      )
    );
  }

  function hideLoggedOutSidebar() {
    const candidates = document.querySelectorAll(
      "#left-sidebar-container, [id='left-sidebar-container'], aside, [data-testid='left-sidebar']"
    );
    for (const node of candidates) {
      const rect = node.getBoundingClientRect();
      if (rect.width < 80 || rect.left > window.innerWidth * 0.45) continue;
      const text = (node.innerText || node.textContent || "").toLowerCase();
      if (!text) continue;
      const matches = SIDEBAR_PHRASES.filter((phrase) => text.includes(phrase));
      if (matches.length >= 2) {
        node.style.setProperty("display", "none", "important");
      }
    }
  }

  function hideJoinCopyCards() {
    const nodes = document.querySelectorAll("h1, h2, h3, p, span");
    for (const node of nodes) {
      const text = (node.textContent || "").trim().toLowerCase();
      if (text !== "join the most real place on the internet") continue;
      let parent = node.parentElement;
      for (let depth = 0; parent && depth < 10; depth += 1) {
        if (containsMainApp(parent)) break;
        const rect = parent.getBoundingClientRect();
        const cardSized =
          rect.width >= 220 &&
          rect.width <= 900 &&
          rect.height >= 220 &&
          rect.height <= window.innerHeight * 0.95;
        if (cardSized) {
          const host = closestWallHost(parent) || parent;
          if (!containsMainApp(host)) removeNode(host);
          break;
        }
        parent = parent.parentElement;
      }
    }
  }

  function sweepShadowHosts() {
    const hosts = document.querySelectorAll("faceplate-modal");
    for (const host of hosts) {
      const root = host.shadowRoot;
      if (!root) continue;
      const prompt = root.querySelector("[role='dialog'], #blocking-modal");
      if (prompt) prompt.style.setProperty("display", "none", "important");
    }
    if (!showNsfw) return;
    document.querySelectorAll("xpromo-nsfw-blocking-container").forEach(projectXpromoMedia);
  }

  function closestWallHost(el) {
    if (!el || !el.closest) return el;
    return (
      el.closest(
        [
          "#desktop-dynamic-upsell-dialog",
          "#blocking-modal",
          "faceplate-modal",
          "rpl-modal-card",
          "[role='dialog']",
          "[aria-modal='true']",
          "dialog",
        ].join(",")
      ) || el
    );
  }

  function isBlockingOverlay(el) {
    if (!(el instanceof Element)) return false;
    if (containsMainApp(el)) return false;
    const style = window.getComputedStyle(el);
    const position = style.position;
    if (position !== "fixed" && position !== "absolute") return false;
    const rect = el.getBoundingClientRect();
    const wide = rect.width >= window.innerWidth * 0.28;
    const tall = rect.height >= window.innerHeight * 0.28;
    return wide && tall;
  }

  function sweepBySelector() {
    for (const selector of SELECTORS) {
      let nodes;
      try {
        nodes = document.querySelectorAll(selector);
      } catch {
        continue;
      }
      for (const node of nodes) {
        if (!containsMainApp(node)) removeNode(node);
      }
    }
  }

  function sweepByCopy() {
    const hosts = document.querySelectorAll(
      [
        "[role='dialog']",
        "[aria-modal='true']",
        "faceplate-modal",
        "rpl-modal-card",
        "dialog",
        "#desktop-dynamic-upsell-dialog",
        "div[style*='position: fixed']",
        "div[style*='position:fixed']",
      ].join(",")
    );

    for (const host of hosts) {
      if (containsMainApp(host)) continue;
      const text = (host.innerText || host.textContent || "").toLowerCase();
      if (!text) continue;
      const hit = WALL_PHRASES.some((phrase) => text.includes(phrase));
      if (hit) removeNode(closestWallHost(host));
    }
  }

  function sweepDimOverlays() {
    const roots = [document.body, ...document.querySelectorAll("shreddit-app, faceplate-app")];
    const nodes = [];
    for (const root of roots) {
      if (!root) continue;
      nodes.push(...root.children);
    }
    for (const el of nodes) {
      if (!(el instanceof HTMLElement)) continue;
      if (containsMainApp(el)) continue;
      const style = el.getAttribute("style") || "";
      const computed = window.getComputedStyle(el);
      const looksFixed =
        computed.position === "fixed" ||
        style.includes("position: fixed") ||
        style.includes("position:fixed") ||
        style.includes("inset: 0") ||
        style.includes("inset:0");
      if (!looksFixed) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < window.innerWidth * 0.9 || rect.height < window.innerHeight * 0.9) {
        continue;
      }
      const text = (el.innerText || "").toLowerCase();
      const isWall = WALL_PHRASES.some((phrase) => text.includes(phrase));
      const emptyDimmer =
        el.childElementCount === 0 ||
        (computed.backdropFilter && computed.backdropFilter !== "none") ||
        (computed.webkitBackdropFilter && computed.webkitBackdropFilter !== "none");
      if (isWall || (emptyDimmer && !text.trim())) {
        removeNode(el);
      }
    }
  }

  function sweepTextModals() {
    const walkerTargets = document.querySelectorAll(
      "h1, h2, h3, p, span, button, faceplate-tracker"
    );
    for (const node of walkerTargets) {
      const text = (node.textContent || "").trim().toLowerCase();
      if (!text || text.length > 80) continue;
      if (!WALL_PHRASES.includes(text) && !WALL_PHRASES.some((p) => text === p)) {
        continue;
      }
      const host = closestWallHost(node);
      if (host && isBlockingOverlay(host) && !containsMainApp(host)) {
        removeNode(host);
      }
    }
  }

  function hideAd(node) {
    if (!node || node.classList.contains("rnp-hidden-ad")) return;
    node.classList.add("rnp-hidden-ad");
  }

  function hasPromotedBadge(root) {
    const nodes = root.querySelectorAll(
      "span, a, faceplate-tracker, shreddit-post-flair, [slot='credit-bar']"
    );
    for (const node of nodes) {
      if (node.closest("[slot='title'], h1, h2, [id*='post-title']")) continue;
      const text = (node.textContent || "").trim().toLowerCase();
      if (!text || text.length > 24) continue;
      if (AD_BADGE_TEXT.has(text) || text.startsWith("promoted by")) return true;
    }
    return false;
  }

  function sweepAds() {
    if (!blockAds || !document.body) return;

    for (const selector of AD_SELECTORS) {
      let nodes;
      try {
        nodes = document.querySelectorAll(selector);
      } catch {
        continue;
      }
      for (const node of nodes) hideAd(node);
    }

    const posts = document.querySelectorAll(
      "shreddit-post, article, [data-testid='post-container'], .thing"
    );
    for (const post of posts) {
      if (post.classList.contains("rnp-hidden-ad")) continue;
      const promotedAttr =
        post.hasAttribute("promoted") ||
        post.getAttribute("is-promoted") === "true" ||
        (post.getAttribute("aria-label") || "").toLowerCase() === "advertisement";
      if (promotedAttr || hasPromotedBadge(post)) hideAd(post);
    }
  }

  function playerLooksBroken(player) {
    const root = player.shadowRoot;
    const hay = `${player.textContent || ""} ${root ? root.textContent || "" : ""}`.toLowerCase();
    if (
      hay.includes("cannot be played") ||
      hay.includes("couldn't play") ||
      hay.includes("could not play") ||
      hay.includes("unable to play") ||
      hay.includes("video unavailable") ||
      hay.includes("playback error")
    ) {
      return true;
    }
    const video = (root && root.querySelector("video")) || player.querySelector("video");
    return Boolean(video && video.error);
  }

  function remountPlayer(player) {
    if (player.dataset.rnpRevived === "1") return;
    player.dataset.rnpRevived = "1";
    const clone = player.cloneNode(true);
    clone.dataset.rnpRevived = "1";
    for (const name of ["src", "packaged-media-json", "dash-src", "hls-src", "poster", "preview"]) {
      const value = player.getAttribute(name);
      if (value) clone.setAttribute(name, value);
    }
    try {
      if (player.packagedMediaJson && !clone.getAttribute("packaged-media-json")) {
        const packed =
          typeof player.packagedMediaJson === "string"
            ? player.packagedMediaJson
            : JSON.stringify(player.packagedMediaJson);
        clone.setAttribute("packaged-media-json", packed);
      }
    } catch {
      /* ignore */
    }
    player.replaceWith(clone);
  }

  function hydrateDeferredEmbeds() {
    document.querySelectorAll("shreddit-embed").forEach((el) => {
      try {
        if (!el.mounted && typeof el.setupEmbed === "function") el.setupEmbed();
      } catch {
        /* ignore */
      }
      if (!el.hasAttribute("data-embed-obscured-deferred") || !el.html) return;
      if (el.dataset.rnpRevived === "1") return;
      el.dataset.rnpRevived = "1";
      try {
        const fragment = document.createRange().createContextualFragment(el.html);
        el.replaceWith(fragment);
      } catch {
        /* ignore */
      }
    });
  }

  function reviveNsfwMedia() {
    if (!showNsfw || !document.body) return;
    hydrateDeferredEmbeds();
    document
      .querySelectorAll("shreddit-player, shreddit-player-2")
      .forEach((player) => {
        try {
          player.isNsfwAllowed = true;
        } catch {
          /* ignore */
        }
        if (playerLooksBroken(player)) remountPlayer(player);
      });
  }

  function clickNsfwButtons() {
    const nodes = document.querySelectorAll("button, a, [role='button']");
    for (const node of nodes) {
      if (node.dataset.rnpNsfwClicked) continue;
      const label = `${node.getAttribute("aria-label") || ""} ${node.textContent || ""}`
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      if (!label || label.length > 40) continue;
      if (!NSFW_BUTTON_PHRASES.has(label)) continue;
      node.dataset.rnpNsfwClicked = "1";
      try {
        node.click();
      } catch {
        /* ignore */
      }
    }
  }

  function revealNsfw() {
    if (!showNsfw || !document.body) return;
    setOver18Cookie();

    document.querySelectorAll("shreddit-aspect-ratio[is-nsfw-blocked]").forEach((el) => {
      el.removeAttribute("is-nsfw-blocked");
    });
    document.querySelectorAll("shreddit-blurred-container").forEach(openNsfwHost);
    document.querySelectorAll("community-highlight-card").forEach((el) => {
      openNsfwHost(el);
      const root = el.shadowRoot;
      if (root && !root.querySelector("#rnp-nsfw")) {
        const style = document.createElement("style");
        style.id = "rnp-nsfw";
        style.textContent = "* { filter: none !important; -webkit-filter: none !important; }";
        root.prepend(style);
      }
    });
    document.querySelectorAll("devvit2-blur-gate").forEach(openNsfwHost);
    document.querySelectorAll("xpromo-nsfw-blocking-container").forEach(projectXpromoMedia);
    document.querySelectorAll("rpl-dialog[dialog-id*='nsfw_blocking']").forEach(removeNode);
    document.querySelectorAll(".thumbnail-blur").forEach((el) => {
      el.classList.remove("thumbnail-blur");
      el.style.filter = "none";
    });

    clickNsfwButtons();
    reviveNsfwMedia();
  }

  function setNsfwEnabled(next) {
    const was = showNsfw;
    showNsfw = next;
    try {
      localStorage.setItem(LS_NSFW, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (next) {
      document.documentElement.classList.remove("rnp-nsfw-off");
      hookNsfwComponents();
      revealNsfw();
    } else {
      document.documentElement.classList.add("rnp-nsfw-off");
      if (was) location.reload();
    }
  }

  function setAdsEnabled(next) {
    blockAds = next;
    try {
      localStorage.setItem(LS_ADS, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (next) {
      document.documentElement.classList.remove("rnp-ads-off");
      sweepAds();
    } else {
      document.documentElement.classList.add("rnp-ads-off");
    }
  }

  function sweep() {
    if (!document.body) return;
    if (blockAds) sweepAds();
    if (showNsfw) revealNsfw();
    if (!enabled || isAuthPage()) return;
    sweepBySelector();
    sweepByCopy();
    sweepTextModals();
    hideJoinCopyCards();
    sweepShadowHosts();
    hideLoggedOutSidebar();
    sweepDimOverlays();
    unlockScroll();
    unblur();
    setOver18Cookie();
  }

  function scheduleSweep() {
    if (sweepTimer) return;
    sweepTimer = window.setTimeout(() => {
      sweepTimer = 0;
      sweep();
    }, 40);
  }

  function startObserver() {
    if (observer || !document.documentElement) return;
    observer = new MutationObserver((mutations) => {
      if (!enabled && !blockAds && !showNsfw) return;
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          scheduleSweep();
          return;
        }
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "class" || mutation.attributeName === "style")
        ) {
          scheduleSweep();
          return;
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "open", "is-nsfw-blocked", "blurred", "nsfw"],
    });
  }

  function stop() {
    enabled = false;
    document.documentElement.classList.add("rnp-off");
    try {
      localStorage.setItem(LS_KEY, "0");
    } catch {
      /* ignore */
    }
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (periodicTimer) {
      window.clearInterval(periodicTimer);
      periodicTimer = 0;
    }
  }

  function start() {
    enabled = true;
    document.documentElement.classList.remove("rnp-off");
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch {
      /* ignore */
    }
    sweep();
    startObserver();
    if (!periodicTimer) {
      let ticks = 0;
      periodicTimer = window.setInterval(() => {
        sweep();
        ticks += 1;
        if (ticks > 20 && periodicTimer) {
          window.clearInterval(periodicTimer);
          periodicTimer = window.setInterval(sweep, 2000);
        }
      }, 400);
    }
  }

  storageGet({ enabled: true, blockAds: true, showNsfw: true }).then((result) => {
    const next = result.enabled !== false;
    const ads = result.blockAds !== false;
    const nsfw = result.showNsfw !== false;
    try {
      localStorage.setItem(LS_KEY, next ? "1" : "0");
      localStorage.setItem(LS_ADS, ads ? "1" : "0");
      localStorage.setItem(LS_NSFW, nsfw ? "1" : "0");
    } catch {
      /* ignore */
    }
    setAdsEnabled(ads);
    showNsfw = nsfw;
    if (nsfw) {
      document.documentElement.classList.remove("rnp-nsfw-off");
      hookNsfwComponents();
    } else {
      document.documentElement.classList.add("rnp-nsfw-off");
    }
    if (next) start();
    else {
      stop();
      if (ads || nsfw) {
        startObserver();
        if (ads) sweepAds();
        if (nsfw) revealNsfw();
      }
    }
  });

  try {
    ext.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      if (changes.blockAds) {
        setAdsEnabled(changes.blockAds.newValue !== false);
      }
      if (changes.showNsfw) {
        setNsfwEnabled(changes.showNsfw.newValue !== false);
      }
      if (!changes.enabled) return;
      if (changes.enabled.newValue === false) {
        stop();
        location.reload();
        return;
      }
      start();
    });
  } catch {
    /* ignore */
  }
})();
