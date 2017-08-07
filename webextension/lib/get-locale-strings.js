const _ = browser.i18n.getMessage;

// const _ = function() {
//   try {
//     browser.i18n.getMessage.apply(this, arguments);
//   } catch(err) {
//     console.log('my err', arguments);
//   }
// };

export default function() {
  // domain, isAudio
  // console.log('isAudio type:', isAudio, _('media_type_video'), _('media_type_audio'));

  // TODO: figure out why this isn't being set!??!
  // const mediaType = isAudio ? _('media_type_audio') : _('media_type_audio');

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
    itemAddedNotification: _('item_added_notification'),
    endOfQueue: _('end_of_queue'),
    loadingMsg: 'This is DUMB',
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
}
