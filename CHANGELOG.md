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
- Do not provide the core instance to request handlers. This is made only to maintain temporarily backward compatibility with api plugin, because it is responding with full behaviors collection in deprecated api endpoints, which produces a circular reference if the core is saved as a private property of the FixtureHandler Class.

## [unreleased]
### Added
### Changed
### Fixed
### Removed

## [1.2.0] - 2019-12-09
### Added
- Add "fixtures" getter, returning all found fixtures in mocks folder, and inside behaviors.
- Add "addFixturesParser" method, which allows to use fixtures with custom formats and handle responses.
- Add "id" property to fixtures, which will be unique for each different fixture.
- Add "matchId" property to fixtures, which will be the same for fixtures handling same requests.
- Add "addRouter" method. "addCustomRouter" is marked for deprecation.
- Add "addSetting" method. "addCustomSetting" is marked for deprecation.

### Changed
- Files handler now supports creating fixtures or behaviors at any folder level.
- Files handler now supports files exporting a single behavior or fixture.
- Changed "Behaviors" getters. Data now is not parsed, and returns directly fixtures collections, or, in the case of "all" getter, it returns and object containing behavior names as "keys", containing respective fixtures collections. (It is not considered as a breaking change, as it is an experimental interface yet, as it is indicated in the documentation)

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

