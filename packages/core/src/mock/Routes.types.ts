declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    //eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface VariantHandlerTypeOptions {}
    interface VariantDefinitionCommon {
      id: string;
    }

    type VariantHandlersDefinitions = {
      [K in keyof VariantHandlerTypeOptions]: {
        type: K;
        options: VariantHandlerTypeOptions[K];
      };
    };

    type VariantDefinition = VariantHandlersDefinitions[keyof VariantHandlersDefinitions] &
      VariantDefinitionCommon;
  }
}

export {};
