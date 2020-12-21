# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
- chore(ci): Migrate from Travis CI to github actions
- test(e2e): Rename acceptance tests into e2e tests
### Fixed
### Removed

## [1.3.6] - 2020-10-27
### Changed
- chore(deps): Update dependencies

## [1.3.5] - 2020-06-21
### Changed
- chore(deps): Update dependencies

## [1.3.4] - 2020-06-14
### Changed
- chore(deps): Update dependencies

## [1.3.3] - 2020-04-10
### Changed
- Update dependencies

## [1.3.2] - 2020-03-22
### Changed
- Update dependencies

## [1.3.1] - 2020-01-12
### Changed
- Use fixed versioning

## [1.3.0] - 2020-01-12
### Added
- Add display name

## [1.2.1] - 2020-01-12
### Changed
- Update dependencies

## [1.2.0] - 2020-01-04
### Added
- Add stop method.
- Add reactivity to cli option changes. Cli is automatically started or stopped when cli option changes.

### Changed
- Upgrade "@mocks-server" core dependency to v1.3.0.
- Upgrade devDependencies.
- Remove usage of core deprecated methods.

### Fixed
- Do not display behaviors inquirer if there are no behaviors to select.

## [1.1.0] - 2019-12-07
### Changed
- Upgrade "@mocks-server" core dependency. Use new "path" option.

## [1.0.1] - 2019-12-07
### Fixed
- Print localhost as host in header when host is 0.0.0.0.

## [1.0.0] - 2019-12-06
### Added
- Migrate inquirer cli from [@mocks-server/main, v1.3.0](https://github.com/mocks-server/main/releases/tag/v1.3.0). For further info read the [previous repository CHANGELOG.md](https://github.com/mocks-server/main/blob/v1.3.0/CHANGELOG.md#130---2019-11-17)
- Export Plugin, which can be used only programmatically. (Binary is still distributed in the [@mocks-server/main](https://github.com/mocks-server/main) package).
- Remove core and admin-api. Both have now their own repositories.
