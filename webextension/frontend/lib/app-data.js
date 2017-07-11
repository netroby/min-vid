import React from 'react';
import ReactDOM from 'react-dom';
import deepAssign from 'deep-assign';
import AppView from '../components/app-view';

window.AppData = new Proxy({
  minimized: false,
  loaded: false,
  error: false, // revisit
  muted: false,
  currentTime: 0,
  exited: false, // maybe
  duration: 0,
  playing: false,
  keyShortcutsEnabled: true,
  volume: 0.5,
  strings: {},
  visual: 'time', // revisit
  confirm: false,
  confirmContent: {},
  queue: [],
  history: [],
  set: (newValues) => {
    window.AppData = deepAssign(window.AppData, newValues);
  },
  reset: () => { /* reset here */ }
}, {
  set(obj, prop, value) {
    if (prop === 'strings' || prop === 'queue' || prop === 'history' || prop === 'confirmContent') {
      try {
        obj[prop] = JSON.parse(value);
      } catch (ex) {
        window.console.error('Unable to parse l10n strings: ', ex, prop, value);
      }
    } else obj[prop] = value;
    renderApp();
    return true;
  }
});

function renderApp() {
  ReactDOM.render(React.createElement(AppView, window.AppData),
                  document.getElementById('container'));
}

// todo figure out how to export this object (if neccessary)
const AppData = window.AppData;
export AppData;
