#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';

// Import command handlers
import { createProject } from './commands/create.js';
import { checkCommand } from './commands/check.js';
import { cloneRepo } from './commands/clone.js';
import { addCommand } from './commands/add.js';

// Import utilities
import { showBanner, logError } from './utils/ui.js';

// Initialize CLI program
const program = new Command();

// Create beautiful gradient for CLI name
const gradientTitle = gradient(['#667eea', '#764ba2', '#f093fb']);
const piGradient = gradient(['#00c6ff', '#0072ff']);

// Configure main program with enhanced styling
program
  .name(piGradient('pi'))
  .description(
    gradientTitle('📦 Package Installer CLI - A modern, fast, and beautiful CLI tool to scaffold web applications') + '\n' +
    chalk.hex('#00c6ff')('   ✨ Fast • Modern • Production-Ready • Beautiful')
  )
  .version('2.1.3', chalk.hex('#ff6b6b')('-v, --version'), chalk.hex('#95afc0')('output the current version'))
  .helpOption(chalk.hex('#ff6b6b')('-h, --help'), chalk.hex('#95afc0')('display comprehensive help information'));

/**
 * Helper function to display command-specific help with beautiful styling
 */
function showCommandHelp(
  commandName: string, 
  usage: string, 
  examples: string[], 
  description?: string,
  icon?: string
) {
  const commandIcon = icon || '📦';
  const headerGradient = gradient(['#4facfe', '#00f2fe']);
  
  console.log('\n' + boxen(
    headerGradient(`${commandIcon} ${commandName} Command`) + '\n\n' +
    (description ? chalk.white(description) + '\n\n' : '') +
    chalk.cyan('Usage:') + '\n' +
    chalk.white(`  ${usage}`) + '\n\n' +
    chalk.cyan('Options:') + '\n' +
    chalk.gray('  -h, --help    Display help for this command') + '\n\n' +
    chalk.cyan('Examples:') + '\n' +
    examples.map(example => chalk.gray(`  ${example}`)).join('\n'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#0a0a0a'
    }
  ));
}

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
  .command(chalk.hex('#10ac84')('create'))
  .description(chalk.hex('#10ac84')('🚀 Create a new project from templates'))
  .argument('[project-name]', chalk.hex('#95afc0')('Project name (will prompt if not provided)'))
  .option(chalk.hex('#ff6b6b')('-h, --help'), chalk.hex('#95afc0')('display help for create command'))
  .action(async (projectName, options) => {
    if (options.help) {
      showCommandHelp(
        'Create',
        piGradient('pi') + ' ' + chalk.hex('#10ac84')('create') + ' [project-name]',
        [
          piGradient('pi') + ' ' + chalk.hex('#10ac84')('create') + ' my-awesome-app    # Create with specific name',
          piGradient('pi') + ' ' + chalk.hex('#10ac84')('create') + '                   # Interactive mode - will prompt for name',
          piGradient('pi') + ' ' + chalk.hex('#10ac84')('create') + ' ' + chalk.hex('#ff6b6b')('--help') + '            # Show this help message'
        ],
        'Create a new project from our curated collection of modern templates. ' +
        'Choose from React, Next.js, Express, Nest.js, Rust, and more!',
        '🚀'
      );
      return;
    }
    
    try {
      showBanner();
      await createProject(projectName);
    } catch (error) {
      handleCommandError('create project', error as Error);
    }
  });

// CHECK COMMAND - Package version checking and suggestions
program
  .command(chalk.hex('#f39c12')('check'))
  .description(chalk.hex('#f39c12')('🔍 Check package versions and get update suggestions'))
  .argument('[package-name]', chalk.hex('#95afc0')('Specific package to check (optional)'))
  .option(chalk.hex('#ff6b6b')('-h, --help'), chalk.hex('#95afc0')('display help for check command'))
  .action(async (packageName, options) => {
    if (options.help) {
      showCommandHelp(
        'Check',
        piGradient('pi') + ' ' + chalk.hex('#f39c12')('check') + ' [package-name]',
        [
          piGradient('pi') + ' ' + chalk.hex('#f39c12')('check') + '                    # Check all packages in current project',
          piGradient('pi') + ' ' + chalk.hex('#f39c12')('check') + ' react              # Check specific package version',
          piGradient('pi') + ' ' + chalk.hex('#f39c12')('check') + ' @types/node        # Check scoped packages',
          piGradient('pi') + ' ' + chalk.hex('#f39c12')('check') + ' ' + chalk.hex('#ff6b6b')('--help') + '             # Show this help message'
        ],
        'Check package versions in your project and get suggestions for updates. ' +
        'Helps you keep your dependencies up-to-date and secure.',
        '🔍'
      );
      return;
    }
    
    try {
      await checkCommand(packageName);
    } catch (error) {
      handleCommandError('check packages', error as Error);
    }
  });

