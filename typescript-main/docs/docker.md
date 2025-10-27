# 🐳 Docker Setup for Package Installer CLI

This document provides comprehensive instructions for building, running, and deploying the Package Installer CLI using Docker.

## 📋 Prerequisites

- Docker Desktop or Docker Engine installed
- Docker Hub account (for pushing images)
- Git (for cloning the repository)

## 🚀 Quick Start

### Pull from Docker Hub

```bash
# Pull the latest version
docker pull 0xshariq/package-installer-cli:latest

# Run the CLI
docker run -it --rm 0xshariq/package-installer-cli:latest --help
```

### Run with Project Volume

```bash
# Create a new project in current directory
docker run -it --rm \
  -v $(pwd):/home/pi/projects \
  0xshariq/package-installer-cli:latest create

# Add features to existing project
docker run -it --rm \
  -v $(pwd):/home/pi/projects \
  0xshariq/package-installer-cli:latest add auth
```

## Image Details

### Base Image
- **Base**: `node:22-alpine`
- **Size**: ~200MB compressed
- **Architecture**: Multi-arch (linux/amd64, linux/arm64)

### Security Features
- Non-root user (`pi:nodejs`)
- Minimal attack surface with Alpine Linux
- Security scanning with Trivy
- Regular automated updates

### Included Tools
- Node.js 22 (LTS)
- pnpm (latest)
- Git
- SSH client
- Python 3 (for native dependencies)
- Build tools (make, g++)

## Volume Mounts

### Required Mounts

```bash
# Project directory - where your code will be created
-v "$(pwd)":/home/pi/projects

# Git configuration - for repository cloning
-v ~/.gitconfig:/home/pi/.gitconfig:ro

# SSH keys - for private repository access
-v ~/.ssh:/home/pi/.ssh:ro
```

### Optional Mounts

```bash
# npm/pnpm cache
-v ~/.npm:/home/pi/.npm
-v ~/.pnpm-store:/home/pi/.pnpm-store

# Custom configuration
-v ~/.package-installer-cli:/home/pi/.package-installer-cli
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `SHELL` | `/bin/bash` | Default shell |
| `PATH` | `/app/dist:$PATH` | Includes CLI in PATH |

## Port Exposure

The image exposes common development ports:
- `3000` - React, Next.js
- `3001` - Alternative React port
- `8000` - Django, Python apps
- `8080` - Common HTTP port
- `5000` - Flask, general apps
- `4000` - Jekyll, Gatsby

Map ports when running generated projects:
```bash
docker run -it --rm \
  -v "$(pwd)":/home/pi/projects \
  -p 3000:3000 \
  0xshariq/package-installer-cli:latest
```

## Development Mode

### Using Docker Compose

```bash
# Start development environment
docker-compose --profile dev up

# Run specific commands
docker-compose --profile dev run --rm package-installer-dev create my-app
```

### Development Features
- Source code hot reload
- Development dependencies included
- Debugging capabilities
- Extended logging

## CI/CD Integration

### GitHub Actions

The repository includes automated Docker builds:

```yaml
# .github/workflows/docker.yml
- Multi-architecture builds (amd64, arm64)
- Automatic tagging (latest, version tags)
- Security scanning with Trivy
- Automated publishing to Docker Hub
```

### Manual Build

```bash
# Build production image
docker build -t 0xshariq/package-installer:latest .

# Build development image
docker build -f Dockerfile.dev -t 0xshariq/package-installer:dev .

# Multi-architecture build
docker buildx build --platform linux/amd64,linux/arm64 \
  -t 0xshariq/package-installer:latest --push .
```

## Troubleshooting

### Permission Issues

If you encounter permission issues:

```bash
# Check user in container
docker run --rm 0xshariq/package-installer:latest id

# Run as your user ID
docker run --rm --user $(id -u):$(id -g) \
  -v "$(pwd)":/home/pi/projects \
  0xshariq/package-installer:latest
```

### Git Authentication

For private repositories:

```bash
# SSH key method (recommended)
docker run -it --rm \
  -v "$(pwd)":/home/pi/projects \
  -v ~/.ssh:/home/pi/.ssh:ro \
  0xshariq/package-installer:latest

# Personal Access Token
docker run -it --rm \
  -v "$(pwd)":/home/pi/projects \
  -e GIT_TOKEN=your_token_here \
  0xshariq/package-installer:latest
```

### Network Issues

If you need custom network settings:

```bash
# Use host network
docker run --rm --network host \
  -v "$(pwd)":/home/pi/projects \
  0xshariq/package-installer:latest

# Custom DNS
docker run --rm --dns 8.8.8.8 \
  -v "$(pwd)":/home/pi/projects \
  0xshariq/package-installer:latest
```

## Best Practices

### 1. Use Specific Tags in Production

```bash
# Good - specific version
docker pull 0xshariq/package-installer:v3.2.0

# Avoid in production - latest tag
docker pull 0xshariq/package-installer:latest
```

### 2. Resource Limits

```bash
docker run --rm \
  --memory=1g \
  --cpus=2 \
  -v "$(pwd)":/home/pi/projects \
  0xshariq/package-installer:latest
```

### 3. Cleanup

```bash
# Remove unused images
docker image prune

# Remove all package-installer images
docker rmi $(docker images 0xshariq/package-installer -q)
```

## Integration Examples

### Makefile Integration

```makefile
.PHONY: pi-create pi-analyze pi-add

pi-create:
	docker run -it --rm \
		-v "$(PWD)":/home/pi/projects \
		-v ~/.gitconfig:/home/pi/.gitconfig:ro \
		-v ~/.ssh:/home/pi/.ssh:ro \
		0xshariq/package-installer:latest create $(PROJECT_NAME)

pi-analyze:
	docker run -it --rm \
		-v "$(PWD)":/home/pi/projects \
		0xshariq/package-installer:latest analyze

pi-add:
	docker run -it --rm \
		-v "$(PWD)":/home/pi/projects \
		0xshariq/package-installer:latest add $(FEATURE)
```

### Shell Script Wrapper

```bash
#!/bin/bash
# pi-wrapper.sh

DOCKER_IMAGE="0xshariq/package-installer:latest"
MOUNT_DIR="$(pwd)"

docker run -it --rm \
  -v "$MOUNT_DIR:/home/pi/projects" \
  -v ~/.gitconfig:/home/pi/.gitconfig:ro \
  -v ~/.ssh:/home/pi/.ssh:ro \
  "$DOCKER_IMAGE" "$@"
```

### VSCode DevContainer

```json
{
  "name": "Package Installer CLI",
  "image": "0xshariq/package-installer:latest",
  "workspaceFolder": "/home/pi/projects",
  "mounts": [
    "source=${localWorkspaceFolder},target=/home/pi/projects,type=bind",
    "source=${env:HOME}/.gitconfig,target=/home/pi/.gitconfig,type=bind,readonly",
    "source=${env:HOME}/.ssh,target=/home/pi/.ssh,type=bind,readonly"
  ],
  "postCreateCommand": "pi --version"
}
```

## Support

- **Docker Hub**: [0xshariq/package-installer](https://hub.docker.com/r/0xshariq/package-installer)
- **GitHub Issues**: [Report Docker-specific issues](https://github.com/0xshariq/package-installer-cli/issues)
- **Documentation**: [Main README](../README.md)