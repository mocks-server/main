import type { VariantHandlerBaseInterface } from "./VariantHandlers.types";

export function getDataFromVariant(
  variant: MocksServer.VariantDefinition
): MocksServer.VariantOptions {
  return variant.options;
}

export function getPreview(
  variantInstance: VariantHandlerBaseInterface
): VariantHandlerBaseInterface["preview"] {
  return variantInstance.preview;
}
