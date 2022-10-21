import type { EventsTs } from "./types/Events";
import type { LoggerTs } from "./types/Logger";

export const CHANGE_EVENT = "change";

export function addEventListener(listener: EventsTs.Listener, eventName: string, eventEmitter: EventsTs.Emitter): EventsTs.ListenerRemover {
  const removeCallback = (): void => {
    eventEmitter.removeListener(eventName, listener);
  };
  eventEmitter.on(eventName, listener);
  return removeCallback;
}

export function observableStore(eventEmitter: EventsTs.Emitter, storeLimit: LoggerTs.StoreLimit): LoggerTs.Store {
  const array: LoggerTs.Store = [];
  return new Proxy(array, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: function(target: string[], property: any, value: any) {      
      target[property] = value;
      if (property === "length" && value <= storeLimit) {
        // when logs reach the limit, it first add, then remove it. So, do not emit until it has been removed to avoid event duplication
        eventEmitter.emit(CHANGE_EVENT);
      }
      return true;
    }
  });
}
