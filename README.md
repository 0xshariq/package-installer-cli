# 📦 Package Installer CLI

<div align="center">

![Interactive CLI Demo](docs/assets/cli-spinners.gif)

[![npm version](https://img.shields.io/npm/v/@0xshariq/package-installer.svg)](https://www.npmjs.com/package/@0xshariq/package-installer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

</div>

A **powerful, cross-platform CLI** for modern development workflows. Create projects, manage dependencies, analyze codebases, and streamline your development process with intelligent automation.

## 🎬 See It In Action

<div align="center">

**✨ Interactive Command Selection**

![Interactive Selection](docs/assets/inquirer-demo.gif)

**📊 Beautiful Terminal Experience**

![VS Code Integration](docs/assets/vscode-demo.png)

</div>

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
| `v3.10.0` | Specific version | Version pinning |

### Volume Mounts

- **Projects**: Mount your project directory to `/home/pi/projects`
- **Git Config**: Mount `~/.gitconfig` for Git authentication
- **SSH Keys**: Mount `~/.ssh` for Git repository access

## 🎯 Quick Start

![Package Installer CLI Demo](docs/assets/cli-spinners.gif)

### ⚡ Interactive Project Creation

![Interactive CLI Selection](docs/assets/inquirer-demo.gif)

### 🚀 One-Command Deployment

```bash
# Deploy to cloud platforms with auto-detection
pi deploy --auto-detect

# Interactive platform selection
pi deploy
```

### 📊 Project Analytics

```bash
# Analyze existing project
pi analyze --detailed

# Generate comprehensive report
pi analyze --export
```

### 🔧 Development Workflow

```bash
# Check project health
pi doctor --fix

# Update dependencies safely
pi update --latest

# Clean development artifacts
pi clean --all
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [� Installation](docs/installation.md) | Complete installation guide for all package managers |
| [🐳 Docker](docs/docker.md) | Docker Usage and installation |
| [📦 Bundle Info](docs/bundle-info.md) | Distribution bundle system and cross-platform packaging |
| [�📋 Commands](docs/commands.md) | Complete command reference with examples |
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
| `pi deploy` | Deploy to cloud platforms | `--auto-detect`, `--dry-run`, `--watch` |
| `pi clean` | Clean development artifacts | `--all`, `--dry-run` |
| `pi cache` | Manage CLI cache | `clear`, `stats`, `optimize` |
| `pi check` | Check package versions | `--verbose` for details |
| `pi upgrade-cli` | Upgrade CLI version | Breaking change detection |
| `pi email` | Send feedback and messages | Direct communication with developer |

*For complete documentation, see [docs/commands.md](docs/commands.md)*

## 📊 Enhanced Analytics Dashboard

![CLI Analytics Dashboard](docs/assets/vscode-demo.png)

The `pi analyze` command provides comprehensive project analytics and usage insights:

### 🎯 Key Features
- **📈 Usage Statistics**: Command frequency and productivity metrics
- **🏗️ Project Analytics**: Framework and language breakdowns
- **⚡ Performance Insights**: Efficiency ratings and development velocity
- **🏆 Achievement System**: Unlock badges based on your CLI usage
- **📊 Export Options**: Export data in JSON, XML, or YAML formats

### 🚀 Quick Analytics
```bash
# View analytics dashboard
pi analyze

# Detailed breakdown with insights
pi analyze --detailed

# Export analytics data
pi analyze --export json
pi analyze --export xml --detailed
```

## 🏗️ Supported Technologies

| Language/Framework | Project Creation | Dependency Updates | Package Managers |
|-------------------|-----------------|-------------------|------------------|
| **JavaScript/TypeScript** | React, Next.js, Express, Angular, Vue | ✅ | npm, yarn, pnpm |
| **Python** | Django, Flask | ✅ | pip, poetry |
| **Rust** | Basic, Web, CLI | ✅ | cargo |
| **Go** | Web, API | ✅ | go mod |
| **Ruby** | Rails, basic | ✅ | bundler |

*For detailed information, see [docs/templates.md](docs/templates.md)*

## 📧 Email Command - Direct Communication

The `pi email` command provides a direct communication channel with the developer for feedback, support, and contributions.

### Email Categories

| Category | Usage | Description |
|----------|-------|-------------|
| `pi email bug` | Bug Reports | Report issues with detailed reproduction steps |
| `pi email feature` | Feature Requests | Suggest new features and enhancements |
| `pi email template` | Template Requests | Request new project templates |
| `pi email question` | General Questions | Ask questions about CLI usage |
| `pi email improvement` | Suggestions | Suggest improvements to existing features |
| `pi email docs` | Documentation | Report documentation issues |
| `pi email custom` | **Custom Messages** | Send formatted custom messages |

### Custom Messages - Advanced Formatting

The `custom` category allows you to send personalized messages with professional formatting:

```bash
# Send a custom message
pi email custom
```

**Formatting Guidelines:**
- **Plain Text**: Use `\n` for line breaks, automatic formatting applied
- **HTML Format**: Use HTML tags for advanced styling
- **Markdown-style**: Use `**bold**`, `*italic*`, `` `code` `` in plain text
- **Priority Levels**: Normal, High Priority, Urgent

**Example HTML Formatting:**
```html
<p>Hello there!</p>
<br>
<strong>Important Update:</strong> I have some suggestions regarding the CLI.
<br><br>
<p>Here are the key points:</p>
<ul>
<li>Feature enhancement for templates</li>
<li>Improved error handling</li>
</ul>
<br>
<em>Thank you for the amazing tool!</em>
```

### Email Command Options

```bash
# Interactive category selection
pi email

# Specific category
pi email <category>

# Quick mode (minimal prompts)
pi email --quick <category>

# Setup email configuration
pi email --setup

# Test email functionality
pi email --test

# Check email system status
pi email --status

# Show all available categories
pi email --list

# Show help
pi email --help
```

### Email Features

- **📧 Professional Templates**: Beautifully formatted HTML emails with CSS styling
- **🔒 Secure Configuration**: Your email credentials stored securely locally
- **📱 Multi-Provider Support**: Gmail, Outlook, Yahoo, and custom SMTP
- **⚡ Quick Feedback**: Fast feedback mode for urgent issues
- **🎨 Custom Formatting**: Send personalized messages with HTML/CSS
- **📊 System Info**: Automatic system information inclusion for bug reports
- **🔄 Sender Options**: Choose between configured email or custom credentials

> **Note**: Email functionality requires the Email MCP Server. The CLI will guide you through the setup process on first use.

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
