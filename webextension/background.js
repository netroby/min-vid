/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the 'License'). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

const _ = require('sdk/l10n').get;
const store = require('sdk/simple-storage').storage;

// set our unique identifier for metrics
// (needs to be set before send-metrics-data is loaded)
if (!store.clientUUID) {
  store.clientUUID = require('./lib/get-random-id')();
}

if (!store.queue) store.queue = [];
if (!store.history) store.history = [];


const youtubeHelpers = require('./lib/youtube-helpers');
const getVimeoUrl = require('./lib/get-vimeo-url');
const getSoundcloudUrl = require('./lib/get-soundcloud-url');
const launchVideo = require('./lib/launch-video');
const sendMetricsData = require('./lib/send-metrics-data');
const contextMenuHandlers = require('./lib/context-menu-handlers');
const windowUtils = require('./lib/window-utils');

const prefs = require('sdk/simple-prefs').prefs;

exports.main = function() {
  contextMenuHandlers.init(windowUtils.getWindow());
};

browser.runtime.onMessage.addListener(onMessage);

function onMessage(opts) {
  const title = opts.title;
  delete opts.title;
  console.log('onMessage: ', opts);

  if (title === 'launch') {
    if (opts.domain.indexOf('youtube.com') > -1) {
      opts.getUrlFn = youtubeHelpers.getVideo;
    } else if (opts.domain.indexOf('vimeo.com') > -1) {
      opts.getUrlFn = getVimeoUrl;
    } else if (opts.domain.indexOf('soundcloud.com') > -1) {
      opts.getUrlFn = getSoundcloudUrl;
    }

    sendMetricsData({
      object: 'overlay_icon',
      method: 'launch',
      domain: opts.domain
    });

    launchVideo(opts);
  } else if (title === 'metric') sendMetricsData(opts);
}

exports.onUnload = function() {
  windowUtils.destroy(true);
  contextMenuHandlers.destroy();
  launchIconsMod.destroy();
};
