# 📚 Package Installer CLI - Commands Documentation

This document provides comprehensive information about all available commands in Package Installer CLI.

## 🚀 Quick Start

### Installation

Install Package Installer CLI globally using your preferred package manager:

```bash
# Using npm
npm install -g @0xshariq/package-installer

# Using pnpm (recommended)
pnpm install -g @0xshariq/package-installer

# Using yarn
yarn global add @0xshariq/package-installer
```

> **📋 Complete Installation Guide**: For all installation methods including Python, Rust, Ruby, Go, Homebrew, and Docker, see [installation.md](docs/installation.md)
After installation, you can use the `pi` command globally in any terminal.

### First Steps

```bash
# Check installation
pi --version

# Get help
pi --help

# Create your first project
pi create my-awesome-app

# Analyze any existing project
cd existing-project && pi analyze
```

## 🌐 Global Options

Available for all commands:

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--version` | `-v` | Display CLI version | `pi -v` |
| `--help` | `-h` | Show help information | `pi -h` |
| `--verbose` | | Enable detailed logging | `pi create --verbose` |
| `--no-cache` | | Disable caching for command | `pi analyze --no-cache` |

## 📋 Commands Overview

| Command | Purpose | Key Features | Status |
|---------|---------|-------------|--------|
| [`auth`](#auth-command) | Register, Login Logout | Interactive authentication with 2fa | ✅ Available |
| [`create`](#create-command) | Create new projects from templates | Interactive selection, modern tooling | ✅ Available |
| [`analyze`](#analyze-command) | Project analytics dashboard | Usage stats, performance insights | ✅ Available |
| [`update`](#update-command) | Update project dependencies | Multi-language support, safety checks | ✅ Available |
| [`add`](#add-command) | Add features to existing projects | Framework detection, smart config | ✅ Available |
| [`check`](#check-command) | Check package versions | Security scanning, detailed reports | ✅ Available |
| [`clone`](#clone-command) | Clone and setup repositories | Multiple platforms, auto setup | ✅ Available |
| [`doctor`](#doctor-command) | Diagnose and fix issues | Auto-fix, comprehensive checks | ✅ Available |
| [`env`](#env-command) | Environment analysis | Tool detection, optimization tips | ✅ Available |
| [`clean`](#clean-command) | Clean project artifacts | Selective cleanup, preview mode | ✅ Available |
| [`cache`](#cache-command) | Manage CLI cache and data | Performance optimization | ✅ Available |
| [`email`](#email-command) | Contact developer with feedback | Bug reports, feature requests | ✅ Available |
| [`upgrade-cli`](#upgrade-cli-command) | Upgrade CLI version | Breaking change detection | ✅ Available |
| [`deploy`](#deploy-command) | Deploy to cloud platforms | Auto-detection, 17 platforms | ✅ Available |
| [`benchmark`](#benchmark-command) | Performance analysis | Build time, bundle size, memory | 🚧 Coming Soon |
| [`security`](#security-command) | Security scanning & fixes | Vulnerability detection, auto-fix | 🚧 Coming Soon |
| [`migrate`](#migrate-command) | Framework migration wizard | React→Next.js, Vue→Nuxt, etc. | 🚧 Coming Soon |
| [`ai`](#ai-command) | AI-powered development assistant | Code review, test generation | 🚧 Coming Soon |
| [`docs`](#docs-command) | Documentation generator | README, API docs, interactive | 🚧 Coming Soon |
| [`compare`](#compare-command) | Project comparison tool | Dependencies, configs, metrics | 🚧 Coming Soon |
| [`explain`](#explain-command) | Code & project explanation | Structure analysis, complexity | 🚧 Coming Soon |


## 🛠️ Core Commands
### `auth` Command

Manage CLI authentication with secure local user accounts. Supports registration, login, logout, status, and user management. All authentication is local and stored securely in your home directory (no external service required).

**Syntax:**
```bash
pi auth [subcommand] [options]
```

**Subcommands:**
| Subcommand      | Description                                 |
|-----------------|---------------------------------------------|
| `login`         | Login interactively or with --email/--password |
| `register`      | Register a new user (interactive or non-interactive) |
| `logout`        | Logout the current session                  |
| `status`        | Show login status (who is logged in)        |
| `whoami`        | Print the email of the current user         |
| `list-users`    | List all registered user emails             |

**Options:**
| Option                | Description                                 |
|-----------------------|---------------------------------------------|
| `--email <email>`     | Email for login/register (non-interactive)  |
| `--password <pass>`   | Password for login/register (non-interactive) |
| `-h, --help`          | Show help for the auth command or subcommand |

**Examples:**
```bash
# Register a new user interactively
pi auth register

# Register non-interactively
pi auth register --email user@example.com --password hunter2

# Login interactively
pi auth login

# Login non-interactively
pi auth login --email user@example.com --password hunter2

# Show current login status
pi auth status

# Show current user email
pi auth whoami

# List all registered users
pi auth list-users

# Logout
pi auth logout
```

**How it works:**
- User credentials are stored locally in `~/.package-installer-cli/auth.json` with secure password hashing (scrypt + salt).
- Session info is stored in `~/.package-installer-cli/session.json`.
- No external authentication provider is required.
- All subcommands are available via `pi auth <subcommand>`.
- For more details, run `pi auth --help`.


### `create` Command

Create new projects from pre-configured templates with interactive setup and modern tooling.

**Syntax:**
```bash
pi create [project-name] [options]
```

**Interactive Mode:**
```bash
# Start interactive project creation
pi create

# Follow the prompts:
# 1. Select framework (React, Next.js, Vue, Angular, etc.)
# 2. Choose language (TypeScript/JavaScript)
# 3. Pick styling options (Tailwind, Material-UI, etc.)
# 4. Configure additional features
# 5. Set project name and location
```

**Direct Mode:**
```bash
# Create with specific name
pi create my-awesome-app

# Create in specific directory
pi create ./projects/my-app

# Create with template preselection (Coming Soon)
pi create my-app --template=nextjs-ts-tailwind
```

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--template` | Pre-select template | `--template=react-vite-ts` |
| `--no-install` | Skip dependency installation | `--no-install` |
| `--no-git` | Skip git initialization | `--no-git` |
| `--package-manager` | Force package manager | `--package-manager=pnpm` |

