import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface ServerlessConfig {
  provider: 'aws' | 'azure' | 'gcp' | 'cloudflare';
  runtime: string;
  region: string;
  stage: string;
  service: string;
  framework: string;
}

export async function deployToServerless(): Promise<void> {
  console.log(chalk.blue('⚡ Starting Serverless Framework deployment...'));

  // Check if Serverless Framework is installed
  if (!isServerlessInstalled()) {
    console.log(chalk.red('❌ Serverless Framework is not installed.'));
    console.log(chalk.yellow('📥 Please install it from: https://www.serverless.com/framework/docs/getting-started'));
    console.log(chalk.gray('Installation command:'));
    console.log(chalk.gray('  npm install -g serverless'));
    return;
  }

  const config = await getServerlessConfig();
  
  try {
    await deployProject(config);
    console.log(chalk.green('✅ Successfully deployed with Serverless Framework!'));
  } catch (error) {
    console.log(chalk.red('❌ Deployment failed:'), error);
  }
}

function isServerlessInstalled(): boolean {
  try {
    execSync('serverless --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function getServerlessConfig(): Promise<ServerlessConfig> {
  console.log(chalk.blue('🔧 Configuring Serverless deployment...'));

  const framework = detectFramework();

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select cloud provider:',
      choices: [
        { name: 'AWS - Amazon Web Services', value: 'aws' },
        { name: 'Azure - Microsoft Azure', value: 'azure' },
        { name: 'GCP - Google Cloud Platform', value: 'gcp' },
        { name: 'Cloudflare - Cloudflare Workers', value: 'cloudflare' }
      ]
    },
    {
      type: 'input',
      name: 'service',
      message: 'Enter service name:',
      default: path.basename(process.cwd()),
      validate: (input: string) => input.trim().length > 0 || 'Service name is required'
    },
    {
      type: 'list',
      name: 'runtime',
      message: 'Select runtime:',
      choices: (answers) => {
        if (answers.provider === 'aws') {
          return [
            'nodejs18.x',
            'nodejs16.x',
            'python3.9',
            'python3.8',
            'java11',
            'dotnet6',
            'go1.x'
          ];
        } else if (answers.provider === 'azure') {
          return [
            'nodejs18',
            'nodejs16',
            'python3.9',
            'python3.8',
            'dotnet6'
          ];
        } else if (answers.provider === 'gcp') {
          return [
            'nodejs18',
            'nodejs16',
            'python39',
            'python38',
            'go119',
            'java11'
          ];
        } else {
          return ['javascript', 'typescript'];
        }
      }
    },
    {
      type: 'list',
      name: 'region',
      message: 'Select region:',
      choices: (answers) => {
        if (answers.provider === 'aws') {
          return [
            'us-east-1',
            'us-west-2',
            'eu-west-1',
            'ap-southeast-1',
            'ap-northeast-1'
          ];
        } else if (answers.provider === 'azure') {
          return [
            'East US',
            'West US 2',
            'West Europe',
            'Southeast Asia',
            'Japan East'
          ];
        } else if (answers.provider === 'gcp') {
          return [
            'us-central1',
            'us-east1',
            'europe-west1',
            'asia-southeast1',
            'asia-northeast1'
          ];
        } else {
          return ['global'];
        }
      }
    },
    {
      type: 'input',
      name: 'stage',
      message: 'Enter deployment stage:',
      default: 'dev',
      validate: (input: string) => input.trim().length > 0 || 'Stage is required'
    }
  ]);

  return { ...answers, framework };
}

function detectFramework(): string {
  if (!fs.existsSync('package.json')) return 'generic';
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps.next) return 'nextjs';
  if (deps.express) return 'express';
  if (deps.fastify) return 'fastify';
  if (deps.koa) return 'koa';
  if (deps.react) return 'react';
  if (deps.vue) return 'vue';
  
  return 'nodejs';
}

async function deployProject(config: ServerlessConfig): Promise<void> {
  console.log(chalk.blue(`📦 Deploying ${config.service} to ${config.provider}...`));

  // Create serverless.yml if it doesn't exist
  if (!fs.existsSync('serverless.yml') && !fs.existsSync('serverless.yaml')) {
    const serverlessConfig = generateServerlessConfig(config);
    fs.writeFileSync('serverless.yml', serverlessConfig);
    console.log(chalk.green('📄 Created serverless.yml'));
  }

  // Create handler file if it doesn't exist
  if (!fs.existsSync('handler.js') && !fs.existsSync('index.js') && config.framework === 'nodejs') {
    const handlerContent = generateHandlerFile(config);
    fs.writeFileSync('handler.js', handlerContent);
    console.log(chalk.green('📄 Created handler.js'));
  }

  // Install serverless plugins if needed
  await installPlugins(config);

  // Deploy the service
  console.log(chalk.blue('🚀 Deploying to cloud provider...'));
  execSync(`serverless deploy --stage ${config.stage}`, { stdio: 'inherit' });
}

function generateServerlessConfig(config: ServerlessConfig): string {
  const baseConfig = `service: ${config.service}

provider:
  name: ${config.provider}
  runtime: ${config.runtime}
  region: ${config.region}
  stage: \${opt:stage, '${config.stage}'}

functions:`;

  if (config.framework === 'express') {
    return baseConfig + `
  app:
    handler: handler.server
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-http
`;
  } else if (config.framework === 'nextjs') {
    return baseConfig + `
  nextjs:
    handler: handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
      - http:
          path: /
          method: ANY

plugins:
  - serverless-nextjs-plugin
`;
  } else {
    return baseConfig + `
  hello:
    handler: handler.hello
    events:
      - http:
          path: /hello
          method: get
          cors: true

  api:
    handler: handler.api
    events:
      - http:
          path: /api/{proxy+}
          method: ANY
          cors: true
`;
  }
}

function generateHandlerFile(config: ServerlessConfig): string {
  if (config.framework === 'express') {
    return `const serverless = require('serverless-http');
const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Serverless Express!',
    service: '${config.service}',
    stage: process.env.NODE_ENV || '${config.stage}'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports.server = serverless(app);
`;
  } else {
    return `'use strict';

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(
      {
        message: 'Hello from Serverless!',
        service: '${config.service}',
        stage: process.env.NODE_ENV || '${config.stage}',
        input: event,
      },
      null,
      2
    ),
  };
};

module.exports.api = async (event) => {
  const { httpMethod, path, pathParameters } = event;
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message: 'API endpoint',
      method: httpMethod,
      path: path,
      params: pathParameters,
      timestamp: new Date().toISOString()
    }),
  };
};
`;
  }
}

async function installPlugins(config: ServerlessConfig): Promise<void> {
  const plugins = [];

  if (config.framework === 'express') {
    plugins.push('serverless-http');
  } else if (config.framework === 'nextjs') {
    plugins.push('serverless-nextjs-plugin');
  }

  if (config.provider === 'aws') {
    plugins.push('serverless-offline');
  }

  if (plugins.length > 0) {
    console.log(chalk.blue('📦 Installing Serverless plugins...'));
    for (const plugin of plugins) {
      try {
        execSync(`npm install ${plugin}`, { stdio: 'inherit' });
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Failed to install ${plugin}, continuing...`));
      }
    }
  }
}
