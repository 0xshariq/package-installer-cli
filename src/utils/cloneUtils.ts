import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { logError, logSuccess, showSuccessMessage } from './ui.js';
import { getFrameworkTheme } from './utils.js';

const execAsync = promisify(exec);

export async function cloneRepo(userRepo: string, projectName?: string): Promise<void> {
  try {
    // Validate GitHub repo format (user/repo)
    if (!userRepo.includes('/') || userRepo.split('/').length !== 2) {
      throw new Error('Invalid repository format. Use: user/repo (e.g., facebook/react)');
    }

    const [user, repo] = userRepo.split('/');
    if (!user || !repo) {
      throw new Error('Invalid repository format. Both user and repo names are required');
    }

    const targetDir = projectName || repo;
    const targetPath = path.resolve(process.cwd(), targetDir);

    // Check if directory already exists
    if (await fs.pathExists(targetPath)) {
      throw new Error(`Directory "${targetDir}" already exists. Please choose a different name.`);
    }

    console.log('\n' + chalk.hex('#00d2d3')('📦 Starting repository clone...'));
    console.log(`${chalk.hex('#ffa502')('Repository:')} ${chalk.hex('#00d2d3')(userRepo)}`);
    console.log(`${chalk.hex('#ffa502')('Target:')} ${chalk.hex('#95afc0')(targetDir)}`);
    
    const spinner = ora(chalk.hex('#00d2d3')('🔄 Cloning repository...')).start();

    try {
      // Use degit to clone the repository (cleaner than git clone)
      const degitCommand = `degit ${userRepo}`;
      await execAsync(`${degitCommand} ${targetDir}`, { 
        cwd: process.cwd()
      });

      spinner.succeed(chalk.hex('#10ac84')(`✅ Repository cloned successfully`));

      // Install dependencies if package.json exists
      await installDependenciesForClone(targetPath, targetDir);
      
      // Create .env file from templates
      await createEnvFile(targetPath);

      // Initialize git repository
      await initializeGitRepository(targetPath, targetDir);

      // Show success message
      showCloneSuccessMessage(targetDir, userRepo);

    } catch (error: any) {
      spinner.fail(chalk.red('Failed to clone repository'));
      
      if (error.message.includes('not found') || error.message.includes('404')) {
        throw new Error(`Repository ${userRepo} not found or is private`);
      } else {
        throw new Error(`Failed to clone repository: ${error.message}`);
      }
    }

  } catch (error: any) {
    logError('Clone failed', error);
    console.log('\n📝 Examples:');
    console.log('  pi clone facebook/react my-react-app');
    console.log('  pi clone vercel/next.js my-next-app');
    console.log('  pi create my-app facebook/react');
    throw error;
  }
}

async function createEnvFile(targetPath: string): Promise<void> {
  try {
    const envSpinner = ora(chalk.blue('Creating .env file...')).start();
    
    // Look for .env template files
    const envTemplateFiles = await fs.readdir(targetPath);
    const envTemplates = envTemplateFiles.filter(file => 
      file.startsWith('.env.') && file !== '.env'
    );

    if (envTemplates.length === 0) {
      envSpinner.info(chalk.gray('No .env template files found'));
      return;
    }

    // Collect all environment variables from template files
    const envVars = new Set<string>();

    for (const templateFile of envTemplates) {
      const templatePath = path.join(targetPath, templateFile);
      const content = await fs.readFile(templatePath, 'utf-8');
      
      // Extract variable names from template files
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key] = trimmedLine.split('=');
          if (key) {
            envVars.add(key.trim());
          }
        }
      }
    }

    if (envVars.size > 0) {
      // Create .env file with empty values
      const envContent = Array.from(envVars)
        .sort()
        .map(key => `${key}=`)
        .join('\n');

      const envPath = path.join(targetPath, '.env');
      await fs.writeFile(envPath, envContent + '\n');
      
      envSpinner.succeed(chalk.green(`Created .env file with ${envVars.size} variables`));
    } else {
      envSpinner.info(chalk.gray('No environment variables found in template files'));
    }

  } catch (error: any) {
    // Don't fail the whole process if .env creation fails
    console.log(chalk.yellow('⚠️  Could not create .env file automatically'));
  }
}

