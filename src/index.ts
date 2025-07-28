#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import inquirer from 'inquirer';
import * as fs from 'fs';
import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';

// Handle graceful exit on Ctrl+C
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Thanks for using Package Installer! Goodbye!'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
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
    case 'rust':
      return chalk.yellowBright;
    default:
      return chalk.blueBright;
  }
}

// Print the banner with the correct theme
function printBanner(framework: string) {
  const theme = getFrameworkTheme(framework);
  console.log(
    theme(
      figlet.textSync('Package Installer', { horizontalLayout: 'default' })
    )
  );
  console.log(theme(`🌟 Welcome to Package Installer CLI (pi)! 🌟\n`));
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

// Get the template directory path for the selected options
function getTemplateDir(
  framework: string,
  language: string,
  templateName: string,
  bundler?: string
) {
  if (bundler) {
    return path.join(templatesRoot, framework, bundler, language, templateName);
  }
  return path.join(templatesRoot, framework, language, templateName);
}

// Main CLI logic
async function main() {
  try {
    // Print initial banner
    console.log(
      chalk.cyanBright(
        figlet.textSync('Package Installer', { horizontalLayout: 'default' })
      )
    );
    console.log(chalk.cyanBright(`🌟 Welcome to Package Installer CLI! 🌟\n`));

    // 1. Choose framework (always first)
    const { framework } = await inquirer.prompt([
      {
        name: 'framework',
        type: 'list',
        message: chalk.yellow('🚀 Choose a framework:'),
        choices: frameworks.map(fw => ({
          name: capitalize(fw),
          value: fw
        })),
      },
    ]);

    const theme = getFrameworkTheme(framework);
    const fwConfig = templateConfig.frameworks[framework];

    let language: string | undefined = undefined;
    let bundler: string | undefined = undefined;
    let src = false, tailwind = false, ui: string | null = null;
    let templateName = '';

    // 2. Ask for language (JavaScript/TypeScript) for applicable frameworks
    if (fwConfig.languages && fwConfig.languages.length > 1) {
      language = (await inquirer.prompt([
        {
          name: 'language',
          type: 'list',
          message: theme('💻 Choose a language:'),
          choices: fwConfig.languages.map((lang: string) => ({
            name: capitalize(lang),
            value: lang
          })),
        },
      ])).language;
    } else if (fwConfig.languages && fwConfig.languages.length === 1) {
      language = fwConfig.languages[0];
    }

    // --- Framework-specific question flow ---

    if (framework === 'rust') {
      // Rust: Only ask for template type
      const { typeChoice } = await inquirer.prompt([
        {
          name: 'typeChoice',
          type: 'list',
          message: theme('🦀 Choose Rust template type:'),
          choices: [
            { name: chalk.green('Basic'), value: 'basic' },
            { name: chalk.blue('Advanced'), value: 'advance' }
          ]
        }
      ]);
      templateName = typeChoice === 'basic'
        ? `basic-rust-template`
        : `advance-rust-template`;
      language = 'rust';
    } else if (framework === 'expressjs') {
      // ExpressJS: Ask for template type
      const { typeChoice } = await inquirer.prompt([
        {
          name: 'typeChoice',
          type: 'list',
          message: theme('🚦 Select Express template type:'),
          choices: [
            { name: chalk.green('Basic'), value: 'basic' },
            { name: chalk.blue('Advanced'), value: 'advance' }
          ]
        }
      ]);
      templateName = typeChoice === 'basic'
        ? `basic-expressjs-template`
        : `advance-expressjs-template`;
    } else {

      // Ask for bundler if available
      if (fwConfig.bundlers && fwConfig.bundlers.length > 0) {
        bundler = (await inquirer.prompt([
          {
            name: 'bundler',
            type: 'list',
            message: theme('📦 Choose a bundler:'),
            choices: fwConfig.bundlers.map((b: string) => ({
              name: capitalize(b),
              value: b
            })),
          },
        ])).bundler;
      }

      // Ask for src directory if available
      if (fwConfig.options && fwConfig.options.includes('src')) {
        src = (await inquirer.prompt([
          {
            name: 'src',
            type: 'confirm',
            message: theme('📂 Do you want a src directory?'),
            default: true,
          },
        ])).src;
      }

      // Ask for Tailwind CSS if available
      if (fwConfig.options && fwConfig.options.includes('tailwind')) {
        tailwind = (await inquirer.prompt([
          {
            name: 'tailwind',
            type: 'confirm',
            message: theme('🎨 Do you want to use Tailwind CSS?'),
            default: false,
          },
        ])).tailwind;
      }

      // Ask for UI library if available
      if (fwConfig.ui && fwConfig.ui.length > 0) {
        const wantsUI = (await inquirer.prompt([
          {
            name: 'wantsUI',
            type: 'confirm',
            message: theme('🧩 Do you want to add a UI library?'),
            default: true,
          },
        ])).wantsUI;
        if (wantsUI) {
          ui = (await inquirer.prompt([
            {
              name: 'ui',
              type: 'list',
              message: theme('✨ Choose a UI library:'),
              choices: fwConfig.ui.map((u: string) => ({
                name: capitalize(u),
                value: u
              })),
            },
          ])).ui;
        }
      }

      // Compose template name for other frameworks
      const parts = [];
      parts.push(src ? 'src' : 'no-src');
      if (ui) parts.push(ui);
      parts.push(tailwind ? 'tailwind' : 'no-tailwind');
      templateName = parts.join('-') + '-template';
    }

    // 3. Ask for project folder name with "my-app" as placeholder
    const { filename } = await inquirer.prompt([
      {
        name: 'filename',
        type: 'input',
        message: theme('📁 Enter the project folder name:'),
        default: 'my-app',
        transformer: (input: string) => {
          return input || chalk.gray('my-app');
        },
        validate: function (input) {
          if (!input || input.trim() === '') return true; // allow empty, will use default
          if (/^([A-Za-z\-_\d])+$/.test(input.trim())) return true;
          else return chalk.red('Name may only include letters, numbers, underscores and dashes.');
        },
        filter: (input) => input && input.trim() ? input.trim() : 'my-app',
      },
    ]);

    // 4. Show summary with improved styling
    console.log(chalk.cyan('\n📋 Project Configuration Summary:'));
    console.log(chalk.gray('═'.repeat(40)));
    console.log(`  ${chalk.bold('Framework:')} ${theme(capitalize(framework))}`);
    if (language && language !== 'rust') console.log(`  ${chalk.bold('Language:')} ${theme(capitalize(language))}`);
    if (bundler) console.log(`  ${chalk.bold('Bundler:')} ${chalk.magenta(capitalize(bundler))}`);
    if (fwConfig.options && fwConfig.options.includes('src'))
      console.log(`  ${chalk.bold('Src directory:')} ${src ? chalk.green('✓ Yes') : chalk.red('✗ No')}`);
    if (fwConfig.options && fwConfig.options.includes('tailwind'))
      console.log(`  ${chalk.bold('Tailwind CSS:')} ${tailwind ? chalk.green('✓ Yes') : chalk.red('✗ No')}`);
    if (ui) console.log(`  ${chalk.bold('UI Library:')} ${chalk.blue(capitalize(ui))}`);
    console.log(`  ${chalk.bold('Template:')} ${chalk.yellow(templateName)}`);
    console.log(`  ${chalk.bold('Project Name:')} ${chalk.cyan(filename)}`);
    console.log(chalk.gray('═'.repeat(40)));

    // 5. Create the project
    let templateDir = '';
    if (framework === 'rust') {
      templateDir = path.join(templatesRoot, 'rust', templateName);
    } else if (framework === 'expressjs') {
      templateDir = path.join(templatesRoot, 'expressjs', language ?? '', templateName);
    } else {
      templateDir = getTemplateDir(framework, language ?? '', templateName, bundler);
    }

    const targetPath = path.join(process.cwd(), filename);
    if (!fs.existsSync(templateDir)) {
      console.error(chalk.red(`\n❌ Template not found: ${templateDir}`));
      return;
    }
    if (fs.existsSync(targetPath)) {
      console.error(chalk.red(`\n❌ Folder ${targetPath} already exists. Delete or use another name.`));
      return;
    }
    
    console.log(); // Add spacing before spinner
    const spinner = ora({
      text: theme('Creating your project...'),
      spinner: 'dots12',
    }).start();
    
    try {
      copyTemplateContents(templateDir, targetPath);
      spinner.succeed(theme(`✨ Project ${chalk.bold(filename)} created successfully!`));
      
      // Enhanced success message
      console.log();
      console.log(chalk.green('🎉 All done! Your project is ready to go!'));
      console.log();
      console.log(chalk.cyan('� Next steps:'));
      console.log(chalk.white(`   cd ${chalk.yellow(filename)}`));
      console.log(chalk.white('   npm install   ') + chalk.gray('# or pnpm install, yarn install'));
      console.log(chalk.white('   npm run dev   ') + chalk.gray('# start development server'));
      console.log();
      console.log(chalk.gray('💡 Global installation options:'));
      console.log(chalk.gray('   npm i -g pi           # or'));
      console.log(chalk.gray('   pnpm i -g pi          # or'));
      console.log(chalk.gray('   yarn global add pi'));
      console.log(chalk.magenta('Happy coding! 🚀'));
    } catch (err) {
      spinner.fail(chalk.red('Failed to create project.'));
      console.error(chalk.red('Error details:'), err);
    }
  } catch (err: any) {
    // Handle Ctrl+C and other prompt exits gracefully
    if (err && err.isTtyError) {
      console.error(chalk.red('❌ Terminal does not support interactive prompts.'));
    } else if (err && (err.message?.includes('User force closed') || err.message?.includes('canceled'))) {
      // Silent exit for user cancellation
      process.exit(0);
    } else {
      console.error(chalk.red('❌ An unexpected error occurred:'), err);
    }
    process.exit(1);
  }
}


program
  .name('pi')
  .description('Package Installer CLI')
  .usage('[options]')
  .helpOption('-h, --help', 'Display help for pi CLI')
  .addHelpText('beforeAll', () => {
    return (
      chalk.cyanBright(figlet.textSync('Package Installer', { horizontalLayout: 'default' })) +
      '\n' + chalk.cyanBright('🌟 Welcome to Package Installer CLI! 🌟') +
      '\n' + chalk.gray('A cross-platform CLI to scaffold modern web app templates.') +
      '\n\n' +
      chalk.yellow('Usage:') + '\n' +
      chalk.white('  pi') + chalk.gray('        # Start interactive project scaffolding') + '\n' +
      chalk.white('  pi -h') + chalk.gray('       # Show help') + '\n\n' +
      chalk.yellow('Features:') + '\n' +
      chalk.white('  - Multiple frameworks: Next.js, React, Vue, Angular, Express, Rust') + '\n' +
      chalk.white('  - Language support: JavaScript & TypeScript') + '\n' +
      chalk.white('  - UI libraries: Shadcn/ui, Material-UI, Headless UI') + '\n' +
      chalk.white('  - Bundler options: Vite and more') + '\n' +
      chalk.white('  - Cross-platform: Windows, macOS, Linux, WSL') + '\n' +
      chalk.white('  - Fast scaffolding: Get started in seconds') + '\n\n' +
      chalk.yellow('Example:') + '\n' +
      chalk.white('  pi') + chalk.gray('        # Start the CLI') + '\n' +
      chalk.white('  pi -h') + chalk.gray('       # Show this help message') + '\n\n' +
      chalk.gray('For more info, see README.md or visit https://github.com/0xshariq/package-installer-cli') + '\n'
    );
  })
  .action(main);

program.parse(process.argv);