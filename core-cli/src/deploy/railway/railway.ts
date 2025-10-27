import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface RailwayConfig {
  projectName: string;
  environment: string;
  buildCommand?: string;
  startCommand?: string;
  framework: string;
}

export async function deployToRailway(): Promise<void> {
  console.log(chalk.blue('🚂 Starting Railway deployment...'));

  // Check if Railway CLI is installed
  if (!isRailwayInstalled()) {
    console.log(chalk.red('❌ Railway CLI is not installed.'));
    console.log(chalk.yellow('📥 Please install it from: https://docs.railway.app/develop/cli'));
    console.log(chalk.gray('Installation commands:'));
    console.log(chalk.gray('  # macOS/Linux'));
    console.log(chalk.gray('  curl -fsSL https://railway.app/install.sh | sh'));
    console.log(chalk.gray('  # Windows'));
    console.log(chalk.gray('  iwr https://railway.app/install.ps1 | iex'));
    console.log(chalk.gray('  # npm'));
    console.log(chalk.gray('  npm install -g @railway/cli'));
    return;
  }

  // Check authentication
  if (!isRailwayAuthenticated()) {
    console.log(chalk.yellow('🔐 You need to authenticate with Railway first.'));
    console.log(chalk.blue('Running: railway login'));
    try {
      execSync('railway login', { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('❌ Authentication failed.'));
      return;
    }
  }

  const config = await getRailwayConfig();
  
  try {
    await deployProject(config);
    console.log(chalk.green('✅ Successfully deployed to Railway!'));
  } catch (error) {
    console.log(chalk.red('❌ Deployment failed:'), error);
  }
}

function isRailwayInstalled(): boolean {
  try {
    execSync('railway --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isRailwayAuthenticated(): boolean {
  try {
    execSync('railway whoami', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function getRailwayConfig(): Promise<RailwayConfig> {
  console.log(chalk.blue('🔧 Configuring Railway deployment...'));

  const framework = detectFramework();
  const defaultCommands = getDefaultCommands(framework);

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter project name:',  
      default: path.basename(process.cwd()),
      validate: (input: string) => input.trim().length > 0 || 'Project name is required'
    },
    {
      type: 'list',
      name: 'environment',
      message: 'Select environment:',
      choices: [
        { name: 'Production', value: 'production' },
        { name: 'Staging', value: 'staging' },
        { name: 'Development', value: 'development' }
      ]
    },
    {
      type: 'input',
      name: 'buildCommand',
      message: 'Enter build command (optional):',
      default: defaultCommands.build,
      when: () => defaultCommands.build !== undefined
    },
    {
      type: 'input',
      name: 'startCommand',
      message: 'Enter start command:',
      default: defaultCommands.start,
      validate: (input: string) => input.trim().length > 0 || 'Start command is required'
    }
  ]);

  return { ...answers, framework };
}

function detectFramework(): string {
  if (!fs.existsSync('package.json')) return 'generic';
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps.next) return 'nextjs';
  if (deps.react && deps['react-scripts']) return 'create-react-app';
  if (deps.react && deps.vite) return 'vite-react';
  if (deps.vue && deps.vite) return 'vite-vue';
  if (deps.express) return 'express';
  if (deps.fastify) return 'fastify';
  if (deps.nest) return 'nestjs';
  if (deps.nuxt) return 'nuxtjs';
  if (deps.svelte) return 'svelte';
  if (deps.gatsby) return 'gatsby';
  if (deps.remix) return 'remix';
  
  return 'nodejs';
}

function getDefaultCommands(framework: string): { build?: string; start: string } {
  switch (framework) {
    case 'nextjs':
      return { build: 'npm run build', start: 'npm start' };
    case 'create-react-app':
      return { build: 'npm run build', start: 'npx serve -s build' };
    case 'vite-react':
    case 'vite-vue':
      return { build: 'npm run build', start: 'npx serve -s dist' };
    case 'nuxtjs':
      return { build: 'npm run build', start: 'npm start' };
    case 'gatsby':
      return { build: 'npm run build', start: 'npx serve -s public' };
    case 'remix':
      return { build: 'npm run build', start: 'npm start' };
    case 'express':
    case 'fastify':
    case 'nestjs':
      return { start: 'npm start' };
    case 'svelte':
      return { build: 'npm run build', start: 'npx serve -s public' };
    default:
      return { start: 'npm start' };
  }
}

async function deployProject(config: RailwayConfig): Promise<void> {
  console.log(chalk.blue(`📦 Deploying ${config.projectName} to Railway...`));

  // Initialize Railway project if not exists
  if (!fs.existsSync('railway.json') && !fs.existsSync('.railway')) {
    console.log(chalk.blue('🔧 Initializing Railway project...'));
    execSync(`railway init ${config.projectName}`, { stdio: 'inherit' });
  }

  // Create or update railway.json configuration
  await createRailwayConfig(config);

  // Create Procfile if needed for specific frameworks
  await createProcfile(config);

  // Create Dockerfile if it doesn't exist and framework needs it
  if (shouldCreateDockerfile(config.framework) && !fs.existsSync('Dockerfile')) {
    const dockerfile = generateDockerfile(config);
    fs.writeFileSync('Dockerfile', dockerfile);
    console.log(chalk.green('📄 Created Dockerfile'));
  }

  // Set environment variables
  await setEnvironmentVariables(config);

  // Deploy the project
  console.log(chalk.blue('🚀 Deploying to Railway...'));
  execSync('railway up', { stdio: 'inherit' });

  // Get deployment URL
  try {
    const result = execSync('railway status', { encoding: 'utf8' });
    const urlMatch = result.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      console.log(chalk.green(`🌐 Deployed at: ${urlMatch[0]}`));
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not retrieve deployment URL'));
  }
}

async function createRailwayConfig(config: RailwayConfig): Promise<void> {
  const railwayConfig: any = {
    build: {},
    deploy: {}
  };

  if (config.buildCommand) {
    railwayConfig.build.command = config.buildCommand;
  }

  if (config.startCommand) {
    railwayConfig.deploy.startCommand = config.startCommand;
  }

  // Add framework-specific configurations
  if (config.framework === 'nextjs') {
    railwayConfig.build.watchPatterns = ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'];
  } else if (config.framework === 'create-react-app') {
    railwayConfig.deploy.staticFilesDirectory = 'build';
  }

  fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
  console.log(chalk.green('📄 Created railway.json'));
}

async function createProcfile(config: RailwayConfig): Promise<void> {
  if (config.framework === 'express' || config.framework === 'fastify' || config.framework === 'nestjs') {
    const procfileContent = `web: ${config.startCommand}`;
    fs.writeFileSync('Procfile', procfileContent);
    console.log(chalk.green('📄 Created Procfile'));
  }
}

function shouldCreateDockerfile(framework: string): boolean {
  return ['express', 'fastify', 'nestjs', 'nextjs'].includes(framework);
}

function generateDockerfile(config: RailwayConfig): string {
  const baseDockerfile = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
`;

  const startCmd = config.startCommand || 'npm start';
  
  if (config.buildCommand) {
    return baseDockerfile + `
RUN ${config.buildCommand}

EXPOSE 3000

CMD ${JSON.stringify(startCmd.split(' '))}
`;
  } else {
    return baseDockerfile + `
EXPOSE 3000

CMD ${JSON.stringify(startCmd.split(' '))}
`;
  }
}

async function setEnvironmentVariables(config: RailwayConfig): Promise<void> {
  // Set NODE_ENV based on environment
  const nodeEnv = config.environment === 'production' ? 'production' : 'development';
  
  try {
    execSync(`railway variables set NODE_ENV=${nodeEnv}`, { stdio: 'inherit' });
    console.log(chalk.green(`📄 Set NODE_ENV=${nodeEnv}`));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not set environment variables'));
  }

  // Check for .env file and suggest adding variables
  if (fs.existsSync('.env')) {
    console.log(chalk.blue('💡 Found .env file. You may want to add these variables to Railway:'));
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = envContent
      .split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => line.split('=')[0]);
    
    if (envVars.length > 0) {
      console.log(chalk.gray('Use: railway variables set KEY=value'));
      envVars.forEach(key => {
        console.log(chalk.gray(`  railway variables set ${key}=<value>`));
      });
    }
  }
}
