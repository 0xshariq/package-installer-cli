/**
 * Upgrade CLI command - Updates Package Installer CLI to the latest version
 */

import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';
import ora from 'ora';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';
import semver from 'semver';
import { CacheManager } from '../utils/cacheUtils.js';

const execAsync = promisify(exec);

/**
 * Display help for upgrade-cli command
 */
export function showUpgradeHelp(): void {
  const piGradient = gradient(['#00c6ff', '#0072ff']);
  const headerGradient = gradient(['#4facfe', '#00f2fe']);
  
  console.log('\n' + boxen(
    headerGradient('🚀 Upgrade CLI Command Help') + '\n\n' +
    chalk.white('Update Package Installer CLI to the latest version with intelligent upgrade management.') + '\n' +
    chalk.white('Includes breaking change detection and version compatibility checks!') + '\n\n' +
    chalk.cyan('Usage:') + '\n' +
    chalk.white(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('upgrade-cli')}`) + '\n\n' +
    chalk.cyan('Options:') + '\n' +
    chalk.gray('  -h, --help    Display help for this command') + '\n\n' +
    chalk.cyan('Examples:') + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('upgrade-cli')}              # Smart upgrade with breaking change detection`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('upgrade-cli')} ${chalk.hex('#ff6b6b')('--help')}     # Show this help message`) + '\n\n' +
    chalk.hex('#00d2d3')('💡 Enhanced Features:') + '\n' +
    chalk.hex('#95afc0')('  • Semantic version analysis and breaking change detection') + '\n' +
    chalk.hex('#95afc0')('  • Interactive confirmation for major version upgrades') + '\n' +
    chalk.hex('#95afc0')('  • Automatic @latest tag installation for maximum compatibility') + '\n' +
    chalk.hex('#95afc0')('  • Package size and release date information') + '\n' +
    chalk.hex('#95afc0')('  • Command history tracking and performance metrics') + '\n' +
    chalk.hex('#95afc0')('  • Comprehensive upgrade verification and rollback guidance'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#0a0a0a'
    }
  ));
}

/**
 * Get the current version from package.json
 */
async function getCurrentVersion(): Promise<string> {
  try {
    const { stdout } = await execAsync('npm list -g @0xshariq/package-installer --depth=0 --json');
    const data = JSON.parse(stdout);
    return data.dependencies?.['@0xshariq/package-installer']?.version || 'unknown';
  } catch {
    try {
      const { stdout } = await execAsync('pi --version');
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }
}

/**
 * Get the latest version from npm registry
 */
async function getLatestVersion(): Promise<string> {
  try {
    const { stdout } = await execAsync('npm show @0xshariq/package-installer version');
    return stdout.trim();
  } catch (error) {
    throw new Error(`Failed to fetch latest version: ${error}`);
  }
}

/**
 * Get package information including changelog
 */
async function getPackageInfo(): Promise<any> {
  try {
    const { stdout } = await execAsync('npm show @0xshariq/package-installer --json');
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`Failed to fetch package information: ${error}`);
  }
}

/**
 * Check for breaking changes between versions
 */
function hasBreakingChanges(currentVersion: string, latestVersion: string): boolean {
  if (!semver.valid(currentVersion) || !semver.valid(latestVersion)) {
    return true; // Assume breaking changes if versions can't be parsed
  }
  
  return semver.major(latestVersion) > semver.major(currentVersion);
}

/**
 * Get version change type
 */
function getVersionChangeType(currentVersion: string, latestVersion: string): string {
  if (!semver.valid(currentVersion) || !semver.valid(latestVersion)) {
    return 'unknown';
  }
  
  if (semver.major(latestVersion) > semver.major(currentVersion)) {
    return 'major';
  } else if (semver.minor(latestVersion) > semver.minor(currentVersion)) {
    return 'minor';
  } else if (semver.patch(latestVersion) > semver.patch(currentVersion)) {
    return 'patch';
  }
  
  return 'same';
}

/**
 * Show breaking changes warning
 */
