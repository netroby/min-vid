const youtubeHelpers = require('./youtube-helpers');

function handleMessage(msg) {
  const title = msg.action;
  const opts = msg;
  if (title === 'send-to-tab') {
    const pageUrl = opts.launchUrl ? opts.launchUrl : getPageUrl(opts.domain, opts.id, opts.time);
    if (pageUrl) openTab(pageUrl);
    else {
      console.error('could not parse page url for ', opts); // eslint-disable-line no-console
      send('set-video', {error: 'Error loading video from ' + opts.domain});
    }
    send('set-video', {domain: '', src: ''});
    closeWindow();
  } else if (title === 'close') {
    store.history.unshift(store.queue.shift());
    send('set-video', {domain: '', src: ''});
    closeWindow();
  } else if (title === 'minimize') {
    mvWindow.resizeTo(DEFAULT_DIMENSIONS.width, DEFAULT_DIMENSIONS.minimizedHeight);
    mvWindow.moveBy(0, DEFAULT_DIMENSIONS.height - DEFAULT_DIMENSIONS.minimizedHeight);
    saveLocation.screenPosition = {x: mvWindow.screenX, y: mvWindow.screenY};
  } else if (title === 'maximize') {
    maximize();
  } else if (title === 'metrics-event') {
    // Note: sending in the window ref to avoid circular imports.
    sendMetricsData(opts.payload, mvWindow);
  } else if (title === 'track-ended') {
    store.history.unshift(store.queue.shift());
    if (store.queue.length) {
      send('set-video', {
        playing: true,
        queue: JSON.stringify(store.queue),
        history: JSON.stringify(store.history)
      });
    }
  } else if (title === 'track-removed') {
    if (opts.isHistory) store.history.splice(opts.index, 1);
    else store.queue.splice(opts.index, 1);

    if (store.queue.length) {
      send('set-video', {
        queue: JSON.stringify(store.queue),
        history: JSON.stringify(store.history)
      });
    } else {
      send('set-video', {domain: '', src: ''});
      closeWindow();
    }
  } else if (title === 'track-added-from-history') {
    // In this case we should duplicate the item from the history
    // array.
    store.queue.push(store.history[opts.index]);
    sendMetricsData({
      object: 'queue_view',
      method: 'track-added-from-history',
      domain: store.queue[0].domain
    }, mvWindow);
    send('set-video', {queue: JSON.stringify(store.queue)});
  } else if (title === 'track-expedited') {
    /*
     * the goal here is to get the track index, move it to the top
     * of the queue, and play it.
     * We also need to handle the currently playing track correctly.

     * If track 0 in the queue is not playing, and hasn't been
     * played at all(currentTime == 0), we should move the newTrack
     * to the top of the queue and play it.

     * If track 0 in the queue is playing or has been played
     * (currentTime > 0), we should move track 0 into the history
     * array, and then move newTrack to the top of the queue
     */
    if (opts.moveIndexZero) {
      store.history.unshift(store.queue.shift());
      if (opts.isHistory) opts.index++;
      else opts.index--;
    }

    if (opts.isHistory) {
      store.queue.unshift(store.history[opts.index])
    } else store.queue.unshift(store.queue.splice(opts.index, 1)[0])

    sendMetricsData({
      object: 'queue_view',
      method: 'track-expedited',
      domain: store.queue[0].domain
    }, mvWindow);

    send('set-video', {
      playing: true,
      queue: JSON.stringify(store.queue),
      history: JSON.stringify(store.history)
    });
  } else if (title === 'track-reordered') {
    const newQueue = store.queue.slice();
    newQueue.splice(opts.newIndex, 0, newQueue.splice(opts.oldIndex, 1)[0]);
    store.queue = newQueue;
    sendMetricsData({
      object: 'queue_view',
      method: 'track-reordered',
      domain: store.queue[0].domain
    }, mvWindow);
    send('set-video', {queue: JSON.stringify(store.queue)});
  } else if (title === 'play-from-history') {
    store.queue.splice(0);
    store.queue = store.history.slice(0, 10);
    send('set-video', {
      playing: true,
      exited: false,
      queue: JSON.stringify(store.queue),
      history: JSON.stringify(store.history)
    });
  } else if (title === 'clear') {
    sendMetricsData({
      object: 'queue_view',
      method: `clear:${opts.choice}`,
      domain: ''
    }, mvWindow);
    if (opts.choice === 'history') {
      store.history = [];
      send('set-video', {history: JSON.stringify(store.history)});
    } else {
      store.queue = [];
      send('set-video', {domain: '', src: '', queue: JSON.stringify(store.queue)});
      closeWindow();
    }
  } else if (title === 'confirm') {
    if (opts.choice === 'playlist') {
      youtubeHelpers.getPlaylist(opts, playlist => {

        // if the playlist was launched on with a certain video
        // we need to grab the playlist at that playlist
        if (opts.index) playlist = playlist.splice(opts.index - 1);

        if (opts.playerMethod === 'play') {
          // if the 'play-now' option was selected, and min vid has a
          // track playing we need to move that item to history before
          // front loading the playlist results into the queue.
          if (opts.moveIndexZero) store.history.unshift(store.queue.shift());
          store.queue = playlist.concat(store.queue);
        } else store.queue = store.queue.concat(playlist);

        const response = {
          trackAdded: (opts.playerMethod === 'add-to-queue') && (store.queue.length > 1),
          error: false,
          queue: JSON.stringify(store.queue),
          history: JSON.stringify(store.history),
          confirm: false,
          confirmContent: '{}'
        };

        if (opts.playerMethod === 'play') response.playing = true;
        send('set-video', response);
      });
    } else if (opts.choice === 'cancel') {
      if (!store.queue.length) {
        send('set-video', {
          domain: '',
          src: '',
          confirm: false,
          confirmContent: '{}'
        });
        closeWindow();
      } else {
        send('set-video', {
          confirm: false,
          confirmContent: '{}',
          queue: JSON.stringify(store.queue),
          history: JSON.stringify(store.history)
        });
      }
    } else {
      youtubeHelpers.getVideo(opts, video => {
        if (opts.playerMethod === 'play') {
          // if the 'play-now' option was selected, and min vid has a
          // track playing we need to move that item to history before
          // front loading the video into the queue.
          if (opts.moveIndexZero) store.history.unshift(store.queue.shift());
          store.queue.unshift(video);
        } else store.queue.push(video);
        const response = {
          trackAdded: (opts.playerMethod === 'add-to-queue') && (store.queue.length > 1),
          error: false,
          queue: JSON.stringify(store.queue),
          history: JSON.stringify(store.history),
          confirm: false,
          confirmContent: '{}'
        };

        if (opts.playerMethod === 'play') response.playing = true;

        send('set-video', response);
      });
    }
  }
}

function getPageUrl(domain, id, time) {
  let url;
  if (domain.indexOf('youtube') > -1) {
    url = `https://youtube.com/watch?v=${id}&t=${Math.floor(time)}`;
  } else if (domain.indexOf('vimeo') > -1) {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time - min * 60);
    url = `https://vimeo.com/${id}#t=${min}m${sec}s`;
  }

  return url;
}

const EXPORTED_SYMBOLS = ['handleMessage'];
