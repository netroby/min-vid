/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendMetricsData = sendMetricsData;
var storage = browser.storage.local;
var manifest = __webpack_require__(9);

var GA_URL = 'https://ssl.google-analytics.com/collect';

function sendMetricsData(o, win) {
  // Note: window ref is optional, used to avoid circular refs with window-utils.js.
  win = win || __webpack_require__(1).getWindow();

  if (!win || win.incognito) return;

  var coords = win.document.documentElement.getBoundingClientRect();

  // NOTE: this packet follows a predefined data format and cannot be changed
  //       without notifying the data team. See docs/metrics.md for more.
  var formEncodedData = Object.keys({
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
  }).map(function (item) {
    return encodeURIComponent(item) + '=' + encodeURIComponent(obj[item]);
  }).join('&');

  if ('sendBeacon' in navigator) {
    navigator.sendBeacon(GA_URL, formEncodedData);
  } else {
    var config = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      },
      body: formEncodedData
    };
    fetch(GA_URL, config).then(function () {
      return console.log('Sent GA message via fetch: ' + formEncodedData);
    }).catch(function (err) {
      return console.error('GA sending via fetch failed: ' + err);
    });
  }
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMinimized = exports.maximize = exports.show = exports.send = exports.updateWindow = exports.getWindow = exports.destroy = exports.create = exports.whenReady = undefined;

var _chrome = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"chrome\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var _timers = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"sdk/timers\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var _saveLocation = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./save-location\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var _saveLocation2 = _interopRequireDefault(_saveLocation);

var _sendMetricsData = __webpack_require__(0);

var _sendMetricsData2 = _interopRequireDefault(_sendMetricsData);

var _topify = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./topify\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var _topify2 = _interopRequireDefault(_topify);

var _draggingUtils = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./dragging-utils\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var _draggingUtils2 = _interopRequireDefault(_draggingUtils);

var _youtubeHelpers = __webpack_require__(2);