**Template Categories:**
- **Frontend Frameworks:** React, Next.js, Vue.js, Angular, Svelte
- **Backend APIs:** Express.js, NestJS, FastAPI, Django
- **Fullstack Solutions:** React+Express, React+NestJS with shadcn/ui
- **System Programming:** Rust (basic & advanced), Go, Python
- **Mobile Development:** React Native (coming soon)

**Project Structure Example:**
```
my-awesome-app/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/           # Application pages
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   └── styles/          # Styling files
├── public/              # Static assets
├── package.json         # Dependencies & scripts
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind CSS config
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

**Features:**
- ✅ **Smart Template Selection** - AI-powered recommendations
- ✅ **Modern Tooling** - Vite, TypeScript, ESLint, Prettier
- ✅ **Package Manager Detection** - Auto-detects npm/yarn/pnpm
- ✅ **Git Integration** - Automatic repository initialization
- ✅ **User Preferences** - Remembers your choices for faster setup

---

### `analyze` Command

Comprehensive project analytics with real-time data and performance insights.

**Syntax:**
```bash
pi analyze [options]
```

**Basic Usage:**
```bash
# Analyze current directory
pi analyze

# Analyze specific project
pi analyze /path/to/project

# Force refresh without cache
pi analyze --no-cache
```

**Dashboard Features:**

**📊 Project Overview:**
- Language/framework detection
- Project size and file count
- Dependency analysis with versions
- Git repository information

**📈 Analytics Dashboard:**
```
Package Installer CLI Analytics
===============================

📊 Usage Statistics
├── Total Projects Created: 15
├── Most Used Template: React (40%)
├── Preferred Language: TypeScript (80%)
└── Success Rate: 98.5%

⚡ Performance Insights
├── Average Setup Time: 2.3 minutes
├── Cache Hit Rate: 85%
├── Template Load Time: 0.8 seconds
└── Dependency Install Time: 45 seconds

🛠️ Environment Info
├── OS: Linux x64
├── Node.js: v20.10.0
├── Package Manager: pnpm 8.15.0
└── Git: 2.41.0
```

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--detailed` | Show detailed analysis | `--detailed` |
| `--reset` | Reset analytics history | `--reset` |
| `--export <method>` | Export analysis to file (json, xml, yaml) | `--export json` |

**Real-time Data Sources:**
- ✅ **Live Project Scanning** - Current directory analysis
- ✅ **Package Version Checking** - Latest version comparisons
- ✅ **Git Status Integration** - Repository health checks
- ✅ **Usage History** - Data from `~/.package-installer-cli/history.json`

---

### `update` Command

Update project dependencies across multiple languages and package managers.

**Syntax:**
```bash
pi update [package-names...] [options]
```

**Interactive Mode:**
```bash
# Interactive update menu
pi update

# Select packages to update:
# ├── 📦 React: 18.2.0 → 18.3.1 (Minor)
# ├── 📦 TypeScript: 5.1.6 → 5.3.2 (Minor)
# ├── 📦 Next.js: 13.4.19 → 14.0.0 (Major) ⚠️
# └── 📦 Tailwind: 3.3.3 → 3.4.0 (Minor)
```

**Targeted Updates:**
```bash
# Update specific packages
pi update lodash react typescript

# Update development dependencies
pi update --dev eslint prettier

# Update global packages
pi update --global typescript nodemon
```

**Supported Languages & Package Managers:**

| Language | Package Manager | Auto-Detection | Example |
|----------|----------------|----------------|---------|
| **JavaScript/TypeScript** | npm, yarn, pnpm | ✅ Lock files | `pi update react lodash` |
| **Rust** | cargo | ✅ Cargo.toml | `pi update serde tokio` |
| **Python** | pip, poetry | ✅ requirements.txt | `pi update requests flask` |
| **Go** | go modules | ✅ go.mod | `pi update github.com/gin-gonic/gin` |
| **PHP** | composer | ✅ composer.json | `pi update symfony/console` |
| **Ruby** | bundler | ✅ Gemfile | `pi update rails puma` |

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--all` | Update all packages | `--all` |
| `--dev` | Update only dev dependencies | `--dev` |
| `--global` | Update global packages | `--global` |
| `--dry-run` | Preview changes only | `--dry-run` |
| `--force` | Force update (skip confirmation) | `--force` |

**Update Process:**
1. **Detection Phase** - Scan for package managers and dependency files
2. **Analysis Phase** - Check current vs latest versions
3. **Selection Phase** - Interactive package selection or auto-selection
4. **Update Phase** - Execute package manager commands
5. **Verification Phase** - Confirm successful updates

**Safety Features:**
- ✅ **Backup Creation** - Automatic package.json backup
- ✅ **Version Conflict Detection** - Warns about breaking changes
- ✅ **Rollback Support** - Easy revert if issues occur
- ✅ **Dependency Validation** - Checks for compatibility issues

---

### `add` Command

Add features and integrations to existing projects with smart configuration.

**Syntax:**
```bash
pi add [feature-name] [options]
```

**Interactive Mode:**
```bash
# Browse available features
pi add

# Category-based selection:
# 🔐 Authentication
# ├── Auth0 Integration
# ├── Clerk Authentication
# ├── NextAuth.js Setup
# └── Custom JWT Auth
#
# 🎨 UI Libraries
# ├── Tailwind CSS
# ├── Material-UI
# ├── Chakra UI
# └── shadcn/ui
```

**Direct Feature Addition:**
```bash
# Add specific features (interactive selection)
pi add auth            # Authentication providers
pi add docker          # Docker configuration
pi add ui              # UI libraries (Tailwind, Material-UI, etc.)
pi add testing         # Testing frameworks
pi add database        # Database integrations
```

**Feature Categories:**

**🔐 Authentication:**
- Auth0, Clerk, NextAuth.js, Firebase Auth
- JWT implementation, OAuth providers
- Session management, user roles

**🎨 UI & Styling:**
- Tailwind CSS, Material-UI, Chakra UI, shadcn/ui
- Theme configuration, responsive design
- Icon libraries, animation frameworks

**🗄️ Database Integration:**
- MongoDB, PostgreSQL, MySQL, Redis
- ORM setup (Prisma, TypeORM, Mongoose)
- Migration scripts, seed data

**📊 Analytics & Monitoring:**
- Google Analytics, Plausible, PostHog
- Error tracking (Sentry), performance monitoring
- Custom event tracking, user behavior analysis

**🐳 DevOps & Deployment:**
- Docker containerization, CI/CD pipelines
- Kubernetes manifests, environment configuration
- Health checks, logging setup

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--config` | Custom configuration | `--config=advanced` |
| `--skip-install` | Skip dependency installation | `--skip-install` |
| `--overwrite` | Overwrite existing files | `--overwrite` |

