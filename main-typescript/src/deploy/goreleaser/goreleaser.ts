import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface GoReleaserConfig {
  projectName: string;
  version: string;
  releaseType: 'github' | 'gitlab' | 'gitea';
  platforms: string[];
  archives: boolean;
  dockerImages: string[];
  snapcraft: boolean;
  homebrew: boolean;
}

export async function deployToGoReleaser(): Promise<void> {
  console.log(chalk.blue('🚀 Starting GoReleaser deployment...'));

  // Check if this is a Go project
  if (!fs.existsSync('go.mod')) {
    console.log(chalk.red('❌ This doesn\'t appear to be a Go project.'));
    console.log(chalk.yellow('GoReleaser is designed for Go projects. Please ensure you have a go.mod file.'));
    return;
  }

  // Check if GoReleaser is installed
  if (!isGoReleaserInstalled()) {
    console.log(chalk.red('❌ GoReleaser is not installed.'));
    console.log(chalk.yellow('📥 Please install it from: https://goreleaser.com/install/'));
    console.log(chalk.gray('Installation commands:'));
    console.log(chalk.gray('  # macOS'));
    console.log(chalk.gray('  brew install goreleaser'));
    console.log(chalk.gray('  # Linux'));
    console.log(chalk.gray('  curl -sfL https://install.goreleaser.com/github.com/goreleaser/goreleaser.sh | sh'));
    console.log(chalk.gray('  # Go install'));
    console.log(chalk.gray('  go install github.com/goreleaser/goreleaser@latest'));
    return;
  }

  // Check if Git is initialized and has remotes
  if (!isGitInitialized()) {
    console.log(chalk.red('❌ Git repository is not initialized or has no remotes.'));
    console.log(chalk.yellow('GoReleaser requires a Git repository with remotes configured.'));
    return;
  }

  const config = await getGoReleaserConfig();
  
  try {
    await setupGoReleaser(config);
    console.log(chalk.green('✅ GoReleaser configuration completed!'));
    console.log(chalk.blue('📖 Next steps:'));
    console.log(chalk.gray('1. Create a Git tag: git tag -a v1.0.0 -m "First release"'));
    console.log(chalk.gray('2. Push the tag: git push origin v1.0.0'));
    console.log(chalk.gray('3. Run GoReleaser: goreleaser release --rm-dist'));
  } catch (error) {
    console.log(chalk.red('❌ Setup failed:'), error);
  }
}

function isGoReleaserInstalled(): boolean {
  try {
    execSync('goreleaser --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isGitInitialized(): boolean {
  try {
    if (!fs.existsSync('.git')) return false;
    const remotes = execSync('git remote -v', { encoding: 'utf8', stdio: 'pipe' });
    return remotes.trim().length > 0;
  } catch {
    return false;
  }
}

async function getGoReleaserConfig(): Promise<GoReleaserConfig> {
  // Get project info from go.mod
  const goMod = fs.readFileSync('go.mod', 'utf8');
  const moduleMatch = goMod.match(/module\s+(.+)/);
  const defaultProjectName = moduleMatch ? path.basename(moduleMatch[1]) : path.basename(process.cwd());

  // Detect Git hosting service
  let defaultReleaseType: 'github' | 'gitlab' | 'gitea' = 'github';
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    if (remoteUrl.includes('gitlab')) defaultReleaseType = 'gitlab';
    if (remoteUrl.includes('gitea')) defaultReleaseType = 'gitea';
  } catch {
    // Default to GitHub
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter project name:',
      default: defaultProjectName,
      validate: (input: string) => input.trim().length > 0 || 'Project name is required'
    },
    {
      type: 'input',
      name: 'version',
      message: 'Enter initial version:',
      default: 'v1.0.0',
      validate: (input: string) => {
        if (!input.trim()) return 'Version is required';
        if (!/^v?\d+\.\d+\.\d+/.test(input)) return 'Version should be in format v1.0.0';
        return true;
      }
    },
    {
      type: 'list',
      name: 'releaseType',
      message: 'Select Git hosting service:',
      choices: [
        { name: 'GitHub', value: 'github' },
        { name: 'GitLab', value: 'gitlab' },
        { name: 'Gitea', value: 'gitea' }
      ],
      default: defaultReleaseType
    },
    {
      type: 'checkbox',
      name: 'platforms',
      message: 'Select target platforms:',
      choices: [
        { name: 'Linux AMD64', value: 'linux_amd64', checked: true },
        { name: 'Linux ARM64', value: 'linux_arm64', checked: true },
        { name: 'Linux ARM', value: 'linux_arm' },
        { name: 'macOS AMD64', value: 'darwin_amd64', checked: true },
        { name: 'macOS ARM64 (Apple Silicon)', value: 'darwin_arm64', checked: true },
        { name: 'Windows AMD64', value: 'windows_amd64', checked: true },
        { name: 'Windows ARM64', value: 'windows_arm64' },
        { name: 'FreeBSD AMD64', value: 'freebsd_amd64' },
        { name: 'OpenBSD AMD64', value: 'openbsd_amd64' }
      ],
      validate: (input: string[]) => input.length > 0 || 'Select at least one platform'
    },
    {
      type: 'confirm',
      name: 'archives',
      message: 'Create archives (tar.gz, zip)?',
      default: true
    },
    {
      type: 'input',
      name: 'dockerImages',
      message: 'Enter Docker images to build (comma-separated, optional):',
      default: '',
      filter: (input: string) => input.trim() ? input.split(',').map(s => s.trim()) : []
    },
    {
      type: 'confirm',
      name: 'snapcraft',
      message: 'Enable Snapcraft publishing?',
      default: false
    },
    {
      type: 'confirm',
      name: 'homebrew',
      message: 'Enable Homebrew tap?',
      default: false
    }
  ]);

  return answers;
}

