/**
 * Multi-language dependency installer utility
 * Supports Node.js (npm/pnpm/yarn), Rust (cargo), Python (pip/poetry), Go, Ruby (gem/bundler), PHP (composer)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora, { Ora } from 'ora';

const execAsync = promisify(exec);

export interface DependencyInstaller {
  name: string;
  command: string;
  configFiles: string[];
  detectCommand?: string;
  priority: number;
}

export type SupportedLanguage = 'nodejs' | 'rust' | 'python' | 'go' | 'ruby' | 'php';

// Package managers for different languages
export const DEPENDENCY_INSTALLERS: Record<SupportedLanguage, DependencyInstaller[]> = {
  nodejs: [
    {
      name: 'pnpm',
      command: 'pnpm install',
      configFiles: ['pnpm-lock.yaml', 'pnpm-workspace.yaml'],
      detectCommand: 'pnpm --version',
      priority: 1
    },
    {
      name: 'yarn',
      command: 'yarn install',
      configFiles: ['yarn.lock', '.yarnrc.yml'],
      detectCommand: 'yarn --version',
      priority: 2
    },
    {
      name: 'npm',
      command: 'npm install',
      configFiles: ['package-lock.json'],
      detectCommand: 'npm --version',
      priority: 3
    }
  ],
  rust: [
    {
      name: 'cargo',
      command: 'cargo build',
      configFiles: ['Cargo.toml', 'Cargo.lock'],
      detectCommand: 'cargo --version',
      priority: 1
    }
  ],
  python: [
    {
      name: 'poetry',
      command: 'poetry install',
      configFiles: ['pyproject.toml', 'poetry.lock'],
      detectCommand: 'poetry --version',
      priority: 1
    },
    {
      name: 'pip',
      command: 'pip install -r requirements.txt',
      configFiles: ['requirements.txt', 'setup.py', 'pyproject.toml'],
      detectCommand: 'pip --version',
      priority: 2
    }
  ],
  go: [
    {
      name: 'go mod',
      command: 'go mod download',
      configFiles: ['go.mod', 'go.sum'],
      detectCommand: 'go version',
      priority: 1
    }
  ],
  ruby: [
    {
      name: 'bundler',
      command: 'bundle install',
      configFiles: ['Gemfile', 'Gemfile.lock'],
      detectCommand: 'bundle --version',
      priority: 1
    },
    {
      name: 'gem',
      command: 'gem install',
      configFiles: ['Gemfile'],
      detectCommand: 'gem --version',
      priority: 2
    }
  ],
  php: [
    {
      name: 'composer',
      command: 'composer install',
      configFiles: ['composer.json', 'composer.lock'],
      detectCommand: 'composer --version',
      priority: 1
    }
  ]
};

/**
 * Detect project language based on configuration files
 */