**Smart Configuration:**
- ✅ **Framework Detection** - Adapts to your project type
- ✅ **Existing Config Merging** - Preserves current settings
- ✅ **Dependency Conflict Resolution** - Handles version conflicts
- ✅ **Environment Setup** - Creates necessary config files

---

### `check` Command

Comprehensive project health diagnostics and dependency validation.

**Syntax:**
```bash
pi check [package-name] [options]
```

**Project Health Check:**
```bash
# Complete project analysis
pi check

# Health Report:
# ✅ Dependencies: All up to date
# ⚠️  Security: 2 vulnerabilities found
# ❌ Performance: Bundle size too large
# ✅ Code Quality: ESLint passing
# ⚠️  Git: Uncommitted changes
```

**Specific Package Check:**
```bash
# Check individual packages
pi check react
pi check @types/node
pi check eslint

# Output:
# 📦 react
# ├── Current: 18.2.0
# ├── Latest: 18.3.1
# ├── Status: Outdated (Minor update available)
# ├── Security: No known vulnerabilities
# └── Size: 42.2kB (gzipped)
```

**Health Check Categories:**

**📦 Dependencies:**
- Version compatibility analysis
- Security vulnerability scanning
- Unused dependency detection
- License compliance checking

**⚡ Performance:**
- Bundle size analysis
- Load time optimization suggestions
- Memory usage patterns
- Build time metrics

**🔍 Code Quality:**
- ESLint/TSLint rule violations
- Code complexity analysis
- Test coverage reports
- Documentation completeness

**🔒 Security:**
- Known vulnerability database checks
- Package signature verification
- Dependency tree analysis
- Security best practice validation

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--security` | Security-focused scan | `--security` |
| `--performance` | Performance analysis | `--performance` |
| `--detailed` | Detailed diagnostics | `--detailed` |
| `--fix` | Auto-fix issues | `--fix` |

---

### `clone` Command

Clone and setup repositories with intelligent configuration detection.

**Syntax:**
```bash
pi clone [repository-url] [directory] [options]
```

**Direct Repository Cloning:**
```bash
# Clone from GitHub
pi clone facebook/react
pi clone vercel/next.js my-nextjs-study

# Clone from GitLab
pi clone gitlab:group/project

# Clone from custom Git URLs
pi clone https://github.com/user/repo.git
pi clone git@github.com:user/repo.git
```

**Smart Setup Features:**

**📦 Dependency Detection:**
- Automatic package manager detection
- Smart dependency installation
- Development environment setup
- Build script configuration

**🔧 Configuration Setup:**
- Environment variable templates
- Database connection setup
- API key placeholders
- Development server configuration

**📋 Project Analysis:**
- Technology stack detection
- Framework version identification
- Required tool installation prompts
- Setup instruction generation

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--offline` | Use cached templates if available | `--offline` |
| `--no-deps` | Skip dependency installation | `--no-deps` |
| `--no-git` | Skip git initialization | `--no-git` |
| `--shallow` | Create shallow clone (faster) | `--shallow` |
| `--branch` | Clone specific branch | `--branch=develop` |
| `--template` | Treat as template repository | `--template` |

**Post-Clone Actions:**
1. **Dependency Installation** - Automatic npm/yarn/pnpm install
2. **Environment Setup** - Copy .env.example to .env
3. **Database Setup** - Migration and seed data (if applicable)
4. **Development Server** - Instructions for starting the project
5. **Documentation** - Open README and setup guides

---

### `doctor` Command

Advanced diagnostics and automated issue resolution for development environments.

**Syntax:**
```bash
pi doctor [options]
```

**Comprehensive System Check:**
```bash
# Full system diagnostics
pi doctor

# Diagnostic Report:
# 🏥 Package Installer CLI Doctor
# ================================
#
# ✅ System Environment
# ├── OS: Linux x64 ✓
# ├── Node.js: v20.10.0 ✓
# ├── Package Managers: npm ✓, pnpm ✓, yarn ✓
# └── Git: 2.41.0 ✓
#
# ⚠️  Project Issues
# ├── Outdated dependencies: 5 packages
# ├── Security vulnerabilities: 2 moderate
# ├── Large bundle size: 2.3MB (recommended: <1MB)
# └── Missing TypeScript types: @types/lodash
#
# 🔧 Suggested Fixes
# ├── Run: pi update --security
# ├── Install: npm i @types/lodash
# └── Optimize: Enable tree shaking
```

**Diagnostic Categories:**

**🖥️ System Environment:**
- Operating system compatibility
- Node.js version and installation
- Package manager availability and versions
- Git configuration and SSH keys
- Required development tools

**📦 Project Health:**
- Dependency version conflicts
- Missing peer dependencies
- Unused dependencies
- Security vulnerabilities
- License compatibility

**⚙️ Configuration Issues:**
- TypeScript configuration errors
- ESLint and Prettier conflicts
- Build configuration problems
- Environment variable issues
- Port conflicts and accessibility

**🚀 Performance Problems:**
- Large bundle sizes
- Slow build times
- Memory usage issues
- Inefficient dependency usage
- Missing optimizations

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--fix` | Automatically fix detected issues | `--fix` |
| `--node` | Check Node.js and npm setup only | `--node` |
| `--deps` | Check project dependencies only | `--deps` |
| `--tools` | Check development tools only | `--tools` |
| `--verbose` | Show detailed diagnostic information | `--verbose` |

**Auto-Fix Capabilities:**
- ✅ **Dependency Updates** - Update outdated packages
- ✅ **Security Patches** - Apply security fixes
- ✅ **Configuration Repairs** - Fix common config issues
- ✅ **Performance Optimizations** - Apply best practices
- ✅ **Code Style Fixes** - Format and lint corrections

---

### `env` Command

Comprehensive development environment analysis and optimization recommendations.

**Syntax:**
```bash
pi env [options]
```

**Environment Overview:**
```bash
# Analyze development environment
pi env

