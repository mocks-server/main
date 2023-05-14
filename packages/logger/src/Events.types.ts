/* eslint-disable @typescript-eslint/no-namespace */
import type EventEmitter from "events";

/** Function to execute when the event is triggered */
export interface EventsListener {
  /**
   * Function executed when the event is triggered
   */
  (): void;
}

/** Function that removes the event listener */
export interface EventsListenerRemover {
  /**
   * Removes the event listener
   * @example removeEventListener();
   */
  (): void;
}

export type EventsEmitter = EventEmitter;
