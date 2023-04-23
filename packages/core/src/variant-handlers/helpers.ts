import type { UnknownObject } from "../common/Common.types";

import type { VariantHandlerInterface } from "./VariantHandlers.types";

export function getDataFromVariant(variant: MocksServer.VariantDefinition): UnknownObject {
  return variant.options;
}

export function getPreview(
  variantInstance: VariantHandlerInterface
): VariantHandlerInterface["preview"] {
  return variantInstance.preview;
}
