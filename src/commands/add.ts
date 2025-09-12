import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import boxen from 'boxen';
import path from 'path';
import fs from 'fs-extra';
import { addFeature, detectProjectStack, SUPPORTED_FEATURES, FeatureConfig } from '../utils/featureInstaller.js';
import { historyManager } from '../utils/historyManager.js';
import { getCachedProject, cacheProjectData } from '../utils/cacheManager.js';

/**
 * List available features from features.json with descriptions
 */
function listAvailableFeatures(): void {
  console.log('\n' + boxen(
    gradient(['#4facfe', '#00f2fe'])('🔮 Available Features') + '\n\n' +
    Object.entries(SUPPORTED_FEATURES).map(([key, config]) => {
      const frameworks = Array.isArray(config.supportedFrameworks) 
        ? config.supportedFrameworks.join(', ') 
        : 'Unknown';
      const status = Object.keys(config.files || {}).length > 0 ? '✅' : '🚧';
      const description = (config as any).description || 'No description available';
      return `${status} ${chalk.bold.cyan(key)}\n  ${chalk.gray(description)}\n  ${chalk.dim('Frameworks: ' + frameworks)}`;
    }).join('\n\n'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));
}

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
 * Get sub-features for a main feature (e.g., AWS services, AI providers)
 */
function getSubFeatures(featureName: string, featureConfig: FeatureConfig): string[] {
  // Check for different sub-feature types based on feature name
  switch (featureName) {
    case 'aws':
      return (featureConfig as any).supportedAwsServices || [];
    case 'ai':
      return (featureConfig as any).supportedAIs || [];
    case 'auth':
      return Object.keys(featureConfig.files || {});
    case 'database':
      return Object.keys(featureConfig.files || {});
    case 'storage':
      return (featureConfig as any).supportedStorageProviders || [];
    case 'payment':
      return (featureConfig as any).supportedPaymentProviders || [];
    default:
      return Object.keys(featureConfig.files || {});
  }
}

/**
 * Show help for add command
 */
export function showAddHelp(): void {
  const piGradient = gradient(['#00c6ff', '#0072ff']);
  
  console.log('\n' + boxen(
    piGradient.multiline([
      '📦 Package Installer CLI - Add Features',
      '',
      'USAGE:',
      '  pi add                    # Interactive feature selection',
      '  pi add <feature>          # Add feature with provider selection',
      '  pi add <feature> <provider>  # Add specific feature provider',
      '',
      'EXAMPLES:',
      '  pi add                    # Show all features in dropdown',
      '  pi add auth               # Show auth providers dropdown',
      '  pi add auth clerk         # Add Clerk authentication',
      '  pi add aws                # Show AWS services dropdown',  
      '  pi add aws ec2            # Add AWS EC2 integration',
      '  pi add ai openai          # Add OpenAI integration',
      '  pi add database prisma    # Add Prisma database integration',
      '',
      'OPTIONS:',
      '  -h, --help               Show this help message',
      '  -l, --list              List all available features',
      '  -v, --verbose           Show detailed output',
      '',
      'FEATURES:',
      '  • Authentication (auth)   - Clerk, Auth0, NextAuth',
      '  • AWS Services (aws)      - EC2, S3, Lambda, and more',
      '  • AI Integration (ai)     - OpenAI, Claude, Gemini',
      '  • Database (database)     - Prisma, Mongoose, Drizzle',
      '  • Storage (storage)       - AWS S3, Cloudinary, Firebase',
      '  • Payments (payment)      - Stripe, PayPal, Razorpay',
      '  • Docker (docker)         - Containerization configs',
      '  • UI Libraries (ui)       - Component libraries'
    ].join('\n')),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'blue'
    }
  ));
}

/**
 * Main add command handler
 */
