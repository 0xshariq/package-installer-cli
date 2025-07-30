#!/usr/bin/env node

/**
 * Package Installer CLI - The Ultimate Tool for Creating Modern Web Applications
 * 
 * This CLI tool allows users to quickly scaffold new projects with various frameworks,
 * languages, and UI libraries. It provides an interactive experience with beautiful
 * styling and comprehensive error handling.
 * 
 * @author Sharique Chaudhary
 * @version 1.4.1
 */

// Core Node.js imports
import { fileURLToPath } from 'url';
import path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

// Third-party library imports
import inquirer from 'inquirer';
import { program, Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';
import gradient from 'gradient-string';
import boxen from 'boxen';
import cliSpinners from 'cli-spinners';

// =============================================================================
// CONFIGURATION & CONSTANTS
// =============================================================================

/**
 * Load package.json to get CLI version and metadata
 * This is used for version display and CLI information
 */
const packageJsonPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

/**
 * ESM-safe __dirname equivalent
 * Required for ES modules compatibility
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load template configuration from template.json
 * This contains all available frameworks, languages, and templates
 */
const templateConfigPath = path.join(__dirname, '..', 'template.json');
const templateConfig = JSON.parse(fs.readFileSync(templateConfigPath, 'utf8'));
const frameworks = Object.keys(templateConfig.frameworks);

/**
 * Set up template directory path
 * This is where all project templates are stored
 */
const templatesRoot = path.join(__dirname, '..', 'templates');

// Handle graceful exit on Ctrl+C and other termination signals
const gracefulExit = () => {
  console.log();
  const goodbyeBox = boxen(
    gradient(['#667eea', '#764ba2'])(`👋 Thanks for using Package Installer!`) + '\n' +
    chalk.cyanBright('💡 Remember: Always check your dependencies and README for next steps.'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#1a1a1a',
      title: '✨ Goodbye',
      titleAlignment: 'center'
    }
  );
  console.log(goodbyeBox);
  process.exit(0);
};

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);
process.on('SIGQUIT', gracefulExit);
process.on('SIGUSR1', gracefulExit);
process.on('SIGUSR2', gracefulExit);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log();
  const errorBox = boxen(
    gradient(['#ff6b6b', '#ee5a24'])(`❌ An unexpected error occurred`) + '\n\n' +
    chalk.red(err.message || err.toString()) + '\n\n' +
    chalk.gray('Please report this issue if it persists.'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'red',
      backgroundColor: '#1a1a1a',
      title: '🚨 Error',
      titleAlignment: 'center'
    }
  );
  console.log(errorBox);
  gracefulExit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.log();
  const errorBox = boxen(
    gradient(['#ff6b6b', '#ee5a24'])(`❌ Unhandled promise rejection`) + '\n\n' +
    chalk.red(String(reason)) + '\n\n' +
    chalk.gray('Please report this issue if it persists.'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'red',
      backgroundColor: '#1a1a1a',
      title: '🚨 Error',
      titleAlignment: 'center'
    }
  );
  console.log(errorBox);
  gracefulExit();
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Capitalizes the first letter of a string
 * Used for displaying framework names and other text in a user-friendly format
 * 
 * @param str - The string to capitalize
 * @returns The string with the first letter capitalized
 * 
 * @example
 * capitalize('reactjs') // Returns 'Reactjs'
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Normalizes a file path for cross-platform compatibility
 * Converts Windows backslashes to forward slashes for consistency
 * 
 * @param inputPath - The path to normalize
 * @returns The normalized path with forward slashes
 * 
 * @example
 * normalizePath('C:\\Users\\name\\project') // Returns 'C:/Users/name/project'
 */
function normalizePath(inputPath: string): string {
  return path.normalize(inputPath).replace(/\\/g, '/');
}

/**
 * Returns the appropriate color theme for a given framework
 * Each framework has its own distinct color for better visual identification
 * 
 * @param framework - The framework name (case-insensitive)
 * @returns A chalk color function for the framework
 * 
 * @example
 * getFrameworkTheme('reactjs') // Returns chalk.cyanBright
 */
function getFrameworkTheme(framework: string) {
  switch (framework.toLowerCase()) {
    case 'react':
    case 'reactjs':
      return chalk.cyanBright;
    case 'nextjs':
      return chalk.whiteBright.bgBlack;
    case 'vue':
    case 'vuejs':
      return chalk.greenBright;
    case 'angular':
    case 'angularjs':
      return chalk.redBright;
    case 'express':
    case 'expressjs':
      return chalk.greenBright;
    case 'remix':
    case 'remixjs':
      return chalk.blueBright;
    case 'nestjs':
      return chalk.magentaBright;
    case 'rust':
      return chalk.yellowBright;
    default:
      return chalk.blueBright;
  }
}

