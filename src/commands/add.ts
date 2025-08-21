import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import boxen from 'boxen';
import path from 'path';
import { addFeature, listAvailableFeatures, SUPPORTED_FEATURES, detectProjectStack } from '../utils/featureInstaller.js';
import { HistoryManager } from '../utils/historyManager.js';

/**
 * Display important disclaimer about potential issues
 */
function showFeatureDisclaimer(): void {
  const disclaimerBox = boxen(
    chalk.yellow.bold('⚠️  IMPORTANT DISCLAIMER') + '\n\n' +
    chalk.white('When adding features to your project:') + '\n' +
    chalk.gray('• Syntax errors may occur during integration') + '\n' +
    chalk.gray('• Code formatting issues might arise') + '\n' +
    chalk.gray('• Manual adjustments may be required') + '\n' +
    chalk.gray('• Always backup your project before adding features') + '\n\n' +
    chalk.cyan('💡 It\'s recommended to test your project after feature integration'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'yellow',
      title: 'Feature Integration Warning',
      titleAlignment: 'center'
    }
  );
  
  console.log(disclaimerBox);
}

/**
 * Show auth provider specific documentation and setup steps
 */
function showAuthProviderDocs(authProvider: string): void {
  const authDocs = {
    clerk: {
      name: 'Clerk',
      url: 'https://clerk.com/docs',
      steps: [
        '1. Create a Clerk account at https://clerk.com',
        '2. Create a new application',
        '3. Copy your API keys to .env file',
        '4. Configure your sign-in/sign-up pages'
      ]
    },
    auth0: {
      name: 'Auth0',
      url: 'https://auth0.com/docs',
      steps: [
        '1. Create an Auth0 account at https://auth0.com',
        '2. Create a new application',
        '3. Configure allowed callback URLs',
        '4. Copy your domain and client ID to .env file'
      ]
    },
    'next-auth': {
      name: 'NextAuth.js',
      url: 'https://next-auth.js.org',
      steps: [
        '1. Configure your providers in lib/auth.ts',
        '2. Set NEXTAUTH_SECRET in .env file', 
        '3. Configure OAuth providers (Google, GitHub, etc.)',
        '4. Set up your database connection'
      ]
    }
  };

  const docs = authDocs[authProvider as keyof typeof authDocs];
  if (!docs) return;

  const docsBox = boxen(
    chalk.hex('#00d2d3').bold(`📖 ${docs.name} Setup Guide`) + '\n\n' +
    chalk.white('Quick Setup Steps:') + '\n' +
    docs.steps.map(step => chalk.gray(step)).join('\n') + '\n\n' +
    chalk.cyan('📚 Full Documentation: ') + chalk.blue(docs.url) + '\n' +
    chalk.gray('💡 Make sure to test your authentication flow after setup'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      title: 'Authentication Setup',
      titleAlignment: 'center'
    }
  );
  
  console.log(docsBox);
}

/**
 * Display help for add command
 */
