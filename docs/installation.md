# 📦 Installation Guide - Package Installer CLI

Complete installation guide for **Package Installer CLI** across multiple package managers and platforms.

## 🚀 Quick Installation

### Node.js / npm

[![npm version](https://img.shields.io/npm/v/@0xshariq/package-installer.svg)](https://www.npmjs.com/package/@0xshariq/package-installer)

```bash
# Using npm (recommended)
npm install -g @0xshariq/package-installer

# Using yarn
yarn global add @0xshariq/package-installer

# Using pnpm
pnpm add -g @0xshariq/package-installer

# Run without installing (npx)
npx @0xshariq/package-installer create my-app
```

**Official Package**: [npmjs.com/package/@0xshariq/package-installer](https://www.npmjs.com/package/@0xshariq/package-installer)

---

## 🐍 Python Installation

[![PyPI version](https://img.shields.io/pypi/v/package-installer-cli.svg)](https://pypi.org/project/package-installer-cli/)

```bash
# Using pip
pip install package-installer-cli

# Using pip3
pip3 install package-installer-cli

# Install for current user only
pip install --user package-installer-cli

# Upgrade to latest version
pip install --upgrade package-installer-cli
```

**Official Package**: [pypi.org/project/package-installer-cli](https://pypi.org/project/package-installer-cli/)

**Source Code**: [github.com/0xshariq/py_package_installer_cli](https://github.com/0xshariq/py_package_installer_cli)

---

## 🦀 Rust Installation

[![Crates.io version](https://img.shields.io/crates/v/package-installer-cli.svg)](https://crates.io/crates/package-installer-cli)

```bash
# Using cargo
cargo install package-installer-cli

# Install from git (latest)
cargo install --git https://github.com/0xshariq/rust_package_installer_cli

# Update to latest version
cargo install package-installer-cli --force
```

**Official Package**: [crates.io/crates/package-installer-cli](https://crates.io/crates/package-installer-cli)

**Source Code**: [github.com/0xshariq/rust_package_installer_cli](https://github.com/0xshariq/rust_package_installer_cli)

---

## 💎 Ruby Installation

[![Gem Version](https://img.shields.io/gem/v/package-installer-cli.svg)](https://rubygems.org/gems/package-installer-cli)

```bash
# Using gem
gem install package-installer-cli

# Install for current user
gem install --user-install package-installer-cli

# Update to latest version
gem update package-installer-cli
```

**Official Package**: [rubygems.org/gems/package-installer-cli](https://rubygems.org/gems/package-installer-cli)

**Source Code**: [github.com/0xshariq/ruby_package_installer_cli](https://github.com/0xshariq/ruby_package_installer_cli)

---

## 🐹 Go Installation

```bash
# Using go install
go install github.com/0xshariq/go_package_installer_cli@latest

# Clone and build from source
git clone https://github.com/0xshariq/go_package_installer_cli.git
cd go_package_installer_cli
go build -o pi
sudo mv pi /usr/local/bin/
```

**Source Code**: [github.com/0xshariq/go_package_installer_cli](https://github.com/0xshariq/go_package_installer_cli)

---

## 🍺 Homebrew Installation

### Install via Homebrew Tap

```bash
# Add the tap
brew tap 0xshariq/package-installer-cli

# Install package-installer-cli
brew install package-installer-cli

# Install with alias 'pi'
brew install package-installer-cli --with-alias=pi

# Update to latest version
brew upgrade package-installer-cli
```

### Alternative Installation Methods

```bash
# Install directly from formula URL
brew install https://raw.githubusercontent.com/0xshariq/homebrew-package-installer-cli/main/Formula/package-installer-cli.rb

# Install with custom alias
brew install package-installer-cli && ln -sf $(brew --prefix)/bin/package-installer-cli /usr/local/bin/pi
```

---

## 🐳 Docker Installation

[![Docker Hub](https://img.shields.io/docker/v/0xshariq/package-installer-cli?label=Docker%20Hub)](https://hub.docker.com/r/0xshariq/package-installer-cli)

### Pull and Run

```bash
# Pull latest image
docker pull 0xshariq/package-installer-cli:latest

# Run interactively
docker run -it --rm \
  -v "$(pwd)":/home/pi/projects \
  -v ~/.gitconfig:/home/pi/.gitconfig:ro \
  -v ~/.ssh:/home/pi/.ssh:ro \
  0xshariq/package-installer-cli:latest

# Create new project
docker run -it --rm \
  -v "$(pwd)":/home/pi/projects \
  0xshariq/package-installer-cli:latest create my-app
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  package-installer:
    image: 0xshariq/package-installer-cli:latest
    volumes:
      - .:/home/pi/projects
      - ~/.gitconfig:/home/pi/.gitconfig:ro
      - ~/.ssh:/home/pi/.ssh:ro
    stdin_open: true
    tty: true
```

```bash
# Run with docker-compose
docker-compose run --rm package-installer
```

**Docker Hub**: [hub.docker.com/r/0xshariq/package-installer-cli](https://hub.docker.com/r/0xshariq/package-installer-cli)

---

## 📋 Installation Verification

After installation, verify the CLI is working correctly:

```bash
# Check version
pi --version

# Check installation
pi doctor

# Run help command
pi --help

# Create test project
pi create test-project
```

---

## 🔧 Manual Installation

### From Source (Node.js)

```bash
# Clone repository
git clone https://github.com/0xshariq/package-installer-cli.git
cd package-installer-cli

# Install dependencies
npm install

# Build the CLI
npm run build

# Link globally
npm link

# Verify installation
pi --version
```

### Binary Releases

Download pre-compiled binaries from GitHub Releases:

```bash
# Linux/macOS
curl -L https://github.com/0xshariq/package-installer-cli/releases/latest/download/pi-linux -o pi
chmod +x pi
sudo mv pi /usr/local/bin/

# Windows
# Download pi-windows.exe from GitHub Releases
```

---

## 🚫 Uninstallation

### Remove from Different Package Managers

```bash
# npm
npm uninstall -g @0xshariq/package-installer

# pip
pip uninstall package-installer-cli

# cargo
cargo uninstall package-installer-cli

# gem
gem uninstall package-installer-cli

# homebrew
brew uninstall package-installer-cli
brew untap 0xshariq/package-installer-cli

# docker
docker rmi 0xshariq/package-installer-cli
```

### Clean Up Cache and Config

```bash
# Remove cache directory
rm -rf ~/.package-installer-cli

# Remove npm cache (if installed via npm)
npm cache clean --force
```

---

## 🛠️ Troubleshooting

### Common Issues

#### Permission Errors (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Use npx instead
npx @0xshariq/package-installer create my-app
```

#### Command Not Found
```bash
# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$PATH:$HOME/.local/bin"

# Reload shell
source ~/.bashrc
```

#### Package Manager Issues
```bash
# Clear package manager cache
npm cache clean --force
pip cache purge
cargo clean
gem cleanup
```

### Getting Help

- **Documentation**: [README.md](README.md)
- **GitHub Issues**: [github.com/0xshariq/package-installer-cli/issues](https://github.com/0xshariq/package-installer-cli/issues)
- **Discussions**: [github.com/0xshariq/package-installer-cli/discussions](https://github.com/0xshariq/package-installer-cli/discussions)

---

## 🔗 Official Links

| Package Manager | Official Package URL |
|-----------------|----------------------|
| **npm** | [npmjs.com/package/@0xshariq/package-installer](https://www.npmjs.com/package/@0xshariq/package-installer) |
| **PyPI** | [pypi.org/project/package-installer-cli](https://pypi.org/project/package-installer-cli/) |
| **Crates.io** | [crates.io/crates/package-installer-cli](https://crates.io/crates/package-installer-cli) |
| **RubyGems** | [rubygems.org/gems/package-installer-cli](https://rubygems.org/gems/package-installer-cli) |
| **Docker Hub** | [hub.docker.com/r/0xshariq/package-installer-cli](https://hub.docker.com/r/0xshariq/package-installer-cli) |

| Source Code | Repository URL |
|-------------|----------------|
| **Main (Node.js)** | [github.com/0xshariq/package-installer-cli](https://github.com/0xshariq/package-installer-cli) |
| **Python** | [github.com/0xshariq/py_package_installer_cli](https://github.com/0xshariq/py_package_installer_cli) |
| **Rust** | [github.com/0xshariq/rust_package_installer_cli](https://github.com/0xshariq/rust_package_installer_cli) |
| **Ruby** | [github.com/0xshariq/ruby_package_installer_cli](https://github.com/0xshariq/ruby_package_installer_cli) |
| **Go** | [github.com/0xshariq/go_package_installer_cli](https://github.com/0xshariq/go_package_installer_cli) |

---

**Choose your preferred installation method and start building amazing projects! 🚀**

For more information, see the [main documentation](README.md).