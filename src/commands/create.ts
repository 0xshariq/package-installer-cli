/**
 * Create command - Creates a new project from templates with comprehensive prompts
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { 
  promptFrameworkSelection,
  promptTemplateSelection,
  promptFrameworkOptions,
  promptLanguageSelection,
  promptProjectName,
  hasFrameworkOptions,
  hasTemplateSelection,
  FrameworkOptions
} from '../utils/prompts.js';
import { 
  resolveTemplatePath, 
  generateTemplateName,
  templateExists,
  ProjectInfo
} from '../utils/templateResolver.js';
import { createProjectFromTemplate, installDependenciesForCreate } from '../utils/templateCreator.js';
import { 
  updateTemplateUsage, 
  getCachedTemplateFiles, 
  cacheTemplateFiles, 
  getDirectorySize,
  cacheProjectData
} from '../utils/cacheManager.js';

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

  try {
    console.log('\n' + chalk.hex('#10ac84')('🚀 Welcome to Package Installer CLI!'));
    console.log(chalk.hex('#95afc0')('Let\'s create something amazing together...'));
    console.log('');

    // Step 1: Get project name
    let projectName = providedName;
    if (!projectName) {
      projectName = await promptProjectName();
    }

    // Step 2: Framework selection
    const selectedFramework = await promptFrameworkSelection();
    console.log(`\n${chalk.green('✨ Great choice!')} Let's configure your ${chalk.bold(selectedFramework)} project...\n`);

    // Step 3: Language selection
    const selectedLanguage = await promptLanguageSelection(selectedFramework);
    
    // Step 4: Handle template selection based on framework type
    let templateName = '';
    let options: FrameworkOptions = {};
    
    if (hasTemplateSelection(selectedFramework)) {
      // Framework has predefined templates for dropdown selection
      templateName = await promptTemplateSelection(selectedFramework);
    } else if (hasFrameworkOptions(selectedFramework)) {
      // Framework has configurable options
      options = await promptFrameworkOptions(selectedFramework);
      templateName = generateTemplateName(selectedFramework, options);
    }

    // Step 5: Prepare project info
    const projectInfo: ProjectInfo = {
      framework: selectedFramework,
      language: selectedLanguage,
      templateName,
      options
    };

    // Step 6: Resolve template path
    const templatePath = resolveTemplatePath(projectInfo);
    console.log(chalk.blue(`📁 Using template path: ${templatePath}`));

    // Step 7: Check if template exists
    if (!templateExists(templatePath)) {
      console.log(chalk.red(`❌ Template not found at: ${templatePath}`));
      console.log(chalk.yellow('Available templates for this framework:'));
      // List available templates or suggest alternatives
      return;
    }

    // Step 8: Create project
    console.log(chalk.hex('#00d2d3')('\n🔨 Creating your project...\n'));
    
    const projectPath = await createProjectFromTemplate({
      projectName,
      framework: selectedFramework,
      language: selectedLanguage,
      templateName,
      templatePath,
      options
    });

    // Step 9: Install dependencies
    await installDependenciesForCreate(projectPath);

    // Success message
    console.log('\n' + chalk.green('🎉 Project created successfully!'));
    console.log(chalk.hex('#95afc0')(`Navigate to your project: ${chalk.bold(`cd ${projectName}`)}`));
    
  } catch (error) {
    console.log(chalk.red('\n❌ Error creating project:'));
    console.log(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}