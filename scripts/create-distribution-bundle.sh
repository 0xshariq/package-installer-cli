#!/bin/bash

echo "🚀 Creating distribution bundles..."

# Create bundle folders
rm -rf bundle-standalone
rm -rf bundle-executables
mkdir -p bundle-standalone
mkdir -p bundle-executables

# Step 1: Check if binaries exist, if not create them
if [ ! -d "binary/node-binaries" ]; then
    echo "📝 Creating Node.js binaries first..."
    bash scripts/create-node-binary.sh
fi

echo ""
echo "📦 Creating bundle-standalone..."

# Copy the bundled CLI file (with all packages included)
echo "📁 Copying bundled CLI..."
if [ -f "binary/temp/cli-with-packages.js" ]; then
    cp binary/temp/cli-with-packages.js bundle-standalone/cli-with-packages.js
    echo "✅ Copied bundled CLI with all packages"
else
    echo "⚠️  Bundled CLI not found! Run create-node-binary.sh first"
    exit 1
fi

# Copy dist folder as fallback (Plan B)
echo "📁 Copying dist folder (fallback)..."
if [ -d "dist" ]; then
    cp -r dist bundle-standalone/
    echo "✅ Copied dist folder as fallback"
else
    echo "⚠️  dist folder not found! Run npm run build first"
fi

# Copy package.json and install only production dependencies for dist fallback
echo "📦 Setting up production dependencies for fallback..."
cp package.json bundle-standalone/
cd bundle-standalone
pnpm install --prod --ignore-scripts --reporter=silent 2>/dev/null || npm install --production --ignore-scripts --no-audit --no-fund --silent 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Installed production dependencies ($(du -sh node_modules 2>/dev/null | cut -f1) total)"
else
    echo "⚠️  Failed to install dependencies, fallback may not work"
fi
cd ..

# Copy node_modules for dist fallback
echo "📁 Copying node_modules (for dist fallback)..."
if [ -d "node_modules" ]; then
    cp -r node_modules bundle-standalone/
    echo "✅ Copied node_modules for fallback support"
else
    echo "⚠️  node_modules not found! Run pnpm install first"
fi

# Copy package.json for dist fallback
if [ -f "package.json" ]; then
    cp package.json bundle-standalone/
    echo "✅ Copied package.json"
fi

# Copy only required assets (templates, features, config)
cp -r templates bundle-standalone/
cp -r features bundle-standalone/
cp template.json bundle-standalone/

# Create 'pi' wrapper script with fallback mechanism
cat > bundle-standalone/pi << 'EOF'
#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Try bundled CLI first (includes all packages, fastest)
if [ -f "$DIR/cli-with-packages.js" ]; then
    node "$DIR/cli-with-packages.js" "$@" 2>/dev/null
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ] || [ $EXIT_CODE -eq 130 ]; then
        exit $EXIT_CODE
    fi
fi

# Fallback to dist/index.js (Plan B)
if [ -f "$DIR/dist/index.js" ]; then
    exec node "$DIR/dist/index.js" "$@"
fi

# If both fail, show error
echo "❌ Error: Unable to run Package Installer CLI" >&2
echo "Neither cli-with-packages.js nor dist/index.js found" >&2
exit 1
EOF
chmod +x bundle-standalone/pi

echo "✅ Created 'pi' wrapper script"

# Create standalone README
cat > bundle-standalone/README.md << 'EOF'
# Package Installer CLI - Standalone Bundle

## Installation

### Option 1: Install to PATH (Recommended)
```bash
# Copy to system directory
sudo cp pi /usr/local/bin/

# Or add current directory to PATH
export PATH="$PATH:$(pwd)"
```

Now you can use `pi` from anywhere:
```bash
pi create my-nextjs-app
pi analyze
pi update
pi add auth
```

### Option 2: Run directly from bundle
```bash
./pi --help
./pi create my-app
```

## Requirements
- Node.js 22+ must be installed

## What's Included
- `pi` - Executable wrapper script with intelligent fallback
- `cli-with-packages.js` - Bundled CLI (Primary, includes all npm packages)
- `dist/` - Fallback CLI (Plan B, requires Node.js)
- `templates/` - All project templates (React, Next.js, Vue, etc.)
- `features/` - Feature definitions (auth, database, AWS, etc.)
- `template.json` - Configuration

