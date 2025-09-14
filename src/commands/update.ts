import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import boxen from 'boxen';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import { displaySuccessMessage, displayErrorMessage, createBanner } from '../utils/dashboard.js';
import {
  getSupportedLanguages,
  getLanguageConfig,
  SupportedLanguage
} from '../utils/languageConfig.js';
import { detectProjectStack } from '../utils/featureInstaller.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Check for CLI updates
 */
async function checkForCLIUpdates(): Promise<{ hasUpdate: boolean; currentVersion: string; latestVersion?: string }> {
  try {
    const cliRoot = getCliRootPath();
    const packageJsonPath = path.join(cliRoot, 'package.json');

    if (!await fs.pathExists(packageJsonPath)) {
      return { hasUpdate: false, currentVersion: 'unknown' };
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const currentVersion = packageJson.version;

    // Check npm registry for latest version
    const { stdout } = await execAsync(`npm view ${packageJson.name} version`);
    const latestVersion = stdout.trim();

    const hasUpdate = currentVersion !== latestVersion;

    return { hasUpdate, currentVersion, latestVersion };
  } catch (error) {
    return { hasUpdate: false, currentVersion: 'unknown' };
  }
}

/**
 * Update CLI to latest version
 */
async function updateCLI(): Promise<boolean> {
  try {
    const spinner = ora('Updating Package Installer CLI...').start();

    try {
      await execAsync('npm update -g @0xshariq/package-installer');
      spinner.succeed('CLI updated successfully!');
      return true;
    } catch (error) {
      // Try yarn if npm fails
      try {
        await execAsync('yarn global upgrade @0xshariq/package-installer');
        spinner.succeed('CLI updated successfully with yarn!');
        return true;
      } catch (yarnError) {
        spinner.fail('Failed to update CLI');
        console.error(chalk.red('Update failed. Please update manually:'));
        console.log(chalk.yellow('npm update -g @0xshariq/package-installer'));
        return false;
      }
    }
  } catch (error) {
    console.error(chalk.red('Error updating CLI:'), error);
    return false;
  }
}

/**
 * Update project dependencies
 */
async function updateProjectDependencies(projectPath: string): Promise<boolean> {
  try {
    const projectInfo = await detectProjectStack(projectPath);
    if (!projectInfo.packageManager) {
      console.log(chalk.yellow('⚠️  No package manager detected'));
      return false;
    }

    const spinner = ora(`Updating dependencies with ${projectInfo.packageManager}...`).start();

    const updateCommand = getUpdateCommand(projectInfo.projectLanguage as SupportedLanguage, projectInfo.packageManager);
    if (!updateCommand) {
      spinner.fail('No update command available for this project type');
      return false;
    }

    await execAsync(updateCommand, { cwd: projectPath });
    spinner.succeed('Dependencies updated successfully!');
    return true;
  } catch (error) {
    console.error(chalk.red('Error updating dependencies:'), error);
    return false;
  }
}

/**
 * Update features cache
 */
async function updateFeaturesCache(): Promise<void> {
  const spinner = ora('Updating features cache...').start();

  try {
    const cliRoot = getCliRootPath();
    const featuresPath = path.join(cliRoot, 'features');

    if (await fs.pathExists(featuresPath)) {
      // Simple cache refresh - just check if features directory exists
      spinner.succeed('Features cache checked!');
    } else {
      spinner.warn('Features directory not found');
    }
  } catch (error) {
    spinner.fail('Failed to update features cache');
    console.error(chalk.red('Error:'), error);
  }
}

/**
 * Get update command for a specific language and package manager
 */
function getUpdateCommand(language: SupportedLanguage, packageManagerName?: string): string {
  const config = getLanguageConfig(language);
  if (!config) return '';

  const pm = packageManagerName
    ? config.packageManagers.find(p => p.name === packageManagerName)
    : config.packageManagers[0];

  return pm?.updateCommand || pm?.installCommand || '';
}

/**
 * Main update command function
 */
export async function updateCommand(options: any): Promise<void> {
  if (options.help || options['--help'] || options['-h']) {
    showUpdateHelp();
    return;
  }

  // Display banner
  console.clear();
  const banner = boxen(
    gradient(['#4facfe', '#00f2fe'])('🔄 Package Installer Updater') + '\n\n' +
    chalk.white('Keep your CLI and project dependencies up to date'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  );
  console.log(banner);

  try {
    // Check what to update
    const choices = [
      { name: '📦 Update CLI to latest version', value: 'cli' },
      { name: '� Update project dependencies', value: 'dependencies' },
      { name: '🚀 Update features cache', value: 'cache' },
      { name: '🌟 Update everything', value: 'all' }
    ];

    const { updateType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'updateType',
        message: 'What would you like to update?',
        choices,
        pageSize: 10
      }
    ]);

    const projectPath = process.cwd();

    switch (updateType) {
      case 'cli':
        await handleCLIUpdate();
        break;

      case 'dependencies':
        await handleDependencyUpdate(projectPath);
        break;

      case 'cache':
        await updateFeaturesCache();
        break;

      case 'all':
        await handleFullUpdate(projectPath);
        break;
    }

  } catch (error) {
    displayErrorMessage(
      'Update failed',
      ['An error occurred during the update process', String(error)]
    );
  }
}

