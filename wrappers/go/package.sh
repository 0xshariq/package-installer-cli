#!/bin/bash

# Package Installer CLI - Release Packaging Script
# Creates distribution packages without using zip

set -e

VERSION="2.3.0"
BUILD_DIR="build"

echo "🚀 Creating Package Installer CLI Release Packages v$VERSION"

# Ensure build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found. Run build.sh first."
    exit 1
fi

echo "📦 Creating platform-specific tar.gz packages..."

cd "$BUILD_DIR"
for bin in package-installer-cli-linux-amd64 package-installer-cli-linux-arm64 package-installer-cli-macos-amd64 package-installer-cli-macos-arm64 package-installer-cli-windows-amd64.exe package-installer-cli-windows-arm64.exe pi-linux-amd64 pi-linux-arm64 pi-macos-amd64 pi-macos-arm64 pi-windows-amd64.exe pi-windows-arm64.exe; do
    if [ -f "$bin" ]; then
        # Extract platform and arch from binary name
        name=$(echo $bin | sed 's/\.[^.]*$//')
        # Remove .exe for tarball name
        tarname="$name-$VERSION.tar.gz"
        tar -czf "$tarname" "$bin"
        echo "  ✅ Created: $tarname"
    else
        echo "  ⚠️  Skipped missing binary: $bin"
    fi

done
cd ..

echo ""
echo "✅ All platform/arch bundles packaged as tar.gz in $BUILD_DIR/"
ls -lh $BUILD_DIR/*.tar.gz 2>/dev/null || echo "No tar.gz files created."
echo ""
echo "🚀 Ready for distribution!"
echo "📋 Next steps:"
echo "  1. Upload the tar.gz files to your release platform."
echo "  2. Test the bundles on different platforms."
echo "  3. Update documentation with download links."
echo "  4. Run sha256sum build/*.tar.gz > build/checksums.txt and include checksums in the release notes."