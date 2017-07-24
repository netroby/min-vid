/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the 'License'). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

// set our unique identifier for metrics
// (needs to be set before send-metrics-data is loaded)

import getRandomId from './lib/get-random-id';
const store = browser.storage.local;

function initStorage() {
  store.get().then(r => {
    if (!r.clientUUID) store.set({clientUUID: getRandomId()});
    if (!r.width) store.set({width: browser.runtime.getManifest().config['DEFAULT_WIDTH']});
    if (!r.height) store.set({height: browser.runtime.getManifest().config['DEFAULT_HEIGHT']});
    if (!r.queue) store.set({queue: []});
    if (!r.history) store.set({history: []});
  });
}

initStorage();

import launchVideo from './lib/launch-video';
import getVimeoUrl from './lib/get-vimeo-url';
import youtubeHelpers from './lib/youtube-helpers';
import sendMetricsData from './lib/send-metrics-data';
import getSoundcloudUrl from './lib/get-soundcloud-url';
import {dimensionsUpdate} from './lib/window-messages';

// import contextMenuHandlers from './lib/context-menu-handlers';
// contextMenuHandlers.init();
import handleMessage from './lib/message-handler';

const port = browser.runtime.connect({name: 'connection-to-legacy'});

port.onMessage.addListener((msg) => {
  if (msg.content === 'msg-from-frontend') handleMessage(msg.data, port);
  if (msg.content === 'position-changed') {
    browser.storage.local.set({
      top: msg.data.top,
      left: msg.data.left
    });
  }
});

browser.storage.onChanged.addListener(onStorageChanged);

function onStorageChanged(changes) {
  if (changes.width) dimensionsUpdate({width: changes.width.newValue});
  if (changes.height) dimensionsUpdate({height: changes.height.newValue});
}

browser.runtime.onMessage.addListener(onIconOverlayMessage);

function onIconOverlayMessage(opts) {
  const title = opts.title;
  delete opts.title;

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
