/**
 * UI and display utilities
 */

import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import boxen from 'boxen';
import path from 'path';
import * as fs from 'fs';
import { ProjectOptions } from './types.js';


/**
 * Displays the CLI banner with beautiful styling
 */
export function printBanner(version: string, frameworkCount: number): void {
  console.clear();

  // Create a beautiful rainbow gradient
  const rainbowGradient = gradient(['#ff6b6b', '#ffa500', '#ffff00', '#32cd32', '#00bfff', '#8a2be2', '#ff1493']);
  const titleGradient = gradient(['#00d4aa', '#00a8ff', '#7c4dff']);
  const subtitleGradient = gradient(['#ffa726', '#ff7043']);

  // Create ASCII art for "Package Installer" - full name
  const titleArt = [
    '██████╗  █████╗  ██████╗██╗  ██╗ █████╗  ██████╗ ███████╗',
    '██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔════╝ ██╔════╝',
    '██████╔╝███████║██║     █████╔╝ ███████║██║  ███╗█████╗  ',
    '██╔═══╝ ██╔══██║██║     ██╔═██╗ ██╔══██║██║   ██║██╔══╝  ',
    '██║     ██║  ██║╚██████╗██║  ██╗██║  ██║╚██████╔╝███████╗',
    '╚═╝     ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝',
    '',
    '██╗███╗   ██╗███████╗████████╗ █████╗ ██╗     ██╗     ███████╗██████╗ ',
    '██║████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██║     ██║     ██╔════╝██╔══██╗',
    '██║██╔██╗ ██║███████╗   ██║   ███████║██║     ██║     █████╗  ██████╔╝',
    '██║██║╚██╗██║╚════██║   ██║   ██╔══██║██║     ██║     ██╔══╝  ██╔══██╗',
    '██║██║ ╚████║███████║   ██║   ██║  ██║███████╗███████╗███████╗██║  ██║',
    '╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝',
  ].join('\n');

  // Create the main title
  const subtitle = '🚀 The Ultimate Tool for Creating Modern Web Applications';
  const tagline = '✨ Fast • Modern • Production-Ready • Beautiful';

  // Create the banner content
  const bannerContent = 
    titleGradient(titleArt) + '\n\n' +
    subtitleGradient(subtitle) + '\n' +
    chalk.hex('#95afc0')(tagline);

  // Display banner with enhanced box
  console.log('\n' + boxen(
    bannerContent,
    {
      padding: { top: 1, bottom: 1, left: 3, right: 3 },
      margin: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: 'double',
      borderColor: 'cyan',
      backgroundColor: 'black',
      align: 'center'
    }
  ));

  // Version and framework info
  const statsGradient = gradient(['#667eea', '#764ba2']);
  const versionBox = boxen(
    statsGradient(`📦 Version: ${version}`) + '  •  ' + 
    statsGradient(`🎯 Frameworks: ${frameworkCount}+`) + '  •  ' + 
    statsGradient(`⚡ Ready to scaffold!`),
    {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: 'magenta',
      backgroundColor: 'black',
      align: 'center'
    }
  );

  console.log(versionBox);
}

/**
 * Displays project configuration summary
 */
export function showProjectSummary(options: ProjectOptions): void {
  const { framework, language, bundler, src, tailwind, ui, database, orm } = options;
  
  console.log(chalk.cyan('\n📋 Project Configuration Summary:'));
  console.log(chalk.gray('═'.repeat(60)));
  console.log(`  ${chalk.bold('Project Name:')} ${chalk.cyan(options.projectName || 'N/A')}`);
  
  if (language && language !== 'rust') {
    console.log(`  ${chalk.bold('Language:')} ${chalk.green(language.charAt(0).toUpperCase() + language.slice(1))}`);
  }
  
  console.log(`  ${chalk.bold('Framework:')} ${chalk.green(framework.charAt(0).toUpperCase() + framework.slice(1))}`);
  
  if (bundler) {
    console.log(`  ${chalk.bold('Bundler:')} ${chalk.magenta(bundler.charAt(0).toUpperCase() + bundler.slice(1))}`);
  }
  
  if (typeof src === 'boolean') {
    console.log(`  ${chalk.bold('Src directory:')} ${src ? chalk.green('✓ Yes') : chalk.red('✗ No')}`);
  }
  
  if (typeof tailwind === 'boolean') {
    console.log(`  ${chalk.bold('Tailwind CSS:')} ${tailwind ? chalk.green('✓ Yes') : chalk.red('✗ No')}`);
  }
  
  if (ui) {
    console.log(`  ${chalk.bold('UI Library:')} ${chalk.blue(ui.charAt(0).toUpperCase() + ui.slice(1))}`);
  }
  
  if (database) {
    console.log(`  ${chalk.bold('Database:')} ${chalk.cyan(database.charAt(0).toUpperCase() + database.slice(1))}`);
    if (orm) {
      console.log(`  ${chalk.bold('ORM:')} ${chalk.blue(orm.charAt(0).toUpperCase() + orm.slice(1))}`);
    }
  }

  if (framework.includes('+')) {
    console.log(`  ${chalk.bold('Type:')} ${chalk.green('Combination Template (Pre-configured)')}`);
  }
  
  console.log(chalk.gray('═'.repeat(60)));
}

