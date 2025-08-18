#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Import command handlers
import { createProject } from './commands/create.js';
import { checkCommand } from './commands/check.js';
import { cloneRepo } from './commands/clone.js';
import { addCommand } from './commands/add.js';
import { upgradeCliCommand } from './commands/upgrade.js';
import { analyzeCommand } from './commands/analyze.js';
import { deployCommand } from './commands/deploy.js';
import { updateCommand } from './commands/update.js';
import { cleanCommand } from './commands/clean.js';
import { environmentCommand } from './commands/env.js';
import { doctorCommand } from './commands/doctor.js';

// Import utilities
import { printBanner, logError, showBanner } from './utils/ui.js';

// Get current file directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load package.json to get version
let packageJsonPath = join(__dirname, '../package.json');
// Check if we're running from dist folder
if (__dirname.includes('/dist/')) {
  packageJsonPath = join(__dirname, '../../package.json');
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const VERSION = packageJson.version;

// Initialize CLI program
const program = new Command();

// Create beautiful gradient for CLI name
const gradientTitle = gradient(['#667eea', '#764ba2', '#f093fb']);
const piGradient = gradient(['#00c6ff', '#0072ff']);

// Configure main program with enhanced styling
program
  .name('pi')
  .description(chalk.hex('#667eea')('📦 Package Installer CLI') + chalk.hex('#95afc0')(' - Modern web application scaffolding tool'))
  .version(VERSION)
  .configureHelp({
    sortSubcommands: true,
    subcommandTerm: (cmd) => cmd.name(),
  });

/**
 * Enhanced error handler with better formatting
 */
function handleCommandError(commandName: string, error: Error) {
  console.log('\n' + boxen(
    chalk.red('❌ Command Failed') + '\n\n' +
    chalk.white(`Command: ${commandName}`) + '\n' +
    chalk.white(`Error: ${error.message}`) + '\n\n' +
    chalk.gray('💡 Try running with --help for usage information'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'red',
      backgroundColor: '#1a0000'
    }
  ));
  process.exit(1);
}

// CREATE COMMAND - Main project creation from templates
program
  .command('create')
  .description(chalk.hex('#10ac84')('🚀 Create a new project from templates'))
  .argument('[project-name]', chalk.hex('#95afc0')('Project name (will prompt if not provided)'))
  .configureHelp({
    helpWidth: 120,
  })
  .on('--help', () => {
    const piGradient = gradient(['#00c6ff', '#0072ff']);
    const headerGradient = gradient(['#4facfe', '#00f2fe']);
    
    console.log('\n' + boxen(
      headerGradient('🚀 Create Command') + '\n\n' +
      chalk.white('Create a new project from our curated collection of modern templates.') + '\n' +
      chalk.white('Choose from React, Next.js, Express, Nest.js, Rust, and more!') + '\n\n' +
      chalk.cyan('Examples:') + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('create')} my-awesome-app    # Create with specific name`) + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('create')}                   # Interactive mode - will prompt for name`) + '\n\n' +
      chalk.hex('#00d2d3')('💡 Available Templates:') + '\n' +
      chalk.hex('#95afc0')('  • React (Vite) - JavaScript/TypeScript variants') + '\n' +
      chalk.hex('#95afc0')('  • Next.js - App Router with multiple configurations') + '\n' +
      chalk.hex('#95afc0')('  • Express - RESTful APIs with authentication') + '\n' +
      chalk.hex('#95afc0')('  • Nest.js - Enterprise-grade Node.js framework') + '\n' +
      chalk.hex('#95afc0')('  • Angular - Modern Angular applications') + '\n' +
      chalk.hex('#95afc0')('  • Vue.js - Progressive Vue.js applications') + '\n' +
      chalk.hex('#95afc0')('  • Rust - Systems programming templates') + '\n' +
      chalk.hex('#95afc0')('  • Django - Python web framework'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        backgroundColor: '#0a0a0a'
      }
    ));
  })
  .action(async (projectName) => {
    try {
      showBanner();
      await createProject(projectName);
    } catch (error) {
      handleCommandError('create project', error as Error);
    }
  });

