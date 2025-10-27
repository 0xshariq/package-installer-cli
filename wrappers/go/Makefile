# Package Installer CLI - Go Wrapper Build Configuration

# Variables
APP_NAME = package-installer-cli
# Version and build directory
VERSION = 2.1.0
BUILD_DIR = build

# Go ldflags (used as: -ldflags "$(LDFLAGS)")
LDFLAGS = -s -w -X main.appVersion=$(VERSION)

# Default target
.PHONY: all
all: clean build-all

# Clean build directory
.PHONY: clean
clean:
	rm -rf $(BUILD_DIR)
	mkdir -p $(BUILD_DIR)

# Build for current platform
.PHONY: build
build: clean
	go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(APP_NAME) .
	go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/pi .

# Build for all platforms
.PHONY: build-all
build-all: clean build-linux build-windows build-darwin

# Build for Linux (amd64 and arm64)
.PHONY: build-linux
build-linux:
	GOOS=linux GOARCH=amd64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(APP_NAME)-linux-amd64 .
	GOOS=linux GOARCH=arm64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(APP_NAME)-linux-arm64 .
	GOOS=linux GOARCH=amd64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/pi-linux-amd64 .
	GOOS=linux GOARCH=arm64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/pi-linux-arm64 .

# Build for Windows (amd64 and arm64)
.PHONY: build-windows
build-windows:
	GOOS=windows GOARCH=amd64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(APP_NAME)-windows-amd64.exe .
	GOOS=windows GOARCH=arm64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(APP_NAME)-windows-arm64.exe .
	GOOS=windows GOARCH=amd64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/pi-windows-amd64.exe .
	GOOS=windows GOARCH=arm64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/pi-windows-arm64.exe .

# Build for macOS (amd64 and arm64)
.PHONY: build-darwin
build-darwin:
	# Use 'macos' in artifact names to match packaging scripts
	GOOS=darwin GOARCH=amd64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(APP_NAME)-macos-amd64 .
	GOOS=darwin GOARCH=arm64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/$(APP_NAME)-macos-arm64 .
	GOOS=darwin GOARCH=amd64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/pi-macos-amd64 .
	GOOS=darwin GOARCH=arm64 go build -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/pi-macos-arm64 .

# Create release packages
.PHONY: package
package: build-all
	@echo "Creating release packages (via package.sh)..."
	./package.sh

# Install locally (requires sudo for system-wide installation)
.PHONY: install
install: build
	sudo cp $(BUILD_DIR)/$(APP_NAME) /usr/local/bin/
	sudo cp $(BUILD_DIR)/pi /usr/local/bin/
	@echo "$(APP_NAME) and pi installed to /usr/local/bin/"

# Uninstall
.PHONY: uninstall
uninstall:
	sudo rm -f /usr/local/bin/$(APP_NAME)
	sudo rm -f /usr/local/bin/pi
	@echo "$(APP_NAME) and pi uninstalled from /usr/local/bin/"

# Test the build
.PHONY: test
test: build
	$(BUILD_DIR)/$(APP_NAME) --help
	$(BUILD_DIR)/pi --help

# Show available targets
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  build       - Build for current platform"
	@echo "  build-all   - Build for all platforms"
	@echo "  build-linux - Build for Linux (amd64, arm64)"
	@echo "  build-windows - Build for Windows (amd64, arm64)"
	@echo "  build-darwin - Build for macOS (amd64, arm64)"
	@echo "  package     - Create release packages"
	@echo "  install     - Install locally (requires sudo)"
	@echo "  uninstall   - Uninstall from system"
	@echo "  test        - Test the build"
	@echo "  clean       - Clean build directory"
	@echo "  help        - Show this help"