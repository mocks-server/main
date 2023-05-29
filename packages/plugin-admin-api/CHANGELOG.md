# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [To be deprecated]

### Added
### Changed
### Fixed
### Removed

## [unreleased]

## [4.0.1] - 2023-05-29

### Changed

- chore(deps): Update dependencies

## [4.0.0] - 2022-09-14

### Removed
- feat: Remove custom router "/admin" from mock server. Admin API is only available at its own server from now.

### Added
- feat: Add url and method to route not found log

### Changed
- chore(deps): Update dependencies
- chore(deps): Require @mocks-server/core@4.x in peerDependencies

## [3.4.0] - 2022-08-11

### Added
- feat(#390): Add HTTPS support
- feat(#390): Add `https.enabled`, `https.cert` and `https.key` options


## [3.3.1] - 2022-08-04

### Changed
- refactor: Use default host and port values from `@mocks-server/admin-api-paths`

## [3.3.0] - 2022-07-29

### Added
- feat: Add new disabled property of variants to openapi.
- feat: Support undefined method in variants 

## [3.2.0] - 2022-07-22

### Added
- feat(#364): Start API in a different server. Change urls and models.
- feat(#360): Add Swagger-ui

### Changed
- feat: Use new core.server API
- feat: Use core.mock.restoreRouteVariants
- feat: Use core.mock.routes.plain getter
- feat: Use core.mock.routes.plainVariants getter
- feat: Use core.mock.customRouteVariants getter
- feat: Use core.mock.collections.plain getter

## [3.1.0] - 2022-06-27

### Changed
- feat: Use new custom core API

## [3.0.1] - 2022-06-03

### Changed
- chore(deps): Update devDependencies

## [3.0.0] - 2022-05-23

### Added
- feat(#249): Always add `cors` middleware to admin-api plugin. Even when it is disabled in the core for mocked routes.

### Removed
- feat: BREAKING CHANGE. Remove legacy APIs under the `/legacy` path
- feat: BREAKING CHANGE. Remove `adminApiDeprecatedPaths` option.
- feat: BREAKING CHANGE. Drop support for Node.js 12.x

### Changed
- feat: BREAKING CHANGE. Change received arguments to make the plugin compatible with core v3
- feat: BREAKING CHANGE. Use new configuration method. Now plugin options have to be defined in the `plugins.adminApi` namespace.

 ### Fixed
- chore: Fix repository property in package.json

## [2.2.1] - 2022-03-28

### Changed
- chore(deps): Update dependencies
- chore(deps): Update devDependencies
- chore: Migrate to monorepo

## [2.2.0] - 2021-12-05

### Changed
- chore: Support any NodeJs version >=12.x.
- chore: Run tests also in NodeJs 17 in pipelines. Remove tests execution using NodeJs 15
- chore: Update devDependencies

### Fixed
- docs: Remove broken npm dependencies badge

## [2.1.0] - 2021-05-24

### Added
- feat: Add node v16.x to engines

### Changed
- Update dependencies

## [2.0.0] - 2021-02-17

### Added
- Add mocks, routes, routes-variants and mock-custom-routes-variants apis

### Changed
- feat: Move behaviors and fixtures apis under legacy folder
- refactor: Use helper to create routers with same structure
- chore(deps): Update dependencies

### Removed
- Remove deprecated api paths
- Remove adminApiDeprecatedPaths option.

### BREAKING CHANGES
- Move behaviors and fixtures apis under legacy folder
- Remove deprecated api paths
- Remove adminApiDeprecatedPaths option.

## [2.0.0-beta.2] - 2021-02-16

### Changed
- chore(deps): Update mocks-server/core dependency. Adapt tests.

## [2.0.0-beta.1] - 2021-02-14

### Added
- Add mocks, routes, routes-variants and mock-custom-routes-variants apis

### Changed
- Move behaviors and fixtures apis under legacy folder
- refactor: Use helper to create routers with same structure

### Removed
- Remove deprecated api paths
- Remove adminApiDeprecatedPaths option.

## [1.5.0] - 2020-12-25

### Added
- feat(#78): Add alerts router
- chore(lint): Add eslint plugin to avoid only in tests

### Changed
- chore(deps): Update dependencies
- test(e2e): Move utils to a support folder
- feat: Add/remove routers on start/stop plugin methods, not in init method.
- style: Remove redundant `await` on a non-promise

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
