#!/bin/bash

# Package Installer CLI Docker Management Script
# This script provides convenient Docker operations for the Package Installer CLI

set -e

DOCKER_IMAGE="0xshariq/package-installer-cli"
DEFAULT_TAG="latest"
DOCKER_HUB_USER="0xshariq"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to show usage
show_usage() {
    cat << EOF
Package Installer CLI - Docker Management Script

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    build [TAG]         Build Docker image locally (default: latest)
    push [TAG]          Push image to Docker Hub (default: latest)
    pull [TAG]          Pull image from Docker Hub (default: latest)
    run [ARGS...]       Run CLI with current directory mounted
    shell               Start interactive shell in container
    clean               Remove all package-installer images
    dev                 Start development environment
    test                Test the Docker image
    multi-build         Build multi-architecture image
    version             Show image version information

Examples:
    $0 build              # Build latest image
    $0 build v3.2.0       # Build specific version
    $0 run create my-app  # Run CLI command
    $0 shell              # Interactive shell
    $0 dev                # Development mode
    $0 clean              # Clean up images

Options:
    -h, --help          Show this help message
    -v, --verbose       Verbose output

EOF
}

# Function to build Docker image
build_image() {
    local tag=${1:-$DEFAULT_TAG}
    local full_image="$DOCKER_IMAGE:$tag"
    
    print_color $BLUE "Building Docker image: $full_image"
    
    if [[ "$tag" == "dev" ]]; then
        docker build -f Dockerfile.dev -t "$full_image" .
    else
        docker build -t "$full_image" .
    fi
    
    print_color $GREEN "✅ Image built successfully: $full_image"
}

# Function to push image to Docker Hub
push_image() {
    local tag=${1:-$DEFAULT_TAG}
    local full_image="$DOCKER_IMAGE:$tag"
    
    print_color $BLUE "Pushing image to Docker Hub: $full_image"
    
    # Check if logged in to Docker Hub
    if ! docker info | grep -q "Username: $DOCKER_HUB_USER"; then
        print_color $YELLOW "⚠️  Not logged in to Docker Hub. Please run: docker login"
        exit 1
    fi
    
    docker push "$full_image"
    print_color $GREEN "✅ Image pushed successfully: $full_image"
}

# Function to pull image from Docker Hub
pull_image() {
    local tag=${1:-$DEFAULT_TAG}
    local full_image="$DOCKER_IMAGE:$tag"
    
    print_color $BLUE "Pulling image from Docker Hub: $full_image"
    docker pull "$full_image"
    print_color $GREEN "✅ Image pulled successfully: $full_image"
}

# Function to run CLI with mounted directories
run_cli() {
    local full_image="$DOCKER_IMAGE:$DEFAULT_TAG"
    
    print_color $BLUE "Running Package Installer CLI in Docker..."
    
    docker run -it --rm \
        -v "$(pwd)":/home/pi/projects \
        -v "$HOME/.gitconfig:/home/pi/.gitconfig:ro" 2>/dev/null \
        -v "$HOME/.ssh:/home/pi/.ssh:ro" 2>/dev/null \
        "$full_image" "$@"
}

# Function to start interactive shell
start_shell() {
    local full_image="$DOCKER_IMAGE:$DEFAULT_TAG"
    
    print_color $BLUE "Starting interactive shell in Docker container..."
    
    docker run -it --rm \
        -v "$(pwd)":/home/pi/projects \
        -v "$HOME/.gitconfig:/home/pi/.gitconfig:ro" 2>/dev/null \
        -v "$HOME/.ssh:/home/pi/.ssh:ro" 2>/dev/null \
        --entrypoint /bin/bash \
        "$full_image"
}

# Function to clean up images
clean_images() {
    print_color $BLUE "Cleaning up Package Installer CLI images..."
    
    # Remove all package-installer images
    local images=$(docker images "$DOCKER_IMAGE" -q 2>/dev/null)
    
    if [[ -n "$images" ]]; then
        docker rmi $images 2>/dev/null || true
        print_color $GREEN "✅ Cleaned up images"
    else
        print_color $YELLOW "⚠️  No images found to clean"
    fi
    
    # Prune unused images
    docker image prune -f >/dev/null 2>&1 || true
}

