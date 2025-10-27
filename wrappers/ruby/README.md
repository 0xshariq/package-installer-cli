# � Package Installer CLI - Ruby Gem

[![Gem Version](https://badge.fury.io/rb/package-installer-cli.svg)](https://badge.fury.io/rb/package-installer-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Ruby](https://img.shields.io/badge/ruby-%3E%3D2.6.0-red.svg)](https://www.ruby-lang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A **Ruby wrapper** around the Package Installer CLI - a cross-platform, interactive CLI to scaffold modern web application templates with support for multiple frameworks, languages, and development tools. Create production-ready projects in seconds!

## 📋 Prerequisites

- **Ruby** >= 2.6.0
- **Node.js** >= 18.0.0 (required for the underlying CLI)

## 🚀 Quick Features

- **🎨 Multiple Frameworks**: React, Next.js, Express, Angular, Vue, Rust
- **🔤 Language Support**: TypeScript & JavaScript variants
- **🎭 UI Libraries**: Tailwind CSS, Material-UI, shadcn/ui
- **📦 Smart Package Management**: Auto-detects npm, yarn, pnpm
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

## 📥 Installation

### 🎯 Automatic Installation (Recommended)

The gem automatically installs Node.js dependencies during installation:

```bash
gem install package-installer-cli
```

**What happens during installation:**
1. 💎 Ruby gem is installed via RubyGems
2. 🔍 System checks for Node.js availability
3. 📦 Automatically runs `npm install` (or `pnpm`/`yarn` if available)
4. ✅ CLI is ready to use immediately

### 📋 Prerequisites Verification

Before installing, ensure you have:

```bash
# Check Ruby version (>= 2.6.0 required)
ruby --version

# Check Node.js version (>= 18.0.0 required)
node --version

# Check npm availability
npm --version
```

### 🔧 Manual Installation Steps

If automatic dependency installation fails, follow these steps based on your installation type:

#### 🌍 Global Installation

**Step 1: Install the Ruby Gem Globally**
```bash
gem install package-installer-cli
```

**Step 2: Locate and Install Dependencies**
```bash
# Method 1: Using gem environment (recommended)
cd $(gem environment gemdir)/gems/package-installer-cli-*/
npm install --production

# Method 2: Using gem which command
GEM_DIR=$(gem which package_installer_cli | xargs dirname | xargs dirname)
cd "$GEM_DIR" && npm install --production

# Method 3: Manual search
find $(gem environment gemdir) -name "package-installer-cli-*" -type d
cd /found/path && npm install --production
```

#### 🏠 Local Installation (via Bundler)

**Step 1: Add to Gemfile**
```ruby
# Gemfile
gem 'package-installer-cli'
```

**Step 2: Install with Bundle**
```bash
bundle install
```

**Step 3: Install Node.js Dependencies**
```bash
# Method 1: Using bundle info (recommended)
GEM_DIR=$(bundle info package-installer-cli --path)
cd "$GEM_DIR" && npm install --production

# Method 2: Direct path
cd vendor/bundle/ruby/*/gems/package-installer-cli-*/
npm install --production
```

**Step 4: Use with Bundle Exec**
```bash
bundle exec pi create
bundle exec pi --version
```

#### 👤 User Installation (--user-install)

**Step 1: Install to User Directory**
```bash
gem install --user-install package-installer-cli
```

**Step 2: Install Dependencies**
```bash
# Find user gem directory
USER_GEM_DIR=$(gem environment | grep "USER INSTALLATION DIRECTORY" | cut -d: -f2 | tr -d ' ')
cd "$USER_GEM_DIR"/gems/package-installer-cli-*/
npm install --production

# Alternative method
cd ~/.gem/ruby/*/gems/package-installer-cli-*/
npm install --production
```

#### ✅ Verification Steps (All Installation Types)

```bash
# Test CLI availability
pi --version
pi --help

# Run diagnostics
pi doctor

# Check Node.js dependencies
cd $(dirname $(gem which package_installer_cli))/../..
ls -la node_modules/ | head -5
```

### 📦 Via Bundler

Add this line to your application's Gemfile:

```ruby
gem 'package-installer-cli'
```

And then execute:

```bash
bundle install
```

### 🐳 Installation Troubleshooting

#### Common Issues & Solutions

**❌ "Node.js not found" Error**
```bash
# Install Node.js from official website
# Visit: https://nodejs.org/
# Or use a version manager:

# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts

# Using fnm
curl -fsSL https://fnm.vercel.app/install | bash
fnm install --lts
fnm use lts-latest
```

**❌ "Permission denied" during npm install**
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Or use npx to install without global permissions
npx package-installer-cli create
```

**❌ "Gem installation failed"**
```bash
# Update RubyGems
gem update --system

# Clean gem cache
gem cleanup

# Try installing with verbose output
gem install package-installer-cli --verbose
```

**❌ Dependencies installation timeout**
```bash
# Set longer npm timeout
npm config set timeout 300000

# Or install manually in gem directory
cd $(dirname $(gem which package_installer_cli))/../..
npm install --production --timeout=300000
```

### 🤖 Automated Installation Script

For easier dependency installation, use the included automated script:

```bash
# After installing the gem, run the auto-install script
gem install package-installer-cli

# Find and run the installation script
SCRIPT_PATH=$(dirname $(gem which package_installer_cli))/../install_dependencies.sh
bash "$SCRIPT_PATH"

# Or download and run directly
curl -fsSL https://raw.githubusercontent.com/0xshariq/ruby_package_installer_cli/main/install_dependencies.sh | bash
```

**The script automatically:**
- 🔍 Detects your installation type (global/local/user/bundler)
- 📋 Checks Node.js and npm availability  
- 📦 Chooses the right package manager (npm/yarn/pnpm)
- ✅ Installs dependencies in the correct location
- 🧪 Verifies the installation

### 🔄 Skip Automatic Installation

If you want to handle Node.js dependencies manually:

```bash
# Skip automatic npm install during gem installation
PACKAGE_INSTALLER_CLI_SKIP_NPM=1 gem install package-installer-cli

# Then install dependencies manually later (choose based on your installation)
# Global installation:
cd $(gem environment gemdir)/gems/package-installer-cli-*/
npm install --production

# Local/Bundler installation:
GEM_DIR=$(bundle info package-installer-cli --path)
cd "$GEM_DIR" && npm install --production

# User installation:
cd ~/.gem/ruby/*/gems/package-installer-cli-*/
npm install --production

# OR use the automated script
SCRIPT_PATH=$(dirname $(gem which package_installer_cli))/../install_dependencies.sh
bash "$SCRIPT_PATH"
```

### 🌐 Environment-Specific Configuration

#### Docker/Container Environments
```dockerfile
# Dockerfile example
RUN gem install package-installer-cli
RUN cd $(gem environment gemdir)/gems/package-installer-cli-*/ && npm install --production --no-optional
```

#### CI/CD Environments
```yaml
# GitHub Actions example
- name: Install Package Installer CLI
  run: |
    gem install package-installer-cli
    cd $(gem environment gemdir)/gems/package-installer-cli-*/
    npm ci --production
```

#### Different Ruby Managers
```bash
# rbenv users
rbenv rehash
gem install package-installer-cli

# rvm users  
rvm use ruby-3.0.0
gem install package-installer-cli

# asdf users
asdf reshim ruby
gem install package-installer-cli
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

*For complete command documentation, see [commands](https://github.com/0xshariq/package-installer-cli/tree/main/docs/commands.md)*

## 🏗️ Supported Project Types

| Language/Framework | Templates | Package Managers |
|-------------------|-----------|------------------|
| **JavaScript/TypeScript** | React, Next.js, Express, Angular, Vue | npm, yarn, pnpm |
| **Python** | Django, Flask, FastAPI | pip, poetry |
| **Rust** | Basic, Advanced, Web | cargo |
| **Go** | CLI, Web, API | go mod |
| **Ruby** | Rails, Sinatra | bundler |
| **PHP** | Laravel, Symfony | composer |

*For detailed template information, see [templates](https://github.com/0xshariq/package-installer-cli/tree/main/docs/templates.md)*

## 🎯 System Requirements

- **Ruby**: >= 2.6.0 (for the gem wrapper)
- **Node.js**: >= 18.0.0 (required for the underlying CLI)
- **Operating Systems**: Windows, macOS, Linux
- **Package Managers**: npm, yarn, or pnpm (for Node.js projects)
- **Git**: Required for project initialization

## 🐛 Troubleshooting

### 🚀 Quick Diagnostics

```bash
# Run built-in diagnostics
pi doctor

# Check installation status
pi --version
node --version
ruby --version

# Verify gem installation
gem list package-installer-cli
gem which package_installer_cli
```

### 🔧 Common Issues & Solutions

#### **Issue: "Command 'pi' not found"**

**Solution 1: Check gem binaries**
```bash
# Verify gem is installed
gem list package-installer-cli

# Check if gem bin directory is in PATH
echo $PATH | grep -o "$(gem environment | grep 'EXECUTABLE DIRECTORY' | cut -d: -f2 | tr -d ' ')"

# Add gem bin directory to PATH if missing
echo 'export PATH="$(gem environment | grep "EXECUTABLE DIRECTORY" | cut -d: -f2 | tr -d " "):$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Solution 2: Use full path**
```bash
# Find gem executable location
find $(gem environment gemdir) -name "pi" -type f

# Use full path to run
/path/to/gems/bin/pi --help
```

#### **Issue: "Node.js dependencies missing"**

**Solution: Installation-specific dependency installation**

**For Global Installation:**
```bash
# Method 1: Using gem environment
cd $(gem environment gemdir)/gems/package-installer-cli-*/
npm install --production

# Method 2: Using gem which
GEM_DIR=$(gem which package_installer_cli | xargs dirname | xargs dirname)
cd "$GEM_DIR" && npm install --production
```

**For Local/Bundler Installation:**
```bash
# Using bundle info
GEM_DIR=$(bundle info package-installer-cli --path 2>/dev/null)
if [ -n "$GEM_DIR" ]; then
  cd "$GEM_DIR" && npm install --production
else
  echo "Run 'bundle install' first"
fi
```

**For User Installation:**
```bash
# Navigate to user gem directory
cd ~/.gem/ruby/*/gems/package-installer-cli-*/
npm install --production

# Or use user installation directory
USER_DIR=$(gem environment | grep "USER INSTALLATION DIRECTORY" | cut -d: -f2 | tr -d ' ')
cd "$USER_DIR"/gems/package-installer-cli-*/
npm install --production
```

**Verification:**
```bash
# Check if dependencies are installed
ls $(dirname $(gem which package_installer_cli))/../node_modules/ | head -5
```

#### **Issue: "Permission denied" errors**

**Solution 1: Fix npm permissions**
```bash
# Create npm directory in home folder
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Reinstall gem
gem uninstall package-installer-cli
gem install package-installer-cli
```

**Solution 2: Use sudo (not recommended)**
```bash
sudo gem install package-installer-cli
```

#### **Issue: "Network timeout during installation"**

**Solution: Configure timeouts and retry**
```bash
# Increase npm timeout
npm config set timeout 300000
npm config set registry https://registry.npmjs.org/

# Retry installation
gem uninstall package-installer-cli
gem install package-installer-cli

# Manual fallback
cd $(dirname $(gem which package_installer_cli))/../..
npm install --production --timeout=300000
```

#### **Issue: CLI commands not working properly**

**Solution: Reset and reinstall**
```bash
# Complete reset
gem uninstall package-installer-cli
gem cleanup

# Clear npm cache
npm cache clean --force

# Reinstall with verbose output
gem install package-installer-cli --verbose

# Verify with diagnostics
pi doctor
```

### 🆘 Getting Help

If you're still having issues:

1. **Check System Requirements**:
   - Ruby >= 2.6.0: `ruby --version`
   - Node.js >= 18.0.0: `node --version`
   - npm/yarn/pnpm: `npm --version`

2. **Run Diagnostics**:
   ```bash
   pi doctor --verbose
   ```

3. **Manual Verification**:
   ```bash
   # Check gem files
   ls -la $(dirname $(gem which package_installer_cli))

   # Check Node.js dependencies
   cd $(dirname $(gem which package_installer_cli))/../..
   ls -la node_modules/ | head -10
   ```

4. **Create Issue**: [GitHub Issues](https://github.com/0xshariq/ruby_package_installer_cli/issues)
   - Include output of `pi doctor`
   - Include your OS, Ruby, and Node.js versions
   - Include full error messages

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/0xshariq/package-installer-cli/tree/main/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/0xshariq/package-installer-cli/tree/main/LICENSE) file for details.

## 🔗 Links

- **Ruby Gem**: [package-installer-cli](https://rubygems.org/gems/package-installer-cli)
- **GitHub Repository**: [ruby_package_installer_cli](https://github.com/0xshariq/ruby_package_installer_cli)
- **Original CLI Repository**: [package-installer-cli](https://github.com/0xshariq/package-installer-cli)
- **Issues & Feedback**: [GitHub Issues](https://github.com/0xshariq/ruby_package_installer_cli/issues)

---

💎 **Note**: This Ruby gem is a wrapper around the Node.js implementation. The actual CLI logic is executed via Node.js, so Node.js must be installed on your system.

**Happy coding! 🚀** Create something amazing with Package Installer CLI.
