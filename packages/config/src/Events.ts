import type EventEmitter from "events";

export const CHANGE = "change";

import type { EventListener, EventListenerRemover } from "./Events.types";

export function addEventListener<DataType>(
  listener: EventListener<DataType>,
  eventName: string,
  eventEmitter: EventEmitter
): EventListenerRemover {
  const removeCallback = (): void => {
    eventEmitter.removeListener(eventName, listener);
  };
  eventEmitter.on(eventName, listener);
  return removeCallback;
}
