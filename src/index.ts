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
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + chalk.hex('#95afc0')('                       # Browse available features') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + chalk.hex('#95afc0')(' auth                 # Add authentication') + '\n' +
    chalk.hex('#95afc0')('  ') + piGradient('pi') + ' ' + chalk.hex('#9c88ff')('add') + chalk.hex('#95afc0')(' docker               # Add Docker config') + '\n\n' +
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