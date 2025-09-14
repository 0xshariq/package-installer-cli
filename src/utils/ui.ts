/**
 * UI and display utilities for Package Installer CLI v3.0.0
 * Enhanced with modern styling, progress indicators, and better user experience
 */

import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import boxen from 'boxen';
import cliSpinners from 'cli-spinners';
import ora from 'ora';
import path from 'path';
import * as fs from 'fs';
import { ProjectOptions, FeatureConfig, InstallationProgress, ProgressCallback } from './types.js';

/**
 * Enhanced banner display with dynamic statistics
 */
export function printBanner(version: string, frameworkCount: number, templateCount: number = 0): void {
  console.clear();

  // Blue gradient themes for consistent branding
  const titleGradient = gradient(['#0072ff', '#00c6ff', '#0072ff']);
  const subtitleGradient = gradient(['#667eea', '#764ba2', '#667eea']);
  const taglineGradient = gradient(['#00c6ff', '#0072ff']);

  // Create ASCII art for "PACKAGE" and "INSTALLER" separately
  const packageArt = figlet.textSync('PACKAGE', {
    font: 'ANSI Shadow',
    horizontalLayout: 'fitted',
    verticalLayout: 'default'
  });

  const installerArt = figlet.textSync('INSTALLER', {
    font: 'ANSI Shadow',
    horizontalLayout: 'fitted',
    verticalLayout: 'default'
  });

  // Enhanced subtitle and tagline
  const subtitle = '🚀 The Ultimate Modern Project Scaffolding Tool';
  const tagline = '✨ Fast • Smart • Feature-Rich • Production-Ready';
  const description = '💡 Create stunning web applications with integrated features in seconds';

  // Create the banner content with better spacing - package and installer on separate lines
  const bannerContent = 
    titleGradient(packageArt) + '\n' +
    titleGradient(installerArt) + '\n\n' +
    subtitleGradient(subtitle) + '\n' +
    taglineGradient(tagline) + '\n' +
    chalk.hex('#95afc0')(description);

  // Enhanced box with rounded corners and blue theme styling
  console.log('\n' + boxen(
    bannerContent,
    {
      padding: { top: 1, bottom: 1, left: 4, right: 4 },
      margin: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: 'double',
      borderColor: 'blueBright',
      backgroundColor: 'black',
      align: 'center'
    }
  ));

  // Enhanced statistics with more information
  const statsContent = [
    `${chalk.bold('📦 Version:')} ${chalk.cyan(version)}`,
    `${chalk.bold('🎯 Frameworks:')} ${chalk.green(frameworkCount + '+')}`,
    templateCount > 0 ? `${chalk.bold('📋 Templates:')} ${chalk.blue(templateCount + '+')}` : '',
    `${chalk.bold('⚡ Status:')} ${chalk.greenBright('Ready to scaffold!')}`
  ].filter(Boolean).join('  •  ');

  const statsBox = boxen(
    statsContent,
    {
      padding: { top: 0, bottom: 0, left: 3, right: 3 },
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: 'blue',
      backgroundColor: 'black',
      align: 'center'
    }
  );

  console.log(statsBox);
}

/**
 * Enhanced project configuration summary with features display
 */
export function showProjectSummary(options: ProjectOptions, selectedFeatures: Array<{ feature: string; provider?: string }> = []): void {
  const { framework, language, bundler, src, tailwind, ui } = options;
  
  console.log(chalk.cyan('\n📋 Project Configuration Summary:'));
  console.log(chalk.gray('═'.repeat(70)));
  
  // Basic project information
  console.log(`  ${chalk.bold('🏷️  Project Name:')} ${chalk.cyan(options.projectName || 'N/A')}`);
  console.log(`  ${chalk.bold('🚀 Framework:')} ${chalk.green(framework.charAt(0).toUpperCase() + framework.slice(1))}`);
  
  if (language && language !== 'rust') {
    console.log(`  ${chalk.bold('💻 Language:')} ${chalk.yellow(language.charAt(0).toUpperCase() + language.slice(1))}`);
  }
  
  if (bundler) {
    console.log(`  ${chalk.bold('📦 Bundler:')} ${chalk.magenta(bundler.charAt(0).toUpperCase() + bundler.slice(1))}`);
  }
  
  // Configuration options
  if (typeof src === 'boolean') {
    console.log(`  ${chalk.bold('📁 Src Directory:')} ${src ? chalk.green('✓ Enabled') : chalk.red('✗ Disabled')}`);
  }
  
  if (typeof tailwind === 'boolean') {
    console.log(`  ${chalk.bold('🎨 Tailwind CSS:')} ${tailwind ? chalk.green('✓ Enabled') : chalk.red('✗ Disabled')}`);
  }
  
  if (ui) {
    console.log(`  ${chalk.bold('🎭 UI Library:')} ${chalk.blue(ui.charAt(0).toUpperCase() + ui.slice(1))}`);
  }

  // Enhanced features section
  if (selectedFeatures.length > 0) {
    console.log(chalk.gray('─'.repeat(70)));
    console.log(`  ${chalk.bold('🔧 Selected Features:')} ${chalk.green(`(${selectedFeatures.length} features)`)}`);
    
    selectedFeatures.forEach((feature, index) => {
      const isLast = index === selectedFeatures.length - 1;
      const prefix = isLast ? '└─' : '├─';
      console.log(`    ${chalk.gray(prefix)} ${chalk.cyan(feature.feature)} ${chalk.gray(`(${feature.provider || 'default'})`)}`);
    });
  }

  if (framework.includes('+')) {
    console.log(chalk.gray('─'.repeat(70)));
    console.log(`  ${chalk.bold('⚙️  Template Type:')} ${chalk.green('Combination Template (Pre-configured)')}`);
  }
  
  console.log(chalk.gray('═'.repeat(70)));
}

