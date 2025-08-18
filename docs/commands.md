# Package Installer CLI - Commands Documentation

This document provides comprehensive information about all available commands in the Package Installer CLI.

## Installation

Install the Package Installer CLI globally using your preferred package manager:

```bash
# Using npm
npm install -g @0xshariq/package-installer

# Using pnpm (recommended)
pnpm install -g @0xshariq/package-installer

# Using yarn
yarn global add @0xshariq/package-installer
```

After installation, you can use the `pi` command globally.

## Global Options

The following options are available for all commands:

| Option | Description |
|--------|-------------|
| `-v, --version` | Display CLI version |
| `-h, --help` | Show help information |

## Commands Overview

| Command | Description | Status |
|---------|-------------|--------|
| `create` | Create new project from templates | ✅ Available |
| `analyze` | Analyze project structure and dependencies | ✅ Available |
| `update` | Update project dependencies to latest versions | ✅ Available |
| `add` | Add packages to the current project | 🚧 Coming Soon |
| `check` | Check project health and dependencies | 🚧 Coming Soon |
| `clean` | Clean project artifacts and dependencies | 🚧 Coming Soon |
| `clone` | Clone and setup repository templates | 🚧 Coming Soon |
| `deploy` | Deploy project to cloud platforms | 🚧 Coming Soon |
| `doctor` | Diagnose and fix project issues | 🚧 Coming Soon |
| `env` | Manage environment variables | 🚧 Coming Soon |
| `upgrade` | Upgrade CLI to latest version | 🚧 Coming Soon |

## Core Commands

### create Command

**Purpose:** Create new projects from pre-configured templates with interactive setup.

**Syntax:**
```bash
pi create [project-name]
```

**Usage Examples:**
```bash
# Interactive project creation
pi create

# Create project with specific name
pi create my-awesome-app
```

**Features:**
- Interactive template selection
- Framework and language options
- Automatic dependency installation
- Git repository initialization
- User preference caching

**Supported Templates:**
- **Next.js:** JavaScript/TypeScript with various configurations
- **React:** Vite-based templates with modern tooling
- **Vue.js:** Vue 3 templates with composition API
- **Angular:** Material UI templates with TypeScript
- **Express:** REST API templates with middleware
- **Rust:** Basic and advanced project structures

### analyze Command

**Purpose:** Analyze project structure, dependencies, and provide development insights.

**Syntax:**
```bash
pi analyze
```

**Usage Examples:**
```bash
# Analyze current directory
pi analyze
```

**Features:**
- Project language detection
- Dependency analysis and recommendations
- Project structure overview
- Performance insights
- System information display
- Interactive dashboard with tables and charts

### update Command

**Purpose:** Update project dependencies to their latest versions across multiple languages and package managers.

**Syntax:**
```bash
pi update [package-names...]
```

**Usage Examples:**
```bash
# Interactive update menu
pi update

# Update specific packages
pi update lodash react

# Update all packages (Coming Soon)
pi update --all

# Dry run to preview changes (Coming Soon)
pi update --dry-run
```

**Supported Languages & Package Managers:**
- **Node.js:** npm, pnpm, yarn
- **Rust:** cargo
- **Python:** pip, poetry
- **Go:** go modules
- **PHP:** composer
- **Ruby:** bundler

**Features:**
- Multi-language support
- Package manager auto-detection
- Interactive selection interface
- Global and local package updates (Coming Soon)
- Dry-run mode for preview (Coming Soon)

## Advanced Features

### User Preference Caching

The CLI intelligently caches your preferences to speed up future project creation:

- **Cache Location:** `~/.pi-cache.json`
- **Cached Information:** 
  - Preferred frameworks and languages
  - Package manager preferences
  - Project naming patterns
  - Recent project locations

### Project Name Suggestions

The CLI provides intelligent project name suggestions based on:
- Framework choice
- Usage patterns
- Current context
- User's naming history

### Environment Detection

The CLI automatically detects your development environment:
- Operating system and architecture
- Node.js version and installation path
- Available package managers
- Git configuration

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PKG_CLI_CACHE_DIR` | Custom cache directory location | `~/.pi-cache.json` |

## Troubleshooting

### Common Issues

#### Template Creation Fails
```bash
# Check permissions in target directory
ls -la /path/to/project/directory

# Try creating in a different location
pi create ~/Desktop/my-project
```

#### Package Installation Fails
```bash
# Check package manager availability
npm --version
pnpm --version
yarn --version

# Try with a different package manager
# (The CLI will prompt for alternatives)
```

#### Analysis Command Errors
```bash
# Ensure you're in a project directory
pwd && ls -la

# Check directory permissions
ls -la
```

### Getting Help

1. **Built-in Help:** Use `-h` or `--help` with any command
2. **GitHub Issues:** [Report bugs and feature requests](https://github.com/0xshariq/package-installer-cli/issues)
3. **Repository:** [Visit the GitHub repository](https://github.com/0xshariq/package-installer-cli)

## Best Practices

### Project Creation
1. Use descriptive project names
2. Choose appropriate templates for your needs
3. Initialize git repositories for version control
4. Review generated files and customize as needed

### Package Management
1. Use `--dry-run` before major updates (Coming Soon)
2. Commit changes before updating dependencies
3. Test applications after package updates
4. Keep dependencies up to date regularly

### Development Workflow
1. Use `analyze` command to understand project structure
2. Leverage user preference caching for efficiency
3. Regularly check for CLI updates

---

For more information and updates, visit the [GitHub repository](https://github.com/0xshariq/package-installer-cli).
