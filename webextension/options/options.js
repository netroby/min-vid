const DEFAULT_WIDTH = browser.runtime.getManifest().config['DEFAULT_WIDTH'];
const DEFAULT_HEIGHT = browser.runtime.getManifest().config['DEFAULT_HEIGHT'];

function setConstraints() {
  document.querySelector('#min-vid-width').setAttribute('min', DEFAULT_WIDTH);
  document.querySelector('#min-vid-height').setAttribute('min', DEFAULT_HEIGHT);
}

document.addEventListener('DOMContentLoaded', setConstraints);
document.querySelector('form').addEventListener('submit', function(ev) {
  ev.preventDefault();
  browser.storage.local.set({
    width: document.querySelector('#min-vid-width').value,
    height: document.querySelector('#min-vid-height').value
  });
});
