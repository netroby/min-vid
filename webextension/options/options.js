function setMax() {
  let width = 0;
  let height = 0;

  if (typeof(window.innerWidth) === 'number') {
    height = window.innerHeight;
    width = window.innerWidth;
  } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
    height = document.documentElement.clientHeight;
    width = document.documentElement.clientWidth;
  } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
    height = document.body.clientHeight;
    width = document.body.clientWidth;
  }

  document.querySelector('#min-vid-width').setAttribute('max', width);
  document.querySelector('#min-vid-height').setAttribute('max', height);
}

document.addEventListener('DOMContentLoaded', setMax);
document.querySelector('form').addEventListener('submit', function() {
  browser.storage.local.set({
    width: document.querySelector('#min-vid-width').value,
    height: document.querySelector('#min-vid-height').value
  });
  e.preventDefault();
});
