#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import inquirer from 'inquirer';
import * as fs from 'fs';
import { program, Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';
import { execSync } from 'child_process';
import gradient from 'gradient-string';
import boxen from 'boxen';
import cliSpinners from 'cli-spinners';

// Read package.json to get version
const packageJsonPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

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

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load template config and set up paths
const templateConfigPath = path.join(__dirname, '..', 'template.json');
const templateConfig = JSON.parse(fs.readFileSync(templateConfigPath, 'utf8'));
const frameworks = Object.keys(templateConfig.frameworks);
const templatesRoot = path.join(__dirname, '..', 'templates');

// Utility: Capitalize first letter
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Utility: Cross-platform path handling
function normalizePath(inputPath: string): string {
  return path.normalize(inputPath).replace(/\\/g, '/');
}

// Utility: Get color theme for framework
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

// Enhanced banner with improved styling
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

// Enhanced progress spinner with custom styling
function createSpinner(text: string, theme: any) {
  return ora({
    text: theme(text),
    spinner: cliSpinners.dots12,
    color: 'cyan'
  });
}

// Recursively copy the contents of a directory into the target directory
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
      } catch {}
    }
  }
}

// Get template directory path
function getTemplateDir(
  framework: string,
  language: string,
  templateName: string,
  bundler?: string
) {
  const bundlerPath = bundler ? path.join(bundler, language) : language;
  return path.join(templatesRoot, framework, bundlerPath, templateName);
}

// Install dependencies with enhanced styling
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

// Enhanced project name validation
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

// Enhanced success message with better styling
function showSuccessMessage(filename: string, targetPath: string, theme: any, dependenciesInstalled: boolean = false, framework?: string) {
  console.log();
  
  const isCurrentDirectory = filename === 'current directory';
  const projectName = isCurrentDirectory ? path.basename(targetPath) : filename;
  const cdCommand = isCurrentDirectory ? '' : `cd ${filename}\n`;
  
  // Check if it's a Rust project
  const isRustProject = framework === 'rust' || fs.existsSync(path.join(targetPath, 'Cargo.toml'));
  
  // Determine commands based on project type
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

// Main CLI logic with improved flow
async function main(projectNameArg?: string) {
  // Print initial banner
  printBanner();

  try {
    // 1. Project name - FIRST QUESTION (if not provided as argument)
    let filename = projectNameArg;
    let useCurrentDirectory = false;
    
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

    // 2. Framework - SECOND QUESTION
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

    // Check if this is a combination template (has predefined templates)
    const isCombinationTemplate = fwConfig.templates && fwConfig.templates.length > 0;

    // Initialize templateName variable
    let templateName = '';

    // 3. Language (if multiple and not combination template) - THIRD QUESTION
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
          console.log(chalk.redBright('\n❌ Tailwind CSS is required for Headless UI in Vue.js.'));
          console.log(chalk.yellow('💡 Please select Tailwind CSS to continue with Vue.js setup.'));
          process.exit(1);
        }
        
        // Remixjs: If user selects shadcn but does NOT select tailwind, exit with message
        if (framework === 'remixjs' && ui === 'shadcn' && !tailwind) {
          console.log(chalk.redBright('\n❌ Tailwind CSS is required for shadcn/ui in Remix.'));
          console.log(chalk.yellow('💡 Please select Tailwind CSS to continue with Remix setup.'));
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
      console.error(chalk.red(`\n❌ Template not found: ${templateDir}`));
      return;
    }
    if (!useCurrentDirectory && fs.existsSync(targetPath)) {
      console.error(chalk.red(`\n❌ Folder ${targetPath} already exists. Delete or use another name.`));
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
      spinner.fail(chalk.red('Failed to create project.'));
      console.error(chalk.red('Error details:'), err);
    }
  } catch (err: any) {
    if (err && err.isTtyError) {
      console.error(chalk.red('❌ Terminal does not support interactive prompts.'));
    } else if (err && (err.message?.includes('User force closed') || err.message?.includes('canceled'))) {
      console.log(chalk.yellow('\n\n👋 Thanks for using Package Installer! Goodbye!'));
      console.log(chalk.cyanBright('💡 Remember: Always check your dependencies and README for next steps.')); 
      process.exit(0);
    } else {
      console.error(chalk.red('❌ An unexpected error occurred:'), err);
    }
    process.exit(1);
  }
}

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