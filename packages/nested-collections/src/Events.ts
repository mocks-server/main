import type { EventsListener, EventsEmitter, EventsListenerRemover } from "./Events.types";

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
