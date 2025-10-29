# 🍺 0xshariq's Homebrew Tap

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-yellow.svg)](https://opensource.org/licenses/Apache-2.0)
[![Homebrew](https://img.shields.io/badge/Homebrew-Available-orange.svg)](https://brew.sh/)

A collection of **powerful CLI tools** and **development utilities** available through Homebrew. This tap provides easy installation and management of various tools for developers, system administrators, and DevOps engineers.

## 🚀 Available Tools

| Tool | Description | Status | Documentation |
|------|-------------|--------|---------------|
| **package-installer-cli** | Interactive CLI to scaffold modern web application templates | ✅ Available | [📖 docs/package-installer-cli.md](docs/package-installer-cli.md) |
| **pi** | Second Option for package-installer-cli (same functionality) | ✅ Available | [📖 docs/pi.md](docs/pi.md) |
| **docker-mcp-server** | Docker MCP (Model Context Protocol) Server | ✅ Available | [📖 docs/docker-mcp-server.md](docs/docker-mcp-server.md) |
| **github-mcp-server** | GitHub MCP (Model Context Protocol) Server | ✅ Available | [📖 docs/github-mcp-server.md](docs/github-mcp-server.md) |

## 📥 Installation

### Add the Tap

First, add this tap to your Homebrew installation:

```bash
brew tap 0xshariq/homebrew-package-installer-cli
```

### Install Tools

Once the tap is added, you can install any of the available tools:

```bash
# Package Installer CLI (full version)
brew install package-installer-cli

# Package Installer CLI (short alias - same functionality)
brew install pi

# Docker MCP Server
brew install docker-mcp-server

# GitHub MCP Server
brew install github-mcp-server
```

### Update Tools

Keep your tools up to date:

```bash
# Update Homebrew and all installed formulae
brew update && brew upgrade

# Update specific tool
brew upgrade package-installer-cli
```

## 📚 Documentation

Each tool in this tap has comprehensive documentation available in the `docs/` folder:

### 📦 Package Management & Development
- **[package-installer-cli.md](docs/package-installer-cli.md)** - Interactive CLI for scaffolding modern web applications
- **[pi.md](docs/pi.md)** - Short alias documentation for package-installer-cli

### 🐳 MCP (Model Context Protocol) Servers  
- **[docker-mcp-server.md](docs/docker-mcp-server.md)** - Docker container management via MCP
- **[github-mcp-server.md](docs/github-mcp-server.md)** - GitHub integration via MCP

Each documentation file includes:
- 🎯 **Purpose & Features** - What the tool does and key capabilities
- 📥 **Installation Guide** - Step-by-step installation instructions
- 🚀 **Quick Start** - Get up and running quickly
- 📋 **Command Reference** - Complete list of available commands
- 🔧 **Configuration** - Setup and customization options
- 💡 **Examples** - Real-world usage examples
- 🐛 **Troubleshooting** - Common issues and solutions

## 🛠️ Tool Categories

### Development & Scaffolding
Tools for creating and managing development projects:
- `package-installer-cli` / `pi` - Multi-framework project scaffolding

### DevOps & Infrastructure  
Tools for container and infrastructure management:
- `docker-mcp-server` - Docker container operations via MCP

### Version Control & Collaboration
Tools for Git and GitHub workflow automation:
- `github-mcp-server` - GitHub repository management via MCP

## 🎯 System Requirements

- **Operating Systems**: macOS, Linux
- **Homebrew**: Latest version recommended
- **Architecture**: Supports both Intel (amd64) and Apple Silicon (arm64)

## 🚀 Quick Start Examples

```bash
# After installing the tap
brew tap 0xshariq/homebrew-package-installer-cli

# Create a new React project
brew install pi
pi create my-react-app

# Manage Docker containers via MCP
brew install docker-mcp-server
docker-mcp-server --help

# GitHub repository operations via MCP  
brew install github-mcp-server
github-mcp-server --help
```

## 🔄 Updates & Versioning

This tap follows semantic versioning. Tools are updated regularly with:
- 🐛 **Bug fixes** - Patch versions (x.x.X)
- ✨ **New features** - Minor versions (x.X.x)  
- 💥 **Breaking changes** - Major versions (X.x.x)

To stay updated:
```bash
# Check for updates
brew outdated

# Update all tools
brew upgrade

# Update specific tool
brew upgrade <tool-name>
```

## 🐛 Troubleshooting

### Common Issues

```bash
# If tap installation fails
brew update
brew tap --repair

# If tool installation fails  
brew update
brew doctor

# Reinstall a tool
brew reinstall <tool-name>

# Get help for any tool
<tool-name> --help
```

### Getting Help

1. 📖 Check the tool-specific documentation in [docs/](docs/)
2. 🐛 Report issues on the respective tool's GitHub repository
3. 💬 Start a discussion for general questions

## 🤝 Contributing

We welcome contributions to improve these tools! 

### Adding New Tools
To suggest a new tool for this tap:
1. Create an issue describing the tool
2. Ensure the tool provides value to the developer community
3. Follow Homebrew formula best practices

### Improving Documentation
1. Fork this repository
2. Update the relevant documentation in `docs/`
3. Submit a pull request

## 📄 License

This tap and its tools are licensed under the MIT License - see individual tool repositories for specific license details.

## 🔗 Links

- **GitHub Repository**: [0xshariq/homebrew-package-installer-cli](https://github.com/0xshariq/homebrew-package-installer-cli)
- **Issues & Feedback**: [GitHub Issues](https://github.com/0xshariq/homebrew-package-installer-cli/issues)
- **Homebrew Documentation**: [docs.brew.sh](https://docs.brew.sh/)

---

**Happy brewing! 🍺** Install powerful tools with ease using this Homebrew tap.
