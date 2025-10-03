#!/bin/bash

# Docker build and push script for Package Installer CLI
# 
# Usage: ./docker-build.sh [version] [options]
# 
# Options:
#   --dev         Build development version using Dockerfile.dev
#   --no-cache    Build without using Docker cache
#   --platform    Specify platform(s) for multi-arch build (e.g., linux/amd64,linux/arm64)
#   --push        Automatically push to Docker Hub after successful build
#   --test-only   Only run tests on existing image, skip build
#   --help        Show this help message
#
# Examples:
#   ./docker-build.sh                           # Build production image with current version
#   ./docker-build.sh 3.8.0                    # Build production image with specific version
#   ./docker-build.sh --dev                     # Build development image
#   ./docker-build.sh --push                    # Build and auto-push to Docker Hub
#   ./docker-build.sh --no-cache               # Build without cache
#   ./docker-build.sh --platform linux/amd64,linux/arm64  # Multi-arch build
#   ./docker-build.sh --test-only               # Only test existing image
#
# Environment Variables:
#   DOCKER_USERNAME    Docker Hub username (default: 0xshariq)
#   IMAGE_NAME         Docker image name (default: package-installer-cli)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (can be overridden by environment variables)
DOCKER_USERNAME="${DOCKER_USERNAME:-0xshariq}"
IMAGE_NAME="${IMAGE_NAME:-package-installer-cli}"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}"

# Default options
DEV_BUILD=false
NO_CACHE=false
PLATFORM=""
AUTO_PUSH=false
TEST_ONLY=false
DOCKERFILE="Dockerfile"

# Parse arguments
VERSION=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --dev)
            DEV_BUILD=true
            DOCKERFILE="Dockerfile.dev"
            shift
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --push)
            AUTO_PUSH=true
            shift
            ;;
        --test-only)
            TEST_ONLY=true
            shift
            ;;
        --help)
            echo "Usage: $0 [version] [options]"
            echo "Options:"
            echo "  --dev         Build development version"
            echo "  --no-cache    Build without using cache"
            echo "  --platform    Specify platform(s) for multi-arch build (e.g., linux/amd64,linux/arm64)"
            echo "  --push        Automatically push after build"
            echo "  --test-only   Only run tests, don't build"
            echo "  --help        Show this help message"
            exit 0
            ;;
        *)
            if [ -z "$VERSION" ]; then
                VERSION="$1"
            fi
            shift
            ;;
    esac
done

# Get version from package.json if not provided
if [ -z "$VERSION" ]; then
    VERSION=$(node -p "require('./package.json').version")
fi

# Set image tags based on build type
if [ "$DEV_BUILD" = true ]; then
    TAG_SUFFIX="-dev"
    LATEST_TAG="dev"
else
    TAG_SUFFIX=""
    LATEST_TAG="latest"
fi

echo -e "${BLUE}🐳 Building Docker image for Package Installer CLI${NC}"
echo -e "${YELLOW}Version: ${VERSION}${TAG_SUFFIX}${NC}"
echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}${NC}"
echo -e "${YELLOW}Dockerfile: ${DOCKERFILE}${NC}"
if [ "$DEV_BUILD" = true ]; then
    echo -e "${YELLOW}Build Type: Development${NC}"
else
    echo -e "${YELLOW}Build Type: Production${NC}"
fi
if [ -n "$PLATFORM" ]; then
    echo -e "${YELLOW}Platform(s): ${PLATFORM}${NC}"
fi
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if Dockerfile exists
if [ ! -f "$DOCKERFILE" ]; then
    echo -e "${RED}❌ Dockerfile '${DOCKERFILE}' not found${NC}"
    exit 1
fi

# Skip build if test-only mode
if [ "$TEST_ONLY" = true ]; then
    echo -e "${YELLOW}⏭️  Skipping build (test-only mode)${NC}"