/**
 * Displays the CLI banner with beautiful styling
 * Shows the Package Installer logo, version info, and quick start guide
 * Uses gradient colors and styled boxes for a professional appearance
 * 
 * @example
 * printBanner() // Displays the full banner with all information
 */
function printBanner() {
  console.clear();

  // Create gradient text with more vibrant colors
  const gradientText = gradient(['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7']);

  // Enhanced ASCII art with better spacing
  const banner = figlet.textSync('Package\nInstaller', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80
  });

  // Create a beautiful banner box
  const bannerBox = boxen(
    gradientText(banner) + '\n' +
    chalk.cyanBright('🚀 The Ultimate Tool for Creating Modern Web Applications') + '\n' +
    chalk.gray('✨ Fast • Modern • Production-Ready • Beautiful'),
    {
      padding: 2,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#1a1a1a',
      title: '✨ Package Installer CLI',
      titleAlignment: 'center'
    }
  );

  console.log(bannerBox);

  // Version and info
  const infoBox = boxen(
    chalk.white(`📦 Version: ${chalk.cyanBright(version)}`) + '\n' +
    chalk.white(`🌍 Framework Support: ${chalk.greenBright(frameworks.length + '+')} frameworks`) + '\n' +
    chalk.white(`⚡ Quick Start: ${chalk.yellowBright('pi <project-name>')}`),
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'blue',
      backgroundColor: '#1a1a1a'
    }
  );

  console.log(infoBox);
}

/**
 * Creates a styled progress spinner for loading states
 * Used during project creation and dependency installation
 * 
 * @param text - The text to display with the spinner
 * @param theme - The chalk color function to apply to the text
 * @returns An ora spinner instance
 * 
 * @example
 * const spinner = createSpinner('Creating project...', chalk.cyan);
 * spinner.start();
 * // ... do work ...
 * spinner.succeed('Project created!');
 */
function createSpinner(text: string, theme: any) {
  return ora({
    text: theme(text),
    spinner: cliSpinners.dots12,
    color: 'cyan'
  });
}

/**
 * Recursively copies template contents to the target directory
 * Handles files, directories, and symbolic links
 * Preserves file permissions and creates directories as needed
 * 
 * @param templateDir - The source template directory path
 * @param targetPath - The destination directory path
 * 
 * @example
 * copyTemplateContents('/templates/react', '/my-project')
 */
function copyTemplateContents(templateDir: string, targetPath: string) {
  if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });
  for (const entry of fs.readdirSync(templateDir, { withFileTypes: true })) {
    const srcPath = path.join(templateDir, entry.name);
    const destPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      copyTemplateContents(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const symlink = fs.readlinkSync(srcPath);
      fs.symlinkSync(symlink, destPath);
    } else {
      const data = fs.readFileSync(srcPath);
      fs.writeFileSync(destPath, data);
      try {
        const stat = fs.statSync(srcPath);
        fs.chmodSync(destPath, stat.mode);
      } catch { }
    }
  }
}

/**
 * Constructs the template directory path based on framework configuration
 * Handles different template structures for various frameworks
 * 
 * @param framework - The framework name (e.g., 'reactjs', 'nextjs')
 * @param language - The programming language (e.g., 'javascript', 'typescript')
 * @param templateName - The specific template name
 * @param bundler - Optional bundler name (e.g., 'vite')
 * @returns The full path to the template directory
 * 
 * @example
 * getTemplateDir('reactjs', 'typescript', 'shadcn-tailwind-template', 'vite')
 * // Returns: '/templates/reactjs/vite/typescript/shadcn-tailwind-template'
 */
function getTemplateDir(
  framework: string,
  language: string,
  templateName: string,
  bundler?: string
) {
  const bundlerPath = bundler ? path.join(bundler, language) : language;
  return path.join(templatesRoot, framework, bundlerPath, templateName);
}

/**
 * Installs project dependencies automatically
 * Handles both Node.js (npm/pnpm) and Rust (cargo) projects
 * Shows progress with styled spinners and appropriate messages
 * 
 * @param targetPath - The project directory path
 * @param theme - The chalk color function for styling
 * @param framework - Optional framework name for special handling
 * @returns true if installation succeeded, false otherwise
 * 
 * @example
 * const success = installDependencies('/my-project', chalk.cyan, 'rust');
 * if (success) console.log('Dependencies installed successfully!');
 */