/**
 * Handle CLI update
 */
async function handleCLIUpdate(): Promise<void> {
  console.log(chalk.blue('\n� Checking for CLI updates...'));

  const updateInfo = await checkForCLIUpdates();

  if (!updateInfo.hasUpdate) {
    console.log(chalk.green(`✅ CLI is already up to date (v${updateInfo.currentVersion})`));
    return;
  }

  console.log(chalk.yellow(`📦 Update available: v${updateInfo.currentVersion} → v${updateInfo.latestVersion}`));

  const { shouldUpdate } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldUpdate',
      message: 'Would you like to update now?',
      default: true
    }
  ]);

  if (shouldUpdate) {
    const success = await updateCLI();
    if (success) {
      displaySuccessMessage(
        'CLI updated successfully!',
        [`Updated to version ${updateInfo.latestVersion}`, 'Please restart your terminal']
      );
    }
  }
}

/**
 * Handle dependency update
 */
async function handleDependencyUpdate(projectPath: string): Promise<void> {
  console.log(chalk.blue('\n🔍 Analyzing project dependencies...'));

  const success = await updateProjectDependencies(projectPath);

  if (success) {
    displaySuccessMessage(
      'Dependencies updated successfully!',
      ['All packages have been updated to their latest versions']
    );
  }
}

/**
 * Handle full update
 */
async function handleFullUpdate(projectPath: string): Promise<void> {
  console.log(chalk.blue('\n🚀 Starting full update process...'));

  // Update CLI
  await handleCLIUpdate();

  // Update dependencies
  await handleDependencyUpdate(projectPath);

  // Update cache
  await updateFeaturesCache();

  displaySuccessMessage(
    'Full update completed!',
    ['CLI, dependencies, and cache have been updated']
  );
}


/**
 * Update packages for a specific language/ecosystem
 */
async function updatePackagesForLanguage(
  language: string,
  projectPath: string,
  options: any
): Promise<void> {
  console.log(chalk.hex('#00d2d3')(`\n📦 Updating ${language} packages...`));

  const spinner = ora(chalk.hex('#f39c12')('Checking for updates...')).start();

  try {
    switch (language) {
      case 'nodejs':
        await updateNodejsPackages(projectPath, options, spinner);
        break;
      case 'rust':
        await updateRustPackages(projectPath, options, spinner);
        break;
      case 'python':
        await updatePythonPackages(projectPath, options, spinner);
        break;
      case 'go':
        await updateGoPackages(projectPath, options, spinner);
        break;
      case 'php':
        await updatePhpPackages(projectPath, options, spinner);
        break;
      case 'ruby':
        await updateRubyPackages(projectPath, options, spinner);
        break;
      default:
        spinner.warn(chalk.yellow(`⚠️  Updates for ${language} not yet supported`));
        return;
    }

  } catch (error: any) {
    spinner.fail(chalk.red(`❌ Failed to update ${language} packages: ${error.message}`));
    throw error;
  }
}

