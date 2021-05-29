# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed
### Breaking changes

## [2.1.0] - 2021-05-29
### Added
- feat: Add Cypress v7.x to peerDependencies
- feat: Add node v16.x to engines

### Changed
- Update dependencies

## [2.0.0] - 2021-02-17

### Added
- feat: Add `mocksConfig`, `mocksSetMock`, `mocksUseRouteVariant` and `mocksRestoreRoutesVariants` commands
- feat: Add support for environment variables `MOCKS_SERVER_ENABLED`, `MOCKS_SERVER_BASE_URL` and `MOCKS_SERVER_ADMIN_API_PATH` (#3)

### Changed
- feat: Rename `mocksServerSetBehavior` command to `mocksSetBehavior`
- feat: Rename `mocksServerSetDelay` command to `mocksSetDelay`
- feat: Rename `mocksServerSetSettings` command to `mocksSetSettings`
- chore(deps): Update dependencies to mocks-server v2 compatible versions
- chore(deps): Update Cypress to v6 in tests

### Removed
- feat: Remove `config` method, `cy.mocksConfig` command should be used instead
- test(e2e): Remove e2e tests using data-provider, as it does not concern to this package

### Breaking changes
- Rename `mocksServerSetBehavior` command to `mocksSetBehavior`
- Rename `mocksServerSetDelay` command to `mocksSetDelay`
- Rename `mocksServerSetSettings` command to `mocksSetSettings`
- Remove `config` method, `cy.mocksConfig` command should be used instead

## [2.0.0-beta.1] - 2021-02-16

### Added
- feat: Add `mocksConfig`, `mocksSetMock`, `mocksUseRouteVariant` and `mocksRestoreRoutesVariants` commands
- feat: Add support for environment variables `MOCKS_SERVER_ENABLED`, `MOCKS_SERVER_BASE_URL` and `MOCKS_SERVER_ADMIN_API_PATH` (#3)

### Changed
- feat: Rename `mocksServerSetBehavior` command to `mocksSetBehavior`
- feat: Rename `mocksServerSetDelay` command to `mocksSetDelay`
- feat: Rename `mocksServerSetSettings` command to `mocksSetSettings`
- chore(deps): Update dependencies to mocks-server v2 compatible versions

### Removed
- feat: Remove `config` method, `cy.mocksConfig` command should be used instead
- test(e2e): Remove e2e tests using data-provider, as it does not concern to this package

### Breaking changes
- Rename `mocksServerSetBehavior` command to `mocksSetBehavior`
- Rename `mocksServerSetDelay` command to `mocksSetDelay`
- Rename `mocksServerSetSettings` command to `mocksSetSettings`
- Remove `config` method, `cy.mocksConfig` command should be used instead

## [1.0.8] - 2020-12-21

### Added
- chore(deps): Add support for Node.js v15.x
- chore(deps): Support Cypress v6.x

### Changed
- chore(ci): Migrate from Travis CI to github actions

## [1.0.7] - 2020-10-28
### Changed
- Update dependencies

## [1.0.6] - 2020-06-14
### Changed
- Update dependencies

## [1.0.5] - 2020-04-10
### Changed
- Update dependencies

## [1.0.4] - 2020-03-22
### Changed
- chore(deps): Update dependencies

## [1.0.3] - 2020-03-01
### Changed
- chore(deps): Add Cypress ^4.0.0 to peerDependencies
- chore(deps): Update dependencies

## [1.0.2] - 2020-01-12
### Changed
- Update dependencies
- Use fixed versioning

## [1.0.1] - 2020-01-12
### Changed
- Update dependencies

## [1.0.0] - 2019-12-28
### Added
- First release
