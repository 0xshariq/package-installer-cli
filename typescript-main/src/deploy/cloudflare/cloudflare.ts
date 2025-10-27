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

export async function deployToCloudflare(): Promise<DeploymentResult> {
  try {
    console.log(chalk.cyan('☁️ Starting Cloudflare deployment...\n'));

    // Check if Wrangler CLI is installed
    try {
      execSync('wrangler --version', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.red('❌ Wrangler CLI not found. Installing...'));
      try {
        execSync('npm install -g wrangler', { stdio: 'inherit' });
      } catch (installError) {
        return {
          success: false,
          error: 'Failed to install Wrangler CLI. Please install manually with: npm install -g wrangler'
        };
      }
    }

    // Check if user is authenticated
    try {
      execSync('wrangler whoami', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('🔐 Not authenticated with Cloudflare. Please authenticate...'));
      try {
        execSync('wrangler login', { stdio: 'inherit' });
      } catch (loginError) {
        return {
          success: false,
          error: 'Failed to authenticate with Cloudflare'
        };
      }
    }

    // Choose deployment type
    const { deploymentType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'deploymentType',
        message: 'Select Cloudflare deployment type:',
        choices: [
          { name: 'Cloudflare Pages - Static sites', value: 'pages' },
          { name: 'Cloudflare Workers - Serverless functions', value: 'workers' },
          { name: 'Cloudflare Workers Sites - Full stack apps', value: 'workers-sites' }
        ]
      }
    ]);

    switch (deploymentType) {
      case 'pages':
        return await deployToPages();
      case 'workers':
        return await deployToWorkers();
      case 'workers-sites':
        return await deployToWorkersSites();
      default:
        return {
          success: false,
          error: 'Invalid deployment type selected'
        };
    }

  } catch (error) {
    return {
      success: false,
      error: `Cloudflare deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployToPages(): Promise<DeploymentResult> {
  try {
    const { projectName, buildDir, buildCommand } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter project name:',
        default: path.basename(process.cwd()),
        validate: (input: string) => input.length > 0 || 'Project name is required'
      },
      {
        type: 'input',
        name: 'buildDir',
        message: 'Enter build output directory:',
        default: 'dist'
      },
      {
        type: 'input',
        name: 'buildCommand',
        message: 'Enter build command:',
        default: 'npm run build'
      }
    ]);

    const buildPath = path.join(process.cwd(), buildDir);
    
    // Build the project if build command is provided
    if (buildCommand && buildCommand.trim() !== '') {
      console.log(chalk.cyan('🔨 Building project...'));
      try {
        execSync(buildCommand, { stdio: 'inherit' });
      } catch (error) {
        return {
          success: false,
          error: 'Build failed. Please fix build errors and try again.'
        };
      }
    }

    if (!fs.existsSync(buildPath)) {
      return {
        success: false,
        error: `Build directory "${buildDir}" not found. Please build your project first.`
      };
    }

    console.log(chalk.cyan('📤 Deploying to Cloudflare Pages...'));
    
    try {
      // Deploy using wrangler pages
      const deployCommand = `wrangler pages publish ${buildPath} --project-name=${projectName}`;
      const output = execSync(deployCommand, { encoding: 'utf-8', stdio: 'pipe' });
      
      // Extract URL from output
      const urlMatch = output.match(/https:\/\/[^\s]+\.pages\.dev/);
      const deployUrl = urlMatch ? urlMatch[0] : undefined;

      console.log(chalk.green('✅ Successfully deployed to Cloudflare Pages!'));

      return {
        success: true,
        url: deployUrl || `https://${projectName}.pages.dev`
      };

    } catch (error) {
      // Try alternative deployment method
      try {
        execSync(`wrangler pages deploy ${buildPath} --project-name=${projectName}`, { stdio: 'inherit' });
        console.log(chalk.green('✅ Successfully deployed to Cloudflare Pages!'));
        
        return {
          success: true,
          url: `https://${projectName}.pages.dev`
        };
      } catch (altError) {
        return {
          success: false,
          error: 'Failed to deploy to Cloudflare Pages. Check your build output and try again.'
        };
      }
    }

  } catch (error) {
    return {
      success: false,
      error: `Cloudflare Pages deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployToWorkers(): Promise<DeploymentResult> {
  try {
    // Check for wrangler.toml config
    const configPath = path.join(process.cwd(), 'wrangler.toml');
    if (!fs.existsSync(configPath)) {
      const { createConfig } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createConfig',
          message: 'No wrangler.toml found. Would you like to create one?',
          default: true
        }
      ]);

      if (createConfig) {
        const { workerName, workerType } = await inquirer.prompt([
          {
            type: 'input',
            name: 'workerName',
            message: 'Enter worker name:',
            default: path.basename(process.cwd()),
            validate: (input: string) => input.length > 0 || 'Worker name is required'
          },
          {
            type: 'list',
            name: 'workerType',
            message: 'Select worker type:',
            choices: [
              'javascript',
              'typescript',
              'module-worker'
            ]
          }
        ]);

        const configContent = generateWranglerConfig(workerName, workerType);
        fs.writeFileSync(configPath, configContent);
        console.log(chalk.green('✅ Created wrangler.toml configuration'));

        // Create sample worker file if it doesn't exist
        const workerFile = workerType === 'typescript' ? 'src/index.ts' : 'src/index.js';
        const workerPath = path.join(process.cwd(), workerFile);
        
        if (!fs.existsSync(workerPath)) {
          fs.ensureDirSync(path.dirname(workerPath));
          const workerContent = generateWorkerCode(workerType);
          fs.writeFileSync(workerPath, workerContent);
          console.log(chalk.green(`✅ Created sample worker file: ${workerFile}`));
        }
      } else {
        return {
          success: false,
          error: 'wrangler.toml configuration is required for Workers deployment'
        };
      }
    }

    console.log(chalk.cyan('🚀 Deploying Cloudflare Worker...'));
    
    try {
      const output = execSync('wrangler publish', { encoding: 'utf-8', stdio: 'pipe' });
      
      // Extract URL from output
      const urlMatch = output.match(/https:\/\/[^\s]+\.workers\.dev/) || 
                      output.match(/https:\/\/[^\s]+\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/);
      const deployUrl = urlMatch ? urlMatch[0] : undefined;

      console.log(chalk.green('✅ Successfully deployed Cloudflare Worker!'));

      return {
        success: true,
        url: deployUrl || 'Check Cloudflare Dashboard for worker URL'
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to deploy Cloudflare Worker. Check your wrangler.toml and worker code.'
      };
    }

  } catch (error) {
    return {
      success: false,
      error: `Cloudflare Workers deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployToWorkersSites(): Promise<DeploymentResult> {
  try {
    const { siteName, buildDir } = await inquirer.prompt([
      {
        type: 'input',
        name: 'siteName',
        message: 'Enter Workers Site name:',
        default: path.basename(process.cwd()),
        validate: (input: string) => input.length > 0 || 'Site name is required'
      },
      {
        type: 'input',
        name: 'buildDir',
        message: 'Enter static assets directory:',
        default: 'dist'
      }
    ]);

    // Check for wrangler.toml and create if needed
    const configPath = path.join(process.cwd(), 'wrangler.toml');
    if (!fs.existsSync(configPath)) {
      const configContent = generateWorkersSiteConfig(siteName, buildDir);
      fs.writeFileSync(configPath, configContent);
      console.log(chalk.green('✅ Created wrangler.toml for Workers Sites'));
    }

    const buildPath = path.join(process.cwd(), buildDir);
    if (!fs.existsSync(buildPath)) {
      return {
        success: false,
        error: `Static assets directory "${buildDir}" not found. Please build your project first.`
      };
    }

    console.log(chalk.cyan('🚀 Deploying Cloudflare Workers Site...'));
    
    try {
      const output = execSync('wrangler publish', { encoding: 'utf-8', stdio: 'pipe' });
      
      // Extract URL from output
      const urlMatch = output.match(/https:\/\/[^\s]+\.workers\.dev/) || 
                      output.match(/https:\/\/[^\s]+\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/);
      const deployUrl = urlMatch ? urlMatch[0] : undefined;

      console.log(chalk.green('✅ Successfully deployed Workers Site!'));

      return {
        success: true,
        url: deployUrl || 'Check Cloudflare Dashboard for site URL'
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to deploy Workers Site. Check your configuration and static assets.'
      };
    }

  } catch (error) {
    return {
      success: false,
      error: `Cloudflare Workers Sites deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

function generateWranglerConfig(workerName: string, workerType: string): string {
  const main = workerType === 'typescript' ? 'src/index.ts' : 'src/index.js';
  
  return `name = "${workerName}"
main = "${main}"
compatibility_date = "2023-10-01"

# Uncomment to configure environment variables
# [vars]
# MY_VAR = "production_value"

# Uncomment to configure KV namespace bindings
# [[kv_namespaces]]
# binding = "MY_KV_NAMESPACE"
# id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Uncomment to configure R2 bucket bindings
# [[r2_buckets]]
# binding = "MY_BUCKET"
# bucket_name = "my-bucket"
`;
}

function generateWorkerCode(workerType: string): string {
  if (workerType === 'typescript') {
    return `export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return new Response("Hello World from Cloudflare Worker!");
  },
};
`;
  } else {
    return `export default {
  async fetch(request, env, ctx) {
    return new Response("Hello World from Cloudflare Worker!");
  },
};
`;
  }
}

function generateWorkersSiteConfig(siteName: string, buildDir: string): string {
  return `name = "${siteName}"
main = "workers-site/index.js"
compatibility_date = "2023-10-01"

[site]
bucket = "./${buildDir}"
entry-point = "workers-site"

# Uncomment to configure environment variables
# [vars]
# MY_VAR = "production_value"
`;
}
