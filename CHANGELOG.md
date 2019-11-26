# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [To be deprecated]
- Deprecate options "features" and "feature".
- Remove "features" getter from Server
- Remove Server and Cli constructors. Use @mocks-server/core instead

## [unreleased]
### Added
### Changed
### Fixed
### Removed

## [1.0.0] -
### Added
- Emit new load:files event.
- Listen to programmatic change of port and host settings for restarting the server.
- Allow "register" property in plugins, which will be called during plugins registration process.

### Changed
- Migrate core from [@mocks-server/main, v1.3.0](https://github.com/mocks-server/main/releases/tag/v1.3.0). For further info read the [previous repository CHANGELOG.md](https://github.com/mocks-server/main/blob/v1.3.0/CHANGELOG.md#130---2019-11-17)
- Export core, which can be used only programmatically. (Binary is distributed in the [@mocks-server/main](https://github.com/mocks-server/main) package).
- Remove admin-api and inquirer-cli. Both are now plugins with their own repositories.

