/**
 * Feature installer utility - Handles adding authentication, Docker, and other features to projects
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { SupportedLanguage, installPackages } from './dependencyInstaller.js';
import { detectLanguageFromFiles } from './languageConfig.js';
import { 
  updateTemplateUsage, 
  getCachedTemplateFiles, 
  cacheTemplateFiles, 
  getDirectorySize,
  cacheProjectData
} from './cacheManager.js';

// Get the directory of this file for proper path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Action types for feature files
export type FeatureAction = 'install' | 'prepend' | 'append' | 'overwrite' | 'create';

export interface FeatureFile {
  action: FeatureAction;
}

export interface FeatureConfig {
  supportedFrameworks: string[];
  supportedLanguages: string[];
  files: {
    [provider: string]: {
      [framework: string]: {
        [language: string]: {
          [filePath: string]: FeatureFile;
        };
      };
    };
  };
}

// Load supported features from cached or direct file access
let SUPPORTED_FEATURES: { [featureName: string]: FeatureConfig } = {};

/**
 * Load features from cache or file system
 */
async function loadFeatures(): Promise<void> {
  try {
    // Try to load from cache first
    const cachedFeatures = await getCachedFeatures();
    if (cachedFeatures) {
      SUPPORTED_FEATURES = cachedFeatures.features;
      return;
    }
    
    // Fallback to direct file access
    const featuresPath = path.join(__dirname, '../../features/features.json');
    if (await fs.pathExists(featuresPath)) {
      const featuresData = await fs.readJson(featuresPath);
      SUPPORTED_FEATURES = featuresData.features;
      
      // Cache the features for offline use
      await cacheFeatures(featuresData);
    }
  } catch (error) {
    console.warn(chalk.yellow('⚠️  Could not load features.json, using fallback configuration'));
  }
}

// Initialize features on module load
await loadFeatures();

// Export for use in other modules
export { SUPPORTED_FEATURES };

/**
 * Detect the current project's framework and language with improved logic
 */
export async function detectProjectStack(projectPath: string): Promise<{
  framework?: string;
  language?: SupportedLanguage;
  projectLanguage?: 'javascript' | 'typescript';
  isComboTemplate?: boolean;
  packageManager?: string;
  hasSrcFolder?: boolean;
}> {
  try {
    // Check cache first
    const cachedProject = await getCachedProject(projectPath);
    if (cachedProject) {
      const packageManager = await detectPackageManager(projectPath);
      const hasSrcFolder = await fs.pathExists(path.join(projectPath, 'src'));
      
      return {
        framework: cachedProject.framework,
        language: cachedProject.language as SupportedLanguage,
        projectLanguage: cachedProject.language as 'javascript' | 'typescript',
        packageManager,
        hasSrcFolder
      };
    }
    
    // Detect language first
    const files = await fs.readdir(projectPath);
    const detectedLanguages = detectLanguageFromFiles(files);
    const primaryLanguage = detectedLanguages[0];
    
    let framework: string | undefined;
    let isComboTemplate = false;
    let packageManager = 'npm';
    let projectLanguage: 'javascript' | 'typescript' = 'javascript';
    let hasSrcFolder = false;
    
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Detect TypeScript
      if (await fs.pathExists(path.join(projectPath, 'tsconfig.json'))) {
        projectLanguage = 'typescript';
      } else if (dependencies['typescript']) {
        projectLanguage = 'typescript';
      }
      
      // Check for src folder structure
      hasSrcFolder = await fs.pathExists(path.join(projectPath, 'src'));
      
      // Detect package manager
      packageManager = await detectPackageManager(projectPath);
      
      // Detect framework
      if (dependencies['next']) {
        framework = 'nextjs';
      } else if (dependencies['react']) {
        framework = 'reactjs';
      } else if (dependencies['express']) {
        framework = 'expressjs';
      } else if (dependencies['@nestjs/core']) {
        framework = 'nestjs';
      } else if (dependencies['vue']) {
        framework = 'vuejs';
      } else if (dependencies['@angular/core']) {
        framework = 'angularjs';
      } else if (dependencies['@remix-run/react']) {
        framework = 'remixjs';
      }
      
      // Cache the detected information
      await cacheProjectData(
        projectPath,
        packageJson.name || path.basename(projectPath),
        typeof projectLanguage === 'string' ? projectLanguage : 'unknown',
        framework,
        Object.keys(dependencies),
        0
      );
    }
    
    return {
      framework,
  language: typeof primaryLanguage === 'string' ? (primaryLanguage as SupportedLanguage) : ((primaryLanguage && typeof primaryLanguage.language === 'string') ? (primaryLanguage.language as SupportedLanguage) : undefined),
      projectLanguage,
      isComboTemplate,
      packageManager,
      hasSrcFolder
    };
  } catch (error) {
    console.error('Error detecting project stack:', error);
    return {};
  }
}

