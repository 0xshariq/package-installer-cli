# 📦 Package Installer CLI

> The Ultimate Tool for Creating Modern Web Applications

[![npm version](https://badge.fury.io/js/%40 0xshariq%2Fpackage-installer.svg)](https://badge.fury.io/js/%400xshariq%2Fpackage-installer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

**Package Installer CLI** is a modern, fast, and beautiful command-line tool that helps you quickly scaffold production-ready web applications with your favorite frameworks, databases, and styling libraries.

## ✨ Features

- 🚀 **Multi-Framework Support**: React, Next.js, Express, Nest.js, Rust, Vue.js, Angular, and more
- 🌐 **Multi-Language**: JavaScript, TypeScript support across all frameworks
- 🗄️ **Database Integration**: MongoDB, PostgreSQL, Supabase with ORM support (Mongoose, Prisma)
- 🎨 **UI Libraries**: shadcn/ui, Tailwind CSS, Material-UI, Headless UI
- 📦 **Package Management**: npm, pnpm, yarn support with auto-detection
- 🔍 **Package Checking**: Multi-language dependency analysis (Node.js, Rust, Python, Go, Ruby, PHP)
- 🌟 **Git Integration**: Automatic repository cloning from GitHub, GitLab, BitBucket, SourceHut
- ⚡ **Fast Setup**: Instant project creation with automatic dependency installation
- 🎯 **Production Ready**: Best practices and optimized configurations out of the box

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g @0xshariq/package-installer

# Or use with npx
npx @0xshariq/package-installer
```

## 📋 Available Commands

### 🏗️ Create Command
Create a new project from curated templates:

```bash
pi create [project-name]    # Create new project
pi create my-app           # Create with specific name
pi create                  # Interactive mode
```

### 🔍 Check Command
Analyze and check package versions across multiple languages:

```bash
pi check                   # Check all project dependencies
pi check react            # Check specific package
pi check --help           # Show help
```

**Supported project types:**
- **Node.js**: `package.json` (npm/pnpm/yarn)
- **Rust**: `Cargo.toml` (cargo)
- **Python**: `requirements.txt`, `pyproject.toml`, `Pipfile` (pip/poetry/pipenv)
- **Go**: `go.mod` (go get)
- **Ruby**: `Gemfile` (gem/bundler)
- **PHP**: `composer.json` (composer)

### 🌐 Clone Command
Clone repositories from multiple Git providers:

```bash
pi clone <repo-url>              # Clone any Git repository
pi clone github:user/repo        # GitHub shorthand
pi clone gitlab:user/repo        # GitLab shorthand
pi clone bitbucket:user/repo     # BitBucket shorthand
pi clone sourcehut:user/repo     # SourceHut shorthand
```

### ➕ Add Command
Add dependencies to your project:

```bash
pi add <package-name>      # Add package to current project
pi add react react-dom    # Add multiple packages
```

## 🛠️ Supported Frameworks

### Frontend Frameworks
- **React** (Vite) - JavaScript/TypeScript
- **Next.js** - Full-stack React framework
- **Vue.js** - Progressive framework
- **Angular** - Enterprise web applications

### Backend Frameworks
- **Express.js** - Fast Node.js web framework
- **Nest.js** - Progressive Node.js framework
- **Rust** - Systems programming language

### Full-Stack Combinations
- **React + Express** - Complete MERN/PERN stack
- **Next.js + Database** - Modern full-stack applications

## 🎨 UI & Styling Options

- **shadcn/ui** - Modern React components
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI** - React component library
- **Headless UI** - Unstyled, accessible components

## 🗄️ Database & ORM Support

### Databases
- **MongoDB** - NoSQL document database
- **PostgreSQL** - Advanced relational database
- **Supabase** - Open source Firebase alternative

### ORMs
- **Mongoose** - MongoDB object modeling
- **Prisma** - Next-generation ORM
- **TypeORM** - TypeScript ORM

## 📦 Package Managers

- **npm** - Default Node.js package manager
- **pnpm** - Fast, disk space efficient package manager
- **yarn** - Secure, reliable, and fast package manager

Auto-detection and fallback support ensures compatibility across all environments.

## 🔧 Configuration Options

### Project Structure
```bash
src/              # Source directory (optional)
components/       # React components (with shadcn/ui)
pages/           # Next.js pages
api/             # API routes
styles/          # CSS/Tailwind styles
```

### Environment Setup
- **TypeScript** configuration
- **ESLint** and **Prettier** setup
- **Tailwind CSS** configuration
- **Environment variables** template
- **Git** initialization with .gitignore

## 📈 What's New in v2.0

### 🔍 Enhanced Package Checking
- **Multi-language support**: Node.js, Rust, Python, Go, Ruby, PHP
- **Registry integration**: NPM, Crates.io, PyPI with real-time data
- **Security recommendations**: Audit tools and automation suggestions
- **Major version detection**: Breaking change warnings
- **Detailed analytics**: Comprehensive package health reports

### 🌐 Multi-Provider Git Cloning
- **GitHub, GitLab, BitBucket, SourceHut** support
- **Provider shortcuts**: `github:user/repo` syntax
- **Auto dependency installation** after cloning
- **Git initialization** with best practices

### ⚡ Performance Improvements
- **Faster template copying** with optimized file operations
- **Parallel dependency installation** 
- **Smart caching** for repeated operations
- **Progress indicators** for all long-running tasks

## 🚀 Advanced Usage

### Custom Templates
```bash
# Create with specific configuration
pi create my-app
# Select: Next.js → TypeScript → shadcn/ui → Tailwind → MongoDB → Prisma
```

### Environment Workflows
```bash
# Development workflow
pi create dev-project
cd dev-project
npm run dev

# Production deployment
npm run build
npm start
```

### Multi-Project Management
```bash
# Check all projects
find . -name "package.json" -exec dirname {} \; | xargs -I {} pi check -d {}

# Clone and setup multiple repos
pi clone github:org/frontend
pi clone github:org/backend
pi clone github:org/shared-components
```

## 📚 Examples

### Create a Next.js Project with Database
```bash
pi create ecommerce-app
# Select: Next.js → TypeScript → shadcn/ui → Tailwind → PostgreSQL → Prisma
```

### Rust Project Setup
```bash
pi create rust-api
# Select: Rust → Advanced template
```

### Full-Stack React Application
```bash
pi create fullstack-app
# Select: React + Express → TypeScript → MongoDB → Mongoose
```

### Check Project Health
```bash
cd my-project
pi check                    # Check all dependencies
pi check --verbose          # Detailed analysis
pi check react             # Check specific package
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/0xshariq/package-installer-cli.git
cd package-installer-cli
pnpm install
pnpm run dev
```

### Running Tests
```bash
pnpm test                   # Run all tests
pnpm test:watch            # Watch mode
pnpm test:coverage         # Coverage report
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) - Lightning fast build tool
- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Prisma](https://prisma.io/) - Next-generation ORM

## 🔗 Links

- [GitHub Repository](https://github.com/0xshariq/package-installer-cli)
- [NPM Package](https://www.npmjs.com/package/@0xshariq/package-installer)
- [Documentation](https://github.com/0xshariq/package-installer-cli/wiki)
- [Issues](https://github.com/0xshariq/package-installer-cli/issues)

---

<div align="center">
Made with ❤️ by <a href="https://github.com/0xshariq">Shariq</a>
</div>