/**
 * Enhanced combination template information display
 */
export function showCombinationTemplateInfo(framework: string, database?: string, orm?: string): void {
  console.log(chalk.cyan('\n📦 Template Features:'));
  
  const features = [];
  
  if (framework.includes('shadcn')) {
    features.push({ name: 'Shadcn/ui Components', icon: '🎨', description: 'Beautiful, accessible UI components' });
  }
  
  if (framework.includes('expressjs')) {
    features.push({ name: 'Express.js Backend', icon: '🚀', description: 'Fast, minimalist web framework' });
  }
  
  if (framework.includes('nestjs')) {
    features.push({ name: 'NestJS Backend', icon: '🏗️', description: 'Scalable Node.js server-side framework' });
  }
  
  if (framework.includes('reactjs')) {
    features.push({ name: 'React.js Frontend', icon: '⚛️', description: 'Modern JavaScript library for UI' });
  }
  
  if (database) {
    features.push({ 
      name: `${database.charAt(0).toUpperCase() + database.slice(1)} Database`, 
      icon: '🗄️', 
      description: 'Production-ready database setup' 
    });
  }
  
  if (orm) {
    features.push({ 
      name: `${orm.charAt(0).toUpperCase() + orm.slice(1)} ORM`, 
      icon: '🔗', 
      description: 'Object-relational mapping for database operations' 
    });
  }

  features.forEach((feature, index) => {
    const isLast = index === features.length - 1;
    const prefix = isLast ? '└─' : '├─';
    console.log(`  ${chalk.gray(prefix)} ${feature.icon} ${chalk.green(feature.name)}`);
    console.log(`  ${chalk.gray(isLast ? '   ' : '│  ')} ${chalk.dim(feature.description)}`);
  });
  
  console.log(`\n  ${chalk.yellow('💡 All configurations are pre-configured for optimal development experience!')}`);
}

/**
 * Enhanced success message with better project type detection and commands
 */
