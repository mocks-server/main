import type EventEmitter from "events";

export const CHANGE = "change";

export interface EventListener {
  (): void
}

export function addEventListener(listener: EventListener, eventName: string, eventEmitter: EventEmitter) {
  const removeCallback = (): void => {
    eventEmitter.removeListener(eventName, listener);
  };
  eventEmitter.on(eventName, listener);
  return removeCallback;
}
