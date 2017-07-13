export default class Location {
  constructor() {
    this._screenPosition = browser.storage.local.get('screenPosition') || {
      x: 10,
      y: 10
    };
  }
  get screenPosition() {
    return _screenPosition;
  }

  set screenPosition(pos) {
    _screenPosition = pos;
    browser.storage.local.set({'screenPosition', pos})
  }

  // Called on uninstall to clear out storage
  destroy() {
    browser.storage.local.remove('screenPosition');
  }
}
