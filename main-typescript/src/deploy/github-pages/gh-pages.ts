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

export async function deployToGithubPages(): Promise<DeploymentResult> {
  try {
    console.log(chalk.cyan('📚 Starting GitHub Pages deployment...\n'));

    // Check if GitHub CLI is installed
    try {
      execSync('gh --version', { stdio: 'pipe' });
    } catch (error) {
      return {
        success: false,
        error: 'GitHub CLI not found. Please install GitHub CLI: https://cli.github.com/'
      };
    }

    // Check if user is authenticated
    try {
      execSync('gh auth status', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('🔐 Not authenticated with GitHub. Please login...'));
      try {
        execSync('gh auth login', { stdio: 'inherit' });
      } catch (loginError) {
        return {
          success: false,
          error: 'Failed to authenticate with GitHub'
        };
      }
    }

    // Check if we're in a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (error) {
      return {
        success: false,
        error: 'Not in a Git repository. Please initialize Git first: git init'
      };
    }

    // Get repository information
    let repoInfo;
    try {
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
      const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
      if (match) {
        repoInfo = { owner: match[1], repo: match[2] };
      }
    } catch (error) {
      // No remote origin, we'll create one
    }

    if (!repoInfo) {
      const { createRepo } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createRepo',
          message: 'No GitHub repository found. Create a new repository?',
          default: true
        }
      ]);

      if (!createRepo) {
        return {
          success: false,
          error: 'GitHub repository required for Pages deployment'
        };
      }

      const { repoName, isPrivate } = await inquirer.prompt([
        {
          type: 'input',
          name: 'repoName',
          message: 'Enter repository name:',
          default: path.basename(process.cwd()),
          validate: (input) => input.length > 0 || 'Repository name is required'
        },
        {
          type: 'confirm',
          name: 'isPrivate',
          message: 'Make repository private?',
          default: false
        }
      ]);

      console.log(chalk.cyan('📦 Creating GitHub repository...'));
      const visibility = isPrivate ? '--private' : '--public';
      execSync(`gh repo create ${repoName} ${visibility} --source=. --remote=origin --push`, { stdio: 'inherit' });
      
      repoInfo = { owner: execSync('gh api user --jq .login', { encoding: 'utf-8' }).trim(), repo: repoName };
    }

    // Choose deployment method
    const { deploymentMethod } = await inquirer.prompt([
      {
        type: 'list',
        name: 'deploymentMethod',
        message: 'Select deployment method:',
        choices: [
          { name: 'GitHub Actions (Recommended)', value: 'actions' },
          { name: 'Direct gh-pages branch', value: 'branch' },
          { name: 'Manual upload', value: 'manual' }
        ]
      }
    ]);

    switch (deploymentMethod) {
      case 'actions':
        return await deployWithActions(repoInfo);
      case 'branch':
        return await deployToBranch(repoInfo);
      case 'manual':
        return await deployManual(repoInfo);
      default:
        return {
          success: false,
          error: 'Invalid deployment method selected'
        };
    }

  } catch (error) {
    return {
      success: false,
      error: `GitHub Pages deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployWithActions(repoInfo: { owner: string; repo: string }): Promise<DeploymentResult> {
  try {
    const { framework, buildCommand, outputDir } = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Select your framework:',
        choices: [
          'react',
          'vue',
          'angular',
          'svelte',
          'nextjs',
          'nuxt',
          'static-html',
          'jekyll',
          'other'
        ]
      },
      {
        type: 'input',
        name: 'buildCommand',
        message: 'Enter build command:',
        default: 'npm run build'
      },
      {
        type: 'input',
        name: 'outputDir',
        message: 'Enter output directory:',
        default: 'dist'
      }
    ]);

    // Create GitHub Actions workflow
    const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
    fs.ensureDirSync(workflowsDir);

    const workflowContent = generateGitHubActionsWorkflow(framework, buildCommand, outputDir);
    const workflowPath = path.join(workflowsDir, 'deploy-pages.yml');
    
    fs.writeFileSync(workflowPath, workflowContent);
    console.log(chalk.green('✅ Created GitHub Actions workflow'));

    // Commit and push the workflow
    execSync('git add .github/workflows/deploy-pages.yml', { stdio: 'pipe' });
    execSync('git commit -m "Add GitHub Pages deployment workflow"', { stdio: 'pipe' });
    execSync('git push origin main', { stdio: 'inherit' });

    // Enable GitHub Pages
    console.log(chalk.cyan('🔧 Enabling GitHub Pages...'));
    try {
      execSync(`gh api repos/${repoInfo.owner}/${repoInfo.repo}/pages -X POST -f source='{"branch":"gh-pages","path":"/"}'`, { stdio: 'pipe' });
    } catch (error) {
      // Pages might already be enabled
    }

    console.log(chalk.green('✅ GitHub Pages deployment configured!'));
    console.log(chalk.blue('🚀 Workflow will run on next push to main branch'));

    return {
      success: true,
      url: `https://${repoInfo.owner}.github.io/${repoInfo.repo}`
    };

  } catch (error) {
    return {
      success: false,
      error: `GitHub Actions deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployToBranch(repoInfo: { owner: string; repo: string }): Promise<DeploymentResult> {
  try {
    const { buildDir } = await inquirer.prompt([
      {
        type: 'input',
        name: 'buildDir',
        message: 'Enter build directory:',
        default: 'dist'
      }
    ]);

    const buildPath = path.join(process.cwd(), buildDir);
    if (!fs.existsSync(buildPath)) {
      return {
        success: false,
        error: `Build directory "${buildDir}" not found. Please build your project first.`
      };
    }

    console.log(chalk.cyan('📦 Deploying to gh-pages branch...'));
    
    // Install gh-pages if not available (fallback method)
    try {
      execSync('npx gh-pages --version', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('Installing gh-pages...'));
      execSync('npm install -g gh-pages', { stdio: 'inherit' });
    }

    // Deploy using gh-pages
    execSync(`npx gh-pages -d ${buildDir}`, { stdio: 'inherit' });

    console.log(chalk.green('✅ Successfully deployed to GitHub Pages!'));

    return {
      success: true,
      url: `https://${repoInfo.owner}.github.io/${repoInfo.repo}`
    };

  } catch (error) {
    return {
      success: false,
      error: `Branch deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployManual(repoInfo: { owner: string; repo: string }): Promise<DeploymentResult> {
  console.log(chalk.yellow('📖 Manual deployment instructions:'));
  console.log(chalk.blue('1. Build your project'));
  console.log(chalk.blue('2. Go to GitHub repository settings'));
  console.log(chalk.blue('3. Navigate to Pages section'));
  console.log(chalk.blue('4. Select source branch (main or gh-pages)'));
  console.log(chalk.blue('5. Specify root directory or /docs folder'));
  
  return {
    success: true,
    url: `https://${repoInfo.owner}.github.io/${repoInfo.repo}`
  };
}

function generateGitHubActionsWorkflow(framework: string, buildCommand: string, outputDir: string): string {
  return `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: ${buildCommand}
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ${outputDir}

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
}