# Environment Report:
# 🌍 Development Environment Analysis
# ===================================
#
# 💻 System Information
# ├── OS: Ubuntu 22.04 LTS (Linux x64)
# ├── CPU: Intel Core i7-10700K (16 cores)
# ├── Memory: 32GB (Available: 28GB)
# ├── Disk: 512GB SSD (Free: 128GB)
# └── Shell: bash 5.1.16
#
# 🛠️ Development Tools
# ├── Node.js: v20.10.0 (✅ Latest LTS)
# ├── npm: 10.2.3 (✅ Up to date)
# ├── pnpm: 8.15.0 (✅ Latest)
# ├── yarn: 4.0.2 (✅ Latest)
# ├── Git: 2.41.0 (✅ Latest)
# ├── Docker: 24.0.7 (✅ Latest)
# └── VS Code: 1.85.0 (✅ Latest)
#
# 🔧 Package Installer CLI
# ├── Version: 2.1.0 (✅ Latest)
# ├── Cache Size: 45MB
# ├── Projects Created: 15
# └── Last Update Check: 2 hours ago
```

**Performance Recommendations:**
```bash
# Get optimization suggestions
pi env --optimize

# Optimization Suggestions:
# ⚡ Performance Improvements
# ├── Enable pnpm for 3x faster installs
# ├── Configure npm registry mirror for faster downloads
# ├── Increase Node.js memory limit: --max-old-space-size=8192
# ├── Enable disk cache for Docker builds
# └── Configure Git LFS for large file handling
#
# 🔒 Security Enhancements
# ├── Enable npm audit auto-fix
# ├── Configure GitHub SSH key authentication
# ├── Set up GPG commit signing
# └── Enable 2FA for package manager accounts
```

**Tool Version Management:**
```bash
# Check for tool updates
pi env --check-updates

# Update recommendations:
# 📦 Available Updates
# ├── Node.js: 20.10.0 → 21.4.0 (Consider for testing)
# ├── Docker: 24.0.7 → 24.0.8 (Security update)
# └── VS Code: 1.85.0 → 1.85.1 (Bug fixes)
```

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--check` | Check development tools and versions | `--check` |
| `--generate` | Generate .env template for project | `--generate` |
| `--validate` | Validate existing .env file | `--validate` |
| `--export` | Export environment info to file | `--export` |
| `--system` | Show system information only | `--system` |

---

### `clean` Command

Intelligent project cleanup with selective file removal and optimization.

**Syntax:**
```bash
pi clean [target] [options]
```

**Interactive Cleanup:**
```bash
# Interactive cleanup menu
pi clean

# Cleanup Options:
# 🧹 Project Cleanup
# ├── 📦 Dependencies (node_modules): 450MB
# ├── 🏗️ Build artifacts (dist, build): 23MB
# ├── 📊 Log files (*.log): 5MB
# ├── 🗂️ Cache directories (.cache): 78MB
# ├── 🎯 Temporary files (*.tmp): 2MB
# └── 🔍 Analysis reports: 1MB
#
# Total space to recover: 559MB
# Select items to clean: [Space to select, Enter to confirm]
```

**Targeted Cleanup:**
```bash
# Clean specific targets
pi clean deps           # Remove node_modules, vendor, etc.
pi clean build          # Remove build artifacts
pi clean cache          # Clear all cache directories
pi clean logs           # Remove log files
pi clean temp           # Remove temporary files
```

**Cleanup Targets:**

**📦 Dependencies:**
- `node_modules/` (Node.js)
- `vendor/` (PHP, Ruby)
- `target/` (Rust)
- `__pycache__/` (Python)
- `build/` directories

**🏗️ Build Artifacts:**
- `dist/`, `build/`, `out/`
- `*.js.map`, `*.css.map`
- Compiled binaries
- Generated documentation
- Bundle analysis files

**🗂️ Cache Directories:**
- `.cache/`, `.tmp/`
- Package manager caches
- Build tool caches
- Browser caches
- Test coverage reports

**📊 Development Files:**
- Log files (`*.log`)
- Debug files (`*.debug`)
- Profiling data
- Test reports
- Benchmark results

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--dry-run` | Preview cleanup without removing | `--dry-run` |
| `--force` | Skip confirmation prompts | `--force` |
| `--recursive` | Clean subdirectories | `--recursive` |
| `--preserve` | Preserve specific patterns | `--preserve="*.config.js"` |

**Safety Features:**
- ✅ **Preview Mode** - See what will be deleted before confirmation
- ✅ **Selective Cleaning** - Choose specific file types
- ✅ **Size Calculation** - Shows space that will be recovered
- ✅ **Backup Option** - Create backup before major cleanups
- ✅ **Exclude Patterns** - Protect important files

---

### `cache` Command

Advanced cache management with detailed analytics and optimization tools.

**Syntax:**
```bash
pi cache [subcommand] [options]
```

**Cache Dashboard:**
```bash
# View comprehensive cache information
pi cache

# Package Installer CLI Cache Dashboard
# ====================================
#
# 📊 Cache Statistics
# ├── Total Size: 127MB
# ├── Files Count: 1,247
# ├── Hit Rate: 87.3%
# ├── Last Cleanup: 3 days ago
# └── Storage Location: ~/.package-installer-cli/
#
# 📂 Cache Breakdown
# ├── 📋 Project Metadata: 45MB (851 files)
# ├── 📦 Package Info: 32MB (234 files)
# ├── 🎨 Template Files: 28MB (89 files)
# ├── 🔍 Analysis Results: 15MB (67 files)
# └── ⚙️ System Cache: 7MB (6 files)
#
# ⏱️ Cache Performance
# ├── Project Analysis: 2.3x faster
# ├── Template Loading: 5.1x faster
# ├── Package Updates: 1.8x faster
# └── Environment Checks: 3.2x faster
```

**Cache Management:**

**📊 Statistics & Analytics:**
```bash
# Detailed cache statistics
pi cache stats

# Performance metrics:
# - Cache hit/miss ratios
# - Speed improvements per operation
# - Storage efficiency analysis
# - Usage patterns over time
```

**🧹 Cache Cleaning:**
```bash
# Clear all caches
pi cache clear all

