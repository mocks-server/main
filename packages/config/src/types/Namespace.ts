import type { Option } from "./Option";

export interface Namespace {
  name: string,
  options: Option[]
  namespaces: Namespaces
}

export type Namespaces = Namespace[]