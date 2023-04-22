/**  Unknown object */
export type UnknownObject = Record<string, unknown>;

export type JSONValue =
  | string
  | number
  | boolean
  | { [key: string]: JSONValue }
  | Array<JSONValue>;
