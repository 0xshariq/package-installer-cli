#!/bin/bash

# Node.js CLI Binary Build Script (Webpack ESM Bundle)
# This script builds the CLI as a single ESM bundle using webpack, with all dependencies included.

set -e

echo "🚀 Creating Node.js ESM bundle with all packages..."

# Clean and prepare output directories
rm -rf binary
mkdir -p binary/temp
mkdir -p binary/node-binaries

# Step 1: Build TypeScript
echo "📦 Building TypeScript..."
pnpm run build

# Step 2: Bundle ALL dependencies from package.json using webpack (ESM format)
echo "🔗 Bundling ALL dependencies from package.json to ESM with webpack..."
npx webpack --config webpack.config.mjs

# Step 3: Copy all required assets to temp folder
echo "📁 Copying assets to bundle..."
cp -r dist binary/temp/
cp -r templates binary/temp/
cp -r features binary/temp/
cp template.json binary/temp/
echo "✅ Copied dist, templates, features, and config"

# Step 4: Create package.json with NO dependencies (all bundled in cli-with-packages.js)
cat > binary/temp/package.json << 'EOF'
{
  "type": "module",
  "name": "package-installer-binary",
  "version": "1.0.0",
  "description": "Package Installer CLI - Standalone Binary (all dependencies bundled)",
  "main": "cli-with-packages.js",
  "engines": {
    "node": ">=22.0.0"
  },
  "note": "All npm dependencies are pre-bundled in cli-with-packages.js - no node_modules required!"
}
EOF

echo "✅ All packages bundled into cli-with-packages.js (ESM)!"
echo "   ✅ Size: $(du -h binary/temp/cli-with-packages.js 2>/dev/null | cut -f1)"

echo "✨ Node.js ESM CLI bundle ready in binary/temp/cli-with-packages.js"
