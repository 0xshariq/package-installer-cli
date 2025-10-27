# GoReleaser Deployment

Deliver Go binaries as fast and easily as possible using GoReleaser, the release automation tool for Go projects.

## Prerequisites

### 1. Go Project

Ensure you have a Go project with `go.mod`:

```bash
go mod init github.com/yourusername/yourproject
```

### 2. Install GoReleaser

This CLI will automatically install the goreleaser cli<br>
You don't have to manually install the goreleaser cli <br>
If any error occurs then you can install manually

**macOS:**
```bash
brew install goreleaser
```

**Linux:**
```bash
curl -sfL https://install.goreleaser.com/github.com/goreleaser/goreleaser.sh | sh
```

**Go Install:**
```bash
go install github.com/goreleaser/goreleaser@latest
```

### 3. Git Repository

GoReleaser requires a Git repository with remotes configured:

```bash
git init
git remote add origin https://github.com/yourusername/yourproject.git
```

## Usage

```bash
# Interactive setup
pi deploy --platform goreleaser

# Or directly
pi deploy -p goreleaser
```

## Setup Process

1. **Project Configuration**: Specify project name and version
2. **Git Hosting**: Select GitHub, GitLab, or Gitea
3. **Target Platforms**: Choose build targets (Linux, macOS, Windows, etc.)
4. **Archive Options**: Configure archive creation
5. **Docker Images**: Optional Docker image building
6. **Package Managers**: Snapcraft, Homebrew integration
7. **CI/CD Setup**: Automatic workflow generation

## Configuration Files

### .goreleaser.yaml
Main configuration file for GoReleaser.

```yaml
# This is an example .goreleaser.yaml file
before:
  hooks:
    - go mod tidy
    - go generate ./...

builds:
  - env:
      - CGO_ENABLED=0
    goos:
      - linux
      - windows
      - darwin
    goarch:
      - amd64
      - arm64
    binary: myapp

archives:
  - name_template: 'myapp_{{ .Version }}_{{ .Os }}_{{ .Arch }}'
    replacements:
      darwin: macOS
      linux: Linux
      windows: Windows
      386: i386
      amd64: x86_64

checksum:
  name_template: 'checksums.txt'

snapshot:
  name_template: "{{ incpatch .Version }}-next"

changelog:
  sort: asc
  filters:
    exclude:
      - '^docs:'
      - '^test:'
```

## Build Targets

### Operating Systems
- **linux**: Linux distributions
- **darwin**: macOS
- **windows**: Windows
- **freebsd**: FreeBSD
- **openbsd**: OpenBSD
- **netbsd**: NetBSD
- **dragonfly**: DragonFly BSD
- **plan9**: Plan 9
- **solaris**: Solaris

### Architectures
- **amd64**: x86-64
- **386**: x86
- **arm**: ARM
- **arm64**: ARM64
- **ppc64**: PowerPC 64-bit
- **ppc64le**: PowerPC 64-bit Little Endian
- **mips**: MIPS
- **mipsle**: MIPS Little Endian
- **mips64**: MIPS 64-bit
- **mips64le**: MIPS 64-bit Little Endian
- **s390x**: IBM System z
- **riscv64**: RISC-V 64-bit

## GitHub Integration

### GitHub Actions Workflow
Automatically created at `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - '*'

permissions:
  contents: write

jobs:
  goreleaser:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: stable
      
      - name: Run GoReleaser
        uses: goreleaser/goreleaser-action@v5
        with:
          distribution: goreleaser
          version: latest
          args: release --clean
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### GitHub Releases
GoReleaser automatically:
- Creates GitHub releases
- Uploads binaries and archives
- Generates changelog
- Creates checksums

## Docker Integration

### Configuration
```yaml
dockers:
  - image_templates:
      - 'myregistry/myapp:{{ .Tag }}'
      - 'myregistry/myapp:latest'
    dockerfile: Dockerfile
    build_flag_templates:
      - '--pull'
      - '--label=org.opencontainers.image.created={{.Date}}'
      - '--label=org.opencontainers.image.title={{.ProjectName}}'
      - '--label=org.opencontainers.image.revision={{.FullCommit}}'
      - '--label=org.opencontainers.image.version={{.Version}}'
```

### Dockerfile
```dockerfile
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY myapp .
CMD ["./myapp"]
```

## Package Managers

### Homebrew
```yaml
brews:
  - name: myapp
    tap:
      owner: yourusername
      name: homebrew-tap
    homepage: 'https://github.com/yourusername/myapp'
    description: 'My awesome Go application'
    install: |
      bin.install "myapp"
```

### Snapcraft
```yaml
snapcrafts:
  - name_template: 'myapp'
    summary: My awesome Go application
    description: |
      Longer description of my awesome Go application
      that spans multiple lines.
    grade: stable
    confinement: strict
    publish: true
