/**
 * Clean command - Clean development artifacts and caches
 */

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { createBanner, displaySuccessMessage } from '../utils/dashboard.js';

/**
 * Display help for clean command
 */
export function showCleanHelp(): void {
  console.clear();
  
  console.log(chalk.hex('#9c88ff')('🧹 CLEAN COMMAND HELP\n'));
  
  console.log(chalk.hex('#00d2d3')('Usage:'));
  console.log(chalk.white('  pi clean [options]'));
  console.log(chalk.white('  pi cleanup [options]') + chalk.gray(' (alias)\n'));
  
  console.log(chalk.hex('#00d2d3')('Description:'));
  console.log(chalk.white('  Clean development artifacts, caches, and temporary files'));
  console.log(chalk.white('  Safely removes common build outputs and dependency caches\n'));
  
  console.log(chalk.hex('#00d2d3')('Options:'));
  console.log(chalk.white('  --node-modules') + chalk.gray('  Clean node_modules directories'));
  console.log(chalk.white('  --build') + chalk.gray('        Clean build/dist directories'));
  console.log(chalk.white('  --cache') + chalk.gray('       Clean package manager caches'));
  console.log(chalk.white('  --logs') + chalk.gray('        Clean log files'));
  console.log(chalk.white('  --all') + chalk.gray('         Clean everything (safe)'));
  console.log(chalk.white('  --deep') + chalk.gray('        Deep clean (includes lock files)'));
  console.log(chalk.white('  --dry-run') + chalk.gray('     Preview what would be cleaned'));
  console.log(chalk.white('  -h, --help') + chalk.gray('     Show this help message\n'));
  
  console.log(chalk.hex('#00d2d3')('Examples:'));
  console.log(chalk.gray('  # Clean build directories'));
  console.log(chalk.white('  pi clean --build\n'));
  console.log(chalk.gray('  # Clean node_modules'));
  console.log(chalk.white('  pi clean --node-modules\n'));
  console.log(chalk.gray('  # Preview clean operation'));
  console.log(chalk.white('  pi clean --all --dry-run\n'));
  console.log(chalk.gray('  # Deep clean with lock files'));
  console.log(chalk.white('  pi clean --deep\n'));
}

/**
 * Main clean command function
 */
export async function cleanCommand(options: any = {}): Promise<void> {
  // Blue gradient banner with "CLEANER" on next line
  console.clear();
  const banner = `
${chalk.bgHex('#00c6ff').hex('#fff').bold(' PROJECT ')}${chalk.bgHex('#0072ff').hex('#fff').bold(' CLEAN ')}
${chalk.bgHex('#00c6ff').hex('#fff').bold(' ER ')}
`;
  console.log(banner);
  
  const projectPath = process.cwd();
  const cleanTargets = determineCleanTargets(options);
  
  if (options.dryRun) {
    console.log(chalk.yellow('🔍 DRY RUN - Showing what would be cleaned:\n'));
  }
  
  const spinner = ora(chalk.hex('#9c88ff')('🧹 Cleaning project...')).start();
  
  try {
    let totalCleaned = 0;
    const results: string[] = [];
    
    for (const target of cleanTargets) {
      const size = await cleanTarget(projectPath, target, options.dryRun);
      if (size > 0) {
        totalCleaned += size;
        results.push(`${target.name}: ${formatFileSize(size)}`);
      }
    }
    
    spinner.stop();
    
    if (totalCleaned > 0) {
      displaySuccessMessage(
        options.dryRun ? 'Clean preview completed!' : 'Project cleaned successfully!',
        [
          `Total ${options.dryRun ? 'would be' : ''} cleaned: ${formatFileSize(totalCleaned)}`,
          ...results
        ]
      );
    } else {
      console.log(chalk.yellow('✨ Nothing to clean - project is already tidy!'));
    }
    
  } catch (error: any) {
    spinner.fail(chalk.red('❌ Failed to clean project'));
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Determine what to clean based on options
 */
function determineCleanTargets(options: any): any[] {
  const targets = [];
  
  if (options.all || options.nodeModules) {
    targets.push({
      name: 'node_modules',
      patterns: ['**/node_modules'],
      description: 'Node.js dependencies'
    });
  }
  
  if (options.all || options.build) {
    targets.push({
      name: 'build outputs',
      patterns: ['dist', 'build', '.next', 'out', 'target/debug', 'target/release'],
      description: 'Build outputs and compiled files'
    });
  }
  
  if (options.all || options.cache) {
    targets.push({
      name: 'caches',
      patterns: ['.cache', '.npm', '.yarn', '.pnpm-store', '__pycache__'],
      description: 'Package manager and build caches'
    });
  }
  
  if (options.all || options.logs) {
    targets.push({
      name: 'logs',
      patterns: ['*.log', 'logs/**', '.log'],
      description: 'Log files'
    });
  }
  
  if (options.deep) {
    targets.push({
      name: 'lock files',
      patterns: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'Cargo.lock'],
      description: 'Dependency lock files (requires reinstall)'
    });
  }
  
  // Default to safe clean if no options specified
  if (targets.length === 0) {
    targets.push({
      name: 'build outputs',
      patterns: ['dist', 'build', '.next', 'out'],
      description: 'Build outputs (safe to clean)'
    });
  }
  
  return targets;
}

/**
 * Clean a specific target
 */
async function cleanTarget(projectPath: string, target: any, dryRun: boolean): Promise<number> {
  let totalSize = 0;
  
  for (const pattern of target.patterns) {
    const fullPath = path.join(projectPath, pattern);
    
    try {
      if (await fs.pathExists(fullPath)) {
        const stat = await fs.stat(fullPath);
        totalSize += await getDirectorySize(fullPath);
        
        if (!dryRun) {
          await fs.remove(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors or non-existent paths
    }
  }
  
  return totalSize;
}

/**
 * Get directory size recursively
 */
async function getDirectorySize(dir: string): Promise<number> {
  let size = 0;
  
  try {
    const stat = await fs.stat(dir);
    
    if (stat.isFile()) {
      return stat.size;
    }
    
    if (stat.isDirectory()) {
      const entries = await fs.readdir(dir);
      
      for (const entry of entries) {
        const entryPath = path.join(dir, entry);
        size += await getDirectorySize(entryPath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return size;
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
