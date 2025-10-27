# Changelog

All notable changes to the Package Installer CLI Ruby gem will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-09-23

### Updated
- Version bump to 1.1.0
- Improved gem packaging and file inclusion
- Enhanced security with comprehensive .gitignore rules
- Updated documentation and README

## [1.0.0] - 2025-09-20

### Added
- Initial Ruby gem wrapper around the Package Installer CLI
- Ruby executable scripts (`pi` and `package-installer`)
- Node.js version checking and compatibility warnings
- Comprehensive error handling for missing dependencies
- Post-install message with setup instructions
- Development dependencies and testing framework
- RuboCop configuration for code quality
- Comprehensive documentation and README

### Features
- Seamless execution of the underlying Node.js CLI
- Automatic argument passing to the Node.js implementation
- Ruby >= 2.6.0 compatibility
- Cross-platform support (Linux, macOS, Windows)

### Dependencies
- Requires Node.js >= 18.0.0 for the underlying CLI functionality
- Ruby development dependencies: bundler, rake, rspec, rubocop