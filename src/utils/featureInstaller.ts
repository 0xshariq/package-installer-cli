/**
 * Feature installer utility - Handles adding authentication, Docker, and other features to projects
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { SupportedLanguage, detectProjectLanguage, installAdditionalPackages } from './dependencyInstaller.js';

// Get the directory of this file for proper path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load supported features from JSON file
let SUPPORTED_FEATURES: any = {};
try {
  const featuresPath = path.join(__dirname, '../../features/features.json');
  if (fs.existsSync(featuresPath)) {
    const featuresData = JSON.parse(fs.readFileSync(featuresPath, 'utf-8'));
    SUPPORTED_FEATURES = featuresData.features;
  }
} catch (error) {
  console.warn(chalk.yellow('⚠️  Could not load features.json, using fallback configuration'));
}

// Export for use in other modules
export { SUPPORTED_FEATURES };


/**
 * Get the CLI installation root directory
 */
function getCliRootPath(): string {
  let cliRoot: string;
  
  if (__dirname.includes('/dist/')) {
    // Running from compiled version (dist/utils/featureInstaller.js)
    cliRoot = path.join(__dirname, '../..');
  } else {
    // Running from source (src/utils/featureInstaller.ts)
    cliRoot = path.join(__dirname, '../..');
  }
  
  // Check if we're in a global npm installation
  // Global installations typically have the structure: /usr/local/lib/node_modules/@scope/package/
  if (__dirname.includes('node_modules')) {
    const nodeModulesIndex = __dirname.lastIndexOf('node_modules');
    if (nodeModulesIndex !== -1) {
      // Navigate to the package root from node_modules
      const afterNodeModules = __dirname.substring(nodeModulesIndex + 'node_modules'.length);
      const packageParts = afterNodeModules.split(path.sep).filter(Boolean);
      
      if (packageParts.length >= 2) {
        // For scoped packages: @scope/package
        if (packageParts[0].startsWith('@')) {
          cliRoot = path.join(__dirname.substring(0, nodeModulesIndex + 'node_modules'.length), packageParts[0], packageParts[1]);
        } else {
          // For regular packages: package
          cliRoot = path.join(__dirname.substring(0, nodeModulesIndex + 'node_modules'.length), packageParts[0]);
        }
      }
    }
  }
  
  return cliRoot;
}

/**
 * Get the path to a feature template
 */
function getFeaturePath(
  featureName: string, 
  framework: string, 
  projectLanguage: 'javascript' | 'typescript' = 'typescript',
  authProvider: string = 'clerk'
): string {
  // Get the features directory from the CLI installation root
  const cliRoot = getCliRootPath();
  const featuresRoot = path.join(cliRoot, 'features');
  
  // Verify the features directory exists
  if (!fs.existsSync(featuresRoot)) {
    console.warn(chalk.yellow(`⚠️  Features directory not found at: ${featuresRoot}`));
    console.warn(chalk.yellow(`   CLI root detected as: ${cliRoot}`));
    console.warn(chalk.yellow(`   __dirname is: ${__dirname}`));
    throw new Error(`Features directory not found. Please ensure the CLI is properly installed.`);
  }
  
  if (featureName === 'auth') {
    // Handle combo templates - use the backend framework for auth
    if (framework.includes('+')) {
      const parts = framework.split('+');
      const backendFramework = parts.find(part => 
        ['expressjs', 'nestjs'].includes(part)
      ) || parts[1]; // fallback to second part
      
      return path.join(featuresRoot, featureName, authProvider, backendFramework, projectLanguage);
    }
    
    // For regular frameworks
    return path.join(featuresRoot, featureName, authProvider, framework, projectLanguage);
  }
  
  // For docker - language is not important, just framework
  if (featureName === 'docker') {
    // Handle combo templates
    if (framework.includes('+')) {
      return path.join(featuresRoot, featureName, framework);
    }
    
    // For regular frameworks - no language subdirectory for docker
    return path.join(featuresRoot, featureName, framework);
  }
  
  // For other features - use a consistent structure
  if (framework.includes('+')) {
    // For combo templates, try the first framework
    const baseFramework = framework.split('+')[0];
    return path.join(featuresRoot, featureName, baseFramework);
  }
  
  // For regular frameworks
  return path.join(featuresRoot, featureName, framework);
}

export interface FeatureConfig {
  name: string;
  description: string;
  supportedFrameworks: string[];
  supportedLanguages: SupportedLanguage[];
  files: {
    [filePath: string]: {
      action: 'create' | 'append' | 'overwrite';
      content?: string;
      templatePath?: string;
    };
  };
}



/**
 * Detect the current project's framework and language with improved logic
 */
