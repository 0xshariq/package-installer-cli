import chalk from 'chalk';
import inquirer from 'inquirer';
import { createProjectFromTemplate } from '../utils/templateCreator.js';
import { 
  loadTemplateConfig, 
  getTemplateSelection, 
  displayTemplateSelection 
} from '../utils/templateSelector.js';

export async function createProject(providedName?: string): Promise<void> {
  try {
    // Step 1: Get project name (prompt if not provided)
    let projectName = providedName;
    if (!projectName) {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: chalk.hex('#10ac84')('🚀 What is your project name?'),
          validate: (input: string) => {
            if (!input.trim()) {
              return chalk.hex('#ff4757')('Project name is required!');
            }
            if (!/^[a-zA-Z0-9-_]+$/.test(input.trim())) {
              return chalk.hex('#ff4757')('Project name can only contain letters, numbers, hyphens, and underscores!');
            }
            return true;
          }
        }
      ]);
      projectName = name.trim();
    }
    
    // Step 2: Load template configuration
    console.log('\n' + chalk.hex('#00d2d3')('📋 Loading available templates...'));
    const config = await loadTemplateConfig();
    
    // Step 3: Get template selection from user
    const selection = await getTemplateSelection(config);
    
    // Step 4: Display selection summary
    displayTemplateSelection(selection);
    
    // Step 5: Confirm before creating
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.hex('#ffa502')('🎯 Proceed with project creation?'),
        default: true
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.hex('#95afc0')('👋 Project creation cancelled.'));
      return;
    }
    
    // Step 6: Create the project from template
    console.log('\n' + chalk.hex('#10ac84')('🔨 Creating your project...'));
    const projectPath = await createProjectFromTemplate(projectName!, selection.templatePath);
    
    // Step 7: Display success message
    console.log('\n' + chalk.hex('#10ac84')('✨ Project created successfully!'));
    console.log('');
    console.log(chalk.hex('#00d2d3')('📁 Project Details:'));
    console.log(`   ${chalk.hex('#ffa502')('Name:')} ${chalk.hex('#00d2d3')(projectName)}`);
    console.log(`   ${chalk.hex('#ffa502')('Framework:')} ${chalk.hex('#9c88ff')(selection.framework)}`);
    if (selection.language) {
      console.log(`   ${chalk.hex('#ffa502')('Language:')} ${chalk.hex('#10ac84')(selection.language)}`);
    }
    console.log(`   ${chalk.hex('#ffa502')('Template:')} ${chalk.hex('#ff6b6b')(selection.template)}`);
    console.log(`   ${chalk.hex('#ffa502')('Path:')} ${chalk.hex('#95afc0')(projectPath)}`);
    console.log('');
    console.log(chalk.hex('#00d2d3')('🚀 Next Steps:'));
    console.log(`   ${chalk.hex('#95afc0')('1.')} cd ${projectName}`);
    console.log(`   ${chalk.hex('#95afc0')('2.')} Open your favorite code editor`);
    console.log(`   ${chalk.hex('#95afc0')('3.')} Start building amazing things! 🎉`);
    console.log('');
    
  } catch (error: any) {
    throw new Error(`Failed to create project: ${error.message}`);
  }
}