/**
 * Update Node.js packages (npm, pnpm, yarn)
 */
async function updateNodejsPackages(
  projectPath: string,
  options: any,
  spinner: Ora
): Promise<void> {
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (!(await fs.pathExists(packageJsonPath))) {
    spinner.warn(chalk.yellow('⚠️  No package.json found for Node.js project'));
    return;
  }

  // Detect package manager
  let packageManager = 'npm';
  if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm';
  } else if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
    packageManager = 'yarn';
  }

  spinner.text = chalk.hex('#f39c12')(`Using ${packageManager} to update packages...`);

  if (options.global) {
    // Update global packages
    await updateGlobalNodejsPackages(packageManager, options, spinner);
    return;
  }

  if (options.packages && options.packages.length > 0) {
    // Update specific packages
    await updateSpecificNodejsPackages(packageManager, options.packages, options, spinner);
  } else {
    // Update all packages
    await updateAllNodejsPackages(packageManager, projectPath, options, spinner);
  }
}

/**
 * Update all Node.js packages
 */
async function updateAllNodejsPackages(
  packageManager: string,
  projectPath: string,
  options: any,
  spinner: Ora
): Promise<void> {
  let updateCommand = '';

  switch (packageManager) {
    case 'pnpm':
      updateCommand = options.dryRun ? 'pnpm outdated' : 'pnpm update';
      if (options.major) updateCommand += ' --latest';
      break;
    case 'yarn':
      updateCommand = options.dryRun ? 'yarn outdated' : 'yarn upgrade';
      if (options.major) updateCommand += ' --latest';
      break;
    case 'npm':
      updateCommand = options.dryRun ? 'npm outdated' : 'npm update';
      if (options.major) updateCommand += ' --save';
      break;
  }

  if (options.dev) {
    updateCommand += packageManager === 'npm' ? ' --save-dev' : ' --dev';
  }

  spinner.text = chalk.hex('#f39c12')(`Running: ${updateCommand}`);

  try {
    const { stdout, stderr } = await execAsync(updateCommand, { cwd: projectPath });

    if (options.dryRun) {
      console.log('\n' + chalk.hex('#00d2d3')('📋 Packages that can be updated:'));
      console.log(stdout);
      spinner.info(chalk.blue('ℹ️  Dry run completed - no packages were actually updated'));
    } else {
      spinner.succeed(chalk.green(`✅ All packages updated successfully with ${packageManager}`));
      if (stdout) {
        console.log(chalk.gray('\nUpdate details:'));
        console.log(chalk.gray(stdout));
      }
    }

    if (stderr && !options.dryRun) {
      console.log(chalk.yellow('\nWarnings:'));
      console.log(chalk.yellow(stderr));
    }

  } catch (error: any) {
    if (error.code === 1 && packageManager === 'npm' && error.stdout) {
      // npm outdated returns exit code 1 when there are outdated packages
      if (options.dryRun) {
        console.log('\n' + chalk.hex('#00d2d3')('📋 Packages that can be updated:'));
        console.log(error.stdout);
        spinner.info(chalk.blue('ℹ️  Dry run completed'));
        return;
      }
    }
    throw new Error(`Package manager error: ${error.message}`);
  }
}

/**
 * Update specific Node.js packages
 */
