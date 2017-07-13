const clientId = browser.runtime.getManifest().config['SOUNDCLOUD_CLIENT_ID'];

export default function getSoundcloudUrl(opts, cb) {
  console.log('optssss sc:', opts, cb);
  const url = `https://api.soundcloud.com/resolve.json?client_id=${clientId}&url=${opts.url}`;

  fetch(url, { method: 'GET',
               mode: 'cors',
               cache: 'default' })
    .then((res) => {
      let item = {
        url: opts.url,
        title: '',
        preview: '',
        duration: 0,
        launchUrl: opts.url,
        domain: 'soundcloud.com',
        error: false
      };

      res.json().then(function(json) {
        if (res.status === 429) {
          item.error = 'errorScTrackLimit';
        } else if (res.status === 403) {
          item.error = 'errorScRestricted';
        } else if (!json) {
          item.error = 'errorScTrackConnection';
        } else if (json.kind !== 'track') {
          console.log(json.kind, json.streamable, json.stream_url);
          item.error = 'errorScTrack';
        } else if (!json.streamable) {
          item.error = 'errorScStreamable';
        } else {
          item = Object.assign(item, {
            url: json.stream_url + '?client_id=' + clientId,
            title: json.title,
            preview: json.artwork_url,
            duration: json.duration * .001 // convert to seconds
          });
        }

        cb(item);
      });
    })
    .catch((err) => {
      console.error(`Soundcloud request via fetch failed: ${err}`);
      item.error = 'errorMsg';
      cb(item);
    });
}
