# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

### Added
### Changed
### Fixed
### Removed

## [unreleased]

### Changed

- chore(deps): Update dependencies

## [7.0.0] - 2022-09-14

### Removed
- feat: Remove default client methods. Class `AdminApiClient` has to be used instead.

## [6.2.0] - 2022-08-11

### Added
- feat(#390): Add `https` and `agent` options to the `configClient` method

## [6.1.0] - 2022-08-04

### Added
- feat: Export AdminApiClient class allowing to create clients.

### Changed

- refactor: Migrate to TypeScript
- refactor: Add class allowing to create multiple clients. Keep global client methods creating a default client and exporting its methods.
- refactor: Use default host and port values from `@mocks-server/admin-api-paths`

## [6.0.0] - 2022-07-22

### Changed

- feat: BREAKING CHANGE. Modify methods to adapt them to the new plugin-admin-api@3.2.0 REST API

## [5.0.2] - 2022-07-05

### Changed
- refactor: Rename fetch variable into crossFetch

## [5.0.1] - 2022-06-03

### Changed
- chore(deps): Update devDependencies

## [5.0.0] - 2022-05-23

### Changed
- feat: BREAKING CHANGE. Change main property in package.json. Now it points to `index.cjs.js` file

### Removed
- feat: BREAKING CHANGE. Remove legacy methods readBehaviors, readBehavior, readFixtures and readFixture.
- feat: BREAKING CHANGE. Drop support for Node.js 12.x

### Fixed
- chore: Fix repository property in package.json

## [4.0.1] - 2022-03-28

### Changed
- chore(deps): Update dependencies
- chore(deps): Update devDependencies
- chore: Migrate to monorepo

## [4.0.0] - 2021-12-05

### Changed
- feat: Change default `baseUrl` config to `http://127.0.0.1:3100` for better NodeJS 17 support
- chore: Support any NodeJs version >=12.0.0
- chore: Run tests also in NodeJs 17 in pipelines. Remove tests execution using NodeJs 15
- chore: Update devDependencies

### Fixed
- docs: Remove broken npm dependencies badge

## [3.1.0] - 2021-05-24

### Added
- feat: Add node v16.x to engines

### Changed
- Update dependencies

## [3.0.0] - 2021-02-17

### Added
- feat: Expose one different method for each action.
- feat: Reject promises in case of status code different to 2xx

### Changed
- feat: Rename `apiPath` config property into `adminApiPath`
- feat: Update mocks-server dependencies to v2 beta versions and adapt routes and tests.

### Removed
- feat: Make entities private

### BREAKING CHANGES
- Core and plugins updated to v2. Please read the [migration from v1.x guide](https://www.mocks-server.org/docs/guides-migrating-from-v1) and the [Core v2 release notes](https://github.com/mocks-server/core/releases/tag/v2.0.0) for further info.
- Rename `apiPath` config property into `adminApiPath`
- Removed previous entity-based methods

## [3.0.0-beta.2] - 2021-02-16

### Changed
- chore(deps): Update dependencies. Adapt tests
- feat: Rename `apiPath` config property into `adminApiPath`
- feat: Rename `readMockCustomRoutesVariants` method into `readCustomRoutesVariants`
- feat: Rename `addMockCustomRouteVariant` method into `useRouteVariant`
- feat: Rename `restoreMockRoutesVariants` method into `restoreRoutesVariants`

## [3.0.0-beta.1] - 2021-02-15

### Added
- feat: Expose one different method for each action.
- feat: Reject promises in case of status code different to 2xx

### Changed
- feat: Update mocks-server dependencies to v2 beta versions and adapt routes and tests.

### Removed
- feat: Make entities private

### Breaking change
- Removed previous entity-based methods

## [2.1.0] - 2020-12-26

### Added
- feat: Add method for reading alerts (#94)

### Changed
- chore(lint): Lint mocks folder
- test(refactor): Move helpers to a support folder

### Fixed
- fix: Remove mocks-server-plugin tag from package.json (#93)

## [2.0.5] - 2020-12-21

### Added
- chore(deps): Add support for Node.js v15.x

### Changed
- chore(ci): Migrate from Travis CI to github actions

## [2.0.4] - 2020-10-27
### Changed
- Update dependencies

## [2.0.3] - 2020-06-14
### Changed
- Update dependencies

## [2.0.2] - 2020-04-10
### Changed
- Update dependencies

## [2.0.1] - 2020-03-22
### Changed
- Update dependencies

## [2.0.0] - 2020-03-01
### Changed
- feat: [BREAKING CHANGE] Stop using @data-provider. (admin-api-client-data-provider package available for that purpose).
- feat: Use cross-fetch for making requests.
- chore(deps): Update dev-dependencies

## [1.0.3] - 2020-01-26
### Changed
- Update dependencies

## [1.0.2] - 2020-01-12
### Changed
- Update dependencies
- Use fixed versioning in dependencies.

## [1.0.1] - 2020-01-12
### Changed
- Update dependencies
- Avoid checking specific version in e2e tests

## [1.0.0] - 2019-12-24
### Added
- First release