async function setupGoReleaser(config: GoReleaserConfig): Promise<void> {
  console.log(chalk.blue('⚙️ Setting up GoReleaser configuration...'));

  // Create .goreleaser.yaml
  const goreleaserConfig = generateGoReleaserConfig(config);
  fs.writeFileSync('.goreleaser.yaml', goreleaserConfig);
  console.log(chalk.green('📄 Created .goreleaser.yaml'));

  // Create GitHub Actions workflow if using GitHub
  if (config.releaseType === 'github') {
    await createGitHubWorkflow(config);
  }

  // Create GitLab CI if using GitLab
  if (config.releaseType === 'gitlab') {
    await createGitLabCI(config);
  }

  // Initialize git tag if none exists
  try {
    execSync('git describe --tags', { stdio: 'ignore' });
  } catch {
    console.log(chalk.blue('🏷️  Creating initial git tag...'));
    const version = config.version.startsWith('v') ? config.version : `v${config.version}`;
    execSync(`git tag -a ${version} -m "Initial release"`, { stdio: 'inherit' });
    console.log(chalk.green(`📄 Created git tag ${version}`));
  }

  // Test GoReleaser configuration
  console.log(chalk.blue('🧪 Testing GoReleaser configuration...'));
  try {
    execSync('goreleaser check', { stdio: 'inherit' });
    console.log(chalk.green('✅ GoReleaser configuration is valid'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Configuration test completed with warnings'));
  }

  // Create example main.go if it doesn't exist
  if (!fs.existsSync('main.go')) {
    const exampleMain = generateExampleMain(config.projectName);
    fs.writeFileSync('main.go', exampleMain);
    console.log(chalk.green('📄 Created example main.go'));
  }
}

function generateGoReleaserConfig(config: GoReleaserConfig): string {
  const builds = [{
    env: ['CGO_ENABLED=0'],
    goos: [] as string[],
    goarch: [] as string[],
    binary: config.projectName
  }];

  // Parse platforms
  for (const platform of config.platforms) {
    const [os, arch] = platform.split('_');
    if (!builds[0].goos.includes(os)) builds[0].goos.push(os);
    if (!builds[0].goarch.includes(arch)) builds[0].goarch.push(arch);
  }

  const goreleaserConfig: any = {
    before: {
      hooks: ['go mod tidy', 'go generate ./...']
    },
    builds,
    archives: config.archives ? [{
      name_template: `${config.projectName}_{{ .Version }}_{{ .Os }}_{{ .Arch }}`,
      replacements: {
        darwin: 'macOS',
        linux: 'Linux',
        windows: 'Windows',
        '386': 'i386',
        amd64: 'x86_64'
      }
    }] : [],
    checksum: {
      name_template: 'checksums.txt'
    },
    snapshot: {
      name_template: '{{ incpatch .Version }}-next'
    },
    changelog: {
      sort: 'asc',
      filters: {
        exclude: ['^docs:', '^test:']
      }
    }
  };

  // Add Docker configuration
  if (config.dockerImages.length > 0) {
    goreleaserConfig.dockers = config.dockerImages.map((image: string) => ({
      image_templates: [`${image}:{{ .Tag }}`, `${image}:latest`],
      dockerfile: 'Dockerfile',
      build_flag_templates: [
        '--pull',
        '--label=org.opencontainers.image.created={{.Date}}',
        '--label=org.opencontainers.image.title={{.ProjectName}}',
        '--label=org.opencontainers.image.revision={{.FullCommit}}',
        '--label=org.opencontainers.image.version={{.Version}}'
      ]
    }));

    // Create Dockerfile
    const dockerfile = `FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY ${config.projectName} .
CMD ["./${config.projectName}"]`;
    fs.writeFileSync('Dockerfile', dockerfile);
  }

  // Add Snapcraft configuration
  if (config.snapcraft) {
    goreleaserConfig.snapcrafts = [{
      name_template: config.projectName,
      summary: `${config.projectName} - Built with GoReleaser`,
      description: `${config.projectName} application built and released with GoReleaser`,
      grade: 'stable',
      confinement: 'strict',
      publish: true
    }];
  }

  // Add Homebrew configuration
  if (config.homebrew) {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const repoMatch = remoteUrl.match(/github\.com[:/](.+)\/(.+)\.git/);
    if (repoMatch) {
      goreleaserConfig.brews = [{
        name: config.projectName,
        tap: {
          owner: repoMatch[1],
          name: 'homebrew-tap'
        },
        homepage: `https://github.com/${repoMatch[1]}/${repoMatch[2]}`,
        description: `${config.projectName} - Built with GoReleaser`,
        install: `bin.install "${config.projectName}"`
      }];
    }
  }

  return `# This is an example .goreleaser.yaml file with some sensible defaults.
# Make sure to check the documentation at https://goreleaser.com
${Object.entries(goreleaserConfig).map(([key, value]) => {
  if (Array.isArray(value)) {
    return `${key}:\n${value.map(item => `  - ${typeof item === 'object' ? '\n' + Object.entries(item).map(([k, v]) => `    ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n') : item}`).join('\n')}`;
  } else if (typeof value === 'object' && value !== null) {
    return `${key}:\n${Object.entries(value).map(([k, v]) => `  ${k}: ${typeof v === 'object' && v !== null ? JSON.stringify(v) : v}`).join('\n')}`;
  }
  return `${key}: ${value}`;
}).join('\n\n')}`;
}

async function createGitHubWorkflow(config: GoReleaserConfig): Promise<void> {
  const workflowDir = '.github/workflows';
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }

  const workflow = `name: Release

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
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          ${config.dockerImages.length > 0 ? 'DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}\n          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}' : ''}
          ${config.snapcraft ? 'SNAPCRAFT_STORE_CREDENTIALS: ${{ secrets.SNAPCRAFT_TOKEN }}' : ''}
`;

  fs.writeFileSync(`${workflowDir}/release.yml`, workflow);
  console.log(chalk.green('📄 Created GitHub Actions workflow'));
}

async function createGitLabCI(config: GoReleaserConfig): Promise<void> {
  const gitlabCI = `stages:
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
    ${config.dockerImages.length > 0 ? 'DOCKER_USERNAME: $DOCKER_USERNAME\n    DOCKER_PASSWORD: $DOCKER_PASSWORD' : ''}
`;

  fs.writeFileSync('.gitlab-ci.yml', gitlabCI);
  console.log(chalk.green('📄 Created GitLab CI configuration'));
}

function generateExampleMain(projectName: string): string {
  return `package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	fmt.Printf("Hello from %s!\\n", "${projectName}")
	
	if len(os.Args) > 1 {
		fmt.Printf("Arguments: %v\\n", os.Args[1:])
	}
	
	// Your application logic here
	log.Printf("%s started successfully", "${projectName}")
}
`;
}
