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

export async function deployToDigitalOcean(): Promise<DeploymentResult> {
  try {
    console.log(chalk.cyan('🌊 Starting DigitalOcean deployment...\n'));

    // Check if doctl is installed
    try {
      execSync('doctl version', { stdio: 'pipe' });
    } catch (error) {
      return {
        success: false,
        error: 'DigitalOcean CLI (doctl) not found. Please install it: https://docs.digitalocean.com/reference/doctl/how-to/install/'
      };
    }

    // Check if user is authenticated
    try {
      execSync('doctl account get', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('🔐 Not authenticated with DigitalOcean. Please authenticate...'));
      console.log(chalk.blue('Run: doctl auth init'));
      return {
        success: false,
        error: 'DigitalOcean authentication required. Run "doctl auth init" to authenticate.'
      };
    }

    // Choose deployment type
    const { deploymentType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'deploymentType',
        message: 'Select DigitalOcean deployment type:',
        choices: [
          { name: 'App Platform (PaaS) - Recommended', value: 'app-platform' },
          { name: 'Container Registry + App Platform', value: 'container-registry' },
          { name: 'Droplet (VPS)', value: 'droplet' },
          { name: 'Kubernetes Cluster', value: 'kubernetes' }
        ]
      }
    ]);

    switch (deploymentType) {
      case 'app-platform':
        return await deployToAppPlatform();
      case 'container-registry':
        return await deployToContainerRegistry();
      case 'droplet':
        return await deployToDroplet();
      case 'kubernetes':
        return await deployToKubernetes();
      default:
        return {
          success: false,
          error: 'Invalid deployment type selected'
        };
    }

  } catch (error) {
    return {
      success: false,
      error: `DigitalOcean deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployToAppPlatform(): Promise<DeploymentResult> {
  try {
    const { appName, region, gitRepo } = await inquirer.prompt([
      {
        type: 'input',
        name: 'appName',
        message: 'Enter app name:',
        validate: (input: string) => input.length > 0 || 'App name is required'
      },
      {
        type: 'list',
        name: 'region',
        message: 'Select region:',
        choices: [
          'nyc1', 'nyc3', 'ams3', 'sfo3', 'sgp1', 'lon1', 'fra1', 'tor1', 'blr1'
        ]
      },
      {
        type: 'input',
        name: 'gitRepo',
        message: 'Enter Git repository URL (optional):',
        default: ''
      }
    ]);

    // Check for app.yaml spec file
    const specPath = path.join(process.cwd(), 'app.yaml');
    if (!fs.existsSync(specPath)) {
      const { createSpec } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createSpec',
          message: 'No app.yaml found. Would you like to create one?',
          default: true
        }
      ]);

      if (createSpec) {
        const { appType } = await inquirer.prompt([
          {
            type: 'list',
            name: 'appType',
            message: 'Select application type:',
            choices: [
              'static-site',
              'node.js',
              'python',
              'docker',
              'go'
            ]
          }
        ]);

        const specContent = generateAppSpec(appName, appType, gitRepo, region);
        fs.writeFileSync(specPath, specContent);
        console.log(chalk.green('✅ Created app.yaml specification'));
      }
    }

    console.log(chalk.cyan('🚀 Creating DigitalOcean App...'));
    
    if (fs.existsSync(specPath)) {
      execSync(`doctl apps create --spec ${specPath}`, { stdio: 'inherit' });
    } else {
      // Create app without spec file
      const createCommand = `doctl apps create --no-spec --name ${appName} --region ${region}`;
      execSync(createCommand, { stdio: 'inherit' });
    }

    console.log(chalk.green('✅ Successfully created DigitalOcean App!'));
    
    // Get app URL
    try {
      const output = execSync(`doctl apps list --format Name,DefaultIngress --no-header | grep ${appName}`, { encoding: 'utf-8' });
      const url = output.split(/\s+/)[1];
      return {
        success: true,
        url: url || `Check DigitalOcean dashboard for ${appName} URL`
      };
    } catch (error) {
      return {
        success: true,
        url: `Check DigitalOcean dashboard for ${appName} URL`
      };
    }

  } catch (error) {
    return {
      success: false,
      error: `App Platform deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployToContainerRegistry(): Promise<DeploymentResult> {
  try {
    const { registryName, imageName, tag } = await inquirer.prompt([
      {
        type: 'input',
        name: 'registryName',
        message: 'Enter container registry name:',
        validate: (input: string) => input.length > 0 || 'Registry name is required'
      },
      {
        type: 'input',
        name: 'imageName',
        message: 'Enter image name:',
        default: path.basename(process.cwd())
      },
      {
        type: 'input',
        name: 'tag',
        message: 'Enter image tag:',
        default: 'latest'
      }
    ]);

    // Check for Dockerfile
    const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
    if (!fs.existsSync(dockerfilePath)) {
      return {
        success: false,
        error: 'Dockerfile not found. Container Registry deployment requires a Dockerfile.'
      };
    }

    console.log(chalk.cyan('🔨 Building Docker image...'));
    const fullImageName = `registry.digitalocean.com/${registryName}/${imageName}:${tag}`;
    execSync(`docker build -t ${fullImageName} .`, { stdio: 'inherit' });

    console.log(chalk.cyan('🔐 Logging in to DigitalOcean Container Registry...'));
    execSync(`doctl registry login`, { stdio: 'inherit' });

    console.log(chalk.cyan('📤 Pushing image to registry...'));
    execSync(`docker push ${fullImageName}`, { stdio: 'inherit' });

    console.log(chalk.green('✅ Successfully pushed to DigitalOcean Container Registry!'));

    return {
      success: true,
      url: `https://cloud.digitalocean.com/registry/${registryName}`
    };

  } catch (error) {
    return {
      success: false,
      error: `Container Registry deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployToDroplet(): Promise<DeploymentResult> {
  console.log(chalk.yellow('🚧 Droplet deployment requires manual setup...'));
  console.log(chalk.blue('Please use DigitalOcean dashboard to create and configure droplets.'));
  
  return {
    success: false,
    error: 'Droplet deployment not yet implemented. Use DigitalOcean dashboard or App Platform.'
  };
}

async function deployToKubernetes(): Promise<DeploymentResult> {
  console.log(chalk.yellow('🚧 Kubernetes deployment requires additional setup...'));
  console.log(chalk.blue('Please use doctl kubernetes cluster commands for K8s deployment.'));
  
  return {
    success: false,
    error: 'Kubernetes deployment not yet implemented. Use App Platform for simpler deployment.'
  };
}

function generateAppSpec(appName: string, appType: string, gitRepo: string, region: string): string {
  type Service = {
    name: string;
    source_dir: string;
    github?: { repo: string; branch: string };
    build_command?: string;
    output_dir?: string;
    run_command?: string;
    environment_slug?: string;
    dockerfile_path?: string;
    instance_count?: number;
    instance_size_slug?: string;
    routes: { path: string }[];
  };

  const baseSpec: {
    name: string;
    region: string;
    services: Service[];
  } = {
    name: appName,
    region: region,
    services: []
  };

  switch (appType) {
    case 'static-site':
      baseSpec.services = [{
        name: 'web',
        source_dir: '/',
        github: gitRepo ? {
          repo: gitRepo,
          branch: 'main'
        } : undefined,
        build_command: 'npm run build',
        output_dir: 'build',
        routes: [{
          path: '/'
        }]
      }];
      break;

    case 'node.js':
      baseSpec.services = [{
        name: 'api',
        source_dir: '/',
        github: gitRepo ? {
          repo: gitRepo,
          branch: 'main'
        } : undefined,
        build_command: 'npm install',
        run_command: 'npm start',
        environment_slug: 'node-js',
        instance_count: 1,
        instance_size_slug: 'basic-xxs',
        routes: [{
          path: '/'
        }]
      }];
      break;

    case 'python':
      baseSpec.services = [{
        name: 'api',
        source_dir: '/',
        github: gitRepo ? {
          repo: gitRepo,
          branch: 'main'
        } : undefined,
        build_command: 'pip install -r requirements.txt',
        run_command: 'python app.py',
        environment_slug: 'python',
        instance_count: 1,
        instance_size_slug: 'basic-xxs',
        routes: [{
          path: '/'
        }]
      }];
      break;

    case 'docker':
      baseSpec.services = [{
        name: 'web',
        source_dir: '/',
        github: gitRepo ? {
          repo: gitRepo,
          branch: 'main'
        } : undefined,
        dockerfile_path: 'Dockerfile',
        instance_count: 1,
        instance_size_slug: 'basic-xxs',
        routes: [{
          path: '/'
        }]
      }];
      break;

    default:
      baseSpec.services = [{
        name: 'web',
        source_dir: '/',
        github: gitRepo ? {
          repo: gitRepo,
          branch: 'main'
        } : undefined,
        build_command: 'echo "Configure your build command"',
        run_command: 'echo "Configure your run command"',
        routes: [{
          path: '/'
        }]
      }];
  }

  return `# DigitalOcean App Platform Specification
# Generated by Package Installer CLI

name: ${appName}
region: ${region}

services:
${baseSpec.services.map(service => `  - name: ${service.name}
    source_dir: ${service.source_dir}${service.github ? `
    github:
      repo: ${service.github.repo}
      branch: ${service.github.branch}` : ''}${service.build_command ? `
    build_command: ${service.build_command}` : ''}${service.run_command ? `
    run_command: ${service.run_command}` : ''}${service.environment_slug ? `
    environment_slug: ${service.environment_slug}` : ''}${service.dockerfile_path ? `
    dockerfile_path: ${service.dockerfile_path}` : ''}${service.output_dir ? `
    output_dir: ${service.output_dir}` : ''}
    instance_count: ${service.instance_count || 1}
    instance_size_slug: ${service.instance_size_slug || 'basic-xxs'}
    routes:
      - path: /`).join('\n')}
`;
}