/**
 * Detect package manager for the project
 */
async function detectPackageManager(projectPath: string): Promise<string> {
  if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  } else if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
    return 'yarn';
  } else if (await fs.pathExists(path.join(projectPath, 'bun.lockb'))) {
    return 'bun';
  }
  return 'npm';
}

/**
 * Add a feature to the current project
 */
export async function addFeature(
  featureName: string,
  provider?: string,
  projectPath: string = process.cwd()
): Promise<void> {
  const spinner = ora(chalk.hex('#9c88ff')(`Adding ${featureName} feature...`)).start();
  
  try {
    // Ensure features are loaded
    await loadFeatures();
    
    // Get project information
    const projectInfo = await detectProjectStack(projectPath);
    
    if (!projectInfo.framework) {
      throw new Error('Could not detect project framework');
    }
    
    // Get feature configuration
    const featureConfig = SUPPORTED_FEATURES[featureName];
    if (!featureConfig) {
      throw new Error(`Feature '${featureName}' not found in features.json`);
    }
    
    // Check if feature supports this framework
    if (!featureConfig.supportedFrameworks.includes(projectInfo.framework)) {
      throw new Error(`Feature '${featureName}' is not supported for ${projectInfo.framework} projects`);
    }
    
    // For features with providers (like auth), prompt for provider selection
    let selectedProvider = provider;
    if (!selectedProvider && featureConfig.files) {
      const availableProviders = Object.keys(featureConfig.files);
      if (availableProviders.length > 1) {
        const inquirer = await import('inquirer');
        const { provider: chosenProvider } = await inquirer.default.prompt([
          {
            type: 'list',
            name: 'provider',
            message: `Choose a ${featureName} provider:`,
            choices: availableProviders
          }
        ]);
        selectedProvider = chosenProvider;
      } else {
        selectedProvider = availableProviders[0];
      }
    }
    
    // Get files for the specific provider, framework, and language
    const files = getFeatureFiles(featureConfig, selectedProvider!, projectInfo.framework, projectInfo.projectLanguage!);
    
    if (Object.keys(files).length === 0) {
      throw new Error(`No files configured for ${featureName} with ${selectedProvider} provider for ${projectInfo.framework} (${projectInfo.projectLanguage})`);
    }
    
    spinner.text = `Processing ${Object.keys(files).length} files...`;
    
    // Process each file based on its action
    for (const [filePath, fileConfig] of Object.entries(files)) {
      await processFeatureFile(filePath, fileConfig, featureName, selectedProvider!, projectInfo, projectPath);
    }
    
    spinner.succeed(chalk.green(`✅ ${featureName} feature added successfully!`));
    
    // Update cache with feature usage
    await cacheFeatureUsage(featureName, projectInfo.framework || 'unknown');
    
    // Show setup instructions
    showSetupInstructions(featureName, selectedProvider!);
    
  } catch (error: any) {
    spinner.fail(chalk.red(`❌ Failed to add ${featureName} feature: ${error.message}`));
    throw error;
  }
}

