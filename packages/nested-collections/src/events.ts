import type { EventsListener, EventsEmitter, EventsListenerRemover } from "./EventsTypes";

export const CHANGE_EVENT = "change";

export function addEventListener(
  listener: EventsListener,
  eventName: string,
  eventEmitter: EventsEmitter
): EventsListenerRemover {
  const removeCallback = (): void => {
    eventEmitter.removeListener(eventName, listener);
  };
  eventEmitter.on(eventName, listener);
  return removeCallback;
}
