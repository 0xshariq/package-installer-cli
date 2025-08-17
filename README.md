# 📦 Package Installer CLI

[![npm version](https://img.shields.io/npm/v/@0xshariq/package-installer.svg)](https://www.npmjs.com/package/@0xshariq/package-installer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A **cross-platform, interactive CLI** to scaffold modern web application templates with support for multiple frameworks, languages, UI libraries, bundlers, databases, and ORMs. Create production-ready projects in seconds!

## 🚀 Features

- **🎨 Multiple Frameworks**: React, Next.js, Express, NestJS, Angular, Vue, Rust, Django
- **🔤 Language Support**: TypeScript & JavaScript variants for all frameworks
- **🎭 UI Libraries**: Tailwind CSS, Material-UI, shadcn/ui, and more
- **📦 Smart Bundlers**: Vite, Webpack, built-in framework bundlers
- **🗄️ Database Integration**: PostgreSQL, MongoDB, MySQL, SQLite
- **🔧 ORM Support**: Prisma, TypeORM, Mongoose, Sequelize
- **🔐 Authentication**: Ready-to-use auth with Clerk, Auth0, NextAuth
- **🐳 Docker Ready**: One-click Docker configuration
- **📋 Auto-Installation**: Automatic dependency installation
- **🎯 Interactive Prompts**: Guided project setup experience
- **⚡ Lightning Fast**: Optimized template generation
- **🌈 Beautiful CLI**: Gorgeous terminal interface with gradients and emojis

## 📥 Installation

### Global Installation (Recommended)

```bash
# Using npm
npm install -g @0xshariq/package-installer

# Using yarn
yarn global add @0xshariq/package-installer

# Using pnpm
pnpm add -g @0xshariq/package-installer
```

### One-Time Usage

```bash
# Using npx
npx @0xshariq/package-installer create my-app

# Using yarn
yarn create @0xshariq/package-installer my-app

# Using pnpm
pnpm create @0xshariq/package-installer my-app
```

## 🎯 Quick Start

### Display Beautiful Banner & Help
```bash
pi                    # Shows beautiful banner and quick start guide
pi --help            # Complete command reference
pi --version         # Show current version
```

### Create New Projects
```bash
pi create my-app                    # Interactive project creation
pi create blog-app                  # Create with specific name
pi create --help                    # Detailed create command help
```

### Clone & Setup Repositories
```bash
pi clone facebook/react             # Clone from GitHub
pi clone user/repo my-copy          # Clone with custom name
pi clone gitlab:user/project        # Clone from GitLab
pi clone bitbucket:user/repo        # Clone from BitBucket
pi clone sourcehut:user/repo        # Clone from SourceHut
pi clone --help                     # Detailed clone command help
```

### Check Package Versions
```bash
pi check                            # Check all packages in current project
pi check react                     # Check specific package version
pi check @types/node                # Check scoped packages
pi check --help                     # Detailed check command help
```

### Add Features to Existing Projects
```bash
pi add                              # Interactive feature selection
pi add --list                       # List all available features
pi add auth                         # Add authentication
pi add docker                       # Add Docker configuration
pi add --help                       # Detailed add command help
```

## 🎨 Supported Templates

### Frontend Frameworks

| Framework | Languages | Features |
|-----------|-----------|----------|
| **React (Vite)** | TypeScript, JavaScript | Tailwind CSS, Material-UI, shadcn/ui |
| **Next.js** | TypeScript, JavaScript | App Router, Tailwind CSS, shadcn/ui, src directory |
| **Angular** | TypeScript | Material-UI, Tailwind CSS, modern CLI setup |
| **Vue.js** | TypeScript, JavaScript | Composition API, Vite, modern tooling |

### Backend Frameworks

| Framework | Languages | Features |
|-----------|-----------|----------|
| **Express** | TypeScript, JavaScript | RESTful APIs, middleware, testing setup |
| **NestJS** | TypeScript | Decorators, modules, built-in validation |
| **Django** | Python | REST framework, modern Python setup |

### System Programming

| Language | Features |
|----------|----------|
| **Rust** | Basic & Advanced templates, Cargo workspace |

## 🛠️ Template Features

### 🎨 UI & Styling Options
- **Tailwind CSS**: Utility-first CSS framework
- **Material-UI**: React component library
- **shadcn/ui**: Modern component system
- **Custom styling**: Framework-specific solutions

### 📦 Project Structure Options
- **Source Directory**: `src/` folder organization
- **Root Level**: Direct project root structure
- **Monorepo**: Workspace and multi-package setups

### 🗄️ Database & ORM Integration
- **PostgreSQL + Prisma**: Modern database toolkit
- **MongoDB + Mongoose**: NoSQL document database
- **MySQL + Sequelize**: Traditional relational database
- **SQLite**: Lightweight local database

### 🔐 Authentication Providers
- **Clerk**: Modern auth with social logins
- **Auth0**: Enterprise authentication
- **NextAuth.js**: Next.js native authentication
- **Custom**: Roll your own auth solution

## 📋 Command Reference

### Main Commands

```bash
# Create a new project
pi create [project-name]            # Interactive project creation
pi create my-app                    # Create with specific name

# Clone repositories  
pi clone <user/repo> [project-name] # Clone from any Git provider
pi clone facebook/react             # Clone popular repositories
pi clone gitlab:user/project        # Specify provider explicitly

# Check packages
pi check [package-name]             # Version checking and suggestions
pi check                            # Check all project packages
pi check react                     # Check specific package

# Add features
pi add [feature]                    # Add features to existing projects
pi add --list                       # List all available features
pi add auth                         # Add authentication
pi add docker                       # Add Docker support

# Help and info
pi --help                           # Show all commands
pi --version                        # Show current version
pi <command> --help                 # Command-specific help
```

### Global Options

```bash
-h, --help                          # Display help information
-v, --version                       # Display version number
```

## 🔧 Advanced Usage

### Interactive Mode
All commands support interactive mode when arguments are omitted:

```bash
pi create           # Will prompt for project name and all options
pi clone            # Will prompt for repository URL and options
pi add              # Will show feature selection menu
```

### Provider-Specific Cloning
Specify the Git provider explicitly for non-GitHub repositories:

```bash
pi clone gitlab:user/project        # GitLab
pi clone bitbucket:user/repo        # BitBucket  
pi clone sourcehut:user/repo        # SourceHut
pi clone github:user/repo           # GitHub (default)
```

### Automated Workflows
Perfect for automation and CI/CD:

```bash
# Non-interactive project creation (future feature)
pi create my-app --framework=nextjs --language=typescript --ui=tailwind --no-interactive

# Batch operations
pi clone facebook/react && cd react && pi add docker
```

## 🎯 Pro Tips

- **Use `--help`** with any command for detailed usage information
- **Most arguments are optional** - CLI will prompt when needed  
- **Auto-completion**: Tab completion works for most shells
- **Environment variables**: Set `DEBUG=1` for detailed error logs
- **Template variety**: Check our 50+ templates covering popular stacks
- **Package management**: Supports npm, yarn, and pnpm automatically

## 🏗️ Project Structure

After creating a project, you'll get a modern, well-organized structure:

```
my-awesome-app/
├── src/                    # Source code (if src option selected)
│   ├── components/         # Reusable components
│   ├── pages/              # Route components
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
├── tests/                  # Test files
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── README.md               # Project documentation
├── tsconfig.json           # TypeScript configuration
└── tailwind.config.js      # Tailwind CSS config (if selected)
```

## 🔄 Auto-Installation Features

Package Installer CLI automatically:

- **Installs dependencies** using your preferred package manager (npm/yarn/pnpm)
- **Creates .env files** from .env.example templates
- **Sets up Git repository** with initial commit
- **Configures development scripts** and build processes
- **Installs development dependencies** for linting and testing

## 🐛 Troubleshooting

### Common Issues

**Installation Issues:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install -g @0xshariq/package-installer

# Permission issues (Linux/macOS)
sudo npm install -g @0xshariq/package-installer
```

**Template Issues:**
```bash
# Enable debug mode for detailed logs
DEBUG=1 pi create my-app

# Check Node.js version (requires >= 18.0.0)
node --version
```

**Command Not Found:**
```bash
# Make sure global bin directory is in PATH
npm config get prefix
echo $PATH

# Alternative: use npx
npx @0xshariq/package-installer create my-app
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/0xshariq/package-installer-cli.git
cd package-installer-cli

# Install dependencies
npm install

# Build the project
npm run build

# Test locally
node dist/index.js create test-project

# Run in development mode
npm run dev
```

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and updates.

## 🎉 Credits

Built with ❤️ by [@0xshariq](https://github.com/0xshariq)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **NPM Package**: [@0xshariq/package-installer](https://www.npmjs.com/package/@0xshariq/package-installer)
- **GitHub Repository**: [package-installer-cli](https://github.com/0xshariq/package-installer-cli)
- **Issues & Feedback**: [GitHub Issues](https://github.com/0xshariq/package-installer-cli/issues)
- **Website**: [https://package-installer-website.vercel.app/](https://package-installer-website.vercel.app/)

---

**Happy coding! 🚀** Create something amazing with Package Installer CLI.