export async function addCommand(
  feature?: string,
  provider?: string,
  options: { list?: boolean; verbose?: boolean } = {}
): Promise<void> {
  try {
    // Initialize history manager
    await historyManager.init();

    // Show disclaimer
    showFeatureDisclaimer();

    // List features if requested
    if (options.list) {
      listAvailableFeatures();
      return;
    }

    console.log(chalk.hex('#9c88ff')('\n🔮 Adding features to your project...'));

    // Check if we're in a valid project with enhanced detection
    const projectPath = process.cwd();
    let projectInfo = await getCachedProject(projectPath);
    
    if (!projectInfo) {
      console.log(chalk.yellow('🔍 Analyzing project structure...'));
      projectInfo = await detectProjectStack(projectPath);
      
      // Cache the detected project info
      if (projectInfo.framework && projectInfo.language) {
        try {
          const packageJsonPath = path.join(projectPath, 'package.json');
          const projectName = await fs.pathExists(packageJsonPath) 
            ? (await fs.readJson(packageJsonPath)).name || path.basename(projectPath)
            : path.basename(projectPath);
            
          await cacheProjectData(
            projectPath,
            projectName,
            projectInfo.projectLanguage || 'unknown',
            projectInfo.framework,
            [],
            0
          );
        } catch (error) {
          console.warn(chalk.yellow('⚠️  Could not cache project info'));
        }
      }
    }
    
    if (!projectInfo || !projectInfo.framework) {
      console.log(chalk.red('❌ No supported framework detected in current directory'));
      console.log(chalk.yellow('💡 Supported frameworks: Next.js, React, Express, NestJS, Vue, Angular, Remix'));
      console.log(chalk.yellow('💡 Make sure you\'re in a project root with package.json'));
      
      // Show detected files for debugging
      const files = await fs.readdir(projectPath);
      const relevantFiles = files.filter(f => f.endsWith('.json') || f.startsWith('package') || f.startsWith('tsconfig'));
      if (relevantFiles.length > 0) {
        console.log(chalk.gray(`📁 Found files: ${relevantFiles.join(', ')}`));
      }
      return;
    }

    console.log(chalk.green(`✅ Detected ${projectInfo.framework} project (${projectInfo.projectLanguage || projectInfo.language})`));
    
    // Show additional project details
    if (projectInfo.packageManager) {
      console.log(chalk.gray(`📦 Package manager: ${projectInfo.packageManager}`));
    }
    if (projectInfo.hasSrcFolder) {
      console.log(chalk.gray(`📁 Source structure: src folder detected`));
    }

    let selectedFeature = feature;
    let selectedProvider = provider;

    // If no feature specified, show interactive selection
    if (!selectedFeature) {
      const availableFeatures = Object.keys(SUPPORTED_FEATURES).filter(key => {
        const featureConfig = SUPPORTED_FEATURES[key];
        const frameworkSupported = featureConfig.supportedFrameworks.includes(projectInfo.framework!);
        const projectLang = projectInfo.projectLanguage || projectInfo.language || 'javascript';
        const languageSupported = featureConfig.supportedLanguages.includes(projectLang);
        return frameworkSupported && languageSupported;
      });

      if (availableFeatures.length === 0) {
        console.log(chalk.yellow(`⚠️  No features available for ${projectInfo.framework} projects`));
        return;
      }

      const choices = availableFeatures.map(key => {
        const config = SUPPORTED_FEATURES[key];
        const isComingSoon = Object.keys(config.files || {}).length === 0;
        const status = isComingSoon ? chalk.hex('#95afc0')(' (Coming Soon)') : '';
        const description = (config as any).description || 'No description available';
        
        return {
          name: `${chalk.bold.cyan(key)}${status}\n  ${chalk.gray(description)}`,
          value: key,
          disabled: isComingSoon
        };
      });

      const { feature: chosenFeature } = await inquirer.prompt([
        {
          type: 'list',
          name: 'feature',
          message: chalk.hex('#9c88ff')('🚀 Select a feature to add:'),
          choices,
          pageSize: 10
        }
      ]);

      selectedFeature = chosenFeature;
    }

    // Check if feature exists and is supported
    if (!SUPPORTED_FEATURES[selectedFeature!]) {
      console.log(chalk.red(`❌ Feature '${selectedFeature}' not found`));
      console.log(chalk.yellow('💡 Use "pi add --list" to see available features'));
      return;
    }

    const featureConfig = SUPPORTED_FEATURES[selectedFeature!];

    // Check framework and language support
    if (!featureConfig.supportedFrameworks.includes(projectInfo.framework!)) {
      console.log(chalk.red(`❌ Feature '${selectedFeature}' is not supported for ${projectInfo.framework} projects`));
      return;
    }

    if (!featureConfig.supportedLanguages.includes(projectInfo.projectLanguage || projectInfo.language || 'javascript')) {
      console.log(chalk.red(`❌ Feature '${selectedFeature}' is not supported for ${projectInfo.projectLanguage || projectInfo.language} projects`));
      return;
    }

    // Check if feature is coming soon
    if (Object.keys(featureConfig.files || {}).length === 0) {
      console.log(chalk.hex('#ffa502')(`🚧 ${selectedFeature} is coming soon!`));
      console.log(chalk.hex('#95afc0')('Stay tuned for updates.'));
      return;
    }

    // Get available sub-features/providers
    const subFeatures = getSubFeatures(selectedFeature!, featureConfig);

    // If no provider specified and multiple providers available, show selection
    if (!selectedProvider && subFeatures.length > 1) {
      const providerChoices = subFeatures.map(subFeature => {
        // Try to get provider description or use formatted name
        const formattedName = subFeature
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return {
          name: `${chalk.bold.green(formattedName)} - ${getProviderDescription(selectedFeature!, subFeature)}`,
          value: subFeature
        };
      });

      const { provider: chosenProvider } = await inquirer.prompt([
        {
          type: 'list',
          name: 'provider',
          message: chalk.hex('#9c88ff')(`🔧 Select a ${selectedFeature} provider:`),
          choices: providerChoices,
          pageSize: 10
        }
      ]);

      selectedProvider = chosenProvider;
    } else if (!selectedProvider && subFeatures.length === 1) {
      selectedProvider = subFeatures[0];
    }

    // Add the selected feature
    console.log(chalk.hex('#9c88ff')(`\n🚀 Adding ${selectedFeature}${selectedProvider ? ` (${selectedProvider})` : ''} to your project...`));
    
    await addFeature(selectedFeature!, selectedProvider, process.cwd());

    // Record feature addition in history
    try {
      const currentPath = process.cwd();
      const projectName = path.basename(currentPath);
      
      await historyManager.recordFeature({
        name: selectedFeature!,
        projectName: projectName,
        provider: selectedProvider,
        projectPath: currentPath,
        framework: projectInfo.framework!,
        success: true
      });
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not save feature to history'));
    }    console.log(chalk.green(`\n✅ Successfully added ${selectedFeature}${selectedProvider ? ` (${selectedProvider})` : ''} to your project!`));
    
    // Show next steps
    showNextSteps(selectedFeature!, selectedProvider);

  } catch (error: any) {
    console.error(chalk.red(`❌ Error adding feature: ${error.message}`));
    
    // Record failed feature addition
    try {
      await historyManager.recordFeature({
        name: feature || 'unknown',
        projectName: path.basename(process.cwd()),
        provider: provider,
        projectPath: process.cwd(),
        framework: 'unknown',
        success: false
      });
    } catch (historyError) {
      // Ignore history errors
    }

    process.exit(1);
  }
}