export function showAddHelp(): void {
  const piGradient = gradient(['#00c6ff', '#0072ff']);
  const headerGradient = gradient(['#4facfe', '#00f2fe']);
  
  console.log('\n' + boxen(
    headerGradient('➕ Add Command Help') + '\n\n' +
    chalk.white('Add powerful features to your existing project like authentication and Docker support.') + '\n\n' +
    chalk.cyan('Usage:') + '\n' +
    chalk.white(`  ${piGradient('pi')} ${chalk.hex('#9c88ff')('add')} [feature]`) + '\n\n' +
    chalk.cyan('Options:') + '\n' +
    chalk.gray('  -l, --list    List all available features') + '\n' +
    chalk.gray('  -h, --help    Display help for this command') + '\n\n' +
    chalk.cyan('Examples:') + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#9c88ff')('add')}                       # Interactive feature selection`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#9c88ff')('add')} --list               # List all available features`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#9c88ff')('add')} auth                 # Add authentication`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#9c88ff')('add')} docker               # Add Docker configuration`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#9c88ff')('add')} ${chalk.hex('#ff6b6b')('--help')}             # Show this help message`) + '\n\n' +
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
}

export async function addCommand(feature?: string) {
  // Check for help flag
  if (feature === '--help' || feature === '-h') {
    showAddHelp();
    return;
  }
  
  // Show disclaimer about potential issues
  showFeatureDisclaimer();
  
  try {
    // Handle --list flag
    if (feature === '--list' || feature === '-l') {
      listAvailableFeatures();
      return;
    }

    // Detect project framework and language first
    console.log(chalk.hex('#9c88ff')('🔍 Analyzing project structure...'));
    const projectInfo = await detectProjectStack(process.cwd());
    
    if (!projectInfo.framework || !projectInfo.language) {
      console.log(chalk.red('❌ Could not detect project framework or language'));
      console.log(chalk.hex('#95afc0')('💡 Make sure you are in a valid project directory'));
      console.log(chalk.hex('#95afc0')('   Supported: Next.js, React, Express, NestJS, Vue.js, Angular, Remix, Rust'));
      return;
    }

    console.log(chalk.green(`✅ Detected ${projectInfo.framework} project (${projectInfo.projectLanguage || 'typescript'})`));

    if (!feature) {
      // Show available features and let user choose
      listAvailableFeatures();
      
      const availableFeatures = Object.keys(SUPPORTED_FEATURES)
        .filter(key => {
          const featureConfig = SUPPORTED_FEATURES[key];
          const frameworkSupported = featureConfig.supportedFrameworks.includes(projectInfo.framework!) ||
            featureConfig.supportedFrameworks.some(fw => projectInfo.framework!.startsWith(fw));
          const languageSupported = featureConfig.supportedLanguages.includes(projectInfo.language!);
          return frameworkSupported && languageSupported;
        });

      if (availableFeatures.length === 0) {
        console.log(chalk.yellow(`⚠️  No features available for ${projectInfo.framework} projects`));
        return;
      }

      const choices = availableFeatures.map(key => {
        const config = SUPPORTED_FEATURES[key];
        const isComingSoon = Object.keys(config.files).length === 0;
        const status = isComingSoon ? chalk.hex('#95afc0')(' (Coming Soon)') : '';
        return {
          name: `${config.name} - ${config.description}${status}`,
          value: key,
          disabled: isComingSoon ? 'Coming Soon' : false
        };
      });

      const { selectedFeature } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedFeature',
          message: chalk.hex('#9c88ff')('✨ Which feature would you like to add?'),
          choices
        }
      ]);
      
      feature = selectedFeature;
    }

    // Validate feature exists
    if (!feature || !SUPPORTED_FEATURES[feature]) {
      console.log(chalk.red(`❌ Unknown feature: ${feature || 'undefined'}`));
      console.log(chalk.hex('#95afc0')('💡 Available features:'));
      Object.keys(SUPPORTED_FEATURES).forEach(key => {
        const isComingSoon = Object.keys(SUPPORTED_FEATURES[key].files).length === 0;
        const status = isComingSoon ? chalk.hex('#95afc0')(' (Coming Soon)') : '';
        console.log(chalk.hex('#95afc0')(`   • ${key}${status}`));
      });
      return;
    }

    // Check if feature is coming soon
    const featureConfig = SUPPORTED_FEATURES[feature];
    if (Object.keys(featureConfig.files).length === 0) {
      console.log(chalk.hex('#ffa502')(`🚧 ${featureConfig.name} is coming soon!`));
      console.log(chalk.hex('#95afc0')('Stay tuned for updates.'));
      return;
    }

    // Handle special auth provider selection
    let authProvider: string | undefined;
    if (feature === 'auth') {
      const { provider } = await inquirer.prompt([
        {
          type: 'list',
          name: 'provider',
          message: chalk.hex('#9c88ff')('🔐 Choose authentication provider:'),
          choices: [
            { name: 'Clerk - Modern authentication with built-in UI components', value: 'clerk' },
            { name: 'Auth0 - Enterprise-grade authentication platform', value: 'auth0' }
          ]
        }
      ]);
      authProvider = provider;
    }

    // Add the selected feature
    await addFeature(feature, process.cwd(), { authProvider });

    // Show auth provider specific documentation
    if (feature === 'auth' && authProvider) {
      showAuthProviderDocs(authProvider);
    }

    // Record feature addition in history
    try {
      const historyManager = HistoryManager.getInstance();
      const currentPath = process.cwd();
      const projectName = path.basename(currentPath);
      
      await historyManager.recordFeature({
        name: feature,
        projectName: projectName,
        projectPath: currentPath,
        framework: projectInfo.framework!,
        language: projectInfo.language!,
        provider: authProvider
      });
      
      console.log(chalk.gray('📊 Feature addition recorded in usage history'));
    } catch (error) {
      // History recording failure shouldn't stop feature addition
      console.log(chalk.gray('⚠️  History recording skipped'));
    }

  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to add feature: ${error.message}`));
    process.exit(1);
  }
}
