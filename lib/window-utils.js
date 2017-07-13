/* global Services */
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import('resource://gre/modules/Console.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

const WM = Cc['@mozilla.org/appshell/window-mediator;1'].
      getService(Ci.nsIWindowMediator);

XPCOMUtils.defineLazyModuleGetter(this, 'Services',
                                  'resource://gre/modules/Services.jsm');
XPCOMUtils.defineLazyModuleGetter(this, 'topify',
                                  'chrome://min-vid-lib/content/topify.js');
XPCOMUtils.defineLazyModuleGetter(this, 'DraggableElement',
                                  'chrome://min-vid-lib/content/dragging-utils.js');

const DEFAULT_DIMENSIONS = {
  height: 180,// prefs.height,
  width: 320, // prefs.width,
  minimizedHeight: 100
};

// require('sdk/simple-prefs').on('width', () => DEFAULT_DIMENSIONS.width = prefs.width);
// require('sdk/simple-prefs').on('height', () => DEFAULT_DIMENSIONS.height = prefs.height);

// TODO: if mvWindow changes, we need to destroy and create the player.
// This must be why we get those dead object errors. Note that mvWindow
// is passed into the DraggableElement constructor, could be a source of
// those errors. Maybe pass a getter instead of a window reference.
let mvWindow;

let commandPollTimer;

// waits till the window is ready, then calls callbacks.
function whenReady(cb) {
  // TODO: instead of setting timeout for each callback, just poll, then call all callbacks.
  if (mvWindow &&
      'AppData' in mvWindow.wrappedJSObject &&
      'YT' in mvWindow.wrappedJSObject &&
      'PlayerState' in mvWindow.wrappedJSObject.YT) return cb();
  setTimeout(() => { whenReady(cb) }, 25);
}

// I can't get frame scripts working, so instead we just set global state directly in react. fml
function send(eventName, msg) {
  whenReady(() => {
    const newData = Object.assign(mvWindow.wrappedJSObject.AppData, msg);
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
const onWindowClosed = (evt) => {
  // Note: we pass null here because minvid window is not of type 'navigator:browser'
  const enumerator = Services.wm.getEnumerator(null);

  let minvidExists = false;
  while (enumerator.hasMoreElements()) {
    const win = enumerator.getNext();
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
  clearTimeout(commandPollTimer);
  commandPollTimer = null;
  // clear the window pointer
  mvWindow = null;
  // TODO: do we need to manually tear down frame scripts?
}

function create(port) {
  if (mvWindow) return mvWindow;

  const window = WM.getMostRecentWindow('navigator:browser');
  // const { x, y } = saveLocation.screenPosition;
  // TODO: pass correct dimensions and location
  const windowArgs = `left=${0},top=${0},chrome,dialog=no,width=${350},height=${280},titlebar=no`;

  // const windowArgs = `left=${x},top=${y},chrome,dialog=no,width=${prefs.width},height=${prefs.height},titlebar=no`;
  // implicit assignment to mvWindow global
  mvWindow = window.open('chrome://bootboy/content/default.html', 'bootboy', windowArgs);
  // once the window's ready, make it always topmost
  whenReady(() => { topify(mvWindow); });
  initCommunication(port);
  whenReady(() => { makeDraggable(); });
  return mvWindow;
}

function initCommunication(port) {
  let errorCount = 0;
  // When the window's ready, start polling for pending commands
  function pollForCommands() {
    let cmd;
    try {
      cmd = mvWindow.wrappedJSObject.pendingCommands;
    } catch (ex) {
      console.error('something happened trying to get pendingCommands: ', ex); // eslint-disable-line no-console
      if (++errorCount > 10) {
        console.error('pendingCommands threw 10 times, giving up');            // eslint-disable-line no-console
        // NOTE: if we can't communicate with the window, we have to close it,
        // since the user cannot.
        closeWindow();
        return;
      }
    }
    commandPollTimer = setTimeout(pollForCommands, 25);
    if (!cmd || !cmd.length) return;
    // We found a command! Erase it, then act on it.
    mvWindow.wrappedJSObject.resetCommands();
    for (let i = 0; i < cmd.length; i++) {
      let parsed;
      try {
        parsed = JSON.parse(cmd[i]);
      } catch (ex) {
        console.error('malformed command sent to addon: ', cmd[i], ex); // eslint-disable-line no-console
        break;
      }
      port.postMessage({
        content: 'msg-from-frontend',
        data, parsed
      });
    }
  }
  whenReady(pollForCommands);
}

function makeDraggable() {
  // Based on WindowDraggingElement usage in popup.xml
  // https://dxr.mozilla.org/mozilla-central/source/toolkit/content/widgets/popup.xml#278-288
  const draghandle = new DraggableElement(mvWindow);
  draghandle.mouseDownCheck = () => { return true; };

  // Update the saved position each time the draggable window is dropped.
  // Listening for 'dragend' events doesn't work, so use 'mouseup' instead.
  mvWindow.document.addEventListener('mouseup', () => {
    // saveLocation.screenPosition = {x: mvWindow.screenX, y: mvWindow.screenY};
  });
}

function destroy(isUnload) {
  closeWindow();
  if (isUnload) {
    Services.obs.removeObserver(onWindowClosed, 'xul-window-destroyed');
    Services.obs.removeObserver(closeRequested, 'browser-lastwindow-close-requested');
    // saveLocation.destroy();
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
  // saveLocation.screenPosition = {x: mvWindow.screenX, y: mvWindow.screenY};
}

const windowUtils = {
  whenReady,
  create,
  destroy,
  getWindow,
  updateWindow,
  // replaces panel.port.emit
  send,
  // replaces panel.show
  show,
  maximize,
  isMinimized,
  closeWindow
};

const EXPORTED_SYMBOLS = ['windowUtils'];
