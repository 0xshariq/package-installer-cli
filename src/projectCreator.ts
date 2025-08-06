/**
 * Project creation and file operations
 */

import * as fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import cliSpinners from 'cli-spinners';

/**
 * Creates a styled progress spinner
 */
export function createSpinner(text: string, theme: any) {
  return ora({
    text: theme(text),
    spinner: cliSpinners.dots12,
    color: 'cyan'
  });
}

/**
 * Recursively copies template contents to the target directory
 */
export function copyTemplateContents(templateDir: string, targetPath: string): void {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
  
  for (const entry of fs.readdirSync(templateDir, { withFileTypes: true })) {
    const srcPath = path.join(templateDir, entry.name);
    const destPath = path.join(targetPath, entry.name);
    
    if (entry.isDirectory()) {
      copyTemplateContents(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const symlink = fs.readlinkSync(srcPath);
      fs.symlinkSync(symlink, destPath);
    } else {
      const data = fs.readFileSync(srcPath);
      fs.writeFileSync(destPath, data);
      try {
        const stat = fs.statSync(srcPath);
        fs.chmodSync(destPath, stat.mode);
      } catch {
        // Ignore permission errors
      }
    }
  }
}

/**
 * Installs project dependencies automatically
 */
export function installDependencies(targetPath: string, theme: any, framework?: string): boolean {
  // Check if it's a Rust project
  const isRustProject = framework === 'rust' || fs.existsSync(path.join(targetPath, 'Cargo.toml'));

  if (isRustProject) {
    return installRustDependencies(targetPath, theme);
  } else {
    return installNodeDependencies(targetPath, theme, framework);
  }
}

/**
 * Installs Rust dependencies
 */
function installRustDependencies(targetPath: string, theme: any): boolean {
  const cargoTomlPath = path.join(targetPath, 'Cargo.toml');
  if (!fs.existsSync(cargoTomlPath)) {
    console.log(chalk.yellow('⚠️  No Cargo.toml found, skipping dependency installation.'));
    return false;
  }

  console.log();
  const spinner = createSpinner('📦 Building Rust project (fetching dependencies)...', theme);
  spinner.start();

  try {
    execSync('cargo build', { cwd: targetPath, stdio: 'pipe' });
    spinner.succeed(theme('✨ Rust project built successfully! Dependencies fetched.'));
    return true;
  } catch (error) {
    spinner.warn(chalk.yellow('⚠️  Could not build Rust project automatically.'));
    console.log(chalk.gray('💡 Please run "cargo build" in your project directory to fetch dependencies.'));
    return false;
  }
}

/**
 * Installs Node.js dependencies
 */
function installNodeDependencies(targetPath: string, theme: any, framework?: string): boolean {
  // Check if it's a combination template (has both frontend and backend)
  const isCombinationTemplate = framework && framework.includes('+');
  const backendPath = path.join(targetPath, 'backend');
  const frontendPath = targetPath; // Frontend is in the root directory

  if (isCombinationTemplate && fs.existsSync(backendPath)) {
    return installFullStackDependencies(frontendPath, backendPath, theme);
  } else {
    return installSingleProjectDependencies(targetPath, theme);
  }
}

/**
 * Installs dependencies for full-stack projects
 */
function installFullStackDependencies(frontendPath: string, backendPath: string, theme: any): boolean {
  console.log();
  const spinner = createSpinner('📦 Installing dependencies for full-stack project...', theme);
  spinner.start();

  let allSucceeded = true;

  try {
    // Install frontend dependencies
    try {
      execSync('pnpm install', { cwd: frontendPath, stdio: 'pipe' });
      console.log(chalk.green('✅ Frontend dependencies installed with pnpm'));
    } catch {
      try {
        execSync('npm install', { cwd: frontendPath, stdio: 'pipe' });
        console.log(chalk.green('✅ Frontend dependencies installed with npm'));
      } catch {
        console.log(chalk.yellow('⚠️  Could not install frontend dependencies automatically.'));
        allSucceeded = false;
      }
    }

    // Install backend dependencies
    try {
      execSync('pnpm install', { cwd: backendPath, stdio: 'pipe' });
      console.log(chalk.green('✅ Backend dependencies installed with pnpm'));
    } catch {
      try {
        execSync('npm install', { cwd: backendPath, stdio: 'pipe' });
        console.log(chalk.green('✅ Backend dependencies installed with npm'));
      } catch {
        console.log(chalk.yellow('⚠️  Could not install backend dependencies automatically.'));
        allSucceeded = false;
      }
    }

    if (allSucceeded) {
      spinner.succeed(theme('✨ Full-stack project dependencies installed successfully!'));
      return true;
    } else {
      spinner.warn(chalk.yellow('⚠️  Some dependencies could not be installed automatically.'));
      console.log(chalk.gray('💡 Please run "npm install" or "pnpm install" in both frontend and backend directories.'));
      return false;
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to install dependencies.'));
    console.log(chalk.gray('💡 Please run "npm install" or "pnpm install" manually in both directories.'));
    return false;
  }
}

/**
 * Installs dependencies for single projects
 */
function installSingleProjectDependencies(targetPath: string, theme: any): boolean {
  const packageJsonPath = path.join(targetPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.yellow('⚠️  No package.json found, skipping dependency installation.'));
    return false;
  }

  console.log();
  const spinner = createSpinner('📦 Installing dependencies...', theme);
  spinner.start();

  try {
    // Try pnpm first, then npm
    try {
      execSync('pnpm install', { cwd: targetPath, stdio: 'pipe' });
      spinner.succeed(theme('✨ Dependencies installed with pnpm!'));
      return true;
    } catch {
      try {
        execSync('npm install', { cwd: targetPath, stdio: 'pipe' });
        spinner.succeed(theme('✨ Dependencies installed with npm!'));
        return true;
      } catch {
        spinner.warn(chalk.yellow('⚠️  Could not install dependencies automatically.'));
        console.log(chalk.gray('💡 Please run "npm install" or "pnpm install" in your project directory.'));
        return false;
      }
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to install dependencies.'));
    console.log(chalk.gray('💡 Please run "npm install" or "pnpm install" manually.'));
    return false;
  }
}