# Clear specific cache types
pi cache clear projects      # Project metadata
pi cache clear analysis      # Analysis results
pi cache clear packages      # Package version info
pi cache clear templates     # Template files
pi cache clear system        # System environment

# Selective clearing with confirmation
pi cache clear projects --confirm
```

**🔧 Cache Optimization:**
```bash
# Optimize cache performance
pi cache optimize

# Optimization actions:
# ├── Remove expired entries
# ├── Compress old data
# ├── Reorganize file structure
# ├── Update access timestamps
# └── Defragment cache database
```

**📋 Cache Information:**
```bash
# Show cache configuration
pi cache info

# Configuration details:
# ├── Cache Directory: ~/.package-installer-cli/
# ├── Max Size: 500MB
# ├── Auto-cleanup: Enabled
# ├── Compression: Enabled
# └── Encryption: Disabled
```

**Cache Types & Expiry:**

| Cache Type | Expiry | Purpose | Size Impact |
|------------|--------|---------|-------------|
| **Project Analysis** | 2 hours | Faster repeat analysis | High |
| **Package Versions** | 1 hour | Version checking | Medium |
| **Template Files** | 7 days | Template installation | High |
| **System Environment** | 24 hours | Environment detection | Low |
| **Usage Statistics** | Permanent | Analytics & insights | Low |

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--size` | Show size information | `--size` |
| `--performance` | Show performance metrics | `--performance` |
| `--confirm` | Skip confirmation prompts | `--confirm` |
| `--verbose` | Detailed operation output | `--verbose` |

**Cache Benefits:**
- ⚡ **5-10x faster** project creation with cached templates
- ⚡ **2-3x faster** project analysis with metadata cache
- ⚡ **60% faster** package updates with version cache
- ⚡ **Instant** recommendations with usage pattern cache

---

### `email` Command

Contact the developer with feedback, bug reports, feature requests, and questions through an integrated email system.

**Syntax:**
```bash
pi email [category] [options]
```

**Interactive Feedback:**
```bash
# Interactive category selection
pi email

# Email Categories:
# 🐛 Bug Report - Report bugs with detailed reproduction steps
# 💡 Feature Request - Suggest new features with use cases
# 📋 Template Request - Request new project templates
# ❓ General Question - Ask questions about CLI usage
# 🚀 Improvement Suggestion - Suggest improvements to existing features
# 📖 Documentation Issue - Report documentation problems
```

**Direct Category Access:**
```bash
# Direct feedback categories
pi email bug           # Report a bug with detailed form
pi email feature       # Submit feature request
pi email template      # Request new project template
pi email question      # Ask general questions
pi email improvement   # Suggest improvements
pi email docs          # Report documentation issues

# Quick feedback mode (minimal prompts)
pi email bug --quick
pi email feature --quick
```

**System Management:**
```bash
# Check email system status
pi email --status
# Shows: Email MCP Server availability, configuration status, version info

# Test email functionality
pi email --test
# Sends actual test email to verify setup

# Show setup instructions
pi email --setup
# Configuration guide for Email MCP Server

# Show installation instructions
pi email --install
# Step-by-step Email MCP Server installation

# Show all email commands
pi email --commands
# Complete Email MCP Server command reference

# Development troubleshooting
pi email --dev
# Local development setup and troubleshooting guide
```

**Email Categories & Templates:**

**🐛 Bug Report:**
- Bug title and detailed description
- Steps to reproduce the issue
- Expected vs actual behavior
- System information (automatically included)
- Additional context and screenshots

**💡 Feature Request:**
- Feature title and description
- Use case and business justification
- Proposed implementation approach
- Priority level (Low/Medium/High/Critical)
- Additional requirements and context

**📋 Template Request:**
- Template name and framework/technology
- Required features and libraries
- Similar existing templates
- Priority level and specific requirements
- Implementation suggestions

**❓ General Question:**
- Question summary and details
- What you've tried so far
- Expected outcome or solution
- Project context if relevant

**🚀 Improvement Suggestion:**
- Current behavior description
- Suggested improvement details
- Benefits and use cases
- Implementation ideas
- Priority assessment

**📖 Documentation Issue:**
- Documentation section affected
- Issue description and problems
- Suggested improvements
- Additional context

**Email System Integration:**

**📧 Email MCP Server Integration:**
- Uses `@0xshariq/email-mcp-server` npm package
- Multiple installation methods (global, npx, local)
- Professional HTML email formatting with CSS styling
- System information auto-collection
- Interactive email configuration setup
- Multiple email provider support

**🔧 Installation & Configuration:**
```bash
# Step 1: Install Email MCP Server
npm install -g @0xshariq/email-mcp-server

# Step 2: Interactive email configuration
pi email --setup

# Interactive setup will guide you through:
# 1. Select email provider (Gmail, Outlook, Yahoo, Custom SMTP)
# 2. Enter your email address
# 3. Setup app password (for Gmail) or email password
# 4. Automatic SMTP configuration
# 5. Secure credential storage

# Step 3: Test the configuration
pi email --test

# Check installation status anytime
pi email --status
```

**Email Provider Setup:**

**📧 Gmail Configuration:**
```bash
# Gmail requires App Passwords (not regular password)
# 1. Enable 2-Factor Authentication
# 2. Google Account Settings > Security > App passwords
# 3. Generate app password for "Mail"
# 4. Use the 16-character app password in setup
```

**🔷 Outlook/Hotmail Configuration:**
```bash
# Outlook.com/Hotmail support
# 1. Use your regular email and password
# 2. May require app password if 2FA enabled
# 3. Automatic SMTP configuration (smtp.live.com:587)
```

**🟡 Yahoo Mail Configuration:**
```bash
# Yahoo Mail support
# 1. Enable "Less secure app access" or use app password
# 2. Use your Yahoo email and password/app password
# 3. Automatic SMTP configuration (smtp.mail.yahoo.com:587)
```

**⚙️ Custom SMTP Configuration:**
```bash
# For custom email providers
# 1. Enter your SMTP host (e.g., mail.your-domain.com)
# 2. Specify SMTP port (usually 587 or 465)
# 3. Enter your email credentials
# 4. Test connection automatically
```

**Email Sender Options:**

When sending feedback emails, you can choose:

**📧 Use Configured Email (.env):**
- Uses your pre-configured email credentials
- Faster sending (no credential entry needed)
- Secure storage of credentials
- Recommended for regular use

