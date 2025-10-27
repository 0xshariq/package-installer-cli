# 📦 Package Installer CLI

[![npm version](https://img.shields.io/npm/v/@0xshariq/package-installer.svg)](https://www.npmjs.com/package/@0xshariq/package-installer)
[![License: Apachse-2.0](https://img.shields.io/badge/License-Apachse-2.0-yellow.svg)](https://opensource.org/licenses/Apachse-2.0)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A **powerful, cross-platform CLI** for modern development workflows. Create projects, manage dependencies, analyze codebases, and streamline your development process with intelligent automation.

## 🚀 Core Features

- **🎨 Project Creation**: React, Next.js, Express, Angular, Vue, Rust templates
- **🚀 Cloud Deployment**: Seamless deployment to Vercel, AWS, GitHub Pages
- **📊 Code Analysis**: Comprehensive project analytics and insights
- **📦 Dependency Management**: Smart updates across multiple package managers
- **🩺 Health Diagnostics**: Automated issue detection and fixes
- **🌍 Environment Analysis**: Development environment optimization
- **🗄️ Intelligent Caching**: Performance optimization with smart caching
- **📈 Usage Analytics**: Real-time insights and productivity metrics
- **⚡ Cross-Platform**: Windows, macOS, Linux support

## 📥 Installation

```bash
# Using npm (recommended)
npm install -g @0xshariq/package-installer

# Using yarn
yarn global add @0xshariq/package-installer

# Using pnpm
pnpm add -g @0xshariq/package-installer
```

> **📋 Complete Installation Guide**: For all installation methods including Python, Rust, Ruby, Go, Homebrew, and Docker, see [installation.md](docs/installation.md)

## 🐳 Docker Installation

[![Docker Hub](https://img.shields.io/docker/v/0xshariq/package-installer-cli?label=Docker%20Hub)](https://hub.docker.com/r/0xshariq/package-installer-cli)
[![Docker Image Size](https://img.shields.io/docker/image-size/0xshariq/package-installer-cli/latest)](https://hub.docker.com/r/0xshariq/package-installer-cli)

Run Package Installer CLI in a containerized environment with Docker:

### Quick Usage with Docker

```bash
# Pull the latest image
docker pull 0xshariq/package-installer-cli:latest

# Run interactively with current directory mounted
docker run -it --rm \
  -v "$(pwd)":/home/pi/projects \
  -v ~/.gitconfig:/home/pi/.gitconfig:ro \
  -v ~/.ssh:/home/pi/.ssh:ro \
  0xshariq/package-installer-cli:latest

# Create a new project
docker run -it --rm \
  -v "$(pwd)":/home/pi/projects \
  0xshariq/package-installer-cli:latest create my-app

# Analyze existing project
docker run -it --rm \
  -v "$(pwd)":/home/pi/projects \
  0xshariq/package-installer-cli:latest analyze
```

### Docker Compose Setup

```bash
# Clone the repository
git clone https://github.com/0xshariq/package-installer-cli.git
cd package-installer-cli

# Run with docker-compose
docker-compose run --rm package-installer

# Development mode with hot reload
docker-compose --profile dev run --rm package-installer-dev
```

### Docker Image Variants

| Tag | Description | Use Case |
|-----|-------------|----------|
| `latest` | Latest stable release | Production usage |
| `dev` | Development version | Testing new features |
| `v3.17.5` | Specific version | Version pinning |

### Volume Mounts

- **Projects**: Mount your project directory to `/home/pi/projects`
- **Git Config**: Mount `~/.gitconfig` for Git authentication
- **SSH Keys**: Mount `~/.ssh` for Git repository access

## 🎯 Quick Start

```bash
# Create new project interactively
pi create my-app

# Deploy to cloud platforms
pi deploy

# Analyze existing project
pi analyze

# Check project health
pi doctor

# Update dependencies
pi update

# Clean development artifacts
pi clean
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [� Installation](docs/installation.md) | Complete installation guide for all package managers |
| [🐳 Docker](docs/docker.md) | Docker Usage and installation |
| [📦 Bundle Info](docs/bundle-info.md) | Distribution bundle system and cross-platform packaging |
| [📋 Commands](docs/commands.md) | Complete command reference with examples |
| [⚡ Features](docs/features.md) | Detailed feature documentation and usage |
| [🎨 Templates](docs/templates.md) | Available templates and customization options |
| [🚀 Deployment](docs/deploy.md) | Deployment options and platform integration |

## 🛠️ Command Overview

| Command | Description | Key Options |
|---------|-------------|-------------|
| `pi create` | Create new projects from templates | Interactive framework selection |
| `pi analyze` | Project analytics and insights | `--detailed`, `--export` |
| `pi update` | Update project dependencies | `--latest` for breaking changes |
| `pi doctor` | Diagnose and fix issues | `--fix`, `--node`, `--deps`, `--tools` |
| `pi env` | Environment analysis | `--check`, `--generate`, `--validate` |
| `pi clone` | Clone and setup repositories | `--offline`, `--shallow`, `--branch` |
| `pi add` | Add features to projects | `--list` to see all features |
| `pi clean` | Clean development artifacts | `--all`, `--dry-run` |
| `pi cache` | Manage CLI cache | `clear`, `stats`, `optimize` |
| `pi check` | Check package versions | `--verbose` for details |
| `pi upgrade-cli` | Upgrade CLI version | Breaking change detection |
| `pi size` | Show sizes for files and folders (accepts multiple paths; use `.` for current directory) | Shows per-path sizes, combined total, and top-N largest files |
| `pi email` | Send feedback and messages | Direct communication with developer |

*For complete documentation, see [docs/commands.md](docs/commands.md)*

## 🏗️ Supported Technologies

| Category | Representative Frameworks / Tools | Primary Languages |
|----------|------------------------------------|-------------------|
| C++/C | cppcms, crow, restbed, ulfius, wt | C, C++ |
| Combination Templates | react+express, react+nestjs (fullstack combos) | TS |
| Desktop | electron, tauri, flutter, qt, nwjs, capacitor | JS, TS, Rust, Dart, Python |
| Game | bevy, godot, unity, unreal, threejs, pygame, babylonjs | Rust, C#, C++, JS, Python |
| Go | gin, echo, beego, buffalo, chi, gqlgen | Go |
| Javascript | react, next, vue, angular, express, nestjs, svelte, remix | JavaScript, TypeScript |
| Mobile | react-native, flutter, ionic, nativescript, swiftui | JavaScript, TypeScript, Dart, Swift |
| Python | django, flask, fastapi, flask, tornado, streamlit | Python |
| Ruby | rails, sinatra, hanami, roda | Ruby |
| Rust | axum, rocket, warp, tide, poem, gotham | Rust |
| Web3 | hardhat, truffle, anchor, foundry, ethers.js, brownie | Solidity, Rust, Python, JS |

*For detailed information and per-template lists, see [docs/templates.md](docs/templates.md)*

*For detailed information, see [docs/templates.md](docs/templates.md)*

## 🎯 System Requirements

- **Node.js**: 18.0.0 or higher
- **Operating Systems**: Windows, macOS, Linux
- **Package Managers**: npm, yarn, or pnpm
- **Git**: Required for project initialization

## 🐛 Troubleshooting

### Quick Fixes

```bash
# Clear cache and reinstall
npm cache clean --force
npm install -g @0xshariq/package-installer

# Use npx if global installation fails
npx @0xshariq/package-installer create my-app

# Check CLI status
pi doctor
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

### Official Packages
- **NPM**: [@0xshariq/package-installer](https://www.npmjs.com/package/@0xshariq/package-installer)
- **PyPI**: [package-installer-cli](https://pypi.org/project/package-installer-cli/)
- **Crates.io**: [package-installer-cli](https://crates.io/crates/package-installer-cli)
- **RubyGems**: [package-installer-cli](https://rubygems.org/gems/package-installer-cli)
- **Docker Hub**: [0xshariq/package-installer-cli](https://hub.docker.com/r/0xshariq/package-installer-cli)

### Source Repositories
- **Main (Node.js)**: [package-installer-cli](https://github.com/0xshariq/package-installer-cli)
- **Python**: [py_package_installer_cli](https://github.com/0xshariq/py_package_installer_cli)
- **Rust**: [rust_package_installer_cli](https://github.com/0xshariq/rust_package_installer_cli)
- **Ruby**: [ruby_package_installer_cli](https://github.com/0xshariq/ruby_package_installer_cli)
- **Go**: [go_package_installer_cli](https://github.com/0xshariq/go_package_installer_cli)

### Support & Community
- **Issues & Feedback**: [GitHub Issues](https://github.com/0xshariq/package-installer-cli/issues)
- **Discussions**: [GitHub Discussions](https://github.com/0xshariq/package-installer-cli/discussions)

---

**Happy coding! 🚀** Create something amazing with Package Installer CLI.