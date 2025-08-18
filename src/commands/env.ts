/**
 * Environment command - Analyze and manage development environment
 */

import chalk from 'chalk';
import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import { createBanner, displaySuccessMessage } from '../utils/dashboard.js';

/**
 * Display help for environment command
 */
export function showEnvironmentHelp(): void {
  console.clear();
  
  console.log(chalk.hex('#9c88ff')('🌍 ENVIRONMENT COMMAND HELP\n'));
  
  console.log(chalk.hex('#00d2d3')('Usage:'));
  console.log(chalk.white('  pkg-cli env [options]'));
  console.log(chalk.white('  pkg-cli environment [options]') + chalk.gray(' (alias)\n'));
  
  console.log(chalk.hex('#00d2d3')('Description:'));
  console.log(chalk.white('  Analyze development environment and check tool versions'));
  console.log(chalk.white('  Provides comprehensive overview of installed development tools\n'));
  
  console.log(chalk.hex('#00d2d3')('Options:'));
  console.log(chalk.white('  --check') + chalk.gray('        Check for missing or outdated tools'));
  console.log(chalk.white('  --versions') + chalk.gray('     Show versions of all detected tools'));
  console.log(chalk.white('  --paths') + chalk.gray('       Show installation paths'));
  console.log(chalk.white('  --export') + chalk.gray('      Export environment info to file'));
  console.log(chalk.white('  --minimal') + chalk.gray('     Show minimal environment info'));
  console.log(chalk.white('  -h, --help') + chalk.gray('     Show this help message\n'));
  
  console.log(chalk.hex('#00d2d3')('Examples:'));
  console.log(chalk.gray('  # Show complete environment info'));
  console.log(chalk.white('  pkg-cli env\n'));
  console.log(chalk.gray('  # Check for outdated tools'));
  console.log(chalk.white('  pkg-cli env --check\n'));
  console.log(chalk.gray('  # Export to file'));
  console.log(chalk.white('  pkg-cli env --export\n'));
}

/**
 * Main environment command function
 */
