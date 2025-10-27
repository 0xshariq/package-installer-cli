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

export async function deployToVercel(): Promise<DeploymentResult> {
  try {
    console.log(chalk.cyan('🚀 Starting Vercel deployment...\n'));

    // Check if Vercel CLI is installed
    try {
      execSync('vercel --version', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.red('❌ Vercel CLI not found. Installing...'));
      try {
        execSync('npm install -g vercel', { stdio: 'inherit' });
      } catch (installError) {
        return {
          success: false,
          error: 'Failed to install Vercel CLI. Please install manually with: npm install -g vercel'
        };
      }
    }

    // Check if user is logged in
    try {
      execSync('vercel whoami', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('🔐 Not logged in to Vercel. Please authenticate...'));
      try {
        execSync('vercel login', { stdio: 'inherit' });
      } catch (loginError) {
        return {
          success: false,
          error: 'Failed to authenticate with Vercel'
        };
      }
    }

    // Check for vercel.json config
    const configPath = path.join(process.cwd(), 'vercel.json');
    if (!fs.existsSync(configPath)) {
      const { createConfig } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createConfig',
          message: 'No vercel.json found. Would you like to create one?',
          default: true
        }
      ]);

      if (createConfig) {
        const { framework } = await inquirer.prompt([
          {
            type: 'list',
            name: 'framework',
            message: 'Select your framework:',
            choices: [
              'nextjs',
              'react',
              'vue',
              'nuxt',
              'svelte',
              'angular',
              'static',
              'other'
            ]
          }
        ]);

        const config = {
          version: 2,
          framework: framework === 'other' ? undefined : framework,
          buildCommand: framework === 'static' ? undefined : 'npm run build',
          outputDirectory: framework === 'static' ? '.' : getOutputDirectory(framework)
        };

        fs.writeJsonSync(configPath, config, { spaces: 2 });
        console.log(chalk.green('✅ Created vercel.json configuration'));
      }
    }

    // Deploy using Vercel CLI
    console.log(chalk.cyan('📦 Deploying to Vercel...'));
    
    const deployProcess = spawn('vercel', ['--prod'], {
      stdio: 'inherit',
      shell: true
    });

    return new Promise((resolve) => {
      deployProcess.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('\n✅ Successfully deployed to Vercel!'));
          
          // Get deployment URL
          try {
            const output = execSync('vercel ls --meta url', { encoding: 'utf-8' });
            const url = output.trim().split('\n')[1]?.split(' ')[1];
            resolve({
              success: true,
              url: url || 'Check Vercel dashboard for URL'
            });
          } catch (error) {
            resolve({
              success: true,
              url: 'Check Vercel dashboard for URL'
            });
          }
        } else {
          resolve({
            success: false,
            error: `Vercel deployment failed with exit code ${code}`
          });
        }
      });

      deployProcess.on('error', (error) => {
        resolve({
          success: false,
          error: `Failed to start Vercel deployment: ${error.message}`
        });
      });
    });

  } catch (error) {
    return {
      success: false,
      error: `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

function getOutputDirectory(framework: string): string {
  switch (framework) {
    case 'nextjs':
      return '.next';
    case 'react':
      return 'build';
    case 'vue':
      return 'dist';
    case 'nuxt':
      return '.nuxt/output';
    case 'svelte':
      return 'build';
    case 'angular':
      return 'dist';
    default:
      return 'dist';
  }
}