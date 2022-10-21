/* eslint-disable @typescript-eslint/no-namespace */
import type EventEmitter from "events";

export namespace EventsTs {
  /** Function to execute when the event is triggered */
  export interface Listener {
    /**
    * Function executed when the event is triggered
    */
    (): void
  }

  /** Function that removes the event listener */
  export interface ListenerRemover {
    /**
    * Removes the event listener
    * @example removeEventListener();
    */
    (): void
  }

  export type Emitter = EventEmitter;
}
