# 📦 Package Installer CLI

[![npm version](https://img.shields.io/npm/v/@0xshariq/package-installer.svg)](https://www.npmjs.com/package/@0xshariq/package-installer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A **cross-platform, interactive CLI** to scaffold modern web application templates with support for multiple frameworks, languages, and development tools. Create production-ready projects in seconds!

## 🚀 Features

- **🎨 Multiple Frameworks**: React, Next.js, Express, Angular, Vue, Rust
- **🔤 Language Support**: TypeScript & JavaScript variants
- **🎭 UI Libraries**: Tailwind CSS, Material-UI, shadcn/ui
- **📦 Smart Bundlers**: Vite, built-in framework bundlers
- **🔐 Authentication**: Clerk, Auth0, NextAuth.js integration
- **🐳 Docker Support**: Ready-to-use containerization
- **🧪 Feature Add-ons**: Extensible project enhancement system
- **📊 Project Analytics**: Real-time dashboard and insights
- **⚡ Auto-Installation**: Automatic dependency installation
- **🎯 Interactive Prompts**: Guided project setup experience
- **🌈 Beautiful CLI**: Gorgeous terminal interface with gradients
- **📈 Multi-language Updates**: Support for 6+ programming languages

## 📥 Installation

### Global Installation (Recommended)

```bash
# Using npm
npm install -g @0xshariq/package-installer

# Using yarn
yarn global add @0xshariq/package-installer

# Using pnpm (recommended)
pnpm add -g @0xshariq/package-installer
```

### One-Time Usage

```bash
# Using npx
npx @0xshariq/package-installer create my-app
```

## 🎯 Quick Start

```bash
# Create new project interactively
pi create

# Create with specific name
pi create my-awesome-app

# Add features to existing project
pi add auth clerk                 # Add Clerk authentication
pi add auth next-auth            # Add NextAuth.js authentication
pi add docker                   # Add Docker containerization

# Analyze current project with real-time data
pi analyze

# Update project dependencies (multi-language support)
pi update react lodash          # Update specific Node.js packages
pi update                       # Interactive update menu

# Check project health
pi check

# Clone and setup repositories
pi clone https://github.com/user/repo

# Upgrade CLI itself
pi upgrade-cli
```

## 📋 Commands Overview

| Command | Description | Status |
|---------|-------------|--------|
| `pi create` | Create new project from templates | ✅ Available |
| `pi analyze` | Analyze project structure and dependencies | ✅ Available |
| `pi update` | Update project dependencies to latest versions | ✅ Available |
| `pi add` | Add features to existing projects | ✅ Available |
| `pi check` | Check project health and dependencies | ✅ Available |
| `pi clone` | Clone and setup repositories | ✅ Available |
| `pi doctor` | Diagnose and fix project issues | ✅ Available |
| `pi upgrade-cli` | Upgrade CLI to latest version | ✅ Available |
| `pi clean` | Clean development artifacts | 🚧 Coming Soon |
| `pi deploy` | Deploy projects to platforms | 🚧 Coming Soon |
| `pi env` | Manage environment variables | 🚧 Coming Soon |
| `pi --help` | Show help information | ✅ Available |
| `pi --version` | Display CLI version | ✅ Available |

For detailed command documentation, see [docs/commands.md](docs/commands.md).

## 🎨 Supported Templates

### Frontend Frameworks
- **React (Vite)** - TypeScript/JavaScript with modern tooling
- **Next.js** - App Router, Tailwind CSS, shadcn/ui, src directory options
- **Angular** - Material-UI, Tailwind CSS, modern CLI setup
- **Vue.js** - Composition API, Vite, modern tooling

### Backend Frameworks
- **Express** - TypeScript/JavaScript RESTful APIs with middleware

### System Programming
- **Rust** - Basic & Advanced project templates

## 🛠️ Template Features & Add-ons

### Built-in Template Features
- **UI & Styling**: Tailwind CSS, Material-UI, shadcn/ui
- **Project Structure**: Source directory or root level organization  
- **Development Tools**: ESLint, Prettier, TypeScript support
- **Build Tools**: Vite, framework-specific bundlers

### Add-on Features (Dynamic Detection)
- **🔐 Authentication**: Clerk, Auth0, NextAuth.js with automatic provider detection
- **🐳 Docker**: Complete containerization with docker-compose
- **📡 API Routes**: RESTful API scaffolding
- **💾 Storage**: Database integration (Coming Soon)
- **💳 Payments**: Stripe & Razorpay integration (Coming Soon)
- **🎨 UI Components**: Additional component libraries (Coming Soon)

### Smart Feature Integration
- **Automatic src/ folder detection**: Features adapt to your project structure
- **Framework-specific implementations**: Each feature supports multiple frameworks
- **Provider selection**: Choose your preferred service (e.g., Clerk vs NextAuth)
- **Real-time feature scanning**: CLI automatically detects available features

## 🏗️ Project Structure

After creating a project, you'll get a modern, well-organized structure:

```
my-awesome-app/
├── src/                    # Source code
│   ├── components/         # Reusable components
│   ├── pages/              # Route components
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── README.md               # Project documentation
└── tailwind.config.js      # Tailwind CSS config (if selected)
```

## 🔄 Smart Features

### Auto-Installation Features
Package Installer CLI automatically:
- **Installs dependencies** using your preferred package manager (npm/yarn/pnpm)
- **Sets up Git repository** with initial commit
- **Configures development scripts** and build processes
- **Creates well-structured project layout**

### Real-time Project Analysis
- **Live project scanning**: Detects actual project statistics, not dummy data
- **Framework detection**: Automatically identifies project frameworks
- **Dependency analysis**: Real-time dependency health checks
- **Feature usage tracking**: Monitors used technologies and libraries
- **Performance insights**: Project size, build times, and optimization suggestions

### Multi-language Package Updates
- **Node.js**: npm, pnpm, yarn package managers
- **Rust**: cargo dependencies
- **Python**: pip and poetry support
- **Go**: go modules management
- **PHP**: composer packages
- **Ruby**: bundler gems

## 🐛 Troubleshooting

### Common Issues

**Installation Issues:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install -g @0xshariq/package-installer
```

**Command Not Found:**
```bash
# Alternative: use npx
npx @0xshariq/package-installer create my-app
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links & Related Tools

- **NPM Package**: [@0xshariq/package-installer](https://www.npmjs.com/package/@0xshariq/package-installer)
- **GitHub Repository**: [package-installer-cli](https://github.com/0xshariq/package-installer-cli)
- **Issues & Feedback**: [GitHub Issues](https://github.com/0xshariq/package-installer-cli/issues)

### 🤖 GitHub MCP Server

**Enhanced Git workflow automation for Package Installer CLI projects**

- **Repository**: [https://github.com/0xshariq/github-mcp-server/](https://github.com/0xshariq/github-mcp-server/)
- **Features**: Automated Git operations, repository management, branch handling, and issue/PR management
- **Perfect Companion**: Seamlessly integrates with projects created using Package Installer CLI

```bash
# Install GitHub MCP Server
npm install -g @0xshariq/github-mcp-server

# Example workflow
pi create my-project          # Create with Package Installer CLI
ginit                         # Initialize Git with MCP Server
gadd file.txt                 # Automated add files
gcommit "Initial"             # Automated commit
gpush origin main             # Push to repository
```

---

**Happy coding! 🚀** Create something amazing with Package Installer CLI.
