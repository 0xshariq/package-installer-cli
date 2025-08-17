/**
 * Feature installer utility - Handles adding authentication, Docker, and other features to projects
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { SupportedLanguage, detectProjectLanguage, installAdditionalPackages } from './dependencyInstaller.js';

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

// Supported features configuration
export const SUPPORTED_FEATURES: { [key: string]: FeatureConfig } = {
  auth: {
    name: 'Authentication',
    description: 'Add authentication to your project (Clerk or Auth0)',
    supportedFrameworks: ['nextjs', 'expressjs', 'reactjs', 'vuejs', 'remixjs'],
    supportedLanguages: ['nodejs'],
    files: {
      '.env': {
        action: 'append'
      }
    }
  },
  docker: {
    name: 'Docker',
    description: 'Add Docker configuration to your project',
    supportedFrameworks: ['nextjs', 'expressjs', 'nestjs', 'reactjs', 'vuejs', 'angularjs', 'remixjs', 'rust'],
    supportedLanguages: ['nodejs', 'rust'],
    files: {
      'Dockerfile': {
        action: 'create'
      },
      'docker-compose.yml': {
        action: 'create'
      },
      '.dockerignore': {
        action: 'create'
      }
    }
  },
  testing: {
    name: 'Testing Setup',
    description: 'Add testing configuration (Jest, Vitest, or framework-specific)',
    supportedFrameworks: ['nextjs', 'expressjs', 'reactjs', 'vuejs', 'angularjs'],
    supportedLanguages: ['nodejs'],
    files: {
      'jest.config.js': {
        action: 'create'
      }
    }
  },
  ui: {
    name: 'UI Components',
    description: 'Add UI component library ( Ant Design, Mantine-UI) - Coming Soon',
    supportedFrameworks: ['nextjs', 'reactjs', 'vuejs'],
    supportedLanguages: ['nodejs'],
    files: {}
  },
  api: {
    name: 'API Routes',
    description: 'Add API route templates and utilities - Coming Soon',
    supportedFrameworks: ['nextjs', 'expressjs', 'nestjs'],
    supportedLanguages: ['nodejs'],
    files: {}
  },
  pwa: {
    name: 'Progressive Web App',
    description: 'Add PWA configuration and service workers - Coming Soon',
    supportedFrameworks: ['nextjs', 'reactjs', 'vuejs'],
    supportedLanguages: ['nodejs'],
    files: {}
  },
  monitoring: {
    name: 'Monitoring & Analytics',
    description: 'Add monitoring tools (Sentry, Google Analytics) - Coming Soon',
    supportedFrameworks: ['nextjs', 'reactjs', 'vuejs', 'expressjs'],
    supportedLanguages: ['nodejs'],
    files: {}
  }
};

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
      
      // Detect TypeScript
      if (dependencies['typescript'] || 
          await fs.pathExists(path.join(projectPath, 'tsconfig.json')) ||
          await fs.pathExists(path.join(projectPath, 'next.config.ts'))) {
        projectLanguage = 'typescript';
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
 * Get framework-specific files for a feature
 */
