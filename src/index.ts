#!/usr/bin/env node

/**
 * Package Installer CLI - The Ultimate Tool for Creating Modern Web Applications
 * 
 * This CLI tool allows users to quickly scaffold new projects with various frameworks,
 * languages, and UI libraries. It provides an interactive experience with beautiful
 * styling and comprehensive error handling.
 * 
 * @author Sharique Chaudhary
 * @version 2.0.0
 */

// Core Node.js imports
import { fileURLToPath } from 'url';
import path from 'path';
import * as fs from 'fs';

// Third-party library imports
import inquirer from 'inquirer';
import { program, Command } from 'commander';
import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';

// Local imports
import { TemplateConfig, ProjectOptions, FrameworkConfig } from './types.js';
import { 
  validateProjectName, 
  getFrameworkTheme, 
  frameworkSupportsDatabase,
  isCombinationTemplate 
} from './utils.js';
import { resolveTemplatePath, generateTemplateName } from './templateResolver.js';
import { 
  promptFrameworkSelection,
  promptLanguageSelection,
  promptTemplateSelection,
  promptDatabaseSelection,
  promptOrmSelection,
  promptUiSelection,
  promptBundlerSelection,
  promptSrcDirectory,
  promptTailwindCss,
  promptFrameworkSpecificOptions
} from './prompts.js';
import { copyTemplateContents, installDependencies } from './projectCreator.js';
import { 
  printBanner, 
  showProjectSummary, 
  showCombinationTemplateInfo, 
  showSuccessMessage, 
  showErrorMessage 
} from './ui.js';

// =============================================================================
// CONFIGURATION & CONSTANTS
// =============================================================================

/**
 * Load package.json to get CLI version and metadata
 */
const packageJsonPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

/**
 * ESM-safe __dirname equivalent
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load template configuration from template.json
 */
const templateConfigPath = path.join(__dirname, '..', 'template.json');
const templateConfig: TemplateConfig = JSON.parse(fs.readFileSync(templateConfigPath, 'utf8'));
const frameworks = Object.keys(templateConfig.frameworks);

/**
 * Set up template directory path
 */
const templatesRoot = path.join(__dirname, '..', 'templates');

// =============================================================================
// ERROR HANDLING & GRACEFUL EXIT
// =============================================================================

function showGoodbyeMessage(force = false) {
  console.log();
  if (force) {
    const forceBox = boxen(
      gradient(['#ff6b6b', '#ee5a24'])(`✋ Terminal closed forcefully!`) + '\n' +
      chalk.red('Some operations may not have completed.') + '\n\n' +
      chalk.yellow('💡 Please verify your project files and dependencies.') + '\n' +
      chalk.cyanBright('You can always rerun the CLI for a fresh setup.'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'red',
        backgroundColor: '#1a1a1a',
        title: '⚠️ Force Exit',
        titleAlignment: 'center'
      }
    );
    console.log(forceBox);
  } else {
    const goodbyeBox = boxen(
      gradient(['#667eea', '#764ba2'])(`👋 Thanks for using Package Installer!`) + '\n' +
      chalk.cyanBright('💡 Remember: Always check your dependencies and README for next steps.') + '\n' +
      chalk.yellow('⭐ Star the repo if you found it helpful!'),
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
  }
  process.exit(0);
}

const gracefulExit = () => showGoodbyeMessage(false);

// Process signal handlers
process.on('SIGINT', () => showGoodbyeMessage(true));
process.on('SIGTERM', gracefulExit);
process.on('SIGQUIT', gracefulExit);
process.on('SIGUSR1', gracefulExit);
process.on('SIGUSR2', gracefulExit);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  showErrorMessage('An unexpected error occurred', err.message || err.toString());
  gracefulExit();
});

process.on('unhandledRejection', (reason, promise) => {
  showErrorMessage('Unhandled promise rejection', String(reason));
  gracefulExit();
});

// =============================================================================
// MAIN CLI LOGIC
// =============================================================================

/**
 * Main CLI function that orchestrates the entire project creation process
 */
