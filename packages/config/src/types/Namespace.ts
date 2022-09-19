import type { Option } from "./Option";
import type { AnyObject, ObjectWithName } from "./Common";

export interface Namespace extends ObjectWithName {
  options: Option[]
  namespaces: Namespaces
  parents: Namespaces,
  value: AnyObject,
}

export type Namespaces = Namespace[]