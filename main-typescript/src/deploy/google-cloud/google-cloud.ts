import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface GoogleCloudConfig {
  projectId: string;
  region: string;
  service: string;
  deploymentType: 'app-engine' | 'cloud-run' | 'cloud-functions' | 'firebase-hosting';
}

export async function deployToGoogleCloud(): Promise<void> {
  console.log(chalk.blue('🌐 Starting Google Cloud deployment...'));

  // Check if gcloud CLI is installed
  if (!isGcloudInstalled()) {
    console.log(chalk.red('❌ Google Cloud CLI (gcloud) is not installed.'));
    console.log(chalk.yellow('📥 Please install it from: https://cloud.google.com/sdk/docs/install'));
    console.log(chalk.gray('Installation commands:'));
    console.log(chalk.gray('  curl https://sdk.cloud.google.com | bash'));
    console.log(chalk.gray('  exec -l $SHELL'));
    console.log(chalk.gray('  gcloud init'));
    return;
  }

  // Check authentication
  if (!isGcloudAuthenticated()) {
    console.log(chalk.yellow('🔐 You need to authenticate with Google Cloud first.'));
    console.log(chalk.blue('Running: gcloud auth login'));
    try {
      execSync('gcloud auth login', { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('❌ Authentication failed.'));
      return;
    }
  }

  const config = await getGoogleCloudConfig();
  
  try {
    await deployProject(config);
    console.log(chalk.green('✅ Successfully deployed to Google Cloud!'));
  } catch (error) {
    console.log(chalk.red('❌ Deployment failed:'), error);
  }
}

function isGcloudInstalled(): boolean {
  try {
    execSync('gcloud --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isGcloudAuthenticated(): boolean {
  try {
    const result = execSync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', { encoding: 'utf8' });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

async function getGoogleCloudConfig(): Promise<GoogleCloudConfig> {
  // Get available projects
  let projects: string[] = [];
  try {
    const projectsOutput = execSync('gcloud projects list --format="value(projectId)"', { encoding: 'utf8' });
    projects = projectsOutput.trim().split('\n').filter(p => p);
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not fetch projects. You may need to create one.'));
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'deploymentType',
      message: 'Select Google Cloud deployment type:',
      choices: [
        { name: 'App Engine - Serverless platform for web apps', value: 'app-engine' },
        { name: 'Cloud Run - Containerized applications', value: 'cloud-run' },
        { name: 'Cloud Functions - Serverless functions', value: 'cloud-functions' },
        { name: 'Firebase Hosting - Web hosting', value: 'firebase-hosting' }
      ]
    },
    {
      type: projects.length > 0 ? 'list' : 'input',
      name: 'projectId',
      message: projects.length > 0 ? 'Select a Google Cloud project:' : 'Enter your Google Cloud project ID:',
      choices: projects.length > 0 ? projects : undefined,
      validate: (input: string) => input.trim().length > 0 || 'Project ID is required'
    },
    {
      type: 'list',
      name: 'region',
      message: 'Select a region:',
      choices: [
        'us-central1',
        'us-east1',
        'us-west1',
        'europe-west1',
        'asia-southeast1',
        'asia-northeast1'
      ]
    },
    {
      type: 'input',
      name: 'service',
      message: 'Enter service name:',
      default: 'my-app',
      validate: (input: string) => input.trim().length > 0 || 'Service name is required'
    }
  ]);

  return answers;
}

async function deployProject(config: GoogleCloudConfig): Promise<void> {
  console.log(chalk.blue(`📦 Deploying to ${config.deploymentType}...`));

  // Set the project
  execSync(`gcloud config set project ${config.projectId}`, { stdio: 'inherit' });

  switch (config.deploymentType) {
    case 'app-engine':
      await deployToAppEngine(config);
      break;
    case 'cloud-run':
      await deployToCloudRun(config);
      break;
    case 'cloud-functions':
      await deployToCloudFunctions(config);
      break;
    case 'firebase-hosting':
      await deployToFirebaseHosting(config);
      break;
  }
}

async function deployToAppEngine(config: GoogleCloudConfig): Promise<void> {
  // Create app.yaml if it doesn't exist
  if (!fs.existsSync('app.yaml')) {
    const appYaml = generateAppYaml();
    fs.writeFileSync('app.yaml', appYaml);
    console.log(chalk.green('📄 Created app.yaml'));
  }

  console.log(chalk.blue('🚀 Deploying to App Engine...'));
  execSync('gcloud app deploy', { stdio: 'inherit' });
}

async function deployToCloudRun(config: GoogleCloudConfig): Promise<void> {
  // Create Dockerfile if it doesn't exist
  if (!fs.existsSync('Dockerfile')) {
    const dockerfile = generateDockerfile();
    fs.writeFileSync('Dockerfile', dockerfile);
    console.log(chalk.green('📄 Created Dockerfile'));
  }

  console.log(chalk.blue('🔨 Building container image...'));
  execSync(`gcloud builds submit --tag gcr.io/${config.projectId}/${config.service}`, { stdio: 'inherit' });

  console.log(chalk.blue('🚀 Deploying to Cloud Run...'));
  execSync(`gcloud run deploy ${config.service} --image gcr.io/${config.projectId}/${config.service} --platform managed --region ${config.region} --allow-unauthenticated`, { stdio: 'inherit' });
}

async function deployToCloudFunctions(config: GoogleCloudConfig): Promise<void> {
  console.log(chalk.blue('🚀 Deploying to Cloud Functions...'));
  
  // Check if this is a Node.js project
  if (fs.existsSync('package.json')) {
    execSync(`gcloud functions deploy ${config.service} --runtime nodejs18 --trigger-http --allow-unauthenticated --region ${config.region}`, { stdio: 'inherit' });
  } else {
    console.log(chalk.yellow('⚠️  This appears to be a non-Node.js project. Please configure Cloud Functions manually.'));
  }
}

async function deployToFirebaseHosting(config: GoogleCloudConfig): Promise<void> {
  // Check if Firebase CLI is installed
  if (!isFirebaseInstalled()) {
    console.log(chalk.red('❌ Firebase CLI is not installed.'));
    console.log(chalk.yellow('📥 Installing Firebase CLI...'));
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
  }

  // Initialize Firebase if not already done
  if (!fs.existsSync('firebase.json')) {
    console.log(chalk.blue('🔧 Initializing Firebase...'));
    execSync('firebase init hosting', { stdio: 'inherit' });
  }

  console.log(chalk.blue('🚀 Deploying to Firebase Hosting...'));
  execSync(`firebase deploy --project ${config.projectId}`, { stdio: 'inherit' });
}

function isFirebaseInstalled(): boolean {
  try {
    execSync('firebase --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function generateAppYaml(): string {
  // Detect framework and generate appropriate app.yaml
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.dependencies?.next) {
      return `runtime: nodejs18

env_variables:
  NODE_ENV: production

automatic_scaling:
  min_instances: 0
  max_instances: 10
`;
    } else if (packageJson.dependencies?.react) {
      return `runtime: nodejs18

handlers:
- url: /static
  static_dir: build/static

- url: /(.*\\.(json|ico|js))$
  static_files: build/\\1
  upload: build/.*\\.(json|ico|js)$

- url: .*
  static_files: build/index.html
  upload: build/index.html
`;
    }
  }

  // Default app.yaml
  return `runtime: nodejs18

env_variables:
  NODE_ENV: production
`;
}

function generateDockerfile(): string {
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.dependencies?.next) {
      return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
`;
    } else if (packageJson.dependencies?.react) {
      return `FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
    }
  }

  // Default Dockerfile
  return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
`;
}