var _youtubeHelpers2 = _interopRequireDefault(_youtubeHelpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chrome.Cu.import('resource://gre/modules/Console.jsm'); // browser.storage calls may need to be tweaked to handle setting and
// unsetting. Particularly calls to JSON.parse may need to be
// added. In which case I may add a facade object(proxy?) to let them
// act as they are below.


// todo handle this probably on the bootstrap side

_chrome.Cu.import('resource://gre/modules/Services.jsm');

var storage = browser.storage;

/* global Services */

var DEFAULT_DIMENSIONS = {
  height: storage.local.height,
  width: storage.local.width,
  minimizedHeight: 100
};

// TODO: if mvWindow changes, we need to destroy and create the player.
// This must be why we get those dead object errors. Note that mvWindow
// is passed into the DraggableElement constructor, could be a source of
// those errors. Maybe pass a getter instead of a window reference.
var mvWindow = void 0;

var commandPollTimer = void 0;

// waits till the window is ready, then calls callbacks.
function whenReady(cb) {
  // TODO: instead of setting timeout for each callback, just poll, then call all callbacks.
  if (mvWindow && 'AppData' in mvWindow.wrappedJSObject && 'YT' in mvWindow.wrappedJSObject && 'PlayerState' in mvWindow.wrappedJSObject.YT) return cb();
  (0, _timers.setTimeout)(function () {
    whenReady(cb);
  }, 25);
}

// I can't get frame scripts working, so instead we just set global state directly in react. fml
function send(eventName, msg) {
  whenReady(function () {
    var newData = Object.assign(mvWindow.wrappedJSObject.AppData, msg);
    mvWindow.wrappedJSObject.AppData = newData;
  });
}

function getWindow() {
  return mvWindow;
}

// Detecting when the window is closed is surprisingly difficult. If hotkeys
// close the window, no detectable event is fired. Instead, we have to listen
// for the nsIObserver event fired when _any_ XUL window is closed, then loop
// over all windows and look for the minvid window.
var onWindowClosed = function onWindowClosed(evt) {
  // Note: we pass null here because minvid window is not of type 'navigator:browser'
  var enumerator = Services.wm.getEnumerator(null);

  var minvidExists = false;
  while (enumerator.hasMoreElements()) {
    var win = enumerator.getNext();
    if (win.name === 'minvid') {
      minvidExists = true;
      break;
    }
  }
  if (!minvidExists) closeWindow();
};
Services.obs.addObserver(onWindowClosed, 'xul-window-destroyed', false); // eslint-disable-line mozilla/no-useless-parameters

// This handles the case where the min vid window is kept open
// after closing the last firefox window.
function closeRequested() {
  destroy(true);
}
Services.obs.addObserver(closeRequested, 'browser-lastwindow-close-requested', false); // eslint-disable-line mozilla/no-useless-parameters

function closeWindow() {
  // If the window is gone, a 'dead object' error will be thrown; discard it.
  try {
    mvWindow && mvWindow.close();
  } catch (ex) {} // eslint-disable-line no-empty
  // stop communication
  (0, _timers.clearTimeout)(commandPollTimer);
  commandPollTimer = null;
  // clear the window pointer
  mvWindow = null;
  // TODO: do we need to manually tear down frame scripts?
}

function create() {
  if (mvWindow) return mvWindow;

  var _saveLocation$screenP = _saveLocation2.default.screenPosition,
      x = _saveLocation$screenP.x,
      y = _saveLocation$screenP.y;
  // implicit assignment to mvWindow global

  var windowArgs = {
    url: extension.getURL('default.html'),
    left: x,
    top: y,
    width: storage.local.width,
    height: storage.local.height,
    focused: true,
    type: 'panel'
  };
  mvWindow = browser.windows.create(windowArgs);
  // once the window's ready, make it always topmost
  whenReady(function () {
    (0, _topify2.default)(mvWindow);
  });
  initCommunication();
  whenReady(function () {
    makeDraggable();
  });
  return mvWindow;
}

function initCommunication() {
  var errorCount = 0;
  // When the window's ready, start polling for pending commands
  function pollForCommands() {
    var cmd = void 0;
    try {
      cmd = mvWindow.wrappedJSObject.pendingCommands;
    } catch (ex) {
      console.error('something happened trying to get pendingCommands: ', ex); // eslint-disable-line no-console
      if (++errorCount > 10) {
        console.error('pendingCommands threw 10 times, giving up'); // eslint-disable-line no-console
        // NOTE: if we can't communicate with the window, we have to close it,
        // since the user cannot.
        closeWindow();
        return;
      }
    }
    commandPollTimer = (0, _timers.setTimeout)(pollForCommands, 25);
    if (!cmd || !cmd.length) return;
    // We found a command! Erase it, then act on it.
    mvWindow.wrappedJSObject.resetCommands();
    for (var i = 0; i < cmd.length; i++) {
      var parsed = void 0;
      try {
        parsed = JSON.parse(cmd[i]);
      } catch (ex) {
        console.error('malformed command sent to addon: ', cmd[i], ex); // eslint-disable-line no-console
        break;
      }
      handleMessage(parsed);
    }
  }
  whenReady(pollForCommands);
}

function makeDraggable() {
  // Based on WindowDraggingElement usage in popup.xml
  // https://dxr.mozilla.org/mozilla-central/source/toolkit/content/widgets/popup.xml#278-288
  var draghandle = new _draggingUtils2.default(mvWindow);
  draghandle.mouseDownCheck = function () {
    return true;
  };

  // Update the saved position each time the draggable window is dropped.
  // Listening for 'dragend' events doesn't work, so use 'mouseup' instead.
  mvWindow.document.addEventListener('mouseup', function () {
    _saveLocation2.default.screenPosition = { x: mvWindow.screenX, y: mvWindow.screenY };
  });
}

function destroy(isUnload) {
  closeWindow();
  if (isUnload) {

    // windows.onRemoved
    Services.obs.removeObserver(onWindowClosed, 'xul-window-destroyed');
    Services.obs.removeObserver(closeRequested, 'browser-lastwindow-close-requested');
    _saveLocation2.default.destroy();
  }
}

function updateWindow() {
  return mvWindow || create();
}

function show() {
  if (!mvWindow) create();
}

function isMinimized() {
  return mvWindow.innerHeight <= DEFAULT_DIMENSIONS.minimizedHeight;
}

function maximize() {
  mvWindow.resizeTo(DEFAULT_DIMENSIONS.width, DEFAULT_DIMENSIONS.height);
  mvWindow.moveBy(0, DEFAULT_DIMENSIONS.minimizedHeight - DEFAULT_DIMENSIONS.height);
  _saveLocation2.default.screenPosition = { x: mvWindow.screenX, y: mvWindow.screenY };
}

function handleMessage(msg) {
  var title = msg.action;
  var opts = msg;
  if (title === 'send-to-tab') {
    var pageUrl = opts.launchUrl ? opts.launchUrl : getPageUrl(opts.domain, opts.id, opts.time);
    if (pageUrl) browser.tabs.create({ url: pageUrl });else {
      console.error('could not parse page url for ', opts); // eslint-disable-line no-console
      send('set-video', { error: 'Error loading video from ' + opts.domain });
    }
    send('set-video', { domain: '', src: '' });
    closeWindow();
  } else if (title === 'close') {
    var _history = storage.local.get('history');
    var _queue = storage.local.get('queue');
    storage.local.set('history', _history.unshift(_queue.shift()));
    send('set-video', { domain: '', src: '' });
    closeWindow();
  } else if (title === 'minimize') {
    mvWindow.resizeTo(DEFAULT_DIMENSIONS.width, DEFAULT_DIMENSIONS.minimizedHeight);
    mvWindow.moveBy(0, DEFAULT_DIMENSIONS.height - DEFAULT_DIMENSIONS.minimizedHeight);
    _saveLocation2.default.screenPosition = { x: mvWindow.screenX, y: mvWindow.screenY };
  } else if (title === 'maximize') {
    maximize();
  } else if (title === 'metrics-event') {
    // Note: sending in the window ref to avoid circular imports.
    (0, _sendMetricsData2.default)(opts.payload, mvWindow);
  } else if (title === 'track-ended') {
    var _history2 = storage.local.get('history');
    var _queue2 = storage.local.get('queue');
    _history2.unshift(_queue2.shift());
    if (_queue2.length) {
      send('set-video', {
        playing: true,
        queue: JSON.stringify(_queue2),
        history: JSON.stringify(_history2)
      });
    }
  } else if (title === 'track-removed') {
    var _history3 = storage.local.get('history');
    var _queue3 = storage.local.get('queue');
    if (opts.isHistory) _history3.splice(opts.index, 1);else _queue3.splice(opts.index, 1);

    if (_queue3.length) {
      send('set-video', {
        queue: JSON.stringify(_queue3),
        history: JSON.stringify(_history3)
      });
    } else {
      send('set-video', { domain: '', src: '' });
      closeWindow();
    }
  } else if (title === 'track-added-from-history') {
    // In this case we should duplicate the item from the history
    // array.
    var _history4 = storage.local.get('history');
    var _queue4 = storage.local.get('queue');
    _queue4.push(_history4[opts.index]);
    (0, _sendMetricsData2.default)({
      object: 'queue_view',
      method: 'track-added-from-history',
      domain: _queue4[0].domain
    }, mvWindow);
    send('set-video', { queue: JSON.stringify(_queue4) });
  } else if (title === 'track-expedited') {
    var _history5 = storage.local.get('history');
    var _queue5 = storage.local.get('queue');
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
      _history5.unshift(_queue5.shift());
      if (opts.isHistory) opts.index++;else opts.index--;
    }

    if (opts.isHistory) {
      _queue5.unshift(_history5[opts.index]);
    } else _queue5.unshift(_queue5.splice(opts.index, 1)[0]);

    (0, _sendMetricsData2.default)({
      object: 'queue_view',
      method: 'track-expedited',
      domain: _queue5[0].domain
    }, mvWindow);

    send('set-video', {
      playing: true,
      queue: JSON.stringify(_queue5),
      history: JSON.stringify(_history5)
    });
  } else if (title === 'track-reordered') {
    var _history6 = storage.local.get('history');
    var _queue6 = storage.local.get('queue');
    var newQueue = _queue6.slice();
    newQueue.splice(opts.newIndex, 0, newQueue.splice(opts.oldIndex, 1)[0]);
    _queue6 = newQueue;
    (0, _sendMetricsData2.default)({
      object: 'queue_view',
      method: 'track-reordered',
      domain: _queue6[0].domain
    }, mvWindow);
    send('set-video', { queue: JSON.stringify(_queue6) });
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
    (0, _sendMetricsData2.default)({
      object: 'queue_view',
      method: 'clear:' + opts.choice,
      domain: ''
    }, mvWindow);
    if (opts.choice === 'history') {
      storage.local.set('history', []);
      send('set-video', { history: JSON.stringify(storage.local.history) });
    } else {
      storage.local.set('queue', []);
      send('set-video', { domain: '', src: '', queue: JSON.stringify(storage.local.queue) });
      closeWindow();
    }
  } else if (title === 'confirm') {
    var _history7 = storage.local.get('history');
    var _queue7 = storage.local.get('queue');
    if (opts.choice === 'playlist') {
      _youtubeHelpers2.default.getPlaylist(opts, function (playlist) {

        // if the playlist was launched on with a certain video
        // we need to grab the playlist at that playlist
        if (opts.index) playlist = playlist.splice(opts.index - 1);

        if (opts.playerMethod === 'play') {
          // if the 'play-now' option was selected, and min vid has a
          // track playing we need to move that item to history before
          // front loading the playlist results into the queue.
          if (opts.moveIndexZero) _history7.unshift(_queue7.shift());
          _queue7 = playlist.concat(_queue7);
        } else _queue7 = _queue7.concat(playlist);

        var response = {
          trackAdded: opts.playerMethod === 'add-to-queue' && _queue7.length > 1,
          error: false,
          queue: JSON.stringify(_queue7),
          history: JSON.stringify(_history7),
          confirm: false,
          confirmContent: '{}'
        };

        if (opts.playerMethod === 'play') response.playing = true;
        send('set-video', response);
      });
    } else if (opts.choice === 'cancel') {
      var _history8 = storage.local.get('history');
      var _queue8 = storage.local.get('queue');
      if (!_queue8.length) {
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
          queue: JSON.stringify(_queue8),
          history: JSON.stringify(_history8)
        });
      }
    } else {
      var _history9 = storage.local.get('history');
      var _queue9 = storage.local.get('queue');
      _youtubeHelpers2.default.getVideo(opts, function (video) {
        if (opts.playerMethod === 'play') {
          // if the 'play-now' option was selected, and min vid has a
          // track playing we need to move that item to history before
          // front loading the video into the queue.
          if (opts.moveIndexZero) _history9.unshift(_queue9.shift());
          _queue9.unshift(video);
        } else _queue9.push(video);
        var response = {
          trackAdded: opts.playerMethod === 'add-to-queue' && _queue9.length > 1,
          error: false,
          queue: JSON.stringify(_queue9),
          history: JSON.stringify(_history9),
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
  var url = void 0;
  if (domain.indexOf('youtube') > -1) {
    url = 'https://youtube.com/watch?v=' + id + '&t=' + Math.floor(time);
  } else if (domain.indexOf('vimeo') > -1) {
    var min = Math.floor(time / 60);
    var sec = Math.floor(time - min * 60);
    url = 'https://vimeo.com/' + id + '#t=' + min + 'm' + sec + 's';
  }

  return url;
}

// todo: export this object somehow

exports.whenReady = whenReady;
exports.create = create;
exports.destroy = destroy;
exports.getWindow = getWindow;
exports.updateWindow = updateWindow;
exports.send = send;
exports.show = show;
exports.maximize = maximize;
exports.isMinimized = isMinimized;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var qs = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"sdk/querystring\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var apiKey = browser.runtime.getManifest().config['YOUTUBE_DATA_API_KEY'];
var parse = __webpack_require__(3).parse;
var toSeconds = __webpack_require__(3).toSeconds;

module.exports = {
  getVideo: getVideo,
  getPlaylist: getPlaylist,
  getPlaylistMeta: getPlaylistMeta
};

function getVideo(opts, cb) {
  var query = qs.stringify({
    key: apiKey,
    id: opts.videoId,
    part: 'snippet,contentDetails,status'
  });

  var url = 'https://www.googleapis.com/youtube/v3/videos?' + query;
  fetch(url).then(function (res) {
    var result = res.json.items;
    var item = {
      cc: opts.cc,
      videoId: opts.videoId,
      url: 'https://youtube.com/watch?v=' + opts.videoId,
      domain: 'youtube.com',
      currentTime: opts.time || 0,
      error: false,
      title: result.length ? result[0].snippet.title : '',
      duration: result.length ? toSeconds(parse(result[0].contentDetails.duration)) : 0,
      preview: 'https://img.youtube.com/vi/' + opts.videoId + '/0.jpg',
      live: result.length ? Boolean(result[0].snippet.liveBroadcastContent === 'live') : false
    };

    var url = 'https://www.youtube.com/get_video_info?video_id=' + opts.videoId;
    fetch(url).then(function (res) {
      var result = qs.parse(res.text);
      if (result.status === 'fail') {
        if (result.reason.indexOf('restricted')) item.error = 'error_youtube_not_allowed';else item.error = 'error_youtube_not_found';
      }

      cb(item);
    });
  });
}

function getPlaylistMeta(opts, cb) {
  var query = qs.stringify({
    key: apiKey,
    part: 'snippet',
    id: opts.playlistId
  });

  var url = 'https://www.googleapis.com/youtube/v3/playlists?' + query;
  fetch(url).then(function (res) {
    var result = res.json.items[0].snippet;

    query = qs.parse(query);
    query.id = opts.videoId;
    query = qs.stringify(query);

    var url = 'https://www.googleapis.com/youtube/v3/videos?' + query;
    fetch(url).then(function (res) {
      cb(Object.assign(opts, {
        playlistTitle: result.title,
        videoTitle: res.json.items[0].snippet.title
      }));
    });
  });
}

function getPlaylist(opts, cb, passedPlaylist) {
  var query = qs.stringify({
    key: apiKey,
    part: 'snippet',
    playlistId: opts.playlistId,
    maxResults: 50,
    pageToken: opts.pageToken || ''
  });

  var url = 'https://www.googleapis.com/youtube/v3/playlistItems?' + query;
  fetch(url).then(function (res) {
    var result = res.json;
    if (result.pageInfo.totalResults <= 50) {
      Promise.all(result.items.map(function (i) {
        return getVideoDetails(i.snippet.resourceId.videoId, i.snippet.position);
      })).then(function (playlist) {
        return cb(playlist.sort(function (a, b) {
          return a.position - b.position;
        }));
      });
    } else {
      var shouldFetch = result.items[result.items.length - 1].snippet.position < result.pageInfo.totalResults - 1;
      Promise.all(result.items.map(function (i) {
        return getVideoDetails(i.snippet.resourceId.videoId, i.snippet.position);
      })).then(function (playlist) {
        return passedPlaylist ? passedPlaylist.concat(playlist) : playlist;
      }).then(function (playlist) {
        return shouldFetch ? getPlaylist(Object.assign(qs.parse(query), { pageToken: result.nextPageToken }), cb, playlist) : cb(playlist);
      });
    }
  });
}

function getVideoDetails(videoId, position) {
  return new Promise(function (resolve) {
    getVideo({
      time: 0,
      videoId: videoId
    }, function (item) {
      item.position = position;
      resolve(item);
    });
  });
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * @description A module for parsing ISO8601 durations
 */

/**
 * The pattern used for parsing ISO8601 duration (PnYnMnDTnHnMnS).
 * This does not cover the week format PnW.
 */

// PnYnMnDTnHnMnS
var numbers = '\\d+(?:[\\.,]\\d{0,3})?';
var weekPattern = '(' + numbers + 'W)';
var datePattern = '(' + numbers + 'Y)?(' + numbers + 'M)?(' + numbers + 'D)?';
var timePattern = 'T(' + numbers + 'H)?(' + numbers + 'M)?(' + numbers + 'S)?';

var iso8601 = 'P(?:' + weekPattern + '|' + datePattern + '(?:' + timePattern + ')?)';
var objMap = ['weeks', 'years', 'months', 'days', 'hours', 'minutes', 'seconds'];

/**
 * The ISO8601 regex for matching / testing durations
 */
var pattern = exports.pattern = new RegExp(iso8601);

/** Parse PnYnMnDTnHnMnS format to object
 * @param {string} durationString - PnYnMnDTnHnMnS formatted string
 * @return {Object} - With a property for each part of the pattern
 */
var parse = exports.parse = function parse(durationString) {
	// slice away first entry in match-array
	return durationString.match(pattern).slice(1).reduce(function (prev, next, idx) {
		prev[objMap[idx]] = parseFloat(next) || 0;
		return prev;
	}, {});
};

/**
 * Convert ISO8601 duration object to seconds
 *
 * @param {Object} duration - The duration object
 * @param {Date=} startDate - The starting point for calculating the duration
 * @return {Number}
 */
var toSeconds = exports.toSeconds = function toSeconds(duration, startDate) {
	// create two equal timestamps, add duration to 'then' and return time difference
	var timestamp = startDate ? startDate.getTime() : Date.now();
	var now = new Date(timestamp);
	var then = new Date(timestamp);

	then.setFullYear(then.getFullYear() + duration.years);
	then.setMonth(then.getMonth() + duration.months);
	then.setDate(then.getDate() + duration.days);
	then.setHours(then.getHours() + duration.hours);
	then.setMinutes(then.getMinutes() + duration.minutes);
	// then.setSeconds(then.getSeconds() + duration.seconds);
	then.setMilliseconds(then.getMilliseconds() + duration.seconds * 1000);
	// special case weeks
	then.setDate(then.getDate() + duration.weeks * 7);

	var seconds = (then.getTime() - now.getTime()) / 1000;
	return seconds;
};

exports.default = {
	toSeconds: toSeconds,
	pattern: pattern,
	parse: parse
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _launchVideo = __webpack_require__(5);

var _launchVideo2 = _interopRequireDefault(_launchVideo);

var _sendMetricsData = __webpack_require__(0);

var _sendMetricsData2 = _interopRequireDefault(_sendMetricsData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the 'License'). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

// set our unique identifier for metrics
// (needs to be set before send-metrics-data is loaded)
if (!browser.storage.local.clientUUID) {
  browser.storage.local.set('clientUUID', __webpack_require__(15)());
}

if (!browser.storage.local.queue) browser.storage.local.queue = [];
if (!browser.storage.local.history) browser.storage.local.history = [];

// import windowUtils from './lib/window-utils';

// import getVimeoUrl from './lib/get-vimeo-url';
// import youtubeHelpers from './lib/youtube-helpers';

// import getSoundcloudUrl from './lib/get-soundcloud-url';
// import contextMenuHandlers from './lib/context-menu-handlers';

// exports.main = function() {
//   contextMenuHandlers.init(windowUtils.getWindow());
// };

browser.runtime.onMessage.addListener(onMessage);

function onMessage(opts) {
  var title = opts.title;
  delete opts.title;
  console.log('onMessage: ', opts);

  if (title === 'launch') {
    if (opts.domain.indexOf('youtube.com') > -1) {
      // opts.getUrlFn = youtubeHelpers.getVideo;
    } else if (opts.domain.indexOf('vimeo.com') > -1) {
      // opts.getUrlFn = getVimeoUrl;
    } else if (opts.domain.indexOf('soundcloud.com') > -1) {
      // opts.getUrlFn = getSoundcloudUrl;
    }

    (0, _sendMetricsData2.default)({
      object: 'overlay_icon',
      method: 'launch',
      domain: opts.domain
    });

    (0, _launchVideo2.default)(opts);
  } else if (title === 'metric') (0, _sendMetricsData2.default)(opts);
}

// exports.onUnload = function() {
//   windowUtils.destroy(true);
//   contextMenuHandlers.destroy();
//   launchIconsMod.destroy();
// };

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launchVideo = launchVideo;

var _getVideoId = __webpack_require__(6);

var _getVideoId2 = _interopRequireDefault(_getVideoId);

var _isAudio = __webpack_require__(8);

var _isAudio2 = _interopRequireDefault(_isAudio);

var _windowUtils = __webpack_require__(1);

var _windowUtils2 = _interopRequireDefault(_windowUtils);

var _youtubeHelpers = __webpack_require__(2);

var _youtubeHelpers2 = _interopRequireDefault(_youtubeHelpers);

var _sendMetricsData = __webpack_require__(0);

var _sendMetricsData2 = _interopRequireDefault(_sendMetricsData);

var _getLocaleStrings = __webpack_require__(10);

var _getLocaleStrings2 = _interopRequireDefault(_getLocaleStrings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// active tabs tabs
// querystring
// prefs keyShortcutsenabled

// import qs from 'sdk/querystring';
function qs() {
  console.error('need to find a good query string parsing replacement, there should be a browser api for this');
}

var storage = browser.storage.local;

function isAudio(url) {
  return (0, _isAudio2.default)(url) || new RegExp('^(https?:)?//soundcloud.com\/').exec(url);
}

// Pass in a video URL as opts.src or pass in a video URL lookup function as opts.getUrlFn
function launchVideo(opts) {
  // UpdateWindow might create a new panel, so do the remaining launch work
  // asynchronously.
  _windowUtils2.default.updateWindow();
  _windowUtils2.default.whenReady(function () {
    var getUrlFn = opts.getUrlFn;
    var action = opts.action;

    delete opts.getUrlFn;
    delete opts.action;

    if (action === 'play') opts.playing = true;

    _windowUtils2.default.show();
    // send some initial data to open the loading view
    // before we fetch the media source
    _windowUtils2.default.send('set-video', opts = Object.assign({
      id: __webpack_require__(11)(),
      width: storage.width,
      height: storage.height,
      videoId: (0, _getVideoId2.default)(opts.url) ? (0, _getVideoId2.default)(opts.url).id : '',
      strings: (0, _getLocaleStrings2.default)(opts.domain, isAudio(opts.url)),
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
        var parsed = qs.parse(opts.url.substr(opts.url.indexOf('?') + 1));
        _youtubeHelpers2.default.getPlaylistMeta({
          videoId: parsed.v,
          playlistId: parsed.list
        }, function (meta) {
          opts.confirmContent = meta;
          opts.confirmContent.action = action;
          opts.confirmContent = JSON.stringify(opts.confirmContent);
          (0, _sendMetricsData2.default)({
            object: 'confirm_view',
            method: 'launch:video:' + action,
            domain: opts.domain
          });
          if (_windowUtils2.default.isMinimized()) _windowUtils2.default.maximize();
          _windowUtils2.default.send('set-video', Object.assign(opts, {
            confirm: true,
            error: false,
            minimized: false,
            queue: JSON.stringify(storage.queue),
            history: JSON.stringify(storage.history)
          }));
        });
      } else {
        // only playlist handling
        var _parsed = qs.parse(opts.url.substr(opts.url.indexOf('?') + 1));
        _youtubeHelpers2.default.getPlaylist({ playlistId: _parsed.list }, function (playlist) {
          if (action === 'play') {
            storage.queue = playlist.concat(storage.queue);
          } else storage.queue = storage.queue.concat(playlist);

          var response = {
            trackAdded: action === 'add-to-queue' && storage.queue.length > 1,
            error: false,
            queue: JSON.stringify(storage.queue),
            history: JSON.stringify(storage.history)
          };

          (0, _sendMetricsData2.default)({
            object: 'confirm_view ',
            method: 'launch:playlist:' + action,
            domain: opts.domain
          });

          if (action === 'play') response.playing = true;
          _windowUtils2.default.send('set-video', response);
        });
      }
    } else {
      // fetch the media source and set it
      getUrlFn(opts, function (item) {
        if (item.error) console.error('LaunchVideo failed to get the streamUrl: ', item.err); // eslint-disable-line no-console

        if (isAudio(item.url)) item.player = 'audio';

        if (action === 'play') storage.queue.unshift(item);else storage.queue.push(item);

        var videoOptions = {
          trackAdded: action === 'add-to-queue' && storage.queue.length > 1,
          error: item.error ? item.error : false,
          queue: JSON.stringify(storage.queue),
          history: JSON.stringify(storage.history)
        };

        if (action === 'play') videoOptions.playing = true;
        _windowUtils2.default.send('set-video', videoOptions);
      });
    }
  });
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var getSrc = __webpack_require__(7);

module.exports = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('get-video-id expects a string');
	}

	if (/<iframe/ig.test(str)) {
		str = getSrc(str);
	}

	// remove the '-nocookie' flag from youtube urls
	str = str.replace('-nocookie', '');

	var metadata;

	if (/youtube|youtu\.be/.test(str)) {
		metadata = {
			id: youtube(str),
			service: 'youtube'
		};
	} else if (/vimeo/.test(str)) {
		metadata = {
			id: vimeo(str),
			service: 'vimeo'
		};
	} else if (/vine/.test(str)) {
		metadata = {
			id: vine(str),
			service: 'vine'
		};
	} else if (/videopress/.test(str)) {
		metadata = {
			id: videopress(str),
			service: 'videopress'
		};
	}
	return metadata;
};

/**
 * Get the vimeo id.
 * @param {string} str - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function vimeo(str) {
	if (str.indexOf('#') > -1) {
		str = str.split('#')[0];
	}
	if (str.indexOf('?') > -1) {
		str = str.split('?')[0];
	}

	var id;
	if (/https?:\/\/vimeo\.com\/[0-9]+$|https?:\/\/player\.vimeo\.com\/video\/[0-9]+$/igm.test(str)) {
		var arr = str.split('/');
		if (arr && arr.length) {
			id = arr.pop();
		}
	}
	return id;
}

/**
 * Get the vine id.
 * @param {string} str - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function vine(str) {
	var regex = /https:\/\/vine\.co\/v\/([a-zA-Z0-9]*)\/?/;
	var matches = regex.exec(str);
	return matches && matches[1];
}

/**
 * Get the Youtube Video id.
 * @param {string} str - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function youtube(str) {
	// shortcode
	var shortcode = /youtube:\/\/|https?:\/\/youtu\.be\//g;

	if (shortcode.test(str)) {
		var shortcodeid = str.split(shortcode)[1];
		return stripParameters(shortcodeid);
	}

	// /v/ or /vi/
	var inlinev = /\/v\/|\/vi\//g;

	if (inlinev.test(str)) {
		var inlineid = str.split(inlinev)[1];
		return stripParameters(inlineid);
	}

	// v= or vi=
	var parameterv = /v=|vi=/g;

	if (parameterv.test(str)) {
		var arr = str.split(parameterv);
		return arr[1].split('&')[0];
	}

	// embed
	var embedreg = /\/embed\//g;

	if (embedreg.test(str)) {
		var embedid = str.split(embedreg)[1];
		return stripParameters(embedid);
	}

	// user
	var userreg = /\/user\//g;

	if (userreg.test(str)) {
		var elements = str.split('/');
		return stripParameters(elements.pop());
	}

	// attribution_link
	var attrreg = /\/attribution_link\?.*v%3D([^%&]*)(%26|&|$)/;

	if (attrreg.test(str)) {
		return str.match(attrreg)[1];
	}
}

/**
 * Get the VideoPress id.
 * @param {string} str - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function videopress(str) {
	var idRegex;
	if (str.indexOf('embed') > -1) {
		idRegex = /embed\/(\w{8})/;
		return str.match(idRegex)[1];
	}

	idRegex = /\/v\/(\w{8})/;
	return str.match(idRegex)[1];
}

/**
 * Strip away any parameters following `?`
 * @param str
 * @returns {*}
 */
function stripParameters(str) {
	if (str.indexOf('?') > -1) {
		return str.split('?')[0];
	}
	return str;
}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function (input) {
	if (typeof input !== 'string') {
		throw new TypeError('get-src expected a string');
	}
	var re = /src="(.*?)"/gm;
	var url = re.exec(input);

	if (url && url.length >= 2) {
		return url[1];
	}
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
      value: true
});
exports.default = isAudio;
function isAudio(src) {
      var isSoundcloud = new RegExp('^(https?:)?//api.soundcloud.com\/tracks\/[0-9]+\/stream').exec(src);
      var isAudio = new RegExp('^(https?:)?//*.+(.mp3|.opus|.weba|.ogg|.wav|.flac)').exec(src);
      return Boolean(isSoundcloud || isAudio);
}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = {
	"title": "Min Vid",
	"name": "min-vid",
	"version": "0.3.8",
	"private": true,
	"icon": "resource://min-vid/docs/images/dark-logo.png",
	"description": "Minimize a web video or audio track into a small always-on-top panel in Firefox.",
	"homepage": "https://github.com/meandavejustice/min-vid",
	"repository": "meandavejustice/min-vid",
	"main": "index.js",
	"author": "meandave",
	"updateURL": "https://testpilot.firefox.com/files/@min-vid/updates.json",
	"engines": {
		"firefox": ">=38.0a1"
	},
	"permissions": {
		"multiprocess": true,
		"private-browsing": true,
		"unsafe-content-script": true
	},
	"bugs": {
		"url": "https://github.com/meandavejustice/min-vid/issues"
	},
	"config": {
		"SOUNDCLOUD_CLIENT_ID": "c23df04aed9a788cd31fd5b100f22a7a",
		"GA_TRACKING_ID": "UA-46704490-3",
		"YOUTUBE_DATA_API_KEY": "AIzaSyCfy3cdlDMB9cEVwuHiGACnUjbc9G0gXTc"
	},
	"preferences": [
		{
			"name": "height",
			"title": "Window height",
			"description": "Default window height (260)",
			"type": "integer",
			"value": 260
		},
		{
			"name": "width",
			"title": "Window width",
			"description": "Default window width (400)",
			"type": "integer",
			"value": 400
		},
		{
			"description": "Keyboard shortcuts enabled",
			"type": "bool",
			"name": "keyShortcutsEnabled",
			"value": true,
			"title": "Keyboard shortcuts enabled"
		}
	],
	"browserify-css": {
		"autoInject": true,
		"minify": true,
		"rootDir": "."
	},
	"scripts": {
		"lint": "eslint . bin/*",
		"build": "webpack",
		"build-script": "cross-env NODE_ENV=production browserify app.js -t [ babelify --presets [ react es2015 ] svgify ] > data/bundle.js",
		"watch-script": "cross-env NODE_ENV=development watchify app.js -o data/bundle.js -t [ babelify --presets [ react es2015 ] svgify ]",
		"storybook": "start-storybook -p 9001 -c .storybook",
		"start": "npm run dev",
		"watch": "jpm watchpost --post-url http://localhost:8888",
		"dev": "npm run locales && npm run watch-script & npm run watch & http-server -c-1 --cors",
		"prepackage": "npm run locales && npm run lint",
		"package": "npm run build-script && jpm xpi && npm run mv-xpi",
		"postpackage": "addons-linter addon.xpi -o text",
		"locales": "node ./bin/locales",
		"mv-xpi": "mv min-vid.xpi addon.xpi",
		"prepush": "npm run package",
		"deploy": "deploy-txp"
	},
	"license": "MPL-2.0",
	"dependencies": {
		"get-video-id": "2.1.4",
		"iso8601-duration": "1.0.6",
		"lodash.debounce": "4.0.8",
		"uuid": "3.1.0"
	},
	"devDependencies": {
		"@kadira/storybook": "2.35.3",
		"addons-linter": "0.20.0",
		"audiosource": "3.0.2",
		"babel": "6.23.0",
		"babel-core": "6.25.0",
		"babel-loader": "7.1.1",
		"babel-preset-env": "1.6.0",
		"babel-preset-es2015": "6.24.1",
		"babel-preset-react": "6.24.1",
		"babelify": "7.3.0",
		"browserify": "14.4.0",
		"classnames": "2.2.5",
		"cross-env": "5.0.0",
		"deep-assign": "2.0.0",
		"deploy-txp": "1.0.7",
		"eslint": "3.19.0",
		"eslint-plugin-mozilla": "0.3.2",
		"eslint-plugin-react": "7.0.1",
		"gl-waveform": "2.4.3",
		"glob": "7.1.2",
		"http-server": "0.10.0",
		"husky": "0.13.4",
		"jpm": "1.3.1",
		"just-extend": "1.1.22",
		"keyboardjs": "2.3.3",
		"react": "15.5.4",
		"react-dom": "15.5.4",
		"react-player": "0.18.0",
		"react-tabs": "0.8.3",
		"react-tooltip": "3.3.0",
		"sortablejs": "1.6.0",
		"storybook-host": "2.0.0-alpha.1",
		"svgify": "0.0.0",
		"svgo-loader": "1.2.1",
		"watchify": "3.9.0",
		"webpack": "3.0.0",
		"webworkify-webpack": "2.0.5"
	}
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _ = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"sdk/l10n\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).get;

module.exports = function (domain, isAudio) {
  var mediaType = isAudio ? _('media_type_audio') : _('media_type_video');

  return JSON.stringify({
    errorMsg: _('error_msg'),
    errorLink: _('error_link'),
    errorYTNotFound: _('error_youtube_not_found'),
    errorYTNotAllowed: _('error_youtube_not_allowed'),
    errorScLimit: _('error_sc_limit'),
    errorScConnection: _('error_sc_connection'),
    errorScTrack: _('error_sc_not_track'),
    errorScStreamable: _('error_sc_not_streamable'),
    errorScRestricted: _('error_sc_restricted'),
    errorVimeoConnection: _('error_vimeo_connection'),
    itemAddedNotification: _('item_added_notification'),
    endOfQueue: _('end_of_queue'),
    loadingMsg: _('loading_view_msg', mediaType, domain),
    confirmMsg: _('confirm_msg'),
    addConfirmMsg: _('add_confirm_msg'),
    playConfirmMsg: _('play_confirm_msg'),
    clear: _('clear'),
    history: _('history'),
    playQueue: _('play_queue'),
    ttMute: _('tooltip_mute'),
    ttPlay: _('tooltip_play'),
    ttPause: _('tooltip_pause'),
    ttClose: _('tooltip_close'),
    ttUnmute: _('tooltip_unmute'),
    ttNext: _('tooltip_next'),
    ttPrev: _('tooltip_previous'),
    ttMinimize: _('tooltip_minimize'),
    ttMaximize: _('tooltip_maximize'),
    ttSendToTab: _('tooltip_send_to_tab'),
    ttSwitchVis: _('tooltip_switch_visual'),
    ttOpenQueue: _('tooltip_open_queue'),
    ttCloseQueue: _('tooltip_close_queue')
  });
};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var rng = __webpack_require__(12);
var bytesToUuid = __webpack_require__(14);

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

// random #'s we need to init node and clockseq
var _seedBytes = rng();

// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
var _nodeId = [
  _seedBytes[0] | 0x01,
  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
];

// Per 4.2.2, randomize (14 bit) clockseq
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

// Previous uuid creation time
var _lastMSecs = 0, _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};

  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection
var rng;

var crypto = global.crypto || global.msCrypto; // for IE 11
if (crypto && crypto.getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef
  rng = function whatwgRNG() {
    crypto.getRandomValues(rnds8);
    return rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

module.exports = rng;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13)))

/***/ }),
/* 13 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 14 */
/***/ (function(module, exports) {

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

module.exports = bytesToUuid;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
  return __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"sdk/util/uuid\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).uuid().number.replace('{', '').replace('}', '');
};

/***/ })
/******/ ]);