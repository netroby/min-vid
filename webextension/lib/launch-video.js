import { parse } from './querystring';
import getVideoId from 'get-video-id';
import isAudioFile from './is-audio';
import windowMessages from './window-messages';
import youtubeHelpers from './youtube-helpers';
import sendMetricsData from './send-metrics-data';
// import getLocaleStrings from './get-locale-strings';

import uuid from 'uuid/v1';

const storage = browser.storage.local;

function isAudio(url) {
  return (isAudioFile(url) || new RegExp('^(https?:)?//soundcloud.com\/').exec(url));
}

const fauxLocales = {
  errorMsg: 'my locale message',
  errorLink: 'my  locale message',
  errorYTNotFound: 'my  locale message',
  errorYTNotAllowed: 'my  locale message',
  errorScLimit: 'my  locale message',
  errorScConnection: 'my  locale message',
  errorScTrack: 'my  locale message',
  errorScStreamable: 'my  locale message',
  errorScRestricted: 'my  locale message',
  errorVimeoConnection: 'my  locale message',
  itemAddedNotification: 'my  locale message',
  endOfQueue: 'my  locale message',
  loadingMsg: 'my  locale message',
  confirmMsg: 'my  locale message',
  addConfirmMsg: 'my  locale message',
  playConfirmMsg: 'my  locale message',
  clear: 'my  locale message',
  history: 'my  locale message',
  playQueue: 'my  locale message',
  ttMute: 'my  locale message',
  ttPlay: 'my  locale message',
  ttPause: 'my  locale message',
  ttClose: 'my  locale message',
  ttUnmute: 'my  locale message',
  ttNext: 'my  locale message',
  ttPrev: 'my  locale message',
  ttMinimize: 'my  locale message',
  ttMaximize: 'my  locale message',
  ttSendToTab: 'my  locale message',
  ttSwitchVis: 'my  locale message',
  ttOpenQueue: 'my  locale message',
  ttCloseQueue: 'my  locale message'
};

// Pass in a video URL as opts.src or pass in a video URL lookup function as opts.getUrlFn
export default function launchVideo(opts) {
  const getUrlFn = opts.getUrlFn;
  const action = opts.action;

  delete opts.getUrlFn;
  delete opts.action;

  if (action === 'play') opts.playing = true;

  console.log('launch locales', opts.domain, isAudio(opts.url));

  windowMessages.send(opts = Object.assign({
    id: uuid(),
    width: storage.width,
    height: storage.height,
    videoId: getVideoId(opts.url) ? getVideoId(opts.url).id : '',
    strings: fauxLocales, // getLocaleStrings(opts.domain, isAudio(opts.url)),
    // tabId: browser.tabs.TAB.id,
    launchUrl: opts.url,
    currentTime: 0,
    confirm: false,
    confirmContent: '{}'
  }, opts));

  // YouTube playlist handling
  if (opts.domain === 'youtube.com' && !!~opts.url.indexOf('list')) {
    if (!!~opts.url.indexOf('watch?v')) {
      const parsed = parse(opts.url.substr(opts.url.indexOf('?') + 1));
      youtubeHelpers.getPlaylistMeta({
        videoId: parsed.v,
        playlistId: parsed.list,
      }, (meta) => {
        opts.confirmContent = meta;
        opts.confirmContent.action = action;
        opts.confirmContent = JSON.stringify(opts.confirmContent);
        sendMetricsData({
          object: 'confirm_view',
          method: `launch:video:${action}`,
          domain: opts.domain
        });
        // TODO: figure out isMINIMIZED
        // if (windowUtils.isMinimized()) windowUtils.maximize();
        windowMessages.send(Object.assign(opts, {
          confirm: true,
          error: false,
          minimized: false,
          queue: JSON.stringify(storage.queue),
          history: JSON.stringify(storage.history)
        }));
      });
    } else {
      // only playlist handling
      const parsed = parse(opts.url.substr(opts.url.indexOf('?') + 1));
      youtubeHelpers.getPlaylist({playlistId: parsed.list}, playlist => {
        if (action === 'play') {
          storage.queue = playlist.concat(storage.queue);
        } else storage.queue = storage.queue.concat(playlist);

        const response = {
          trackAdded: (action === 'add-to-queue') && (storage.queue.length > 1),
          error: false,
          queue: JSON.stringify(storage.queue),
          history: JSON.stringify(storage.history)
        };

        sendMetricsData({
          object: 'confirm_view ',
          method: `launch:playlist:${action}`,
          domain: opts.domain
        });

        if (action === 'play') response.playing = true;
        windowMessages.send(response);
      });
    }
  } else {
    // fetch the media source and set it
    getUrlFn(opts, function(item) {
      if (item.error) console.error('LaunchVideo failed to get the streamUrl: ', item.error); // eslint-disable-line no-console

      if (isAudio(item.url)) item.player = 'audio';

      if (action === 'play') storage.queue.unshift(item);
      else storage.queue.push(item);

      const videoOptions = {
        trackAdded: (action === 'add-to-queue') && (storage.queue.length > 1),
        error: item.error ? item.error : false,
        queue: JSON.stringify(storage.queue),
        history: JSON.stringify(storage.history)
      };

      if (action === 'play') videoOptions.playing = true;
      console.log('did it make it here????', videoOptions);
      windowMessages.send(videoOptions);
    });
  }
}