**✉️ Use Custom Email:**
- Enter different email credentials for one-time use
- Useful for testing or temporary access
- Doesn't save credentials permanently
- Good for shared computers or different accounts

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--help` | Show comprehensive help | `pi email --help` |
| `--list` | List all available categories | `pi email --list` |
| `--status` | Check Email MCP Server status and configuration | `pi email --status` |
| `--test` | Send test email to verify functionality | `pi email --test` |
| `--setup` | Interactive email configuration setup | `pi email --setup` |
| `--install` | Show Email MCP Server installation guide | `pi email --install` |
| `--commands` | Show all Email MCP Server commands | `pi email --commands` |
| `--dev` | Development troubleshooting and local setup | `pi email --dev` |
| `--quick` | Quick feedback mode (minimal prompts) | `pi email bug --quick` |

**System Status Information:**
```bash
pi email --status

# Email System Status:
# ✅ Email MCP Server: Ready (v1.6.0)
# ℹ️ Type: npx
# ℹ️ Path: npx @0xshariq/email-mcp-server
# ℹ️ Configuration: ✅ Configured
# ℹ️ Target Email: khanshariq92213@gmail.com
# ℹ️ Package: @0xshariq/email-mcp-server
#
# Available Commands:
# • esend - Send basic email (up to 3 recipients)
# • eattach - Send email with attachments
# • ebulk - Send bulk emails to many recipients
# • eread - Read recent emails
# • esearch - Search emails with filters
#
# 🎉 Ready to send emails! Use: pi email <category>
```

**Development Mode:**
```bash
pi email --dev

# Development Setup Options:
# 1. Use Global Install (Recommended for testing):
#    npm install -g @0xshariq/email-mcp-server
#
# 2. Configure Local Development:
#    cd ~/path/to/email-mcp-server
#    npm install  # Install dependencies
#    cp .env.example .env  # Create .env file
#
# 3. One-time Usage (No setup needed):
#    npx @0xshariq/email-mcp-server esend "email" "subject" "body"
```

**Email Features:**
- ✅ **Professional HTML Templates** - Beautiful category-specific email formatting with CSS
- ✅ **Interactive Configuration** - Step-by-step email setup with provider selection
- ✅ **Multiple Email Providers** - Gmail, Outlook, Yahoo, and custom SMTP support
- ✅ **Sender Selection** - Choose between configured email or custom credentials
- ✅ **System Information** - Auto-includes OS, Node.js, CLI version details
- ✅ **Contact Management** - Optional user contact information for follow-up
- ✅ **Multi-Installation Support** - Works with global, npx, or local setup
- ✅ **Configuration Detection** - Smart setup status checking and validation
- ✅ **Secure Storage** - Encrypted credential storage in .env files
- ✅ **Fallback Options** - Alternative contact methods if email setup fails
- ✅ **Development Support** - Special modes for local development and testing

**Email Configuration Workflow:**

```bash
# Step 1: Check current status
pi email --status
# → Shows if Email MCP Server is installed and configured

# Step 2: Install Email MCP Server (if needed)
npm install -g @0xshariq/email-mcp-server

# Step 3: Configure your email credentials
pi email --setup
# → Interactive setup process:
#   1. Select Provider: Gmail / Outlook / Yahoo / Custom
#   2. Enter Email: your-email@example.com
#   3. Enter Password: (app password for Gmail)
#   4. Auto SMTP Configuration
#   5. Secure .env File Creation

# Step 4: Test the configuration
pi email --test
# → Sends formatted test email to verify everything works

# Step 5: Send feedback
pi email bug
# → Choose sender email source:
#   • Use configured email (from .env)
#   • Enter custom email credentials
```

**Email Flow Process:**
```
1. User runs: pi email bug
2. System checks Email MCP Server availability
3. If not configured → automatic setup prompt
4. User selects email sender option:
   ├── Use configured email (.env file)
   └── Use custom email (temporary credentials)
5. Category-specific form collection
6. Professional HTML email generation
7. Email sent via Email MCP Server
8. Success confirmation with beautiful formatting
```

**Contact Information:**
- **Primary**: khanshariq92213@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/0xshariq/package-installer-cli/issues)
- **Documentation**: [Project Wiki](https://github.com/0xshariq/package-installer-cli/wiki)

**Quick Examples:**
```bash
# Initial email setup (first-time use)
pi email --setup
# → Interactive configuration with provider selection

# Report a critical bug
pi email bug
# → Detailed bug report form with system info and sender selection

# Quick feature suggestion
pi email feature --quick
# → Minimal prompts for fast feedback

# Check email system status
pi email --status
# → Shows Email MCP Server status and configuration

# Test email functionality
pi email --test
# → Sends formatted test email to verify setup

# Get complete installation guide
pi email --install
# → Step-by-step Email MCP Server installation

# Troubleshoot configuration issues
pi email --dev
# → Complete troubleshooting and development guide
```

---

### `upgrade-cli` Command

Intelligent CLI upgrade system with breaking change detection and automatic migration.

**Syntax:**
```bash
pi upgrade-cli [options]
```

**Smart Upgrade Process:**
```bash
# Upgrade to latest version
pi upgrade-cli

# Upgrade Process:
# 🔍 Checking for updates...
# ├── Current Version: 2.0.5
# ├── Latest Version: 2.1.0
# ├── Release Type: Minor Update
# └── Breaking Changes: None detected
#
# 📋 What's New in v2.1.0:
# ├── ✨ Enhanced analytics dashboard
# ├── 🚀 Faster template loading (3x speed)
# ├── 🔧 Improved error handling
# ├── 📦 New React Native templates
# └── 🐛 15 bug fixes
#
# 🔄 Upgrading Package Installer CLI...
# ├── Downloading v2.1.0... ✓
# ├── Installing dependencies... ✓
# ├── Migrating configuration... ✓
# ├── Updating cache format... ✓
# └── Verifying installation... ✓
#
# ✅ Successfully upgraded to v2.1.0!
```

**Breaking Change Detection:**
```bash
# Check for breaking changes
pi upgrade-cli --check

