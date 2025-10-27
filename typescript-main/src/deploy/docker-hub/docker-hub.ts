import { execSync, spawn } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

export interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function deployToDockerHub(): Promise<DeploymentResult> {
  try {
    console.log(chalk.cyan('🐳 Starting Docker Hub deployment...\n'));

    // Check if Docker is installed
    try {
      execSync('docker --version', { stdio: 'pipe' });
    } catch (error) {
      return {
        success: false,
        error: 'Docker not found. Please install Docker: https://docs.docker.com/get-docker/'
      };
    }

    // Check if Docker daemon is running
    try {
      execSync('docker info', { stdio: 'pipe' });
    } catch (error) {
      return {
        success: false,
        error: 'Docker daemon is not running. Please start Docker and try again.'
      };
    }

    // Check if user is logged in to Docker Hub
    try {
      execSync('docker info | grep Username', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('🔐 Not logged in to Docker Hub. Please authenticate...'));
      try {
        execSync('docker login', { stdio: 'inherit' });
      } catch (loginError) {
        return {
          success: false,
          error: 'Failed to authenticate with Docker Hub'
        };
      }
    }

    // Check for Dockerfile
    const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
    if (!fs.existsSync(dockerfilePath)) {
      const { createDockerfile } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createDockerfile',
          message: 'No Dockerfile found. Would you like to create one?',
          default: true
        }
      ]);

      if (createDockerfile) {
        const { framework } = await inquirer.prompt([
          {
            type: 'list',
            name: 'framework',
            message: 'Select your application framework:',
            choices: [
              'node.js',
              'python',
              'react',
              'nextjs',
              'express',
              'nginx-static',
              'custom'
            ]
          }
        ]);

        const dockerfileContent = generateDockerfile(framework);
        fs.writeFileSync(dockerfilePath, dockerfileContent);
        console.log(chalk.green('✅ Created Dockerfile'));
      } else {
        return {
          success: false,
          error: 'Dockerfile is required for Docker Hub deployment'
        };
      }
    }

    // Get Docker Hub repository details
    const { username, repository, tag } = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Enter your Docker Hub username:',
        validate: (input: string) => input.length > 0 || 'Username is required'
      },
      {
        type: 'input',
        name: 'repository',
        message: 'Enter repository name:',
        default: path.basename(process.cwd()),
        validate: (input: string) => input.length > 0 || 'Repository name is required'
      },
      {
        type: 'input',
        name: 'tag',
        message: 'Enter image tag:',
        default: 'latest'
      }
    ]);

    const imageName = `${username}/${repository}:${tag}`;

    console.log(chalk.cyan('🔨 Building Docker image...'));
    try {
      execSync(`docker build -t ${imageName} .`, { stdio: 'inherit' });
    } catch (error) {
      return {
        success: false,
        error: 'Failed to build Docker image. Check your Dockerfile and try again.'
      };
    }

    console.log(chalk.cyan('📤 Pushing image to Docker Hub...'));
    try {
      execSync(`docker push ${imageName}`, { stdio: 'inherit' });
    } catch (error) {
      return {
        success: false,
        error: 'Failed to push image to Docker Hub. Check your credentials and try again.'
      };
    }

    console.log(chalk.green('✅ Successfully deployed to Docker Hub!'));
    return {
      success: true,
      url: `https://hub.docker.com/r/${username}/${repository}`
    };

  } catch (error) {
    return {
      success: false,
      error: `Docker Hub deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

function generateDockerfile(framework: string): string {
  switch (framework) {
    case 'node.js':
      return `# Node.js Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
`;

    case 'python':
      return `# Python Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

CMD ["python", "app.py"]
`;

    case 'react':
      return `# React Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`;

    case 'nextjs':
      return `# Next.js Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
`;

    case 'express':
      return `# Express.js Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
`;

    case 'nginx-static':
      return `# Static files with Nginx
FROM nginx:alpine

COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`;

    default:
      return `# Custom Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
`;
  }
}
