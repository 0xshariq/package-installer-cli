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

# Step 2.5: Prepend fileURLToPath global polyfill to cli-with-packages.js, keeping shebang at the top
echo "🩹 Injecting fileURLToPath global polyfill (shebang safe)..."
POLYFILL="import { fileURLToPath } from 'url';\nglobalThis.fileURLToPath = fileURLToPath;\n"
CLI_FILE="binary/temp/cli-with-packages.js"
if [ -f "$CLI_FILE" ]; then
  TMP_FILE="${CLI_FILE}.tmp"
  SHEBANG_LINE=$(head -n 1 "$CLI_FILE")
  tail -n +2 "$CLI_FILE" > "$TMP_FILE.body"
  echo -e "$SHEBANG_LINE" > "$TMP_FILE"
  echo -e "$POLYFILL" >> "$TMP_FILE"
  cat "$TMP_FILE.body" >> "$TMP_FILE"
  mv "$TMP_FILE" "$CLI_FILE"
  rm "$TMP_FILE.body"
  echo "✅ Polyfill injected with shebang preserved."
else
  echo "❌ cli-with-packages.js not found, skipping polyfill injection."
fi

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