function installDependencies(targetPath: string, theme: any, framework?: string): boolean {
  // Check if it's a Rust project
  const isRustProject = framework === 'rust' || fs.existsSync(path.join(targetPath, 'Cargo.toml'));

  if (isRustProject) {
    const cargoTomlPath = path.join(targetPath, 'Cargo.toml');
    if (!fs.existsSync(cargoTomlPath)) {
      console.log(chalk.yellow('⚠️  No Cargo.toml found, skipping dependency installation.'));
      return false;
    }

    console.log();
    const spinner = createSpinner('📦 Building Rust project (fetching dependencies)...', theme);
    spinner.start();

    try {
      execSync('cargo build', { cwd: targetPath, stdio: 'pipe' });
      spinner.succeed(theme('✨ Rust project built successfully! Dependencies fetched.'));
      return true;
    } catch (error) {
      spinner.warn(chalk.yellow('⚠️  Could not build Rust project automatically.'));
      console.log(chalk.gray('💡 Please run "cargo build" in your project directory to fetch dependencies.'));
      return false;
    }
  } else {
    // Handle Node.js projects
    const packageJsonPath = path.join(targetPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log(chalk.yellow('⚠️  No package.json found, skipping dependency installation.'));
      return false;
    }

    console.log();
    const spinner = createSpinner('📦 Installing dependencies...', theme);
    spinner.start();

    try {
      // Try pnpm first, then npm
      try {
        execSync('pnpm install', { cwd: targetPath, stdio: 'pipe' });
        spinner.succeed(theme('✨ Dependencies installed with pnpm!'));
        return true;
      } catch {
        try {
          execSync('npm install', { cwd: targetPath, stdio: 'pipe' });
          spinner.succeed(theme('✨ Dependencies installed with npm!'));
          return true;
        } catch {
          spinner.warn(chalk.yellow('⚠️  Could not install dependencies automatically.'));
          console.log(chalk.gray('💡 Please run "npm install" or "pnpm install" in your project directory.'));
          return false;
        }
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to install dependencies.'));
      console.log(chalk.gray('💡 Please run "npm install" or "pnpm install" manually.'));
      return false;
    }
  }
}

/**
 * Validates project names for compatibility and best practices
 * Ensures names are valid for file systems and package managers
 * 
 * @param name - The project name to validate
 * @returns true if valid, error message string if invalid
 * 
 * @example
 * const result = validateProjectName('my-app');
 * if (result === true) {
 *   // Name is valid
 * } else {
 *   console.log(result); // Error message
 * }
 */
function validateProjectName(name: string): string | true {
  if (!name || name.trim().length === 0) {
    return 'Project name cannot be empty';
  }

  if (name.length > 50) {
    return 'Project name is too long (max 50 characters)';
  }

  // Allow letters, numbers, underscores, dashes, and dots
  const validNameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!validNameRegex.test(name)) {
    return 'Project name may only include letters, numbers, underscores, dashes, and dots';
  }

  // Check for reserved names
  const reservedNames = ['node_modules', 'package.json', 'package-lock.json', 'pnpm-lock.yaml'];
  if (reservedNames.includes(name.toLowerCase())) {
    return `"${name}" is a reserved name`;
  }

  return true;
}

/**
 * Displays a beautifully styled success message after project creation
 * Shows project details, next steps, and quick commands
 * Adapts to different frameworks (Node.js vs Rust)
 * 
 * @param filename - The project name or 'current directory'
 * @param targetPath - The full path where the project was created
 * @param theme - The chalk color function for styling
 * @param dependenciesInstalled - Whether dependencies were installed successfully
 * @param framework - Optional framework name for command adaptation
 * 
 * @example
 * showSuccessMessage('my-app', '/path/to/my-app', chalk.cyan, true, 'reactjs');
 */
