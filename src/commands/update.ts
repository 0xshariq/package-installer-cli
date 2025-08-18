import { Command } from 'commander';
import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import { detectProjectLanguage, installAdditionalPackages } from '../utils/dependencyInstaller.js';
import { displaySuccessMessage, displayErrorMessage, createBanner } from '../utils/dashboard.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

export const updateCommand = new Command('update')
  .alias('u')
  .description('🔄 Update packages to their latest versions')
  .option('-p, --packages <packages...>', 'Specific packages to update (space separated)')
  .option('-d, --dev', 'Update only development dependencies')
  .option('-g, --global', 'Update global packages')
  .option('--major', 'Allow major version updates (potentially breaking)')
  .option('--dry-run', 'Show what would be updated without actually updating')
  .option('-f, --force', 'Force update even if there are potential conflicts')
  .option('--interactive', 'Interactive mode to select which packages to update')
  .option('-h, --help', 'Show help for update command')
  .action(async (options) => {
    if (options.help) {
      showUpdateHelp();
      return;
    }

    createBanner('Package Updater');
    
    const projectPath = process.cwd();
    const spinner = ora(chalk.hex('#9c88ff')('🔍 Analyzing project structure...')).start();
    
    try {
      // Detect project languages
      const languages = await detectProjectLanguage(projectPath);
      
      if (languages.length === 0) {
        spinner.fail(chalk.red('❌ No recognizable project found in current directory'));
        displayErrorMessage(
          'Could not detect any supported project types',
          [
            'Make sure you are in a project directory',
            'Supported: Node.js, Rust, Python, Go, PHP, Ruby projects',
            'Look for files like package.json, Cargo.toml, requirements.txt, etc.'
          ]
        );
        return;
      }
      
      spinner.succeed(chalk.green(`✅ Detected languages: ${languages.join(', ')}`));
      
      // Update packages for each detected language
      for (const language of languages) {
        await updatePackagesForLanguage(language, projectPath, options);
      }
      
      displaySuccessMessage(
        'Package updates completed successfully!',
        [
          'All packages have been updated to their latest compatible versions',
          'Run your tests to ensure everything works correctly',
          'Check the changelog for any breaking changes'
        ]
      );
      
    } catch (error: any) {
      spinner.fail(chalk.red('❌ Failed to update packages'));
      displayErrorMessage(
        error.message,
        [
          'Try running the command with --dry-run to see what would be updated',
          'Use --force flag to override conflict warnings',
          'Check your internet connection and package registry access'
        ]
      );
    }
  });

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
function showUpdateHelp(): void {
  console.clear();
  
  console.log(chalk.hex('#9c88ff')('🔄 PACKAGE UPDATE COMMAND HELP\n'));
  
  console.log(chalk.hex('#00d2d3')('Usage:'));
  console.log(chalk.white('  pi update [options]'));
  console.log(chalk.white('  pi u [options]') + chalk.gray(' (alias)\n'));
  
  console.log(chalk.hex('#00d2d3')('Description:'));
  console.log(chalk.white('  Update packages to their latest versions across different ecosystems'));
  console.log(chalk.white('  Supports Node.js, Rust, Python, Go, PHP, and Ruby projects\n'));
  
  console.log(chalk.hex('#00d2d3')('Options:'));
  console.log(chalk.white('  -p, --packages <packages...>') + chalk.gray('  Update specific packages only'));
  console.log(chalk.white('  -d, --dev') + chalk.gray('                   Update development dependencies only'));
  console.log(chalk.white('  -g, --global') + chalk.gray('               Update global packages'));
  console.log(chalk.white('  --major') + chalk.gray('                    Allow major version updates (breaking changes)'));
  console.log(chalk.white('  --dry-run') + chalk.gray('                  Show what would be updated without updating'));
  console.log(chalk.white('  -f, --force') + chalk.gray('                Force update even with conflicts'));
  console.log(chalk.white('  --interactive') + chalk.gray('             Interactive package selection mode'));
  console.log(chalk.white('  -h, --help') + chalk.gray('                 Show this help message\n'));
  
  console.log(chalk.hex('#00d2d3')('Examples:'));
  console.log(chalk.gray('  # Update all packages in current project'));
  console.log(chalk.white('  pi update\n'));
  console.log(chalk.gray('  # Update specific packages'));
  console.log(chalk.white('  pi update --packages react vue axios\n'));
  console.log(chalk.gray('  # Update only development dependencies'));
  console.log(chalk.white('  pi update --dev\n'));
  console.log(chalk.gray('  # Check for updates without applying them'));
  console.log(chalk.white('  pi update --dry-run\n'));
  console.log(chalk.gray('  # Update global packages'));
  console.log(chalk.white('  pi update --global\n'));
  console.log(chalk.gray('  # Allow major version updates (potentially breaking)'));
  console.log(chalk.white('  pi update --major\n'));
  
  console.log(chalk.hex('#ffa502')('⚠️  Warning:'));
  console.log(chalk.yellow('  Major updates (--major) may introduce breaking changes.'));
  console.log(chalk.yellow('  Always run tests after updating packages.\n'));
}
