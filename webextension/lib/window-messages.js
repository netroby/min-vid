export {send, close}
const port = browser.runtime.connect({name: "connection-to-legacy"});

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
