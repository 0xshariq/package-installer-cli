# 📦 Package Installer CLI

[![PyPI version](https://img.shields.io/pypi/v/package-installer-cli.svg)](https://pypi.org/project/package-installer-cli/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-%3E%3D3.8-brightgreen.svg)](https://python.org/)

A **cross-platform, interactive CLI** to scaffold modern web application templates with support for multiple frameworks, languages, and development tools. Create production-ready projects in seconds!

## 🚀 Quick Features

- **🎨 Multiple Frameworks**: React, Next.js, Express, Angular, Vue, Rust
- **🔤 Language Support**: TypeScript & JavaScript variants
- **🎭 UI Libraries**: Tailwind CSS, Material-UI, shadcn/ui
- **⚡ Lightning Fast**: Optimized template generation with intelligent caching
- **🌈 Beautiful CLI**: Gorgeous terminal interface with real-time analytics
- **🔍 Project Analysis**: Advanced dependency analysis and project insights
- **📦 Self-Contained**: No external dependencies required - bundled executables

## ✨ New Features

- **📊 Enhanced Analytics Dashboard**: Real-time usage analytics with detailed insights
- **🎯 Smart Dependency Updates**: Project-specific dependency management for JS, Python, Rust, Go, Ruby, PHP
- **🚀 Intelligent CLI Upgrades**: Separate upgrade system with breaking change detection
- **💾 .package-installer-cli Folder**: All cache and history stored in dedicated folder
- **📈 Usage Tracking**: Comprehensive command and feature usage tracking
- **⚡ Performance Insights**: Productivity scoring and usage patterns

## 📥 Installation

### Global Installation (Recommended)
```bash
# Using pip (system-wide)
pip install package-installer-cli

# Using pip3 (system-wide)
pip3 install package-installer-cli
```

### Local/User Installation
```bash
# Install for current user only
pip install --user package-installer-cli

# Using pip3 for current user only
pip3 install --user package-installer-cli
```

## 🎯 Quick Start

After installation, you can immediately start using the CLI:

```bash
# Create new project interactively
pi create

# Analyze project with enhanced dashboard
pi analyze

# Add features to existing project
pi add feature-name

# Get help
pi --help
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📋 Commands](https://github.com/0xshariq/package-installer-cli/tree/main/docs/commands.md) | Complete command reference with examples |
| [⚡ Features](https://github.com/0xshariq/package-installer-cli/tree/main/docs/features.md) | Detailed feature documentation and usage |
| [🎨 Templates](https://github.com/0xshariq/package-installer-cli/tree/main/docs/templates.md) | Available templates and customization options |
| [🚀 Deployment](https://github.com/0xshariq/package-installer-cli/tree/main/docs/deploy.md) | Deployment options and platform integration |
| [📦 Bundle Info](https://github.com/0xshariq/package-installer-cli/tree/main/docs/bundle-info.md) | Distribution bundle system and cross-platform packaging |

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

| Language/Framework | Templates Available |
|-------------------|---------------------|
| **JavaScript/TypeScript** | React, Next.js, Express, Angular, Vue, Remix |
| **Python** | Django, Flask |
| **Rust** | Basic, Advanced Web Applications |
| **Go** | CLI, Web, API Applications |
| **Ruby** | Rails Applications |
| **React Native** | Mobile Applications |

*For detailed template information, see [templates](https://github.com/0xshariq/package-installer-cli/tree/main/docs/templates.md)*

## 🎯 System Requirements

- **Python**: 3.8 or higher
- **Operating Systems**: Windows, macOS, Linux
- **Architecture**: x64 (64-bit systems)

## 🐛 Troubleshooting

### Quick Fixes

```bash
# Reinstall the package
pip uninstall package-installer-cli
pip install package-installer-cli

# For user installation
pip install --user package-installer-cli
```

### Command Not Found Issues

If `package-installer` command is not found after installation:

**For user installation (`--user` flag):**
- **Linux/macOS**: Add `~/.local/bin` to your PATH
- **Windows**: Add `%APPDATA%\Python\Scripts` to your PATH

**For permission issues on Linux/macOS:**
```bash
# Try user installation instead
pip install --user package-installer-cli
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/0xshariq/package-installer-cli/tree/main/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **PyPI Package**: [package-installer-cli](https://pypi.org/project/package-installer-cli/)
- **GitHub Repository**: [py_package_installer_cli](https://github.com/0xshariq/py_package_installer_cli)
- **Issues & Feedback**: [GitHub Issues](https://github.com/0xshariq/py_package_installer_cli/issues)

---

**Happy coding! 🚀** Create something amazing with Package Installer CLI.