function showSuccessMessage(filename: string, targetPath: string, theme: any, dependenciesInstalled: boolean = false, framework?: string) {
  console.log();

  const isCurrentDirectory = filename === 'current directory';
  const projectName = isCurrentDirectory ? path.basename(targetPath) : filename;
  const cdCommand = isCurrentDirectory ? '' : `cd ${filename}\n`;

      // Determine project type for appropriate command display
    const isRustProject = framework === 'rust' || fs.existsSync(path.join(targetPath, 'Cargo.toml'));
    
    // Set appropriate commands based on project type (Rust vs Node.js)
    let devCommand, buildCommand, installCommand;

  if (isRustProject) {
    devCommand = `  cargo run`;
    buildCommand = `  cargo build`;
    installCommand = dependenciesInstalled ? '' : `  cargo build\n`; // Rust doesn't have separate install, build fetches dependencies
  } else {
    devCommand = `  npm run dev    # or pnpm dev`;
    buildCommand = `  npm run build  # or pnpm build`;
    installCommand = dependenciesInstalled ? '' : `  npm install\n`;
  }

  // Enhanced success box with gradient and better styling
  const successBox = boxen(
    gradient(['#43e97b', '#38f9d7'])(`🎉 Project "${chalk.bold(projectName)}" created successfully!`) + '\n\n' +
    chalk.white(`${chalk.bold('📁 Location:')} ${chalk.cyan(targetPath)}\n`) +
    chalk.white(`${chalk.bold('🚀 Next steps:')}\n`) +
    chalk.gray(cdCommand) +
    chalk.gray(devCommand + '\n') +
    chalk.gray(buildCommand + '\n\n') +
    chalk.yellow('💡 Check the README.md file for detailed instructions!'),
    {
      padding: 2,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'green',
      backgroundColor: '#1a1a1a',
      title: '✨ Success',
      titleAlignment: 'center'
    }
  );

  console.log(successBox);

  // Enhanced quick commands box with better styling
  const commandsBox = boxen(
    chalk.white(`${chalk.bold('⚡ Quick Commands:')}\n`) +
    chalk.gray(cdCommand) +
    chalk.gray(installCommand) +
    chalk.gray(isRustProject ? `  cargo run` : `  npm run dev`),
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'blue',
      backgroundColor: '#1a1a1a',
      title: '🚀 Ready to Code',
      titleAlignment: 'center'
    }
  );

  console.log(commandsBox);

  // Additional info box for framework-specific tips
  const tipsBox = boxen(
    chalk.white(`${chalk.bold('💡 Pro Tips:')}\n`) +
    chalk.gray('• Use ') + chalk.cyan('Ctrl+C') + chalk.gray(' to stop the development server\n') +
    chalk.gray('• Check ') + chalk.cyan('package.json') + chalk.gray(' for available scripts\n') +
    chalk.gray('• Visit the framework docs for advanced features'),
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'yellow',
      backgroundColor: '#1a1a1a',
      title: '💡 Tips',
      titleAlignment: 'center'
    }
  );

  console.log(tipsBox);
}

/**
 * Main CLI function that orchestrates the entire project creation process
 * Handles user interaction, template selection, and project generation
 * 
 * Flow:
 * 1. Display banner and welcome message
 * 2. Get project name (from args or interactive prompt)
 * 3. Select framework and configuration options
 * 4. Validate and create project
 * 5. Install dependencies
 * 6. Show success message and next steps
 * 
 * @param projectNameArg - Optional project name from command line arguments
 * 
 * @example
 * main('my-app') // Create project with name 'my-app'
 * main() // Interactive mode
 */
