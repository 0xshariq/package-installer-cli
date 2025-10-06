#!/bin/bash

# Distribution Bundle Script for Package Installer CLI (Webpack ESM Bundle)
# This script creates minimal, portable CLI bundles for distribution.

set -e

echo "🚀 Creating distribution bundles..."

# Clean and create bundle folders
rm -rf bundle-standalone
rm -rf bundle-executables
mkdir -p bundle-standalone
mkdir -p bundle-executables

# Ensure the ESM bundle exists
if [ ! -f "binary/temp/cli-with-packages.js" ]; then
    echo "📝 Building CLI bundle first..."
    bash scripts/create-node-binary.sh
fi

echo ""
echo "📦 Creating bundle-standalone..."

# Copy the bundled CLI file (with all packages included)
cp binary/temp/cli-with-packages.js bundle-standalone/cli-with-packages.js

# Copy only required assets (templates, features, config)
cp -r templates bundle-standalone/
cp -r features bundle-standalone/
cp template.json bundle-standalone/

# Create minimal package.json
cat > bundle-standalone/package.json << 'EOF'
{
  "type": "module",
  "name": "package-installer-cli-standalone",
  "version": "1.0.0",
  "main": "cli-with-packages.js",
  "bin": {
    "pi": "./pi"
  },
  "engines": {
    "node": ">=22.0.0"
  },
  "license": "MIT"
}
EOF

# Create 'pi' wrapper script (always runs cli-with-packages.js)
cat > bundle-standalone/pi << 'EOF'
#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$DIR/cli-with-packages.js" "$@"
EOF
chmod +x bundle-standalone/pi

echo "✅ bundle-standalone created!"

echo ""
echo "📦 Creating bundle-executables..."

cp binary/temp/cli-with-packages.js bundle-executables/cli-with-packages.js
cp -r templates bundle-executables/
cp -r features bundle-executables/
cp template.json bundle-executables/

cat > bundle-executables/package.json << 'EOF'
{
  "type": "module",
  "name": "package-installer-cli-executables",
  "version": "1.0.0",
  "main": "cli-with-packages.js",
  "bin": {
    "pi": "./pi"
  },
  "engines": {
    "node": ">=22.0.0"
  },
  "license": "MIT"
}
EOF

# Linux wrapper
cat > bundle-executables/pi << 'EOF'
#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$DIR/cli-with-packages.js" "$@"
EOF
chmod +x bundle-executables/pi

# macOS wrapper
cat > bundle-executables/pi-macos << 'EOF'
#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$DIR/cli-with-packages.js" "$@"
EOF
chmod +x bundle-executables/pi-macos

# Windows wrapper
cat > bundle-executables/pi.bat << 'EOF'
@echo off
setlocal
set "DIR=%~dp0"
node "%DIR%cli-with-packages.js" %*
exit /b %ERRORLEVEL%
EOF

echo "✅ bundle-executables created!"

echo ""
echo "✨ Bundles ready!"
echo "├── bundle-standalone/"
echo "│   ├── pi (wrapper)"
echo "│   ├── cli-with-packages.js (all dependencies bundled)"
echo "│   ├── templates/"
echo "│   ├── features/"
echo "│   └── template.json"
echo "└── bundle-executables/"
echo "    ├── pi (Linux wrapper)"
echo "    ├── pi-macos (macOS wrapper)"
echo "    ├── pi.bat (Windows wrapper)"
echo "    ├── cli-with-packages.js (all dependencies bundled)"
echo "    ├── templates/"
echo "    ├── features/"
echo "    └── template.json"
echo ""
echo "🧪 Test:"
echo "  ./bundle-standalone/pi --help"
echo "  ./bundle-executables/pi --help"
