import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { addFeature, listAvailableFeatures, scanAvailableFeatures, detectProjectStack } from '../utils/featureInstaller.js';

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

export async function addCommand(feature?: string, provider?: string) {
  // Check for help flag
  if (feature === '--help' || feature === '-h') {
    showAddHelp();
    return;
  }
  try {
    // Handle --list flag
    if (feature === '--list' || feature === '-l') {
      await listAvailableFeatures();
      return;
    }

    // Get dynamic features
    const supportedFeatures = await scanAvailableFeatures();

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
      await listAvailableFeatures();
      
      const availableFeatures = Object.keys(supportedFeatures)
        .filter(key => {
          const featureConfig = supportedFeatures[key];
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
        const config = supportedFeatures[key];
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
          message: chalk.hex('#9c88ff')('Which feature would you like to add?'),
          choices
        }
      ]);

      feature = selectedFeature;
    }

    // Validate feature exists
    if (!feature || !supportedFeatures[feature]) {
      console.log(chalk.red(`❌ Unknown feature: ${feature || 'undefined'}`));
      console.log(chalk.hex('#95afc0')('💡 Available features:'));
      Object.keys(supportedFeatures).forEach(key => {
        const isComingSoon = Object.keys(supportedFeatures[key].files).length === 0;
        const status = isComingSoon ? chalk.hex('#95afc0')(' (Coming Soon)') : '';
        console.log(chalk.hex('#95afc0')(`   • ${key}${status}`));
      });
      return;
    }

    const featureConfig = supportedFeatures[feature];

    // Check if feature is supported for current project
    const frameworkSupported = featureConfig.supportedFrameworks.includes(projectInfo.framework!) ||
      featureConfig.supportedFrameworks.some(fw => projectInfo.framework!.startsWith(fw));
    const languageSupported = featureConfig.supportedLanguages.includes(projectInfo.language!);

    if (!frameworkSupported || !languageSupported) {
      console.log(chalk.red(`❌ ${featureConfig.name} is not supported for ${projectInfo.framework} projects`));
      console.log(chalk.hex('#95afc0')(`💡 ${featureConfig.name} supports: ${featureConfig.supportedFrameworks.join(', ')}`));
      return;
    }

    // Check if feature has implementation
    const isComingSoon = Object.keys(featureConfig.files).length === 0;
    if (isComingSoon) {
      console.log(chalk.yellow(`� ${featureConfig.name} is coming soon!`));
      console.log(chalk.hex('#95afc0')('   Stay tuned for updates.'));
      return;
    }

    // Add the feature
    await addFeature(feature, process.cwd(), { authProvider: provider });
    
  } catch (error: any) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}
