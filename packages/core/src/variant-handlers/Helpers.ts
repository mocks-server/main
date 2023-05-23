/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { VariantDefinition, VariantHandlerTypeOptions } from "../mock/types";

import type {
  VariantHandlerBaseInterface,
  VariantHandlerInterface,
  VariantHandlerId,
  VariantHandlerInterfaceWithRouter,
} from "./VariantHandlers.types";

export function getOptionsFromVariant(variant: VariantDefinition): VariantHandlerTypeOptions {
  return variant.options;
}

export function getPreview(
  variantInstance: VariantHandlerBaseInterface
): VariantHandlerBaseInterface["preview"] {
  return variantInstance.preview;
}

export function getHandlerId(variant: VariantDefinition): VariantHandlerId {
  return variant.type;
}

export function handlerIsRouter(
  variantHandler: VariantHandlerInterface
): variantHandler is VariantHandlerInterfaceWithRouter {
  return (variantHandler as VariantHandlerInterfaceWithRouter).router !== undefined;
}
