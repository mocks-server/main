/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ErrorObject } from "ajv";
import type { JSONSchema7 } from "json-schema";

export type InstanceOf = "Function" | "RegExp";

/** Allowed instances in instanceof key in schemas*/
export interface AllowedInstancesOf {
  Function: FunctionConstructor;
  RegExp: RegExpConstructor;
}

export type JSONSchema7WithInstanceofDefinition = JSONSchema7WithInstanceof | boolean;
export interface JSONSchema7WithInstanceof extends JSONSchema7 {
  instanceof?: InstanceOf;
  $defs?:
    | {
        [key: string]: JSONSchema7WithInstanceofDefinition;
      }
    | undefined;

  items?: JSONSchema7WithInstanceofDefinition | JSONSchema7WithInstanceofDefinition[];
  additionalItems?: JSONSchema7WithInstanceofDefinition;
  contains?: JSONSchema7WithInstanceof;
  properties?: {
    [key: string]: JSONSchema7WithInstanceofDefinition;
  };
  patternProperties?: {
    [key: string]: JSONSchema7WithInstanceofDefinition;
  };
  additionalProperties?: JSONSchema7WithInstanceofDefinition | undefined;
  dependencies?: {
    [key: string]: JSONSchema7WithInstanceofDefinition | string[];
  };
  propertyNames?: JSONSchema7WithInstanceofDefinition;

  if?: JSONSchema7WithInstanceofDefinition;
  then?: JSONSchema7WithInstanceofDefinition;
  else?: JSONSchema7WithInstanceofDefinition;

  allOf?: JSONSchema7WithInstanceofDefinition[];
  anyOf?: JSONSchema7WithInstanceofDefinition[];
  oneOf?: JSONSchema7WithInstanceofDefinition[];
  not?: JSONSchema7WithInstanceofDefinition;
}

export interface ValidationErrors {
  message: string;
  errors?: ErrorObject[] | null;
}
