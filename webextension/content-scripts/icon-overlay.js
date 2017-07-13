const host = window.location.host;
let availableMetricSent = false;
let overlayCheckInterval;

console.log('HEEEYYY, icon-overlay.js addListener');
browser.runtime.onMessage.addListener(onMessage);

window.strings = {
  playNow: 'Play Now',
  add: 'Add to queue'
};

function onMessage(opts) {
  console.log('HEEEYYY, icon-overlay.js this is the listerne');
  const title = opts.title;
  delete opts.title;
  injectStyle();
  if (title === 'receive-strings') {
    window.strings = strings;
    checkForEmbeds();
    overlayCheckInterval = setInterval(checkForEmbeds, 3000);
  } else if (title === 'detach') {
    clearInterval(overlayCheckInterval);
    Array.from(document.querySelectorAll('.minvid__overlay__wrapper'))
      .forEach(removeOverlay);
  }
}

injectStyle();
checkForEmbeds();
overlayCheckInterval = setInterval(checkForEmbeds, 3000);

function removeOverlay(el) {
  el.classList.remove('minvid__overlay__wrapper');
  const containerEl = el.querySelector('.minvid__overlay__container');
  if (containerEl) containerEl.remove();
}

function checkForEmbeds() {
  ytEmbedChecks();
  vimeoEmbedChecks();
  soundcloudEmbedChecks();
}

function ytEmbedChecks() {
  if (!(host.indexOf('youtube.com') > -1)) return;

  // YouTube Home Page
  const ytHomeContainers = Array.from(document.querySelectorAll('#feed .yt-lockup-thumbnail'));
  if (ytHomeContainers.length) {
    sendMetric('available');
    ytHomeContainers.forEach(ytHomePageHandler);
  }

  const ytSearchContainers = Array.from(document.querySelectorAll('#results .yt-lockup-thumbnail'));
  if (ytSearchContainers.length) {
    ytSearchContainers.forEach(ytHomePageHandler);
  }

  // YouTube Watch Page
  const ytWatchContainer = document.querySelector('.html5-video-player');
  if (ytWatchContainer) {
    sendMetric('available');
    ytWatchElementHandler(ytWatchContainer);
  }

  // YouTube Watch Page related videos
  const ytRelatedContainers = Array.from(document.querySelectorAll('.watch-sidebar-section .thumb-wrapper'));
  if (ytRelatedContainers.length) {
    ytRelatedContainers.forEach(ytHomePageHandler);
  }

  // YouTube Channel Page videos featured section
  const ytChannelFeaturedContainers = Array.from(document.querySelectorAll('#browse-items-primary .lohp-thumb-wrap'));
  if (ytChannelFeaturedContainers.length) {
    sendMetric('available');
    ytChannelFeaturedContainers.forEach(ytHomePageHandler);
  }

  // YouTube Channel Page videos uploads section
  const ytChannelUploadsContainers = Array.from(document.querySelectorAll('#browse-items-primary .yt-lockup-thumbnail'));
  if (ytChannelUploadsContainers.length) {
    sendMetric('available');
    ytChannelUploadsContainers.forEach(ytHomePageHandler);
  }
}

function ytHomePageHandler(el) {
  if (el.classList.contains('minvid__overlay__wrapper')) return;

  const urlEl = el.querySelector('.yt-uix-sessionlink');

  if (!urlEl || !urlEl.getAttribute('href')) return;

  const url = urlEl.getAttribute('href');

  if (!url.startsWith('/watch')) return;

  el.classList.add('minvid__overlay__wrapper');
  const tmp = getTemplate();
  tmp.addEventListener('click', function(ev) {
    evNoop(ev);
    browser.runtime.sendMessage({
      title: 'launch',
      url: 'https://youtube.com' + url,
      domain: 'youtube.com',
      action: getAction(ev)
    });
  });
  el.appendChild(tmp);
}

