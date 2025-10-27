import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface FlyConfig {
  appName: string;
  region: string;
  vmSize: string;
  minMachines: number;
  maxMachines: number;
  httpService: boolean;
  internalPort: number;
}

export async function deployToFly(): Promise<void> {
  console.log(chalk.blue('🪂 Starting Fly.io deployment...'));

  // Check if Fly CLI is installed
  if (!isFlyInstalled()) {
    console.log(chalk.red('❌ Fly CLI is not installed.'));
    console.log(chalk.yellow('📥 Please install it from: https://fly.io/docs/hands-on/install-flyctl/'));
    console.log(chalk.gray('Installation commands:'));
    console.log(chalk.gray('  # macOS/Linux'));
    console.log(chalk.gray('  curl -L https://fly.io/install.sh | sh'));
    console.log(chalk.gray('  # Windows (PowerShell)'));
    console.log(chalk.gray('  powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"'));
    console.log(chalk.gray('  # Homebrew'));
    console.log(chalk.gray('  brew install flyctl'));
    return;
  }

  // Check authentication
  if (!isFlyAuthenticated()) {
    console.log(chalk.yellow('🔐 You need to authenticate with Fly.io first.'));
    console.log(chalk.blue('Running: fly auth login'));
    try {
      execSync('fly auth login', { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('❌ Authentication failed.'));
      return;
    }
  }

  const config = await getFlyConfig();
  
  try {
    await deployProject(config);
    console.log(chalk.green('✅ Successfully deployed to Fly.io!'));
  } catch (error) {
    console.log(chalk.red('❌ Deployment failed:'), error);
  }
}

function isFlyInstalled(): boolean {
  try {
    execSync('fly version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isFlyAuthenticated(): boolean {
  try {
    execSync('fly auth whoami', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function getFlyConfig(): Promise<FlyConfig> {
  // Get available regions
  let regions: Array<{ name: string; value: string }> = [
    { name: 'Ashburn, Virginia (US East)', value: 'iad' },
    { name: 'Los Angeles, California (US West)', value: 'lax' },
    { name: 'London, England (Europe)', value: 'lhr' },
    { name: 'Frankfurt, Germany (Europe)', value: 'fra' },
    { name: 'Singapore (Asia Pacific)', value: 'sin' },
    { name: 'Sydney, Australia (Asia Pacific)', value: 'syd' }
  ];

  try {
    const regionsOutput = execSync('fly platform regions', { encoding: 'utf8', stdio: 'pipe' });
    // Parse regions from CLI output if available
  } catch (error) {
    // Use default regions if CLI call fails
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'appName',
      message: 'Enter Fly.io app name:',
      default: path.basename(process.cwd()).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      validate: (input: string) => {
        if (!input.trim()) return 'App name is required';
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'App name must be lowercase and contain only letters, numbers, and hyphens';
        }
        if (input.length > 30) return 'App name must be 30 characters or less';
        return true;
      }
    },
    {
      type: 'list',
      name: 'region',
      message: 'Select primary region:',
      choices: regions,
      default: 'iad'
    },
    {
      type: 'list',
      name: 'vmSize',
      message: 'Select VM size:',
      choices: [
        { name: 'shared-cpu-1x (256MB RAM) - Free tier', value: 'shared-cpu-1x' },
        { name: 'shared-cpu-2x (512MB RAM)', value: 'shared-cpu-2x' },
        { name: 'shared-cpu-4x (1GB RAM)', value: 'shared-cpu-4x' },
        { name: 'shared-cpu-8x (2GB RAM)', value: 'shared-cpu-8x' },
        { name: 'performance-1x (2GB RAM)', value: 'performance-1x' },
        { name: 'performance-2x (4GB RAM)', value: 'performance-2x' }
      ],
      default: 'shared-cpu-1x'
    },
    {
      type: 'number',
      name: 'minMachines',
      message: 'Minimum number of machines:',
      default: 0,
      validate: (input: number) => input >= 0 || 'Must be 0 or greater'
    },
    {
      type: 'number',
      name: 'maxMachines',
      message: 'Maximum number of machines:',
      default: 1,
      validate: (input: number, answers: any) => {
        if (input < answers.minMachines) return 'Must be greater than or equal to minimum machines';
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'httpService',
      message: 'Enable HTTP service?',
      default: true
    },
    {
      type: 'number',
      name: 'internalPort',
      message: 'Internal port (port your app listens on):',
      default: detectPort(),
      validate: (input: number) => {
        if (input < 1 || input > 65535) return 'Port must be between 1 and 65535';
        return true;
      }
    }
  ]);

  return answers;
}

function detectPort(): number {
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for common framework ports
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.next) return 3000;
    if (deps.react && !deps.express) return 3000;
    if (deps.express) return 3000;
    if (deps.fastify) return 3000;
    if (deps.koa) return 3000;
  }
  
  if (fs.existsSync('requirements.txt') || fs.existsSync('app.py')) return 8000;
  if (fs.existsSync('Gemfile')) return 4567;
  if (fs.existsSync('go.mod')) return 8080;
  
  return 8080;
}

async function deployProject(config: FlyConfig): Promise<void> {
  console.log(chalk.blue('📦 Deploying to Fly.io...'));

  // Launch the app (creates app and fly.toml)
  console.log(chalk.blue('🚀 Launching Fly.io app...'));
  
  const launchCommand = [
    'fly launch',
    `--name ${config.appName}`,
    `--region ${config.region}`,
    `--vm-size ${config.vmSize}`,
    '--no-deploy', // Don't deploy immediately, we want to configure first
    '--generate-name=false'
  ].join(' ');

  try {
    execSync(launchCommand, { stdio: 'inherit' });
  } catch (error) {
    console.log(chalk.yellow('⚠️  App might already exist, continuing...'));
  }

  // Create or update fly.toml
  await createFlyConfig(config);

  // Create Dockerfile if it doesn't exist
  if (!fs.existsSync('Dockerfile')) {
    console.log(chalk.blue('🔧 Creating Dockerfile...'));
    const dockerfile = generateDockerfile();
    fs.writeFileSync('Dockerfile', dockerfile);
    console.log(chalk.green('📄 Created Dockerfile'));
  }

  // Create .dockerignore if it doesn't exist
  if (!fs.existsSync('.dockerignore')) {
    const dockerignore = generateDockerignore();
    fs.writeFileSync('.dockerignore', dockerignore);
    console.log(chalk.green('📄 Created .dockerignore'));
  }

  // Deploy the app
  console.log(chalk.blue('🚀 Deploying to Fly.io...'));
  execSync('fly deploy', { stdio: 'inherit' });

  // Show app status
  console.log(chalk.green('📊 App status:'));
  execSync(`fly status -a ${config.appName}`, { stdio: 'inherit' });

  // Open the app
  console.log(chalk.green('🌐 Opening app...'));
  execSync(`fly open -a ${config.appName}`, { stdio: 'inherit' });
}

async function createFlyConfig(config: FlyConfig): Promise<void> {
  const flyConfig = {
    app: config.appName,
    primary_region: config.region,
    
    build: {},
    
    http_service: config.httpService ? {
      internal_port: config.internalPort,
      force_https: true,
      auto_stop_machines: config.minMachines === 0,
      auto_start_machines: true,
      min_machines_running: config.minMachines,
      processes: ['app']
    } : undefined,

    vm: [
      {
        cpu_kind: config.vmSize.includes('performance') ? 'performance' : 'shared',
        cpus: parseInt(config.vmSize.split('-')[2]?.replace('x', '') || '1'),
        memory_mb: getMemoryFromVmSize(config.vmSize)
      }
    ],

    env: {
      NODE_ENV: 'production',
      PORT: config.internalPort.toString()
    }
  };

  // Add framework-specific configurations
  const framework = detectFramework();
  
  if (framework === 'nodejs' || framework === 'nextjs' || framework === 'react') {
    flyConfig.build = {
      builder: 'heroku/buildpacks:20'
    };
  }

  // Convert to TOML format
  const tomlContent = generateTOML(flyConfig);
  fs.writeFileSync('fly.toml', tomlContent);
  console.log(chalk.green('📄 Created/updated fly.toml'));
}

function getMemoryFromVmSize(vmSize: string): number {
  const sizeMap: Record<string, number> = {
    'shared-cpu-1x': 256,
    'shared-cpu-2x': 512,
    'shared-cpu-4x': 1024,
    'shared-cpu-8x': 2048,
    'performance-1x': 2048,
    'performance-2x': 4096,
    'performance-4x': 8192,
    'performance-8x': 16384
  };
  
  return sizeMap[vmSize] || 256;
}

function detectFramework(): string {
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.next) return 'nextjs';
    if (deps.react) return 'react';
    if (deps.express) return 'express';
    if (deps.fastify) return 'fastify';
    return 'nodejs';
  }
  
  if (fs.existsSync('requirements.txt') || fs.existsSync('app.py')) return 'python';
  if (fs.existsSync('Gemfile')) return 'ruby';
  if (fs.existsSync('go.mod')) return 'go';
  if (fs.existsSync('Cargo.toml')) return 'rust';
  
  return 'generic';
}

