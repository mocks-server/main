# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [To be removed]
- Do not export deprecated Behavior Class

## [unreleased]
### Added
### Changed
### Fixed
### Removed
### Breaking change

## [2.4.0] - 2021-07-07

### Changed
- chore(deps): Update mocks-server/core dependency to 2.4.0 (Support application/x-www-form-urlencoded)
- chore(deps): Update devDependencies

## [2.3.3] - 2021-05-29

### Changed
- chore(deps): Update mocks-server/core dependency to 2.3.3 (disable validations if ajv initialization fails)
- chore(deps): Update devDependencies

## [2.3.2] - 2021-05-25

### Changed
- Update dependencies

## [2.3.1] - 2021-05-06

### Changed
- chore(deps): Update mocks-server/core dependency to 2.3.1 (fix response validation)

## [2.3.0] - 2021-05-06

### Added
- chore: Support Node.js v16.x

### Changed
- chore(deps): Update mocks-server/core dependency to 2.3.0 (Validations)
- chore(deps): Update devDependencies

## [2.2.0] - 2021-04-14

### Changed
- chore(deps): Update mocks-server/core dependency to 2.2.0 (Babel support)
- chore(deps): Update devDependencies

## [2.1.0] - 2021-03-24

### Changed
- chore(deps): Update mocks-server/core dependency to 2.1.0
- chore(deps): Update devDependencies

## [2.0.0] - 2021-02-17

### Changed
- docs(readme): Add main features. Add interactive cli image
- test(e2e): Remove duplicated e2e tests. Add scaffold e2e tests

### BREAKING CHANGES
- Core and plugins updated to v2. Please read the [migration from v1.x guide](https://www.mocks-server.org/docs/guides-migrating-from-v1) and the [Core v2 release notes](https://github.com/mocks-server/core/releases/tag/v2.0.0) for further info.
- Remove Server and Cli constructors. @mocks-server/core has to be used instead.

## [2.0.0-beta.2] - 2021-02-16

### Added
- docs(readme): Add links

### Changed
- chore(deps): Update dependencies. Adapt tests.

## [2.0.0-beta.1] - 2021-02-15

### Changed
- docs(readme): Add main features. Add interactive cli image
- test(e2e): Remove duplicated e2e tests. Add scaffold e2e tests

### Breaking change
- Remove Server and Cli constructors. @mocks-server/core has to be used instead.

## [1.9.0] - 2020-12-25

### Added
- test(E2E): Add more start/stop cli plugin E2E tests
- test(E2E): Add alerts E2E tests

### Changed
- Update dependencies
- Update core version to [1.6.0](https://github.com/mocks-server/core/releases/tag/v1.6.0)
- Update plugin-inquirer-cli version to [1.4.1](https://github.com/mocks-server/plugin-inquirer-cli/releases/tag/v1.4.1)
- Update plugin-admin-api version to [1.5.0](https://github.com/mocks-server/plugin-admin-api/releases/tag/v1.5.0)
- test(E2E): Move support files to support folder

## [1.8.8] - 2020-12-21

### Added
- chore(deps): Add support for Node.js v15.x

### Changed
- chore(ci): Migrate from Travis CI to github actions
- test(e2e): Rename acceptance tests into e2e tests

## [1.8.7] - 2020-10-27
### Changed
- chore(deps): Update dependencies

## [1.8.6] - 2020-06-21
### Changed
- chore(deps): Update dependencies

## [1.8.5] - 2020-06-14
### Changed
- chore(deps): Update dependencies

## [1.8.4] - 2020-04-10
### Changed
- Update dependencies

## [1.8.3] - 2020-03-22
### Changed
- chore(deps): update dependencies

## [1.8.2] - 2020-01-12
### Changed
- Update dependencies
- Update core version to [1.4.3](https://github.com/mocks-server/core/releases/tag/v1.4.3)
- Update plugin-inquirer-cli version to [1.3.1](https://github.com/mocks-server/plugin-inquirer-cli/releases/tag/v1.3.1)
- Update plugin-admin-api version to [1.4.1](https://github.com/mocks-server/plugin-admin-api/releases/tag/v1.4.1)

## [1.8.1] - 2020-01-12
### Changed
- Update dependencies
- Update core version to [1.4.2](https://github.com/mocks-server/core/releases/tag/v1.4.2)
- Update plugin-inquirer-cli version to [1.3.0](https://github.com/mocks-server/plugin-inquirer-cli/releases/tag/v1.3.0)
- Update plugin-admin-api version to [1.4.0](https://github.com/mocks-server/plugin-admin-api/releases/tag/v1.4.0)

## [1.8.0] - 2020-01-06
### Changed
- Upgrade core version to [1.4.0](https://github.com/mocks-server/core/releases/tag/v1.4.0)

## [1.7.2] - 2020-01-04
### Changed
- Upgrade plugin-inquirer-cli version to [1.2.0](https://github.com/mocks-server/plugin-inquirer-cli/releases/tag/v1.2.0)

## [1.7.1] - 2020-01-03
### Changed
- Upgrade plugin-admin-api version to [1.3.1](https://github.com/mocks-server/plugin-admin-api/releases/tag/v1.3.1)

## [1.7.0] - 2020-01-03
### Changed
- Upgrade core version to [1.3.0](https://github.com/mocks-server/core/releases/tag/v1.3.0)
- Upgrade devDependencies.
- Remove usage of core deprecated "onLoadMocks" method.

## [1.6.1] - 2019-12-25
### Changed
- Upgrade plugin-admin-api dependency to 1.2.1

## [1.6.0] - 2019-12-24
### Changed
- Upgrade plugin-admin-api dependency to 1.2.0

## [1.5.0] - 2019-12-22
### Changed
- Upgrade core dependency to 1.2.0

## [1.4.0] - 2019-12-07
### Changed
- Core code migrated to @mocks-server/core
- Admin API code migrated to @mocks-server/plugin-admin-api
- Plugin Inquirer CLI code migrated to @mocks-server/plugin-inquirer-cli
- Change "behaviors" option by "path", now has "mocks" value by default.

## [1.3.0] - 2019-11-17
### Added
- Add programmatic Classes end-to-end tests
- Add files watcher end-to-end tests

### Changed
- Full refactor for making it pluggable.
- Split code into core, cli and api main Classes, which are intended to be published separately.

## [1.2.0] - 2019-11-13
### Added
- Add api acceptance tests

### Changed
- Upgrade dependencies

### Fixed
- Catch server.listen error and reject start method promise with it when occurs.

## [1.1.1] - 2019-11-12
### Changed
- Change readme. Add links to docs website.

## [1.1.0] - 2019-11-08
### Changed
- Change "feature" concept by "behavior". Maintain old "feature" options and urls as aliases for maintaining compatibility.
- Upgrade dependencies

## [1.0.3] - 2019-11-08
### Fixed
- Fix examples and badges in readme.

## [1.0.2] - 2019-11-08
### Changed
- Project forked from xbyorange/mocks-server. Fixed license. Read NOTICE for further details

### Fixed
- Fix some minor Sonar bugs and code smells.

## [1.0.1] - 2019-06-04
### Fixed
- Upgrade dependencies to fix potential security vulnerability
- Bind winston tracer methods to winston tracer instance to fix an issue produced by new Winston version as described in: https://github.com/winstonjs/winston/issues/1577

## [1.0.0] - 2019-06-04
### Changed
- Forked from xbyorange mocks-server gitlab private repository.
