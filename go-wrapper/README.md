# 📦 Package Installer CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A **cross-platform, interactive CLI** to scaffold modern web application templates with support for multiple frameworks, languages, and development tools. Create production-ready projects in seconds!

## 🚀 Quick Features

- **🎨 Multiple Frameworks**: React, Next.js, Express, Angular, Vue, Rust
- **🔤 Language Support**: TypeScript & JavaScript variants
- **🎭 UI Libraries**: Tailwind CSS, Material-UI, shadcn/ui
- **📦 Smart Package Management**: Auto-detects package managers
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

## 🏗️ Go Binary Distribution

For users who prefer a single binary without Node.js installation, we provide a Go wrapper that bundles the CLI:

### 🎯 Why Choose the Go Binary?

- **📦 Single File Distribution**: One executable file for your entire system
- **🚀 Easy Deployment**: Perfect for CI/CD, Docker, or server environments  
- **⚡ Fast Installation**: No global package management required
- **🔒 Version Lock**: Specific CLI version bundled with the binary
- **🐳 Container Friendly**: Smaller container images and easier packaging
- **📋 Enterprise Ready**: Simplified distribution in corporate environments

### ⚠️ Important Notes

- **Node.js Still Required**: The Go binary is a wrapper around the TypeScript CLI
- **Runtime Dependency**: Node.js must be available in PATH when running
- **Complete Features**: Full-featured CLI implementation
- **Performance**: Minimal overhead, same execution speed

### 📦 Installation Methods

#### Method 1: Direct Download (Recommended)

```bash
# Linux (x64)
wget https://github.com/0xshariq/go_package_installer_cli/releases/latest/download/package-installer-cli-linux-amd64.tar.gz
tar -xzf package-installer-cli-linux-amd64.tar.gz
sudo mv package-installer-cli /usr/local/bin/

# macOS (Intel)
wget https://github.com/0xshariq/go_package_installer_cli/releases/latest/download/package-installer-cli-darwin-amd64.tar.gz
tar -xzf package-installer-cli-darwin-amd64.tar.gz
sudo mv package-installer-cli /usr/local/bin/

# macOS (Apple Silicon)
wget https://github.com/0xshariq/go_package_installer_cli/releases/latest/download/package-installer-cli-darwin-arm64.tar.gz
tar -xzf package-installer-cli-darwin-arm64.tar.gz
sudo mv package-installer-cli /usr/local/bin/

# Windows (PowerShell)
Invoke-WebRequest -Uri "https://github.com/0xshariq/go_package_installer_cli/releases/latest/download/package-installer-cli-windows-amd64.zip" -OutFile "package-installer-cli.zip"
Expand-Archive -Path "package-installer-cli.zip" -DestinationPath "."
# Add to PATH manually or move to a directory in PATH
```

#### Method 2: Using Go Install

```bash
# If you have Go installed
go install github.com/0xshariq/go_package_installer_cli@latest
```

### 🔧 Building from Source

```bash
# Prerequisites: Go 1.21+ and Node.js 18+
git clone https://github.com/0xshariq/go_package_installer_cli.git
cd go_package_installer_cli

# Install Node.js dependencies and build TypeScript
pnpm install
pnpm run build

# Build Go wrapper for current platform
make build

# Build for all platforms
make build-all

# Create release packages
make package

# Or use the build script
chmod +x build.sh
./build.sh
```

### ⚙️ Go Binary Requirements

- **Runtime**: Node.js is still required (the Go binary is a wrapper)
- **Distribution**: Include both the binary and `dist/` directory
- **Usage**: Same commands as the npm version

## 📥 Installation

### Method 1: Direct Download (Recommended)

```bash
# Linux (x64)
wget https://github.com/0xshariq/go_package_installer_cli/releases/latest/download/package-installer-cli-linux-amd64.tar.gz
tar -xzf package-installer-cli-linux-amd64.tar.gz
sudo mv package-installer-cli /usr/local/bin/

# macOS (Intel)
wget https://github.com/0xshariq/go_package_installer_cli/releases/latest/download/package-installer-cli-darwin-amd64.tar.gz
tar -xzf package-installer-cli-darwin-amd64.tar.gz
sudo mv package-installer-cli /usr/local/bin/

# macOS (Apple Silicon)
wget https://github.com/0xshariq/go_package_installer_cli/releases/latest/download/package-installer-cli-darwin-arm64.tar.gz
tar -xzf package-installer-cli-darwin-arm64.tar.gz
sudo mv package-installer-cli /usr/local/bin/

# Windows (PowerShell)
Invoke-WebRequest -Uri "https://github.com/0xshariq/go_package_installer_cli/releases/latest/download/package-installer-cli-windows-amd64.zip" -OutFile "package-installer-cli.zip"
Expand-Archive -Path "package-installer-cli.zip" -DestinationPath "."
# Add to PATH manually or move to a directory in PATH
```

### Method 2: Using Go Install

```bash
# If you have Go installed
go install github.com/0xshariq/go_package_installer_cli@latest
```




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

