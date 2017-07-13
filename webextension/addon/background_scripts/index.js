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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _querystring = __webpack_require__(1);

var _iso8601Duration = __webpack_require__(10);

var apiKey = browser.runtime.getManifest().config['YOUTUBE_DATA_API_KEY'];

console.log('yt api key', apiKey);

var headers = new Headers({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Content-Length': content.length.toString()
});

exports.default = {
  getVideo: getVideo,
  getPlaylist: getPlaylist,
  getPlaylistMeta: getPlaylistMeta
};


function getVideo(opts, cb) {
  var query = (0, _querystring.stringify)({
    key: apiKey,
    id: opts.videoId,
    part: 'snippet,contentDetails,status'
  });

  var url = 'https://www.googleapis.com/youtube/v3/videos?' + query;

  fetch(url, { method: 'GET',
    mode: 'cors',
    headers: headers,
    cache: 'default' }).then(function (res) {
    return res.json().then(function (json) {
      console.log('my result json', json);
      var result = json.items;
      var item = {
        cc: opts.cc,
        videoId: opts.videoId,
        url: 'https://youtube.com/watch?v=' + opts.videoId,
        domain: 'youtube.com',
        currentTime: opts.time || 0,
        error: false,
        title: result.length ? result[0].snippet.title : '',
        duration: result.length ? (0, _iso8601Duration.toSeconds)((0, _iso8601Duration.parse)(result[0].contentDetails.duration)) : 0,
        preview: 'https://img.youtube.com/vi/' + opts.videoId + '/0.jpg',
        live: result.length ? Boolean(result[0].snippet.liveBroadcastContent === 'live') : false
      };

      var url = 'https://www.youtube.com/get_video_info?video_id=' + opts.videoId;
      fetch(url, { method: 'GET',
        mode: 'cors',
        headers: headers,
        cache: 'default' }).then(function (res) {
        return res.text().then(function (text) {
          var result = (0, _querystring.parse)(text);
          if (result.status === 'fail') {
            if (result.reason.indexOf('restricted')) item.error = 'error_youtube_not_allowed';else item.error = 'error_youtube_not_found';
          }

          cb(item);
        });
      });
    });
  });
}

function getPlaylistMeta(opts, cb) {
  var query = (0, _querystring.stringify)({
    key: apiKey,
    part: 'snippet',
    id: opts.playlistId
  });

  var url = 'https://www.googleapis.com/youtube/v3/playlists?' + query;
  fetch(url, { method: 'GET',
    mode: 'cors',
    headers: headers,
    cache: 'default' }).then(function (res) {
    return res.json().then(function (json) {
      var result = json.items[0].snippet;

      query = (0, _querystring.parse)(query);
      query.id = opts.videoId;
      query = (0, _querystring.stringify)(query);

      var url = 'https://www.googleapis.com/youtube/v3/videos?' + query;
      fetch(url, { method: 'GET',
        mode: 'cors',
        headers: headers,
        cache: 'default' }).then(function (res) {
        return res.json().then(function (json) {
          cb(Object.assign(opts, {
            playlistTitle: result.title,
            videoTitle: json.items[0].snippet.title
          }));
        });
      });
    });
  });
}

function getPlaylist(opts, cb, passedPlaylist) {
  var query = (0, _querystring.stringify)({
    key: apiKey,
    part: 'snippet',
    playlistId: opts.playlistId,
    maxResults: 50,
    pageToken: opts.pageToken || ''
  });

  var url = 'https://www.googleapis.com/youtube/v3/playlistItems?' + query;
  fetch(url, { method: 'GET',
    mode: 'cors',
    headers: headers,
    cache: 'default' }).then(function (res) {
    return res.json().then(function (json) {
      var result = json;
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
          return shouldFetch ? getPlaylist(Object.assign((0, _querystring.parse)(query), { pageToken: result.nextPageToken }), cb, playlist) : cb(playlist);
        });
      }
    });
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.stringify = stringify;


function parse(qs) {
  var result = {};
  console.log('q s    :', qs);
  var idx = qs.indexOf('?');
  qs.substr(idx + 1).split('&').map(function (a) {
    return a.split('=');
  }).map(function (a) {
    return result[a[0]] = encodeURI(a[1]);
  });
  return result;
}

