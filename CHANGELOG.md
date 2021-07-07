# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [To be removed]
- Remove all legacy plugins, options and methods related to v1

## [unreleased]
### Added
### Changed
### Fixed
### Removed
### BREAKING CHANGES

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

