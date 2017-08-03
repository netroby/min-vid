// Just keep using the SDK simple-prefs pref namespace
const PREF_BRANCH = "extensions.@minvid.";
const WIDTH_PREF = "width";
const HEIGHT_PREF = "height";

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "AddonManager",
                                  "resource://gre/modules/AddonManager.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Console",
                                  "resource://gre/modules/Console.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Services",
                                  "resource://gre/modules/Services.jsm");


// XPCOMUtils.defineLazyModuleGetter(this, "WindowUtils",
Cu.import("chrome://minvid-lib/content/window-utils.js");

// TODO: not sure we need this, see shutdown method
// XPCOMUtils.defineLazyModuleGetter(this, "LegacyExtensionsUtils",
//                                  "resource://gre/modules/LegacyExtensionsUtils.jsm");

const prefs = Services.prefs;
const prefObserver = {
  register() {
    prefs.addObserver(PREF_BRANCH, this, false); // eslint-disable-line mozilla/no-useless-parameters
  },

  unregister() {
    prefs.removeObserver(PREF_BRANCH, this, false); // eslint-disable-line mozilla/no-useless-parameters
  },

  observe(aSubject, aTopic, aData) {
    // aSubject is the nsIPrefBranch we're observing (after appropriate QI)
    // aData is the name of the pref that's been changed (relative to aSubject)
    if (aData == WIDTH_PREF || aData == HEIGHT_PREF) {
      onPrefChange();
    }
  }
};

function onPrefChange() {
  // TODO
}

function startup(data, reason) {
  console.log('min-vid loading!!!!', data, reason);

  // If the webext is already running, bail
  if (data.webExtension.started) return;
  // Note: data.url gives the moz-extension://[uuid]/ URL of the
  // webextension
  data.webExtension.startup(reason).then(api => {
    // Set up two-way messaging. webext must init connection.
    console.log('load web ext', reason, api, data.webExtension.url);
    api.browser.runtime.onConnect.addListener(port => {
      console.log('bootstraped:', port, WindowUtils);
      WindowUtils.create(port);
    });
  });
}

function onMessage(msg, sender, sendReply) {
  // TODO
}

function shutdown(data, reason) {
  prefObserver.unregister();
  // TODO: is webExtension in data? if not, we have to do:
  // const webExtension = LegacyExtensionsUtils.getEmbeddedExtensionFor({
  //   id: ADDON_ID,
  //   resourceURI: resourceURI
  // });
  // where resourceURI is in the data object passed to startup().
  data.webExtension.shutdown(reason);
}

// These are mandatory in bootstrap.js, even if unused
function install(data, reason) {} // eslint-disable-line no-unused-vars
function uninstall(data, reason) {}// eslint-disable-line no-unused-vars