/**
 * Get feature files for a specific provider, framework, and language
 */
function getFeatureFiles(
  featureConfig: FeatureConfig,
  provider: string,
  framework: string,
  language: string
): { [filePath: string]: FeatureFile } {
  const providerConfig = featureConfig.files[provider];
  if (!providerConfig) return {};
  
  const frameworkConfig = providerConfig[framework];
  if (!frameworkConfig) return {};
  
  const languageConfig = frameworkConfig[language];
  if (!languageConfig) {
    // Fallback to typescript if javascript not available
    const tsConfig = frameworkConfig['typescript'];
    if (tsConfig && language === 'javascript') {
      console.log(chalk.yellow(`⚠️  JavaScript templates not available, using TypeScript templates`));
      return tsConfig;
    }
    return {};
  }
  
  return languageConfig;
}

/**
 * Process a single feature file based on its action
 */
async function processFeatureFile(
  filePath: string,
  fileConfig: FeatureFile,
  featureName: string,
  provider: string,
  projectInfo: any,
  projectPath: string
): Promise<void> {
  const { action } = fileConfig;
  
  // Try to get template content from cache first
  let sourceContent: string | null = null;
  const templateCacheKey = `${featureName}/${provider}/${projectInfo.framework}/${projectInfo.projectLanguage}/${filePath}`;
  
  try {
    sourceContent = await getCachedTemplateFile(templateCacheKey);
  } catch (error) {
    // Cache miss, will load from file system
  }
  
  // Get the CLI root path for accessing feature templates
  const cliRoot = getCliRootPath();
  const featureTemplatePath = path.join(cliRoot, 'features', featureName, provider, projectInfo.framework, projectInfo.projectLanguage);
  const sourceFilePath = path.join(featureTemplatePath, filePath);
  
  // If not in cache, load from file system and cache it
  if (!sourceContent && await fs.pathExists(sourceFilePath)) {
    sourceContent = await fs.readFile(sourceFilePath, 'utf-8');
    // Cache the template file content for offline use
    await cacheTemplateFile(templateCacheKey, sourceContent);
  }
  
  // Handle Next.js src folder structure and automatic folder creation
  let targetFilePath = path.join(projectPath, filePath);
  
  // For Next.js projects, handle src folder structure
  if (projectInfo.framework === 'nextjs') {
    // If the project doesn't have a src folder but the template expects one
    if (!projectInfo.hasSrcFolder && (filePath.startsWith('app/') || filePath.startsWith('components/') || filePath.startsWith('lib/'))) {
      // Check if we need to create an app directory or use src structure
      const appDirExists = await fs.pathExists(path.join(projectPath, 'app'));
      const pagesDirExists = await fs.pathExists(path.join(projectPath, 'pages'));
      
      if (!appDirExists && !pagesDirExists) {
        // Create app directory for App Router structure
        targetFilePath = path.join(projectPath, filePath);
      }
    } else if (projectInfo.hasSrcFolder && (filePath.startsWith('app/') || filePath.startsWith('components/') || filePath.startsWith('lib/'))) {
      targetFilePath = path.join(projectPath, 'src', filePath);
    }
  }
  
  // Ensure all parent directories exist before processing
  await fs.ensureDir(path.dirname(targetFilePath));
  
  switch (action) {
    case 'install':
      await handlePackageInstallation(sourceFilePath, projectPath, projectInfo.packageManager || 'npm');
      break;
      
    case 'create':
      await handleFileCreation(sourceFilePath, targetFilePath, sourceContent);
      break;
      
    case 'overwrite':
      await handleFileOverwrite(sourceFilePath, targetFilePath, sourceContent);
      break;
      
    case 'append':
      await handleFileAppend(sourceFilePath, targetFilePath, sourceContent);
      break;
      
    case 'prepend':
      await handleFilePrepend(sourceFilePath, targetFilePath, sourceContent);
      break;
      
    default:
      console.warn(chalk.yellow(`⚠️  Unknown action '${action}' for file: ${filePath}`));
  }
}