async function updateSpecificNodejsPackages(
  packageManager: string,
  packages: string[],
  options: any,
  spinner: Ora
): Promise<void> {
  const packageList = packages.join(' ');
  let updateCommand = '';

  switch (packageManager) {
    case 'pnpm':
      updateCommand = `pnpm ${options.dryRun ? 'outdated' : 'update'} ${packageList}`;
      if (options.major && !options.dryRun) updateCommand = `pnpm add ${packageList}@latest`;
      break;
    case 'yarn':
      updateCommand = `yarn ${options.dryRun ? 'outdated' : 'upgrade'} ${packageList}`;
      if (options.major && !options.dryRun) updateCommand += ' --latest';
      break;
    case 'npm':
      updateCommand = `npm ${options.dryRun ? 'outdated' : 'update'} ${packageList}`;
      if (options.major && !options.dryRun) updateCommand = `npm install ${packageList}@latest`;
      break;
  }

  spinner.text = chalk.hex('#f39c12')(`Updating packages: ${packageList}`);

  try {
    const { stdout, stderr } = await execAsync(updateCommand);

    if (options.dryRun) {
      console.log('\n' + chalk.hex('#00d2d3')(`📋 Update status for: ${packageList}`));
      console.log(stdout || 'All specified packages are up to date');
      spinner.info(chalk.blue('ℹ️  Dry run completed'));
    } else {
      spinner.succeed(chalk.green(`✅ Updated packages: ${packageList}`));
    }

  } catch (error: any) {
    throw new Error(`Failed to update packages: ${error.message}`);
  }
}

/**
 * Update global Node.js packages
 */
async function updateGlobalNodejsPackages(
  packageManager: string,
  options: any,
  spinner: Ora
): Promise<void> {
  spinner.text = chalk.hex('#f39c12')('Checking global packages...');

  let listCommand = '';
  let updateCommand = '';

  switch (packageManager) {
    case 'pnpm':
      listCommand = 'pnpm list -g --depth=0';
      updateCommand = 'pnpm update -g';
      break;
    case 'yarn':
      listCommand = 'yarn global list --depth=0';
      updateCommand = 'yarn global upgrade';
      break;
    case 'npm':
      listCommand = 'npm list -g --depth=0';
      updateCommand = 'npm update -g';
      break;
  }

  try {
    if (options.dryRun) {
      const { stdout } = await execAsync(listCommand);
      console.log('\n' + chalk.hex('#00d2d3')('📋 Global packages:'));
      console.log(stdout);
      spinner.info(chalk.blue('ℹ️  Use without --dry-run to update global packages'));
    } else {
      spinner.text = chalk.hex('#f39c12')('Updating global packages...');
      await execAsync(updateCommand);
      spinner.succeed(chalk.green('✅ Global packages updated successfully'));
    }

  } catch (error: any) {
    throw new Error(`Failed to update global packages: ${error.message}`);
  }
}

/**
 * Update Rust packages (cargo)
 */
async function updateRustPackages(
  projectPath: string,
  options: any,
  spinner: Ora
): Promise<void> {
  const cargoTomlPath = path.join(projectPath, 'Cargo.toml');

  if (!(await fs.pathExists(cargoTomlPath))) {
    spinner.warn(chalk.yellow('⚠️  No Cargo.toml found for Rust project'));
    return;
  }

  spinner.text = chalk.hex('#f39c12')('Updating Rust dependencies...');

  try {
    if (options.dryRun) {
      // Check for outdated packages
      try {
        const { stdout } = await execAsync('cargo outdated', { cwd: projectPath });
        console.log('\n' + chalk.hex('#00d2d3')('📋 Outdated Rust packages:'));
        console.log(stdout);
        spinner.info(chalk.blue('ℹ️  Install cargo-outdated if not available: cargo install cargo-outdated'));
      } catch {
        spinner.warn(chalk.yellow('⚠️  cargo-outdated not available, showing current dependencies'));
        const { stdout } = await execAsync('cargo tree --depth 1', { cwd: projectPath });
        console.log('\n' + chalk.hex('#00d2d3')('📋 Current dependencies:'));
        console.log(stdout);
      }
    } else {
      // Update Cargo.lock
      await execAsync('cargo update', { cwd: projectPath });
      spinner.succeed(chalk.green('✅ Rust dependencies updated successfully'));
    }

  } catch (error: any) {
    throw new Error(`Failed to update Rust packages: ${error.message}`);
  }
}

