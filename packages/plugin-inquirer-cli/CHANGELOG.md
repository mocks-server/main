# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed
### BREAKING CHANGE

## [4.0.0] - 2022-09-14

### Removed
- feat: Remove support for legacy mocks.delay option

### Changed
- chore(deps): Update dependencies
- chore(deps): Require @mocks-server/core@4.x in peerDependencies

## [3.3.0] - 2022-08-11

### Added
- feat(#390): Change displayed protocol based on the value of the `server.https.enabled` option

### Fixed
- fix(#408): Refresh interface when port changes

## [3.2.0] - 2022-07-22

### Added
- Add debounce to refresh menu function to avoid too much renders

### Changed
- feat: Use core v3.6 new options
- feat: Use core.mock.restoreRouteVariants method
- feat: Use core.mock.customRouteVariants getter
- feat: Use core.server.restart method
- feat: Use core.mock.onChange method
- feat: Use core.mock.routes.plain getter
- feat: Use core.mock.routes.plainVariants getter
- feat: Use core.mock.collections.selected getter
- feat: Use core.mock.collections.ids getter
- feat: Use core.mock.collections.plain getter
- feat: Use core.alerts.onChange method
- feat: Rename concepts

## [3.1.0] - 2022-06-27
### Changed
- refactor: Remove unused property
- feat(#334): Use new custom core API

### Added
- feat: Display context in errors and warnings

## [3.0.1] - 2022-06-03

### Changed
- chore(deps): Update devDependencies

## [3.0.0] - 2022-05-23

### Added
- feat: Add emojis option allowing to disable emojis.

### Removed
- feat: BREAKING CHANGE. Remove support for v1 legacy mode
- feat: BREAKING CHANGE. Drop support for Node.js 12.x

### Changed
- feat: BREAKING CHANGE. Change received arguments to make the plugin compatible with core v3
- feat: BREAKING CHANGE. Use new configuration method. Now plugin options have to be defined in the `plugins.inquirerCli` namespace.

### Fixed
- chore: Fix repository property in package.json

## [2.2.1] - 2022-03-28

### Changed
- chore(deps): Update dependencies
- chore(deps): Update devDependencies
- chore: Migrate to monorepo

## [2.2.0] - 2021-12-05

### Changed
- chore: Support any NodeJs version >=12.0.0
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
- feat: Display current mock.
- feat: Display menus for changing current mock.
- feat: Add menus for changing route variant and restore variants

### Changed
- feat: Display legacy options and menus only when core `pathLegacy` setting has value. Add toggle legacy watch menu.
- refactor: Refresh inquirer main options every time main menu is displayed.
- chore(deps): Update dependencies

### Fixed
- fix: Resolve previous inquirers before displaying a new one
- fix: Start promise was never resolved

### BREAKING CHANGE
- Changed format of `cli` option to boolean (now `--no-cli` has to be used to disable it)

## [2.0.0-beta.2] - 2021-02-16

### Changed
- chore(deps): Update mocks-server/core dependency. Adapt tests.

## [2.0.0-beta.1] - 2021-02-14

### Added
- feat: Display current mock.
- feat: Display menus for changing current mock.
- feat: Add menus for changing route variant and restore variants

### Changed
- feat: Display legacy options and menus only when core `pathLegacy` setting has value. Add toggle legacy watch menu.
- refactor: Refresh inquirer main options every time main menu is displayed.

### Fixed
- fix: Resolve previous inquirers before displaying a new one
- fix: Start promise was never resolved

### BREAKING CHANGE
- Changed format of `cli` option to boolean (now `--no-cli` has to be used to disable it)

## [1.4.1] - 2020-12-25

### Fixed
- fix: Do not stop listening to changeSettings event on stop plugin, as it has to be restarted if `cli` setting changes to `true`

## [1.4.0] - 2020-12-25

### Changed
- chore(release): Upgrade minor version, as previous release was wrongly released as patch

## [1.3.8] - 2020-12-25

### Added
- feat: Add sections headers
- feat: Display alerts (#110)
- style(lint): Add eslint plugin to avoid the usage of `only` in tests

### Changed
- refactor: Move render helpers to a helpers file
- refactor: Remove unused inquirerCli option
- test(e2e): Move support elements to support folder
- docs(readme): Add main features chapter
- chore(deps): Update dependencies

### Fixed
- fix: Add/remove listeners in start/stop methods, not in the init one.

## [1.3.7] - 2020-12-21

### Added
- chore(deps): Add support for Node.js v15.x

### Changed
- chore(ci): Migrate from Travis CI to github actions
- test(e2e): Rename acceptance tests into e2e tests

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