## How It Works
The `pi` wrapper uses a smart dual-path approach:
1. **Primary**: Runs `cli-with-packages.js` (fastest, all packages bundled)
2. **Fallback**: If primary fails, uses `dist/index.js` (Plan B)
3. **Error**: Shows clear message if both paths fail

## For Package Maintainers

### Python (PyPI)
```python
import subprocess
subprocess.run([f"{package_dir}/pi", "create", "my-app"])
```

### Rust (Crates.io)
```rust
Command::new(&format!("{}/pi", package_dir))
    .args(&["create", "my-app"])
    .spawn()
```

### Ruby (RubyGems)
```ruby
system("#{package_dir}/pi create my-app")
```

## Note
All npm packages are pre-bundled in `cli-with-packages.js` for optimal performance.
The `dist/` folder provides a reliable fallback mechanism.
Only Node.js 22+ runtime is required.
EOF

echo "✅ bundle-standalone created!"

echo ""
echo "📦 Creating bundle-executables..."

# Copy the bundled CLI file (with all packages included)
if [ -f "binary/temp/cli-with-packages.js" ]; then
    cp binary/temp/cli-with-packages.js bundle-executables/cli-with-packages.js
    echo "✅ Copied bundled CLI with all packages"
else
    echo "⚠️  Bundled CLI not found! Run create-node-binary.sh first"
    exit 1
fi

# Copy dist folder as fallback (Plan B)
echo "📁 Copying dist folder (fallback)..."
if [ -d "dist" ]; then
    cp -r dist bundle-executables/
    echo "✅ Copied dist folder as fallback"
else
    echo "⚠️  dist folder not found! Run npm run build first"
fi

# Copy package.json and install only production dependencies for dist fallback
echo "📦 Setting up production dependencies for fallback..."
cp package.json bundle-executables/
cd bundle-executables
pnpm install --prod --ignore-scripts --reporter=silent 2>/dev/null || npm install --production --ignore-scripts --no-audit --no-fund --silent 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Installed production dependencies ($(du -sh node_modules 2>/dev/null | cut -f1) total)"
else
    echo "⚠️  Failed to install dependencies, fallback may not work"
fi
cd ..

# Copy node_modules for dist fallback
echo "📁 Copying node_modules (for dist fallback)..."
if [ -d "node_modules" ]; then
    cp -r node_modules bundle-executables/
    echo "✅ Copied node_modules for fallback support"
else
    echo "⚠️  node_modules not found! Run pnpm install first"
fi

# Copy package.json for dist fallback
if [ -f "package.json" ]; then
    cp package.json bundle-executables/
    echo "✅ Copied package.json"
fi

# Copy only required assets
cp -r templates bundle-executables/
cp -r features bundle-executables/
cp template.json bundle-executables/

# Create wrapper scripts for each platform with fallback mechanism
# Linux wrapper
cat > bundle-executables/pi << 'EOF'
#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Try bundled CLI first (includes all packages, fastest)
if [ -f "$DIR/cli-with-packages.js" ]; then
    node "$DIR/cli-with-packages.js" "$@" 2>/dev/null
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ] || [ $EXIT_CODE -eq 130 ]; then
        exit $EXIT_CODE
    fi
fi

# Fallback to dist/index.js (Plan B)
if [ -f "$DIR/dist/index.js" ]; then
    exec node "$DIR/dist/index.js" "$@"
fi

# If both fail, show error
echo "❌ Error: Unable to run Package Installer CLI" >&2
echo "Neither cli-with-packages.js nor dist/index.js found" >&2
exit 1
EOF
chmod +x bundle-executables/pi

# macOS wrapper
cat > bundle-executables/pi-macos << 'EOF'
#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Try bundled CLI first (includes all packages, fastest)
if [ -f "$DIR/cli-with-packages.js" ]; then
    node "$DIR/cli-with-packages.js" "$@" 2>/dev/null
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ] || [ $EXIT_CODE -eq 130 ]; then
        exit $EXIT_CODE
    fi
fi

