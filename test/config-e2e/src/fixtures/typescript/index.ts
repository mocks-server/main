import Config from "@mocks-server/config";
import type {
  Config as _Config,
  Namespace as _Namespace,
  Option as _Option,
  ConfigurationObject as _ConfigurationObject
} from "@mocks-server/config";

const configOptions: _Config.Options = { moduleName: "mocks", mergeArrays: true };

const config: _Config.Interface = new Config(configOptions);

const rootOptionsOptions: _Option.Options[] = [
  { name: "rootOption1", type: "array", default: ["foo-value"], itemsType: "string" }
];

const rootOption: _Option.Interface = config.addOption(rootOptionsOptions[0]);

const rootOption1: _Option.Interface | undefined = config.option("rootOption1");

if (rootOption !== rootOption1) {
  throw new Error("Option is different!");
}

config.options.forEach((option) => {
  const name: string = option.name;
  const type: _Option.Type = option.type;
  const description: string | undefined = option.description;
  const defaultValue: _Option.Value = option.value;
  const value: _Option.Value = option.value;
  const nullable: boolean = option.nullable;
  const extraData: _Option.ExtraData | undefined = option.extraData;
  const itemsType: _Option.ItemsType | undefined = option.itemsType;
  const hasBeenSet: boolean = option.hasBeenSet;

  option.startEvents();

  const newValue: _Option.Value = { foo: "foo" };
  const setOptions: _Config.Set.Options = { merge: false };
  option.value = newValue;
})

const configNamespace: _Namespace.Interface = config.addNamespace("name");
const namespaceOptionOptions: _Option.Options = { name: "fooOption", type: "string", default: "foo-value" };
const namespaceOption: _Option.Interface = configNamespace.addOption(namespaceOptionOptions);
const namespaceOptions: _Option.Interface[] = configNamespace.addOptions([{
  name: "foo",
  type: "string"
}]);

const firstNamespace: _Namespace.Interface | undefined = config.namespace("firstNamespace");

if (firstNamespace !== configNamespace) {
  throw new Error("Namespace is different!");
}

const namespaces: _Namespace.Interface[] = config.namespaces;

namespaces.forEach((namespace: _Namespace.Interface) => {
  const newConfig: _ConfigurationObject = { foo: "foo" };
  const setOptions: _Config.Set.Options = { merge: false };
  namespace.set(newConfig, setOptions);
  namespace.value = newConfig;
  namespace.startEvents();
  const subNamespace: _Namespace.Interface = namespace.addNamespace("foo");
  const isRoot: boolean = namespace.isRoot;
  const childNamespaces: _Namespace.Interface[] = namespace.namespaces;
  const namespaceOptions: _Option.Interface[] = namespace.options;
  const name: string = namespace.name;
  const parents: _Namespace.Interface[] = namespace.parents;
  const value: _ConfigurationObject = namespace.value;
  const childNamespace: _Namespace.Interface | undefined = namespace.namespace("firstNamespace");
  const childOption: _Option.Interface | undefined = namespace.option("firstOption");
  const root: _Config.Interface = namespace.root;
});

const onChangeNamespaceOption: _Option.Events.Listener = function () {
  console.log("Option changed!");
}

const removeNamespaceOptionListener: _Option.Events.ListenerRemover = namespaceOption.onChange(onChangeNamespaceOption);
removeNamespaceOptionListener();

const initialConfig: _ConfigurationObject = { namespace: { component: { alias: "foo-alias" } } };

const validationOptions: _Config.Validation.Options = { allowAdditionalProperties: false };

const configObjectIsValid: _Config.Validation.Result = config.validate({
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

const configObjectValidationSchema: _Config.Validation.Schema = config.getValidationSchema({ allowAdditionalProperties: true });

config.init(initialConfig).then(() => {
  return config.load(initialConfig).then(() => {
    console.log("Configuration loaded");
    const value: _ConfigurationObject =  config.value;
    const programmaticLoadedValues: _ConfigurationObject =  config.programmaticLoadedValues;
    const fileLoadedValues: _ConfigurationObject =  config.fileLoadedValues;
    const argsLoadedValues: _ConfigurationObject =  config.argsLoadedValues;
    const envLoadedValues: _ConfigurationObject =  config.envLoadedValues;

    const childNamespaces: _Namespace.Interface[] = config.namespaces;
    const configOptions: _Option.Interface[] = config.options;

    const loadedFile: string | null = config.loadedFile

    const newConfig: _ConfigurationObject = { foo: "foo" };
    const setOptions: _Config.Set.Options = { merge: false };
    config.set(newConfig, setOptions);
    config.value = newConfig;
  });
});