/**
 * Shows combination template information
 */
export function showCombinationTemplateInfo(framework: string, database?: string, orm?: string): void {
  console.log(chalk.cyan('\n📋 Template includes:'));
  
  if (framework.includes('shadcn')) {
    console.log(chalk.green('  ✅ Shadcn/ui components'));
  }
  
  if (framework.includes('expressjs')) {
    console.log(chalk.green('  ✅ Express.js backend'));
  }
  
  if (framework.includes('nestjs')) {
    console.log(chalk.green('  ✅ NestJS backend'));
  }
  
  if (framework.includes('reactjs')) {
    console.log(chalk.green('  ✅ React.js frontend'));
  }
  
  if (database) {
    console.log(chalk.green(`  ✅ ${database.charAt(0).toUpperCase() + database.slice(1)} database`));
  }
  
  if (orm) {
    console.log(chalk.green(`  ✅ ${orm.charAt(0).toUpperCase() + orm.slice(1)} ORM`));
  }
  
  console.log(chalk.yellow('  💡 All configurations are pre-configured for optimal setup!'));
}

/**
 * Displays a beautifully styled success message after project creation
 */
export function showSuccessMessage(
  filename: string, 
  targetPath: string, 
  theme: any, 
  dependenciesInstalled: boolean = false, 
  framework?: string
): void {
  console.log();

  const isCurrentDirectory = filename === 'current directory' || filename === '.';
  const projectName = isCurrentDirectory ? path.basename(targetPath) : filename;
  const cdCommand = isCurrentDirectory ? '' : `cd ${filename}\n`;

  // Determine project type for appropriate command display
  const isRustProject = framework === 'rust' || fs.existsSync(path.join(targetPath, 'Cargo.toml'));
  const isCombinationTemplate = framework && framework.includes('+');
  const hasBackend = isCombinationTemplate && fs.existsSync(path.join(targetPath, 'backend'));
  
  // Set appropriate commands based on project type
  let devCommand, buildCommand, installCommand;

  if (isRustProject) {
    devCommand = `  cargo run`;
    buildCommand = `  cargo build`;
    installCommand = dependenciesInstalled ? '' : `  cargo build\n`;
  } else if (isCombinationTemplate && hasBackend) {
    devCommand = `  # Frontend (in project root)\n  npm run dev\n\n  # Backend (in backend folder)\n  cd backend && npm run dev`;
    buildCommand = `  # Frontend\n  npm run build\n\n  # Backend\n  cd backend && npm run build`;
    installCommand = dependenciesInstalled ? '' : `  # Install frontend dependencies\n  npm install\n\n  # Install backend dependencies\n  cd backend && npm install\n`;
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

  // Enhanced quick commands box
  const commandsBox = boxen(
    chalk.white(`${chalk.bold('⚡ Quick Commands:')}\n`) +
    chalk.gray(cdCommand) +
    chalk.gray(installCommand) +
    chalk.gray(isRustProject ? `  cargo run` : isCombinationTemplate && hasBackend ? `  # Start frontend\n  npm run dev\n\n  # Start backend\n  cd backend && npm run dev` : `  npm run dev`),
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

  // Tips box
  const tipsBox = boxen(
    chalk.white(`${chalk.bold('💡 Pro Tips:')}\n`) +
    chalk.gray('• Use ') + chalk.cyan('Ctrl+C') + chalk.gray(' to stop the development server\n') +
    chalk.gray('• Check ') + chalk.cyan('package.json') + chalk.gray(' for available scripts\n') +
    (isCombinationTemplate && hasBackend ? chalk.gray('• Run frontend and backend in separate terminals for better development experience\n') : '') +
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
 * Shows error message with proper styling
 */
export function showErrorMessage(title: string, message: string, details?: string): void {
  console.log();
  const errorBox = boxen(
    gradient(['#ff6b6b', '#ee5a24'])(`❌ ${title}`) + '\n\n' +
    chalk.red(message) + '\n\n' +
    chalk.gray(details || 'Please check your configuration and try again.'),
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

/**
 * Shows the main banner (alias for printBanner)
 */
export function showBanner(): void {
  printBanner('2.3.0', 10);
}

/**
 * Logs errors with proper formatting
 */
export function logError(message: string, error: Error): void {
  console.error(chalk.red(`❌ ${message}: ${error.message}`));
  if (process.env.DEBUG) {
    console.error(chalk.gray(error.stack));
  }
}

/**
 * Logs success messages with proper formatting
 */
export function logSuccess(message: string): void {
  console.log(chalk.green(`✅ ${message}`));
}
