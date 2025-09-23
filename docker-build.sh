#!/bin/bash

# Docker build and push script for Package Installer CLI
# Usage: ./docker-build.sh [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="0xshariq"
IMAGE_NAME="package-installer-cli"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}"

# Get version from package.json or use provided argument
if [ -n "$1" ]; then
    VERSION="$1"
else
    VERSION=$(node -p "require('./package.json').version")
fi

echo -e "${BLUE}🐳 Building Docker image for Package Installer CLI${NC}"
echo -e "${YELLOW}Version: ${VERSION}${NC}"
echo -e "${YELLOW}Image: ${FULL_IMAGE_NAME}:${VERSION}${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Build the Docker image
echo -e "${BLUE}📦 Building Docker image...${NC}"
docker build \
    --tag "${FULL_IMAGE_NAME}:${VERSION}" \
    --tag "${FULL_IMAGE_NAME}:latest" \
    --label "version=${VERSION}" \
    --label "build-date=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
else
    echo -e "${RED}❌ Failed to build Docker image${NC}"
    exit 1
fi

# Test the image
echo -e "${BLUE}🧪 Testing the Docker image...${NC}"
docker run --rm "${FULL_IMAGE_NAME}:${VERSION}" --version

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image test passed!${NC}"
else
    echo -e "${RED}❌ Docker image test failed${NC}"
    exit 1
fi

# Ask if user wants to push to Docker Hub
echo ""
read -p "Do you want to push the image to Docker Hub? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🚀 Pushing to Docker Hub...${NC}"
    
    # Check if user is logged in to Docker Hub
    if ! docker info | grep -q "Username:"; then
        echo -e "${YELLOW}⚠️  You need to login to Docker Hub first${NC}"
        echo -e "${BLUE}Running: docker login${NC}"
        docker login
    fi
    
    # Push both version tag and latest tag
    echo -e "${BLUE}📤 Pushing ${FULL_IMAGE_NAME}:${VERSION}${NC}"
    docker push "${FULL_IMAGE_NAME}:${VERSION}"
    
    echo -e "${BLUE}📤 Pushing ${FULL_IMAGE_NAME}:latest${NC}"
    docker push "${FULL_IMAGE_NAME}:latest"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed to Docker Hub!${NC}"
        echo ""
        echo -e "${GREEN}🎉 Your image is now available at:${NC}"
        echo -e "${BLUE}   docker pull ${FULL_IMAGE_NAME}:${VERSION}${NC}"
        echo -e "${BLUE}   docker pull ${FULL_IMAGE_NAME}:latest${NC}"
        echo ""
        echo -e "${GREEN}📚 Usage examples:${NC}"
        echo -e "${BLUE}   docker run -it --rm ${FULL_IMAGE_NAME} --help${NC}"
        echo -e "${BLUE}   docker run -it --rm -v \$(pwd):/home/pi/projects ${FULL_IMAGE_NAME} create${NC}"
    else
        echo -e "${RED}❌ Failed to push to Docker Hub${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⏭️  Skipping Docker Hub push${NC}"
    echo -e "${GREEN}✅ Docker image built locally and ready to use!${NC}"
    echo ""
    echo -e "${GREEN}📚 Local usage examples:${NC}"
    echo -e "${BLUE}   docker run -it --rm ${FULL_IMAGE_NAME} --help${NC}"
    echo -e "${BLUE}   docker run -it --rm -v \$(pwd):/home/pi/projects ${FULL_IMAGE_NAME} create${NC}"
fi

echo ""
echo -e "${GREEN}🏁 Docker build process completed!${NC}"