*For complete command documentation, see [Commands](https://github.com/0xshariq/package-installer-cli/tree/main/docs/commands.md)*

## 🏗️ Supported Project Types

| Language/Framework | Templates | Package Managers |
|-------------------|-----------|------------------|
| **JavaScript/TypeScript** | React, Next.js, Express, Angular, Vue | npm, yarn, pnpm |
| **Python** | Django, Flask, FastAPI | pip, poetry |
| **Rust** | Basic, Advanced, Web | cargo |
| **Go** | CLI, Web, API | go mod |
| **Ruby** | Rails, Sinatra | bundler |
| **PHP** | Laravel, Symfony | composer |

*For detailed template information, see [Templates](https://github.com/0xshariq/package-installer-cli/tree/main/docs/templates.md)*

## 🎯 System Requirements

- **Node.js**: 18.0.0 or higher (required at runtime)
- **Operating Systems**: Windows, macOS, Linux (x64/ARM64)
- **Git**: Required for project initialization
- **Go**: Only required if building from source

## 🐛 Troubleshooting

### Quick Fixes

```bash
# Clear cache and reinstall (npm version)
npm cache clean --force
npm install -g @0xshariq/package-installer-cli

# Use npx if global installation fails
npx @0xshariq/package-installer-cli create my-app

# Check CLI status
pi doctor
# or (Go binary)
package-installer-cli doctor
```

### 📈 Performance Comparison

| Metric | npm Version | Go Binary | npx |
|--------|-------------|-----------|-----|
| **First Run** | ~2s | ~2.1s | ~5s |
| **Subsequent Runs** | ~1.8s | ~1.9s | ~4.5s |
| **Installation Size** | ~50MB | ~12MB + Node.js | N/A |
| **Cold Start** | Fast | Fast | Slow |
| **Memory Usage** | ~80MB | ~85MB | ~120MB |

*Performance may vary based on system configuration and Node.js version*

## ❓ Frequently Asked Questions

### General Questions

**Q: What is the Package Installer CLI?**
A: A Go wrapper around a TypeScript CLI that provides single-file distribution for creating modern web application templates.

**Q: Can I use this without Node.js?**
A: No, Node.js is required as the core CLI is written in TypeScript.

### Installation Questions

**Q: Why is Node.js still required for the Go binary?**
A: The Go binary is a wrapper around the TypeScript CLI. This approach allows us to maintain one codebase while providing Go distribution benefits.

**Q: How do I update the Go binary version?**
A: Download the latest release from GitHub or run `go install github.com/0xshariq/go_package_installer_cli@latest`

**Q: Can I build custom templates?**
A: Yes, the CLI supports custom template system. See [templates](https://github.com/0xshariq/package-installer-cli/tree/main/docs/templates.md) for details.

### Troubleshooting

**Q: "node: command not found" error**
A: Install Node.js from https://nodejs.org/ and ensure it's in your PATH.

**Q: "dist/index.js not found" error**
A: The dist/ directory must be alongside the Go binary. Re-extract the downloaded package.

## 🔧 Development & Contributing

### 📁 Project Structure

```
go_package_installer_cli/
├── main.go                    # Go wrapper entry point
├── go.mod                     # Go module definition
├── Makefile                   # Build automation
├── build.sh                   # Cross-platform build script
├── dist/                      # Compiled TypeScript CLI
│   ├── index.js              # Main CLI entry point
│   ├── commands/             # CLI command implementations
│   └── utils/                # Utility functions
├── templates/                 # Project templates
│   ├── reactjs/              # React templates
│   ├── nextjs/               # Next.js templates
│   ├── go/                   # Go templates
│   └── ...                   # Other frameworks
├── features/                  # Feature integrations
│   ├── ai/                   # AI providers
│   ├── auth/                 # Authentication
│   ├── database/             # Database integrations
│   └── ...                   # Other features
└── docs/                     # Documentation
```

### 🛠️ Building & Testing

```bash
# Install dependencies and build TypeScript
npm install && npm run build

# Build Go wrapper for current platform
make build

# Build for all platforms
make build-all

# Test the binary
make test

# Run the TypeScript version directly
npm start
```

## 🗺️ Roadmap

### � Upcoming Features

- [ ] **Native Go CLI**: Rewrite core CLI in Go for true single-binary distribution
- [ ] **Plugin System**: Custom template and feature plugins
- [ ] **GUI Version**: Desktop application for visual project creation
- [ ] **Cloud Templates**: Remote template repositories and sharing
- [ ] **Team Features**: Shared configurations and team templates

### 📊 Version Information

| Component | Version | Status |
|-----------|---------|--------|
| **Core CLI** | 3.2.0 | ✅ Stable |
| **Go Wrapper** | 1.0.0 | ✅ Stable |
| **Templates** | 50+ | ✅ Active |
| **Features** | 30+ | ✅ Growing |

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- 🐛 **Report Bugs**: [GitHub Issues](https://github.com/0xshariq/go_package_installer_cli/issues)
- 💡 **Suggest Features**: [Feature Requests](https://github.com/0xshariq/go_package_installer_cli/issues/new)
- 📝 **Improve Documentation**: Submit PRs for documentation improvements
- 🔧 **Add Templates**: Create new project templates
- 🎨 **Add Features**: Implement new integrations and features

See our [Contributing Guide](https://github.com/0xshariq/package-installer-cli/tree/main/CONTRIBUTING.md) for detailed information.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub Repository**: [go_package_installer_cli](https://github.com/0xshariq/go_package_installer_cli)
- **Issues & Feedback**: [GitHub Issues](https://github.com/0xshariq/go_package_installer_cli/issues)
- **Releases**: [GitHub Releases](https://github.com/0xshariq/go_package_installer_cli/releases)

---

**Happy coding! 🚀** Create something amazing with Package Installer CLI.