// CHECK COMMAND - Package version checking and suggestions
program
  .command('check')
  .description(chalk.hex('#f39c12')('🔍 Check package versions and get update suggestions'))
  .argument('[package-name]', chalk.hex('#95afc0')('Specific package to check (optional)'))
  .on('--help', () => {
    const piGradient = gradient(['#00c6ff', '#0072ff']);
    const headerGradient = gradient(['#4facfe', '#00f2fe']);
    
    console.log('\n' + boxen(
      headerGradient('🔍 Check Command') + '\n\n' +
      chalk.white('Check package versions in your project and get suggestions for updates.') + '\n' +
      chalk.white('Helps you keep your dependencies up-to-date and secure.') + '\n\n' +
      chalk.cyan('Examples:') + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#f39c12')('check')}                    # Check all packages in current project`) + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#f39c12')('check')} react              # Check specific package version`) + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#f39c12')('check')} @types/node        # Check scoped packages`) + '\n\n' +
      chalk.hex('#00d2d3')('💡 Supported Package Managers:') + '\n' +
      chalk.hex('#95afc0')('  • npm, pnpm, yarn (Node.js)') + '\n' +
      chalk.hex('#95afc0')('  • pip, pipenv, poetry (Python)') + '\n' +
      chalk.hex('#95afc0')('  • cargo (Rust)') + '\n' +
      chalk.hex('#95afc0')('  • go modules (Go)') + '\n' +
      chalk.hex('#95afc0')('  • composer (PHP)'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        backgroundColor: '#0a0a0a'
      }
    ));
  })
  .action(async (packageName) => {
    try {
      await checkCommand(packageName);
    } catch (error) {
      handleCommandError('check packages', error as Error);
    }
  });

