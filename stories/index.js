import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { host } from 'storybook-host';

import App from '../frontend/components/app-view';
import '../chrome/content/panel.css';

window.pendingCommands = [];

import l10nStrings from '../webextension/_locales/en_US/messages.json';

import { DEFAULT_PROPS } from './client-lib/app-data';

const props = window.appData = Object.assign(DEFAULT_PROPS, {
  confirmContent: {
    action: 'play',
    playlistTitle: 'Rebeccas bar playlist boi whatever omg',
    videoTitle: 'The Coneheads - Hack, Hack, Hack (Ver. 2)'
  },
  queue: [
    {
      title: 'Sadist | Blood Song CS [full]',
      url: 'https://www.youtube.com/watch?v=p8--ADjO44Q',
      domain: 'youtube.com',
      preview: 'https://img.youtube.com/vi/p8--ADjO44Q/0.jpg',
      time: '0'
    },
  ],
  history: [{
    title: 'Big Black - Songs About Fricking (1987) [Full Album]',
    url: 'https://www.youtube.com/watch?v=s0xCAZLE7c8',
    domain: 'youtube.com',
    preview: 'https://img.youtube.com/vi/s0xCAZLE7c8/0.jpg',
    time: '1138'
  }]
});

// populate locale strings
Object.keys(l10nStrings).forEach(k => {
  window.appData.strings[k] = l10nStrings[k].message;
});

storiesOf('Min Vid panel', module)
  .addDecorator(host({
    width: 400, height: 260, border: '1px solid #ccc'
  }))

  .add('App view loading', () => (
      <App {...props}/>
  ))

  .add('App view loaded', () => (
      <App {...Object.assign({}, props, {loaded: true})}/>
  ))

  .add('App view playing', () => (
      <App {...Object.assign({}, props, {loaded: true, playing: true})}/>
  ))

  .add('App view error', () => (
      <App {...Object.assign({}, props, {error: true})}/>
  ))

  .add('App view replay', () => (
      <App {...Object.assign({}, props, {error: false, exited: true, loaded: true
                                         // , queue: []
                                        })}/>
  ))

  .add('App view replay queued', () => (
      <App {...Object.assign({}, props, {error: false, exited: true, loaded: true,
                                         secondsLeft: 3})}/>
  ))

  .add('App view load audio', () => (
      <App {...Object.assign({}, props,
                             {url: 'http://davejustice.com/assets/themes/twitter/chains.mp3',
                              loaded: true,
                              player: 'audio',
                              playing: false})} />
  ))

  .add('Confirm View', () => (
      <App {...Object.assign({}, props,
                             {loaded: true,
                              confirm: true,
                              playing: false})} />
  ))

  .add('App view load audio playing', () => (
      <App {...Object.assign({}, props,
                             {url: 'http://davejustice.com/assets/themes/twitter/chains.mp3',
                              loaded: true,
                              player: 'audio',
                              playing: true})} />
  ))

  .add('App view queue', () => (
      <App {...Object.assign({}, props, {loaded: true,
                                         queueShowing: true})}/>
  ))

  .add('Exited view', () => (
      <App {...Object.assign({}, props, {loaded: true,
                                         exited: true
                                        })}/>
  ))

  .add('Minimized', () => (
      <App {...Object.assign({}, props, {loaded: true,
                                         minimized: true,
                                         height: 40
                                        })}/>
  ))
