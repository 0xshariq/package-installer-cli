import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface CloudFoundryConfig {
  apiEndpoint: string;
  org: string;
  space: string;
  appName: string;
  buildpack?: string;
  memory: string;
  instances: number;
  services: string[];
}

export async function deployToCloudFoundry(): Promise<void> {
  console.log(chalk.blue('☁️ Starting Cloud Foundry deployment...'));

  // Check if Cloud Foundry CLI is installed
  if (!isCfInstalled()) {
    console.log(chalk.red('❌ Cloud Foundry CLI is not installed.'));
    console.log(chalk.yellow('📥 Please install it from: https://docs.cloudfoundry.org/cf-cli/install-go-cli.html'));
    console.log(chalk.gray('Installation commands:'));
    console.log(chalk.gray('  # macOS'));
    console.log(chalk.gray('  brew install cloudfoundry/tap/cf-cli@8'));
    console.log(chalk.gray('  # Linux'));
    console.log(chalk.gray('  wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -'));
    console.log(chalk.gray('  echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list'));
    console.log(chalk.gray('  sudo apt-get update && sudo apt-get install cf8-cli'));
    console.log(chalk.gray('  # Windows'));
    console.log(chalk.gray('  Download from: https://github.com/cloudfoundry/cli/releases'));
    return;
  }

  // Check authentication
  if (!isCfAuthenticated()) {
    console.log(chalk.yellow('🔐 You need to authenticate with Cloud Foundry first.'));
    const config = await getCloudFoundryConfig();
    
    try {
      console.log(chalk.blue(`Logging in to ${config.apiEndpoint}...`));
      execSync(`cf login -a ${config.apiEndpoint}`, { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('❌ Authentication failed.'));
      return;
    }
  } else {
    const config = await getCloudFoundryConfig();
  }

  const config = await getCloudFoundryConfig();
  
  try {
    await deployProject(config);
    console.log(chalk.green('✅ Successfully deployed to Cloud Foundry!'));
  } catch (error) {
    console.log(chalk.red('❌ Deployment failed:'), error);
  }
}

function isCfInstalled(): boolean {
  try {
    execSync('cf --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isCfAuthenticated(): boolean {
  try {
    const result = execSync('cf target', { encoding: 'utf8', stdio: 'pipe' });
    return !result.includes('Not logged in');
  } catch {
    return false;
  }
}

async function getCloudFoundryConfig(): Promise<CloudFoundryConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'apiEndpoint',
      message: 'Select Cloud Foundry API endpoint:',
      choices: [
        { name: 'Pivotal Web Services', value: 'https://api.run.pivotal.io' },
        { name: 'IBM Cloud', value: 'https://api.ng.bluemix.net' },
        { name: 'SAP Cloud Platform', value: 'https://api.cf.sap.hana.ondemand.com' },
        { name: 'Custom', value: 'custom' }
      ]
    },
    {
      type: 'input',
      name: 'apiEndpoint',
      message: 'Enter custom API endpoint:',
      when: (answers) => answers.apiEndpoint === 'custom',
      validate: (input: string) => {
        if (!input.trim()) return 'API endpoint is required';
        if (!input.startsWith('https://')) return 'API endpoint must start with https://';
        return true;
      }
    },
    {
      type: 'input',
      name: 'org',
      message: 'Enter Cloud Foundry organization:',
      validate: (input: string) => input.trim().length > 0 || 'Organization is required'
    },
    {
      type: 'input',
      name: 'space',
      message: 'Enter Cloud Foundry space:',
      default: 'development',
      validate: (input: string) => input.trim().length > 0 || 'Space is required'
    },
    {
      type: 'input',
      name: 'appName',
      message: 'Enter application name:',
      default: path.basename(process.cwd()),
      validate: (input: string) => {
        if (!input.trim()) return 'App name is required';
        if (!/^[a-zA-Z0-9-]+$/.test(input)) {
          return 'App name can only contain letters, numbers, and hyphens';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'buildpack',
      message: 'Select buildpack:',
      choices: [
        { name: 'Auto-detect', value: '' },
        { name: 'Node.js', value: 'nodejs_buildpack' },
        { name: 'Python', value: 'python_buildpack' },
        { name: 'Java', value: 'java_buildpack' },
        { name: 'Ruby', value: 'ruby_buildpack' },
        { name: 'Go', value: 'go_buildpack' },
        { name: 'PHP', value: 'php_buildpack' },
        { name: 'Static', value: 'staticfile_buildpack' },
        { name: '.NET Core', value: 'dotnet_core_buildpack' }
      ]
    },
    {
      type: 'list',
      name: 'memory',
      message: 'Select memory limit:',
      choices: ['128M', '256M', '512M', '1G', '2G'],
      default: '512M'
    },
    {
      type: 'number',
      name: 'instances',
      message: 'Number of instances:',
      default: 1,
      validate: (input: number) => input > 0 || 'Must be at least 1 instance'
    },
    {
      type: 'checkbox',
      name: 'services',
      message: 'Select services to bind (optional):',
      choices: [
        { name: 'PostgreSQL Database', value: 'postgresql' },
        { name: 'MySQL Database', value: 'mysql' },
        { name: 'Redis Cache', value: 'redis' },
        { name: 'RabbitMQ', value: 'rabbitmq' },
        { name: 'Elasticsearch', value: 'elasticsearch' }
      ]
    }
  ]);

  return answers;
}

async function deployProject(config: CloudFoundryConfig): Promise<void> {
  console.log(chalk.blue('📦 Deploying to Cloud Foundry...'));

  // Target the org and space
  console.log(chalk.blue('🎯 Targeting organization and space...'));
  execSync(`cf target -o "${config.org}" -s "${config.space}"`, { stdio: 'inherit' });

  // Create manifest.yml
  await createManifest(config);

  // Create services if specified
  if (config.services.length > 0) {
    await createServices(config);
  }

  // Build the application if needed
  await buildApplication();

  // Push the application
  console.log(chalk.blue('🚀 Pushing application to Cloud Foundry...'));
  execSync('cf push', { stdio: 'inherit' });

  // Show app info
  console.log(chalk.green('📊 Application information:'));
  execSync(`cf app ${config.appName}`, { stdio: 'inherit' });
}

async function createManifest(config: CloudFoundryConfig): Promise<void> {
  const manifest = {
    version: 1,
    applications: [
      {
        name: config.appName,
        memory: config.memory,
        instances: config.instances,
        ...(config.buildpack && { buildpack: config.buildpack }),
        ...(config.services.length > 0 && { services: config.services }),
        env: {
          NODE_ENV: 'production'
        }
      }
    ]
  };

  // Detect framework-specific configurations
  const framework = detectFramework();
  const app = manifest.applications[0];

  switch (framework) {
    case 'nodejs':
    case 'nextjs':
    case 'react':
      if (!config.buildpack) {
        (app as any).buildpack = 'nodejs_buildpack';
      }
      break;
    case 'python':
      if (!config.buildpack) {
        (app as any).buildpack = 'python_buildpack';
      }
      break;
    case 'java':
      if (!config.buildpack) {
        (app as any).buildpack = 'java_buildpack';
      }
      break;
  }

  fs.writeFileSync('manifest.yml', `---
${JSON.stringify(manifest, null, 2).replace(/"/g, '').replace(/,/g, '')}`);
  
  console.log(chalk.green('📄 Created manifest.yml'));
}

async function createServices(config: CloudFoundryConfig): Promise<void> {
  console.log(chalk.blue('🔌 Creating and binding services...'));

  for (const service of config.services) {
    const serviceName = `${config.appName}-${service}`;
    
    try {
      let serviceCommand = '';
      
      switch (service) {
        case 'postgresql':
          serviceCommand = `cf create-service postgresql shared-psql ${serviceName}`;
          break;
        case 'mysql':
          serviceCommand = `cf create-service mysql shared-mysql ${serviceName}`;
          break;
        case 'redis':
          serviceCommand = `cf create-service redis shared-vm ${serviceName}`;
          break;
        case 'rabbitmq':
          serviceCommand = `cf create-service rabbitmq shared-vm ${serviceName}`;
          break;
        case 'elasticsearch':
          serviceCommand = `cf create-service elasticsearch shared-vm ${serviceName}`;
          break;
      }

      if (serviceCommand) {
        console.log(chalk.blue(`Creating ${service} service...`));
        execSync(serviceCommand, { stdio: 'inherit' });
      }
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Could not create ${service} service, it might already exist or the service plan might not be available.`));
    }
  }
}

async function buildApplication(): Promise<void> {
  const framework = detectFramework();

  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts?.build) {
      console.log(chalk.blue('🔨 Building application...'));
      execSync('npm run build', { stdio: 'inherit' });
    }
  }

  // Create Procfile if it doesn't exist
  if (!fs.existsSync('Procfile')) {
    const procfile = generateProcfile(framework);
    fs.writeFileSync('Procfile', procfile);
    console.log(chalk.green('📄 Created Procfile'));
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
    return 'nodejs';
  }
  
  if (fs.existsSync('requirements.txt') || fs.existsSync('setup.py')) return 'python';
  if (fs.existsSync('pom.xml') || fs.existsSync('build.gradle')) return 'java';
  if (fs.existsSync('Gemfile')) return 'ruby';
  if (fs.existsSync('go.mod')) return 'go';
  if (fs.existsSync('composer.json')) return 'php';
  
  return 'generic';
}

function generateProcfile(framework: string): string {
  switch (framework) {
    case 'nextjs':
      return 'web: npm start';
    case 'react':
      return 'web: npx serve -s build';
    case 'express':
    case 'nodejs':
      return 'web: node server.js';
    case 'python':
      return 'web: python app.py';
    case 'java':
      return 'web: java -jar target/*.jar';
    case 'ruby':
      return 'web: bundle exec ruby app.rb';
    case 'go':
      return 'web: ./main';
    case 'php':
      return 'web: php -S 0.0.0.0:$PORT -t public/';
    default:
      return 'web: npm start';
  }
}
