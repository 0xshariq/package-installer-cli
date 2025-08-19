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
| `add` | Add features to existing projects | ✅ Available |
| `check` | Check project health and dependencies | ✅ Available |
| `clone` | Clone and setup repositories | ✅ Available |
| `doctor` | Diagnose and fix project issues | ✅ Available |
| `upgrade-cli` | Upgrade CLI to latest version | ✅ Available |
| `clean` | Clean project artifacts and dependencies | 🚧 Coming Soon |
| `deploy` | Deploy projects to platforms | 🚧 Coming Soon |
| `env` | Manage environment variables | 🚧 Coming Soon |

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

### add Command

**Purpose:** Add features and packages to existing projects, including authentication, Docker, and framework-specific enhancements.

**Syntax:**
```bash
pi add [feature-name]
```

**Usage Examples:**
```bash
# Interactive feature selection
pi add

# Add authentication features
pi add auth

# Add Docker configuration
pi add docker

# Add testing framework
pi add testing

# Add linting tools
pi add eslint
```

**Available Features:**
- **Authentication:** OAuth, JWT, social logins
- **Docker:** Containerization setup
- **Testing:** Jest, Vitest, Cypress
- **Linting:** ESLint, Prettier
- **CI/CD:** GitHub Actions, GitLab CI
- **Database:** MongoDB, PostgreSQL setup

**Status:** ✅ Available

### check Command

**Purpose:** Check project health, dependencies, package versions, and get update suggestions with security vulnerability scanning.

**Syntax:**
```bash
pi check [package-name]
```

**Usage Examples:**
```bash
# Check all packages in current project
pi check

# Check specific package
pi check react

# Check for security vulnerabilities
pi check --security

# Check outdated packages only
pi check --outdated

# Export report to file
pi check --export report.json
```

**Features:**
- **Dependency Analysis:** Shows current vs latest versions
- **Security Scanning:** Identifies vulnerable packages
- **Health Check:** Project structure validation
- **Update Suggestions:** Recommends safe updates
- **Export Reports:** JSON, CSV formats

**Status:** ✅ Available

### clone Command

**Purpose:** Clone and setup repositories from GitHub, GitLab, BitBucket, and other Git providers with automatic dependency installation.

**Syntax:**
```bash
pi clone [repository-url]
```

**Usage Examples:**
```bash
# Interactive repository cloning
pi clone

# Clone GitHub repository (user/repo format)
pi clone facebook/react

# Clone with custom project name
pi clone facebook/react my-react-study

# Clone from different providers
pi clone gitlab:user/project
pi clone bitbucket:user/repo

# Clone specific branch
pi clone user/repo --branch develop

# Clone without installing dependencies
pi clone user/repo --no-install
```

**Supported Providers:**
- **GitHub** (default)
- **GitLab** 
- **BitBucket**
- **SourceHut**
- **Custom Git URLs**

**Features:**
- **Auto-setup:** Dependency installation after cloning
- **Multi-provider:** Support for all major Git hosts
- **Branch selection:** Clone specific branches
- **Project renaming:** Custom local names

**Status:** ✅ Available

### doctor Command

**Purpose:** Diagnose and fix common project issues, including dependency conflicts, configuration problems, and environment issues.

**Syntax:**
```bash
pi doctor [options]
```

**Usage Examples:**
```bash
# Run comprehensive project diagnostics
pi doctor

# Auto-fix detected issues
pi doctor --fix

# Check specific aspect
pi doctor --dependencies
pi doctor --environment
pi doctor --permissions

# Generate detailed report
pi doctor --report
```

**Diagnostic Features:**
- **Dependency Analysis:** Detect conflicts and missing packages
- **Environment Check:** Node.js, npm, git configuration
- **Permission Issues:** File and folder access problems
- **Configuration Validation:** ESLint, TypeScript, build configs
- **Port Conflicts:** Development server issues
- **Cache Problems:** Clear corrupted caches

**Auto-fix Capabilities:**
- **Package Installation:** Install missing dependencies
- **Cache Clearing:** Remove corrupted caches
- **Permission Fixes:** Correct file permissions
- **Config Updates:** Fix common configuration issues

**Status:** ✅ Available

### upgrade-cli Command

**Purpose:** Upgrade Package Installer CLI to the latest version with automatic uninstall/reinstall for clean updates.

**Syntax:**
```bash
pi upgrade-cli
```

**Usage Examples:**
```bash
# Upgrade CLI to latest version
pi upgrade-cli

# Show upgrade help
pi upgrade-cli --help
```

**Upgrade Process:**
1. **Version Check:** Compares current vs latest version
2. **Package Manager Detection:** Detects npm, yarn, or pnpm
3. **Clean Uninstall:** Removes current version completely
4. **Fresh Install:** Installs latest version from scratch
5. **Verification:** Confirms successful upgrade

**Features:**
- **Smart Detection:** Automatically detects your package manager
- **Clean Upgrade:** Uninstalls old version before installing new
- **Version Verification:** Confirms upgrade success
- **Error Recovery:** Provides manual instructions on failure
- **Progress Feedback:** Real-time upgrade status

**Supported Package Managers:**
- **npm:** `npm uninstall -g && npm install -g @latest`
- **yarn:** `yarn global remove && yarn global add @latest`
- **pnpm:** `pnpm remove -g && pnpm add -g @latest`

**Status:** ✅ Available

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
