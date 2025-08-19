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
- ** Auto-Installation**: Automatic dependency installation
- **🎯 Interactive Prompts**: Guided project setup experience
- **⚡ Lightning Fast**: Optimized template generation
- **🌈 Beautiful CLI**: Gorgeous terminal interface

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

# Analyze current project
pi analyze

# Update project dependencies
pi update
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
| `pi env` | Analyze development environment | ✅ Available |
| `pi clean` | Clean development artifacts | ✅ Available |
| `pi cache` | Manage CLI cache system | ✅ Available |
| `pi upgrade-cli` | Upgrade CLI to latest version | ✅ Available |
| `pi deploy` | Deploy projects to platforms | 🚧 Coming Soon |
| `pi --help` | Show help information | ✅ Available |
| `pi --version` | Display CLI version | ✅ Available |

For detailed command documentation, see [docs/commands.md](docs/commands.md).

## ⚡ Intelligent Caching System

Package Installer CLI includes a comprehensive caching system for lightning-fast performance:

### 🗄️ Cache Features
- **Project Analysis Caching** - Stores project metadata and analysis results
- **Template Usage Tracking** - Recommends popular templates based on usage
- **Package Version Caching** - Caches npm package version checks
- **Node Modules Scanning** - Fast dependency scanning with cache
- **System Environment Caching** - Stores development tool information

### 📊 Cache Management
```bash
# View cache statistics and info
pi cache

# Clear specific cache types
pi cache clear projects    # Clear project analysis cache
pi cache clear packages    # Clear package version cache
pi cache clear all         # Clear all caches

# View detailed cache stats
pi cache stats

# Show cache configuration
pi cache info
```

### 🎯 Performance Benefits
- **2-5x faster** project analysis with cached data
- **Instant template recommendations** based on usage patterns
- **Reduced API calls** for package version checks
- **Smart cache invalidation** ensures data freshness

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

## 🛠️ Template Features

- **UI & Styling**: Tailwind CSS, Material-UI, shadcn/ui
- **Project Structure**: Source directory or root level organization
- **Development Tools**: ESLint, Prettier, TypeScript support
- **Build Tools**: Vite, framework-specific bundlers

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

## 🔄 Auto-Installation Features

Package Installer CLI automatically:

- **Installs dependencies** using your preferred package manager (npm/yarn/pnpm)
- **Sets up Git repository** with initial commit
- **Configures development scripts** and build processes
- **Creates well-structured project layout**

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

## 🔗 Links

- **NPM Package**: [@0xshariq/package-installer](https://www.npmjs.com/package/@0xshariq/package-installer)
- **GitHub Repository**: [package-installer-cli](https://github.com/0xshariq/package-installer-cli)
- **Issues & Feedback**: [GitHub Issues](https://github.com/0xshariq/package-installer-cli/issues)

---

**Happy coding! 🚀** Create something amazing with Package Installer CLI.
