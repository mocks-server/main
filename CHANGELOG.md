# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [To be deprecated]
- Remove deprecated "/mocks" api path.
- Remove property "name" from behavior model.

## [unreleased]
### Added
### Changed
- chore(deps): Update dependencies
### Fixed
### Removed

## [1.4.7] - 2020-12-21

### Added
- chore(deps): Add support for Node.js v15.x

### Changed
- chore(ci): Migrate from Travis CI to github actions
- test(e2e): Rename acceptance tests into e2e tests

## [1.4.6] - 2020-10-27
### Changed
- chore(deps): Update dependencies

## [1.4.5] - 2020-06-21
### Changed
- chore(deps): Update dependencies

## [1.4.4] - 2020-06-14
### Changed
- chore(deps): Update dependencies

## [1.4.3] - 2020-04-10
### Changed
- Update dependencies

## [1.4.2] - 2020-03-22
### Changed
- Update dependencies

## [1.4.1] - 2020-01-12
### Changed
- Update dependencies
- Use fixed versioning in dependencies

## [1.4.0] - 2020-01-12
### Added
- Add display name

## [1.3.2] - 2020-01-12
### Changed
- Update dependencies

## [1.3.1] - 2020-01-03
### Fixed
- Change @mocks-server/core peerDependency to ^1.3.0, which is the first one with behavior id property.

## [1.3.0] - 2020-01-03
### Added
- Add property id to behaviors model.

### Changed
- Upgrade dependencies.

## [1.2.1] - 2019-12-25
### Changed
- Upgrade admin-api-paths dependency.

## [1.2.0] - 2019-12-24
### Added
- Add "adminApiPath" option, which allows to change the new API path ("/admin").
- Add "adminApiDeprecatedPaths" option, which allows to disable the deprecated API path ("/mocks").
- Add new api resources under "/admin" path.

## [1.1.0] - 2019-12-07
### Changed
- Upgrade "@mocks-server" core dependency. Use new "path" option.

## [1.0.0] - 2019-12-06
- Migrate administration api from [@mocks-server/main, v1.3.0](https://github.com/mocks-server/main/releases/tag/v1.3.0). For further info read the [previous repository CHANGELOG.md](https://github.com/mocks-server/main/blob/v1.3.0/CHANGELOG.md#130---2019-11-17)
- Export Plugin, which can be used only programmatically. (Binary is still distributed in the [@mocks-server/main](https://github.com/mocks-server/main) package).
- Remove core and inquirer-cli. Both have now their own repositories.