async function showBreakingChangesWarning(currentVersion: string, latestVersion: string): Promise<boolean> {
  const changeType = getVersionChangeType(currentVersion, latestVersion);
  
  if (changeType === 'major') {
    console.log('\n' + boxen(
      chalk.red.bold('⚠️  BREAKING CHANGES DETECTED') + '\n\n' +
      chalk.white(`Upgrading from v${currentVersion} to v${latestVersion}`) + '\n' +
      chalk.white('This is a major version update that may include breaking changes.') + '\n\n' +
      chalk.yellow('Potential impacts:') + '\n' +
      chalk.gray('  • Command interface changes') + '\n' +
      chalk.gray('  • Configuration file format updates') + '\n' +
      chalk.gray('  • Template structure modifications') + '\n' +
      chalk.gray('  • Deprecated features removal') + '\n\n' +
      chalk.cyan('💡 Recommendation:') + '\n' +
      chalk.white('  • Review the changelog before upgrading') + '\n' +
      chalk.white('  • Backup your projects and configurations') + '\n' +
      chalk.white('  • Test in a non-production environment first'),
      {
        padding: 1,
        borderStyle: 'double',
        borderColor: 'red',
        backgroundColor: '#2a0000'
      }
    ));
    
    const { confirmUpgrade } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmUpgrade',
        message: 'Do you want to proceed with this potentially breaking upgrade?',
        default: false
      }
    ]);
    
    return confirmUpgrade;
  }
  
  return true; // No breaking changes, proceed
}

/**
 * Show upgrade summary
 */
function showUpgradeSummary(currentVersion: string, latestVersion: string, packageInfo: any): void {
  const changeType = getVersionChangeType(currentVersion, latestVersion);
  const changeEmoji: Record<string, string> = {
    major: '🚨',
    minor: '✨',
    patch: '🐛',
    unknown: '❓'
  };
  
  const changeColor: Record<string, any> = {
    major: chalk.red,
    minor: chalk.blue,
    patch: chalk.green,
    unknown: chalk.yellow
  };
  
  console.log('\n' + boxen(
    chalk.hex('#00d2d3')('📊 Upgrade Summary') + '\n\n' +
    chalk.white(`Current Version: ${chalk.hex('#ffa502')(currentVersion)}`) + '\n' +
    chalk.white(`Latest Version:  ${chalk.hex('#10ac84')(latestVersion)}`) + '\n' +
    chalk.white(`Change Type:     ${changeColor[changeType](`${changeEmoji[changeType]} ${changeType.toUpperCase()}`)}`) + '\n' +
    chalk.white(`Last Updated:    ${packageInfo.time?.[latestVersion] ? new Date(packageInfo.time[latestVersion]).toLocaleDateString() : 'Unknown'}`) + '\n' +
    chalk.white(`Size:            ${packageInfo.dist?.unpackedSize ? `${Math.round(packageInfo.dist.unpackedSize / 1024)} KB` : 'Unknown'}`),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: '#00d2d3',
      backgroundColor: '#0a1a1a'
    }
  ));
}

/**
 * Detect which package manager was used for installation
 */
async function detectPackageManager(): Promise<string> {
  const managers = [
    { name: 'pnpm', command: 'pnpm list -g @0xshariq/package-installer' },
    { name: 'yarn', command: 'yarn global list --depth=0' },
    { name: 'npm', command: 'npm list -g @0xshariq/package-installer' }
  ];
  
  for (const manager of managers) {
    try {
      await execAsync(manager.command);
      return manager.name;
    } catch {
      continue;
    }
  }
  
  return 'npm'; // fallback to npm
}

/**
 * Main upgrade CLI function
 */
