export default function(opts, cb) {
  const url = `https://player.vimeo.com/video/${opts.videoId}/config`;
  fetch(url)
    .then((res) => {
      if (!res.json) {
        cb('errorVimeoConnection');
        return;
      }

      let item = {
        videoId: opts.videoId,
        domain: 'vimeo.com',
        error: false,
        title: '',
        preview: 'https://i.vimeocdn.com/video/error.jpg'
      };

      if (res.json.request) {
        item = Object.assign(item, {
          url: res.json.request.files.progressive[0].url,
          launchUrl: res.json.request['share_url'],
          title: res.json.video.title,
          preview: res.json.video.thumbs['960'],
          duration: res.json.video.duration
        });
      } else item.error = res.json.message;

      cb(item);
    })
    .catch((err) => {
      console.error(`Vimeo request via fetch failed: ${err}`);
      item.error = 'errorMsg';
      cb(item);
    });
}