function generateDockerfile(): string {
  const framework = detectFramework();
  
  switch (framework) {
    case 'nodejs':
    case 'express':
    case 'fastify':
      return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]`;

    case 'nextjs':
      return `FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]`;

    case 'react':
      return `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

    case 'python':
      return `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]`;

    case 'go':
      return `FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.* ./
RUN go mod download

COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]`;

    case 'ruby':
      return `FROM ruby:3.2-alpine

WORKDIR /app

COPY Gemfile* ./
RUN bundle install

COPY . .

EXPOSE 4567

CMD ["ruby", "app.rb"]`;

    default:
      return `FROM node:18-alpine

WORKDIR /app

COPY . .

EXPOSE 8080

CMD ["npm", "start"]`;
  }
}

function generateDockerignore(): string {
  return `node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.vscode
.idea
*.log
.DS_Store
dist
build
.next
*.tgz
*.tar.gz`;
}

function generateTOML(config: any): string {
  let toml = '';
  
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) continue;
    
    if (typeof value === 'string') {
      toml += `${key} = "${value}"\n`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      toml += `${key} = ${value}\n`;
    } else if (Array.isArray(value)) {
      toml += `\n[[${key}]]\n`;
      for (const item of value) {
        if (typeof item === 'object') {
          for (const [subKey, subValue] of Object.entries(item)) {
            if (typeof subValue === 'string') {
              toml += `${subKey} = "${subValue}"\n`;
            } else {
              toml += `${subKey} = ${subValue}\n`;
            }
          }
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      toml += `\n[${key}]\n`;
      for (const [subKey, subValue] of Object.entries(value)) {
        if (Array.isArray(subValue)) {
          toml += `${subKey} = [${subValue.map(v => `"${v}"`).join(', ')}]\n`;
        } else if (typeof subValue === 'string') {
          toml += `${subKey} = "${subValue}"\n`;
        } else {
          toml += `${subKey} = ${subValue}\n`;
        }
      }
    }
  }
  
  return toml;
}