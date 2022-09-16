export const CHANGE = "change";

export function addEventListener(listener, eventName, eventEmitter) {
  const removeCallback = () => {
    eventEmitter.removeListener(eventName, listener);
  };
  eventEmitter.on(eventName, listener);
  return removeCallback;
}
