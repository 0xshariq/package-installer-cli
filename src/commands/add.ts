import chalk from 'chalk';
import inquirer from 'inquirer';
import { addFeature, listAvailableFeatures, SUPPORTED_FEATURES, detectProjectStack } from '../utils/featureInstaller.js';

export async function addCommand(feature?: string) {
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

  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to add feature: ${error.message}`));
    process.exit(1);
  }
}
