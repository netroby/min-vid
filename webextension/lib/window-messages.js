const port = browser.runtime.connect({name: "connection-to-legacy"});

function send(data) {
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

export default {send, close}
