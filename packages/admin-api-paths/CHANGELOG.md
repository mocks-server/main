# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]
### Added
### Changed
### Fixed
### Removed

## [5.0.0] - 2022-09-14

### Removed
- feat: Remove legacy paths


## [4.2.0] - 2022-08-11

### Added

- feat: Add HTTPS_PROTOCOL constant


## [4.1.0] - 2022-08-04

### Added

- feat: Add DEFAULT_PORT, DEFAULT_HOST, DEFAULT_CLIENT_HOST and DEFAULT_PROTOCOL constants
- docs: Add installation chapter

### Changed

- refactor: Migrate to TypeScript

## [4.0.0] - 2022-07-22

### Added

- feat: Add new paths for admin-api-plugin

### Changed

- feat: BREAKING CHANGE. Add `LEGACY_` prefix to all previous paths.

## [3.0.1] - 2022-06-03

### Changed
- chore(deps): Update devDependencies

## [3.0.0] - 2022-05-23

### Removed
- feat: BREAKING CHANGE. Remove LEGACY, BEHAVIORS and FIXTURES path
- feat: BREAKING CHANGE. Drop support for Node.js 12.x

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

## [2.1.0] - 2021-02-17

### Added
- feat: Add node v16.x to engines

### Changed
- Update dependencies

## [2.0.0] - 2021-02-17

### Added
- feat: Add mocks, routes and routes-variants paths
- feat: Add legacy path
- feat: Add mock-custom-routes-variants path

### Changed
- Update dependencies

### BREAKING CHANGES
- Behaviors and fixtures routes have to be used under legacy path

## [2.0.0-beta.2] - 2021-02-14

### Added
- feat: Add mock-custom-routes-variants path

## [2.0.0-beta.1] - 2021-02-03

### Added
- feat: Add mocks, routes and routes-variants paths
- feat: Add legacy path

## [1.1.0] - 2020-12-25

### Added
- feat: Add alerts path

### Fixed
- fix: Remove mocks-server-plugin tag from package.json (#87)

## [1.0.9] - 2020-12-21

### Added
- chore(deps): Add support for Node.js v15.x

### Changed
- chore(ci): Migrate from Travis CI to github actions

## [1.0.8] - 2020-10-26
### Changed
- Update dependencies

## [1.0.7] - 2020-06-14
### Changed
- Update dependencies

## [1.0.6] - 2020-04-10
### Changed
- Update dependencies

## [1.0.5] - 2020-03-22
### Changed
- Update dependencies

## [1.0.4] - 2020-01-12
### Changed
- Use fixed versioning in dependencies

## [1.0.3] - 2020-01-12
### Changed
- Update dependencies

## [1.0.2] - 2019-12-25
### Fixed
- Fix export format

## [1.0.1] - 2019-12-24
### Fixed
- Fix README badges

## [1.0.0] - 2019-12-24
### Added
- First release
