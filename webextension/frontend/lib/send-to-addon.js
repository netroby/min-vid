export function sendToAddon(obj) {
  window.pendingCommands.push(JSON.stringify(obj));
}
