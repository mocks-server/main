# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed
### BREAKING CHANGES

## [4.0.0] - 2021-12-05

### Changed
- feat: Change default `baseUrl` config to `http://127.0.0.1:3100` for better NodeJS 17 support
- chore: Support any NodeJs version >=12.0.0
- chore: Run tests also in NodeJs 17 in pipelines. Remove tests execution using NodeJs 15
- chore: Update devDependencies

### Fixed
- fix: Remove console
- docs: Remove broken npm dependencies badge

## [3.0.0] - 2021-05-25

### Added
- feat: Support node 16
- feat: Add client methods for Mocks Server v2 API

### Changed
- chore(deps): Update devDependencies

### BREAKING CHANGES
- chore(deps): Update to data-provider v3
- chore(deps): Update to mocks-server v2

## [2.1.0] - 2020-12-26

### Added
- feat: Add alerts providers (#114)

### Changed
- chore(deps): Update dependencies

### Fixed
- docs: Fix some readme typos

### Removed
- fix: Remove mocks-server-plugin tag from package.json

## [2.0.5] - 2020-12-21

### Added
- chore(deps): Add support for Node.js v15.x

### Changed
- chore(ci): Migrate from Travis CI to github actions

## [2.0.4] - 2020-10-26
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
- chore(deps): Update dependencies

## [2.0.0] - 2020-03-01
### Changed
- chore: Project migrated from @mocks-server/admin-api-client
- chore(deps): [BREAKING CHANGE] Updated @data-provider/core to v2. Not compatible with projects using v1.
- chore(deps): [BREAKING CHANGE] Moved @data-provider/axios dependency to peer-dependencies.
- chore(umd): [BREAKING CHANGE] Renamed umd global variable to "mocksServerAdminApiClientDataProvider"

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
