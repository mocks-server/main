# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
### Changed
### Fixed
### Removed

## [Unreleased]

### Added
- feat: Add `root` getter returning root config object to namespaces. Add it also to root config as an alias in order to keep the same interface.
- feat: Add `programmaticLoadedValues` getter returning initial values from programmatic config. Useful for debugging purposes
- feat: Add `fileLoadedValues` getter returning initial values from file config. Useful for debugging purposes
- feat: Add `envLoadedValues` getter returning initial values from environment config. Useful for debugging purposes
- feat: Add `argsLoadedValues` getter returning initial values from args. Useful for debugging purposes

### Changed
- refactor: Do not create empty namespaces in internal environment configuration

## [1.0.2] - 2022-06-03

### Changed
- chore(deps): Update devDependencies

## [1.0.1] - 2022-05-23

### Changed
- docs: Remove Mocks Server logo and title in order to make clearer that this module is not coupled to Mocks Server and it can be used in any other project

## [1.0.0] - 2022-05-23

### Added
- feat: First release
