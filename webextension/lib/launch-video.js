// active tabs tabs
// querystring
// prefs keyShortcutsenabled

// import qs from 'sdk/querystring';
import getVideoId from 'get-video-id';
import isAudioFile from './is-audio';
import windowUtils from './window-utils';
import youtubeHelpers from './youtube-helpers';
import sendMetricsData from './send-metrics-data';
import getLocaleStrings from './get-locale-strings';

function qs() {
  console.error('need to find a good query string parsing replacement, there should be a browser api for this');
}

const storage = browser.storage.local;

function isAudio(url) {
  return (isAudioFile(url) || new RegExp('^(https?:)?//soundcloud.com\/').exec(url));
}

// Pass in a video URL as opts.src or pass in a video URL lookup function as opts.getUrlFn
export function launchVideo(opts) {
  // UpdateWindow might create a new panel, so do the remaining launch work
  // asynchronously.
  windowUtils.updateWindow();
  windowUtils.whenReady(() => {
    const getUrlFn = opts.getUrlFn;
    const action = opts.action;

    delete opts.getUrlFn;
    delete opts.action;

    if (action === 'play') opts.playing = true;

    windowUtils.show();
    // send some initial data to open the loading view
    // before we fetch the media source
    windowUtils.send('set-video', opts = Object.assign({
      id: require('uuid/v1')(),
      width: storage.width,
      height: storage.height,
      videoId: getVideoId(opts.url) ? getVideoId(opts.url).id : '',
      strings: getLocaleStrings(opts.domain, isAudio(opts.url)),
      tabId: browser.tabs.TAB.id,
      launchUrl: opts.url,
      currentTime: 0,
      keyShortcutsEnabled: prefs['keyShortcutsEnabled'],
      confirm: false,
      confirmContent: '{}'
    }, opts));

    // YouTube playlist handling
    if (opts.domain === 'youtube.com' && !!~opts.url.indexOf('list')) {
      if (!!~opts.url.indexOf('watch?v')) {
        const parsed = qs.parse(opts.url.substr(opts.url.indexOf('?') + 1));
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
          if (windowUtils.isMinimized()) windowUtils.maximize();
          windowUtils.send('set-video', Object.assign(opts, {
            confirm: true,
            error: false,
            minimized: false,
            queue: JSON.stringify(storage.queue),
            history: JSON.stringify(storage.history)
          }));
        });
      } else {
        // only playlist handling
        const parsed = qs.parse(opts.url.substr(opts.url.indexOf('?') + 1));
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
          windowUtils.send('set-video', response);
        });
      }
    } else {
      // fetch the media source and set it
      getUrlFn(opts, function(item) {
        if (item.error) console.error('LaunchVideo failed to get the streamUrl: ', item.err); // eslint-disable-line no-console

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
        windowUtils.send('set-video', videoOptions);
      });
    }
  });
}