# Fallback to dist/index.js (Plan B)
if [ -f "$DIR/dist/index.js" ]; then
    exec node "$DIR/dist/index.js" "$@"
fi

# If both fail, show error
echo "❌ Error: Unable to run Package Installer CLI" >&2
echo "Neither cli-with-packages.js nor dist/index.js found" >&2
exit 1
EOF
chmod +x bundle-executables/pi-macos

# Windows wrapper
cat > bundle-executables/pi.bat << 'EOF'
@echo off
setlocal

REM Get the directory where this batch file is located
set "DIR=%~dp0"

REM Try bundled CLI first (includes all packages, fastest)
if exist "%DIR%cli-with-packages.js" (
    node "%DIR%cli-with-packages.js" %* 2>nul
    if %ERRORLEVEL% EQU 0 exit /b 0
    if %ERRORLEVEL% EQU 130 exit /b 130
)

REM Fallback to dist/index.js (Plan B)
if exist "%DIR%dist\index.js" (
    node "%DIR%dist\index.js" %*
    exit /b %ERRORLEVEL%
)

REM If both fail, show error
echo Error: Unable to run Package Installer CLI >&2
echo Neither cli-with-packages.js nor dist\index.js found >&2
exit /b 1
EOF

echo "✅ Created wrapper scripts for all platforms"

# Create executables README
cat > bundle-executables/README.md << 'EOF'
# Package Installer CLI - Executables

## Installation

### Linux / macOS
```bash
# Install to system PATH
sudo cp pi /usr/local/bin/
# or for macOS specifically
sudo cp pi-macos /usr/local/bin/pi

# Or add to PATH
export PATH="$PATH:$(pwd)"
```

### Windows
```cmd
REM Add directory to PATH or copy to a directory in PATH
copy pi.bat C:\Windows\System32\
```

Now use `pi` from anywhere:
```bash
pi create my-nextjs-app
pi analyze --export json
pi update lodash react
```

## Direct Usage (without installation)

### Linux
```bash
./pi --help
./pi create my-app
```

### macOS
```bash
./pi-macos --help
./pi-macos create my-app
```

### Windows
```cmd
pi.bat --help
pi.bat create my-app
```

## Requirements
- Node.js 22+ must be installed

## What's Included
- Platform-specific wrapper scripts (`pi`, `pi-macos`, `pi.bat`) with intelligent fallback
- `cli-with-packages.js` - Bundled CLI (Primary, includes all npm packages)
- `dist/` - Fallback CLI (Plan B, requires Node.js)
- `templates/` - All project templates
- `features/` - Feature definitions
- `template.json` - Configuration

## How It Works
Each wrapper uses a smart dual-path approach:
1. **Primary**: Runs `cli-with-packages.js` (fastest, all packages bundled)
2. **Fallback**: If primary fails, uses `dist/index.js` (Plan B)
3. **Error**: Shows clear message if both paths fail

## Distribution
Perfect for:
- GitHub Releases (direct download)
- Homebrew (macOS package manager)
- System package managers (apt, yum, etc.)

## Note
All npm packages are pre-bundled in `cli-with-packages.js` for optimal performance.
The `dist/` folder provides a reliable fallback mechanism.
Only Node.js 22+ runtime is required.
EOF

echo "✅ bundle-executables created!"

echo ""
echo "✨ Bundles ready!"
echo "├── bundle-standalone/"
echo "│   ├── pi (wrapper with fallback)"
echo "│   ├── cli-with-packages.js (primary, bundled)"
echo "│   ├── dist/ (fallback)"
echo "│   ├── templates/"
echo "│   ├── features/"
echo "│   └── template.json"
echo "└── bundle-executables/"
echo "    ├── pi (Linux wrapper with fallback)"
echo "    ├── pi-macos (macOS wrapper with fallback)"
echo "    ├── pi.bat (Windows wrapper with fallback)"
echo "    ├── cli-with-packages.js (primary, bundled)"
echo "    ├── dist/ (fallback)"
echo "    ├── templates/"
echo "    ├── features/"
echo "    └── template.json"
echo ""
echo "🧪 Test:"
echo "  ./bundle-standalone/pi --help"
echo "  ./bundle-executables/pi --help"
