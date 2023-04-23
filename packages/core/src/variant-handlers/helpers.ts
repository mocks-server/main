import type { UnknownObject } from "../common/Common.types";

import type { VariantHandlerBaseInterface } from "./VariantHandlers.types";

export function getDataFromVariant(variant: MocksServer.VariantDefinition): UnknownObject {
  return variant.options;
}

export function getPreview(
  variantInstance: VariantHandlerBaseInterface
): VariantHandlerBaseInterface["preview"] {
  return variantInstance.preview;
}