export async function detectProjectStack(projectPath: string): Promise<{
  framework?: string;
  language?: SupportedLanguage;
  projectLanguage?: 'javascript' | 'typescript'; // JS/TS distinction
  isComboTemplate?: boolean;
  packageManager?: string;
  hasSrcFolder?: boolean;
}> {
  try {
    // Detect language first
    const detectedLanguages = await detectProjectLanguage(projectPath);
    const primaryLanguage = detectedLanguages[0];
    
    // Detect framework by looking at key files and package.json
    let framework: string | undefined;
    let isComboTemplate = false;
    let packageManager = 'npm'; // default
    let projectLanguage: 'javascript' | 'typescript' = 'javascript';
    let hasSrcFolder = false;
    
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Detect TypeScript - Always check tsconfig.json first
      if (await fs.pathExists(path.join(projectPath, 'tsconfig.json'))) {
        projectLanguage = 'typescript';
      } else if (dependencies['typescript'] || 
          await fs.pathExists(path.join(projectPath, 'next.config.ts'))) {
        projectLanguage = 'typescript';
      } else {
        // Default to JavaScript if no TypeScript indicators found
        projectLanguage = 'javascript';
      }
      
      // Check for src folder structure
      hasSrcFolder = await fs.pathExists(path.join(projectPath, 'src'));
      
      // Detect package manager
      if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
        packageManager = 'pnpm';
      } else if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
        packageManager = 'yarn';
      }
      
      // Detect framework combinations first (more specific)
      if (dependencies['react'] && dependencies['express']) {
        framework = 'reactjs+expressjs+shadcn';
        isComboTemplate = true;
      } else if (dependencies['react'] && dependencies['@nestjs/core']) {
        framework = 'reactjs+nestjs+shadcn';
        isComboTemplate = true;
      }
      // Then detect individual frameworks
      else if (dependencies['next'] || dependencies['@next/core']) {
        framework = 'nextjs';
      } else if (dependencies['@nestjs/core'] || dependencies['@nestjs/common']) {
        framework = 'nestjs';
      } else if (dependencies['express']) {
        framework = 'expressjs';
      } else if (dependencies['react'] && !dependencies['next']) {
        framework = 'reactjs';
      } else if (dependencies['vue'] || dependencies['@vue/core']) {
        framework = 'vuejs';
      } else if (dependencies['@angular/core']) {
        framework = 'angularjs';
      } else if (dependencies['@remix-run/node'] || dependencies['@remix-run/dev']) {
        framework = 'remixjs';
      }
    }
    
    // Check for Rust projects
    const cargoTomlPath = path.join(projectPath, 'Cargo.toml');
    if (await fs.pathExists(cargoTomlPath)) {
      framework = 'rust';
    }
    
    return {
      framework,
      language: primaryLanguage,
      projectLanguage,
      isComboTemplate,
      packageManager,
      hasSrcFolder
    };
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  Could not detect project stack: ${error}`));
    return {};
  }
}

/**
 * Get framework-specific required packages for a feature
 */
function getFrameworkPackages(
  featureName: string, 
  framework: string, 
  language: SupportedLanguage, 
  authProvider: string = 'clerk'
): {
  dependencies?: string[];
  devDependencies?: string[];
} {
  if (featureName === 'auth' && language === 'nodejs') {
    if (authProvider === 'clerk') {
      switch (framework) {
        case 'nextjs':
          return { dependencies: ['@clerk/nextjs'] };
        case 'expressjs':
          return { dependencies: ['@clerk/express'] };
        case 'reactjs':
          return { dependencies: ['@clerk/clerk-react'] };
        case 'vuejs':
          return { dependencies: ['@clerk/vue'] };
        case 'remixjs':
          return { dependencies: ['@clerk/remix'] };
        case 'reactjs+expressjs+shadcn':
          return { dependencies: ['@clerk/clerk-react', '@clerk/express'] };
        case 'reactjs+nestjs+shadcn':
          return { dependencies: ['@clerk/clerk-react'] };
        default:
          return {};
      }
    } else if (authProvider === 'auth0') {
      switch (framework) {
        case 'nextjs':
          return { dependencies: ['@auth0/nextjs-auth0'] };
        case 'expressjs':
          return { dependencies: ['express-oauth-server', '@auth0/express-oauth2'] };
        case 'reactjs':
          return { dependencies: ['@auth0/auth0-react'] };
        case 'vuejs':
          return { dependencies: ['@auth0/auth0-vue'] };
        case 'remixjs':
          return { dependencies: ['@auth0/auth0-react'] }; // Use React SDK for Remix
        case 'reactjs+expressjs+shadcn':
          return { dependencies: ['@auth0/auth0-react', '@auth0/express-oauth2'] };
        case 'reactjs+nestjs+shadcn':
          return { dependencies: ['@auth0/auth0-react'] };
        default:
          return {};
      }
    }
  }
  
  return {};
}

/**
 * Get framework-specific files for a feature based on SUPPORTED_FEATURES structure
 */
function getFrameworkFiles(
  featureName: string, 
  framework: string, 
  language: string = 'typescript',
  authProvider: string = 'clerk'
): { [filePath: string]: FeatureConfig['files'][string] } {
  const feature = SUPPORTED_FEATURES[featureName];
  if (!feature || !feature.files) {
    return {};
  }

  const baseFiles: { [filePath: string]: FeatureConfig['files'][string] } = {};

  if (featureName === 'auth') {
    // Get auth provider specific files
    const authFiles = feature.files[authProvider];
    if (!authFiles) {
      console.log(chalk.yellow(`⚠️  Auth provider '${authProvider}' not found, falling back to 'clerk'`));
      const clerkFiles = feature.files['clerk'];
      if (clerkFiles) {
        return getAuthProviderFiles(clerkFiles, framework, language);
      }
      return {};
    }
    
    return getAuthProviderFiles(authFiles, framework, language);
  } else if (featureName === 'ui') {
    // Get UI library specific files (daisy, etc.)
    const uiProvider = 'daisy'; // Default to daisy for now
    const uiFiles = feature.files[uiProvider];
    if (!uiFiles) {
      return {};
    }
    
    return getUIProviderFiles(uiFiles, framework, language);
  } else {
    // For other features, use direct structure
    const files = feature.files as any;
    Object.keys(files).forEach(filePath => {
      baseFiles[filePath] = files[filePath];
    });
  }

  return baseFiles;
}

/**
 * Get auth provider specific files for a framework and language
 */
function getAuthProviderFiles(
  authProviderFiles: any, 
  framework: string, 
  language: string
): { [filePath: string]: FeatureConfig['files'][string] } {
  const baseFiles: { [filePath: string]: FeatureConfig['files'][string] } = {};
  
  // Get framework specific files
  const frameworkFiles = authProviderFiles[framework];
  if (!frameworkFiles) {
    return {};
  }
  
  // Get language specific files
  const languageFiles = frameworkFiles[language];
  if (!languageFiles) {
    // Fallback to typescript if javascript not available
    const fallbackFiles = frameworkFiles['typescript'];
    if (fallbackFiles) {
      console.log(chalk.yellow(`⚠️  ${language} templates not available, using TypeScript templates`));
      Object.keys(fallbackFiles).forEach(filePath => {
        // Convert .ts/.tsx extensions to .js/.jsx for JavaScript projects
        let jsFilePath = filePath;
        if (language === 'javascript') {
          jsFilePath = filePath.replace(/\.tsx?$/, filePath.endsWith('.tsx') ? '.jsx' : '.js');
        }
        baseFiles[jsFilePath] = fallbackFiles[filePath];
      });
    }
    return baseFiles;
  }
  
  // Handle Next.js src folder structure
  if (framework === 'nextjs') {
    const projectPath = process.cwd();
    const hasSrc = fs.existsSync(path.join(projectPath, 'src'));
    
    Object.keys(languageFiles).forEach(filePath => {
      let finalPath = filePath;
      
      // Adjust paths for src folder structure
      if (hasSrc && !filePath.startsWith('src/') && 
          (filePath.includes('app/') || filePath.includes('lib/') || filePath === 'middleware.ts' || filePath === 'middleware.js')) {
        finalPath = `src/${filePath}`;
      }
      
      baseFiles[finalPath] = languageFiles[filePath];
    });
  } else {
    // For other frameworks, use files as-is
    Object.keys(languageFiles).forEach(filePath => {
      baseFiles[filePath] = languageFiles[filePath];
    });
  }
  
  return baseFiles;
}

/**
 * Get UI provider specific files for a framework and language
 */
function getUIProviderFiles(
  uiProviderFiles: any,
  framework: string, 
  language: string
): { [filePath: string]: FeatureConfig['files'][string] } {
  const baseFiles: { [filePath: string]: FeatureConfig['files'][string] } = {};
  
  const frameworkFiles = uiProviderFiles[framework];
  if (!frameworkFiles) {
    return {};
  }
  
  const languageFiles = frameworkFiles[language];
  if (!languageFiles) {
    // For UI, always overwrite files regardless of language
    const fallbackFiles = frameworkFiles['typescript'] || frameworkFiles['javascript'];
    if (fallbackFiles) {
      Object.keys(fallbackFiles).forEach(filePath => {
        baseFiles[filePath] = { action: 'overwrite' };  // UI files should always overwrite
      });
    }
    return baseFiles;
  }
  
  // UI files should always overwrite
  Object.keys(languageFiles).forEach(filePath => {
    baseFiles[filePath] = { action: 'overwrite' };
  });
  
  return baseFiles;
  } else if (featureName === 'docker') {
    baseFiles['Dockerfile'] = { action: 'create' };
    baseFiles['docker-compose.yml'] = { action: 'create' };
    baseFiles['.dockerignore'] = { action: 'create' };
  }
  
  return baseFiles;
}

/**
 * Check if a file should be skipped based on framework and project structure
 */
function shouldSkipFile(filePath: string, framework: string, projectPath: string): boolean {
  // Skip files that don't exist in the current project structure
  if (filePath.includes('/') && !filePath.startsWith('.')) {
    const directory = path.dirname(filePath);
    const dirPath = path.join(projectPath, directory);
    
    // Check if the directory exists
    if (!fs.existsSync(dirPath)) {
      console.log(chalk.yellow(`⚠️  Directory ${directory} not found, skipping ${filePath}`));
      return true;
    }
  }
  
  // Skip Next.js specific files for non-Next.js frameworks
  if ((filePath === 'app/layout.tsx' || filePath === 'middleware.ts') && 
      !framework.includes('nextjs')) {
    return true;
  }
  
  // Skip Express specific files for non-Express frameworks
  if (filePath === 'index.ts' && !framework.includes('expressjs')) {
    return true;
  }
  
  return false;
}

/**
 * Check if a feature is supported for the current project stack
 */
export function isFeatureSupported(
  featureName: string, 
  framework: string, 
  language: SupportedLanguage
): boolean {
  const feature = SUPPORTED_FEATURES[featureName];
  if (!feature) return false;
  
  const frameworkSupported = feature.supportedFrameworks.includes(framework) ||
    feature.supportedFrameworks.some(fw => framework.startsWith(fw));
    
  const languageSupported = feature.supportedLanguages.includes(language);
  
  return frameworkSupported && languageSupported;
}

/**
 * Get template path for a specific framework, feature, and language
 */
function getFeatureTemplatePath(
  featureName: string, 
  framework: string, 
  projectLanguage: 'javascript' | 'typescript' = 'typescript',
  authProvider: string = 'clerk'
): string {
  // Get the features directory relative to the CLI installation
  // From src/utils/featureInstaller.ts -> ../../features
  let featuresRoot = path.join(__dirname, '../../features');
  
  // Check if we're running from dist folder (compiled)
  if (__dirname.includes('/dist/')) {
    // From dist/utils/featureInstaller.js -> ../../features
    featuresRoot = path.join(__dirname, '../../features');
  }
  
  if (featureName === 'auth') {
    // Handle combo templates - use the backend framework for auth
    if (framework.includes('+')) {
      const parts = framework.split('+');
      const backendFramework = parts.find(part => 
        ['expressjs', 'nestjs'].includes(part)
      ) || parts[1]; // fallback to second part
      
      return path.join(featuresRoot, featureName, authProvider, backendFramework, projectLanguage);
    }
    
    // For regular frameworks
    return path.join(featuresRoot, featureName, authProvider, framework, projectLanguage);
  }
  
  // For docker - language is not important, just framework
  if (featureName === 'docker') {
    // Handle combo templates
    if (framework.includes('+')) {
      return path.join(featuresRoot, featureName, framework);
    }
    
    // For regular frameworks - no language subdirectory for docker
    return path.join(featuresRoot, featureName, framework);
  }
  
  // For other features
  const baseFramework = framework.split('+')[0];
  return path.join(featuresRoot, featureName, baseFramework);
}

/**
 * Read template file content
 */
async function readTemplateFile(templatePath: string, fileName: string): Promise<string> {
  const filePath = path.join(templatePath, fileName);
  
  if (!(await fs.pathExists(filePath))) {
    throw new Error(`Template file not found: ${filePath}`);
  }
  
  return fs.readFile(filePath, 'utf-8');
}

/**
 * Handle file operations for feature installation with enhanced folder creation
 */
async function processFeatureFile(
  projectPath: string,
  filePath: string,
  fileConfig: FeatureConfig['files'][string],
  templatePath: string,
  framework: string
): Promise<void> {
  // Check if file should be skipped
  if (shouldSkipFile(filePath, framework, projectPath)) {
    return;
  }
  
  const targetPath = path.join(projectPath, filePath);
  const targetDir = path.dirname(targetPath);
  
  // Ensure directory exists - create if missing
  if (!await fs.pathExists(targetDir)) {
    console.log(chalk.blue(`📁 Creating directory: ${path.relative(projectPath, targetDir)}`));
    await fs.ensureDir(targetDir);
  }
  
  switch (fileConfig.action) {
    case 'create':
      if (await fs.pathExists(targetPath)) {
        console.log(chalk.yellow(`⚠️  File ${filePath} already exists, skipping...`));
        return;
      }
      
      if (fileConfig.content) {
        await fs.outputFile(targetPath, fileConfig.content);
      } else {
        const content = await readTemplateFile(templatePath, filePath);
        await fs.outputFile(targetPath, content);
      }
      console.log(chalk.green(`✅ Created: ${filePath}`));
      break;
      
    case 'overwrite':
      if (fileConfig.content) {
        await fs.outputFile(targetPath, fileConfig.content);
      } else {
        const content = await readTemplateFile(templatePath, filePath);
        
        // Handle special cases for layout.tsx metadata
        if (filePath.includes('layout.tsx') && framework === 'nextjs') {
          const processedContent = await processNextjsLayout(content, projectPath);
          await fs.outputFile(targetPath, processedContent);
        } else {
          await fs.outputFile(targetPath, content);
        }
      }
      console.log(chalk.green(`✅ Updated: ${filePath}`));
      break;
      
    case 'append':
      let existingContent = '';
      if (await fs.pathExists(targetPath)) {
        existingContent = await fs.readFile(targetPath, 'utf-8');
      }
      
      let newContent = '';
      if (fileConfig.content) {
        newContent = fileConfig.content;
      } else {
        newContent = await readTemplateFile(templatePath, filePath);
      }
      
      // Handle .env file appending - avoid duplicates
      if (filePath === '.env') {
        const existingLines = new Set(existingContent.split('\n').filter(line => line.trim()));
        const newLines = newContent.split('\n').filter(line => line.trim());
        
        const uniqueNewLines = newLines.filter(line => {
          const [key] = line.split('=');
          return !Array.from(existingLines).some(existingLine => 
            existingLine.startsWith(key + '=')
          );
        });
        
        if (uniqueNewLines.length > 0) {
          const separator = existingContent ? '\n\n# Authentication Configuration\n' : '';
          const finalContent = existingContent + separator + uniqueNewLines.join('\n') + '\n';
          await fs.outputFile(targetPath, finalContent);
          console.log(chalk.green(`✅ Updated: ${filePath}`));
        }
      } else {
        const separator = existingContent ? '\n\n' : '';
        await fs.outputFile(targetPath, existingContent + separator + newContent);
        console.log(chalk.green(`✅ Updated: ${filePath}`));
      }
      break;
  }
}

/**
 * Process Next.js layout.tsx to preserve template-specific metadata
 */
async function processNextjsLayout(content: string, projectPath: string): Promise<string> {
  try {
    const layoutPath = path.join(projectPath, 'app/layout.tsx');
    
    if (await fs.pathExists(layoutPath)) {
      const existingContent = await fs.readFile(layoutPath, 'utf-8');
      
      // Extract metadata from existing layout
      const metadataMatch = existingContent.match(/export const metadata[^}]+}/s);
      
      if (metadataMatch) {
        // Replace the metadata in the auth template with the existing one
        const updatedContent = content.replace(
          /export const metadata[^}]+}/s,
          metadataMatch[0]
        );
        return updatedContent;
      }
    }
    
    return content;
  } catch (error) {
    console.warn(chalk.yellow('⚠️  Could not process layout.tsx metadata, using default'));
    return content;
  }
}

/**
 * Separate function for feature installation packages
 */
export async function installFeaturePackagesOnly(
  featureName: string,
  language: SupportedLanguage,
  framework: string,
  projectPath: string,
  authProvider: string = 'clerk'
): Promise<void> {
  // Get dynamic package requirements based on framework
  const packages = getFrameworkPackages(featureName, framework, language, authProvider);
  
  if (!packages || (!packages.dependencies?.length && !packages.devDependencies?.length)) {
    return;
  }
  
  // Install dependencies
  if (packages.dependencies && packages.dependencies.length > 0) {
    await installAdditionalPackages(language, packages.dependencies, projectPath, false);
  }
  
  // Install dev dependencies
  if (packages.devDependencies && packages.devDependencies.length > 0) {
    await installAdditionalPackages(language, packages.devDependencies, projectPath, true);
  }
  
  // Install GitHub MCP server for Node.js projects
  if (language === 'nodejs') {
    try {
      await installAdditionalPackages(language, ['@0xshariq/github-mcp-server'], projectPath, false);
      console.log(chalk.green('✅ GitHub MCP server installed for git operations'));
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not install GitHub MCP server'));
    }
  }
}

/**
 * Install required packages for a feature (backward compatibility)
 */
async function installFeaturePackages(
  featureName: string,
  language: SupportedLanguage,
  framework: string,
  projectPath: string,
  authProvider: string = 'clerk'
): Promise<void> {
  return installFeaturePackagesOnly(featureName, language, framework, projectPath, authProvider);
}

export async function addFeature(
  featureName: string, 
  projectPath: string = process.cwd(), 
  options: { authProvider?: string } = {}
): Promise<void> {
  const spinner = ora(chalk.hex('#9c88ff')('🔍 Analyzing project structure...')).start();
  
  try {
    // Detect project stack
    const { framework, language, projectLanguage, isComboTemplate, packageManager } = await detectProjectStack(projectPath);
    
    if (!framework || !language) {
      spinner.fail(chalk.red('❌ Could not detect project framework or language'));
      console.log(chalk.hex('#95afc0')('💡 Make sure you are in a valid project directory'));
      console.log(chalk.hex('#95afc0')('   Supported: Next.js, React, Express, NestJS, Vue.js, Angular, Remix, Rust'));
      return;
    }
    
    spinner.text = chalk.hex('#9c88ff')(`Detected ${framework} project with ${language} (${projectLanguage || 'typescript'})...`);
    
    // Check if feature is supported
    if (!isFeatureSupported(featureName, framework, language)) {
      spinner.fail(chalk.red(`❌ Feature '${featureName}' is not supported for ${framework} projects`));
      console.log(chalk.hex('#95afc0')(`💡 Supported frameworks for ${featureName}:`));
      const feature = SUPPORTED_FEATURES[featureName];
      if (feature) {
        feature.supportedFrameworks.forEach(fw => {
          console.log(chalk.hex('#95afc0')(`   • ${fw}`));
        });
      }
      return;
    }
    
    const feature = SUPPORTED_FEATURES[featureName];
    spinner.succeed(chalk.green(`✅ ${feature.name} is supported for ${framework}`));
    
    // Get template path with language consideration and auth provider
    const authProvider = options.authProvider || 'clerk';
    const templatePath = getFeatureTemplatePath(featureName, framework, projectLanguage || 'typescript', authProvider);
    
    if (!(await fs.pathExists(templatePath))) {
      // Fallback to TypeScript template if JavaScript variant doesn't exist
      const fallbackPath = getFeatureTemplatePath(featureName, framework, 'typescript', authProvider);
      if (!(await fs.pathExists(fallbackPath))) {
        // If auth provider template doesn't exist, try the default (clerk)
        if (featureName === 'auth' && authProvider !== 'clerk') {
          const clerkPath = getFeatureTemplatePath(featureName, framework, projectLanguage || 'typescript', 'clerk');
          if (await fs.pathExists(clerkPath)) {
            console.log(chalk.yellow(`⚠️  ${authProvider} templates not available yet, using Clerk template`));
          } else {
            throw new Error(`Feature template not found: ${templatePath} (fallback: ${fallbackPath})`);
          }
        } else {
          throw new Error(`Feature template not found: ${templatePath} (fallback: ${fallbackPath})`);
        }
      } else {
        console.log(chalk.yellow(`⚠️  Using TypeScript template as fallback for ${projectLanguage} project`));
      }
    }
    
    console.log(chalk.hex('#00d2d3')(`📦 Adding ${feature.name} to your ${framework} project...`));
    
    // Install required packages
    if (featureName === 'auth' || featureName === 'docker') {
      const packageSpinner = ora(chalk.hex('#f39c12')('📦 Installing required packages...')).start();
      try {
        await installFeaturePackages(featureName, language, framework, projectPath, authProvider);
        packageSpinner.succeed(chalk.green('✅ Required packages installed'));
      } catch (error: any) {
        packageSpinner.warn(chalk.yellow(`⚠️  Some packages failed to install: ${error.message}`));
      }
    }
    
    // Get framework-specific files
    const frameworkFiles = getFrameworkFiles(featureName, framework, projectLanguage || 'typescript', authProvider);
    
    // Process feature files
    const fileSpinner = ora(chalk.hex('#00d2d3')('📝 Adding feature files...')).start();
    
    for (const [filePath, fileConfig] of Object.entries(frameworkFiles)) {
      try {
        fileSpinner.text = chalk.hex('#00d2d3')(`Processing ${filePath}...`);
        await processFeatureFile(projectPath, filePath, fileConfig, templatePath, framework);
      } catch (error: any) {
        console.warn(chalk.yellow(`⚠️  Could not process ${filePath}: ${error.message}`));
      }
    }
    
    fileSpinner.succeed(chalk.green('✅ Feature files added successfully'));
    
    // Show success message
    console.log('\n' + chalk.hex('#10ac84')('✨ Feature added successfully!'));
    console.log(chalk.hex('#00d2d3')(`📁 ${feature.name} has been added to your project`));
    
    // Show next steps based on feature
    if (featureName === 'auth') {
      console.log('\n' + chalk.hex('#00d2d3')('🔐 Next Steps for Authentication:'));
      console.log(chalk.hex('#95afc0')('1. Sign up for Clerk at https://clerk.com'));
      console.log(chalk.hex('#95afc0')('2. Create a new application'));
      console.log(chalk.hex('#95afc0')('3. Copy your API keys to the .env file'));
      console.log(chalk.hex('#95afc0')('4. Configure your sign-in/sign-up pages'));
      console.log(chalk.hex('#95afc0')('5. Start your development server'));
    } else if (featureName === 'docker') {
      console.log('\n' + chalk.hex('#00d2d3')('🐳 Next Steps for Docker:'));
      console.log(chalk.hex('#95afc0')('1. Review and customize Dockerfile and docker-compose.yml'));
      console.log(chalk.hex('#95afc0')('2. Build your Docker image: docker build -t your-app .'));
      console.log(chalk.hex('#95afc0')('3. Run with Docker Compose: docker-compose up'));
    }
    
  } catch (error: any) {
    spinner.fail(chalk.red(`❌ Failed to add feature: ${error.message}`));
    throw error;
  }
}

/**
 * List all available features
 */
export function listAvailableFeatures(): void {
  console.log('\n' + chalk.hex('#9c88ff')('✨ Available Features:'));
  console.log(chalk.hex('#95afc0')('─'.repeat(50)));
  
  for (const [name, config] of Object.entries(SUPPORTED_FEATURES)) {
    console.log(`${chalk.hex('#10ac84')('• ' + config.name)} ${chalk.hex('#95afc0')('(' + name + ')')}`);
    console.log(`  ${chalk.hex('#95afc0')(config.description)}`);
    console.log(`  ${chalk.hex('#ffa502')('Frameworks:')} ${config.supportedFrameworks.join(', ')}`);
    console.log('');
  }
}

/**
 * Install Auth0 authentication
 */
export async function installAuth0Auth(
  framework: string, 
  language: string,
  options: { src?: boolean } = {}
): Promise<void> {
  const spinner = ora(chalk.hex('#f39c12')('Installing Auth0 authentication...')).start();
  
  try {
    // Auth0 only supports TypeScript for AngularJS 
    if (framework === 'angularjs' && language === 'javascript') {
      spinner.fail(chalk.red('❌ Auth0 only supports TypeScript for Angular projects'));
      throw new Error('Auth0 does not support JavaScript for Angular projects');
    }
    
    const featurePath = path.join(getCliRootPath(), 'features', 'auth', 'auth0', framework, language);
    
    if (!await fs.pathExists(featurePath)) {
      spinner.fail(chalk.red(`❌ Auth0 templates not found for ${framework}/${language}`));
      throw new Error(`Auth0 templates not available for ${framework}/${language}`);
    }
    
    await copyFeatureFiles(featurePath, process.cwd(), { src: options.src });
    
    // Install Auth0 dependencies
    const dependencies = getAuth0Dependencies(framework);
    if (dependencies.length > 0) {
      await installAdditionalPackages(dependencies, language as SupportedLanguage);
    }
    
    spinner.succeed(chalk.green('✅ Auth0 authentication installed successfully'));
    
    // Show Auth0 setup instructions
    console.log('\n' + chalk.hex('#f39c12')('📋 Auth0 Setup Instructions:'));
    console.log(chalk.hex('#95afc0')('1. Create an Auth0 account at https://auth0.com'));
    console.log(chalk.hex('#95afc0')('2. Set up your Auth0 application and get your domain and client ID'));
    console.log(chalk.hex('#95afc0')('3. Update the .env file with your Auth0 credentials'));
    console.log(chalk.hex('#95afc0')('4. Documentation: https://auth0.com/docs/quickstart/webapp'));
    
  } catch (error: any) {
    spinner.fail(chalk.red(`❌ Failed to install Auth0: ${error.message}`));
    throw error;
  }
}

/**
 * Install Clerk authentication
 */
export async function installClerkAuth(
  framework: string, 
  language: string,
  options: { src?: boolean } = {}
): Promise<void> {
  const spinner = ora(chalk.hex('#f39c12')('Installing Clerk authentication...')).start();
  
  try {
    // Clerk only supports TypeScript for RemixJS
    if (framework === 'remixjs' && language === 'javascript') {
      spinner.fail(chalk.red('❌ Clerk only supports TypeScript for Remix projects'));
      throw new Error('Clerk does not support JavaScript for Remix projects');
    }
    
    const featurePath = path.join(getCliRootPath(), 'features', 'auth', 'clerk', framework, language);
    
    if (!await fs.pathExists(featurePath)) {
      spinner.fail(chalk.red(`❌ Clerk templates not found for ${framework}/${language}`));
      throw new Error(`Clerk templates not available for ${framework}/${language}`);
    }
    
    await copyFeatureFiles(featurePath, process.cwd(), { src: options.src });
    
    // Install Clerk dependencies
    const dependencies = getClerkDependencies(framework);
    if (dependencies.length > 0) {
      await installAdditionalPackages(dependencies, language as SupportedLanguage);
    }
    
    spinner.succeed(chalk.green('✅ Clerk authentication installed successfully'));
    
    // Show Clerk setup instructions
    console.log('\n' + chalk.hex('#f39c12')('📋 Clerk Setup Instructions:'));
    console.log(chalk.hex('#95afc0')('1. Create a Clerk account at https://clerk.com'));
    console.log(chalk.hex('#95afc0')('2. Create a new application and get your publishable key and secret key'));
    console.log(chalk.hex('#95afc0')('3. Update the .env file with your Clerk credentials'));
    console.log(chalk.hex('#95afc0')('4. Documentation: https://clerk.com/docs'));
    
  } catch (error: any) {
    spinner.fail(chalk.red(`❌ Failed to install Clerk: ${error.message}`));
    throw error;
  }
}

/**
 * Install Next-Auth authentication
 */
export async function installNextAuth(
  framework: string, 
  language: string,
  options: { src?: boolean } = {}
): Promise<void> {
  const spinner = ora(chalk.hex('#f39c12')('Installing Next-Auth authentication...')).start();
  
  try {
    // Next-Auth is primarily for Next.js
    if (framework !== 'nextjs') {
      spinner.fail(chalk.red('❌ Next-Auth is only available for Next.js projects'));
      throw new Error('Next-Auth is only supported for Next.js projects');
    }
    
    const featurePath = path.join(getCliRootPath(), 'features', 'auth', 'next-auth', framework, language);
    
    if (!await fs.pathExists(featurePath)) {
      spinner.fail(chalk.red(`❌ Next-Auth templates not found for ${framework}/${language}`));
      throw new Error(`Next-Auth templates not available for ${framework}/${language}`);
    }
    
    await copyFeatureFiles(featurePath, process.cwd(), { src: options.src });
    
    // Install Next-Auth dependencies
    const dependencies = getNextAuthDependencies();
    if (dependencies.length > 0) {
      await installAdditionalPackages(dependencies, language as SupportedLanguage);
    }
    
    spinner.succeed(chalk.green('✅ Next-Auth authentication installed successfully'));
    
    // Show Next-Auth setup instructions
    console.log('\n' + chalk.hex('#f39c12')('📋 Next-Auth Setup Instructions:'));
    console.log(chalk.hex('#95afc0')('1. Configure your authentication providers in lib/auth.ts'));
    console.log(chalk.hex('#95afc0')('2. Set up your environment variables in .env.local'));
    console.log(chalk.hex('#95afc0')('3. Add your database connection if using database sessions'));
    console.log(chalk.hex('#95afc0')('4. Documentation: https://next-auth.js.org/getting-started/introduction'));
    
  } catch (error: any) {
    spinner.fail(chalk.red(`❌ Failed to install Next-Auth: ${error.message}`));
    throw error;
  }
}

/**
 * Get Auth0 dependencies for a specific framework
 */
function getAuth0Dependencies(framework: string): string[] {
  switch (framework) {
    case 'nextjs':
      return ['@auth0/nextjs-auth0'];
    case 'expressjs':
      return ['express-openid-connect'];
    case 'vuejs':
      return ['@auth0/auth0-vue'];
    case 'reactjs':
      return ['@auth0/auth0-react'];
    case 'angularjs':
      return ['@auth0/auth0-angular'];
    default:
      return [];
  }
}

/**
 * Get Clerk dependencies for a specific framework
 */
function getClerkDependencies(framework: string): string[] {
  switch (framework) {
    case 'nextjs':
      return ['@clerk/nextjs'];
    case 'expressjs':
      return ['@clerk/express'];
    case 'reactjs':
      return ['@clerk/clerk-react'];
    case 'vuejs':
      return ['@clerk/vue'];
    case 'remixjs':
      return ['@clerk/remix'];
    default:
      return [];
  }
}

/**
 * Get Next-Auth dependencies
 */
function getNextAuthDependencies(): string[] {
  return ['next-auth', 'bcryptjs', '@types/bcryptjs'];
}

/**
 * Separate auth provider installation functions to avoid conflicts
 */

/**
 * Install Clerk authentication
 */
export async function installClerkAuth(
  framework: string,
  language: string,
  projectPath: string = process.cwd()
): Promise<void> {
  console.log(chalk.hex('#7c3aed')('🔐 Installing Clerk Authentication...'));
  
  // Add disclaimer about Auth0 Angular support
  if (framework === 'angularjs') {
    console.log(chalk.yellow('⚠️  Clerk may have limited support for AngularJS. Consider using TypeScript templates.'));
  }
  
  if (framework === 'remixjs' && language === 'javascript') {
    throw new Error('Clerk only supports TypeScript for Remix.js projects');
  }
  
  await addFeature('auth', projectPath, { authProvider: 'clerk' });
  
  // Add quick setup docs
  console.log(chalk.hex('#00d2d3')('\n📖 Quick Setup Guide:'));
  console.log(chalk.gray('1. Create a Clerk account at https://clerk.com'));
  console.log(chalk.gray('2. Create a new application'));
  console.log(chalk.gray('3. Copy your API keys to .env file'));
  console.log(chalk.gray('4. Configure your sign-in/sign-up pages'));
  console.log(chalk.hex('#00d2d3')('📚 Full docs: https://clerk.com/docs'));
}

/**
 * Install Auth0 authentication
 */
export async function installAuth0Auth(
  framework: string,
  language: string,
  projectPath: string = process.cwd()
): Promise<void> {
  console.log(chalk.hex('#eb5424')('🔐 Installing Auth0 Authentication...'));
  
  // Check language support
  if (framework === 'angularjs' && language === 'javascript') {
    throw new Error('Auth0 only supports TypeScript for AngularJS projects');
  }
  
  await addFeature('auth', projectPath, { authProvider: 'auth0' });
  
  // Add quick setup docs
  console.log(chalk.hex('#00d2d3')('\n📖 Quick Setup Guide:'));
  console.log(chalk.gray('1. Create an Auth0 account at https://auth0.com'));
  console.log(chalk.gray('2. Create a new application'));
  console.log(chalk.gray('3. Configure allowed callback URLs'));
  console.log(chalk.gray('4. Copy your domain and client ID to .env file'));
  console.log(chalk.hex('#00d2d3')('📚 Full docs: https://auth0.com/docs'));
}

/**
 * Install Next-Auth authentication
 */
export async function installNextAuth(
  framework: string,
  language: string,
  projectPath: string = process.cwd()
): Promise<void> {
  console.log(chalk.hex('#0070f3')('🔐 Installing NextAuth.js...'));
  
  if (framework !== 'nextjs') {
    throw new Error('NextAuth.js is only supported for Next.js projects');
  }
  
  await addFeature('auth', projectPath, { authProvider: 'next-auth' });
  
  // Add quick setup docs
  console.log(chalk.hex('#00d2d3')('\n📖 Quick Setup Guide:'));
  console.log(chalk.gray('1. Configure your providers in lib/auth.ts'));
  console.log(chalk.gray('2. Set NEXTAUTH_SECRET in .env file'));
  console.log(chalk.gray('3. Configure OAuth providers (Google, GitHub, etc.)'));
  console.log(chalk.gray('4. Set up your database connection'));
  console.log(chalk.hex('#00d2d3')('📚 Full docs: https://next-auth.js.org'));
}
