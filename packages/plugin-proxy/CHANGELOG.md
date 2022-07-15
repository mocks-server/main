# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [To be deprecated]

## [unreleased]
### Added
### Changed
### Fixed
### Removed

## [unreleased]

- refactor: Use new core method `variantHandlers.register` instead of the deprecated `addRoutesHandler`

## [3.0.0] - 2022-07-05

### Changed
- feat: Add routes handler "proxy-v4" using new handlers API released on @mocks-server/core@3.5.0. Keep old "legacy" handler for backward compatibility.
- chore(deps): Require @mocks-server/core >=3.5.0 in peerDependencies

## [2.1.0]
### Changed
- feat: Use new custom core API released on v3.2.0

## [2.0.1] - 2022-06-03

### Changed
- chore(deps): Update devDependencies

## [2.0.0] - 2022-05-23

### Changed
- feat: BREAKING CHANGE. Change received arguments to make the plugin compatible with core v3.
- feat: BREAKING CHANGE. Drop support for Node.js 12.x

### Added
- feat: BREAKING CHANGE. Add validation schema

### Fixed
- chore: Fix repository property in package.json

## [1.0.5] - 2022-03-28

### Changed
- chore(deps): Update dependencies
- chore(deps): Update devDependencies
- docs: Modify readme badges

## [1.0.4] - 2022-03-03

### Changed
- chore: Migrated to monorepo
- chore(deps): Update @mocks-server/core
- chore(deps): Update devDependencies

## [1.0.3] - 2021-12-05

### Fixed
- fix: Add `init`, `start` and `stop` methods to avoid alerts

## [1.0.2] - 2021-12-05

### Fixed
- docs: Fix badges

## [1.0.1] - 2021-12-05

### Fixed
- docs: Fix main branch name in badges
- chore(workflows): Fix main branch name

## [1.0.0] - 2021-12-05

### Added
- feat: First release