async function main(projectNameArg?: string) {
  // Print initial banner
  printBanner();

  try {
    // =============================================================================
    // STEP 1: PROJECT NAME HANDLING
    // =============================================================================
    
    // Handle project name from arguments or prompt user
    let filename = projectNameArg;
    let useCurrentDirectory = false;

    // Handle special case: '.' means use current directory name
    if (filename === '.') {
      useCurrentDirectory = true;
      filename = path.basename(process.cwd());
      console.log(chalk.cyan(`📁 Creating project in current directory: ${chalk.bold(process.cwd())}`));
    }

    if (!filename) {
      const { projectName } = await inquirer.prompt([
        {
          name: 'projectName',
          type: 'input',
          message: chalk.yellow('📁 Enter the project folder name:'),
          default: 'my-app',
          transformer: (input: string) => input || chalk.gray('my-app'),
          validate: validateProjectName,
          filter: (input) => input && input.trim() ? input.trim() : 'my-app',
        },
      ]);
      filename = projectName;
      if (filename === '.') {
        useCurrentDirectory = true;
        filename = path.basename(process.cwd());
        console.log(chalk.cyan(`📁 Creating project in current directory: ${chalk.bold(process.cwd())}`));
      }
    }

    // =============================================================================
    // STEP 2: FRAMEWORK SELECTION
    // =============================================================================
    
    // Present available frameworks to the user
    const { framework } = await inquirer.prompt([
      {
        name: 'framework',
        type: 'list',
        message: chalk.green('🚀 Choose a framework:'),
        choices: Object.keys(templateConfig.frameworks).map(fw => ({
          name: `${capitalize(fw)} ${chalk.gray('(Modern, Fast, Production-ready)')}`,
          value: fw
        })),
      },
    ]);
    const theme = getFrameworkTheme(framework);
    const fwConfig = templateConfig.frameworks[framework];

    // =============================================================================
    // STEP 3: TEMPLATE CONFIGURATION
    // =============================================================================
    
    // Determine if this is a combination template (pre-configured setup)
    const isCombinationTemplate = fwConfig.templates && fwConfig.templates.length > 0;

    // Initialize templateName variable
    let templateName = '';

    // Handle language selection for non-combination templates
    let language: string | undefined = undefined;
    if (!isCombinationTemplate && fwConfig.languages && fwConfig.languages.length > 1) {
      language = (await inquirer.prompt([
        {
          name: 'language',
          type: 'list',
          message: theme('💻 Choose a language:'),
          choices: fwConfig.languages.map((lang: string) => ({
            name: `${capitalize(lang)} ${chalk.gray('(Type-safe, Modern syntax)')}`,
            value: lang
          })),
        },
      ])).language;
    } else if (fwConfig.languages && fwConfig.languages.length === 1) {
      language = fwConfig.languages[0];
    }

    // 3.5. Template selection for combination templates
    if (isCombinationTemplate) {
      const { selectedTemplate } = await inquirer.prompt([
        {
          name: 'selectedTemplate',
          type: 'list',
          message: theme('📋 Choose your template:'),
          choices: fwConfig.templates!.map((template: string) => ({
            name: `${chalk.green(template)} ${chalk.gray('(Pre-configured setup)')}`,
            value: template
          })),
        },
      ]);
      templateName = selectedTemplate;

      // Show info about what's included in combination templates
      console.log(chalk.cyan('\n📋 Template includes:'));
      if (framework.includes('shadcn')) {
        console.log(chalk.green('  ✅ Shadcn/ui components'));
      }
      if (framework.includes('expressjs')) {
        console.log(chalk.green('  ✅ Express.js backend'));
      }
      if (framework.includes('reactjs')) {
        console.log(chalk.green('  ✅ React.js frontend'));
      }
      console.log(chalk.yellow('  💡 All configurations are pre-configured for optimal setup!'));
    }

    // 4. UI Libraries (if framework supports) - FOURTH QUESTION
    let ui: string | null = null;
    if (fwConfig.ui && fwConfig.ui.length > 0 && framework !== 'nestjs') {
      const wantsUI = (await inquirer.prompt([
        {
          name: 'wantsUI',
          type: 'confirm',
          message: theme('🧩 Do you want to add a UI library?'),
          default: true,
        },
      ])).wantsUI;
      if (wantsUI) {
        const uiPrompt = await inquirer.prompt([
          {
            name: 'ui',
            type: 'list',
            message: theme('✨ Choose a UI library:'),
            choices: fwConfig.ui.map((u: string) => ({
              name: `${capitalize(u)} ${chalk.gray('(Beautiful, Accessible components)')}`,
              value: u
            })),
          },
        ]);
        ui = uiPrompt.ui;
      }
    }

    // 5. Framework-specific questions - FIFTH QUESTION (skip for combination templates)
    let bundler: string | undefined = undefined;
    let src = false, tailwind = false;

    // Framework-specific questions (only for non-combination templates)
    if (!isCombinationTemplate) {
      if (framework === 'rust') {
        const { typeChoice } = await inquirer.prompt([
          {
            name: 'typeChoice',
            type: 'list',
            message: theme('🦀 Choose Rust template type:'),
            choices: [
              { name: `${chalk.green('Basic')} ${chalk.gray('(Simple, Clean structure)')}`, value: 'basic' },
              { name: `${chalk.blue('Advanced')} ${chalk.gray('(Full-featured, Production-ready)')}`, value: 'advance' }
            ]
          }
        ]);
        templateName = typeChoice === 'basic' ? 'basic-rust-template' : 'advance-rust-template';
      } else if (framework === 'expressjs') {
        const { typeChoice } = await inquirer.prompt([
          {
            name: 'typeChoice',
            type: 'list',
            message: theme('🚦 Select Express template type:'),
            choices: [
              { name: `${chalk.green('Basic')} ${chalk.gray('(Simple API structure)')}`, value: 'basic' },
              { name: `${chalk.blue('Advanced')} ${chalk.gray('(Full-stack with auth, DB)')}`, value: 'advance' }
            ]
          }
        ]);
        templateName = typeChoice === 'basic' ? 'basic-expressjs-template' : 'advance-expressjs-template';
      } else if (framework === 'nestjs') {
        // NestJS uses a simple template structure
        templateName = 'template';
      } else if (framework === 'remixjs') {
        // Remix uses template composition like other frameworks
        // Template name will be composed below
      } else {
        // Ask for bundler if available and NOT nestjs
        if (fwConfig.bundlers && fwConfig.bundlers.length > 0 && framework !== 'nestjs') {
          bundler = (await inquirer.prompt([
            {
              name: 'bundler',
              type: 'list',
              message: theme('📦 Choose a bundler:'),
              choices: fwConfig.bundlers.map((b: string) => ({
                name: `${capitalize(b)} ${chalk.gray('(Fast, Modern build tool)')}`,
                value: b
              })),
            },
          ])).bundler;
        }

        // Ask for src directory if available and NOT angularjs and NOT reactjs with vite and NOT nestjs
        if (fwConfig.options && fwConfig.options.includes('src') && framework !== 'angularjs' && framework !== 'nestjs' && !(framework === 'reactjs' && bundler === 'vite')) {
          src = (await inquirer.prompt([
            {
              name: 'src',
              type: 'confirm',
              message: theme('📂 Do you want a src directory?'),
              default: true,
            },
          ])).src;
        }

        // Ask for Tailwind CSS if available and NOT nestjs
        if (fwConfig.options && fwConfig.options.includes('tailwind') && framework !== 'nestjs') {
          tailwind = (await inquirer.prompt([
            {
              name: 'tailwind',
              type: 'confirm',
              message: theme('🎨 Do you want to use Tailwind CSS?'),
              default: false,
            },
          ])).tailwind;

                  // Vuejs: If user does NOT select tailwind, exit with message
        if (framework === 'vuejs' && !tailwind) {
          console.log();
          const errorBox = boxen(
            gradient(['#ff6b6b', '#ee5a24'])(`❌ Tailwind CSS is required`) + '\n\n' +
            chalk.red('Tailwind CSS is required for Headless UI in Vue.js.') + '\n\n' +
            chalk.gray('Please select Tailwind CSS to continue with Vue.js setup.'),
            {
              padding: 1,
              margin: 1,
              borderStyle: 'round',
              borderColor: 'red',
              backgroundColor: '#1a1a1a',
              title: '🚨 Validation Error',
              titleAlignment: 'center'
            }
          );
          console.log(errorBox);
          process.exit(1);
        }
        
        // Remixjs: If user selects shadcn but does NOT select tailwind, exit with message
        if (framework === 'remixjs' && ui === 'shadcn' && !tailwind) {
          console.log();
          const errorBox = boxen(
            gradient(['#ff6b6b', '#ee5a24'])(`❌ Tailwind CSS is required`) + '\n\n' +
            chalk.red('Tailwind CSS is required for shadcn/ui in Remix.') + '\n\n' +
            chalk.gray('Please select Tailwind CSS to continue with Remix setup.'),
            {
              padding: 1,
              margin: 1,
              borderStyle: 'round',
              borderColor: 'red',
              backgroundColor: '#1a1a1a',
              title: '🚨 Validation Error',
              titleAlignment: 'center'
            }
          );
          console.log(errorBox);
          process.exit(1);
        }
        }

        // Compose template name for other frameworks
        const parts = [];
        if (fwConfig.options && fwConfig.options.includes('src') && framework !== 'angularjs' && framework !== 'nestjs' && !(framework === 'reactjs' && bundler === 'vite')) {
          parts.push(src ? 'src' : 'no-src');
        }
        if (ui) parts.push(ui);
        if (fwConfig.options && fwConfig.options.includes('tailwind') && framework !== 'nestjs') {
          parts.push(tailwind ? 'tailwind' : 'no-tailwind');
        }
        templateName = parts.length > 0 ? parts.join('-') + '-template' : '';
        if (framework === 'angularjs' && ui && tailwind) {
          templateName = 'material-ui-tailwind-template';
        } else if (framework === 'angularjs' && ui && !tailwind) {
          templateName = 'material-ui-no-tailwind-template';
        } else if (framework === 'angularjs' && !ui && !tailwind) {
          templateName = 'no-material-no-tailwind-template';
        } else if (framework === 'remixjs' && ui === 'shadcn' && tailwind) {
          templateName = 'shadcn-tailwind-template';
        } else if (framework === 'remixjs' && !ui && !tailwind) {
          templateName = 'no-shadcn-no-tailwind-template';
        } else if (framework === 'remixjs' && !ui && tailwind) {
          templateName = 'no-shadcn-tailwind-template';
        }
      }
    }

    // Show enhanced summary with better styling
    console.log(chalk.cyan('\n📋 Project Configuration Summary:'));
    console.log(chalk.gray('═'.repeat(60)));
    console.log(`  ${chalk.bold('Project Name:')} ${chalk.cyan(filename)}`);
    if (!isCombinationTemplate && language && language !== 'rust') console.log(`  ${chalk.bold('Language:')} ${theme(capitalize(language))}`);
    console.log(`  ${chalk.bold('Framework:')} ${theme(capitalize(framework))}`);
    if (!isCombinationTemplate && bundler) console.log(`  ${chalk.bold('Bundler:')} ${chalk.magenta(capitalize(bundler))}`);
    if (!isCombinationTemplate && fwConfig.options && fwConfig.options.includes('src') && framework !== 'angularjs' && framework !== 'nestjs' && !(framework === 'reactjs' && bundler === 'vite'))
      console.log(`  ${chalk.bold('Src directory:')} ${src ? chalk.green('✓ Yes') : chalk.red('✗ No')}`);
    if (!isCombinationTemplate && fwConfig.options && fwConfig.options.includes('tailwind') && framework !== 'nestjs')
      console.log(`  ${chalk.bold('Tailwind CSS:')} ${tailwind ? chalk.green('✓ Yes') : chalk.red('✗ No')}`);
    if (!isCombinationTemplate && ui) console.log(`  ${chalk.bold('UI Library:')} ${chalk.blue(capitalize(ui))}`);
    console.log(`  ${chalk.bold('Template:')} ${chalk.yellow(templateName)}`);
    if (isCombinationTemplate) {
      console.log(`  ${chalk.bold('Type:')} ${chalk.green('Combination Template (Pre-configured)')}`);
    }
    console.log(chalk.gray('═'.repeat(60)));

    // Create the project with proper template directory resolution
    let templateDir = '';
    if (isCombinationTemplate) {
      // For combination templates, use the framework name as directory
      templateDir = path.join(templatesRoot, framework, templateName);
    } else if (framework === 'rust') {
      templateDir = path.join(templatesRoot, 'rust', templateName);
    } else if (framework === 'expressjs') {
      templateDir = path.join(templatesRoot, 'expressjs', language ?? '', templateName);
    } else if (framework === 'nestjs') {
      templateDir = path.join(templatesRoot, 'nestjs', language ?? '', templateName);
    } else if (framework === 'remixjs') {
      templateDir = getTemplateDir(framework, language ?? '', templateName, bundler);
    } else {
      templateDir = getTemplateDir(framework, language ?? '', templateName, bundler);
    }

    const targetPath = useCurrentDirectory ? process.cwd() : path.join(process.cwd(), filename ?? 'my-app');
    if (!fs.existsSync(templateDir)) {
      console.log();
      const errorBox = boxen(
        gradient(['#ff6b6b', '#ee5a24'])(`❌ Template not found`) + '\n\n' +
        chalk.red(`Template directory: ${templateDir}`) + '\n\n' +
        chalk.gray('Please check if the template exists or report this issue.'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'red',
          backgroundColor: '#1a1a1a',
          title: '🚨 Error',
          titleAlignment: 'center'
        }
      );
      console.log(errorBox);
      return;
    }
    if (!useCurrentDirectory && fs.existsSync(targetPath)) {
      console.log();
      const errorBox = boxen(
        gradient(['#ff6b6b', '#ee5a24'])(`❌ Folder already exists`) + '\n\n' +
        chalk.red(`Target path: ${targetPath}`) + '\n\n' +
        chalk.gray('Please delete the existing folder or use a different name.'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'red',
          backgroundColor: '#1a1a1a',
          title: '🚨 Error',
          titleAlignment: 'center'
        }
      );
      console.log(errorBox);
      return;
    }

    console.log();
    const spinner = createSpinner('🚀 Creating your project...', theme);
    spinner.start();

    try {
      copyTemplateContents(templateDir, targetPath);
      spinner.succeed(theme(`✨ Project ${chalk.bold(filename)} created successfully!`));

      // Install dependencies automatically
      const dependenciesInstalled = installDependencies(targetPath, theme, framework);

      // Enhanced success message
      showSuccessMessage(useCurrentDirectory ? 'current directory' : (filename ?? 'my-app'), targetPath, theme, dependenciesInstalled, framework);
    } catch (err) {
      // Handle project creation errors with styled error messages
      spinner.fail(chalk.red('Failed to create project.'));
      console.log();
      const errorBox = boxen(
        gradient(['#ff6b6b', '#ee5a24'])(`❌ Failed to create project`) + '\n\n' +
        chalk.red(err instanceof Error ? err.message : String(err)) + '\n\n' +
        chalk.gray('Please check your permissions and try again.'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'red',
          backgroundColor: '#1a1a1a',
          title: '🚨 Error',
          titleAlignment: 'center'
        }
      );
      console.log(errorBox);
    }
  } catch (err: any) {
    if (err && err.isTtyError) {
      console.log();
      const errorBox = boxen(
        gradient(['#ff6b6b', '#ee5a24'])(`❌ Terminal does not support interactive prompts`) + '\n\n' +
        chalk.gray('Please use a terminal that supports interactive prompts.'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'red',
          backgroundColor: '#1a1a1a',
          title: '🚨 Error',
          titleAlignment: 'center'
        }
      );
      console.log(errorBox);
    } else if (err && (err.message?.includes('User force closed') || err.message?.includes('canceled'))) {
      gracefulExit();
    } else {
      console.log();
      const errorBox = boxen(
        gradient(['#ff6b6b', '#ee5a24'])(`❌ An unexpected error occurred`) + '\n\n' +
        chalk.red(err instanceof Error ? err.message : String(err)) + '\n\n' +
        chalk.gray('Please report this issue if it persists.'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'red',
          backgroundColor: '#1a1a1a',
          title: '🚨 Error',
          titleAlignment: 'center'
        }
      );
      console.log(errorBox);
    }
    process.exit(1);
  }
}

