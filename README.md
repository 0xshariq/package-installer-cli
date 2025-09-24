# 📦 Package Installer CLI

[![npm version](https://img.shields.io/npm/v/@0xshariq/package-installer.svg)](https://www.npmjs.com/package/@0xshariq/package-installer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A **cross-platform, interactive CLI** to scaffold modern web application templates with support for multiple frameworks, languages, and development tools. Create production-ready projects in seconds!

## 🚀 Quick Features

- **🎨 Multiple Frameworks**: React, Next.js, Express, Angular, Vue, Rust
- **🔤 Language Support**: TypeScript & JavaScript variants
- **🎭 UI Libraries**: Tailwind CSS, Material-UI, shadcn/ui
- **📦 Smart Package Management**: Auto-detects npm, yarn, pnpm
- **⚡ Lightning Fast**: Optimized template generation with intelligent caching
- **🌈 Beautiful CLI**: Gorgeous terminal interface with real-time analytics
- **🔍 Project Analysis**: Advanced dependency analysis and project insights

## ✨ New Features

- **📊 Enhanced Analytics Dashboard**: Real-time usage analytics with detailed insights
- **🎯 Smart Dependency Updates**: Project-specific dependency management for JS, Python, Rust, Go, Ruby, PHP
- **🚀 Intelligent CLI Upgrades**: Separate upgrade system with breaking change detection
- **💾 .package-installer-cli Folder**: All cache and history stored in dedicated folder
- **📈 Usage Tracking**: Comprehensive command and feature usage tracking
- **⚡ Performance Insights**: Productivity scoring and usage patterns

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
| `v3.2.0` | Specific version | Version pinning |

### Volume Mounts

- **Projects**: Mount your project directory to `/home/pi/projects`
- **Git Config**: Mount `~/.gitconfig` for Git authentication
- **SSH Keys**: Mount `~/.ssh` for Git repository access

## 🎯 Quick Start

```bash
# Create new project interactively
pi create

# Analyze project with enhanced dashboard
pi analyze

# Update project dependencies only
pi update

# Upgrade CLI to latest version
pi upgrade-cli
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [� Installation](INSTALLATION.md) | Complete installation guide for all package managers |
| [�📋 Commands](docs/commands.md) | Complete command reference with examples |
| [⚡ Features](docs/features.md) | Detailed feature documentation and usage |
| [🎨 Templates](docs/templates.md) | Available templates and customization options |
| [🚀 Deployment](docs/deploy.md) | Deployment options and platform integration |

## 🛠️ Command Overview

| Command | Description | Usage |
|---------|-------------|-------|
| `pi create` | Create new project from templates | `pi create [name]` |
| `pi analyze` | Enhanced project analytics dashboard | `pi analyze [--detailed]` |
| `pi update` | Update project dependencies | `pi update [--latest]` |
| `pi upgrade-cli` | Upgrade CLI to latest version | `pi upgrade-cli` |
| `pi add` | Add features to existing projects | `pi add [feature]` |
| `pi doctor` | Diagnose and fix project issues | `pi doctor` |
| `pi clean` | Clean development artifacts | `pi clean [--all]` |

*For complete command documentation, see [docs/commands.md](docs/commands.md)*

## 🏗️ Supported Project Types

| Language/Framework | Templates | Package Managers |
|-------------------|-----------|------------------|
| **JavaScript/TypeScript** | React, Next.js, Express, Angular, Vue | npm, yarn, pnpm |
| **Python** | Django, Flask, FastAPI | pip, poetry |
| **Rust** | Basic, Advanced, Web | cargo |
| **Go** | CLI, Web, API | go mod |
| **Ruby** | Rails, Sinatra | bundler |
| **PHP** | Laravel, Symfony | composer |

*For detailed template information, see [docs/templates.md](docs/templates.md)*

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
