const port = browser.runtime.connect({name: "connection-to-legacy"});

port.onMessage.addListener(handleMessage);

function send(msg) {
  console.log(msg);
  // port.postMessage({
  //   content: "content from legacy add-on"
  // });
}



function handleMessage(msg) {
  console.log("Message from legacy add-on: " + message.content);

  const title = msg.action;
  const opts = msg;

  switch (title) {
    case 'send-to-tab':
      const pageUrl = opts.launchUrl ? opts.launchUrl : getPageUrl(opts.domain, opts.id, opts.time);
      if (pageUrl) browser.tabs.create({url: pageUrl});
      else {
        console.error('could not parse page url for ', opts); // eslint-disable-line no-console
        send('set-video', {error: 'Error loading video from ' + opts.domain});
      }
      send('set-video', {domain: '', src: ''});
      closeWindow();
      break;


  case value2:
        //Statements executed when the result of expression matches
    //value2
    [break;]
      ...
  case valueN:
        //Statements executed when the result of expression matches
    //valueN
    [break;]
    [default:
        //Statements executed when none of the values match the value
     //of the expression
     [break;]]
  }

  if (title === 'send-to-tab') {
    
  } else if (title === 'close') {
    let history = storage.local.get('history');
    let queue = storage.local.get('queue');
    storage.local.set('history', history.unshift(queue.shift()));
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
    let history = storage.local.get('history');
    let queue = storage.local.get('queue');
    history.unshift(queue.shift());
    if (queue.length) {
      send('set-video', {
        playing: true,
        queue: JSON.stringify(queue),
        history: JSON.stringify(history)
      });
    }
  } else if (title === 'track-removed') {
    let history = storage.local.get('history');
    let queue = storage.local.get('queue');
    if (opts.isHistory) history.splice(opts.index, 1);
    else queue.splice(opts.index, 1);

    if (queue.length) {
      send('set-video', {
        queue: JSON.stringify(queue),
        history: JSON.stringify(history)
      });
    } else {
      send('set-video', {domain: '', src: ''});
      closeWindow();
    }
  } else if (title === 'track-added-from-history') {
    // In this case we should duplicate the item from the history
    // array.
    let history = storage.local.get('history');
    let queue = storage.local.get('queue');
    queue.push(history[opts.index]);
    sendMetricsData({
      object: 'queue_view',
      method: 'track-added-from-history',
      domain: queue[0].domain
    }, mvWindow);
    send('set-video', {queue: JSON.stringify(queue)});
  } else if (title === 'track-expedited') {
    let history = storage.local.get('history');
    let queue = storage.local.get('queue');
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
      history.unshift(queue.shift());
      if (opts.isHistory) opts.index++;
      else opts.index--;
    }

    if (opts.isHistory) {
      queue.unshift(history[opts.index])
    } else queue.unshift(queue.splice(opts.index, 1)[0])

    sendMetricsData({
      object: 'queue_view',
      method: 'track-expedited',
      domain: queue[0].domain
    }, mvWindow);

    send('set-video', {
      playing: true,
      queue: JSON.stringify(queue),
      history: JSON.stringify(history)
    });
  } else if (title === 'track-reordered') {
    let history = storage.local.get('history');
    let queue = storage.local.get('queue');
    const newQueue = queue.slice();
    newQueue.splice(opts.newIndex, 0, newQueue.splice(opts.oldIndex, 1)[0]);
    queue = newQueue;
    sendMetricsData({
      object: 'queue_view',
      method: 'track-reordered',
      domain: queue[0].domain
    }, mvWindow);
    send('set-video', {queue: JSON.stringify(queue)});
  } else if (title === 'play-from-history') {
    queue.splice(0);
    queue = history.slice(0, 10);
    send('set-video', {
      playing: true,
      exited: false,
      queue: JSON.stringify(queue),
      history: JSON.stringify(history)
    });
  } else if (title === 'clear') {
    sendMetricsData({
      object: 'queue_view',
      method: `clear:${opts.choice}`,
      domain: ''
    }, mvWindow);
    if (opts.choice === 'history') {
      storage.local.set('history', []);
      send('set-video', {history: JSON.stringify(storage.local.history)});
    } else {
      storage.local.set('queue', []);
      send('set-video', {domain: '', src: '', queue: JSON.stringify(storage.local.queue)});
      closeWindow();
    }
  } else if (title === 'confirm') {
    let history = storage.local.get('history');
    let queue = storage.local.get('queue');
    if (opts.choice === 'playlist') {
      youtubeHelpers.getPlaylist(opts, playlist => {

        // if the playlist was launched on with a certain video
        // we need to grab the playlist at that playlist
        if (opts.index) playlist = playlist.splice(opts.index - 1);

        if (opts.playerMethod === 'play') {
          // if the 'play-now' option was selected, and min vid has a
          // track playing we need to move that item to history before
          // front loading the playlist results into the queue.
          if (opts.moveIndexZero) history.unshift(queue.shift());
          queue = playlist.concat(queue);
        } else queue = queue.concat(playlist);

        const response = {
          trackAdded: (opts.playerMethod === 'add-to-queue') && (queue.length > 1),
          error: false,
          queue: JSON.stringify(queue),
          history: JSON.stringify(history),
          confirm: false,
          confirmContent: '{}'
        };

        if (opts.playerMethod === 'play') response.playing = true;
        send('set-video', response);
      });
    } else if (opts.choice === 'cancel') {
      let history = storage.local.get('history');
      let queue = storage.local.get('queue');
      if (!queue.length) {
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
          queue: JSON.stringify(queue),
          history: JSON.stringify(history)
        });
      }
    } else {
      let history = storage.local.get('history');
      let queue = storage.local.get('queue');
      youtubeHelpers.getVideo(opts, video => {
        if (opts.playerMethod === 'play') {
          // if the 'play-now' option was selected, and min vid has a
          // track playing we need to move that item to history before
          // front loading the video into the queue.
          if (opts.moveIndexZero) history.unshift(queue.shift());
          queue.unshift(video);
        } else queue.push(video);
        const response = {
          trackAdded: (opts.playerMethod === 'add-to-queue') && (queue.length > 1),
          error: false,
          queue: JSON.stringify(queue),
          history: JSON.stringify(history),
          confirm: false,
          confirmContent: '{}'
        };

        if (opts.playerMethod === 'play') response.playing = true;

        send('set-video', response);
      });
    }
  }
}