// CLONE COMMAND - GitHub repository cloning
program
  .command(chalk.hex('#00d2d3')('clone'))
  .description(chalk.hex('#00d2d3')('📥 Clone a GitHub repository'))
  .argument('[user/repo]', chalk.hex('#95afc0')('GitHub repository in format "user/repo"'))
  .argument('[project-name]', chalk.hex('#95afc0')('Custom project name (defaults to repo name)'))
  .option(chalk.hex('#ff6b6b')('-h, --help'), chalk.hex('#95afc0')('display help for clone command'))
  .action(async (userRepo, projectName, options) => {
    if (options.help) {
      showCommandHelp(
        'Clone',
        piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone') + ' <user/repo> [project-name]',
        [
          piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone') + ' facebook/react my-react-copy    # Clone with custom name',
          piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone') + ' vercel/next.js                  # Clone with default name',
          piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone') + ' microsoft/TypeScript ts-copy    # Clone TypeScript repo',
          piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone') + ' ' + chalk.hex('#ff6b6b')('--help') + '                          # Show this help message'
        ],
        'Clone any public GitHub repository quickly and safely. ' +
        'Automatically installs dependencies and creates .env file from templates.',
        '📥'
      );
      return;
    }
    
    if (!userRepo) {
      console.log('\n' + chalk.hex('#ff4757')('❌ Error: GitHub repository is required'));
      console.log(chalk.hex('#95afc0')('   Format: user/repo (e.g., facebook/react)'));
      console.log(chalk.hex('#95afc0')('   Example: ') + piGradient('pi') + ' ' + chalk.hex('#00d2d3')('clone') + ' facebook/react');
      return;
    }
    
    try {
      await cloneRepo(userRepo, projectName);
    } catch (error) {
      handleCommandError('clone repository', error as Error);
    }
  });

// ADD COMMAND - Show "Coming Soon" message
program
  .command(chalk.hex('#9c88ff')('add'))
  .description(chalk.hex('#9c88ff')('➕ Add new features to your project'))
  .argument('[feature]', chalk.hex('#95afc0')('Feature to add (coming soon)'))
  .option(chalk.hex('#ff6b6b')('-h, --help'), chalk.hex('#95afc0')('display help for add command'))
  .action(async (feature, options) => {
    if (options.help) {
      showCommandHelp(
        'Add',
        piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + ' [feature]',
        [
          piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + '                       # Show available features (coming soon)',
          piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + ' auth                  # Add authentication setup (coming soon)',
          piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + ' database              # Add database configuration (coming soon)',
          piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + ' docker               # Add Docker configuration (coming soon)'
        ],
        'Add powerful features to your existing project. This feature is currently in development.',
        '➕'
      );
      return;
    }
    
    // Show coming soon message
    console.log('\n' + boxen(
      chalk.hex('#ffa502')('🚧 Coming Soon!') + '\n\n' +
      chalk.white('The "add" command is currently under development.') + '\n' +
      chalk.hex('#95afc0')('We\'re working hard to bring you awesome features like:') + '\n\n' +
      chalk.hex('#00d2d3')('• Authentication systems (Auth0, Firebase, Clerk)') + '\n' +
      chalk.hex('#00d2d3')('• Database integrations (MongoDB, PostgreSQL, MySQL)') + '\n' +
      chalk.hex('#00d2d3')('• Docker containerization') + '\n' +
      chalk.hex('#00d2d3')('• Testing frameworks (Jest, Cypress, Playwright)') + '\n' +
      chalk.hex('#00d2d3')('• CI/CD pipelines') + '\n\n' +
      chalk.white('Stay tuned for updates! 🎉'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: '#ffa502',
        backgroundColor: '#1a1a00'
      }
    ));
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
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#f39c12')('check') + chalk.hex('#95afc0')(' react               # Check specific package') + '\n\n' +
    chalk.white('Add Features:') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + chalk.hex('#95afc0')('                       # Browse available features (coming soon)') + '\n\n' +
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