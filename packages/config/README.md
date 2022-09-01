<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_config"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_config&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/config"><img src="https://img.shields.io/npm/dm/@mocks-server/config.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/config/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/config.svg" alt="License"></a>
</p>

---

# Config provider

Modular configuration provider. __Reads__ and __validates__ configuration from:

* Default option values
* Configuration received programmatically
* Configuration Files. Using [Cosmiconfig](https://github.com/davidtheclark/cosmiconfig)
* Environment variables
* Command line arguments

As a summary, it also provides:

* Automatic config validation
* Isolated configuration namespaces
* Objects to get/set options
* Events when any value changes

Different namespaces can be created for each different element in the architecture. So, each different component is the unique who knows about its own options, but the user can define options for all components at a time, and using the same methods.

This module provides configuration to [Mocks Server](website-url) components and plugins, but it may be used anywhere else because it is fully configurable.

## Usage

A brief example:

```js
const Config = require("@mocks-server/config");

// Create config
const config = new Config({ moduleName: "mocks" });

// Create namespace
const namespace = config.addNamespace("fooNamespace");

// Create option
const option = namespace.addOption({
  name: "fooOption",
  type: "string",
  default: "foo-value",
});

// Load configuration
config.load().then(() => {
  // Read value
  console.log(option.value);
  // Set value
  option.value = "foo-new-value";
});

// Listen to onChange events
option.onChange((newValue) => {
  console.log(`Option has a new value: ${newValue}`);
});
```

## Configuration sources

Once options and namespaces are added, and the `load` method is called, the library searches for values for the options in next sources, sorted from lower to higher priority:

* __Default option value__. When the option is created, it can contain a `default` property. That value will be assigned if no other one is found.
* __Programmatic config__. An object containing initial configuration can be provided to the `load` or `init` methods.
* __Configuration file__. It searches for a configuration file in the `process.cwd()` folder (or any other folders using built-in [options](#built-in-options)). [Cosmiconfig](https://github.com/davidtheclark/cosmiconfig) is used to provide this feature, so it is compatible with next files formats:
  * A `[moduleName]` property in a `package.json` file
  * A `.[moduleName]rc file with JSON or YAML syntax.`
  * A `.[moduleName]rc.json`, `.[moduleName]rc.yaml`, `.[moduleName].yml`, `.[moduleName]rc.js`, or `.[moduleName]rc.cjs` file.
  * A `[moduleName].config.js` or `[moduleName].config.cjs` CommonJS module exporting the object.
  * A `[moduleName].config.js` or `[moduleName].config.cjs` CommonJS module exporting a function. __It receives programmatic configuration as first argument__.
  * A `[moduleName].config.js` or `[moduleName].config.cjs` CommonJS module exporting an async function. __It receives programmatic configuration as first argument__.
* __Environment variables__. Environment variables can be also used to define options values.
* __Process arguments__. [Commander](https://github.com/tj/commander.js/) is used under the hood to get values from command line arguments and assign them to each correspondent option.

## Options

Options can be added to a namespace, or to the root config object. Both `config` and namespaces have an `addOption` method for creating them. Check the [API](#api) chapter for further info.

Options can be of one of next types: `string`, `boolean`, `number`, `object` or `array`. This library automatically converts the values from command line arguments and environment variables to the expected type when possible. If the conversion is not possible or the validation fails an error is thrown. Validation errors provide enough context to users to let them know the option that failed. This library uses [`ajv`](https://github.com/ajv-validator) and [`better-ajv-errors`](https://github.com/atlassian/better-ajv-errors) for validations.

Types `string`, `boolean`, `number` can be nullable using the option `nullable` property.

Here is an example of how to add an option to the root config object, and then you have information about how the option would be set from different sources:

```js
const config = new Config({ moduleName: "mocks" });
config.addOption({ name: "optionA", type: "string", default: "foo" });
```

* __Configuration from files or programmatic__: The option must be defined at first level:
```js
{
  optionA: "foo-value"
}
```

* __Configuration from environment variables__: The `moduleName` option must be prepended to the option name, using "screaming snake case".
```sh
MODULE_NAME_OPTION_A="foo-value"
```

* __Configuration from arguments__: The argument must start by "--".
```sh
--optionA="foo-value"
```

## Namespaces

Different isolated namespaces can be created to provide configuration to different components in the architecture. For example, Mocks Server uses config namespaces in order to allow plugins to define their own options without having conflicts with core options or other plugins options.

```js
const config = new Config({ moduleName: "moduleName" });

config
  .addNamespace("namespaceA")
  .addOption({ name: "optionA", type: "string", default: "foo" });
```

When a namespace is created, its name must also be used when providing the configuration to its options. Next patterns are used to define the namespace of an option:

* __Configuration from files or programmatic__: The option must be defined inside an object which key corresponds to the namespace name:
```js
{
  namespaceA: {
    optionA: "foo-value"
  }
}
```

* __Configuration from environment variables__: The `moduleName` option and the namespace name must be prepended to the option name, using "screaming snake case".
```sh
MODULE_NAME_NAMESPACE_A_OPTION_A="foo-value"
```

* __Configuration from arguments__: The namespace name must be prepended to the option name, and separated by a dot. The argument must start by "--".
```sh
--namespaceA.optionA="foo-value"
```

## Nested namespaces

Namespaces can be nested, so they can contain also another namespaces apart of options. The previous rules about how to use namespaces when giving values to options are also valid for nested namespaces. For example:

```js
const config = new Config({ moduleName: "mocks" });

config
  .addNamespace("namespaceA")
  .addNamespace("namespaceB")
  .addOption({ name: "optionA", type: "string", default: "foo" });
```

* __Configuration from files or programmatic__: Namespace names must be nested properly.
```js
{
  namespaceA: {
    namespaceB: {
      optionA: "foo-value"
    }
  }
}
```

* __Configuration from environment variables__: All parent namespace names must be prepended:

```sh
MOCKS_NAMESPACE_A_NAMESPACE_B_OPTION_A="foo-value"
```

* __Configuration from arguments__: All parent namespace names must be prepended and separated by a dot:
```sh
--namespaceA.namespaceB.optionA="foo-value"
```

## Option types

### __String__

Options of type `string` are not parsed in any way.

```js
const config = new Config({ moduleName: "moduleName" });
const option = config.addOption({
  name: "optionA",
  type: "string",
});
await config.load();
```

Examples about how to define options of type `string` from sources:

* __Programmatic or configuration files__: `{"optionA": "foo-value"}`
* __Environment variables__: `MODULE_NAME_OPTION_A=foo-value`
* __Arguments__: `node myProgram.js --optionA=foo-value`

### __Boolean__

Options of type `boolean` are parsed when they are defined in environment variables, and they have a special format when defined in arguments:

```js
const option = config.addOption({
  name: "optionA",
  type: "boolean",
  default: true,
});
await config.load();
```

Examples about how to define options of type `string` from sources:

* __Programmatic or configuration files__: `{"optionA": false}`
* __Environment variables__:
  * `0` and `false` strings will be parsed into boolean `false`: `MODULE_NAME_OPTION_A=false`, or `MODULE_NAME_OPTION_A=0`.
  * Any other value will be considered `true`: `MODULE_NAME_OPTION_A=true`, `MODULE_NAME_OPTION_A=1` or `MODULE_NAME_OPTION_A=foo`.
* __Arguments__:
  * If the option has default value `true`, then the `--no-` prefix added to the option name will produce the option to have a `false` value: `node myProgram.js --no-optionA`
  * If the option has a `false` default value, then the option name will be set it as `true`: `node myProgram.js --optionA`

### __Number__

Options of type `number` are parsed when they are defined in environment variables or command line arguments.

```js
const option = config.addOption({
  name: "optionA",
  type: "number"
});
await config.load();
```

Examples about how to define options of type `number` from sources:

* __Programmatic or configuration files__: `{"optionA": 5}`
* __Environment variables__: `MODULE_NAME_OPTION_A=5`, or `MODULE_NAME_OPTION_A=5.65`.
* __Arguments__: `node myProgram.js --optionA=6.78`

### __Object__

Options of type `object` are parsed from JSON strings when they are defined in environment variables or command line arguments. __It is important to mention that objects are merged when they are defined in different sources when loading the configuration.__

```js
const option = config.addOption({
  name: "optionA",
  type: "object"
});
await config.load();
```

Examples about how to define options of type `object` from sources:

* __Programmatic or configuration files__: `{"optionA": { foo: "foo", foo2: ["1", 2 ]}}`
* __Environment variables__: `MODULE_NAME_OPTION_A={"foo":"foo","foo2":["1",2]}}`
* __Arguments__: `node myProgram.js --optionA={"foo":"foo","foo2":["1",2]}}`

### __Array__

Options of type `array` are parsed from JSON strings when they are defined in environment variables. For defining them in command line arguments, multiple arguments should be provided. __As in the case of objects, arrays are merged when they are defined in multiple sources when loading the configuration__. The result of defining it environment variables and in arguments would be both arrays concated, for example. This behavior can be disabled using the `mergeArrays` option of the [`Config` class](#config).

```js
const option = config.addOption({
  name: "optionA",
  type: "array",
  itemsType: "string"
});
await config.load();
```

Examples about how to define options of type `object` from sources:

* __Programmatic or configuration files__: `{"optionA": ["foo","foo2"]}`
* __Environment variables__: `MODULE_NAME_OPTION_A=["foo","foo2"]`
* __Arguments__: A commander variadic option is created under the hood to get the values, so array items have to be defined in separated arguments. Read the [commander docs for further info](https://github.com/tj/commander.js/#variadic-option). `node myProgram.js --optionA foo foo2`

__The contents of the array are also converted to its correspondent type when the `itemsType` option is provided.__

### __Nullable types__

An option can be null when it is set as `nullable`. Nullable types are `string`, `boolean` and `number`. Types `object` and `array` can't be nullable, their value should be set to empty array or empty object instead.

```js
const config = new Config({ moduleName: "moduleName" });
const option = config.addOption({
  name: "optionA",
  type: "string",
  nullable: true,
  default: null,
});
await config.load();
```

## Built-in options

The library registers some options that can be used to determine the behavior of the library itself. As the rest of the configuration created by the library, these options can be set using configuration file, environment variables, command line arguments, etc. But there are some of them that can be defined only in some specific sources because they affect to reading that sources or not.

All of the built-in options are defined in the `config` namespace:

* __`config.readFile`__ _(Boolean)_: _Default: `true`_. Determines whether the configuration file should be read or not. Obviously, it would be ignored if it is defined in the configuration file.
* __`config.readArguments`__ _(Boolean)_: _Default: `true`_. Determines whether the arguments are read or not. It can be defined only using programmatic configuration.
* __`config.readEnvironment`__ _(Boolean)_: _Default: `true`_. Determines whether the environment variables are read or not. It can be defined using programmatic configuration or command line arguments.
* __`config.fileSearchPlaces`__ _(Array)_: _Default from cosmiconfig_. An array of places to search for the configuration file. It can be defined in any source, except configuration files.
* __`config.fileSearchFrom`__ _(String)_: _Default process.cwd_. Start searching for the configuration file from this folder, and keep searching up in the parent directories until arriving at the `config.fileSearchStop` folder.
* __`config.fileSearchStop`__ _(Array)_: _Default process.cwd_. Directory where the search for the configuration file will stop.
* __`config.allowUnknownArguments`__ _(Boolean)_: _Default `false`_. When set to `true`, it allows to define unknown command line arguments. It can be defined in any source.

## Lifecycle

Once the `config` instance has been created, normally you should only call to the `config.load` method to load all of the configuration, apply the validations and let the library start emitting events. But for more complex use cases there is available also another method: `config.init`.

You can call to the `config.init` method at any time before calling to `config.load`, and all configuration sources will be preloaded and values will be assigned to the options that have been already created. In this step, the validation is not executed, so you can add more namespaces or options based on some of that configuration afterwards. For example, Mocks Server first load the configuration that defines the plugins to be loaded using the `init` method, then it loads them and let them add their own options, and then it executes the `config.load` method. In this step the validation is executed, so unknown configuration properties would produce an error. Option events are not emitted until the `load` method has finished.

## API

### Config

```js
const config = new Config({ moduleName: "mocks", mergeArrays: false });
``` 

* __`Config(options)`__. Returns a `config` instance.
  
  * __`options`__ _(Object)_: Containing any of next properties:
    * __`moduleName`__: Used as prefix for environment variables names and config file names.
    * __`mergeArrays`__: _Default `true`_. When an option is of type `array` or `object`, this option defines whether arrays with different values coming from different sources are concated or not. If not, the value defined in the source with higher priority would be used.

### Config instance

* __`init(programmaticConfig)`__: _Async_. Read configuration and assign it to the correspondent options but do not execute validation. Allows to read partial configuration before adding more namespaces or options. Events are not still emitted.
  * `programmaticConfig` _(Object)_: Optional. Initial configuration to be set in options. It overwrite option defaults, but it is overwritten by config from files, environment and arguments.
* __`load(programmaticConfig)`__: _Async_. Assign configuration to the correspondent options. It executes the `init` method internally if it was not done before.
  * `programmaticConfig` _(Object)_: Optional. If `init` was called before, it is ignored, otherwise, it is passed to the `init` method.
* __`addNamespace(name)`__: Add namespace to the root. Returns a [namespace instance](#namespace-instance).
  * `name` _(String)_: Name for the namespace.
* __`addOption(optionProperties)`__: Equivalent to the `addOption` method in namespaces, but it add the option to the root. Returns an [option instance](#option-instance).
  * `optionProperties` _(Object)_: Properties defining the option. See the `addOption` method in namespaces for further info.
* __`addOptions(optionsProperties)`__: Add many options. Returns an array of [option instances](#option-instance).
  * `optionsProperties` _(Array)_: Array of `optionProperties`.
* __`namespace(name)`__: Returns the [namespace instance](#namespace-instance) in the root config with name equal to `name`.
* __`option(optionName)`__: Returns the [option instances](#option-instance) in the root config with name equal to `optionName`.
* __`set(configuration)`__: Set configuration properties to each correspondent namespace and options.
  * `configuration` _(Object)_: Object with programmatic configuration. Levels in the object correspond to namespaces names, and last level keys correspond to option names.
* __`validate(configuration, options)`__: Allows to prevalidate a configuration before setting it, for example. It returns an object with `valid` and `errors` properties. See [AJV docs for further info](https://ajv.js.org/guide/getting-started.html#basic-data-validation).
  * `configuration` _(Object)_: Object with configuration. Levels in the object correspond to namespaces names, and last level keys correspond to option names.
  * `options` _(Object)_: Object with extra options for validation:
    * `allowAdditionalProperties` _(Boolean)_: _Default `false`_. If true, additional properties in the configuration would not produce validation errors.
* __`getValidationSchema(options)`__: Returns a validation schema compatible with AJV for validating the configuration of all nested namespaces.
  * `options` _(Object)_: Object with extra options for validation:
    * `allowAdditionalProperties` _(Boolean)_: _Default `false`_. If true, the validation schema will allow additional properties.
* __`value`__: Getter returning the current values from all namespaces and options as an object. Levels in the object correspond to namespaces names, and last level keys correspond to option names. It can be also used as setter as an alias of the `set` method, with default options.
* __`loadedFile`__: Getter returning the file path of the loaded configuration file. It returns `null` if no configuration file was loaded.
* __`namespaces`__: Getter returning array with all root namespaces.
* __`options`__: Getter returning array with all root options.
* __`programmaticLoadedValues`__: Getter returning initial values from programmatic config. Useful for debugging purposes.
* __`fileLoadedValues`__: Getter returning initial values from file config. Useful for debugging purposes.
* __`envLoadedValues`__: Getter returning initial values from environment config. Useful for debugging purposes.
* __`argsLoadedValues`__: Getter returning initial values from arguments. Useful for debugging purposes.

### Namespace instance

```js
const namespace = config.addNamespace("name");
``` 

* __`addNamespace(name)`__: Add another namespace to the current namespace. Returns a [namespace instance](#namespace-instance).
  * `name` _(String)_: Name for the namespace.
* __`addOption(optionProperties)`__: Adds an option to the namespace. Returns an [option instance](#option-instance).
  * `optionProperties` _(Object)_: Properties defining the option.
    * __`name`__ _(String)_: Name for the option.
    * __`description`__ _(String)_: _Optional_. Used in help, traces, etc.
    * __`type`__  _(String)_. One of _`string`_, _`boolean`_, _`number`_, _`array`_ or _`object`_. Used to apply type validation when loading configuration and in `option.value` setter.
    * __`nullable`__ _(Boolean)_. _Optional_. Default is `false`. When `true`, the option value can be set to `null`. It is only supported in types `string`, `number` and `boolean`.
    * __`itemsType`__ _(String)_. Can be defined only when `type` is `array`. It must be one of _`string`_, _`boolean`_, _`number`_ or _`object`_.
    * __`default`__ - _Optional_. Default value. Its type depends on the `type` option.
    * __`extraData`__ - _(Object)_. _Optional_. Useful to store any extra data you want in the option. For example, Mocks Server uses it to define whether an option must be written when creating the configuration scaffold or not.
* __`addOptions(optionsProperties)`__: Add many options. Returns an array of [option instances](#option-instance).
  * `optionsProperties` _(Array)_: Array of `optionProperties`.
* __`namespace(name)`__: Returns the [namespace instance](#namespace-instance) in this namespace with name equal to `name`.
* __`option(optionName)`__: Returns the [option instances](#option-instance) in this namespace with name equal to `optionName`.
* __`name`__: Getter returning the namespace name.
* __`namespaces`__: Getter returning an array with children namespaces.
* __`options`__: Getter returning an array object with children options.
* __`set(configuration)`__: Set configuration properties to each correspondent child namespace and options.
  * `configuration` _(Object)_: Object with configuration. Levels in the object correspond to child namespaces names, and last level keys correspond to option names.
* __`value`__: Getter returning the current values from all child namespaces and options as an object. Levels in the object correspond to namespaces names, and last level keys correspond to option names. It can be also used as setter as an alias of the `set` method, with default options.
* __`root`__: Getter returning the root configuration object.

### Option instance

```js
const option = namespace.addOption("name");
const rootOption = config.addOption("name2");
``` 

* __`value`__: Getter of the current value. It can be also used as setter as an alias of the `set` method, with default options..
* __`set(value)`__: Set value.
* __`onChange(callback)`__: Allows to add a listener that will be executed whenever the value changes. It only emit events after calling to the `config.start` method. __It returns a function that removes the listener once executed__.
  * `callback(value)` _(Function)_: Callback to be executed whenever the option value changes. It receives the new value as first argument.
* __`name`__: Getter returning the option name.
* __`type`__: Getter returning the option type.
* __`nullable`__: Getter returning whether the option is nullable or not.
* __`description`__: Getter returning the option description.
* __`extraData`__: Getter returning the option extra data.
* __`default`__: Getter returning the option default value.
* __`hasBeenSet`__: Returns true if the option value has been actively set, no matter the source or method used to set it. Otherwise returns false.

[website-url]: https://www.mocks-server.org
[logo-url]: https://www.mocks-server.org/img/logo_120.png