/**
 * Update Python packages
 */
async function updatePythonPackages(
  projectPath: string,
  options: any,
  spinner: Ora
): Promise<void> {
  const hasRequirements = await fs.pathExists(path.join(projectPath, 'requirements.txt'));
  const hasPyproject = await fs.pathExists(path.join(projectPath, 'pyproject.toml'));
  const hasPoetryLock = await fs.pathExists(path.join(projectPath, 'poetry.lock'));

  if (!hasRequirements && !hasPyproject) {
    spinner.warn(chalk.yellow('⚠️  No Python package files found'));
    return;
  }

  spinner.text = chalk.hex('#f39c12')('Updating Python packages...');

  try {
    if (hasPoetryLock || hasPyproject) {
      // Use Poetry
      if (options.dryRun) {
        const { stdout } = await execAsync('poetry show --outdated', { cwd: projectPath });
        console.log('\n' + chalk.hex('#00d2d3')('📋 Outdated Python packages:'));
        console.log(stdout);
        spinner.info(chalk.blue('ℹ️  Use without --dry-run to update packages'));
      } else {
        await execAsync('poetry update', { cwd: projectPath });
        spinner.succeed(chalk.green('✅ Python packages updated with Poetry'));
      }
    } else {
      // Use pip with requirements.txt
      if (options.dryRun) {
        try {
          const { stdout } = await execAsync('pip list --outdated', { cwd: projectPath });
          console.log('\n' + chalk.hex('#00d2d3')('📋 Outdated Python packages:'));
          console.log(stdout);
        } catch {
          spinner.warn(chalk.yellow('⚠️  Could not check for outdated packages'));
        }
        spinner.info(chalk.blue('ℹ️  Use without --dry-run to update packages'));
      } else {
        await execAsync('pip install --upgrade -r requirements.txt', { cwd: projectPath });
        spinner.succeed(chalk.green('✅ Python packages updated with pip'));
      }
    }

  } catch (error: any) {
    throw new Error(`Failed to update Python packages: ${error.message}`);
  }
}

/**
 * Update Go packages
 */
async function updateGoPackages(
  projectPath: string,
  options: any,
  spinner: Ora
): Promise<void> {
  const hasGoMod = await fs.pathExists(path.join(projectPath, 'go.mod'));

  if (!hasGoMod) {
    spinner.warn(chalk.yellow('⚠️  No go.mod found for Go project'));
    return;
  }

  spinner.text = chalk.hex('#f39c12')('Updating Go modules...');

  try {
    if (options.dryRun) {
      const { stdout } = await execAsync('go list -u -m all', { cwd: projectPath });
      console.log('\n' + chalk.hex('#00d2d3')('📋 Go modules status:'));
      console.log(stdout);
      spinner.info(chalk.blue('ℹ️  Use without --dry-run to update modules'));
    } else {
      await execAsync('go get -u ./...', { cwd: projectPath });
      await execAsync('go mod tidy', { cwd: projectPath });
      spinner.succeed(chalk.green('✅ Go modules updated successfully'));
    }

  } catch (error: any) {
    throw new Error(`Failed to update Go modules: ${error.message}`);
  }
}

/**
 * Update PHP packages (Composer)
 */