/**
 * Handle package.json installation
 */
async function handlePackageInstallation(
  sourceFilePath: string,
  projectPath: string,
  packageManager: string
): Promise<void> {
  try {
    if (await fs.pathExists(sourceFilePath)) {
      const packageData = await fs.readJson(sourceFilePath);
      const dependencies = packageData.dependencies || {};
      const devDependencies = packageData.devDependencies || {};
      
      const allDeps = { ...dependencies, ...devDependencies };
      const depNames = Object.keys(allDeps);
      
      if (depNames.length > 0) {
        console.log(chalk.blue(`📦 Installing packages: ${depNames.join(', ')}`));
  await installPackages(projectPath, 'javascript', depNames);
      }
    }
  } catch (error: any) {
    console.warn(chalk.yellow(`⚠️  Could not install packages: ${error.message}`));
  }
}

/**
 * Handle file creation (only if it doesn't exist)
 */
async function handleFileCreation(sourceFilePath: string, targetFilePath: string, cachedContent?: string | null): Promise<void> {
  if (await fs.pathExists(targetFilePath)) {
    console.log(chalk.yellow(`⚠️  File already exists, skipping: ${path.relative(process.cwd(), targetFilePath)}`));
    return;
  }
  
  if (cachedContent) {
    await fs.outputFile(targetFilePath, cachedContent);
  } else {
    await copyTemplateFile(sourceFilePath, targetFilePath);
  }
  console.log(chalk.green(`✅ Created: ${path.relative(process.cwd(), targetFilePath)}`));
}

/**
 * Handle file overwrite (replace existing content)
 */
async function handleFileOverwrite(sourceFilePath: string, targetFilePath: string, cachedContent?: string | null): Promise<void> {
  if (cachedContent) {
    await fs.outputFile(targetFilePath, cachedContent);
  } else {
    await copyTemplateFile(sourceFilePath, targetFilePath);
  }
  console.log(chalk.green(`✅ Updated: ${path.relative(process.cwd(), targetFilePath)}`));
}

/**
 * Handle file append (add content to end of file)
 */
async function handleFileAppend(sourceFilePath: string, targetFilePath: string, cachedContent?: string | null): Promise<void> {
  let existingContent = '';
  if (await fs.pathExists(targetFilePath)) {
    existingContent = await fs.readFile(targetFilePath, 'utf-8');
  }
  
  let templateContent: string;
  if (cachedContent) {
    templateContent = cachedContent;
  } else {
    templateContent = await fs.readFile(sourceFilePath, 'utf-8');
  }
  
  const separator = existingContent && !existingContent.endsWith('\n') ? '\n\n' : '\n';
  const newContent = existingContent + separator + templateContent;
  
  // Ensure target directory exists
  await fs.ensureDir(path.dirname(targetFilePath));
  await fs.outputFile(targetFilePath, newContent);
  console.log(chalk.green(`✅ Appended to: ${path.relative(process.cwd(), targetFilePath)}`));
}

/**
 * Handle file prepend (add content to beginning of file)
 */
async function handleFilePrepend(sourceFilePath: string, targetFilePath: string, cachedContent?: string | null): Promise<void> {
  let existingContent = '';
  if (await fs.pathExists(targetFilePath)) {
    existingContent = await fs.readFile(targetFilePath, 'utf-8');
  }
  
  let templateContent: string;
  if (cachedContent) {
    templateContent = cachedContent;
  } else {
    templateContent = await fs.readFile(sourceFilePath, 'utf-8');
  }
  
  const separator = templateContent.endsWith('\n') ? '' : '\n';
  const newContent = templateContent + separator + existingContent;
  
  // Ensure target directory exists
  await fs.ensureDir(path.dirname(targetFilePath));
  await fs.outputFile(targetFilePath, newContent);
  console.log(chalk.green(`✅ Prepended to: ${path.relative(process.cwd(), targetFilePath)}`));
}

