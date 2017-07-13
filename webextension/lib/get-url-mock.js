// const path = require('sdk/fs/path');

import isAudioFile from './is-audio-file';

const path = {
  basename: (url) => url
};

// TODO: replace path utility
export default function(opts, cb) {
  const mediaType = isAudioFile(opts.url) ? 'audio' : 'video';
  cb({
    url: opts.url,
    preview: `../data/img/${mediaType}-thumbnail.svg`,
    title: decodeURIComponent(path.basename(opts.url))
  });
}
