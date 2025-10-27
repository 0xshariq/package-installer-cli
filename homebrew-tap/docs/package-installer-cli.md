# 📦 Package Installer CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Homebrew](https://img.shields.io/badge/Homebrew-Available-orange.svg)](https://brew.sh/)

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

### Homebrew Installation (Recommended)

Install Package Installer CLI using Homebrew on macOS and Linux:

```bash
# Add the tap
brew tap 0xshariq/homebrew-tap

# Install the full version
brew install package-installer-cli

# Or install the short alias version (same functionality)
brew install pi
```

Both `package-installer` and `pi` are the same tool - `pi` is just a shorter alias. After installation, you can use either:
- `package-installer create` or `pi create`
- `package-installer analyze` or `pi analyze`
- And so on...

### Verify Installation

```bash
# Check version (works with both commands)
pi --version
package-installer --version

# Get help
pi --help
```

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
| [📋 Commands](https://github.com/0xshariq/package-installer-cli/tree/main/docs/commands.md) | Complete command reference with examples |
| [⚡ Features](https://github.com/0xshariq/package-installer-cli/tree/main/docs/features.md) | Detailed feature documentation and usage |
| [🎨 Templates](https://github.com/0xshariq/package-installer-cli/tree/main/docs/templates.md) | Available templates and customization options |
| [🚀 Deployment](https://github.com/0xshariq/package-installer-cli/tree/main/docs/deploy.md) | Deployment options and platform integration |

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

*For complete command documentation, see [commands](https://github.com/0xshariq/package-installer-cli/tree/main/docs/commands.md)*

## 🏗️ Supported Project Types

| Language/Framework | Templates | Package Managers |
|-------------------|-----------|------------------|
| **JavaScript/TypeScript** | React, Next.js, Express, Angular, Vue | npm, yarn, pnpm |
| **Python** | Django, Flask, FastAPI | pip, poetry |
| **Rust** | Basic, Advanced, Web | cargo |
| **Go** | CLI, Web, API | go mod |
| **Ruby** | Rails, Sinatra | bundler |
| **PHP** | Laravel, Symfony | composer |

*For detailed template information, see [templates](https://github.com/0xshariq/package-installer-cli/tree/main/docs/templates.md)*

## 🎯 System Requirements

- **Operating Systems**: macOS, Linux
- **Homebrew**: Required for installation
- **Git**: Required for project initialization

## 🐛 Troubleshooting

### Quick Fixes

```bash
# Update Homebrew and reinstall
brew update
brew reinstall package-installer-cli

# Or reinstall the short alias version
brew reinstall pi

# Check CLI status
pi doctor
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/0xshariq/package-installer-cli/tree/main/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/0xshariq/package-installer-cli/tree/main/LICENSE) file for details.

## 🔗 Links

- **GitHub Repository**: [package-installer-cli](https://github.com/0xshariq/package-installer-cli)
- **Homebrew Tap**: [homebrew-package-installer-cli](https://github.com/0xshariq/homebrew-package-installer-cli)
- **Issues & Feedback**: [GitHub Issues](https://github.com/0xshariq/package-installer-cli/issues)

---

**Happy coding! 🚀** Create something amazing with Package Installer CLI.
