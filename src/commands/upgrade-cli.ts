/**
 * Upgrade CLI command - Updates Package Installer CLI to the latest version
 */

import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';
import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Display help for upgrade-cli command
 */
export function showUpgradeHelp(): void {
  const piGradient = gradient(['#00c6ff', '#0072ff']);
  const headerGradient = gradient(['#4facfe', '#00f2fe']);
  
  console.log('\n' + boxen(
    headerGradient('🚀 Upgrade CLI Command Help') + '\n\n' +
    chalk.white('Update Package Installer CLI to the latest version automatically.') + '\n' +
    chalk.white('No need to manually check for updates or reinstall!') + '\n\n' +
    chalk.cyan('Usage:') + '\n' +
    chalk.white(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('upgrade-cli')}`) + '\n\n' +
    chalk.cyan('Options:') + '\n' +
    chalk.gray('  -h, --help    Display help for this command') + '\n\n' +
    chalk.cyan('Examples:') + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('upgrade-cli')}              # Update to latest version`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('upgrade-cli')} ${chalk.hex('#ff6b6b')('--help')}     # Show this help message`) + '\n\n' +
    chalk.hex('#00d2d3')('💡 What it does:') + '\n' +
    chalk.hex('#95afc0')('  • Checks for the latest version') + '\n' +
    chalk.hex('#95afc0')('  • Shows current vs latest version') + '\n' +
    chalk.hex('#95afc0')('  • Updates automatically using npm/yarn/pnpm') + '\n' +
    chalk.hex('#95afc0')('  • Preserves your global installation'),
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
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUpgradeHelp();
    return;
  }
  
  console.log('\n' + chalk.hex('#10ac84')('🚀 Package Installer CLI Upgrade'));
  console.log(chalk.hex('#95afc0')('Checking for updates...\n'));
  
  const spinner = ora(chalk.hex('#f39c12')('🔍 Fetching version information...')).start();
  
  try {
    const [currentVersion, latestVersion, packageManager] = await Promise.all([
      getCurrentVersion(),
      getLatestVersion(),
      detectPackageManager()
    ]);
    
    spinner.succeed(chalk.green('✅ Version information retrieved'));
    
    console.log('\n' + boxen(
      chalk.hex('#00d2d3')('📊 Version Information') + '\n\n' +
      chalk.white(`Current Version: ${chalk.hex('#ffa502')(currentVersion)}`) + '\n' +
      chalk.white(`Latest Version:  ${chalk.hex('#10ac84')(latestVersion)}`) + '\n' +
      chalk.white(`Package Manager: ${chalk.hex('#9c88ff')(packageManager)}`),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: '#00d2d3',
        backgroundColor: '#0a1a1a'
      }
    ));
    
    if (currentVersion === latestVersion) {
      console.log('\n' + chalk.hex('#10ac84')('🎉 You are already using the latest version!'));
      return;
    }
    
    if (currentVersion === 'unknown') {
      console.log('\n' + chalk.hex('#ffa502')('⚠️  Could not detect current version.'));
      console.log(chalk.hex('#95afc0')('   The CLI might not be installed globally.'));
      console.log(chalk.hex('#95afc0')('   Proceeding with installation...'));
    }
    
    // Perform upgrade
    const upgradeSpinner = ora(chalk.hex('#10ac84')(`🚀 Upgrading CLI using ${packageManager}...`)).start();
    
    let upgradeCommand: string;
    switch (packageManager) {
      case 'pnpm':
        upgradeCommand = 'pnpm remove -g @0xshariq/package-installer && pnpm add -g @0xshariq/package-installer@latest';
        break;
      case 'yarn':
        upgradeCommand = 'yarn global remove @0xshariq/package-installer && yarn global add @0xshariq/package-installer@latest';
        break;
      default:
        upgradeCommand = 'npm uninstall -g @0xshariq/package-installer && npm install -g @0xshariq/package-installer@latest';
    }
    
    await execAsync(upgradeCommand, { timeout: 120000 }); // 2 minute timeout
    
    upgradeSpinner.succeed(chalk.green('✅ CLI upgraded successfully!'));
    
    // Verify upgrade with a delay to allow for system update
    const verifySpinner = ora(chalk.hex('#00d2d3')('🔍 Verifying upgrade...')).start();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    try {
      const { stdout } = await execAsync('pi --version');
      const newVersion = stdout.trim();
      
      if (newVersion.includes(latestVersion)) {
        verifySpinner.succeed(chalk.green(`✅ Upgrade verified! Now running v${latestVersion}`));
      } else {
        verifySpinner.warn(chalk.yellow('⚠️  Upgrade completed but version verification failed'));
        console.log(chalk.hex('#95afc0')('   Try running: pi --version'));
      }
    } catch (verifyError) {
      verifySpinner.warn(chalk.yellow('⚠️  Upgrade completed but verification failed'));
      console.log(chalk.hex('#95afc0')('   Try running: pi --version'));
    }
    
    console.log('\n' + boxen(
      chalk.hex('#10ac84')('🎉 Upgrade Complete!') + '\n\n' +
      chalk.white('Your Package Installer CLI has been updated to the latest version.') + '\n' +
      chalk.white('All new features and improvements are now available!') + '\n\n' +
      chalk.hex('#00d2d3')('💡 What\'s new? Check out:') + '\n' +
      chalk.hex('#95afc0')('  • New templates and frameworks') + '\n' +
      chalk.hex('#95afc0')('  • Enhanced features and bug fixes') + '\n' +
      chalk.hex('#95afc0')('  • Improved performance and stability'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: '#10ac84',
        backgroundColor: '#001a00'
      }
    ));
    
  } catch (error: any) {
    spinner.fail(chalk.red('❌ Upgrade failed'));
    console.log(chalk.red(`\n❌ Error: ${error.message}`));
    console.log(chalk.hex('#95afc0')('\n💡 Try running the upgrade manually:'));
    console.log(chalk.hex('#ffa502')('\n# Uninstall current version first:'));
    console.log(chalk.hex('#95afc0')('   npm uninstall -g @0xshariq/package-installer'));
    console.log(chalk.hex('#95afc0')('   # or'));
    console.log(chalk.hex('#95afc0')('   yarn global remove @0xshariq/package-installer'));
    console.log(chalk.hex('#95afc0')('   # or'));
    console.log(chalk.hex('#95afc0')('   pnpm remove -g @0xshariq/package-installer'));
    console.log(chalk.hex('#ffa502')('\n# Then install latest version:'));
    console.log(chalk.hex('#95afc0')('   npm install -g @0xshariq/package-installer@latest'));
    console.log(chalk.hex('#95afc0')('   # or'));
    console.log(chalk.hex('#95afc0')('   yarn global add @0xshariq/package-installer@latest'));
    console.log(chalk.hex('#95afc0')('   # or'));
    console.log(chalk.hex('#95afc0')('   pnpm add -g @0xshariq/package-installer@latest'));
  }
}