else
    # Prepare build arguments
    BUILD_ARGS=(
        "--file" "$DOCKERFILE"
        "--tag" "${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}"
        "--tag" "${FULL_IMAGE_NAME}:${LATEST_TAG}"
        "--label" "version=${VERSION}"
        "--label" "build-date=$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
        "--label" "git-commit=$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
        "--label" "build-type=$([ "$DEV_BUILD" = true ] && echo 'development' || echo 'production')"
    )

    # Add no-cache option if specified
    if [ "$NO_CACHE" = true ]; then
        BUILD_ARGS+=("--no-cache")
        echo -e "${YELLOW}⚠️  Building without cache${NC}"
    fi

    # Add platform option if specified
    if [ -n "$PLATFORM" ]; then
        BUILD_ARGS+=("--platform" "$PLATFORM")
        echo -e "${YELLOW}🏗️  Building for platform(s): ${PLATFORM}${NC}"
    fi

    # Build the Docker image
    echo -e "${BLUE}📦 Building Docker image...${NC}"
    echo -e "${BLUE}Command: docker build ${BUILD_ARGS[*]} .${NC}"
    
    if docker build "${BUILD_ARGS[@]}" .; then
        echo -e "${GREEN}✅ Docker image built successfully!${NC}"
        
        # Show image information
        echo -e "${BLUE}📊 Image information:${NC}"
        docker images "${FULL_IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    else
        echo -e "${RED}❌ Failed to build Docker image${NC}"
        exit 1
    fi
fi

# Test the image
echo ""
echo -e "${BLUE}🧪 Testing the Docker image...${NC}"

# Determine which tag to test
if [ "$TEST_ONLY" = true ]; then
    TEST_TAG="${FULL_IMAGE_NAME}:${LATEST_TAG}"
else
    TEST_TAG="${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}"
fi

# Run basic functionality tests
echo -e "${BLUE}🔍 Testing basic functionality...${NC}"
if docker run --rm "$TEST_TAG" --version > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Version command works${NC}"
else
    echo -e "${RED}  ❌ Version command failed${NC}"
    exit 1
fi

if docker run --rm "$TEST_TAG" --help > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Help command works${NC}"
else
    echo -e "${RED}  ❌ Help command failed${NC}"
    exit 1
fi

# Test email command availability (new feature)
if docker run --rm "$TEST_TAG" email --help > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Email command available${NC}"
else
    echo -e "${YELLOW}  ⚠️  Email command test failed (may need configuration)${NC}"
fi

# Test create command
if docker run --rm "$TEST_TAG" create --help > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Create command available${NC}"
else
    echo -e "${RED}  ❌ Create command failed${NC}"
    exit 1
fi

# Test health check
echo -e "${BLUE}🏥 Testing health check...${NC}"
if timeout 10s docker run --rm "$TEST_TAG" --version > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Health check passed${NC}"
else
    echo -e "${RED}  ❌ Health check failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All Docker image tests passed!${NC}"

# Handle pushing to Docker Hub
echo ""
SHOULD_PUSH=false

if [ "$TEST_ONLY" = true ]; then
    echo -e "${YELLOW}⏭️  Skipping push (test-only mode)${NC}"
elif [ "$AUTO_PUSH" = true ]; then
    SHOULD_PUSH=true
    echo -e "${BLUE}🚀 Auto-pushing to Docker Hub (--push flag specified)${NC}"
else
    read -p "Do you want to push the image to Docker Hub? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        SHOULD_PUSH=true
    fi
fi