function ytWatchElementHandler(el) {
  if (el.classList.contains('minvid__overlay__wrapper')) return;

  el.classList.add('minvid__overlay__wrapper');
  const tmp = getTemplate();
  tmp.addEventListener('click', function(ev) {
    evNoop(ev);
    const videoEl = document.querySelector('video');
    const cc = !!(document.querySelector('.ytp-subtitles-button').getAttribute('aria-pressed') !== 'false');
    videoEl.pause();
    closeFullscreen();
    const options = {
      title: 'launch',
      url: window.location.href,
      domain: 'youtube.com',
      time: videoEl.currentTime,
      action: getAction(ev),
      cc
    };
    if (options.action !== 'add-to-queue') {
      options.volume = videoEl.volume;
      options.muted = videoEl.muted;
    }
    browser.runtime.sendMessage(options);
  });
  el.appendChild(tmp);
}

function soundcloudEmbedChecks() {
  if (!(host.indexOf('soundcloud.com') > -1)) return;

  // soundcloud.com/stream
  const soundcloudStreamCovers = Array.from(document.querySelectorAll('.sound__coverArt'));
  if (soundcloudStreamCovers.length) {
    soundcloudStreamCovers.forEach(el => {
      if (el.classList.contains('minvid__overlay__wrapper')) return;

      el.classList.add('minvid__overlay__wrapper');
      const tmp = getTemplate();
      tmp.addEventListener('click', function(ev) {
        evNoop(ev);
        browser.runtime.sendMessage({
          title: 'launch',
          url: 'https://soundcloud.com' + el.getAttribute('href'),
          domain: 'soundcloud.com',
          action: getAction(ev)
        });
      });
      el.appendChild(tmp);
    });
    sendMetric('available');
  }

  // souncloud.com/artist/track
  const soundcloudTrackCover = document.querySelector('.fullHero__artwork');
  if (soundcloudTrackCover) {
    if (soundcloudTrackCover.classList.contains('minvid__overlay__wrapper')) return;
    soundcloudTrackCover.classList.add('minvid__overlay__wrapper');
    const tmp = getTemplate();
    tmp.addEventListener('click', function(ev) {
      evNoop(ev);
      browser.runtime.sendMessage({
        title: 'launch',
        url: window.location.href,
        domain: 'soundcloud.com',
        action: getAction(ev)
      });
    }, true);
    soundcloudTrackCover.appendChild(tmp);
    sendMetric('available');
  }
}


function vimeoEmbedChecks() {
  if (!(host.indexOf('vimeo.com') > -1)) return;

  // VIMEO LOGGED-OUT HOME PAGE
  const vimeoDefaultHomeContainers = Array.from(document.querySelectorAll('.iris_video-vital__overlay'));
  if (vimeoDefaultHomeContainers.length) {
    vimeoDefaultHomeContainers.forEach(el => {
      if (el.classList.contains('minvid__overlay__wrapper')) return;

      el.classList.add('minvid__overlay__wrapper');
      const tmp = getTemplate();
      tmp.addEventListener('click', function(ev) {
        evNoop(ev);
        browser.runtime.sendMessage({
          title: 'launch',
          url: 'https://vimeo.com' + el.getAttribute('href'),
          domain: 'vimeo.com',
          action: getAction(ev)
        });
      });
      el.appendChild(tmp);
    });
    sendMetric('available');
  }

  // VIMEO LOGGED-IN HOME PAGE
  const vimeoHomeContainers = Array.from(document.querySelectorAll('.player_wrapper'));
  if (vimeoHomeContainers.length) {
    vimeoHomeContainers.forEach(el => {
      if (el.classList.contains('minvid__overlay__wrapper')) return;

      el.classList.add('minvid__overlay__wrapper');
      const tmp = getTemplate();
      tmp.addEventListener('click', function(ev) {
        evNoop(ev);
        const fauxEl = el.querySelector('.faux_player');
        if (fauxEl) {
          browser.runtime.sendMessage({
            title: 'launch',
            url: 'https://vimeo.com/' + fauxEl.getAttribute('data-clip-id'),
            domain: 'vimeo.com',
            action: getAction(ev)
          });
        } else console.error('Error: failed to locate vimeo url'); // eslint-disable-line no-console
      });
      el.appendChild(tmp);
    });
    sendMetric('available');
  }

  // VIMEO DETAIL PAGE
  const vimeoDetailContainer = document.querySelector('.player_container');
  if (vimeoDetailContainer) {
    if (vimeoDetailContainer.classList.contains('minvid__overlay__wrapper')) return;
    vimeoDetailContainer.classList.add('minvid__overlay__wrapper');
    const videoEl = vimeoDetailContainer.querySelector('video');
    const tmp = getTemplate();
    tmp.addEventListener('mouseup', evNoop);
    tmp.addEventListener('click', function(ev) {
      evNoop(ev);
      videoEl.pause();
      const options = {
        title: 'launch',
        url: window.location.href,
        domain: 'vimeo.com',
        action: getAction(ev)
      };

      if (options.action !== 'add-to-queue') {
        options.volume = videoEl.volume;
        options.muted = videoEl.muted;
      }
      browser.runtime.sendMessage(options);
    }, true);
    vimeoDetailContainer.appendChild(tmp);
    sendMetric('available');
  }
}

