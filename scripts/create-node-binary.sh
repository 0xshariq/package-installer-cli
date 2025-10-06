#!/bin/bash

echo "🚀 Creating Node.js binary with packages..."

# Create binary folder structure
rm -rf binary
mkdir -p binary/temp
mkdir -p binary/node-binaries

# Step 1: Build TypeScript
echo "📦 Building TypeScript..."
pnpm run build

# Step 2: Bundle ONLY packages using esbuild
echo "🔗 Bundling packages..."
npx esbuild dist/index.js \
  --bundle \
  --platform=node \
  --target=node22 \
  --format=esm \
  --outfile=binary/temp/cli-with-packages.js \
  --packages=bundle \
  --external:fs --external:path --external:os --external:crypto \
  --external:events --external:util --external:stream --external:child_process \
  --external:url --external:querystring --external:buffer --external:process \
  --external:node:* \
  --keep-names \
  --legal-comments=none \
  --minify=false

echo "✅ Packages bundled!"
echo "   ✅ blessed, boxen, chalk, cli-spinners, cli-table3"
echo "   ✅ commander, figlet, fs-extra, glob, gradient-string"
echo "   ✅ inquirer, inquirer-autocomplete-prompt, ora, semver, terminal-kit"

# Step 3: Copy all required assets to temp folder
echo "📁 Copying assets to bundle..."
cp -r dist binary/temp/
cp -r templates binary/temp/
cp -r features binary/temp/
cp template.json binary/temp/

# Step 4: Create package.json
cat > binary/temp/package.json << 'EOF'
{
  "type": "module",
  "name": "package-installer-binary",
  "version": "1.0.0",
  "main": "cli-with-packages.js",
  "pkg": {
    "assets": [
      "dist/**/*",
      "templates/**/*",
      "features/**/*",
      "template.json"
    ]
  }
}
EOF

# Step 5: Create Node.js binaries with assets
echo "⚙️ Creating Node.js binaries with all assets..."
cd binary/temp
npx @yao-pkg/pkg cli-with-packages.js \
  --targets node22-linux-x64,node22-macos-x64,node22-win-x64 \
  --output ../node-binaries/package-installer \
  --compress GZip \
  --options max-old-space-size=4096
cd ../..

# Rename binaries
mv binary/node-binaries/package-installer-linux binary/node-binaries/pi-linux-x64 2>/dev/null || true
mv binary/node-binaries/package-installer-macos binary/node-binaries/pi-macos-x64 2>/dev/null || true
mv binary/node-binaries/package-installer-win.exe binary/node-binaries/pi-win-x64.exe 2>/dev/null || true

echo "✅ Node.js binaries with all assets created!"
ls -lh binary/node-binaries/

echo ""
echo "✨ Complete standalone binaries created!"
echo "📦 Location: binary/node-binaries/"
echo ""
echo "📋 Each binary includes:"
echo "   ✅ All npm packages bundled"
echo "   ✅ Compiled dist folder"
echo "   ✅ All templates"
echo "   ✅ All features"
echo "   ✅ Template configuration"
echo ""
echo "🧪 Test a binary:"
echo "   ./binary/node-binaries/pi-linux-x64 --help"