/**
 * Get provider description based on feature and provider
 */
function getProviderDescription(feature: string, provider: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    auth: {
      'clerk': 'Modern authentication with built-in UI components',
      'auth0': 'Enterprise-grade authentication platform',
      'nextauth': 'Authentication for Next.js applications',
      'firebase': 'Google Firebase Authentication',
      'supabase': 'Open source Firebase alternative'
    },
    aws: {
      'ec2': 'Elastic Compute Cloud - Virtual servers',
      's3': 'Simple Storage Service - Object storage',
      'lambda': 'Serverless compute service',
      'rds': 'Relational Database Service',
      'cloudfront': 'Content Delivery Network',
      'cognito': 'User identity and authentication',
      'dynamodb': 'NoSQL database service',
      'sqs': 'Simple Queue Service',
      'sns': 'Simple Notification Service',
      'iam': 'Identity and Access Management'
    },
    ai: {
      'openai': 'GPT models and DALL-E integration',
      'claude': 'Anthropic Claude AI assistant',
      'gemini': 'Google Gemini AI models',
      'grok': 'xAI Grok language model',
      'open-router': 'Universal API for multiple AI models'
    },
    database: {
      'prisma': 'Next-generation ORM for Node.js',
      'mongoose': 'MongoDB object modeling',
      'drizzle': 'TypeScript ORM for SQL databases',
      'sequelize': 'Promise-based ORM for multiple databases',
      'typeorm': 'ORM for TypeScript and JavaScript'
    },
    storage: {
      's3': 'AWS S3 object storage integration',
      'cloudinary': 'Image and video management',
      'firebase': 'Google Firebase Storage',
      'supabase': 'Supabase Storage integration'
    },
    payment: {
      'stripe': 'Complete payments platform',
      'paypal': 'PayPal payment integration',
      'razorpay': 'Indian payment gateway',
      'square': 'Square payment processing'
    }
  };

  return descriptions[feature]?.[provider] || `${provider} integration`;
}

/**
 * Show next steps after feature addition
 */
function showNextSteps(feature: string, provider?: string): void {
  console.log(`\n${chalk.hex('#00d2d3')('📋 Next Steps:')}`);
  
  switch (feature) {
    case 'auth':
      console.log(chalk.hex('#95afc0')('1. Configure your authentication provider'));
      console.log(chalk.hex('#95afc0')('2. Update your .env file with API keys'));
      console.log(chalk.hex('#95afc0')('3. Test the authentication flow'));
      break;
      
    case 'aws':
      console.log(chalk.hex('#95afc0')('1. Configure AWS credentials'));
      console.log(chalk.hex('#95afc0')('2. Update .env file with AWS region and access keys'));
      console.log(chalk.hex('#95afc0')('3. Test the AWS service integration'));
      break;
      
    case 'ai':
      console.log(chalk.hex('#95afc0')('1. Get API key from your AI provider'));
      console.log(chalk.hex('#95afc0')('2. Add API key to .env file'));
      console.log(chalk.hex('#95afc0')('3. Test AI integration endpoints'));
      break;
      
    case 'database':
      console.log(chalk.hex('#95afc0')('1. Set up your database connection'));
      console.log(chalk.hex('#95afc0')('2. Update connection string in .env'));
      console.log(chalk.hex('#95afc0')('3. Run migrations if needed'));
      break;
      
    case 'docker':
      console.log(chalk.hex('#95afc0')('1. Install Docker on your system'));
      console.log(chalk.hex('#95afc0')('2. Run: docker-compose up -d'));
      console.log(chalk.hex('#95afc0')('3. Your app will be available at the configured port'));
      break;
      
    default:
      console.log(chalk.hex('#95afc0')(`1. Check the ${feature} configuration`));
      console.log(chalk.hex('#95afc0')('2. Update .env file with necessary variables'));
      console.log(chalk.hex('#95afc0')('3. Test the integration'));
  }
  
  console.log(chalk.hex('#95afc0')('\n💡 Check your project files for any additional setup instructions'));
}