// =============================================================================
// CLI COMMAND SETUP
// =============================================================================

/**
 * Set up the main CLI commands with enhanced styling and help text
 * Supports both 'pi' and 'package-installer' commands
 * Provides comprehensive help with examples and features
 */

// Enhanced CLI commands with better styling
program
  .name('pi')
  .description(chalk.cyan('🚀 Package Installer CLI - The ultimate tool for creating modern web applications'))
  .version(chalk.green(version), '-v, --version')
  .helpOption('-h, --help', chalk.yellow('Display help information'))
  .argument('[projectName]', chalk.gray('Project name (use "." for current directory)'))
  .action((projectName) => main(projectName));

// Also support package-installer command with enhanced styling
const packageInstallerProgram = new Command('package-installer')
  .description(chalk.cyan('🚀 Package Installer CLI - The ultimate tool for creating modern web applications'))
  .version(chalk.green(version), '-v, --version')
  .helpOption('-h, --help', chalk.yellow('Display help information'))
  .argument('[projectName]', chalk.gray('Project name (use "." for current directory)'))
  .action((projectName: string | undefined) => main(projectName));

program.addCommand(packageInstallerProgram);

// Enhanced help text
program.addHelpText('after', `

${chalk.cyan('📦 Examples:')}
  ${chalk.gray('$')} pi my-app                    ${chalk.white('Create a new project')}
  ${chalk.gray('$')} pi .                         ${chalk.white('Use current directory name')}
  ${chalk.gray('$')} package-installer my-app     ${chalk.white('Full command name')}

${chalk.cyan('🎯 Features:')}
  ${chalk.green('•')} ${chalk.white('8+ frameworks supported')}
  ${chalk.green('•')} ${chalk.white('Beautiful UI components')}
  ${chalk.green('•')} ${chalk.white('TypeScript & JavaScript')}
  ${chalk.green('•')} ${chalk.white('Auto-dependency installation')}

${chalk.cyan('💡 Tips:')}
  ${chalk.yellow('•')} ${chalk.gray('Use interactive mode for full customization')}
  ${chalk.yellow('•')} ${chalk.gray('Check README.md for framework-specific instructions')}
  ${chalk.yellow('•')} ${chalk.gray('Visit docs for advanced features')}
`);

program.parse(process.argv);