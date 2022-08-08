# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed

## [unreleased]

### Changed

- refactor(#371): Separate logic about loading files from logic about loading routes and collections from files. Use the new `files.createLoader` method to create routes and collections loaders.

### Added
- feat: Expose files API in core.
- feat: Add `createLoader` method to files.
- feat: Add `reload` method to files.

### Fixed
- fix: Debounce time in files reload aw not working. Now it has 200ms of debounce, with a maximum time wait of 1000ms

## [3.8.0] - 2022-08-04

### Added

- feat(#389): Add "status" Variant Handler
- feat(#388): Add "file" Variant Handler

## [3.7.0] - 2022-07-29

### Added

- feat(#366): Add "text" Variant Handler
- feat: Add `check` option to collections.select method. When set to `true`, the method returns a promise that is resolved when the collection exists and it is used by the mock. Otherwise the promise is rejected. It has been implemented with an option to avoid breaking changes.
- feat(#337): Add "static" Variant Handler
- feat: Support defining routes without method. In that case, the route will handle all HTTP methods
- feat: Support method "*" in routes. In that case, the route will handle all HTTP methods.
- feat: Add "disabled" property to variants. When it is true and the variant is selected, the route will be disabled.
- feat: Support property `router` in Variant Handlers. When defined, the router will be mounted using express `use` instead of specific methods.

### Changed

- feat: Return http methods in lowercase in plain routes. Return only valid http methods.


## [3.6.0] - 2022-07-22

### Added

- feat(#334): Expose new `core.mock` API
- feat(#334): Add new option `mock.routes.delay`. Deprecate `mocks.delay`
- feat(#334): Add new option `mock.collections.selected`. Deprecate `mocks.selected`
- feat(#334): Support `type` and `options` properties in variants
- feat(#334): Support `routes` and `routeVariants` properties in collections. Deprecate `routesVariants`
- feat: Add `core.version` getter
- feat: Add `files.enabled` option

### Changed
- refactor(#334): Reorganize files and folders
- feat(#334): Deprecate `core.restartServer`, `core.addRouter` and `core.removeRouter` methods. Add alerts when used. `core.server` methods must be used instead.
- feat(#334): Deprecate `core.addRoutesHandler` method. Add alerts when used. `core.variantHandlers.register` method must be used instead.
- feat(#334): Deprecate `routesHandlers` option. `variantHandlers.register` option must be used instead.
- feat(#334): Deprecate `core.mocks.restoreRoutesVariants` method. `core.mock.restoreRouteVariants` method must be used instead.
- feat(#334): Deprecate `core.mocks.customRoutesVariants` method. `core.mock.customRouteVariants` method must be used instead.
- feat(#334): Deprecate `core.onChangeMocks` method. `core.mock.onChange` method must be used instead.
- feat(#334): Deprecate `core.loadMocks` method. `core.mock.createLoaders` method must be used instead.
- feat(#334): Deprecate `core.loadRoutes` method. `core.mock.createLoaders` method must be used instead.
- feat(#334): Deprecate `core.mocks.plainRoutes` getter. `core.mock.routes.plain` getter must be used instead.
- feat(#334): Deprecate `core.mocks.plainRoutesVariants` getter. `core.mock.routes.plainVariants` getter must be used instead. The format of items has changed in the new getter.
- feat(#334): Deprecate `core.mocks.current` getter. `core.mock.collections.selected` getter must be used instead.
- feat(#334): Deprecate `core.mocks.current` setter. `core.mock.collections.select` method must be used instead.
- feat(#334): Deprecate `core.mocks.ids` getter. `core.mock.collections.ids` getter must be used instead.
- feat(#334): Deprecate `core.mocks.plainMocks` getter. `core.mock.collections.plain` getter must be used instead. The format of items has changed in the new getter.
- feat(#334): Deprecate `core.onChangeAlerts` method. `core.alerts.root.onChange` method must be used instead.
- feat(#334): Deprecate `core.logs` getter. `core.logger.globalStore` getter must be used instead.
- feat(#334): Deprecate `core.onChangeLogs` method. `core.logger.onChangeGlobalStore` method must be used instead.
- feat(#334): Deprecate `core.alerts` when used out of plugins, because it is a getter returning a flat collection of alerts. In next major version, it will return the alerts API.

## [3.5.0] - 2022-07-05

### Added
- feat(#335): Pass only response property from variants to route variant handlers having the "version" property defined as "4". If it has another value, pass the whole variant object (for backward compatibility)
- feat(#336): Add "Json" and "Middleware" variant handlers.
- feat: Support defining the response preview in the v4 handlers as "preview" property. Keep "plainResponsePreview" for backward compatibility in old handlers.
- feat: Support "deprecated" property in route handlers. Add an alert whenever any route variant uses a deprecated handler

### Changed
- feat: Log requests in the middleware added by the Mock class, so it has not to be logged in every different handler.

## [3.4.0] - 2022-07-01

### Added
- feat(#351): Add an alert when plugins are defined as objects or functions

## [3.3.0] - 2022-07-01

### Added
- feat(#332): Add update notifier. Display an alert in case package is out of date.
- feat: Add `advancedOptions` parameter to Core constructor. Add `pkg` option allowing to determine name and version for update notifier.

### Fixed
- fix: Add Winston missing dependencies

## [3.2.0] - 2022-06-27

### Changed
- feat: Use new logger. Deprecate `tracer` in core API. Provide namespaced loggers to plugins. closes #339 
- feat: Pass custom core to route variant middlewares and route handlers. The `alerts` and `logger` properties are namespaced for each different route variant.
- feat: Pass new custom core API to plugins. All core methods are available in the first parameter. The `core` property is still available for backward compatibility, but using it produces an alert.

### Added
- feat: Add `onChangeLogs` method, allowing to execute a callback whenever logs changes.
- feat: Add `logs` getter, returning an array with all logs.
- feat: Log configuration initial values. closes #333 

## [3.1.0] - 2022-06-03

### Changed
- feat: Pass new `alerts` API to plugins. Add an alert if old `addAlert` or `removeAlerts` methods are used
- chore(deps): Update devDependencies.

## [3.0.1] - 2022-05-23

### Fixed
- fix(scaffold): Fix help url in configuration scaffold
- fix(scaffold): Give a default value to `plugins.register` property in scaffold in order to avoid null values

## [3.0.0] - 2022-05-23

### Removed

- feat: BREAKING CHANGE. The `Core` object now is export as `default`, not as a property
- feat: BREAKING CHANGE. The `Behavior` object has been removed and it is not exported any more.
- feat: BREAKING CHANGE. The `addFixturesHandler`, `onChangeLegacyMocks`, `addSetting` and `onChangeSettings` methods have been removed from the `Core` API.
- feat: BREAKING CHANGE. The `settings`, `behaviors` and `fixtures` getters have been removed from the `Core` API.
- feat: BREAKING CHANGE. The `pathLegacy`, `behavior` and `watchLegacy` options are not supported any more.
- feat: BREAKING CHANGE. The `--behavior` command line argument has been removed.
- feat: BREAKING CHANGE. The `load:mocks:legacy` and `change:mocks:legacy` events are not emitted any more.
- feat: BREAKING CHANGE. Drop support for Node.js 12.x

### Changed
- feat: BREAKING CHANGE. Renamed plugins `displayName` property into `id`. Plugins as classes now are required to have an static property id. Otherwise config is received only in register method.
- feat: BREAKING CHANGE. Configuration format changed. __All options have been renamed or moved into namespaces__. Please check the docs in the website for further info.
- feat: BREAKING CHANGE. Change arguments passed to the plugins. Now there is only one argument with an object containing everything.
- feat: BREAKING CHANGE. Response preview in route variants now is null when the response is defined as a function
- feat: BREAKING CHANGE. Change `cors` and `corsPreflight` options. Create a namespace cors. Allow passing any option to the cors middleware.
- feat: BREAKING CHANGE. `ajv-errors` is not used any more. Now, `better-ajv-errors` is used to provide better feedback about validations. So `ajv-errors` properties for json schemas are not supported any more.
- refactor: Use callbacks internally instead of events. Remove Orchestrator
- refactor: Move Settings and Config to a separated package
- refactor: FilesLoader is not loaded as a plugin any more in the core, now it is a core internal element.

### Added
- feat: A namespaced configuration object is passed to plugins if they have an `id` property.
- feat: Configuration can now be defined also in environment variables.
- feat: Configuration can now be defined in different file formats, using `cosmiconf`.
- feat: Add `config` getter to core.
- feat: Add options to configure body parser middlewares.

### Fixed
- chore: Fix repository property in package.json

## [2.5.3] - 2022-03-28

### Changed
- chore(deps): Update dependencies
- chore(deps): Update devDependencies
- chore: Migrate to monorepo

## [2.5.2] - 2022-03-03

### Fixed
- fix: validation of added route handlers was not working due to ajv cache

### Changed
- chore(deps): Update dependencies
- chore(deps): Update devDependencies

## [2.5.1] - 2021-12-04

### Fixed
- docs: Remove broken npm dependencies badge

## [2.5.0] - 2021-12-04

### Changed
- chore: Support any NodeJs version >=12.x.
- chore: Run tests also in NodeJs 17 in pipelines. Remove tests execution using NodeJs 15
- chore: Update dependencies
- test: Use 127.0.0.1 instead of localhost when requesting in tests for Node 17 support

### Fixed
- fix: Fix ajv dependency issue message when creating alert

## [2.4.0] - 2021-07-07

### Added
- feat(#201): Parsing of body with content-type application/x-www-form-urlencoded

### Changed
- chore(deps): Update devDependencies

## [2.3.3] - 2021-05-29

### Changed
- chore(deps): Update devDependencies

### Fixed
- fix: Disable validations if ajv-errors initialization fails. Add an alert with a link to https://mocks-server.org/docs/how-to-fix-ajv-errors-installation in that case

## [2.3.2] - 2021-05-24

### Changed
- chore(deps): update dependencies
- chore: Change Sonar project

## [2.3.1] - 2021-05-06

### Fixed
- fix: make body property in response not mandatory

### Changed
- chore(deps): update dependencies

## [2.3.0] - 2021-05-05

### Added
- feat: Validate that routes and mocks files export an array (#101)
- feat: Validate routes and route variants format (#101)
- feat: Validate mocks format (#101)
- feat: Add an alert when mocks contains non existent routeVariants (#101)
- feat: Ignore mocks, routes and route variants with duplicated ids (#101)
- feat: Add an alert if mock "from" property is not valid (not correspondent to any mock id) (#101)
- feat: Add an alert if there are many variants of the same route in the same mock (#101)
- feat: Support defining http methods in lowercase
- chore: Support Node.js v16.x

### Changed
- chore(deps): update dependencies

### Fixed
- fix: Routes with delay 0 had delay null in plain representation

## [2.2.0] - 2021-04-14

### Added
- feat: Add `babelRegister` and `babelRegisterOptions` low level configuration options, allowing to enable Babel when loading mocks and routes (#151);
- feat: Add `lowLevelConfig` getter to core, returning low level configuration properties.

### Changed
- chore: update node versions in pipeline
- chore(deps): update dependencies

## [2.1.0] - 2021-03-23

### Added
- feat: Support array of methods in routes (#139)
- feat: Support OPTIONS, HEAD and TRACE http methods in routes (#140)
- feat: Add cors and corsPreFlight options (#140)

### Changed

- chore(deps): Update dependencies

## [2.0.0] - 2021-01-17

### Added
- feat: Add new Mocks and Routes handler, and related getters to core. (#103) (#109) (#99) (#19)
- feat: Add `mock` option. Legacy mocks continue using `behavior` for backward compatibility
- feat: Add new plugin for loading files with routes and mocks in v2 format (#110)
- feat: Pass new method `loadRoutes` to plugins
- feat: Add alert when legacy behaviors are loaded
- feat: Add option and method `addRoutesHandlers` (#21)
- feat: Add store to tracer
- feat: Create configuration file from scaffold file when it does not exist
- feat: Create folder with examples from scaffold file when path does not exist
- feat: Add headers property to routes variants (#20)

### Changed
- feat: Improve traces when checking plugin options
- refactor: Move `path` and `watch` options inside files-loader plugin
- refactor: Reorganize files and folders
- refactor: Refactor Loaders to receive specific onLoad callback instead of full core instance
- refactor: Refactor Config to receive a single argument with all options
- refactor: Refactor Plugins to receive a single argument with all options
- chore: Update dependencies

### Fixed
- fix: Boolean options with default value of `true` were not working when defined as `false` in config file

### Removed
- feat: Do not add `no behaviors` alert. As behaviors are legacy in v2, now it is not considered a problem

### BREAKING CHANGES
- feat: Renamed configuration file from `mocks-server.config.js` to `mocks.config.js`
- feat: Remove deprecated options `features` and `behaviors`, `path` option should be used instead
- feat: Remove deprecated option `feature`, `behavior` option should be used instead
- feat: Legacy mocks defined using v1 format have to be loaded from folder defined using option `pathLegacy` instead of `path`, which now is used to define the folder from which load routes and mocks in v2 format. Folder defined with `pathLegacy` option will not be created automatically if it is not found, and the option is not required
- feat: Watching files for mocks in legacy v1 format has to be disabled using `watchLegacy` option instead of `watch`, which now affects only to routes and mocks in v2 format
- feat: `watch` option now is a standard commander boolean, so, to disable watch, argument `--no-watch` has to be provided. (`--no-watchLegacy` for legacy v1 mocks folder) (#107)
- feat: Remove `booleanString` option type. Now only `number`, `boolean` or `string` can be used.
- feat: Remove deprecated `onLoadMocks` method, `onChangeMocks` must be used instead
- feat: Remove `onLoadFiles` method. There is no alternative, as it is an internal event of the files-loader plugin and it should't be used by other external pieces
- feat: Legacy mocks have to be loaded using plugins custom method `loadLegacyMocks`. `loadMocks` will be able to handle only v2 mocks
- feat: Listening to changes on legacy mocks has to be added using `onChangeLegacyMocks` instead of `onChangeMocks`, which only is triggered when v2 mocks change
- feat: Remove Accept and language default headers
- feat: Remove `addCustomRouter` method. `addRouter` has to be used instead
- feat: Remove `addCustomSetting` method. `addSetting` has to be used instead
- feat: Remove `features` getter from Server. legacy `behaviors` has to be used instead
- feat: Remove `serverError` getter. Use alerts instead
- feat: Remove `restart` method, use `restartServer` instead

## [2.0.0-beta.2] - 2021-01-16

### Added
- feat: Add legacy options to config scaffold

### Changed
- feat: Include `from` and original `routesVariants` in plain mocks

## [2.0.0-beta.1] - 2021-01-14

### Added
- feat: Add new Mocks and Routes handler, and related getters to core.
- feat: Add `mock` option. Legacy mocks continue using `behavior` for backward compatibility
- feat: Add new plugin for loading files with routes and mocks in v2 format
- feat: Pass new method `loadRoutes` to plugins
- feat: Add alert when legacy behaviors are loaded
- feat: Add option and method `addRoutesHandlers`
- feat: Add store to tracer
- feat: Create configuration file from scaffold file when it does not exist
- feat: Create folder with examples from scaffold file when path does not exist

### Changed
- feat: Improve traces when checking plugin options
- refactor: Move `path` and `watch` options inside files-loader plugin
- refactor: Reorganize files and folders
- refactor: Refactor Loaders to receive specific onLoad callback instead of full core instance
- refactor: Refactor Config to receive a single argument with all options
- refactor: Refactor Plugins to receive a single argument with all options

### Fixed
- fix: Boolean options with default value of `true` were not working when defined as `false` in config file

### Removed
- feat: Do not add `no behaviors` alert. As behaviors are legacy in v2, now it is not considered a problem

### BREAKING CHANGES
- feat: Renamed configuration file from `mocks-server.config.js` to `mocks.config.js`
- feat: Remove deprecated options `features` and `behaviors`, `path` option should be used instead
- feat: Remove deprecated option `feature`, `behavior` option should be used instead
- feat: Legacy mocks defined using v1 format have to be loaded from folder defined using option `pathLegacy` instead of `path`, which now is used to define the folder from which load routes and mocks in v2 format. Folder defined with `pathLegacy` option will not be created automatically if it is not found, and the option is not required
- feat: Watching files for mocks in legacy v1 format has to be disabled using `watchLegacy` option instead of `watch`, which now affects only to routes and mocks in v2 format
- feat: `watch` option now is a standard commander boolean, so, to disable watch, argument `--no-watch` has to be provided. (`--no-watchLegacy` for legacy v1 mocks folder)
- feat: Remove `booleanString` option type. Now only `number`, `boolean` or `string` can be used.
- feat: Remove deprecated `onLoadMocks` method, `onChangeMocks` must be used instead
- feat: Remove `onLoadFiles` method. There is no alternative, as it is an internal event of the files-loader plugin and it should't be used by other external pieces
- feat: Legacy mocks have to be loaded using plugins custom method `loadLegacyMocks`. `loadMocks` will be able to handle only v2 mocks
- feat: Listening to changes on legacy mocks has to be added using `onChangeLegacyMocks` instead of `onChangeMocks`, which only is triggered when v2 mocks change
- feat: Remove Accept and language default headers
- feat: Remove `addCustomRouter` method. `addRouter` has to be used instead
- feat: Remove `addCustomSetting` method. `addSetting` has to be used instead
- feat: Remove `features` getter from Server. legacy `behaviors` has to be used instead
- feat: Remove `serverError` getter. Use alerts instead
- feat: Remove `restart` method, use `restartServer` instead


## [1.6.0] - 2020-12-25

### Changed
- chore(release): Upgrade minor version, as previous release was wrongly released as patch

## [1.5.3] - 2020-12-24

### Added
- feat: Add alerts handler, allowing plugins and other internal pieces to inform about errors or warnings, and let plugins access to the list, so they can display it, for example. (#102)
- chore(lint): Add eslint plugin to avoid the usage of `only`.

### Changed
- feat: Rename filesLoader plugin
- test: Move e2e helpers to a subfolder

### Fixed
- fix: Avoid errors when calling to fixtures and behaviors getters if they are not already initialized

## [1.5.2] - 2020-12-21

### Added
- chore(deps): Add support for Node.js v15.x

### Changed
- chore(ci): Migrate from Travis CI to github actions
- test(e2e): Rename acceptance tests into e2e tests

## [1.5.1] - 2020-10-27

### Fixed
- fix(options): Call to new commander option to avoid conflicts in plugins options since new commander version

## [1.5.0] - 2020-10-26

### Added
- feat(filesLoader): Add error object to fileLoader error log

### Changed
- chore(deps): Update dependencies

## [1.4.8] - 2020-06-21

### Fixed
- chore(deps): Move is-promise from devDeps to deps.

### Changed
- chore(deps): Update dependencies

## [1.4.7] - 2020-06-14
### Changed
- chore(deps): Update dependencies

## [1.4.6] - 2020-04-10
### Changed
- Update dependencies

## [1.4.5] - 2020-03-22
### Changed
- Update dependencies

## [1.4.4] - 2020-01-27
### Changed
- Update dependencies

## [1.4.3] - 2020-01-12
### Changed
- Use fixed versioning in dependencies

## [1.4.2] - 2020-01-11
### Changed
- Update dependencies

## [1.4.1] - 2020-01-11
### Fixed
- Conflicts between files with same name and different extension

## [1.4.0] - 2020-01-06
### Added
- Add "addPlugins" configuration.
- Add "disableCommandLineArguments" configuration.
- Add "disableConfigFile" configuration.
- Load configuration and options from file.
- Options can also be passed to the Core Constructor, using the "options" key in the config object.

## [1.3.0] - 2020-01-03
### Added
- Behaviors can now be defined in json format.
- Add behavior "id" property, to be used instead of "name".
- Accept new options object as second argument when defining behaviors programmatically. "id" can be provided as an option.
- Add behaviors "currentId" and "ids" getters, to be used instead of "currentName" and "names"
- Add stop method to plugins.
- Pass new method "load" to plugins, which allows to load fixtures or behaviors definitions programmatically.
- Add "restartServer" method, which should be used instead of "restart".
- Accept "displayName" property in plugins, which improves traces.
- Accept "id" property in fixtures.

### Changed
- Convert filesHandler into a plugin. Load it always internally.

### Fixed
- Plugins start method was not being called again when core "start" method was called.
- Prevent exit process when there is an error loading files.

## [1.2.0] - 2019-12-22
### Added
- Add "fixtures" getter, returning all found fixtures in mocks folder, and inside behaviors.
- Add "addFixturesHandler" method, which allows to use fixtures with custom formats and handle responses.
- Add "id" property to fixtures, which will be unique for each different fixture.
- Add "requestMatchId" property to fixtures, which should be the same for fixtures handling same requests.
- Add "request" getter to fixtures, which returns an object describing which requests will handle.
- Add "response" getter to fixtures, which returns an object describing how will be the sent response.
- Add "addRouter" method. "addCustomRouter" is marked for deprecation.
- Add "addSetting" method. "addCustomSetting" is marked for deprecation.
- Add "all" getter to settings.
- Add "extendedFrom" getter to behavior.
- Add "removeRouter" method.
- Add "settings.getValidOptionName" method.

### Changed
- Files handler now supports creating fixtures or behaviors at any folder level.
- Files handler now supports files exporting a single behavior or fixture.
- Changed "Behaviors" getters. Data now is not parsed, and returns directly fixtures collections, or, in the case of "all" getter, it returns and object containing behavior names as "keys", containing respective fixtures collections. (It is not considered as a breaking change, as it is an experimental interface yet, as it is indicated in the documentation)
- Change settings automatically to first found behavior if no one is defined.
- Improve start, init and stop server methods. Now support multiple concurrent calls.
- tracer.set method "transport" argument now is passed as second argument. Default value is "console".
- Change "boom" dependency. Now "@hapi/boom" is used.

## [1.1.0] - 2019-12-07
### Changed
- "path" option has "mocks" value by default. The server will create path if it does not exist.

### Fixed
- Fix server started log. Was always printing localhost, without taking into account custom "host" option.

## [1.0.0] - 2019-11-29
### Added
- Emit new load:files event.
- Listen to programmatic change of port and host settings for restarting the server.
- Allow "register" property in plugins, which will be called during plugins registration process.

### Changed
- Migrate core from [@mocks-server/main, v1.3.0](https://github.com/mocks-server/main/releases/tag/v1.3.0). For further info read the [previous repository CHANGELOG.md](https://github.com/mocks-server/main/blob/v1.3.0/CHANGELOG.md#130---2019-11-17)
- Export core, which can be used only programmatically. (Binary is distributed in the [@mocks-server/main](https://github.com/mocks-server/main) package).
- Remove admin-api and inquirer-cli. Both are now plugins with their own repositories.

### Fixed
- Stop files watcher when `stop` method is called.

