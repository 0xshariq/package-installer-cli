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
| `env` | Analyze development environment | ✅ Available |
| `clean` | Clean project artifacts and dependencies | ✅ Available |
| `cache` | Manage CLI cache system | ✅ Available |
| `upgrade-cli` | Upgrade CLI to latest version | ✅ Available |
| `deploy` | Deploy projects to platforms | 🚧 Coming Soon |

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

**Purpose:** Add features and packages to existing projects.

**Syntax:**
```bash
pi add [feature-name]
```

**Usage Examples:**
```bash
# Interactive feature selection
pi add

# Add specific feature
pi add auth
pi add docker
```

**Status:** ✅ Available

### check Command

**Purpose:** Check project health, dependencies, and package versions.

**Syntax:**
```bash
pi check [package-name]
```

**Usage Examples:**
```bash
# Check all packages
pi check

# Check specific package
pi check react
```

**Status:** ✅ Available

### clone Command

**Purpose:** Clone and setup repositories from various Git providers.

**Syntax:**
```bash
pi clone [repository-url]
```

**Usage Examples:**
```bash
# Interactive repository cloning
pi clone

# Clone specific repository
pi clone facebook/react
pi clone user/repo my-project
```

**Status:** ✅ Available

### doctor Command

**Purpose:** Diagnose and fix common project issues.

**Syntax:**
```bash
pi doctor
```

**Usage Examples:**
```bash
# Run project diagnostics
pi doctor

# Auto-fix issues
pi doctor --fix
```

**Status:** ✅ Available

### upgrade-cli Command

**Purpose:** Upgrade Package Installer CLI to the latest version.

**Syntax:**
```bash
pi upgrade-cli
```

**Usage Examples:**
```bash
# Upgrade CLI to latest version
pi upgrade-cli
```

**Status:** ✅ Available

### cache Command

**Purpose:** Manage Package Installer CLI cache system for improved performance.

**Syntax:**
```bash
pi cache [subcommand] [options]
```

**Available Subcommands:**
- `pi cache` - Display cache statistics and recent projects
- `pi cache stats` - Show detailed cache statistics
- `pi cache clear [type]` - Clear cache data
- `pi cache info` - Display cache configuration and paths
- `pi cache optimize` - Optimize cache by removing expired entries

**Clear Cache Types:**
- `projects` - Clear project metadata cache
- `analysis` - Clear project analysis results
- `packages` - Clear package version cache
- `templates` - Clear template usage statistics
- `templateFiles` - Clear cached template files
- `system` - Clear system environment cache
- `all` - Clear all cache types

**Usage Examples:**
```bash
# View cache dashboard
pi cache

# Show detailed statistics
pi cache stats

# Clear all caches
pi cache clear all

# Clear only project analysis cache
pi cache clear analysis

# Show cache configuration
pi cache info

# Optimize cache performance
pi cache optimize
```

**Cache Benefits:**
- **2-5x faster** project analysis with cached metadata
- **Instant recommendations** based on template usage patterns
- **Reduced network requests** for package version checks
- **Smart invalidation** ensures data freshness (automatic expiry)

**Cache Storage:**
- Cache files are stored in `~/.pi-cache/`
- Individual cache types have different expiry times
- Safe to manually delete cache directory if needed

**Status:** ✅ Available

## Advanced Features

### Intelligent Caching System

The CLI includes a comprehensive caching system that dramatically improves performance:

#### Cache Types & Expiry
- **Project Analysis** - 2 hours (frequent changes expected)
- **Package Versions** - 1 hour (check for updates regularly)
- **Template Files** - 7 days (templates change less frequently)
- **System Environment** - 24 hours (tools don't change often)
- **Template Usage** - Permanent (tracks usage patterns)

#### Performance Impact
- Project creation: **5-10x faster** with cached templates
- Project analysis: **2-3x faster** on cache hits
- Package updates: **60% faster** with version caching
- Template recommendations: **Instant** with usage tracking

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
