/**
 * Create command - Creates a new project from templates with comprehensive prompts
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { validateProjectName, getFrameworkTheme, isCombinationTemplate } from '../utils/utils.js';
import { 
  promptFrameworkSelection,
  promptLanguageSelection, 
  promptTemplateSelection,
  promptUiSelection,
  promptBundlerSelection,
  promptSrcDirectory,
  promptTailwindCss,
  promptFrameworkSpecificOptions
} from '../utils/prompts.js';
import { resolveTemplatePath, generateTemplateName } from '../utils/templateResolver.js';
import { createProjectFromTemplate, installDependenciesForCreate } from '../utils/templateCreator.js';
import { ProjectOptions, TemplateConfig } from '../utils/types.js';
import { 
  loadUserCache, 
  saveUserCache, 
  getCacheDefault, 
  UserCacheData,
  clearUserCache,
  showUserCache,
  generateProjectNameSuggestions
} from '../utils/userCache.js';
import { 
  updateTemplateUsage, 
  getCachedTemplateFiles, 
  cacheTemplateFiles, 
  getDirectorySize,
  cacheProjectData
} from '../utils/cacheManager.js';
import { HistoryManager } from '../utils/historyManager.js';

/**
 * Display help for create command
 */
export function showCreateHelp(): void {
  const piGradient = gradient(['#00c6ff', '#0072ff']);
  const headerGradient = gradient(['#4facfe', '#00f2fe']);
  
  console.log('\n' + boxen(
    headerGradient('🚀 Create Command Help') + '\n\n' +
    chalk.white('Create a new project from our curated collection of modern templates.') + '\n' +
    chalk.white('Choose from React, Next.js, Express, Nest.js, Rust, and more!') + '\n\n' +
    chalk.cyan('Usage:') + '\n' +
    chalk.white(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('create')} [project-name]`) + '\n\n' +
    chalk.cyan('Options:') + '\n' +
    chalk.gray('  -h, --help    Display help for this command') + '\n\n' +
    chalk.cyan('Examples:') + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('create')} my-awesome-app    # Create with specific name`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('create')}                   # Interactive mode - will prompt for name`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('create')} ${chalk.hex('#ff6b6b')('--show-cache')}       # Show cached preferences`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('create')} ${chalk.hex('#ff6b6b')('--clear-cache')}      # Clear cached preferences`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('create')} ${chalk.hex('#ff6b6b')('--help')}            # Show this help message`) + '\n\n' +
    chalk.hex('#00d2d3')('💡 Smart Caching:') + '\n' +
    chalk.hex('#95afc0')('  • Remembers your preferences from previous sessions') + '\n' +
    chalk.hex('#95afc0')('  • Suggests framework-specific project names') + '\n' +
    chalk.hex('#95afc0')('  • Shows project count and usage statistics') + '\n\n' +
    chalk.hex('#00d2d3')('💡 Available Templates:') + '\n' +
    chalk.hex('#95afc0')('  • React (Vite) - JavaScript/TypeScript variants') + '\n' +
    chalk.hex('#95afc0')('  • Next.js - App Router with multiple configurations') + '\n' +
    chalk.hex('#95afc0')('  • Express - RESTful APIs with authentication') + '\n' +
    chalk.hex('#95afc0')('  • Nest.js - Enterprise-grade Node.js framework') + '\n' +
    chalk.hex('#95afc0')('  • Angular - Modern Angular applications') + '\n' +
    chalk.hex('#95afc0')('  • Vue.js - Progressive Vue.js applications') + '\n' +
    chalk.hex('#95afc0')('  • Rust - Systems programming templates') + '\n' +
    chalk.hex('#95afc0')('  • Django - Python web framework'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#0a0a0a'
    }
  ));
}

/**
 * Main create project function with comprehensive prompt system
 */
