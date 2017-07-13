export default function (url, cb) {
  fetch(url).then(res => cb(res.status === 200)).catch(err => {
    console.error(`${url} not reachable: ${err}`);
    cb(false);
  });
}
