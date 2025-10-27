#!/bin/bash

# Package Installer CLI - Build Script
# Cross-platform build script for the Go wrapper

set -e

APP_NAME="package-installer-cli"
BUILD_DIR="build"
VERSION="2.3.0"
LDFLAGS="-s -w -X main.appVersion=$VERSION"

# Clean and create build directory
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

echo "🔨 Building Go binaries for all platforms (package-installer-cli and pi)..."
# Linux amd64
GOOS=linux   GOARCH=amd64 go build -o $BUILD_DIR/package-installer-cli-linux-amd64   -ldflags="$LDFLAGS" .
GOOS=linux   GOARCH=amd64 go build -o $BUILD_DIR/pi-linux-amd64   -ldflags="$LDFLAGS" .
# Linux arm64
GOOS=linux   GOARCH=arm64 go build -o $BUILD_DIR/package-installer-cli-linux-arm64   -ldflags="$LDFLAGS" .
GOOS=linux   GOARCH=arm64 go build -o $BUILD_DIR/pi-linux-arm64   -ldflags="$LDFLAGS" .
# macOS amd64
GOOS=darwin  GOARCH=amd64 go build -o $BUILD_DIR/package-installer-cli-macos-amd64   -ldflags="$LDFLAGS" .
GOOS=darwin  GOARCH=amd64 go build -o $BUILD_DIR/pi-macos-amd64   -ldflags="$LDFLAGS" .
# macOS arm64
GOOS=darwin  GOARCH=arm64 go build -o $BUILD_DIR/package-installer-cli-macos-arm64   -ldflags="$LDFLAGS" .
GOOS=darwin  GOARCH=arm64 go build -o $BUILD_DIR/pi-macos-arm64   -ldflags="$LDFLAGS" .
# Windows amd64
GOOS=windows GOARCH=amd64 go build -o $BUILD_DIR/package-installer-cli-windows-amd64.exe   -ldflags="$LDFLAGS" .
GOOS=windows GOARCH=amd64 go build -o $BUILD_DIR/pi-windows-amd64.exe   -ldflags="$LDFLAGS" .
# Windows arm64
GOOS=windows GOARCH=arm64 go build -o $BUILD_DIR/package-installer-cli-windows-arm64.exe   -ldflags="$LDFLAGS" .
GOOS=windows GOARCH=arm64 go build -o $BUILD_DIR/pi-windows-arm64.exe   -ldflags="$LDFLAGS" .

# Set executable permissions for all built binaries (except .exe)
find $BUILD_DIR -type f \( -name 'package-installer-cli-*' -o -name 'pi-*' \) ! -name '*.exe' -exec chmod +x {} \;

echo "✅ Binaries with embedded bundle are ready in the $BUILD_DIR/ directory:"
ls -la $BUILD_DIR/

echo ""
echo "📋 Next steps:"
echo "  1. Distribute the binaries from build/"
echo "  2. To create release packages, run: ./package.sh"