async function updatePhpPackages(
  projectPath: string,
  options: any,
  spinner: Ora
): Promise<void> {
  const hasComposer = await fs.pathExists(path.join(projectPath, 'composer.json'));

  if (!hasComposer) {
    spinner.warn(chalk.yellow('⚠️  No composer.json found for PHP project'));
    return;
  }

  spinner.text = chalk.hex('#f39c12')('Updating PHP packages...');

  try {
    if (options.dryRun) {
      const { stdout } = await execAsync('composer outdated', { cwd: projectPath });
      console.log('\n' + chalk.hex('#00d2d3')('📋 Outdated PHP packages:'));
      console.log(stdout);
      spinner.info(chalk.blue('ℹ️  Use without --dry-run to update packages'));
    } else {
      await execAsync('composer update', { cwd: projectPath });
      spinner.succeed(chalk.green('✅ PHP packages updated with Composer'));
    }

  } catch (error: any) {
    throw new Error(`Failed to update PHP packages: ${error.message}`);
  }
}

/**
 * Update Ruby packages (Bundler)
 */
async function updateRubyPackages(
  projectPath: string,
  options: any,
  spinner: Ora
): Promise<void> {
  const hasGemfile = await fs.pathExists(path.join(projectPath, 'Gemfile'));

  if (!hasGemfile) {
    spinner.warn(chalk.yellow('⚠️  No Gemfile found for Ruby project'));
    return;
  }

  spinner.text = chalk.hex('#f39c12')('Updating Ruby gems...');

  try {
    if (options.dryRun) {
      const { stdout } = await execAsync('bundle outdated', { cwd: projectPath });
      console.log('\n' + chalk.hex('#00d2d3')('📋 Outdated Ruby gems:'));
      console.log(stdout);
      spinner.info(chalk.blue('ℹ️  Use without --dry-run to update gems'));
    } else {
      await execAsync('bundle update', { cwd: projectPath });
      spinner.succeed(chalk.green('✅ Ruby gems updated with Bundler'));
    }

  } catch (error: any) {
    throw new Error(`Failed to update Ruby gems: ${error.message}`);
  }
}

/**
 * Show detailed help for update command
 */
export function showUpdateHelp(): void {
  console.clear();

  const helpContent = boxen(
    gradient(['#4facfe', '#00f2fe'])('🔄 Update Command Help') + '\n\n' +
    chalk.white('Keep your CLI and project dependencies up to date') + '\n\n' +

    chalk.cyan('Usage:') + '\n' +
    chalk.white('  pi update [options]') + '\n' +
    chalk.white('  pi u [options]') + chalk.gray(' (alias)') + '\n\n' +

    chalk.cyan('Description:') + '\n' +
    chalk.white('  Interactive updater for Package Installer CLI, project dependencies,') + '\n' +
    chalk.white('  and features cache. Supports multiple package managers and languages.') + '\n\n' +

    chalk.cyan('Options:') + '\n' +
    chalk.white('  -h, --help') + chalk.gray('                 Show this help message') + '\n\n' +

    chalk.cyan('Update Types:') + '\n' +
    chalk.green('  📦 CLI Update') + chalk.gray('              Update Package Installer CLI to latest version') + '\n' +
    chalk.green('  🔧 Dependencies') + chalk.gray('           Update project dependencies using detected package manager') + '\n' +
    chalk.green('  🚀 Features Cache') + chalk.gray('         Refresh features and templates cache') + '\n' +
    chalk.green('  🌟 Everything') + chalk.gray('             Update CLI, dependencies, and cache') + '\n\n' +

    chalk.cyan('Supported Package Managers:') + '\n' +
    chalk.white('  • npm, yarn, pnpm (JavaScript/TypeScript)') + '\n' +
    chalk.white('  • cargo (Rust)') + '\n' +
    chalk.white('  • pip, poetry (Python)') + '\n' +
    chalk.white('  • go mod (Go)') + '\n\n' +

    chalk.cyan('Examples:') + '\n' +
    chalk.gray('  # Interactive update menu') + '\n' +
    chalk.white('  pi update') + '\n\n' +
    chalk.gray('  # Show help') + '\n' +
    chalk.white('  pi update --help') + '\n\n' +

    chalk.yellow('⚠️  Note: Always backup your project before major updates'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  );

  console.log(helpContent);
}
