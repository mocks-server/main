import type EventEmitter from "events";

export const CHANGE = "change";

import type { EventListener, EventListenerRemover } from "./types/Events";

export function addEventListener(listener: EventListener, eventName: string, eventEmitter: EventEmitter): EventListenerRemover {
  const removeCallback = (): void => {
    eventEmitter.removeListener(eventName, listener);
  };
  eventEmitter.on(eventName, listener);
  return removeCallback;
}