async function initializeGitRepository(targetPath: string, targetDir: string): Promise<void> {
  const gitSpinner = ora(chalk.hex('#00d2d3')('🔧 Initializing git repository...')).start();
  
  try {
    // Try to initialize git repository using MCP server commands first
    try {
      gitSpinner.text = chalk.hex('#00d2d3')('Initializing git with ginit...');
      await execAsync('ginit', { cwd: targetPath });
    } catch {
      gitSpinner.text = chalk.hex('#00d2d3')('Initializing git with git init...');
      await execAsync('git init', { cwd: targetPath });
    }
    
    // Add all files to git
    try {
      gitSpinner.text = chalk.hex('#00d2d3')('Adding files with gadd...');
      await execAsync('gadd', { cwd: targetPath });
    } catch {
      gitSpinner.text = chalk.hex('#00d2d3')('Adding files with git add...');
      await execAsync('git add .', { cwd: targetPath });
    }
    
    // Make initial commit
    try {
      gitSpinner.text = chalk.hex('#00d2d3')('Creating initial commit with gcommit...');
      await execAsync('gcommit "Initial Commit from Package Installer CLI"', { cwd: targetPath });
    } catch {
      gitSpinner.text = chalk.hex('#00d2d3')('Creating initial commit with git commit...');
      await execAsync('git commit -m "Initial Commit from Package Installer CLI - Cloned Repository"', { cwd: targetPath });
    }
    
    gitSpinner.succeed(chalk.hex('#10ac84')('✅ Git repository initialized with initial commit'));
    
  } catch (error: any) {
    gitSpinner.warn(chalk.hex('#ffa502')('⚠️  Could not initialize git repository automatically'));
    console.log(chalk.hex('#95afc0')('💡 You can initialize git manually:'));
    console.log(chalk.hex('#95afc0')(`   cd ${targetDir}`));
    console.log(chalk.hex('#95afc0')('   git init'));
    console.log(chalk.hex('#95afc0')('   git add .'));
    console.log(chalk.hex('#95afc0')('   git commit -m "Initial commit"'));
  }
}

async function installDependenciesForClone(projectPath: string, projectName: string): Promise<void> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!(await fs.pathExists(packageJsonPath))) {
    console.log(chalk.hex('#ffa502')('ℹ️  No package.json found, skipping dependency installation'));
    return;
  }

  const installSpinner = ora(chalk.hex('#f39c12')('📦 Installing dependencies...')).start();
  
  try {
    // Try pnpm first, then npm
    try {
      installSpinner.text = chalk.hex('#f39c12')('Installing dependencies with pnpm...');
      await execAsync('pnpm install', { 
        cwd: projectPath 
      });
      
      // Install GitHub MCP server
      installSpinner.text = chalk.hex('#00d2d3')('Installing GitHub MCP server...');
      await execAsync('pnpm add @0xshariq/github-mcp-server@latest', { 
        cwd: projectPath 
      });
      
      installSpinner.succeed(chalk.hex('#10ac84')('✅ Dependencies installed with pnpm'));
      
    } catch {
      installSpinner.text = chalk.hex('#f39c12')('Installing dependencies with npm...');
      await execAsync('npm install', { 
        cwd: projectPath 
      });
      
      // Install GitHub MCP server
      installSpinner.text = chalk.hex('#00d2d3')('Installing GitHub MCP server...');
      await execAsync('npm install @0xshariq/github-mcp-server@latest', { 
        cwd: projectPath 
      });
      
      installSpinner.succeed(chalk.hex('#10ac84')('✅ Dependencies installed with npm'));
    }
    
  } catch (installError: any) {
    installSpinner.warn(chalk.hex('#ffa502')('⚠️  Could not install dependencies automatically'));
    console.log(chalk.hex('#95afc0')('💡 You can install them manually:'));
    console.log(chalk.hex('#95afc0')(`   cd ${projectName} && npm install`));
  }
}

function showCloneSuccessMessage(projectName: string, githubRepo: string): void {
  console.log('\n' + chalk.hex('#10ac84')('✨ Repository cloned successfully!'));
  console.log('');
  console.log(chalk.hex('#00d2d3')('📁 Project Details:'));
  console.log(`   ${chalk.hex('#ffa502')('Repository:')} ${chalk.hex('#00d2d3')(githubRepo)}`);
  console.log(`   ${chalk.hex('#ffa502')('Project Name:')} ${chalk.hex('#9c88ff')(projectName)}`);
  console.log(`   ${chalk.hex('#ffa502')('Location:')} ${chalk.hex('#95afc0')(path.resolve(process.cwd(), projectName))}`);
  console.log('');
  console.log(chalk.hex('#00d2d3')('🚀 Next Steps:'));
  console.log(`   ${chalk.hex('#95afc0')('1.')} cd ${projectName}`);
  console.log(`   ${chalk.hex('#95afc0')('2.')} Read the README.md for project-specific instructions`);
  console.log(`   ${chalk.hex('#95afc0')('3.')} Start exploring and building! 🎉`);
  console.log('');
  console.log(chalk.hex('#ffa502')('💡 Pro Tip: Check package.json scripts for available commands'));
  console.log('');
}