export function showSuccessMessage(
  filename: string, 
  targetPath: string, 
  theme: any, 
  dependenciesInstalled: boolean = false, 
  framework?: string,
  installedFeatures: Array<{ feature: string; provider?: string }> = []
): void {
  console.log();

  const isCurrentDirectory = filename === 'current directory' || filename === '.';
  const projectName = isCurrentDirectory ? path.basename(targetPath) : filename;
  const cdCommand = isCurrentDirectory ? '' : `cd ${filename}`;

  // Enhanced project type detection
  const isRustProject = framework === 'rust' || fs.existsSync(path.join(targetPath, 'Cargo.toml'));
  const isCombinationTemplate = framework && framework.includes('+');
  const hasBackend = isCombinationTemplate && fs.existsSync(path.join(targetPath, 'backend'));
  const hasPackageJson = fs.existsSync(path.join(targetPath, 'package.json'));
  const hasPnpmLock = fs.existsSync(path.join(targetPath, 'pnpm-lock.yaml'));
  
  // Enhanced command determination
  let devCommand, buildCommand, installCommand, packageManager;

  if (isRustProject) {
    devCommand = `cargo run`;
    buildCommand = `cargo build --release`;
    installCommand = dependenciesInstalled ? '' : `cargo build`;
    packageManager = 'cargo';
  } else if (isCombinationTemplate && hasBackend) {
    const pm = hasPnpmLock ? 'pnpm' : 'npm';
    devCommand = `# Frontend\n  ${pm} run dev\n\n  # Backend\n  cd backend && ${pm} run dev`;
    buildCommand = `# Frontend\n  ${pm} run build\n\n  # Backend\n  cd backend && ${pm} run build`;
    installCommand = dependenciesInstalled ? '' : `# Install dependencies\n  ${pm} install\n  cd backend && ${pm} install`;
    packageManager = pm;
  } else {
    const pm = hasPnpmLock ? 'pnpm' : 'npm';
    devCommand = `${pm} run dev`;
    buildCommand = `${pm} run build`;
    installCommand = dependenciesInstalled ? '' : `${pm} install`;
    packageManager = pm;
  }

  // Main success message with enhanced styling
  const successTitle = gradient(['#0072ff', '#00c6ff'])(`🎉 Project "${chalk.bold(projectName)}" Created Successfully!`);
  
  let successContent = successTitle + '\n\n' +
    `${chalk.bold('📁 Location:')} ${chalk.cyan(targetPath)}\n` +
    `${chalk.bold('📦 Package Manager:')} ${chalk.yellow(packageManager || 'N/A')}\n`;

  if (installedFeatures.length > 0) {
    successContent += `${chalk.bold('🔧 Features Installed:')} ${chalk.green(installedFeatures.length + ' features')}\n`;
  }

  successContent += `${chalk.bold('⚡ Dependencies:')} ${dependenciesInstalled ? chalk.green('✓ Installed') : chalk.yellow('⏳ Pending')}\n\n`;

  if (cdCommand) {
    successContent += chalk.white(`${chalk.bold('🚀 Quick Start:')}\n  ${chalk.cyan(cdCommand)}\n`);
  }
  
  if (!dependenciesInstalled && installCommand) {
    successContent += `  ${chalk.yellow(installCommand)}\n`;
  }
  
  successContent += `  ${chalk.green(devCommand)}\n\n`;
  successContent += chalk.yellow('💡 Check the README.md file for detailed instructions!');

  const successBox = boxen(successContent, {
    padding: 2,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'greenBright',
    backgroundColor: '#0d1117',
    title: '✨ Success',
    titleAlignment: 'center'
  });

  console.log(successBox);

  // Enhanced features summary if any features were installed
  if (installedFeatures.length > 0) {
    const featuresContent = installedFeatures.map((feature, index) => {
      const isLast = index === installedFeatures.length - 1;
      const prefix = isLast ? '└─' : '├─';
      return `  ${chalk.gray(prefix)} ${chalk.cyan(feature.feature)} ${chalk.gray(`(${feature.provider || 'default'})`)}`;
    }).join('\n');

    const featuresBox = boxen(
      `${chalk.bold('🔧 Installed Features:')}\n\n${featuresContent}`,
      {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: 'round',
        borderColor: 'blue',
        backgroundColor: '#0d1117',
        title: '🎯 Features',
        titleAlignment: 'center'
      }
    );

    console.log(featuresBox);
  }

  // Enhanced tips with more helpful information
  const tips = [
    `Use ${chalk.cyan('Ctrl+C')} to stop the development server`,
    `Check ${chalk.cyan('package.json')} for all available scripts`,
    hasBackend ? 'Run frontend and backend in separate terminals for best experience' : 'Use hot reload for faster development',
    `Visit the ${framework} documentation for advanced features`,
    installedFeatures.length > 0 ? 'Feature documentation is available in their respective folders' : 'Add more features anytime with the add command'
  ].filter(Boolean);

  const tipsContent = tips.map((tip, index) => 
    `  ${chalk.gray('•')} ${chalk.white(tip)}`
  ).join('\n');

  const tipsBox = boxen(
    `${chalk.bold('💡 Pro Tips:')}\n\n${tipsContent}`,
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'yellow',
      backgroundColor: '#0d1117',
      title: '💡 Tips',
      titleAlignment: 'center'
    }
  );

  console.log(tipsBox);
}

/**
 * Enhanced error display with detailed information
 */
export function showErrorMessage(title: string, message: string, details?: string, suggestions?: string[]): void {
  console.log();
  
  let errorContent = gradient(['#667eea', '#764ba2'])(`❌ ${title}`) + '\n\n' +
    chalk.red(message);

  if (details) {
    errorContent += '\n\n' + chalk.gray(details);
  }

  if (suggestions && suggestions.length > 0) {
    errorContent += '\n\n' + chalk.bold('💡 Suggestions:');
    suggestions.forEach(suggestion => {
      errorContent += `\n  ${chalk.gray('•')} ${chalk.white(suggestion)}`;
    });
  }

  const errorBox = boxen(errorContent, {
    padding: 2,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'red',
    backgroundColor: '#1a0000',
    title: '🚨 Error',
    titleAlignment: 'center'
  });
  
  console.log(errorBox);
}

/**
 * Progress spinner with customizable messages
 */
export class ProgressSpinner {
  private spinner: any;

  constructor(text: string = 'Loading...', spinnerType: keyof typeof cliSpinners = 'dots') {
    this.spinner = ora({
      text,
      spinner: cliSpinners[spinnerType],
      color: 'cyan'
    });
  }

