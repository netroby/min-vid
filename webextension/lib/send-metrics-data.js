const Metrics = require('testpilot-metrics');
const storage = browser.storage.local;
const manifest = require('../package.json');

const encoded = this._formEncode(msg);
const GA_URL = 'https://ssl.google-analytics.com/collect';

if ('sendBeacon' in navigator) {
  navigator.sendBeacon(url, formEncodedData);
} else {
  const config = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    },
    body: formEncodedData
  };
  fetch(url, config)
    .then((resp) => console.log(`Sent GA message via fetch: ${formEncodedData}`))
    .catch((err) => console.error(`GA sending via fetch failed: ${err}`));
}

const { sendEvent } = new Metrics({
  id: require('sdk/self').id,
  type: 'sdk',
  version: manifest.version,
  uid: storage.clientUUID,
  tid: manifest.config['GA_TRACKING_ID']
});

module.exports = sendMetricsData;

function sendMetricsData(o, win) {
  // Note: window ref is optional, used to avoid circular refs with window-utils.js.
  win = win || require('./window-utils.js').getWindow();

  if (!win || win.incognito) return;

  const coords = win.document.documentElement.getBoundingClientRect();

  // NOTE: this packet follows a predefined data format and cannot be changed
  //       without notifying the data team. See docs/metrics.md for more.
  sendEvent({
    object: o.object,
    method: o.method,
    domain: o.domain,
    video_x: coords.left,
    video_y: coords.top,
    video_width: coords.width,
    video_height: coords.height
  }, function transform(input, output) {
    output.cd2 = input['video_x'];
    output.cd3 = input['video_y'];
    output.cd4 = input['video_width'];
    output.cd5 = input['video_height'];
    output.cd6 = input.domain;
    return output;
  });
}
