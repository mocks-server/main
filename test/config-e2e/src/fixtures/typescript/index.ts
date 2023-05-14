import Config from "@mocks-server/config";
import type {
  ConfigInterface,
  ConfigNamespaceInterface,
  OptionInterface,
  ConfigOptions,
  ConfigurationObject,
  OptionType,
  OptionValue,
  OptionProperties,
  OptionExtraData,
  OptionItemsType,
  SetMethodOptions,
  EventListener,
  EventListenerRemover,
  ConfigValidationOptions,
  ConfigValidationResult,
  ConfigValidationSchema,
} from "@mocks-server/config";

const configOptions: ConfigOptions = { moduleName: "mocks", mergeArrays: true };

const config: ConfigInterface = new Config(configOptions);

const rootOptionsOptions: OptionProperties[] = [
  { name: "rootOption1", type: "array", default: ["foo-value"], itemsType: "string" }
];

const rootOption: OptionInterface = config.addOption(rootOptionsOptions[0]);

const rootOption1: OptionInterface | undefined = config.option("rootOption1");

if (rootOption !== rootOption1) {
  throw new Error("Option is different!");
}

config.options.forEach((option) => {
  const name: string = option.name;
  const type: OptionType = option.type;
  const description: string | undefined = option.description;
  const defaultValue: OptionValue = option.value;
  const value: OptionValue = option.value;
  const nullable: boolean = option.nullable;
  const extraData: OptionExtraData | undefined = option.extraData;
  const itemsType: OptionItemsType | undefined = option.itemsType;
  const hasBeenSet: boolean = option.hasBeenSet;

  option.startEvents();

  const newValue: OptionValue = { foo: "foo" };
  const setOptions: SetMethodOptions = { merge: false };
  option.value = newValue;
})

const configNamespace: ConfigNamespaceInterface = config.addNamespace("name");
const namespaceOptionOptions: OptionProperties = { name: "fooOption", type: "string", default: "foo-value" };
const namespaceOption: OptionInterface = configNamespace.addOption(namespaceOptionOptions);
const namespaceOptions: OptionInterface[] = configNamespace.addOptions([{
  name: "foo",
  type: "string"
}]);

const firstNamespace: ConfigNamespaceInterface | undefined = config.namespace("firstNamespace");

if (firstNamespace !== configNamespace) {
  throw new Error("Namespace is different!");
}

const namespaces: ConfigNamespaceInterface[] = config.namespaces;

namespaces.forEach((namespace: ConfigNamespaceInterface) => {
  const newConfig: ConfigurationObject = { foo: "foo" };
  const setOptions: SetMethodOptions = { merge: false };
  namespace.set(newConfig, setOptions);
  namespace.value = newConfig;
  namespace.startEvents();
  const subNamespace: ConfigNamespaceInterface = namespace.addNamespace("foo");
  const isRoot: boolean = namespace.isRoot;
  const childNamespaces: ConfigNamespaceInterface[] = namespace.namespaces;
  const namespaceOptions: OptionInterface[] = namespace.options;
  const name: string = namespace.name;
  const parents: ConfigNamespaceInterface[] = namespace.parents;
  const value: ConfigurationObject = namespace.value;
  const childNamespace: ConfigNamespaceInterface | undefined = namespace.namespace("firstNamespace");
  const childOption: OptionInterface | undefined = namespace.option("firstOption");
  const root: ConfigInterface = namespace.root;
});

const onChangeNamespaceOption: EventListener = function () {
  console.log("Option changed!");
}

const removeNamespaceOptionListener: EventListenerRemover = namespaceOption.onChange(onChangeNamespaceOption);
removeNamespaceOptionListener();

const initialConfig: ConfigurationObject = { namespace: { component: { alias: "foo-alias" } } };

const validationOptions: ConfigValidationOptions = { allowAdditionalProperties: false };

const configObjectIsValid: ConfigValidationResult = config.validate({
  foo: {
    Foo: "2"
  },
  test: [],
}, validationOptions);

if(!configObjectIsValid.valid) {
  configObjectIsValid.errors?.forEach(error => {
    console.log(error);
  })
}

const configObjectValidationSchema: ConfigValidationSchema = config.getValidationSchema({ allowAdditionalProperties: true });

config.init(initialConfig).then(() => {
  return config.load(initialConfig).then(() => {
    console.log("Configuration loaded");
    const value: ConfigurationObject =  config.value;
    const programmaticLoadedValues: ConfigurationObject =  config.programmaticLoadedValues;
    const fileLoadedValues: ConfigurationObject =  config.fileLoadedValues;
    const argsLoadedValues: ConfigurationObject =  config.argsLoadedValues;
    const envLoadedValues: ConfigurationObject =  config.envLoadedValues;

    const childNamespaces: ConfigNamespaceInterface[] = config.namespaces;
    const configOptions: OptionInterface[] = config.options;

    const loadedFile: string | null = config.loadedFile

    const newConfig: ConfigurationObject = { foo: "foo" };
    const setOptions: SetMethodOptions = { merge: false };
    config.set(newConfig, setOptions);
    config.value = newConfig;
  });
});
