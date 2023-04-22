declare global {
  namespace MocksServer {
    enum VariantTypes {}
    type VariantOptions = unknown;
    interface VariantDefinition {
      id: string;
      type: `${VariantTypes}`;
      options: MocksServer.VariantOptions;
    }
  }
}

export {};