/**
 * Copy template file to target location with Next.js content processing
 */
async function copyTemplateFile(sourceFilePath: string, targetFilePath: string): Promise<void> {
  if (!await fs.pathExists(sourceFilePath)) {
    throw new Error(`Template file not found: ${sourceFilePath}`);
  }
  
  // Ensure target directory exists
  await fs.ensureDir(path.dirname(targetFilePath));
  
  // For Next.js projects, we might need to adjust import paths in template files
  if (path.extname(sourceFilePath).match(/\.(js|jsx|ts|tsx)$/)) {
    const templateContent = await fs.readFile(sourceFilePath, 'utf-8');
    
    // Process content for Next.js src folder structure
    let processedContent = templateContent;
    
    // Adjust import paths if needed (this is basic - you might want to make it more sophisticated)
    if (targetFilePath.includes('/src/')) {
      processedContent = processedContent.replace(/from ['"]@\//g, 'from "@/');
      processedContent = processedContent.replace(/from ['"]\.\.\//g, 'from "../');
    }
    
    await fs.writeFile(targetFilePath, processedContent);
  } else {
    // For non-code files, just copy directly
    await fs.copy(sourceFilePath, targetFilePath);
  }
}

/**
 * Get the CLI installation root directory
 */
function getCliRootPath(): string {
  let cliRoot: string;
  
  if (__dirname.includes('/dist/')) {
    cliRoot = path.join(__dirname, '../..');
  } else {
    cliRoot = path.join(__dirname, '../..');
  }
  
  if (__dirname.includes('node_modules')) {
    const nodeModulesIndex = __dirname.lastIndexOf('node_modules');
    if (nodeModulesIndex !== -1) {
      const afterNodeModules = __dirname.substring(nodeModulesIndex + 'node_modules'.length);
      const packageParts = afterNodeModules.split(path.sep).filter(Boolean);
      
      if (packageParts.length >= 2) {
        if (packageParts[0].startsWith('@')) {
          cliRoot = path.join(__dirname.substring(0, nodeModulesIndex + 'node_modules'.length), packageParts[0], packageParts[1]);
        } else {
          cliRoot = path.join(__dirname.substring(0, nodeModulesIndex + 'node_modules'.length), packageParts[0]);
        }
      }
    }
  }
  
  return cliRoot;
}

/**
 * Show setup instructions for a feature
 */
function showSetupInstructions(featureName: string, provider: string): void {
  console.log(`\n${chalk.hex('#00d2d3')('📋 Setup Instructions:')}`);
  
  switch (featureName) {
    case 'auth':
      if (provider === 'clerk') {
        console.log(chalk.hex('#95afc0')('1. Sign up at https://clerk.com'));
        console.log(chalk.hex('#95afc0')('2. Get your API keys from the dashboard'));
        console.log(chalk.hex('#95afc0')('3. Add them to your .env file'));
      } else if (provider === 'auth0') {
        console.log(chalk.hex('#95afc0')('1. Sign up at https://auth0.com'));
        console.log(chalk.hex('#95afc0')('2. Create an application and get your domain/client ID'));
        console.log(chalk.hex('#95afc0')('3. Configure your .env file'));
      } else if (provider === 'next-auth') {
        console.log(chalk.hex('#95afc0')('1. Configure providers in your auth config'));
        console.log(chalk.hex('#95afc0')('2. Set NEXTAUTH_SECRET in .env'));
        console.log(chalk.hex('#95afc0')('3. Add provider client IDs/secrets'));
      }
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
      console.log(chalk.hex('#95afc0')(`Check the documentation for ${featureName} configuration`));
  }
}