export async function detectProjectLanguage(projectPath: string): Promise<SupportedLanguage[]> {
  const detectedLanguages: SupportedLanguage[] = [];
  
  try {
    const files = await fs.readdir(projectPath);
    const fileSet = new Set(files);
    
    for (const [language, installers] of Object.entries(DEPENDENCY_INSTALLERS)) {
      for (const installer of installers) {
        const hasConfigFile = installer.configFiles.some(configFile => 
          fileSet.has(configFile)
        );
        
        if (hasConfigFile && !detectedLanguages.includes(language as SupportedLanguage)) {
          detectedLanguages.push(language as SupportedLanguage);
          break;
        }
      }
    }
    
    return detectedLanguages;
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  Could not detect project language: ${error}`));
    return [];
  }
}

/**
 * Check if a package manager is available
 */
async function isPackageManagerAvailable(installer: DependencyInstaller): Promise<boolean> {
  if (!installer.detectCommand) return true;
  
  try {
    await execAsync(installer.detectCommand, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the best available package manager for a language
 */
async function getBestPackageManager(language: SupportedLanguage, projectPath: string): Promise<DependencyInstaller | null> {
  const installers = DEPENDENCY_INSTALLERS[language];
  const availableInstallers: DependencyInstaller[] = [];
  
  // Check which installers are available and have config files
  for (const installer of installers) {
    const isAvailable = await isPackageManagerAvailable(installer);
    
    if (isAvailable) {
      const hasConfigFile = installer.configFiles.some(configFile => 
        fs.existsSync(path.join(projectPath, configFile))
      );
      
      if (hasConfigFile) {
        availableInstallers.push(installer);
      }
    }
  }
  
  // Return the installer with highest priority (lowest number)
  availableInstallers.sort((a, b) => a.priority - b.priority);
  return availableInstallers[0] || null;
}

/**
 * Install dependencies for a specific language
 */
async function installDependenciesForLanguage(
  language: SupportedLanguage, 
  projectPath: string,
  spinner: Ora
): Promise<boolean> {
  const packageManager = await getBestPackageManager(language, projectPath);
  
  if (!packageManager) {
    spinner.warn(chalk.yellow(`⚠️  No suitable package manager found for ${language}`));
    return false;
  }
  
  try {
    spinner.text = chalk.hex('#f39c12')(`Installing ${language} dependencies with ${packageManager.name}...`);
    
    await execAsync(packageManager.command, { 
      cwd: projectPath,
      timeout: 300000 // 5 minutes timeout
    });
    
    spinner.succeed(chalk.green(`✅ ${language} dependencies installed with ${packageManager.name}`));
    return true;
  } catch (error: any) {
    spinner.warn(chalk.yellow(`⚠️  Failed to install ${language} dependencies with ${packageManager.name}: ${error.message}`));
    return false;
  }
}

/**
 * Install dependencies for all detected languages in the project
 */
export async function installProjectDependencies(projectPath: string, projectName?: string, installMCP: boolean = true): Promise<void> {
  const detectedLanguages = await detectProjectLanguage(projectPath);
  
  if (detectedLanguages.length === 0) {
    console.log(chalk.hex('#ffa502')('ℹ️  No dependency files detected, skipping installation'));
    return;
  }
  
  console.log(chalk.hex('#00d2d3')(`🔍 Detected languages: ${detectedLanguages.map(l => chalk.bold(l)).join(', ')}`));
  
  const spinner = ora(chalk.hex('#f39c12')('📦 Preparing to install dependencies...')).start();
  
  let installationResults: { language: SupportedLanguage; success: boolean }[] = [];
  
  // Install dependencies for each detected language
  for (const language of detectedLanguages) {
    const success = await installDependenciesForLanguage(language, projectPath, spinner);
    installationResults.push({ language, success });
  }
  
  // Install GitHub MCP server for Node.js projects if requested
  if (installMCP && detectedLanguages.includes('nodejs')) {
    try {
      spinner.text = chalk.hex('#00d2d3')('Installing GitHub MCP server...');
      await installAdditionalPackages('nodejs', ['@0xshariq/github-mcp-server'], projectPath, false);
      spinner.succeed(chalk.green('✅ GitHub MCP server installed for git operations'));
    } catch (error) {
      spinner.warn(chalk.yellow('⚠️  Could not install GitHub MCP server'));
    }
  }
  
  // Summary of installation results
  const successfulInstalls = installationResults.filter(r => r.success);
  const failedInstalls = installationResults.filter(r => !r.success);
  
  if (successfulInstalls.length > 0) {
    console.log(chalk.green(`✅ Dependencies installed for: ${successfulInstalls.map(r => r.language).join(', ')}`));
  }
  
  if (failedInstalls.length > 0) {
    console.log(chalk.yellow(`⚠️  Manual installation needed for: ${failedInstalls.map(r => r.language).join(', ')}`));
    
    if (projectName) {
      console.log(chalk.hex('#95afc0')('💡 You can install them manually:'));
      console.log(chalk.hex('#95afc0')(`   cd ${projectName}`));
      
      for (const failed of failedInstalls) {
        const installers = DEPENDENCY_INSTALLERS[failed.language];
        if (installers.length > 0) {
          console.log(chalk.hex('#95afc0')(`   ${installers[0].command} # for ${failed.language}`));
        }
      }
    }
  }
}

/**
 * Install additional packages for a specific language
 */
export async function installAdditionalPackages(
  language: SupportedLanguage,
  packages: string[],
  projectPath: string,
  isDev: boolean = false
): Promise<void> {
  const packageManager = await getBestPackageManager(language, projectPath);
  
  if (!packageManager) {
    throw new Error(`No suitable package manager found for ${language}`);
  }
  
  let command = '';
  
  switch (language) {
    case 'nodejs':
      const devFlag = isDev ? '-D' : '';
      if (packageManager.name === 'pnpm') {
        command = `pnpm add ${devFlag} ${packages.join(' ')}`;
      } else if (packageManager.name === 'yarn') {
        command = `yarn add ${isDev ? '--dev' : ''} ${packages.join(' ')}`;
      } else {
        command = `npm install ${isDev ? '--save-dev' : '--save'} ${packages.join(' ')}`;
      }
      break;
      
    case 'rust':
      command = `cargo add ${packages.join(' ')}`;
      break;
      
    case 'python':
      if (packageManager.name === 'poetry') {
        command = `poetry add ${isDev ? '--group dev' : ''} ${packages.join(' ')}`;
      } else {
        command = `pip install ${packages.join(' ')}`;
      }
      break;
      
    case 'go':
      command = `go get ${packages.join(' ')}`;
      break;
      
    case 'ruby':
      // For Ruby, packages are usually added to Gemfile manually
      throw new Error('Ruby package installation requires manual Gemfile editing');
      
    case 'php':
      command = `composer require ${isDev ? '--dev' : ''} ${packages.join(' ')}`;
      break;
      
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
  
  const spinner = ora(chalk.hex('#f39c12')(`Installing ${packages.join(', ')} for ${language}...`)).start();
  
  try {
    await execAsync(command, { 
      cwd: projectPath,
      timeout: 120000 // 2 minutes timeout for individual packages
    });
    
    spinner.succeed(chalk.green(`✅ Installed ${packages.join(', ')} for ${language}`));
  } catch (error: any) {
    spinner.fail(chalk.red(`❌ Failed to install ${packages.join(', ')} for ${language}: ${error.message}`));
    throw error;
  }
}