  start(text?: string): void {
    if (text) this.spinner.text = text;
    this.spinner.start();
  }

  succeed(text?: string): void {
    this.spinner.succeed(text);
  }

  fail(text?: string): void {
    this.spinner.fail(text);
  }

  warn(text?: string): void {
    this.spinner.warn(text);
  }

  info(text?: string): void {
    this.spinner.info(text);
  }

  updateText(text: string): void {
    this.spinner.text = text;
  }

  stop(): void {
    this.spinner.stop();
  }
}

/**
 * Progress bar for file operations
 */
export function createProgressCallback(operation: string): (progress: number, message: string) => void {
  let lastPercent = 0;
  
  return (progress: number, message: string) => {
    const currentPercent = Math.round(progress);
    
    if (currentPercent > lastPercent) {
      const bar = '█'.repeat(Math.floor(currentPercent / 2)) + 
                  '░'.repeat(50 - Math.floor(currentPercent / 2));
      
      const statusColor = progress >= 100 ? 'green' : 'cyan';
      
      process.stdout.write('\r' + 
        chalk[statusColor](`${operation}: `) + 
        `[${chalk.cyan(bar)}] ` +
        chalk.bold(`${currentPercent}%`) + 
        (message ? ` - ${chalk.gray(message)}` : '')
      );
      
      if (progress >= 100) {
        console.log(); // New line after completion
      }
      
      lastPercent = currentPercent;
    }
  };
}

/**
 * Enhanced banner alias for backward compatibility
 */
export function showBanner(): void {
  printBanner('3.0.0', 12, 50);
}

/**
 * Enhanced logging utilities
 */
export function logError(message: string, error?: Error | string): void {
  const errorMsg = error instanceof Error ? error.message : error || 'Unknown error';
  console.error(chalk.red(`❌ ${message}: ${errorMsg}`));
  
  if (error instanceof Error && process.env.DEBUG) {
    console.error(chalk.gray(error.stack));
  }
}

export function logSuccess(message: string): void {
  console.log(chalk.green(`✅ ${message}`));
}

export function logWarning(message: string): void {
  console.log(chalk.yellow(`⚠️  ${message}`));
}

export function logInfo(message: string): void {
  console.log(chalk.blue(`ℹ️  ${message}`));
}

/**
 * Feature selection display helper
 */
export function displayFeatureSelection(features: Array<{ name: string; provider?: string; description?: string }>, selectedCount: number = 0): void {
  console.log(chalk.cyan('\n🔧 Available Features:'));
  console.log(chalk.gray('─'.repeat(60)));
  
  features.forEach((feature, index) => {
    const providerIcon = getProviderIcon(feature.provider || 'other');
    console.log(`  ${chalk.dim(String(index + 1).padStart(2))}. ${providerIcon} ${chalk.bold(feature.name)}`);
    console.log(`      ${chalk.gray(feature.provider || 'default')} • ${chalk.dim(feature.description || 'No description available')}`);
  });
  
  if (selectedCount > 0) {
    console.log(chalk.gray('─'.repeat(60)));
    console.log(`  ${chalk.green(`✓ ${selectedCount} feature${selectedCount > 1 ? 's' : ''} selected`)}`);
  }
  
  console.log(chalk.gray('─'.repeat(60)));
}

/**
 * Get provider icon based on provider name
 */
function getProviderIcon(provider: string): string {
  const icons: Record<string, string> = {
    'auth': '🔐',
    'database': '🗄️',
    'ui': '🎨',
    'testing': '🧪',
    'deployment': '🚀',
    'monitoring': '📊',
    'analytics': '📈',
    'payment': '💳',
    'email': '📧',
    'storage': '☁️',
    'api': '🔌',
    'seo': '🔍',
    'pwa': '📱',
    'cms': '📝',
    'other': '⚙️'
  };
  
  return icons[provider.toLowerCase()] || icons['other'];
}

/**
 * Display installation summary
 */
export function showInstallationSummary(
  installed: string[], 
  failed: string[], 
  skipped: string[] = []
): void {
  console.log(chalk.cyan('\n📦 Installation Summary:'));
  console.log(chalk.gray('═'.repeat(50)));
  
  if (installed.length > 0) {
    console.log(chalk.green(`✅ Successfully installed (${installed.length}):`));
    installed.forEach(item => console.log(`   • ${item}`));
  }
  
  if (failed.length > 0) {
    console.log(chalk.red(`❌ Failed to install (${failed.length}):`));
    failed.forEach(item => console.log(`   • ${item}`));
  }
  
  if (skipped.length > 0) {
    console.log(chalk.yellow(`⏭️  Skipped (${skipped.length}):`));
    skipped.forEach(item => console.log(`   • ${item}`));
  }
  
  console.log(chalk.gray('═'.repeat(50)));
}