function stringify(params) {
  return Object.keys(params).map(function (k) {
    return k + '=' + params[k];
  }).join('&');
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sendMetricsData;
var storage = browser.storage.local;
var version = browser.runtime.getManifest().version;
var trackingId = browser.runtime.getManifest().config['GA_TRACKING_ID'];
var GA_URL = 'https://ssl.google-analytics.com/collect';

function sendMetricsData(o, win) {
  // Note: window ref is optional, used to avoid circular refs with window-utils.js.
  win = win; //  || require('./window-utils.js').getWindow();

  if (!win || win.incognito) return;

  // TODO: WINDOW UTILS GET COORDS will replace this
  // const coords = win.document.documentElement.getBoundingClientRect();

  // NOTE: this packet follows a predefined data format and cannot be changed
  //       without notifying the data team. See docs/metrics.md for more.
  var formEncodedData = Object.keys({
    v: 1,
    aip: 1, // anonymize user IP addresses (#24 mozilla/testpilot-metrics)
    an: browser.runtime.id,
    av: version,
    tid: trackingId,
    cid: storage.clientUUID,
    t: 'event',
    ec: o.category,
    ea: o.method,
    // cd2: coords.left, // video_x
    // cd3: coords.top, // video_y
    // cd4: coords.width,
    // cd5: coords.height,
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _getRandomId = __webpack_require__(4);

var _getRandomId2 = _interopRequireDefault(_getRandomId);

var _launchVideo = __webpack_require__(5);

var _launchVideo2 = _interopRequireDefault(_launchVideo);

var _getVimeoUrl = __webpack_require__(15);

var _getVimeoUrl2 = _interopRequireDefault(_getVimeoUrl);

var _youtubeHelpers = __webpack_require__(0);

var _youtubeHelpers2 = _interopRequireDefault(_youtubeHelpers);

var _sendMetricsData = __webpack_require__(2);

var _sendMetricsData2 = _interopRequireDefault(_sendMetricsData);

var _getSoundcloudUrl = __webpack_require__(16);

var _getSoundcloudUrl2 = _interopRequireDefault(_getSoundcloudUrl);

var _messageHandler = __webpack_require__(17);

var _messageHandler2 = _interopRequireDefault(_messageHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!browser.storage.local.clientUUID) {
  browser.storage.local.set({ 'clientUUID': (0, _getRandomId2.default)() });
} /*
   * This Source Code is subject to the terms of the Mozilla Public License
   * version 2.0 (the 'License'). You can obtain a copy of the License at
   * http://mozilla.org/MPL/2.0/.
   */

// set our unique identifier for metrics
// (needs to be set before send-metrics-data is loaded)


if (!browser.storage.local.queue) browser.storage.local.queue = [];
if (!browser.storage.local.history) browser.storage.local.history = [];

// import windowUtils from './lib/window-utils';

// import contextMenuHandlers from './lib/context-menu-handlers';
//   contextMenuHandlers.init();


var port = browser.runtime.connect({ name: "connection-to-legacy" });

console.log('HEEEYYY, background.js addListener');
port.onMessage.addListener(function (msg) {
  console.log('HEEEYYY, background.js this is the listener');
  if (msg.content === 'msg-from-frontend') (0, _messageHandler2.default)(msg.data, port);
});
console.log('HEEEYYY, background.js second addListener');

browser.runtime.onMessage.addListener(onMessage);

function onMessage(opts) {
  var title = opts.title;
  delete opts.title;
  console.log('onMessage: ', opts);

  if (title === 'launch') {
    if (opts.domain.indexOf('youtube.com') > -1) {
      opts.getUrlFn = _youtubeHelpers2.default.getVideo;
    } else if (opts.domain.indexOf('vimeo.com') > -1) {
      opts.getUrlFn = _getVimeoUrl2.default;
    } else if (opts.domain.indexOf('soundcloud.com') > -1) {
      opts.getUrlFn = _getSoundcloudUrl2.default;
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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript#2117523
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = launchVideo;

var _querystring = __webpack_require__(1);

var _getVideoId = __webpack_require__(6);

var _getVideoId2 = _interopRequireDefault(_getVideoId);

var _isAudio = __webpack_require__(8);

var _isAudio2 = _interopRequireDefault(_isAudio);

var _windowMessages = __webpack_require__(9);

var _youtubeHelpers = __webpack_require__(0);

var _youtubeHelpers2 = _interopRequireDefault(_youtubeHelpers);

var _sendMetricsData = __webpack_require__(2);

var _sendMetricsData2 = _interopRequireDefault(_sendMetricsData);

var _v = __webpack_require__(11);

var _v2 = _interopRequireDefault(_v);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storage = browser.storage.local;
// import getLocaleStrings from './get-locale-strings';

function isAudio(url) {
  return (0, _isAudio2.default)(url) || new RegExp('^(https?:)?//soundcloud.com\/').exec(url);
}

var fauxLocales = {
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
function launchVideo(opts) {
  var getUrlFn = opts.getUrlFn;
  var action = opts.action;

  delete opts.getUrlFn;
  delete opts.action;

  if (action === 'play') opts.playing = true;

  console.log('launch locales', opts.domain, isAudio(opts.url));

  (0, _windowMessages.send)(opts = Object.assign({
    id: (0, _v2.default)(),
    width: storage.width,
    height: storage.height,
    videoId: (0, _getVideoId2.default)(opts.url) ? (0, _getVideoId2.default)(opts.url).id : '',
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
      var parsed = (0, _querystring.parse)(opts.url.substr(opts.url.indexOf('?') + 1));
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
        // TODO: figure out isMINIMIZED
        // if (windowUtils.isMinimized()) windowUtils.maximize();
        (0, _windowMessages.send)(Object.assign(opts, {
          confirm: true,
          error: false,
          minimized: false,
          queue: JSON.stringify(storage.queue),
          history: JSON.stringify(storage.history)
        }));
      });
    } else {
      // only playlist handling
      var _parsed = (0, _querystring.parse)(opts.url.substr(opts.url.indexOf('?') + 1));
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
        (0, _windowMessages.send)(response);
      });
    }
  } else {
    // fetch the media source and set it
    getUrlFn(opts, function (item) {
      if (item.error) console.error('LaunchVideo failed to get the streamUrl: ', item.error); // eslint-disable-line no-console

      if (isAudio(item.url)) item.player = 'audio';

      if (action === 'play') storage.queue.unshift(item);else storage.queue.push(item);

      var videoOptions = {
        trackAdded: action === 'add-to-queue' && storage.queue.length > 1,
        error: item.error ? item.error : false,
        queue: JSON.stringify(storage.queue),
        history: JSON.stringify(storage.history)
      };

      if (action === 'play') videoOptions.playing = true;
      (0, _windowMessages.send)(videoOptions);
    });
  }
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
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.send = send;
exports.close = close;

var port = browser.runtime.connect({ name: "connection-to-legacy" });

function send(data) {
  console.log('window-messages:send:', data);
  port.postMessage({
    content: 'window:send',
    data: data
  });
}

// function getCoords() {}

function close() {
  port.postMessage({
    content: 'window:close'
  });
}

/***/ }),
/* 10 */
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


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (opts, cb) {
  var url = 'https://player.vimeo.com/video/' + opts.videoId + '/config';
  fetch(url).then(function (res) {
    if (!res.json) {
      cb('errorVimeoConnection');
      return;
    }

    var item = {
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
  }).catch(function (err) {
    console.error('Vimeo request via fetch failed: ' + err);
    item.error = 'errorMsg';
    cb(item);
  });
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getSoundcloudUrl;
var clientId = browser.runtime.getManifest().config['SOUNDCLOUD_CLIENT_ID'];

function getSoundcloudUrl(opts, cb) {
  console.log('optssss sc:', opts, cb);
  var url = 'https://api.soundcloud.com/resolve.json?client_id=' + clientId + '&url=' + opts.url;

  fetch(url, { method: 'GET',
    mode: 'cors',
    cache: 'default' }).then(function (res) {
    var item = {
      url: opts.url,
      title: '',
      preview: '',
      duration: 0,
      launchUrl: opts.url,
      domain: 'soundcloud.com',
      error: false
    };

    res.json().then(function (json) {
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
  }).catch(function (err) {
    console.error('Soundcloud request via fetch failed: ' + err);
    item.error = 'errorMsg';
    cb(item);
  });
}

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (msg) {
  var title = msg.action;
  var opts = msg;
  if (title === 'send-to-tab') {
    var pageUrl = opts.launchUrl ? opts.launchUrl : getPageUrl(opts.domain, opts.id, opts.time);
    if (pageUrl) openTab(pageUrl);else {
      console.error('could not parse page url for ', opts); // eslint-disable-line no-console
      send({ error: 'Error loading video from ' + opts.domain });
    }
    send({ domain: '', src: '' });
    closeWindow();
  } else if (title === 'close') {
    store.history.unshift(store.queue.shift());
    send('set-video', { domain: '', src: '' });
    closeWindow();
  } else if (title === 'minimize') {
    mvWindow.resizeTo(DEFAULT_DIMENSIONS.width, DEFAULT_DIMENSIONS.minimizedHeight);
    mvWindow.moveBy(0, DEFAULT_DIMENSIONS.height - DEFAULT_DIMENSIONS.minimizedHeight);
    saveLocation.screenPosition = { x: mvWindow.screenX, y: mvWindow.screenY };
  } else if (title === 'maximize') {
    maximize();
  } else if (title === 'metrics-event') {
    // Note: sending in the window ref to avoid circular imports.
    sendMetricsData(opts.payload, mvWindow);
  } else if (title === 'track-ended') {
    store.history.unshift(store.queue.shift());
    if (store.queue.length) {
      send({
        playing: true,
        queue: JSON.stringify(store.queue),
        history: JSON.stringify(store.history)
      });
    }
  } else if (title === 'track-removed') {
    if (opts.isHistory) store.history.splice(opts.index, 1);else store.queue.splice(opts.index, 1);

    if (store.queue.length) {
      send({
        queue: JSON.stringify(store.queue),
        history: JSON.stringify(store.history)
      });
    } else {
      send({ domain: '', src: '' });
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
    send({ queue: JSON.stringify(store.queue) });
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
      if (opts.isHistory) opts.index++;else opts.index--;
    }

    if (opts.isHistory) {
      store.queue.unshift(store.history[opts.index]);
    } else store.queue.unshift(store.queue.splice(opts.index, 1)[0]);

    sendMetricsData({
      object: 'queue_view',
      method: 'track-expedited',
      domain: store.queue[0].domain
    }, mvWindow);

    send({
      playing: true,
      queue: JSON.stringify(store.queue),
      history: JSON.stringify(store.history)
    });
  } else if (title === 'track-reordered') {
    var newQueue = store.queue.slice();
    newQueue.splice(opts.newIndex, 0, newQueue.splice(opts.oldIndex, 1)[0]);
    store.queue = newQueue;
    sendMetricsData({
      object: 'queue_view',
      method: 'track-reordered',
      domain: store.queue[0].domain
    }, mvWindow);
    send({ queue: JSON.stringify(store.queue) });
  } else if (title === 'play-from-history') {
    store.queue.splice(0);
    store.queue = store.history.slice(0, 10);
    send({
      playing: true,
      exited: false,
      queue: JSON.stringify(store.queue),
      history: JSON.stringify(store.history)
    });
  } else if (title === 'clear') {
    sendMetricsData({
      object: 'queue_view',
      method: "clear:" + opts.choice,
      domain: ''
    }, mvWindow);
    if (opts.choice === 'history') {
      store.history = [];
      send({ history: JSON.stringify(store.history) });
    } else {
      store.queue = [];
      send({ domain: '', src: '', queue: JSON.stringify(store.queue) });
      closeWindow();
    }
  } else if (title === 'confirm') {
    if (opts.choice === 'playlist') {
      _youtubeHelpers2.default.getPlaylist(opts, function (playlist) {

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

        var response = {
          trackAdded: opts.playerMethod === 'add-to-queue' && store.queue.length > 1,
          error: false,
          queue: JSON.stringify(store.queue),
          history: JSON.stringify(store.history),
          confirm: false,
          confirmContent: '{}'
        };

        if (opts.playerMethod === 'play') response.playing = true;
        send(response);
      });
    } else if (opts.choice === 'cancel') {
      if (!store.queue.length) {
        send({
          domain: '',
          src: '',
          confirm: false,
          confirmContent: '{}'
        });
        closeWindow();
      } else {
        send({
          confirm: false,
          confirmContent: '{}',
          queue: JSON.stringify(store.queue),
          history: JSON.stringify(store.history)
        });
      }
    } else {
      _youtubeHelpers2.default.getVideo(opts, function (video) {
        if (opts.playerMethod === 'play') {
          // if the 'play-now' option was selected, and min vid has a
          // track playing we need to move that item to history before
          // front loading the video into the queue.
          if (opts.moveIndexZero) store.history.unshift(store.queue.shift());
          store.queue.unshift(video);
        } else store.queue.push(video);
        var response = {
          trackAdded: opts.playerMethod === 'add-to-queue' && store.queue.length > 1,
          error: false,
          queue: JSON.stringify(store.queue),
          history: JSON.stringify(store.history),
          confirm: false,
          confirmContent: '{}'
        };

        if (opts.playerMethod === 'play') response.playing = true;

        send(response);
      });
    }
  }
};

var _youtubeHelpers = __webpack_require__(0);

var _youtubeHelpers2 = _interopRequireDefault(_youtubeHelpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = browser.runtime.connect({ name: "connection-to-legacy" });

port.onMessage.addListener(function (message) {
  console.log("Message from legacy add-on: " + message.content);
});


function getPageUrl(domain, id, time) {
  var url = void 0;
  if (domain.indexOf('youtube') > -1) {
    url = "https://youtube.com/watch?v=" + id + "&t=" + Math.floor(time);
  } else if (domain.indexOf('vimeo') > -1) {
    var min = Math.floor(time / 60);
    var sec = Math.floor(time - min * 60);
    url = "https://vimeo.com/" + id + "#t=" + min + "m" + sec + "s";
  }

  return url;
}

/***/ })
/******/ ]);