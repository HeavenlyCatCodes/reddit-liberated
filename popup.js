const ext = typeof browser !== "undefined" ? browser : chrome;

const toggle = document.getElementById("toggle");
const adsToggle = document.getElementById("adsToggle");
const nsfwToggle = document.getElementById("nsfwToggle");
const stamp = document.getElementById("statusCard");
const stampLabel = document.getElementById("stampLabel");
const stampCopy = document.getElementById("stampCopy");
const toggleText = document.getElementById("toggleText");

function storageGet(defaults) {
  return new Promise((resolve) => {
    if (typeof browser !== "undefined" && browser.storage) {
      browser.storage.local.get(defaults).then(resolve, () => resolve(defaults));
      return;
    }
    ext.storage.local.get(defaults, (result) => resolve(result || defaults));
  });
}

function storageSet(value) {
  return new Promise((resolve) => {
    if (typeof browser !== "undefined" && browser.storage) {
      browser.storage.local.set(value).then(resolve, resolve);
      return;
    }
    ext.storage.local.set(value, resolve);
  });
}

function render(enabled, adsOn, nsfwOn) {
  toggle.checked = enabled;
  adsToggle.checked = adsOn;
  nsfwToggle.checked = nsfwOn;
  stamp.classList.toggle("is-off", !enabled);
  stampLabel.textContent = enabled ? "Walls down" : "Walls allowed";
  stampCopy.textContent = enabled
    ? "Signup modals, Google One Tap, and scroll locks are stripped while you browse."
    : "Reddit can show login walls again. Turn this back on to keep browsing.";
  toggleText.textContent = enabled ? "On" : "Off";
}

storageGet({ enabled: true, blockAds: true, showNsfw: true }).then((result) => {
  render(result.enabled !== false, result.blockAds !== false, result.showNsfw !== false);
});

toggle.addEventListener("change", async () => {
  const enabled = toggle.checked;
  render(enabled, adsToggle.checked, nsfwToggle.checked);
  await storageSet({ enabled });
});

adsToggle.addEventListener("change", async () => {
  const blockAds = adsToggle.checked;
  render(toggle.checked, blockAds, nsfwToggle.checked);
  await storageSet({ blockAds });
});

nsfwToggle.addEventListener("change", async () => {
  const showNsfw = nsfwToggle.checked;
  render(toggle.checked, adsToggle.checked, showNsfw);
  await storageSet({ showNsfw });
});