export async function createProject(providedName?: string, options?: any): Promise<void> {
  // Check for special flags
  if (providedName === '--help' || providedName === '-h' || options?.help || options?.['--help'] || options?.['-h']) {
    showCreateHelp();
    return;
  }
  
  if (providedName === '--clear-cache') {
    await clearUserCache();
    return;
  }
  
  if (providedName === '--show-cache') {
    await showUserCache();
    return;
  }

  try {
    // Load user cache for personalized defaults
    const userCache = await loadUserCache();
    const isFirstTime = !userCache.projectCount || userCache.projectCount === 0;
    
    console.log('\n' + chalk.hex('#10ac84')('🚀 Welcome to Package Installer CLI!'));
    
    if (!isFirstTime && userCache.projectCount) {
      console.log(chalk.hex('#95afc0')(`Great to see you again! This will be project #${userCache.projectCount + 1}...`));
      if (userCache.framework) {
        console.log(chalk.hex('#95afc0')(`Your preferred framework: ${chalk.bold(userCache.framework)}`));
      }
    } else {
      console.log(chalk.hex('#95afc0')('Let\'s create something amazing together...'));
    }
    console.log('');

    // Step 1: Get project name with intelligent suggestions
    let projectName = providedName;
    if (!projectName) {
      const suggestions = generateProjectNameSuggestions(userCache);
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: chalk.hex('#10ac84')('📛 What is your project name?'),
          default: suggestions[0],
          validate: (input: string) => {
            const validation = validateProjectName(input.trim());
            return validation === true ? true : chalk.hex('#ff4757')(validation);
          }
        }
      ]);
      projectName = name.trim();
    }

    // Save project name preference
    userCache.projectName = projectName;

    // Step 2: Load template configuration
    const templatesRoot = path.join(process.cwd(), 'templates');
    const configPath = path.join(process.cwd(), 'template.json');
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Template configuration not found at ${configPath}`);
    }
    
    const templateConfig: TemplateConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log(chalk.hex('#00d2d3')('📋 Loading available templates...\n'));

    // Step 3: Framework selection with cached preference
    const selectedFramework = await promptFrameworkSelectionWithCache(templateConfig, userCache);
    userCache.framework = selectedFramework;
    
    const fwConfig = templateConfig.frameworks[selectedFramework];
    const theme = getFrameworkTheme(selectedFramework);
    
    console.log(`\n${theme('✨ Great choice!')} Let's configure your ${chalk.bold(selectedFramework)} project...\n`);

    // Step 4: Language selection with cache
    const selectedLanguage = await promptLanguageSelectionWithCache(fwConfig, theme, userCache);
    userCache.language = selectedLanguage;
    
    // Step 5: Template selection (for combination templates)
    let selectedTemplate: string | undefined;
    if (isCombinationTemplate(selectedFramework) && fwConfig.templates) {
      selectedTemplate = await promptTemplateSelection(fwConfig, theme);
    }

    // Step 6: UI library selection
    const selectedUi = await promptUiSelection(fwConfig, theme);
    userCache.ui = selectedUi || undefined;
    
    // Step 7: Bundler selection
    const selectedBundler = await promptBundlerSelection(fwConfig, theme);
    userCache.bundler = selectedBundler;
    
    // Step 8: Src directory option
    let useSrc: boolean | undefined;
    if (fwConfig.options?.includes('src') && 
        selectedFramework !== 'angularjs' && 
        selectedFramework !== 'nestjs' && 
        !(selectedFramework === 'reactjs' && selectedBundler === 'vite')) {
      useSrc = await promptSrcDirectory(theme);
      userCache.srcDirectory = useSrc;
    }
    
    // Step 11: Tailwind CSS option
    let useTailwind: boolean | undefined;
    if (fwConfig.options?.includes('tailwind') && selectedFramework !== 'nestjs') {
      useTailwind = await promptTailwindCss(theme);
      userCache.tailwindCss = useTailwind;
    }
    
    // Step 12: Framework-specific options
    let typeChoice: string | undefined;
    if ((selectedFramework === 'rust' || selectedFramework === 'expressjs') && fwConfig.options) {
      if (fwConfig.options.includes('basic') && fwConfig.options.includes('advance')) {
        typeChoice = await promptFrameworkSpecificOptions(selectedFramework, theme);
      }
    }

    // Step 13: Feature selection BEFORE project creation
    let selectedFeatures: Array<{ feature: string; provider?: string }> = [];
    console.log('\n' + chalk.hex('#9c88ff')('🎯 Would you like to add any features to your project?'));
    console.log(chalk.hex('#95afc0')('   Features: Authentication, Database, Docker, Payment, Storage, etc.'));
    
    const { wantFeatures } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'wantFeatures',
        message: 'Add features to your project?',
        default: false
      }
    ]);
    
    if (wantFeatures) {
      try {
        // Import features functionality
        const { selectFeatures } = await import('./add.js');
        selectedFeatures = await selectFeatures(selectedFramework, selectedLanguage || 'javascript');
        
        if (selectedFeatures.length > 0) {
          console.log(chalk.hex('#10ac84')(`✨ Selected ${selectedFeatures.length} features for integration`));
          selectedFeatures.forEach(f => {
            console.log(`   ${chalk.hex('#00d2d3')('•')} ${f.feature}${f.provider ? ` (${f.provider})` : ''}`);
          });
        }
      } catch (error: any) {
        console.warn(chalk.yellow(`⚠️  Feature selection failed: ${error.message}`));
        console.log(chalk.hex('#95afc0')('   You can add features after project creation using: pi add'));
      }
    }

    // Step 14: Generate template name and resolve path
    let templateName = selectedTemplate || generateTemplateName(selectedFramework, fwConfig, {
      src: useSrc,
      ui: selectedUi,
      tailwind: useTailwind,
      typeChoice,
      bundler: selectedBundler
    });

    const projectOptions: ProjectOptions = {
      projectName,
      framework: selectedFramework,
      language: selectedLanguage,
      templateName,
      bundler: selectedBundler,
      src: useSrc,
      tailwind: useTailwind,
      ui: selectedUi,
      features: selectedFeatures
    };

    const templatePath = resolveTemplatePath(projectOptions, fwConfig, templatesRoot);

    // Step 15: Display configuration summary
    console.log('\n' + chalk.hex('#ffa502')('📋 Project Configuration Summary:'));
    console.log(chalk.hex('#95afc0')('─'.repeat(50)));
    console.log(`${chalk.hex('#00d2d3')('Project Name:')} ${chalk.bold.hex('#10ac84')(projectName)}`);
    console.log(`${chalk.hex('#00d2d3')('Framework:')} ${chalk.bold.hex('#ff6b6b')(selectedFramework)}`);
    
    if (selectedLanguage) {
      console.log(`${chalk.hex('#00d2d3')('Language:')} ${chalk.bold.hex('#9c88ff')(selectedLanguage)}`);
    }
  
    
    if (selectedUi) {
      console.log(`${chalk.hex('#00d2d3')('UI Library:')} ${chalk.bold.hex('#fd79a8')(selectedUi)}`);
    }
    
    if (selectedBundler) {
      console.log(`${chalk.hex('#00d2d3')('Bundler:')} ${chalk.bold.hex('#6c5ce7')(selectedBundler)}`);
    }
    
    if (useSrc !== undefined) {
      console.log(`${chalk.hex('#00d2d3')('Src Directory:')} ${useSrc ? chalk.green('Yes') : chalk.red('No')}`);
    }
    
    if (useTailwind !== undefined) {
      console.log(`${chalk.hex('#00d2d3')('Tailwind CSS:')} ${useTailwind ? chalk.green('Yes') : chalk.red('No')}`);
    }
    
    if (selectedFeatures.length > 0) {
      console.log(`${chalk.hex('#00d2d3')('Features:')} ${chalk.bold.hex('#26de81')(selectedFeatures.length)} selected`);
      selectedFeatures.forEach(f => {
        console.log(`   ${chalk.hex('#95afc0')('•')} ${f.feature}${f.provider ? ` (${f.provider})` : ''}`);
      });
    }
    
    console.log(chalk.hex('#95afc0')('─'.repeat(50)));

    // Step 16: Confirmation
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: chalk.hex('#ffa502')('🎯 Proceed with project creation?'),
        default: true
      }
    ]);

    if (!proceed) {
      console.log('\n' + chalk.hex('#95afc0')('👋 Project creation cancelled. Come back anytime!'));
      return;
    }

    // Step 17: Verify template exists
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at: ${templatePath}`);
    }

    // Step 18: Save user preferences cache
    await saveUserCache(userCache);

    // Step 19: Create project with features integration
    console.log('\n' + chalk.hex('#10ac84')('🔨 Creating your project...'));
    console.log(chalk.hex('#95afc0')('Checking template cache...\n'));
    
    // Check if template is cached
    const cachedTemplate = await getCachedTemplateFiles(templateName);
    let projectPath: string;
    
    if (cachedTemplate) {
      console.log(chalk.green('⚡ Using cached template files for faster creation...'));
      projectPath = await createProjectFromCachedTemplate(projectName!, cachedTemplate);
    } else {
      console.log(chalk.yellow('📦 Template not cached, copying from source...'));
      projectPath = await createProjectFromTemplate(projectName!, templatePath);
      
      // Cache the template for future use
      try {
        const templateSize = await getDirectorySize(templatePath);
        const templateFiles = await readTemplateFiles(templatePath);
        await cacheTemplateFiles(templateName, templatePath, templateFiles, templateSize);
        console.log(chalk.green('✅ Template cached for future use'));
      } catch (error) {
        // Cache failure shouldn't stop project creation
        console.log(chalk.yellow('⚠️  Template caching failed, but project created successfully'));
      }
    }
    
    // Step 20: Integrate selected features into the project
    if (selectedFeatures.length > 0) {
      console.log('\n' + chalk.hex('#9c88ff')('🔧 Integrating selected features...'));
      
      try {
        // Change to project directory
        const originalCwd = process.cwd();
        process.chdir(projectPath);
        
        // Import the add command functionality for feature integration
        const { integrateFeatures } = await import('./add.js');
        
        for (const feature of selectedFeatures) {
          console.log(chalk.hex('#00d2d3')(`   Integrating ${feature.feature}${feature.provider ? ` (${feature.provider})` : ''}...`));
          await integrateFeatures(feature.feature, feature.provider, selectedFramework, selectedLanguage || 'javascript');
        }
        
        // Change back to original directory
        process.chdir(originalCwd);
        
        console.log(chalk.green('✅ All features integrated successfully!'));
        
      } catch (error: any) {
        console.warn(chalk.yellow(`⚠️  Some features could not be integrated: ${error.message}`));
        console.log(chalk.hex('#95afc0')('   You can add features later using: pi add'));
      }
    }
    
    // Create options object for template features tracking
    const templateOptions = {
      uiLibrary: selectedUi,
      hasTailwind: useTailwind,
      bundler: selectedBundler,
      useSrc: useSrc
    };
    
    // Track template usage in cache
    const templateFeatures = [];
    if (templateOptions.uiLibrary) templateFeatures.push(templateOptions.uiLibrary);
    if (templateOptions.hasTailwind) templateFeatures.push('Tailwind CSS');
    if (templateOptions.bundler) templateFeatures.push(templateOptions.bundler);
    if (templateOptions.useSrc) templateFeatures.push('src directory');
    
    await updateTemplateUsage(
      templateName,
      selectedFramework,
      selectedLanguage || 'JavaScript',
      templateFeatures
    );
    
    // Cache project details after creation
    await cacheProjectData(
      projectPath,
      projectName!,
      selectedLanguage || 'JavaScript',
      selectedFramework,
      [], // Dependencies will be filled by dependency installer
      await getDirectorySize(projectPath)
    );
    
    // Step 19: Ask about additional features
    console.log('\n' + chalk.hex('#00d2d3')('🎯 Would you like to add any features to your project?'));
    console.log(chalk.hex('#95afc0')('   Features: Authentication, Database, Docker, Payment, Storage, etc.'));
    
    const { wantFeatures } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'wantFeatures',
        message: 'Add features to your project?',
        default: false
      }
    ]);
    
    if (wantFeatures) {
      console.log(chalk.hex('#95afc0')('💡 Features were already selected during project creation.'));
      console.log(chalk.hex('#95afc0')('   You can add more features later using: pi add'));
    }

    // Step 20: Record project creation in history
    try {
      const historyManager = new HistoryManager();
      await historyManager.recordProject({
        name: projectName!,
        framework: selectedFramework,
        language: selectedLanguage || 'JavaScript',
        template: templateName,
        path: projectPath,
        features: []
      });
      console.log(chalk.gray('📊 Project recorded in usage history'));
    } catch (error) {
      // History recording failure shouldn't stop project creation
      console.log(chalk.gray('⚠️  History recording skipped'));
    }

    // Step 21: Success message
    console.log('\n' + chalk.hex('#10ac84')('✨ Project created successfully!'));
    console.log(chalk.hex('#95afc0')('Welcome to your new project!\n'));
    
    // Project details
    console.log(chalk.hex('#00d2d3')('📁 Project Details:'));
    console.log(`   ${chalk.hex('#ffa502')('Name:')} ${chalk.hex('#10ac84')(projectName)}`);
    console.log(`   ${chalk.hex('#ffa502')('Framework:')} ${chalk.hex('#ff6b6b')(selectedFramework)}`);
    if (selectedLanguage) {
      console.log(`   ${chalk.hex('#ffa502')('Language:')} ${chalk.hex('#9c88ff')(selectedLanguage)}`);
    }
    console.log(`   ${chalk.hex('#ffa502')('Location:')} ${chalk.hex('#95afc0')(projectPath)}\n`);
    
    // Next steps
    console.log(chalk.hex('#00d2d3')('\n🚀 Next Steps:'));
    console.log(`   ${chalk.hex('#95afc0')('1.')} ${chalk.hex('#10ac84')(`cd ${projectName}`)}`);
    console.log(`   ${chalk.hex('#95afc0')('2.')} ${chalk.hex('#00d2d3')('Install dependencies:')} ${chalk.hex('#ffa502')('pnpm install')} ${chalk.hex('#95afc0')('(or npm/yarn)')}`);
    console.log(`   ${chalk.hex('#95afc0')('3.')} ${chalk.hex('#00d2d3')('Start developing:')} ${chalk.hex('#ffa502')('pnpm dev')}`);
    console.log(`   ${chalk.hex('#95afc0')('4.')} ${chalk.hex('#00d2d3')('Open in your favorite editor and start coding!')} 🎉\n`);
    
    if (selectedFeatures.length === 0) {
      console.log(chalk.hex('#95afc0')('💡 You can add features later by running: pi add (inside your project folder)'));
    }
    
    console.log(chalk.hex('#26de81')('Happy coding! 🚀'));
    
  } catch (error: any) {
    console.error('\n' + chalk.hex('#ff4757')('❌ Error creating project:'));
    console.error(chalk.hex('#ff4757')(error.message));
    
    if (error.code === 'ENOENT') {
      console.error(chalk.hex('#95afc0')('💡 Make sure the template directory exists and is accessible.'));
    }
    
    process.exit(1);
  }
}

/**
 * Cache-aware framework selection prompt
 */
async function promptFrameworkSelectionWithCache(templateConfig: TemplateConfig, cache: UserCacheData) {
  const frameworks = Object.keys(templateConfig.frameworks);
  const cachedFramework = cache.framework && frameworks.includes(cache.framework) ? cache.framework : frameworks[0];
  
  if (cache.framework && frameworks.includes(cache.framework)) {
    console.log(chalk.hex('#95afc0')(`💾 Using cached framework preference: ${chalk.bold(cache.framework)}`));
    
    const { useCache } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useCache',
        message: chalk.hex('#00d2d3')(`Use ${cache.framework} again?`),
        default: true
      }
    ]);
    
    if (useCache) {
      return cache.framework;
    }
  }
  
  return promptFrameworkSelection(templateConfig);
}

/**
 * Cache-aware language selection prompt
 */
async function promptLanguageSelectionWithCache(fwConfig: any, theme: any, cache: UserCacheData) {
  if (cache.language && fwConfig.languages && fwConfig.languages.includes(cache.language)) {
    console.log(chalk.hex('#95afc0')(`💾 Using cached language preference: ${chalk.bold(cache.language)}`));
    
    const { useCache } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useCache',
        message: chalk.hex('#00d2d3')(`Use ${cache.language} again?`),
        default: true
      }
    ]);
    
    if (useCache) {
      return cache.language;
    }
  }
  
  return promptLanguageSelection(fwConfig, theme);
}

/**
 * Read all template files into memory for caching
 */
async function readTemplateFiles(templatePath: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  
  const readDirectory = async (dirPath: string, relativePath = ''): Promise<void> => {
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const itemRelativePath = path.join(relativePath, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        // Skip directories that shouldn't be cached
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          await readDirectory(fullPath, itemRelativePath);
        }
      } else if (stat.isFile()) {
        // Only cache text files under 1MB
        if (stat.size < 1024 * 1024) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            files[itemRelativePath] = content;
          } catch (error) {
            // Skip binary files or files that can't be read as text
            files[itemRelativePath] = '[BINARY_FILE]';
          }
        }
      }
    }
  };
  
  await readDirectory(templatePath);
  return files;
}

/**
 * Create project from cached template files
 */
async function createProjectFromCachedTemplate(
  projectName: string,
  cachedTemplate: any
): Promise<string> {
  const projectPath = path.resolve(process.cwd(), projectName);
  
  // Check if directory already exists
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory ${projectName} already exists`);
  }
  
  // Create project directory
  await fs.ensureDir(projectPath);
  
  // Write all cached files
  for (const [filePath, content] of Object.entries(cachedTemplate.files)) {
    const fullFilePath = path.join(projectPath, filePath as string);
    
    // Skip binary files
    if (content === '[BINARY_FILE]') {
      continue;
    }
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(fullFilePath));
    
    // Write file
    await fs.writeFile(fullFilePath, content as string, 'utf-8');
  }
  
  // Install dependencies
  try {
    const templateCreator = await import('../utils/templateCreator.js');
    if (templateCreator.installDependenciesForCreate) {
      await templateCreator.installDependenciesForCreate(projectPath);
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not install dependencies automatically'));
  }
  
  return projectPath;
}