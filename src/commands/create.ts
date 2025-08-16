/**
 * Create command - Creates a new project from templates with comprehensive prompts
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import { validateProjectName, getFrameworkTheme, isCombinationTemplate } from '../utils/utils.js';
import { 
  promptFrameworkSelection,
  promptLanguageSelection, 
  promptTemplateSelection,
  promptDatabaseSelection,
  promptOrmSelection,
  promptUiSelection,
  promptBundlerSelection,
  promptSrcDirectory,
  promptTailwindCss,
  promptFrameworkSpecificOptions
} from '../utils/prompts.js';
import { resolveTemplatePath, generateTemplateName } from '../utils/templateResolver.js';
import { createProjectFromTemplate } from '../utils/templateCreator.js';
import { ProjectOptions, TemplateConfig } from '../utils/types.js';

/**
 * Main create project function with comprehensive prompt system
 */
export async function createProject(providedName?: string): Promise<void> {
  try {
    console.log('\n' + chalk.hex('#10ac84')('🚀 Welcome to Package Installer CLI!'));
    console.log(chalk.hex('#95afc0')('Let\'s create something amazing together...\n'));

    // Step 1: Get project name
    let projectName = providedName;
    if (!projectName) {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: chalk.hex('#10ac84')('� What is your project name?'),
          default: 'my-awesome-project',
          validate: (input: string) => {
            const validation = validateProjectName(input.trim());
            return validation === true ? true : chalk.hex('#ff4757')(validation);
          }
        }
      ]);
      projectName = name.trim();
    }

    // Step 2: Load template configuration
    const templatesRoot = path.join(process.cwd(), 'templates');
    const configPath = path.join(process.cwd(), 'template.json');
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Template configuration not found at ${configPath}`);
    }
    
    const templateConfig: TemplateConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log(chalk.hex('#00d2d3')('📋 Loading available templates...\n'));

    // Step 3: Framework selection
    const selectedFramework = await promptFrameworkSelection(templateConfig);
    const fwConfig = templateConfig.frameworks[selectedFramework];
    const theme = getFrameworkTheme(selectedFramework);
    
    console.log(`\n${theme('✨ Great choice!')} Let's configure your ${chalk.bold(selectedFramework)} project...\n`);

    // Step 4: Language selection (if applicable)
    const selectedLanguage = await promptLanguageSelection(fwConfig, theme);
    
    // Step 5: Database selection (for supported frameworks)
    const selectedDatabase = await promptDatabaseSelection(fwConfig, theme);
    
    // Step 6: ORM selection (if database is selected)
    let selectedOrm: string | undefined;
    if (selectedDatabase && selectedDatabase !== 'none') {
      selectedOrm = await promptOrmSelection(fwConfig, selectedDatabase, selectedLanguage!, theme);
    }

    // Step 7: Template selection (for combination templates)
    let selectedTemplate: string | undefined;
    if (isCombinationTemplate(selectedFramework) && fwConfig.templates) {
      selectedTemplate = await promptTemplateSelection(fwConfig, theme);
    }

    // Step 8: UI library selection
    const selectedUi = await promptUiSelection(fwConfig, theme);
    
    // Step 9: Bundler selection
    const selectedBundler = await promptBundlerSelection(fwConfig, theme);
    
    // Step 10: Src directory option
    let useSrc: boolean | undefined;
    if (fwConfig.options?.includes('src') && 
        selectedFramework !== 'angularjs' && 
        selectedFramework !== 'nestjs' && 
        !(selectedFramework === 'reactjs' && selectedBundler === 'vite')) {
      useSrc = await promptSrcDirectory(theme);
    }
    
    // Step 11: Tailwind CSS option
    let useTailwind: boolean | undefined;
    if (fwConfig.options?.includes('tailwind') && selectedFramework !== 'nestjs') {
      useTailwind = await promptTailwindCss(theme);
    }
    
    // Step 12: Framework-specific options
    let typeChoice: string | undefined;
    if ((selectedFramework === 'rust' || selectedFramework === 'expressjs') && fwConfig.options) {
      if (fwConfig.options.includes('basic') && fwConfig.options.includes('advance')) {
        typeChoice = await promptFrameworkSpecificOptions(selectedFramework, theme);
      }
    }

    // Step 13: Generate template name and resolve path
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
      database: selectedDatabase,
      orm: selectedOrm
    };

    const templatePath = resolveTemplatePath(projectOptions, fwConfig, templatesRoot);

    // Step 14: Display configuration summary
    console.log('\n' + chalk.hex('#ffa502')('📋 Project Configuration Summary:'));
    console.log(chalk.hex('#95afc0')('─'.repeat(50)));
    console.log(`${chalk.hex('#00d2d3')('Project Name:')} ${chalk.bold.hex('#10ac84')(projectName)}`);
    console.log(`${chalk.hex('#00d2d3')('Framework:')} ${chalk.bold.hex('#ff6b6b')(selectedFramework)}`);
    
    if (selectedLanguage) {
      console.log(`${chalk.hex('#00d2d3')('Language:')} ${chalk.bold.hex('#9c88ff')(selectedLanguage)}`);
    }
    
    if (selectedDatabase && selectedDatabase !== 'none') {
      console.log(`${chalk.hex('#00d2d3')('Database:')} ${chalk.bold.hex('#26de81')(selectedDatabase)}`);
      if (selectedOrm) {
        console.log(`${chalk.hex('#00d2d3')('ORM:')} ${chalk.bold.hex('#26de81')(selectedOrm)}`);
      }
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
    
    console.log(`${chalk.hex('#00d2d3')('Template:')} ${chalk.bold.hex('#a29bfe')(templateName)}`);
    console.log(`${chalk.hex('#00d2d3')('Template Path:')} ${chalk.hex('#95afc0')(templatePath)}`);
    console.log(chalk.hex('#95afc0')('─'.repeat(50)));

    // Step 15: Confirmation
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

    // Step 16: Verify template exists
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at: ${templatePath}`);
    }

    // Step 17: Create project
    console.log('\n' + chalk.hex('#10ac84')('🔨 Creating your project...'));
    console.log(chalk.hex('#95afc0')('This might take a moment...\n'));
    
    const projectPath = await createProjectFromTemplate(projectName!, templatePath);
    
    // Step 18: Success message
    console.log('\n' + chalk.hex('#10ac84')('✨ Project created successfully!'));
    console.log(chalk.hex('#95afc0')('Welcome to your new project!\n'));
    
    // Project details
    console.log(chalk.hex('#00d2d3')('📁 Project Details:'));
    console.log(`   ${chalk.hex('#ffa502')('Name:')} ${chalk.hex('#10ac84')(projectName)}`);
    console.log(`   ${chalk.hex('#ffa502')('Framework:')} ${chalk.hex('#ff6b6b')(selectedFramework)}`);
    if (selectedLanguage) {
      console.log(`   ${chalk.hex('#ffa502')('Language:')} ${chalk.hex('#9c88ff')(selectedLanguage)}`);
    }
    console.log(`   ${chalk.hex('#ffa502')('Template:')} ${chalk.hex('#a29bfe')(templateName)}`);
    console.log(`   ${chalk.hex('#ffa502')('Location:')} ${chalk.hex('#95afc0')(projectPath)}\n`);
    
    // Next steps
    console.log(chalk.hex('#00d2d3')('🚀 Next Steps:'));
    console.log(`   ${chalk.hex('#95afc0')('1.')} ${chalk.hex('#10ac84')(`cd ${projectName}`)}`);
    console.log(`   ${chalk.hex('#95afc0')('2.')} ${chalk.hex('#00d2d3')('Install dependencies:')} ${chalk.hex('#ffa502')('pnpm install')} ${chalk.hex('#95afc0')('(or npm/yarn)')}`);
    console.log(`   ${chalk.hex('#95afc0')('3.')} ${chalk.hex('#00d2d3')('Start developing:')} ${chalk.hex('#ffa502')('pnpm dev')}`);
    console.log(`   ${chalk.hex('#95afc0')('4.')} ${chalk.hex('#00d2d3')('Open in your favorite editor and start coding!')} 🎉\n`);
    
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