if [ "$SHOULD_PUSH" = true ]; then
    echo -e "${BLUE}🚀 Pushing to Docker Hub...${NC}"
    
    # Check if user is logged in to Docker Hub
    if ! docker info | grep -q "Username:"; then
        echo -e "${YELLOW}⚠️  You need to login to Docker Hub first${NC}"
        echo -e "${BLUE}Running: docker login${NC}"
        docker login
    fi
    
    # Push both version tag and latest/dev tag
    echo -e "${BLUE}📤 Pushing ${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}${NC}"
    docker push "${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}"
    
    echo -e "${BLUE}📤 Pushing ${FULL_IMAGE_NAME}:${LATEST_TAG}${NC}"
    docker push "${FULL_IMAGE_NAME}:${LATEST_TAG}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed to Docker Hub!${NC}"
        echo ""
        echo -e "${GREEN}🎉 Your image is now available at:${NC}"
        echo -e "${BLUE}   docker pull ${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}${NC}"
        echo -e "${BLUE}   docker pull ${FULL_IMAGE_NAME}:${LATEST_TAG}${NC}"
        echo ""
        echo -e "${GREEN}📚 Usage examples:${NC}"
        echo -e "${BLUE}   # Interactive mode${NC}"
        echo -e "${BLUE}   docker run -it --rm ${FULL_IMAGE_NAME}:${LATEST_TAG} --help${NC}"
        echo -e "${BLUE}   # Create new project${NC}"
        echo -e "${BLUE}   docker run -it --rm -v \$(pwd):/home/pi/projects ${FULL_IMAGE_NAME}:${LATEST_TAG} create${NC}"
        echo -e "${BLUE}   # Email feedback (requires configuration)${NC}"
        echo -e "${BLUE}   docker run -it --rm ${FULL_IMAGE_NAME}:${LATEST_TAG} email --help${NC}"
        echo -e "${BLUE}   # With port mapping for development${NC}"
        echo -e "${BLUE}   docker run -it --rm -p 3000:3000 -v \$(pwd):/home/pi/projects ${FULL_IMAGE_NAME}:${LATEST_TAG}${NC}"
    else
        echo -e "${RED}❌ Failed to push to Docker Hub${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⏭️  Skipping Docker Hub push${NC}"
    echo -e "${GREEN}✅ Docker image built locally and ready to use!${NC}"
    echo ""
    echo -e "${GREEN}📚 Local usage examples:${NC}"
    echo -e "${BLUE}   # Interactive mode${NC}"
    echo -e "${BLUE}   docker run -it --rm ${FULL_IMAGE_NAME}:${LATEST_TAG} --help${NC}"
    echo -e "${BLUE}   # Create new project${NC}"
    echo -e "${BLUE}   docker run -it --rm -v \$(pwd):/home/pi/projects ${FULL_IMAGE_NAME}:${LATEST_TAG} create${NC}"
    echo -e "${BLUE}   # Email feedback (requires configuration)${NC}"
    echo -e "${BLUE}   docker run -it --rm ${FULL_IMAGE_NAME}:${LATEST_TAG} email --help${NC}"
    echo -e "${BLUE}   # With port mapping for development${NC}"
    echo -e "${BLUE}   docker run -it --rm -p 3000:3000 -v \$(pwd):/home/pi/projects ${FULL_IMAGE_NAME}:${LATEST_TAG}${NC}"
fi

echo ""

# Display final summary
echo -e "${GREEN}🏁 Docker build process completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "${YELLOW}  Version: ${VERSION}${TAG_SUFFIX}${NC}"
echo -e "${YELLOW}  Build Type: $([ "$DEV_BUILD" = true ] && echo 'Development' || echo 'Production')${NC}"
echo -e "${YELLOW}  Dockerfile: ${DOCKERFILE}${NC}"
if [ -n "$PLATFORM" ]; then
    echo -e "${YELLOW}  Platform(s): ${PLATFORM}${NC}"
fi
echo -e "${YELLOW}  Image Tags: ${FULL_IMAGE_NAME}:${VERSION}${TAG_SUFFIX}, ${FULL_IMAGE_NAME}:${LATEST_TAG}${NC}"

# Display image sizes
echo ""
echo -e "${BLUE}📏 Final image sizes:${NC}"
docker images "${FULL_IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"

# Cleanup build cache suggestion
echo ""
echo -e "${BLUE}💡 Pro tip: To cleanup Docker build cache, run:${NC}"
echo -e "${BLUE}   docker builder prune${NC}"
echo -e "${BLUE}   docker system prune -a${NC}"

echo ""
echo -e "${GREEN}🎉 All done! Happy coding! 🚀${NC}"