# Breaking Change Analysis:
# ⚠️  Breaking Changes Detected in v3.2.0:
# ├── 🔧 Configuration format changed
# ├── 📂 Cache directory structure updated
# ├── 🚫 Deprecated commands removed
# └── 📦 New Node.js requirement: v18+
#
# 🛠️ Migration Required:
# ├── Backup current configuration
# ├── Update Node.js to v18+
# ├── Migrate cache files
# └── Update project scripts
```

**Version Management:**
```bash
# Show version information
pi upgrade-cli --info

# Version Information:
# 📦 Package Installer CLI
# ├── Current: 2.1.0
# ├── Latest Stable: 2.1.0
# ├── Latest Beta: 2.2.0-beta.1
# ├── Next Major: 3.2.0-alpha.1
# └── Release Schedule: Monthly
```

**Upgrade Features:**

**🔄 Intelligent Updates:**
- Automatic version checking
- Release note integration
- Breaking change detection
- Compatibility verification
- Rollback support

**📦 Package Manager Integration:**
- Works with npm, yarn, pnpm
- Global installation management
- Permission handling
- Dependency conflict resolution

**🔧 Configuration Migration:**
- Automatic config updates
- Cache format migration
- User preference preservation
- Backward compatibility

**📊 Update Analytics:**
- Update success tracking
- Performance impact measurement
- Feature usage analysis
- Error reporting

**Available Options:**
| Option | Description | Example |
|--------|-------------|---------|
| `--check` | Check for updates only | `--check` |
| `--beta` | Include beta versions | `--beta` |
| `--force` | Force upgrade without checks | `--force` |
| `--rollback` | Rollback to previous version | `--rollback` |
| `--info` | Show version information | `--info` |

**Rollback Support:**
```bash
# Rollback to previous version
pi upgrade-cli --rollback

# Rollback options:
# ├── v2.0.5 (Previous stable)
# ├── v2.0.4 (Last known good)
# └── v1.9.8 (Legacy version)
```

---

### `deploy` Command

**Status:** 🚧 Coming Soon

Automated deployment to various cloud platforms with intelligent configuration.

**Planned Features:**
- **Cloud Platforms:** Vercel, Netlify, AWS, Google Cloud
- **Container Deployment:** Docker, Kubernetes
- **CI/CD Integration:** GitHub Actions, GitLab CI
- **Environment Management:** Staging, production environments
- **Database Deployment:** Automated database setup
- **Domain Configuration:** Custom domain setup and SSL

**Future Syntax:**
```bash
# Deploy to cloud platforms
pi deploy vercel
pi deploy netlify --domain=myapp.com
pi deploy aws --region=us-east-1

# Container deployment
pi deploy docker --registry=dockerhub
pi deploy kubernetes --cluster=production
```

## 🔧 Advanced Features

### Environment Variable Management

**Automatic Environment Setup:**
- Detects `.env.example` files
- Creates `.env` with prompts for required values
- Validates environment variable formats
- Suggests secure default values

**Environment Validation:**
```bash
# Validate environment configuration
pi env --validate

# Validation checks:
# ├── Required variables present
# ├── Format validation (URLs, emails, etc.)
# ├── Security best practices
# └── Platform-specific requirements
```

### User Preference Caching

**Smart Defaults:**
- Remembers framework preferences
- Caches package manager choices
- Stores naming conventions
- Tracks feature usage patterns

**Preference Management:**
```bash
# View cached preferences
pi cache info --preferences

