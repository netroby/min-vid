import sendToAddon from './send-to-addon';

export function sendMetricsEvent(object, method, domain) {
  sendToAddon({
    action: 'metrics-event',
    payload: {
      object,
      method,
      domain
    }
  });
}
