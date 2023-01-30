import type { AnyObject } from "./CommonTypes";

export interface ValueParser {
  (value: unknown): unknown;
}

export interface StringObjectParser {
  (value: string): AnyObject | string;
}

export interface BooleanParser {
  (value: string): boolean;
}

export interface ArrayValueParser {
  (value: unknown[]): unknown[];
}
