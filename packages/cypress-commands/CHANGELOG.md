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
- feat: BREAKING CHANGE. Rename command `mocksSetMock` to `setCollection`
- feat: BREAKING CHANGE. Rename command `mocksSetSettings` to `mocksSetConfig`
- feat: BREAKING CHANGE. Rename command `mocksRestoreRoutesVariants` to `mocksRestoreRouteVariants`
- feat: BREAKING CHANGE. Rename command `mocksConfig` to `mocksConfigAdminApiClient`

### Removed
- feat: BREAKING CHANGE. Remove environment variable `MOCKS_SERVER_BASE_URL`
- feat: BREAKING CHANGE. Remove environment variable `MOCKS_SERVER_ADMIN_API_PATH`

### Added
- feat: Add environment variable `MOCKS_SERVER_ADMIN_API_PORT`
- feat: Add environment variable `MOCKS_SERVER_ADMIN_API_HOST`

## [4.0.2] - 2022-07-05

### Changed
- chore(deps): Update @mocks-server/admin-api-client

## [4.0.1] - 2022-06-03

### Changed
- chore(deps): Update devDependencies

## [4.0.0] - 2022-05-23

### Removed
- feat: BREAKING CHANGE. Remove mocksSetBehavior v1 legacy command
- feat: BREAKING CHANGE. Drop support for Node.js 12.x

### Fixed
- chore: Fix repository property in package.json

## [3.0.2] - 2022-03-28

### Changed
- chore(deps): Update dependencies
- chore(deps): Update devDependencies

## [3.0.1] - 2022-03-23

### Changed
- chore(deps): Update devDependencies
- chore: Migrate to monorepo

## [3.0.0] - 2021-12-05

### Changed
- chore(deps): BREAKING CHANGE - Update `@mocks-server/admin-api-client` to 4.0.0, so from now default `MOCKS_SERVER_BASE_URL` is `http://127.0.0.1:3100`
- chore: Support any NodeJs version >=12.0.0
- chore: Run tests also in NodeJs 17 in pipelines. Remove tests execution using NodeJs 15
- chore: Update devDependencies

### Fixed
- docs: Remove broken npm dependencies badge

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
