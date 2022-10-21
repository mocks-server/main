import type { EventsTs } from "./types/Events";

export const CHANGE_EVENT = "change";

export function addEventListener(listener: EventsTs.Listener, eventName: string, eventEmitter: EventsTs.Emitter): EventsTs.ListenerRemover {
  const removeCallback = (): void => {
    eventEmitter.removeListener(eventName, listener);
  };
  eventEmitter.on(eventName, listener);
  return removeCallback;
}