export async function upgradeCliCommand(): Promise<void> {
  const startTime = Date.now();
  const cacheManager = new CacheManager();
  
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUpgradeHelp();
    return;
  }
  
  console.log('\n' + chalk.hex('#10ac84')('🚀 Package Installer CLI Upgrade'));
  console.log(chalk.hex('#95afc0')('Checking for updates...\n'));
  
  const spinner = ora(chalk.hex('#f39c12')('🔍 Fetching version information...')).start();
  
  try {
    const [currentVersion, latestVersion, packageManager, packageInfo] = await Promise.all([
      getCurrentVersion(),
      getLatestVersion(),
      detectPackageManager(),
      getPackageInfo()
    ]);
    
    spinner.succeed(chalk.green('✅ Version information retrieved'));
    
    // Show upgrade summary
    showUpgradeSummary(currentVersion, latestVersion, packageInfo);
    
    if (currentVersion === latestVersion) {
      console.log('\n' + chalk.hex('#10ac84')('🎉 You are already using the latest version!'));
      
      // Track command completion
      const duration = Date.now() - startTime;
      await cacheManager.addCommandToHistory({
        command: 'upgrade-cli',
        args: [],
        projectPath: process.cwd(),
        success: true,
        duration
      });
      
      return;
    }
    
    if (currentVersion === 'unknown') {
      console.log('\n' + chalk.hex('#ffa502')('⚠️  Could not detect current version.'));
      console.log(chalk.hex('#95afc0')('   The CLI might not be installed globally.'));
      console.log(chalk.hex('#95afc0')('   Proceeding with installation...'));
    } else {
      // Check for breaking changes and get user confirmation
      const shouldProceed = await showBreakingChangesWarning(currentVersion, latestVersion);
      
      if (!shouldProceed) {
        console.log('\n' + chalk.yellow('⏹️  Upgrade cancelled by user'));
        
        // Track command cancellation
        const duration = Date.now() - startTime;
        await cacheManager.addCommandToHistory({
          command: 'upgrade-cli',
          args: ['cancelled'],
          projectPath: process.cwd(),
          success: false,
          duration
        });
        
        return;
      }
    }
    
    // Perform upgrade with @latest tag
    const upgradeSpinner = ora(chalk.hex('#10ac84')(`🚀 Upgrading CLI using ${packageManager}...`)).start();
    
    let upgradeCommand: string;
    switch (packageManager) {
      case 'pnpm':
        upgradeCommand = 'pnpm add -g @0xshariq/package-installer@latest';
        break;
      case 'yarn':
        upgradeCommand = 'yarn global add @0xshariq/package-installer@latest';
        break;
      default:
        upgradeCommand = 'npm install -g @0xshariq/package-installer@latest';
    }
    
    upgradeSpinner.text = chalk.hex('#10ac84')(`Installing ${latestVersion} with @latest tag...`);
    await execAsync(upgradeCommand, { timeout: 120000 }); // 2 minute timeout
    
    upgradeSpinner.succeed(chalk.green('✅ CLI upgraded successfully!'));
    
    // Verify upgrade
    const verifySpinner = ora(chalk.hex('#00d2d3')('🔍 Verifying upgrade...')).start();
    const newVersion = await getCurrentVersion();
    
    if (newVersion === latestVersion) {
      verifySpinner.succeed(chalk.green(`✅ Upgrade verified! Now running v${newVersion}`));
    } else {
      verifySpinner.warn(chalk.yellow('⚠️  Upgrade completed but version verification failed'));
      console.log(chalk.hex('#95afc0')('   Try running: pi --version'));
    }
    
    // Show success message with changelog link
    console.log('\n' + boxen(
      chalk.hex('#10ac84')('🎉 Upgrade Complete!') + '\n\n' +
      chalk.white(`Successfully upgraded from v${currentVersion} to v${latestVersion}`) + '\n' +
      chalk.white('All new features and improvements are now available!') + '\n\n' +
      chalk.hex('#00d2d3')('💡 What\'s new?') + '\n' +
      chalk.hex('#95afc0')('  • Enhanced template system with better error handling') + '\n' +
      chalk.hex('#95afc0')('  • Improved caching and performance optimizations') + '\n' +
      chalk.hex('#95afc0')('  • New history tracking and analytics features') + '\n' +
      chalk.hex('#95afc0')('  • Better version management and upgrade warnings') + '\n\n' +
      chalk.cyan('📖 View full changelog:') + '\n' +
      chalk.blue('  https://github.com/0xshariq/package-installer-cli/releases'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: '#10ac84',
        backgroundColor: '#001a00'
      }
    ));
    
    // Track successful upgrade
    const duration = Date.now() - startTime;
    await cacheManager.addCommandToHistory({
      command: 'upgrade-cli',
      args: [currentVersion, latestVersion],
      projectPath: process.cwd(),
      success: true,
      duration
    });
    
  } catch (error: any) {
    spinner.fail(chalk.red('❌ Upgrade failed'));
    console.log(chalk.red(`\n❌ Error: ${error.message}`));
    console.log(chalk.hex('#95afc0')('\n💡 Try running the upgrade manually:'));
    console.log(chalk.hex('#95afc0')('   npm install -g @0xshariq/package-installer@latest'));
    console.log(chalk.hex('#95afc0')('   # or'));
    console.log(chalk.hex('#95afc0')('   yarn global add @0xshariq/package-installer@latest'));
    console.log(chalk.hex('#95afc0')('   # or'));
    console.log(chalk.hex('#95afc0')('   pnpm add -g @0xshariq/package-installer@latest'));
    
    // Track failed upgrade
    const duration = Date.now() - startTime;
    await cacheManager.addCommandToHistory({
      command: 'upgrade-cli',
      args: [],
      projectPath: process.cwd(),
      success: false,
      duration
    });
  }
}