export async function environmentCommand(options: any = {}): Promise<void> {
  createBanner('Environment Analysis');
  
  try {
    const envInfo = await gatherEnvironmentInfo(options);
    
    if (options.minimal) {
      displayMinimalEnvInfo(envInfo);
    } else {
      displayFullEnvInfo(envInfo, options);
    }
    
    if (options.export) {
      await exportEnvironmentInfo(envInfo);
    }
    
    if (options.check) {
      performHealthCheck(envInfo);
    }
    
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to analyze environment: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Gather comprehensive environment information
 */
async function gatherEnvironmentInfo(options: any): Promise<any> {
  const envInfo: any = {
    system: {},
    nodejs: {},
    packageManagers: {},
    languages: {},
    tools: {},
    git: {},
    paths: {}
  };
  
  // System information
  envInfo.system = {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    hostname: os.hostname(),
    uptime: os.uptime(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpus: os.cpus().length,
    homeDir: os.homedir(),
    tmpDir: os.tmpdir()
  };
  
  // Node.js information
  envInfo.nodejs = await checkNodejs();
  
  // Package managers
  envInfo.packageManagers = await checkPackageManagers();
  
  // Programming languages
  envInfo.languages = await checkLanguages();
  
  // Development tools
  envInfo.tools = await checkDevelopmentTools();
  
  // Git information
  envInfo.git = await checkGit();
  
  // Environment paths
  if (options.paths) {
    envInfo.paths = getEnvironmentPaths();
  }
  
  return envInfo;
}

/**
 * Check Node.js installation and details
 */
async function checkNodejs(): Promise<any> {
  try {
    const version = process.version;
    const execPath = process.execPath;
    const platform = process.platform;
    const arch = process.arch;
    
    // Get npm version bundled with Node.js
    let npmVersion = 'Not found';
    try {
      npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    } catch (error) {
      // npm not available
    }
    
    return {
      version,
      execPath,
      platform,
      arch,
      bundledNpm: npmVersion,
      available: true
    };
  } catch (error) {
    return { available: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Check package manager availability and versions
 */
async function checkPackageManagers(): Promise<any> {
  const managers = ['npm', 'pnpm', 'yarn', 'bun'];
  const results: any = {};
  
  for (const manager of managers) {
    try {
      const version = execSync(`${manager} --version`, { 
        encoding: 'utf8', 
        timeout: 5000 
      }).trim();
      
      let location = 'Unknown';
      try {
        location = execSync(`which ${manager}`, { encoding: 'utf8' }).trim();
      } catch (error) {
        // which command failed
      }
      
      results[manager] = {
        available: true,
        version,
        location
      };
    } catch (error) {
      results[manager] = {
        available: false,
        error: 'Not installed'
      };
    }
  }
  
  return results;
}

/**
 * Check programming language installations
 */
async function checkLanguages(): Promise<any> {
  const languages = [
    { name: 'python', commands: ['python3 --version', 'python --version'] },
    { name: 'rust', commands: ['rustc --version'] },
    { name: 'go', commands: ['go version'] },
    { name: 'java', commands: ['java -version'] },
    { name: 'php', commands: ['php --version'] },
    { name: 'ruby', commands: ['ruby --version'] },
    { name: 'deno', commands: ['deno --version'] }
  ];
  
  const results: any = {};
  
  for (const lang of languages) {
    let found = false;
    
    for (const command of lang.commands) {
      try {
        const output = execSync(command, { 
          encoding: 'utf8', 
          timeout: 5000,
          stdio: ['ignore', 'pipe', 'pipe']
        }).trim();
        
        results[lang.name] = {
          available: true,
          version: output.split('\n')[0],
          command: command.split(' ')[0]
        };
        found = true;
        break;
      } catch (error) {
        // Try next command
      }
    }
    
    if (!found) {
      results[lang.name] = {
        available: false,
        error: 'Not installed'
      };
    }
  }
  
  return results;
}

/**
 * Check development tool availability
 */
async function checkDevelopmentTools(): Promise<any> {
  const tools = [
    'git', 'docker', 'docker-compose', 'kubectl', 
    'terraform', 'aws', 'gcloud', 'az',
    'code', 'vim', 'nano'
  ];
  
  const results: any = {};
  
  for (const tool of tools) {
    try {
      const version = execSync(`${tool} --version`, { 
        encoding: 'utf8', 
        timeout: 5000,
        stdio: ['ignore', 'pipe', 'pipe']
      }).trim();
      
      results[tool] = {
        available: true,
        version: version.split('\n')[0]
      };
    } catch (error) {
      // Try alternative version commands
      try {
        const version = execSync(`${tool} version`, { 
          encoding: 'utf8', 
          timeout: 5000,
          stdio: ['ignore', 'pipe', 'pipe']
        }).trim();
        
        results[tool] = {
          available: true,
          version: version.split('\n')[0]
        };
      } catch (error2) {
        results[tool] = {
          available: false,
          error: 'Not installed'
        };
      }
    }
  }
  
  return results;
}

/**
 * Check Git configuration
 */
async function checkGit(): Promise<any> {
  try {
    const version = execSync('git --version', { encoding: 'utf8' }).trim();
    
    let userName = 'Not configured';
    let userEmail = 'Not configured';
    
    try {
      userName = execSync('git config --global user.name', { encoding: 'utf8' }).trim();
    } catch (error) {
      // Not configured
    }
    
    try {
      userEmail = execSync('git config --global user.email', { encoding: 'utf8' }).trim();
    } catch (error) {
      // Not configured
    }
    
    return {
      available: true,
      version,
      userName,
      userEmail
    };
  } catch (error) {
    return {
      available: false,
      error: 'Git not installed'
    };
  }
}

/**
 * Get environment paths
 */
function getEnvironmentPaths(): any {
  return {
    PATH: process.env.PATH?.split(path.delimiter) || [],
    NODE_PATH: process.env.NODE_PATH || 'Not set',
    NPM_CONFIG_PREFIX: process.env.NPM_CONFIG_PREFIX || 'Not set',
    CARGO_HOME: process.env.CARGO_HOME || 'Not set',
    GOPATH: process.env.GOPATH || 'Not set',
    PYTHONPATH: process.env.PYTHONPATH || 'Not set'
  };
}

/**
 * Display minimal environment information
 */
function displayMinimalEnvInfo(envInfo: any): void {
  console.log(chalk.hex('#00d2d3')('💻 SYSTEM'));
  console.log(`${chalk.white('OS:')} ${envInfo.system.platform} ${envInfo.system.arch}`);
  console.log(`${chalk.white('Node.js:')} ${envInfo.nodejs.version || 'Not available'}`);
  
  const availableManagers = Object.entries(envInfo.packageManagers)
    .filter(([_, info]: [string, any]) => info.available)
    .map(([name, info]: [string, any]) => `${name}@${info.version}`)
    .join(', ');
  
  console.log(`${chalk.white('Package Managers:')} ${availableManagers || 'None'}`);
}

/**
 * Display full environment information
 */
function displayFullEnvInfo(envInfo: any, options: any): void {
  const Table = require('cli-table3');
  
  // System Information
  console.log(chalk.hex('#00d2d3')('💻 SYSTEM INFORMATION\n'));
  const systemTable = new Table({
    head: [chalk.hex('#00d2d3')('Property'), chalk.hex('#10ac84')('Value')],
    colWidths: [20, 50],
    style: { head: [], border: ['cyan'] }
  });
  
  systemTable.push(
    ['Platform', `${envInfo.system.platform} ${envInfo.system.arch}`],
    ['Release', envInfo.system.release],
    ['Hostname', envInfo.system.hostname],
    ['CPUs', envInfo.system.cpus],
    ['Memory', `${(envInfo.system.totalMemory / 1024 / 1024 / 1024).toFixed(1)} GB total`],
    ['Free Memory', `${(envInfo.system.freeMemory / 1024 / 1024 / 1024).toFixed(1)} GB`]
  );
  
  console.log(systemTable.toString());
  
  // Package Managers
  console.log(chalk.hex('#00d2d3')('\n📦 PACKAGE MANAGERS\n'));
  const pmTable = new Table({
    head: [chalk.hex('#00d2d3')('Manager'), chalk.hex('#10ac84')('Status'), chalk.hex('#ffa502')('Version')],
    colWidths: [15, 15, 30],
    style: { head: [], border: ['cyan'] }
  });
  
  Object.entries(envInfo.packageManagers).forEach(([name, info]: [string, any]) => {
    pmTable.push([
      name,
      info.available ? chalk.green('✓ Available') : chalk.red('✗ Not found'),
      info.available ? info.version : info.error
    ]);
  });
  
  console.log(pmTable.toString());
  
  // Programming Languages
  console.log(chalk.hex('#00d2d3')('\n🔧 PROGRAMMING LANGUAGES\n'));
  const langTable = new Table({
    head: [chalk.hex('#00d2d3')('Language'), chalk.hex('#10ac84')('Status'), chalk.hex('#ffa502')('Version')],
    colWidths: [15, 15, 40],
    style: { head: [], border: ['cyan'] }
  });
  
  Object.entries(envInfo.languages).forEach(([name, info]: [string, any]) => {
    langTable.push([
      name.charAt(0).toUpperCase() + name.slice(1),
      info.available ? chalk.green('✓ Available') : chalk.red('✗ Not found'),
      info.available ? info.version : info.error
    ]);
  });
  
  console.log(langTable.toString());
  
  // Git Configuration
  if (envInfo.git.available) {
    console.log(chalk.hex('#00d2d3')('\n🔀 GIT CONFIGURATION\n'));
    console.log(`${chalk.white('Version:')} ${envInfo.git.version}`);
    console.log(`${chalk.white('User Name:')} ${envInfo.git.userName}`);
    console.log(`${chalk.white('User Email:')} ${envInfo.git.userEmail}`);
  }
}

/**
 * Export environment information to file
 */
async function exportEnvironmentInfo(envInfo: any): Promise<void> {
  const exportData = {
    timestamp: new Date().toISOString(),
    environment: envInfo
  };
  
  const filename = `environment-info-${new Date().toISOString().split('T')[0]}.json`;
  const filepath = path.join(process.cwd(), filename);
  
  await fs.writeJson(filepath, exportData, { spaces: 2 });
  
  displaySuccessMessage(
    'Environment information exported!',
    [`Saved to: ${filename}`]
  );
}

/**
 * Perform health check and provide recommendations
 */
function performHealthCheck(envInfo: any): void {
  console.log(chalk.hex('#ffa502')('\n🏥 HEALTH CHECK RESULTS\n'));
  
  const recommendations: string[] = [];
  
  // Check Node.js version
  if (envInfo.nodejs.available) {
    const version = parseInt(envInfo.nodejs.version.replace('v', ''));
    if (version < 18) {
      recommendations.push('Consider upgrading Node.js to version 18+ for better performance and security');
    }
  } else {
    recommendations.push('Node.js is not available - required for JavaScript/TypeScript development');
  }
  
  // Check package managers
  const availableManagers = Object.values(envInfo.packageManagers).filter((pm: any) => pm.available).length;
  if (availableManagers === 0) {
    recommendations.push('No package managers found - install npm, pnpm, or yarn');
  }
  
  // Check Git configuration
  if (envInfo.git.available) {
    if (envInfo.git.userName === 'Not configured') {
      recommendations.push('Configure Git username: git config --global user.name "Your Name"');
    }
    if (envInfo.git.userEmail === 'Not configured') {
      recommendations.push('Configure Git email: git config --global user.email "your.email@example.com"');
    }
  } else {
    recommendations.push('Git is not installed - essential for version control');
  }
  
  if (recommendations.length === 0) {
    console.log(chalk.green('✅ Environment looks healthy!'));
  } else {
    console.log(chalk.yellow('⚠️  Recommendations:\n'));
    recommendations.forEach((rec, index) => {
      console.log(chalk.gray(`${index + 1}. ${rec}`));
    });
  }
}
