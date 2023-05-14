import type { AnyObject } from "./Common.types";

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
