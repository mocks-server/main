/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { JSONSchema7 } from "json-schema";

export type InstanceOf = "Function" | "RegExp";

export type JSONSchema7WithInstanceofDefinition = JSONSchema7WithInstanceof | boolean;
export interface JSONSchema7WithInstanceof extends JSONSchema7 {
  instanceof?: InstanceOf;
  $defs?:
    | {
        [key: string]: JSONSchema7WithInstanceofDefinition;
      }
    | undefined;

  items?: JSONSchema7WithInstanceofDefinition | JSONSchema7WithInstanceofDefinition[] | undefined;
  additionalItems?: JSONSchema7WithInstanceofDefinition | undefined;
  contains?: JSONSchema7WithInstanceof | undefined;
  properties?:
    | {
        [key: string]: JSONSchema7WithInstanceofDefinition;
      }
    | undefined;
  patternProperties?:
    | {
        [key: string]: JSONSchema7WithInstanceofDefinition;
      }
    | undefined;
  additionalProperties?: JSONSchema7WithInstanceofDefinition | undefined;
  dependencies?:
    | {
        [key: string]: JSONSchema7WithInstanceofDefinition | string[];
      }
    | undefined;
  propertyNames?: JSONSchema7WithInstanceofDefinition | undefined;

  if?: JSONSchema7WithInstanceofDefinition | undefined;
  then?: JSONSchema7WithInstanceofDefinition | undefined;
  else?: JSONSchema7WithInstanceofDefinition | undefined;

  allOf?: JSONSchema7WithInstanceofDefinition[] | undefined;
  anyOf?: JSONSchema7WithInstanceofDefinition[] | undefined;
  oneOf?: JSONSchema7WithInstanceofDefinition[] | undefined;
  not?: JSONSchema7WithInstanceofDefinition | undefined;
}