async function main(projectNameArg?: string) {
  // Print initial banner
  printBanner(version, frameworks.length);

  try {
    // Step 1: Handle project name
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

    // Step 2: Framework selection
    const framework = await promptFrameworkSelection(templateConfig);
    const theme = getFrameworkTheme(framework);
    const fwConfig: FrameworkConfig = templateConfig.frameworks[framework];

    // Initialize project options
    const options: ProjectOptions = {
      projectName: filename,
      framework,
      templateName: ''
    };

    // Step 3: Language selection
    options.language = await promptLanguageSelection(fwConfig, theme);

    // Step 4: Handle combination templates
    const isCombo = isCombinationTemplate(framework);
    if (isCombo && fwConfig.templates && fwConfig.templates.length > 0) {
      options.templateName = await promptTemplateSelection(fwConfig, theme);
    }

    // Step 5: Database selection (for frameworks that support it)
    if (frameworkSupportsDatabase(fwConfig)) {
      const allowNone = framework === 'nextjs' || framework === 'nestjs' || framework === 'expressjs';
      options.database = await promptDatabaseSelection(fwConfig, theme, allowNone);
      
      // ORM selection
      if (options.database && options.language) {
        options.orm = await promptOrmSelection(fwConfig, options.database, options.language, theme);
      }
    }

    // Step 6: UI library selection (skip for combination templates with predefined UI and certain frameworks)
    if (!isCombo && fwConfig.ui && fwConfig.ui.length > 0 && framework !== 'nestjs' && framework !== 'expressjs') {
      options.ui = await promptUiSelection(fwConfig, theme);
    }

    // Step 7: Framework-specific questions
    let typeChoice = '';
    if (!isCombo) {
      if (framework === 'rust' || framework === 'expressjs') {
        typeChoice = await promptFrameworkSpecificOptions(framework, theme);
      } else {
        // Bundler selection
        if (fwConfig.bundlers && fwConfig.bundlers.length > 0 && framework !== 'nestjs') {
          options.bundler = await promptBundlerSelection(fwConfig, theme);
        }

        // Src directory option
        if (fwConfig.options?.includes('src') && 
            framework !== 'angularjs' && 
            framework !== 'nestjs' && 
            framework !== 'expressjs' &&
            !(framework === 'reactjs' && options.bundler === 'vite')) {
          options.src = await promptSrcDirectory(theme);
        }

        // Tailwind CSS option
        if (fwConfig.options?.includes('tailwind') && 
            framework !== 'nestjs' && 
            framework !== 'expressjs') {
          options.tailwind = await promptTailwindCss(theme);
          
          // Validation for specific framework requirements
          if (framework === 'vuejs' && !options.tailwind) {
            showErrorMessage(
              'Tailwind CSS is required',
              'Tailwind CSS is required for Headless UI in Vue.js.',
              'Please select Tailwind CSS to continue with Vue.js setup.'
            );
            process.exit(1);
          }
          
          if (framework === 'remixjs' && options.ui === 'shadcn' && !options.tailwind) {
            showErrorMessage(
              'Tailwind CSS is required',
              'Tailwind CSS is required for shadcn/ui in Remix.',
              'Please select Tailwind CSS to continue with Remix setup.'
            );
            process.exit(1);
          }
        }
      }
    }

    // Step 8: Generate template name
    if (!options.templateName) {
      options.templateName = generateTemplateName(framework, fwConfig, {
        src: options.src,
        ui: options.ui,
        tailwind: options.tailwind,
        typeChoice
      });
    }

    // Step 9: Show project summary
    showProjectSummary(options);

    // Show combination template info if applicable
    if (isCombo) {
      showCombinationTemplateInfo(framework, options.database, options.orm);
    }

    // Step 10: Create the project
    const templateDir = resolveTemplatePath(options, fwConfig, templatesRoot);
    const targetPath = useCurrentDirectory ? process.cwd() : path.join(process.cwd(), filename ?? 'my-app');


    // Validate template directory exists
    if (!fs.existsSync(templateDir)) {
      showErrorMessage(
        'Template not found',
        `Template directory: ${templateDir}`,
        'Please check if the template exists or report this issue.'
      );
      return;
    }

    // Check if target directory already exists
    if (!useCurrentDirectory && fs.existsSync(targetPath)) {
      showErrorMessage(
        'Folder already exists',
        `Target path: ${targetPath}`,
        'Please delete the existing folder or use a different name.'
      );
      return;
    }

    // Copy template contents
    console.log();
    const ora = await import('ora');
    const cliSpinners = await import('cli-spinners');
    const spinner = ora.default({
      text: theme('🚀 Creating your project...'),
      spinner: cliSpinners.default.dots12,
      color: 'cyan'
    });
    spinner.start();

    try {
      copyTemplateContents(templateDir, targetPath);
      spinner.succeed(theme(`✨ Project ${chalk.bold(filename)} created successfully!`));

      // Install dependencies
      const dependenciesInstalled = installDependencies(targetPath, theme, framework);

      // Show success message
      showSuccessMessage(filename ?? 'my-app', targetPath, theme, dependenciesInstalled, framework);
    } catch (err) {
      spinner.fail(chalk.red('Failed to create project.'));
      showErrorMessage(
        'Failed to create project',
        err instanceof Error ? err.message : String(err),
        'Please check your permissions and try again.'
      );
    }

  } catch (err: any) {
    if (err && err.isTtyError) {
      showErrorMessage(
        'Terminal does not support interactive prompts',
        'Please use a terminal that supports interactive prompts.'
      );
    } else if (err && (err.message?.includes('User force closed') || err.message?.includes('canceled'))) {
      gracefulExit();
    } else {
      showErrorMessage(
        'An unexpected error occurred',
        err instanceof Error ? err.message : String(err),
        'Please report this issue if it persists.'
      );
    }
    process.exit(1);
  }
}

