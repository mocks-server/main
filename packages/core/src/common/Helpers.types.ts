/** Options for the resolveWhenConditionPass function */
export interface ResolveWhenConditionPassOptions {
  /** Interval to check the condition */
  interval?: number;
  /** Time to wait before rejecting the promise */
  timeout?: number;
}
