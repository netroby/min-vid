const storage = browser.storage.local;
const manifest = require('../package.json');

const GA_URL = 'https://ssl.google-analytics.com/collect';

export function sendMetricsData(o, win) {
  // Note: window ref is optional, used to avoid circular refs with window-utils.js.
  win = win || require('./window-utils.js').getWindow();

  if (!win || win.incognito) return;

  const coords = win.document.documentElement.getBoundingClientRect();

  // NOTE: this packet follows a predefined data format and cannot be changed
  //       without notifying the data team. See docs/metrics.md for more.
  const formEncodedData = Object.keys({
    v: 1,
    aip: 1, // anonymize user IP addresses (#24 mozilla/testpilot-metrics)
    an: browser.runtime.id,
    av: manifest.version,
    tid: manifest.config['GA_TRACKING_ID'],
    cid: storage.clientUUID,
    t: 'event',
    ec: o.category,
    ea: o.method,
    cd2: coords.left, // video_x
    cd3: coords.top, // video_y
    cd4: coords.width,
    cd5: coords.height,
    cd6: o.domain,
    el: o.object
  }).map(item => encodeURIComponent(item) + '=' + encodeURIComponent(obj[item]))
    .join('&');

  if ('sendBeacon' in navigator) {
    navigator.sendBeacon(GA_URL, formEncodedData);
  } else {
    const config = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      },
      body: formEncodedData
    };
    fetch(GA_URL, config)
      .then(() => console.log(`Sent GA message via fetch: ${formEncodedData}`))
      .catch((err) => console.error(`GA sending via fetch failed: ${err}`));
  }
}
