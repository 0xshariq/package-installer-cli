import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface HerokuConfig {
  appName: string;
  stack: string;
  region: string;
  buildpack?: string;
  addons: string[];
}

export async function deployToHeroku(): Promise<void> {
  console.log(chalk.blue('⚡ Starting Heroku deployment...'));

  // Check if Heroku CLI is installed
  if (!isHerokuInstalled()) {
    console.log(chalk.red('❌ Heroku CLI is not installed.'));
    console.log(chalk.yellow('📥 Please install it from: https://devcenter.heroku.com/articles/heroku-cli'));
    console.log(chalk.gray('Installation commands:'));
    console.log(chalk.gray('  # macOS'));
    console.log(chalk.gray('  brew tap heroku/brew && brew install heroku'));
    console.log(chalk.gray('  # Ubuntu/Debian'));
    console.log(chalk.gray('  curl https://cli-assets.heroku.com/install-ubuntu.sh | sh'));
    console.log(chalk.gray('  # Windows'));
    console.log(chalk.gray('  Download from: https://cli-assets.heroku.com/heroku-x64.exe'));
    return;
  }

  // Check authentication
  if (!isHerokuAuthenticated()) {
    console.log(chalk.yellow('🔐 You need to authenticate with Heroku first.'));
    console.log(chalk.blue('Running: heroku login'));
    try {
      execSync('heroku login', { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('❌ Authentication failed.'));
      return;
    }
  }

  const config = await getHerokuConfig();
  
  try {
    await deployProject(config);
    console.log(chalk.green('✅ Successfully deployed to Heroku!'));
  } catch (error) {
    console.log(chalk.red('❌ Deployment failed:'), error);
  }
}

function isHerokuInstalled(): boolean {
  try {
    execSync('heroku --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isHerokuAuthenticated(): boolean {
  try {
    execSync('heroku auth:whoami', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function getHerokuConfig(): Promise<HerokuConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'appName',
      message: 'Enter Heroku app name (or leave blank for auto-generated):',
      validate: (input: string) => {
        if (!input.trim()) return true; // Allow empty for auto-generation
        if (!/^[a-z][a-z0-9-]{1,28}[a-z0-9]$/.test(input)) {
          return 'App name must be lowercase, start with a letter, and contain only letters, numbers, and dashes';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'stack',
      message: 'Select Heroku stack:',
      choices: [
        { name: 'heroku-22 (Ubuntu 22.04)', value: 'heroku-22' },
        { name: 'heroku-20 (Ubuntu 20.04)', value: 'heroku-20' },
        { name: 'container (Docker)', value: 'container' }
      ],
      default: 'heroku-22'
    },
    {
      type: 'list',
      name: 'region',
      message: 'Select region:',
      choices: [
        { name: 'United States', value: 'us' },
        { name: 'Europe', value: 'eu' }
      ],
      default: 'us'
    },
    {
      type: 'list',
      name: 'buildpack',
      message: 'Select buildpack (optional):',
      choices: [
        { name: 'Auto-detect', value: '' },
        { name: 'Node.js', value: 'heroku/nodejs' },
        { name: 'Python', value: 'heroku/python' },
        { name: 'Ruby', value: 'heroku/ruby' },
        { name: 'Java', value: 'heroku/java' },
        { name: 'Go', value: 'heroku/go' },
        { name: 'PHP', value: 'heroku/php' },
        { name: 'Scala', value: 'heroku/scala' }
      ]
    },
    {
      type: 'checkbox',
      name: 'addons',
      message: 'Select add-ons to provision:',
      choices: [
        { name: 'Heroku Postgres (Free)', value: 'heroku-postgresql:mini' },
        { name: 'Heroku Redis (Free)', value: 'heroku-redis:mini' },
        { name: 'Papertrail (Logging)', value: 'papertrail:choklad' },
        { name: 'New Relic (Monitoring)', value: 'newrelic:wayne' },
        { name: 'SendGrid (Email)', value: 'sendgrid:starter' }
      ]
    }
  ]);

  return answers;
}

async function deployProject(config: HerokuConfig): Promise<void> {
  console.log(chalk.blue('📦 Deploying to Heroku...'));

  // Initialize git if not already done
  if (!fs.existsSync('.git')) {
    console.log(chalk.blue('🔧 Initializing git repository...'));
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
  }

  // Create Heroku app
  let createCommand = `heroku create`;
  if (config.appName) {
    createCommand += ` ${config.appName}`;
  }
  createCommand += ` --stack ${config.stack} --region ${config.region}`;

  try {
    console.log(chalk.blue('🚀 Creating Heroku app...'));
    execSync(createCommand, { stdio: 'inherit' });
  } catch (error) {
    console.log(chalk.yellow('⚠️  App might already exist, continuing...'));
  }

  // Set buildpack if specified
  if (config.buildpack) {
    console.log(chalk.blue('🔧 Setting buildpack...'));
    execSync(`heroku buildpacks:set ${config.buildpack}`, { stdio: 'inherit' });
  }

  // Create necessary configuration files
  await createConfigurationFiles(config);

  // Add add-ons
  if (config.addons.length > 0) {
    console.log(chalk.blue('🔌 Adding Heroku add-ons...'));
    for (const addon of config.addons) {
      try {
        execSync(`heroku addons:create ${addon}`, { stdio: 'inherit' });
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Could not add ${addon}, continuing...`));
      }
    }
  }

  // Deploy to Heroku
  console.log(chalk.blue('🚀 Deploying to Heroku...'));
  execSync('git add .', { stdio: 'inherit' });
  try {
    execSync('git commit -m "Deploy to Heroku"', { stdio: 'inherit' });
  } catch (error) {
    console.log(chalk.yellow('⚠️  No changes to commit, continuing...'));
  }
  execSync('git push heroku main', { stdio: 'inherit' });

  // Open app
  console.log(chalk.green('🌐 Opening app in browser...'));
  execSync('heroku open', { stdio: 'inherit' });
}

async function createConfigurationFiles(config: HerokuConfig): Promise<void> {
  const framework = detectFramework();

  // Create Procfile
  if (!fs.existsSync('Procfile')) {
    const procfile = generateProcfile(framework);
    fs.writeFileSync('Procfile', procfile);
    console.log(chalk.green('📄 Created Procfile'));
  }

  // Create app.json for Heroku Button and Review Apps
  if (!fs.existsSync('app.json')) {
    const appJson = generateAppJson(config, framework);
    fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
    console.log(chalk.green('📄 Created app.json'));
  }

  // Create runtime.txt for Python
  if (framework === 'python' && !fs.existsSync('runtime.txt')) {
    fs.writeFileSync('runtime.txt', 'python-3.11.0');
    console.log(chalk.green('📄 Created runtime.txt'));
  }

  // Create requirements.txt for Python if it doesn't exist
  if (framework === 'python' && !fs.existsSync('requirements.txt') && !fs.existsSync('Pipfile')) {
    const requirements = `Flask==2.3.3
gunicorn==21.2.0`;
    fs.writeFileSync('requirements.txt', requirements);
    console.log(chalk.green('📄 Created requirements.txt'));
  }

  // Update package.json for Node.js
  if (framework === 'nodejs' && fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Ensure engines field exists
    if (!packageJson.engines) {
      packageJson.engines = {
        node: '>=18.0.0',
        npm: '>=8.0.0'
      };
    }

    // Ensure start script exists
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    if (!packageJson.scripts.start) {
      packageJson.scripts.start = 'node server.js';
    }

    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log(chalk.green('📄 Updated package.json'));
  }

  // Create Dockerfile for container stack
  if (config.stack === 'container' && !fs.existsSync('Dockerfile')) {
    const dockerfile = generateDockerfile(framework);
    fs.writeFileSync('Dockerfile', dockerfile);
    console.log(chalk.green('📄 Created Dockerfile'));
  }
}

function detectFramework(): string {
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.next) return 'nextjs';
    if (deps.react) return 'react';
    if (deps.express) return 'express';
    if (deps.vue) return 'vue';
    if (deps.angular) return 'angular';
    return 'nodejs';
  }
  
  if (fs.existsSync('requirements.txt') || fs.existsSync('Pipfile') || fs.existsSync('setup.py')) {
    return 'python';
  }
  
  if (fs.existsSync('Gemfile')) return 'ruby';
  if (fs.existsSync('pom.xml') || fs.existsSync('build.gradle')) return 'java';
  if (fs.existsSync('go.mod')) return 'go';
  if (fs.existsSync('composer.json')) return 'php';
  
  return 'generic';
}

function generateProcfile(framework: string): string {
  switch (framework) {
    case 'nextjs':
      return 'web: npm start';
    case 'react':
      return 'web: npx serve -s build -l $PORT';
    case 'express':
    case 'nodejs':
      return 'web: node server.js';
    case 'python':
      return 'web: gunicorn app:app';
    case 'ruby':
      return 'web: bundle exec ruby app.rb -p $PORT';
    case 'go':
      return 'web: ./main';
    case 'php':
      return 'web: vendor/bin/heroku-php-apache2 public/';
    default:
      return 'web: npm start';
  }
}

function generateAppJson(config: HerokuConfig, framework: string): any {
  const appJson: any = {
    name: config.appName || 'My App',
    description: 'Application deployed via Package Installer CLI',
    repository: 'https://github.com/yourusername/yourapp',
    logo: 'https://cdn.rawgit.com/heroku/node-js-getting-started/main/public/node.svg',
    keywords: ['node', 'express', framework],
    image: `heroku/${framework}`,
    stack: config.stack,
    env: {
      NODE_ENV: {
        description: 'Environment',
        value: 'production'
      }
    },
    formation: {
      web: {
        quantity: 1
      }
    },
    addons: config.addons.map(addon => addon.split(':')[0]),
    buildpacks: []
  };

  if (config.buildpack) {
    appJson.buildpacks.push({ url: config.buildpack });
  }

  return appJson;
}

function generateDockerfile(framework: string): string {
  switch (framework) {
    case 'nodejs':
    case 'nextjs':
    case 'react':
    case 'express':
      return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

${framework === 'nextjs' ? 'RUN npm run build' : ''}
${framework === 'react' ? 'RUN npm run build' : ''}

EXPOSE $PORT

CMD ["npm", "start"]`;

    case 'python':
      return `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE $PORT

CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "app:app"]`;

    case 'ruby':
      return `FROM ruby:3.2-slim

WORKDIR /app

COPY Gemfile* ./
RUN bundle install

COPY . .

EXPOSE $PORT

CMD ["ruby", "app.rb", "-p", "$PORT"]`;

    case 'go':
      return `FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE $PORT

CMD ["./main"]`;

    default:
      return `FROM node:18-alpine

WORKDIR /app

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]`;
  }
}