# Reset user preferences
pi cache clear preferences
```

### Cross-Platform Compatibility

**Operating System Support:**
- Windows (PowerShell, CMD)
- macOS (zsh, bash)
- Linux (bash, zsh, fish)

**Package Manager Detection:**
- Automatic detection based on lock files
- Fallback to user preferences
- Cross-platform command translation

### Performance Optimization

**Caching Strategy:**
- Template file caching (7-day expiry)
- Package version caching (1-hour expiry)
- Project analysis caching (2-hour expiry)
- System environment caching (24-hour expiry)

**Parallel Processing:**
- Concurrent dependency analysis
- Parallel template downloads
- Simultaneous package updates
- Background cache optimization

## 🛠️ Configuration

### Global Configuration

**Configuration File:** `~/.package-installer-cli/config.json`

```json
{
  "preferences": {
    "packageManager": "pnpm",
    "language": "typescript",
    "framework": "react",
    "styling": "tailwindcss"
  },
  "cache": {
    "enabled": true,
    "maxSize": "500MB",
    "autoCleanup": true
  },
  "analytics": {
    "enabled": true,
    "anonymous": true
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PKG_CLI_CACHE_DIR` | Custom cache directory | `~/.package-installer-cli/` |
| `PKG_CLI_CONFIG_DIR` | Configuration directory | `~/.package-installer-cli/` |
| `PKG_CLI_DISABLE_CACHE` | Disable all caching | `false` |
| `PKG_CLI_SILENT` | Suppress output | `false` |

## 🚨 Troubleshooting

### Common Issues & Solutions

**Template Creation Fails:**
```bash
# Check permissions and available space
ls -la /path/to/project/directory
df -h

# Try alternative directory
pi create ~/Desktop/my-project

# Clear cache and retry
pi cache clear templates
pi create my-project
```

**Package Installation Errors:**
```bash
# Verify package manager installation
npm --version && yarn --version && pnpm --version

# Clear package manager cache
npm cache clean --force
yarn cache clean
pnpm store prune

# Try with different package manager
pi create my-project --package-manager=npm
```

**Analysis Command Issues:**
```bash
# Ensure you're in a valid project directory
pwd && ls -la

# Check file permissions
ls -la package.json

# Run with verbose output
pi analyze --verbose

# Clear analysis cache
pi cache clear analysis
```

**CLI Upgrade Problems:**
```bash
# Check current installation
which pi
pi --version

# Reinstall CLI
npm uninstall -g @0xshariq/package-installer
npm install -g @0xshariq/package-installer

# Clear global cache
pi cache clear all
```

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
# Enable verbose output
pi create my-project --verbose

# Enable debug mode
DEBUG=pi:* pi create my-project

# Export debug information
pi doctor --export=debug.json
```

### Getting Help

**Built-in Help:**
- Use `--help` with any command for detailed usage
- Use `pi doctor` for comprehensive diagnostics
- Use `pi env` for environment analysis

**Community Support:**
- 📚 [Documentation](https://github.com/0xshariq/package-installer-cli/wiki)
- 🐛 [Bug Reports](https://github.com/0xshariq/package-installer-cli/issues)
- 💬 [Discussions](https://github.com/0xshariq/package-installer-cli/discussions)
- 🚀 [Feature Requests](https://github.com/0xshariq/package-installer-cli/issues/new?template=feature_request.md)

## 📈 Performance Benefits

### Caching Improvements

| Operation | Improvement | Notes |
|-----------|-------------|-------|
| Project Creation | 2-3x faster | Template caching |
| Project Analysis | 2x faster | Metadata caching |
| Package Updates | 1.5x faster | Version caching |
| Environment Check | 3x faster | System info caching |

### Resource Usage

- **Memory**: 50-150MB typical usage
- **Disk Space**: 100-300MB (includes cache)
- **Network**: Minimal after initial setup
- **Performance**: Optimized for development workflows

---

**Related Documentation:**
- 📋 [Features Documentation](features.md) - Comprehensive feature overview
- 🎨 [Templates Documentation](templates.md) - Template guides and customization
- 🚀 [Deployment Documentation](deploy.md) - Deployment strategies and platforms

**Repository:** [Package Installer CLI on GitHub](https://github.com/0xshariq/package-installer-cli)

---

## 🚀 **Next-Generation Commands** (Coming Soon)

### `benchmark` Command

**Performance Analysis & Optimization**

Analyze your project's performance metrics and get optimization recommendations.

**Syntax:**
```bash
pi benchmark [options]
```

**Features:**
- 📊 **Build Performance**: Measure build times, bundle sizes, and compilation speed
- 🔍 **Bundle Analysis**: Detailed breakdown of bundle composition and size
- ⚡ **Runtime Metrics**: Memory usage, startup time, and runtime performance
- 🏆 **Comparisons**: Compare against industry standards and similar projects
- 📈 **Historical Tracking**: Track performance improvements over time
- 🎯 **Optimization Tips**: AI-powered suggestions for performance improvements

**Examples:**
```bash
# Basic performance analysis
pi benchmark

# Compare with similar projects
pi benchmark --compare

# Generate detailed report
pi benchmark --report --export json

# Continuous benchmarking
pi benchmark --watch --threshold 10%
```

---

### `security` Command

**Security Scanning & Vulnerability Management**

Comprehensive security analysis with automated fixing capabilities.

**Syntax:**
```bash
pi security [options]
```

**Features:**
- 🔐 **Vulnerability Scanning**: Deep dependency and code security analysis
- 🛡️ **Auto-Fix**: Automatically fix common security issues
- 📋 **Compliance Checks**: OWASP, GDPR, and industry standard compliance
- 🚨 **Real-time Monitoring**: Continuous security monitoring
- 📊 **Security Reports**: Detailed security posture reports
- 🎯 **Risk Assessment**: Priority-based vulnerability management

**Examples:**
```bash
# Full security audit
pi security

# Auto-fix security issues
pi security --fix

# Generate security report
pi security --report --compliance gdpr
```

---

### `migrate` Command

**Framework Migration Wizard**

Intelligent framework and library migration with automated code transformation.

**Syntax:**
```bash
pi migrate [options]
```

**Features:**
- 🔄 **Framework Migrations**: React→Next.js, Vue→Nuxt, Express→Fastify, etc.
- 🤖 **Code Transformation**: Automated AST-based code updates
- 📦 **Dependency Migration**: Smart dependency mapping and updates
- ⚙️ **Config Conversion**: Automatic configuration file transformation

**Examples:**
```bash
# Interactive migration wizard
pi migrate

# Specific framework migration
pi migrate --from react --to nextjs

# Preview changes without applying
pi migrate --dry-run --from vue --to nuxt
```

---

### `ai` Command

**AI-Powered Development Assistant**

Advanced AI integration for code analysis, generation, and optimization.

**Syntax:**
```bash
pi ai [prompt] [options]
```

**Features:**
- 🤖 **Code Review**: AI-powered code analysis and suggestions
- 🧪 **Test Generation**: Automatic test case generation
- 🔧 **Code Refactoring**: Intelligent code improvement suggestions
- 📝 **Documentation**: Auto-generate documentation from code

**Examples:**
```bash
# AI code review
pi ai "review this component for best practices"

# Generate tests
pi ai --generate tests --file src/utils.js

# Refactor code
pi ai --refactor --pattern "convert to functional components"
```

---

### `docs` Command

**Automatic Documentation Generator**

Generate beautiful, comprehensive documentation from your codebase.

**Syntax:**
```bash
pi docs [options]
```

**Features:**
- 📚 **README Generation**: Smart README creation from project structure
- 🔗 **API Documentation**: Extract and format API documentation
- 📖 **Interactive Docs**: Generate browsable documentation sites
- 🎨 **Custom Themes**: Beautiful documentation themes

**Examples:**
```bash
# Generate complete documentation
pi docs

# Generate only API docs
pi docs --api --output ./api-docs

# Interactive documentation site
pi docs --interactive --serve --port 3000
```

---

### `compare` Command

**Project & Dependency Comparison Tool**

Compare projects, dependencies, configurations, and performance metrics.

**Syntax:**
```bash
pi compare <project1> <project2> [options]
```

**Features:**
- 📊 **Dependency Analysis**: Compare package.json differences
- ⚙️ **Configuration Diff**: Side-by-side config comparison
- 📈 **Performance Metrics**: Compare build times, bundle sizes
- 🔍 **Code Quality**: Compare code quality metrics

**Examples:**
```bash
# Compare two projects
pi compare ./project-a ./project-b

# Focus on dependencies only
pi compare . ../other-project --deps-only
```

---

### `explain` Command

**Code & Project Intelligence**

Intelligent explanation of code structure, complexity, and architectural decisions.

**Syntax:**
```bash
pi explain [file/directory] [options]
```

**Features:**
- 🧠 **Code Analysis**: Explain code functionality and purpose
- 📊 **Complexity Metrics**: Detailed complexity analysis
- 🏗️ **Architecture Overview**: Project structure explanation
- 📚 **Dependency Insights**: Explain why dependencies are needed

**Examples:**
```bash
# Explain entire project
pi explain

# Explain specific file
pi explain src/components/UserProfile.tsx

# Beginner-friendly explanations
pi explain --level beginner --verbose
```
