/** Function to execute when the event is triggered */
export interface EventListener<DataType> {
  /**
   * Function executed when the event is triggered
   */
  (data: DataType): void;
}

/** Function that removes the event listener */
export interface EventListenerRemover {
  /**
   * Removes the event listener
   * @example removeEventListener();
   */
  (): void;
}
