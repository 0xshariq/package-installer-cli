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
  console.log(chalk.yellow('\n\n👋 Thanks for using Package Installer! Goodbye!'));
  console.log(chalk.cyanBright('💡 Remember: Always check your dependencies and README for next steps.')); 
  process.exit(0);
};

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);
process.on('SIGQUIT', gracefulExit);
process.on('SIGUSR1', gracefulExit);
process.on('SIGUSR2', gracefulExit);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(chalk.red('\n❌ An unexpected error occurred:'), err);
  gracefulExit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('\n❌ Unhandled promise rejection:'), reason);
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
  
  // ASCII art with gradient
  const asciiArt = figlet.textSync('Package Installer', { 
    horizontalLayout: 'default',
    font: 'Standard'
  });
  
  console.log(gradientText(asciiArt));
  
  // Enhanced version and description box
  const versionBox = boxen(
    chalk.cyanBright(`✨ Welcome to Package Installer CLI v${version} ✨\n`) +
    chalk.gray('The ultimate tool for creating modern web applications with style'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#1a1a1a'
    }
  );
  
  console.log(versionBox);
  
  // Enhanced stats box with better styling
  const statsBox = boxen(
    chalk.white(`${chalk.bold('📦 Frameworks:')} ${chalk.cyan(frameworks.length)} supported\n`) +
    chalk.white(`${chalk.bold('🚀 Templates:')} ${chalk.green('50+')} ready-to-use\n`) +
    chalk.white(`${chalk.bold('⚡ Speed:')} ${chalk.yellow('Instant')} project setup\n`) +
    chalk.white(`${chalk.bold('🎨 Styling:')} ${chalk.magenta('Beautiful')} UI components`),
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'green',
      backgroundColor: '#1a1a1a'
    }
  );
  
  console.log(statsBox);
  
  // Global info box
  const globalInfoBox = boxen(
    chalk.white(`${chalk.bold('🌍 Global Usage:')}\n`) +
    chalk.gray('  pi <project-name>          - Quick start\n') +
    chalk.gray('  package-installer <name>   - Full command\n') +
    chalk.gray('  pi .                       - Use current directory name'),
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'yellow',
      backgroundColor: '#1a1a1a'
    }
  );
  
  console.log(globalInfoBox);
  
  console.log();
  console.log(chalk.magenta('Happy coding! 🚀'));
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
function installDependencies(targetPath: string, theme: any) {
  const packageJsonPath = path.join(targetPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.yellow('⚠️  No package.json found, skipping dependency installation.'));
    return;
  }

  console.log();
  const spinner = createSpinner('📦 Installing dependencies...', theme);
  spinner.start();

  try {
    // Try pnpm first, then npm
    try {
      execSync('pnpm install', { cwd: targetPath, stdio: 'pipe' });
      spinner.succeed(theme('✨ Dependencies installed with pnpm!'));
    } catch {
      try {
        execSync('npm install', { cwd: targetPath, stdio: 'pipe' });
        spinner.succeed(theme('✨ Dependencies installed with npm!'));
      } catch {
        spinner.warn(chalk.yellow('⚠️  Could not install dependencies automatically.'));
        console.log(chalk.gray('💡 Please run "npm install" or "pnpm install" in your project directory.'));
      }
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to install dependencies.'));
    console.log(chalk.gray('💡 Please run "npm install" or "pnpm install" manually.'));
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
function showSuccessMessage(filename: string, targetPath: string, theme: any) {
  console.log();
  
  const successBox = boxen(
    chalk.green(`🎉 Project "${chalk.bold(filename)}" created successfully!\n\n`) +
    chalk.white(`${chalk.bold('📁 Location:')} ${chalk.cyan(targetPath)}\n`) +
    chalk.white(`${chalk.bold('🚀 Next steps:')}\n`) +
    chalk.gray(`  cd ${filename}\n`) +
    chalk.gray(`  npm run dev    # or pnpm dev\n`) +
    chalk.gray(`  npm run build  # or pnpm build\n\n`) +
    chalk.yellow('💡 Check the README.md file for detailed instructions!'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'green',
      backgroundColor: '#1a1a1a'
    }
  );
  
  console.log(successBox);
  
  // Quick commands box
  const commandsBox = boxen(
    chalk.white(`${chalk.bold('⚡ Quick Commands:')}\n`) +
    chalk.gray(`  cd ${filename}\n`) +
    chalk.gray(`  npm install\n`) +
    chalk.gray(`  npm run dev`),
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'blue',
      backgroundColor: '#1a1a1a'
    }
  );
  
  console.log(commandsBox);
}

// Main CLI logic with improved flow
async function main(projectNameArg?: string) {
  // Print initial banner
  printBanner();

  try {
    // 1. Project name - FIRST QUESTION (if not provided as argument)
    let filename = projectNameArg;
    if (filename === '.') {
      filename = path.basename(process.cwd());
      console.log(chalk.cyan(`📁 Using current directory name: ${chalk.bold(filename)}`));
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
        filename = path.basename(process.cwd());
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

    // 3. Language (if multiple) - THIRD QUESTION
    let language: string | undefined = undefined;
    if (fwConfig.languages && fwConfig.languages.length > 1) {
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

    // 5. Framework-specific questions - FIFTH QUESTION
    let templateName = '';
    let bundler: string | undefined = undefined;
    let src = false, tailwind = false;

    // Framework-specific questions
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

    // Show enhanced summary with better styling
    console.log(chalk.cyan('\n📋 Project Configuration Summary:'));
    console.log(chalk.gray('═'.repeat(60)));
    console.log(`  ${chalk.bold('Project Name:')} ${chalk.cyan(filename)}`);
    if (language && language !== 'rust') console.log(`  ${chalk.bold('Language:')} ${theme(capitalize(language))}`);
    console.log(`  ${chalk.bold('Framework:')} ${theme(capitalize(framework))}`);
    if (bundler) console.log(`  ${chalk.bold('Bundler:')} ${chalk.magenta(capitalize(bundler))}`);
    if (fwConfig.options && fwConfig.options.includes('src') && framework !== 'angularjs' && framework !== 'nestjs' && !(framework === 'reactjs' && bundler === 'vite'))
      console.log(`  ${chalk.bold('Src directory:')} ${src ? chalk.green('✓ Yes') : chalk.red('✗ No')}`);
    if (fwConfig.options && fwConfig.options.includes('tailwind') && framework !== 'nestjs')
      console.log(`  ${chalk.bold('Tailwind CSS:')} ${tailwind ? chalk.green('✓ Yes') : chalk.red('✗ No')}`);
    if (ui) console.log(`  ${chalk.bold('UI Library:')} ${chalk.blue(capitalize(ui))}`);
    console.log(`  ${chalk.bold('Template:')} ${chalk.yellow(templateName)}`);
    console.log(chalk.gray('═'.repeat(60)));

    // Create the project with proper template directory resolution
    let templateDir = '';
    if (framework === 'rust') {
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

    const targetPath = path.join(process.cwd(), filename ?? 'my-app');
    if (!fs.existsSync(templateDir)) {
      console.error(chalk.red(`\n❌ Template not found: ${templateDir}`));
      return;
    }
    if (fs.existsSync(targetPath) && filename !== path.basename(process.cwd())) {
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
      installDependencies(targetPath, theme);

      // Enhanced success message
      showSuccessMessage(filename ?? 'my-app', targetPath, theme);
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

// Main pi command
program
  .name('pi')
  .description('Package Installer CLI - The ultimate tool for creating modern web applications')
  .version(version, '-v, --version')
  .helpOption('-h, --help')
  .argument('[projectName]', 'Project name (use "." for current directory)')
  .action((projectName) => main(projectName));

// Also support package-installer command
const packageInstallerProgram = new Command('package-installer')
  .description('Package Installer CLI - The ultimate tool for creating modern web applications')
  .version(version, '-v, --version')
  .helpOption('-h, --help')
  .argument('[projectName]', 'Project name (use "." for current directory)')
  .action((projectName: string | undefined) => main(projectName));

program.addCommand(packageInstallerProgram);

program.parse(process.argv); 