```

### Scoop (Windows)
```yaml
scoops:
  - name: myapp
    bucket:
      owner: yourusername
      name: scoop-bucket
    homepage: 'https://github.com/yourusername/myapp'
    description: 'My awesome Go application'
```

## Release Process

### 1. Development
```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main
```

### 2. Tagging
```bash
# Create and push tag
git tag -a v1.0.0 -m "First release"
git push origin v1.0.0
```

### 3. Automatic Release
GoReleaser runs automatically via CI/CD and:
- Builds binaries for all targets
- Creates archives
- Builds Docker images (if configured)
- Updates package managers
- Creates GitHub release

### 4. Manual Release
```bash
# Test release (dry-run)
goreleaser release --snapshot --clean

# Create release
goreleaser release --clean
```

## Advanced Configuration

### Custom Build Options
```yaml
builds:
  - id: myapp
    main: ./cmd/myapp
    binary: myapp
    env:
      - CGO_ENABLED=0
    goos:
      - linux
      - darwin
      - windows
    goarch:
      - amd64
      - arm64
    ignore:
      - goos: windows
        goarch: arm64
    flags:
      - -trimpath
    ldflags:
      - -s -w
      - -X main.version={{.Version}}
      - -X main.commit={{.Commit}}
      - -X main.date={{.Date}}
```

### Multiple Binaries
```yaml
builds:
  - id: server
    main: ./cmd/server
    binary: server
    goos: [linux, darwin, windows]
    goarch: [amd64, arm64]
    
  - id: client
    main: ./cmd/client
    binary: client
    goos: [linux, darwin, windows]
    goarch: [amd64, arm64]
```

### Conditional Builds
```yaml
builds:
  - id: linux-only
    goos: [linux]
    goarch: [amd64]
    
  - id: cross-platform
    goos: [darwin, windows]
    goarch: [amd64, arm64]
```

## GitLab Integration

### .gitlab-ci.yml
```yaml
stages:
  - release

release:
  stage: release
  image: golang:1.21
  only:
    - tags
  script:
    - curl -sL https://git.io/goreleaser | bash
  variables:
    GITLAB_TOKEN: $GITLAB_TOKEN
```

## Environment Variables

### GitHub
- `GITHUB_TOKEN`: GitHub personal access token

### GitLab
- `GITLAB_TOKEN`: GitLab personal access token

### Docker
- `DOCKER_USERNAME`: Docker registry username
- `DOCKER_PASSWORD`: Docker registry password

### Snapcraft
- `SNAPCRAFT_STORE_CREDENTIALS`: Snapcraft credentials

## Commands

### Release Commands
```bash
# Check configuration
goreleaser check

# Build snapshot (no release)
goreleaser build --snapshot --clean

# Release snapshot (no Git tag required)
goreleaser release --snapshot --clean

# Full release
goreleaser release --clean

# Skip publish step
goreleaser release --skip-publish

# Continue on error
goreleaser release --continue-on-error
```

### Info Commands
```bash
# Show version
goreleaser --version

# Show help
goreleaser --help

# Show configuration schema
goreleaser jsonschema
```

## Hooks

### Before/After Hooks
```yaml
before:
  hooks:
    - go mod tidy
    - go generate ./...
    - make test

after:
  hooks:
    - make clean
```

## Changelog Generation

### Automatic Changelog
```yaml
changelog:
  sort: asc
  use: github
  filters:
    exclude:
      - '^docs:'
      - '^test:'
      - '^chore:'
  groups:
    - title: Features
      regexp: "^.*feat[(\\w)]*:+.*$"
      order: 0
    - title: 'Bug fixes'
      regexp: "^.*fix[(\\w)]*:+.*$"
      order: 1
    - title: Others
      order: 999
```

## Best Practices

1. **Use semantic versioning (v1.0.0)**
2. **Write meaningful commit messages**
3. **Test releases with --snapshot first**
4. **Use build flags for optimization**
5. **Include version information in binaries**
6. **Configure appropriate .gitignore**
7. **Use CI/CD for automated releases**
8. **Test on multiple platforms**
9. **Document release process**
10. **Monitor release pipeline**

## Troubleshooting

### Common Issues

1. **Git Tag Issues**
   ```bash
   # Check existing tags
   git tag -l
   
   # Delete tag locally and remotely
   git tag -d v1.0.0
   git push origin :refs/tags/v1.0.0
   ```

2. **Build Failures**
   ```bash
   # Test build locally
   goreleaser build --snapshot --clean
   
   # Check Go version
   go version
   ```

3. **Token Issues**
   ```bash
   # Check token permissions
   # Ensure GITHUB_TOKEN has repo access
   ```

## Getting Help

- GoReleaser Documentation: https://goreleaser.com/
- GitHub: https://github.com/goreleaser/goreleaser
- Discord: https://discord.gg/RGEBtg8
- Discussions: https://github.com/goreleaser/goreleaser/discussions