function getFrameworkFiles(featureName: string, framework: string): { [filePath: string]: FeatureConfig['files'][string] } {
  const baseFiles: { [filePath: string]: FeatureConfig['files'][string] } = {};
  
  if (featureName === 'auth') {
    // Always include .env file
    baseFiles['.env'] = { action: 'append' };
    
    // Framework-specific files
    switch (framework) {
      case 'nextjs':
        baseFiles['middleware.ts'] = { action: 'overwrite' };
        baseFiles['app/layout.tsx'] = { action: 'overwrite' };
        break;
      case 'expressjs':
        baseFiles['index.ts'] = { action: 'overwrite' };
        baseFiles['types/index.ts'] = { action: 'create' };
        break;
      case 'reactjs':
        baseFiles['src/main.tsx'] = { action: 'overwrite' };
        baseFiles['src/App.tsx'] = { action: 'overwrite' };
        break;
      case 'vuejs':
        baseFiles['src/main.ts'] = { action: 'overwrite' };
        baseFiles['src/App.vue'] = { action: 'overwrite' };
        break;
      case 'remixjs':
        baseFiles['app/root.tsx'] = { action: 'overwrite' };
        break;
      case 'reactjs+expressjs+shadcn':
        // Use backend auth for combo templates
        baseFiles['server/index.ts'] = { action: 'overwrite' };
        baseFiles['server/types/index.ts'] = { action: 'create' };
        break;
    }
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
  const featuresRoot = path.join(process.cwd(), 'features');
  
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
  
  // For docker with combo templates
  if (framework.includes('+') && featureName === 'docker') {
    return path.join(featuresRoot, featureName, framework);
  }
  
  // For regular frameworks
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
 * Handle file operations for feature installation
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
        }
      } else {
        const separator = existingContent ? '\n\n' : '';
        await fs.outputFile(targetPath, existingContent + separator + newContent);
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
 * Install required packages for a feature
 */
async function installFeaturePackages(
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
    const frameworkFiles = getFrameworkFiles(featureName, framework);
    
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
    
    // Initialize git if it's a new project and Node.js
    if (language === 'nodejs') {
      await initializeGitWithMCP(projectPath);
    } else {
      await initializeGitStandard(projectPath);
    }
    
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
 * Initialize git repository using MCP server (for Node.js projects)
 */
async function initializeGitWithMCP(projectPath: string): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  const gitSpinner = ora(chalk.hex('#00d2d3')('🔧 Initializing git repository with MCP server...')).start();
  
  try {
    // Check if already a git repository
    const gitDir = path.join(projectPath, '.git');
    if (await fs.pathExists(gitDir)) {
      gitSpinner.info(chalk.yellow('ℹ️  Git repository already exists'));
      return;
    }
    
    // Try to initialize git repository using MCP server commands
    try {
      gitSpinner.text = chalk.hex('#00d2d3')('Initializing git with ginit...');
      await execAsync('ginit', { cwd: projectPath });
    } catch {
      gitSpinner.text = chalk.hex('#00d2d3')('Initializing git with git init...');
      await execAsync('git init', { cwd: projectPath });
    }
    
    // Add files to git
    try {
      gitSpinner.text = chalk.hex('#00d2d3')('Adding files with gadd...');
      await execAsync('gadd', { cwd: projectPath });
    } catch {
      gitSpinner.text = chalk.hex('#00d2d3')('Adding files with git add...');
      await execAsync('git add .', { cwd: projectPath });
    }
    
    // Make initial commit
    try {
      gitSpinner.text = chalk.hex('#00d2d3')('Creating initial commit with gcommit...');
      await execAsync('gcommit "Add features via Package Installer CLI"', { cwd: projectPath });
    } catch {
      gitSpinner.text = chalk.hex('#00d2d3')('Creating initial commit with git commit...');
      await execAsync('git commit -m "Add features via Package Installer CLI"', { cwd: projectPath });
    }
    
    gitSpinner.succeed(chalk.hex('#10ac84')('✅ Git repository initialized with MCP server'));
    
  } catch (error: any) {
    gitSpinner.warn(chalk.hex('#ffa502')('⚠️  Could not initialize git repository'));
    console.log(chalk.hex('#95afc0')('💡 You can initialize git manually:'));
    console.log(chalk.hex('#95afc0')('   git init'));
    console.log(chalk.hex('#95afc0')('   git add .'));
    console.log(chalk.hex('#95afc0')('   git commit -m "Add features"'));
  }
}

/**
 * Initialize git repository using standard git commands (for non-Node.js projects)
 */
async function initializeGitStandard(projectPath: string): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  const gitSpinner = ora(chalk.hex('#00d2d3')('🔧 Initializing git repository...')).start();
  
  try {
    // Check if already a git repository
    const gitDir = path.join(projectPath, '.git');
    if (await fs.pathExists(gitDir)) {
      gitSpinner.info(chalk.yellow('ℹ️  Git repository already exists'));
      return;
    }
    
    // Initialize git repository
    await execAsync('git init', { cwd: projectPath });
    
    // Add files to git
    await execAsync('git add .', { cwd: projectPath });
    
    // Make initial commit
    await execAsync('git commit -m "Add features via Package Installer CLI"', { cwd: projectPath });
    
    gitSpinner.succeed(chalk.hex('#10ac84')('✅ Git repository initialized'));
    
  } catch (error: any) {
    gitSpinner.warn(chalk.hex('#ffa502')('⚠️  Could not initialize git repository'));
    console.log(chalk.hex('#95afc0')('💡 You can initialize git manually:'));
    console.log(chalk.hex('#95afc0')('   git init'));
    console.log(chalk.hex('#95afc0')('   git add .'));
    console.log(chalk.hex('#95afc0')('   git commit -m "Add features"'));
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