// =============================================================================
// CLI COMMAND SETUP
// =============================================================================

program
  .name('pi')
  .description(chalk.cyan('🚀 Package Installer CLI - The ultimate tool for creating modern web applications'))
  .version(chalk.green(version), '-v, --version')
  .helpOption('-h, --help', chalk.yellow('Display help information'))
  .argument('[projectName]', chalk.gray('Project name (use "." for current directory)'))
  .action((projectName) => main(projectName));

// Support package-installer command
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
  ${chalk.green('•')} ${chalk.white('10+ frameworks supported')}
  ${chalk.green('•')} ${chalk.white('Beautiful UI components (Shadcn, Material-UI, Headless UI)')}
  ${chalk.green('•')} ${chalk.white('TypeScript & JavaScript & Rust')}
  ${chalk.green('•')} ${chalk.white('Auto-dependency installation (pnpm, npm, cargo)')}
  ${chalk.green('•')} ${chalk.white('Database & ORM selection for backend frameworks')}
  ${chalk.green('•')} ${chalk.white('Combination templates (full-stack setups)')}
  ${chalk.green('•')} ${chalk.white('Cross-platform support (Windows, macOS, Linux, WSL)')}
  ${chalk.green('•')} ${chalk.white('Graceful exit and error messaging')}
  ${chalk.green('•')} ${chalk.white('Smart project name handling (use "." for current directory)')}
  ${chalk.green('•')} ${chalk.white('Enhanced project summary and styled CLI')}

${chalk.cyan('🗄️ Database Integration:')}
  ${chalk.white('• Next.js: Select database (PostgreSQL, MySQL, MongoDB, etc.) and compatible ORM')}
  ${chalk.white('• NestJS: MongoDB with Mongoose ORM support')}
  ${chalk.white('• Express.js: Full database and ORM selection support')}
  ${chalk.white('• Combination templates: Database and ORM selection for full-stack setups')}

${chalk.cyan('💡 Tips:')}
  ${chalk.yellow('•')} ${chalk.gray('Use interactive mode for full customization')}
  ${chalk.yellow('•')} ${chalk.gray('Check README.md for framework-specific instructions')}
  ${chalk.yellow('•')} ${chalk.gray('Template configuration is driven by template.json')}
`);

program.parse(process.argv);
