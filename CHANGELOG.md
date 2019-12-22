# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [To be deprecated]
- Deprecate options "features", "behaviors" and "feature".
- Remove "features" getter from Server
- Remove "currentFromCollection" and "currentTotalFixtures" getters from Behaviors.
- Remove "addCustomRouter" method. Use "addRouter".
- Remove "addCustomSetting" method. Use "addSetting".
- Do not provide the core instance to request handlers. This was made only to maintain temporarily backward compatibility with api plugin, because it is responding with full behaviors collection in deprecated api endpoints, producing a circular reference if the core is saved as a private property of the FixtureHandler Class.
- Remove "booleanString" option type (--cli=false). Use commander boolean type, which is used appending "--no-" to the option name (--no-cli);
- Remove "onLoadFiles" method
- Remove "onLoadMocks" method, use "onChangeMocks"

## [unreleased]
### Added
### Changed
### Fixed
### Removed

## [1.2.0] - 2019-12-17
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