function getAction(ev) {
  return (ev.target.id === 'minvid__overlay__icon__play') ? 'play' : 'add-to-queue';
}

// General Helpers
function getTemplate() {
  const containerEl = document.createElement('div');
  const playIconEl = document.createElement('div');
  const addIconEl = document.createElement('div');

  containerEl.className = 'minvid__overlay__container';
  playIconEl.className = 'minvid__overlay__icon';
  playIconEl.id = 'minvid__overlay__icon__play';
  playIconEl.title = window.strings.playNow;
  addIconEl.className = 'minvid__overlay__icon';
  addIconEl.id = 'minvid__overlay__icon__add';
  addIconEl.title = window.strings.add;
  containerEl.appendChild(playIconEl);
  containerEl.appendChild(addIconEl);

  return containerEl;
}

function sendMetric(method) {
  if (availableMetricSent) return;
  if (method === 'available') availableMetricSent = true;
  browser.runtime.sendMessage({
    title: 'metric',
    object: 'overlay_icon',
    method: method
  });
}

function evNoop(ev) {
  ev.preventDefault();
  ev.stopImmediatePropagation();
}

function closeFullscreen() {
  if (document.mozFullScreenEnabled) {
    document.mozCancelFullScreen();
  }
}

function injectStyle() {
  const css = `
.minvid__overlay__container {
    align-items: center;
    background-color: rgba(0,0,0,0.8);
    opacity: 0;
    border-radius: 0 0 4px 4px;
    height: 100%;
    justify-content: center;
    left: 4%;
    max-height: 80px;
    max-width: 36px;
    padding: 2px 2px 4px;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 999999;
}

.minvid__overlay__container:hover {
    background: rgba(0,0,0,0.9);
}

.minvid__overlay__icon {
    display: block;
    cursor: pointer;
    height: 40%;
    opacity: 0.7;
    width: 100%;
}
#minvid__overlay__icon__play {
    background: url('img/overlay-player-icon.svg') no-repeat;
    background-position: center bottom;
    background-size: 32px auto;
}

#minvid__overlay__icon__add {
    background: url('img/add.svg') no-repeat;
    background-position: center bottom;
    background-size: 25px auto;
    margin-top: 5px;
}

.minvid__overlay__wrapper:hover .minvid__overlay__container {
    opacity: 1;
    /*background-color: rgba(0, 0, 0, .8);*/
    /*animation-name: fade;
    animation-duration: 4s;
    animation-iteration-count: initial;
    animation-fill-mode: forwards;*/
}

#minvid__overlay__icon__play:hover,
#minvid__overlay__icon__add:hover {
    opacity: 1;
}

@keyframes fade {
  0%   {opacity: 0}
  5%, 80% {opacity: 1}
  100% {opacity: 0}
}
  `;

  let head = document.head;
  let style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}
