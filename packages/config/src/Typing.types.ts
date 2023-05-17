import type { UnknownObject } from "./Common.types";

export interface ValueParser {
  (value: unknown): unknown;
}

export interface StringObjectParser {
  (value: string): UnknownObject | string;
}

export interface BooleanParser {
  (value: string): boolean;
}

export interface ArrayValueParser {
  (value: unknown[]): unknown[];
}