# Function to start development environment
start_dev() {
    if [[ ! -f "docker-compose.yml" ]]; then
        print_color $RED "❌ docker-compose.yml not found. Run this from the project root."
        exit 1
    fi
    
    print_color $BLUE "Starting development environment..."
    docker-compose --profile dev up --build
}

# Function to test Docker image
test_image() {
    local tag=${1:-$DEFAULT_TAG}
    local full_image="$DOCKER_IMAGE:$tag"
    
    print_color $BLUE "Testing Docker image: $full_image"
    
    # Test 1: Check if image exists
    if ! docker image inspect "$full_image" >/dev/null 2>&1; then
        print_color $RED "❌ Image not found: $full_image"
        exit 1
    fi
    
    # Test 2: Check version command
    print_color $BLUE "Testing version command..."
    if docker run --rm "$full_image" --version >/dev/null 2>&1; then
        print_color $GREEN "✅ Version command works"
    else
        print_color $RED "❌ Version command failed"
        exit 1
    fi
    
    # Test 3: Check help command
    print_color $BLUE "Testing help command..."
    if docker run --rm "$full_image" --help >/dev/null 2>&1; then
        print_color $GREEN "✅ Help command works"
    else
        print_color $RED "❌ Help command failed"
        exit 1
    fi
    
    print_color $GREEN "✅ All tests passed for image: $full_image"
}

# Function to build multi-architecture image
multi_build() {
    local tag=${1:-$DEFAULT_TAG}
    local full_image="$DOCKER_IMAGE:$tag"
    
    print_color $BLUE "Building multi-architecture image: $full_image"
    
    # Check if buildx is available
    if ! docker buildx version >/dev/null 2>&1; then
        print_color $RED "❌ Docker buildx not available"
        exit 1
    fi
    
    # Create and use buildx builder
    docker buildx create --use --name multiarch-builder 2>/dev/null || true
    
    # Build for multiple architectures
    docker buildx build \
        --platform linux/amd64,linux/arm64 \
        -t "$full_image" \
        --push \
        .
    
    print_color $GREEN "✅ Multi-architecture image built and pushed: $full_image"
}

# Function to show version information
show_version() {
    local tag=${1:-$DEFAULT_TAG}
    local full_image="$DOCKER_IMAGE:$tag"
    
    print_color $BLUE "Image version information:"
    
    if docker image inspect "$full_image" >/dev/null 2>&1; then
        echo "Image: $full_image"
        echo "Created: $(docker image inspect "$full_image" --format '{{.Created}}')"
        echo "Size: $(docker image inspect "$full_image" --format '{{.Size}}' | numfmt --to=si)"
        echo "Architecture: $(docker image inspect "$full_image" --format '{{.Architecture}}')"
        
        # Show CLI version
        print_color $BLUE "CLI Version:"
        docker run --rm "$full_image" --version 2>/dev/null || echo "Unable to get CLI version"
    else
        print_color $RED "❌ Image not found: $full_image"
        exit 1
    fi
}

# Main script logic
case "${1:-}" in
    build)
        build_image "${2}"
        ;;
    push)
        push_image "${2}"
        ;;
    pull)
        pull_image "${2}"
        ;;
    run)
        shift
        run_cli "$@"
        ;;
    shell)
        start_shell
        ;;
    clean)
        clean_images
        ;;
    dev)
        start_dev
        ;;
    test)
        test_image "${2}"
        ;;
    multi-build)
        multi_build "${2}"
        ;;
    version)
        show_version "${2}"
        ;;
    -h|--help)
        show_usage
        ;;
    "")
        show_usage
        ;;
    *)
        print_color $RED "❌ Unknown command: $1"
        show_usage
        exit 1
        ;;
esac