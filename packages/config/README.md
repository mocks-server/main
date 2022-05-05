<p align="center"><a href="https://mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_config"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_config&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/config"><img src="https://img.shields.io/npm/dm/@mocks-server/config.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/config/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/config.svg" alt="License"></a>
</p>

---

# Mocks Server Config

Modular configuration provider. __Reads__ and __validates__ config from:

* Default option values
* Configuration received programmatically
* Configuration Files. Using [Cosmiconfig](https://github.com/davidtheclark/cosmiconfig)
* Environment variables
* Command line arguments

As a summary it also provides:

* Automatic config validation
* Isolated configuration namespaces
* Objects to get/set options
* Events when any value change

Different namespaces can be created to each different element in the architecture. So, each different component is the unique who knows about its own options, but the user can define options for all components at a time, and using the same methods.

This module provides configuration to [Mocks Server](website-url) components and plugins, but it may be used anywhere else because it is fully configurable.

## Usage

A brief example:

```js
const Config = require("@mocks-server/config");

const config = new Config({ moduleName: "mocks" });
const namespace = config.addNamespace("fooComponent");
const option = namespace.addOption({
  name: "fooOption",
  type: "String",
  default: "foo-value",
});

config.start({ fooComponent: { fooOption: "foo" }}).then(() => {
  console.log(option.value);
});
```

## Configuration sources

Once options and namespaces are added, and the `start` method is called, the library searches for values for the options in next sources, sorted from lower to higher priority:

* __Default option value__. When the option is created, it can contain a `default` property. That value will be assigned if no other one is found.
* __Programmatic config__. An object containing initial configuration can be provided to the `start` or `init` methods.
* __Configuration files__. Configuration files in `process.cwd()`. [Cosmiconfig](https://github.com/davidtheclark/cosmiconfig) is used to provide this feature, so it is fully compatible with next files formats:
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

Options can be of one of next types: `string`, `boolean`, `number` or `object`. This library automatically converts the values from command line arguments and environment variables to the expected type when possible. If the conversion is not possible or the validation fails an error is thrown. Validation errors provide enough context to users to let them know the option that failed. This library uses [`ajv`](https://github.com/ajv-validator) and [`better-ajv-errors`](https://github.com/atlassian/better-ajv-errors) for validations.

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
MOCKS_OPTION_A="foo-value"
```

* __Configuration from arguments__: The argument must start by "--".
```sh
--optionA="foo-value"
```

## Namespaces

Different isolated namespaces can be created to provide configuration to different components in the architecture. For example, Mocks Server uses config namespaces in order to allow plugins to define their own options without having conflicts with core options or other plugins options.

```js
const config = new Config({ moduleName: "mocks" });

config
  .addNamespace("componentA")
  .addOption({ name: "optionA", type: "string", default: "foo" });
```

When a namespace is created, its name must also be used when providing the configuration to its options. Next patterns are used to define the namespace of an option:

* __Configuration from files or programmatic__: The option must be defined inside an object which key corresponds to the namespace name:
```js
{
  componentA: {
    optionA: "foo-value"
  }
}
```

* __Configuration from environment variables__: The `moduleName` option and the namespace name must be prepended to the option name, using "screaming snake case".
```sh
MOCKS_COMPONENT_A_OPTION_A="foo-value"
```

* __Configuration from arguments__: The namespace name must be prepended to the option name, and separated by a dot. The argument must start by "--".
```sh
--componentA.optionA="foo-value"
```

## Nested namespaces

Namespaces can be nested, so they can contain also another namespaces apart of options. The previous rules about how to use namespaces when giving values to options are also valid for nested namespaces. For example:

```js
const config = new Config({ moduleName: "mocks" });

config
  .addNamespace("componentA")
  .addNamespace("componentB")
  .addOption({ name: "optionA", type: "string", default: "foo" });
```

* __Configuration from files or programmatic__: Namespace names must be nested properly.
```js
{
  componentA: {
    componentB: {
      optionA: "foo-value"
    }
  }
}
```

* __Configuration from environment variables__: All parent namespace names must be prepended:

```sh
MOCKS_COMPONENT_A_COMPONENT_B_OPTION_A="foo-value"
```

* __Configuration from arguments__: All parent namespace names must be prepended and separated by a dot:
```sh
--componentA.componentB.optionA="foo-value"
```

## Lifecycle

Once the `config` instance has been created, normally you should only call to the `config.start` method to load all of the configuration, apply the validations and let the library start emitting events. But for more complex use cases there is available also another method: `config.init`.

You can call to the `config.init` method at any time before calling to `config.start`, and all configuration sources will be preloaded and values will be assigned to the options that have been already created. In this step, the validation is not executed, so you can add more namespaces or options based on some of that configuration afterwards. For example, Mocks Server first load the configuration that defines the plugins to be loaded using the `init` method, then it loads them and let them add their own options, and then it executes the `config.start` method. In this step the validation is executed, so unknown configuration properties would produce an error. Option events are not emitted until the `start` method has finished.

## API

### Config

```
const config = new Config({ moduleName: "mocks" });
``` 

* __`Config(options)`__. Returns `config` instance.
  
  * __`options`__ _(Object)_: Containing any of next properties:
    * __`moduleName`__: Used as prefix for environment variables names and config file names.

### Config instance

* __`init(programmaticConfig)`__: _Async_. Read configuration and assign it to the correspondent options but do not execute validation. Allows to read partial configuration before adding more namespaces or options. Events are not still emitted.
  * `programmaticConfig` _(Object)_: Optional. Initial configuration to be set in options. It overwrite option defaults, but it is overwritten by config from files, environment and arguments.
* __`start(programmaticConfig)`__: _Async_. Assign configuration to the correspondent options. It executes the `init` method internally if it was not done before.
  * `programmaticConfig` _(Object)_: Optional. If `init` was called before, it is ignored, otherwise, it is passed to the `init` method.
* __`addNamespace(name)`__: Add namespace to the root. Returns a [namespace instance](#namespace-instance).
  * `name` _(String)_: Name for the namespace.
* __`addOption(optionProperties)`__: Equivalent to the `addOption` method in namespaces, but it add the option to the root. Returns an [option instance](#option-instance).
  * `optionProperties` _(Object)_: Properties defining the option. See the `addOption` method in namespaces for further info.
* __`addOptions(optionsProperties)`__: Add many options. Returns an array of [option instances](#option-instance).
  * `optionsProperties` _(Array)_: Array of `optionProperties`.

### Namespace instance

* __`addNamespace(name)`__: Add another namespace to the current namespace. Returns a [namespace instance](#namespace-instance).
  * `name` _(String)_: Name for the namespace.
* __`addOption(optionProperties)`__: Adds an option to the namespace. Returns an [option instance](#option-instance).
  * `optionProperties` _(Object)_: Properties defining the option.
    * __`name`__ _(String)_: Name for the option.
    * __`description`__ _(String)_: _Optional_. Used in help, traces, etc.
    * __`type`__  _(String)_. One of _`string`_, _`boolean`_, _`number`_ or _`object`_. Used to apply type validation when loading configuration and in `option.value` setter.
    * __`default`__ - _Optional_. Default value. Its type depends on the `type` option.
    * __`metaData`__ - _(Object)_. _Optional_. Allows to store any option extra information. For example, Mocks Server uses it to store a custom `affectsToServer` property used to determine whether changing the option value should trigger a server restart.
* __`addOptions(optionsProperties)`__: Add many options. Returns an array of [option instances](#option-instance).
  * `optionsProperties` _(Array)_: Array of `optionProperties`.
* __`set(configuration)`__: Allows to set values to many namespace options at a time.
  * `configuration` _(Object)_: Configuration to set in namespace options. It should have a `key` for each option to be set with the correspondent `value`: `{optionName: "value", optionName2: "value"}`. If value is an object, it will use the option `merge` method to set it.
* __`name`__: Getter returning the namespace name.
* __`namespaces`__: Getter returning a `Set` object with children namespaces.
* __`options`__: Getter returning a `Set` object with children options.

### Option instance

* __`value`__: Getter/setter of current value.
* __`onChange(callback)`__: Allows to add a listener that will be executed whenever the value changes. It only emit events after calling to the `config.start` method. __It returns a function that removes the listener once executed__.
  * `callback(value)` _(Function)_: Callback to be executed whenever the option value changes. It receives the new value as first argument.
* __`merge(objectToMerge)`__ _(Function)_: Only valid for options of type `object`. It merges the current object value with the received one.
  * `objectToMerge` _(Object)_: Object to be merged with current value.
* __`name`__: Getter returning the option name.
* __`type`__: Getter returning the option type.
* __`default`__: Getter returning the option default value.

[website-url]: https://www.mocks-server.org
[logo-url]: https://www.mocks-server.org/img/logo_120.png
[main-url]: https://www.npmjs.com/package/@mocks-server/main