// CLONE COMMAND - GitHub repository cloning
program
  .command('clone')
  .description(chalk.hex('#00d2d3')('📥 Clone repositories from GitHub, GitLab, BitBucket & SourceHut'))
  .argument('[user/repo]', chalk.hex('#95afc0')('Repository in format "user/repo" or "provider:user/repo"'))
  .argument('[project-name]', chalk.hex('#95afc0')('Custom project name (defaults to repo name)'))
  .on('--help', () => {
    const piGradient = gradient(['#00c6ff', '#0072ff']);
    const headerGradient = gradient(['#4facfe', '#00f2fe']);
    
    console.log('\n' + boxen(
      headerGradient('📥 Clone Command') + '\n\n' +
      chalk.white('Clone any public repository from GitHub, GitLab, BitBucket, or SourceHut.') + '\n' +
      chalk.white('Automatically installs dependencies and creates .env file from templates.') + '\n\n' +
      chalk.cyan('Examples:') + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#00d2d3')('clone')} facebook/react my-react-copy      # Clone from GitHub with custom name`) + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#00d2d3')('clone')} gitlab:user/project               # Clone from GitLab`) + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#00d2d3')('clone')} bitbucket:user/repo               # Clone from BitBucket`) + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#00d2d3')('clone')} sourcehut:user/repo               # Clone from SourceHut`) + '\n\n' +
      chalk.hex('#00d2d3')('💡 Supported Platforms:') + '\n' +
      chalk.hex('#95afc0')('  • GitHub (default): user/repo') + '\n' +
      chalk.hex('#95afc0')('  • GitLab: gitlab:user/repo') + '\n' +
      chalk.hex('#95afc0')('  • BitBucket: bitbucket:user/repo') + '\n' +
      chalk.hex('#95afc0')('  • SourceHut: sourcehut:user/repo'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        backgroundColor: '#0a0a0a'
      }
    ));
  })
  .action(async (userRepo, projectName) => {
    if (!userRepo) {
      console.log('\n' + chalk.hex('#ff4757')('❌ Error: Repository is required'));
      console.log(chalk.hex('#95afc0')('   Format: user/repo or provider:user/repo'));
      console.log(chalk.hex('#95afc0')('   Examples:'));
      console.log(chalk.hex('#95afc0')('     • ') + piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone') + ' facebook/react');
      console.log(chalk.hex('#95afc0')('     • ') + piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone') + ' gitlab:user/project');
      console.log(chalk.hex('#95afc0')('     • ') + piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone') + ' bitbucket:user/repo');
      return;
    }
    
    try {
      await cloneRepo(userRepo, projectName);
    } catch (error) {
      handleCommandError('clone repository', error as Error);
    }
  });

// ADD COMMAND - Add features to existing projects
program
  .command('add')
  .description(chalk.hex('#9c88ff')('➕ Add new features to your project'))
  .argument('[feature]', chalk.hex('#95afc0')('Feature to add (auth, docker) or --list to show all'))
  .option('-l, --list', chalk.hex('#95afc0')('list all available features'))
  .on('--help', () => {
    const piGradient = gradient(['#00c6ff', '#0072ff']);
    const headerGradient = gradient(['#4facfe', '#00f2fe']);
    
    console.log('\n' + boxen(
      headerGradient('➕ Add Command') + '\n\n' +
      chalk.white('Add powerful features to your existing project like authentication and Docker support.') + '\n\n' +
      chalk.cyan('Examples:') + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#9c88ff')('add')}                       # Interactive feature selection`) + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#9c88ff')('add')} --list               # List all available features`) + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#9c88ff')('add')} auth                 # Add authentication`) + '\n' +
      chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#9c88ff')('add')} docker               # Add Docker configuration`) + '\n\n' +
      chalk.hex('#00d2d3')('💡 Available Features:') + '\n' +
      chalk.hex('#95afc0')('  • auth - Authentication (Clerk, Auth0, NextAuth)') + '\n' +
      chalk.hex('#95afc0')('  • docker - Docker containerization') + '\n\n' +
      chalk.hex('#ffa502')('🎯 Supported Frameworks:') + '\n' +
      chalk.hex('#95afc0')('  Next.js, React, Express, NestJS, Vue.js, Angular, Remix, Rust'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        backgroundColor: '#0a0a0a'
      }
    ));
  })
  .action(async (feature, options) => {
    if (options.list) {
      feature = '--list';
    }
    
    try {
      await addCommand(feature);
    } catch (error) {
      handleCommandError('add feature', error as Error);
    }
  });

// UPGRADE-CLI COMMAND - Update CLI to latest version
program
  .command('upgrade-cli')
  .description(chalk.hex('#ff6b6b')('🚀 Update Package Installer CLI to the latest version'))
  .on('--help', () => {
    // Help is handled in the command file
  })
  .action(async () => {
    try {
      await upgradeCliCommand();
    } catch (error) {
      handleCommandError('upgrade CLI', error as Error);
    }
  });

// ANALYZE COMMAND - Terminal dashboard with analytics
program
  .command('analyze')
  .description(chalk.hex('#667eea')('📊 Show CLI usage analytics and framework statistics'))
  .on('--help', () => {
    // Help is handled in the command file
  })
  .action(async () => {
    try {
      await analyzeCommand();
    } catch (error) {
      handleCommandError('show analytics', error as Error);
    }
  });

// UPDATE COMMAND - Comprehensive package updater
program
  .command('update')
  .description(chalk.hex('#00d2d3')('🔄 Update packages across multiple languages'))
  .argument('[packages...]', chalk.hex('#95afc0')('Specific packages to update (optional)'))
  .option('--language <lang>', 'Update packages for specific language')
  .option('--all', 'Update all packages for detected languages')
  .option('--dry-run', 'Preview updates without making changes')
  .option('--force', 'Force updates even if version constraints might break')
  .option('--global', 'Update global packages')
  .option('--dev', 'Include development dependencies')
  .action(async (packages, options) => {
    try {
      showBanner();
      await updateCommand(packages, options);
    } catch (error) {
      handleCommandError('update packages', error as Error);
    }
  });

// CLEAN COMMAND - Clean development artifacts
program
  .command('clean')
  .alias('cleanup')
  .description(chalk.hex('#ffa502')('🧹 Clean development artifacts and caches'))
  .option('--node-modules', 'Clean node_modules directories')
  .option('--build', 'Clean build/dist directories')
  .option('--cache', 'Clean package manager caches')
  .option('--logs', 'Clean log files')
  .option('--all', 'Clean everything (safe)')
  .option('--deep', 'Deep clean (includes lock files)')
  .option('--dry-run', 'Preview what would be cleaned')
  .action(async (options) => {
    try {
      showBanner();
      await cleanCommand(options);
    } catch (error) {
      handleCommandError('clean', error as Error);
    }
  });

// ENVIRONMENT COMMAND - Environment analysis
program
  .command('env')
  .alias('environment')
  .description(chalk.hex('#10ac84')('🌍 Analyze development environment'))
  .option('--check', 'Check for missing or outdated tools')
  .option('--versions', 'Show versions of all detected tools')
  .option('--paths', 'Show installation paths')
  .option('--export', 'Export environment info to file')
  .option('--minimal', 'Show minimal environment info')
  .action(async (options) => {
    try {
      showBanner();
      await environmentCommand(options);
    } catch (error) {
      handleCommandError('environment', error as Error);
    }
  });

// DOCTOR COMMAND - Diagnose and fix issues
program
  .command('doctor')
  .alias('diagnose')
  .description(chalk.hex('#ff6b6b')('🩺 Diagnose and fix development issues'))
  .option('--fix', 'Automatically fix detected issues')
  .option('--check-deps', 'Check for dependency issues')
  .option('--check-config', 'Check configuration files')
  .option('--check-tools', 'Check development tools')
  .option('--verbose', 'Show detailed diagnostic information')
  .action(async (options) => {
    try {
      showBanner();
      await doctorCommand(options);
    } catch (error) {
      handleCommandError('doctor', error as Error);
    }
  });

// DEPLOY COMMAND - Future deployment features
program
  .command('deploy')
  .description(chalk.hex('#ff9a9e')('🚀 Deploy your project (Coming Soon)'))
  .on('--help', () => {
    // Help is handled in the command file
  })
  .action(async () => {
    try {
      await deployCommand();
    } catch (error) {
      handleCommandError('deploy project', error as Error);
    }
  });

// ENHANCED GLOBAL HELP - Beautiful examples and usage information
program.on('--help', () => {
  const exampleGradient = gradient(['#43e97b', '#38f9d7']);
  
  console.log('\n' + boxen(
    exampleGradient('🚀 Quick Start Examples') + '\n\n' +
    chalk.white('Create Projects:') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#10ac84')('create') + chalk.hex('#95afc0')(' my-app             # Interactive project creation') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#10ac84')('create') + chalk.hex('#95afc0')(' blog-app           # Create with specific name') + '\n\n' +
    chalk.white('Clone Repositories:') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone') + chalk.hex('#95afc0')(' facebook/react      # Clone popular repositories') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone') + chalk.hex('#95afc0')(' user/repo my-copy   # Clone with custom name') + '\n\n' +
    chalk.white('Check & Maintain:') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#f39c12')('check') + chalk.hex('#95afc0')('                     # Check all package versions') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#00d2d3')('update') + chalk.hex('#95afc0')(' --all               # Update all packages') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#ffa502')('clean') + chalk.hex('#95afc0')(' --build              # Clean build artifacts') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#ff6b6b')('doctor') + chalk.hex('#95afc0')(' --fix               # Diagnose and fix issues') + '\n\n' +
    chalk.white('Add Features:') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + chalk.hex('#95afc0')('                       # Browse available features') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + chalk.hex('#95afc0')(' auth                 # Add authentication') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + chalk.hex('#95afc0')(' docker               # Add Docker config') + '\n\n' +
    chalk.white('Analyze & Debug:') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#667eea')('analyze') + chalk.hex('#95afc0')('                  # Advanced project analytics') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#10ac84')('env') + chalk.hex('#95afc0')(' --check              # Check development environment') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#ff6b6b')('upgrade-cli') + chalk.hex('#95afc0')('              # Update CLI to latest version') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#ff9a9e')('deploy') + chalk.hex('#95afc0')('                   # Deploy project (coming soon)') + '\n\n' +
    chalk.hex('#00d2d3')('💡 Pro Tips:') + '\n' +
    chalk.hex('#95afc0')('  • Use ') + chalk.hex('#ff6b6b')('--help') + chalk.hex('#95afc0')(' with any command for detailed information') + '\n' +
    chalk.hex('#95afc0')('  • Most arguments are optional - CLI will prompt when needed') + '\n' +
    chalk.hex('#95afc0')('  • Check our templates: React, Next.js, Express, Nest.js, Rust & more!'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: '#10ac84',
      backgroundColor: '#001a00'
    }
  ));
});

// ENHANCED DEFAULT BEHAVIOR - Beautiful banner and help when no command provided
if (process.argv.length === 2) {
  showBanner();
  console.log('\n' + boxen(
    chalk.white('Welcome to Package Installer CLI! 👋') + '\n\n' +
    chalk.hex('#95afc0')('To get started, try one of these commands:') + '\n\n' +
    chalk.hex('#10ac84')('  ') + piGradient('pi') + ' ' + chalk.hex('#10ac84')('create           ') + chalk.hex('#95afc0')('# Create a new project') + '\n' +
    chalk.hex('#00d2d3')('  ') + piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone user/repo  ') + chalk.hex('#95afc0')('# Clone a GitHub repo') + '\n' +
    chalk.hex('#ff6b6b')('  ') + piGradient('pi') + ' ' + chalk.hex('#ff6b6b')('--help           ') + chalk.hex('#95afc0')('# See all available commands') + '\n\n' +
    chalk.hex('#ffa502')('🎯 Quick tip: All commands support --help for detailed usage!'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: '#00c6ff',
      backgroundColor: '#000a1a'
    }
  ));
}

// Parse command line arguments
program.parse();