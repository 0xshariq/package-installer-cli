import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TemplateConfig {
  frameworks: {
    [key: string]: {
      type: string;
      description: string;
      languages?: string[];
      ui?: string[];
      options?: string[];
      bundlers?: string[];
      templates?: string[];
      databases?: {
        [key: string]: {
          [lang: string]: {
            orms: string[];
          };
        };
      };
    };
  };
}

interface TemplateSelection {
  framework: string;
  language?: string;
  template: string;
  templatePath: string;
}

/**
 * Load template configuration from template.json
 */
export async function loadTemplateConfig(): Promise<TemplateConfig> {
  const configPath = path.resolve(__dirname, '../../template.json');
  return JSON.parse(await fs.readFile(configPath, 'utf-8'));
}

/**
 * Display available frameworks in a beautiful format
 */
function displayFrameworks(config: TemplateConfig): void {
  console.log('\n' + chalk.hex('#00d2d3')('📦 Available Frameworks:'));
  console.log('');
  
  Object.entries(config.frameworks).forEach(([key, framework], index) => {
    const typeColor = 
      framework.type === 'frontend' ? chalk.hex('#10ac84') :
      framework.type === 'backend' ? chalk.hex('#ff6b6b') :
      framework.type === 'fullstack' ? chalk.hex('#9c88ff') : chalk.white;
    
    console.log(`  ${chalk.hex('#ffa502')((index + 1).toString().padStart(2, ' '))}. ${chalk.hex('#00d2d3')(key.padEnd(25))} ${typeColor(`[${framework.type}]`)}`);
    console.log(`      ${chalk.hex('#95afc0')(framework.description)}`);
    console.log('');
  });
}

/**
 * Get template selection through interactive prompts
 */
export async function getTemplateSelection(config: TemplateConfig): Promise<TemplateSelection> {
  displayFrameworks(config);
  
  // Select framework
  const { framework } = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: chalk.hex('#00d2d3')('🎯 Choose your framework:'),
      choices: Object.keys(config.frameworks).map((key, index) => ({
        name: `${chalk.hex('#ffa502')((index + 1).toString())}. ${chalk.hex('#00d2d3')(key)} ${chalk.hex('#95afc0')(`[${config.frameworks[key].type}]`)}`,
        value: key
      }))
    }
  ]);

  const frameworkConfig = config.frameworks[framework];
  let language: string | undefined;
  let template: string;

  // Select language if multiple available
  if (frameworkConfig.languages && frameworkConfig.languages.length > 1) {
    const { selectedLanguage } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedLanguage',
        message: chalk.hex('#10ac84')('💻 Choose your language:'),
        choices: frameworkConfig.languages.map((lang, index) => ({
          name: `${chalk.hex('#ffa502')((index + 1).toString())}. ${chalk.hex('#10ac84')(lang)}`,
          value: lang
        }))
      }
    ]);
    language = selectedLanguage;
  } else if (frameworkConfig.languages) {
    language = frameworkConfig.languages[0];
  }

  // Handle template selection based on available templates
  const templatesPath = path.resolve(__dirname, '../../templates', framework);
  
  if (frameworkConfig.templates && frameworkConfig.templates.length > 1) {
    // Multiple templates available - ask user to choose
    console.log('\n' + chalk.hex('#9c88ff')('🎨 Available Templates:'));
    
    const templateChoices = frameworkConfig.templates.map((templateName, index) => {
      const templateDisplayName = templateName
        .replace(/-/g, ' ')
        .replace(/template/g, '')
        .trim()
        .replace(/\b\w/g, l => l.toUpperCase());
      
      return {
        name: `${chalk.hex('#ffa502')((index + 1).toString())}. ${chalk.hex('#9c88ff')(templateDisplayName)}`,
        value: templateName
      };
    });

    const { selectedTemplate } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTemplate',
        message: chalk.hex('#9c88ff')('🎨 Choose your template:'),
        choices: templateChoices
      }
    ]);
    
    template = selectedTemplate;
  } else if (frameworkConfig.templates && frameworkConfig.templates.length === 1) {
    // Only one template available - use it directly
    template = frameworkConfig.templates[0];
    console.log('\n' + chalk.hex('#10ac84')(`✨ Using template: ${chalk.hex('#9c88ff')(template)}`));
  } else {
    // No specific templates defined, use default template structure
    template = 'template';
    console.log('\n' + chalk.hex('#10ac84')(`✨ Using default template structure`));
  }

  // Construct template path
  let templatePath: string;
  if (language && language !== 'rust') {
    templatePath = path.join(templatesPath, language, template);
  } else {
    templatePath = path.join(templatesPath, template);
  }

  // Verify template path exists
  if (!(await fs.pathExists(templatePath))) {
    // Fallback: try without language subdirectory
    const fallbackPath = path.join(templatesPath, template);
    if (await fs.pathExists(fallbackPath)) {
      templatePath = fallbackPath;
    } else {
      throw new Error(`Template not found at: ${templatePath}`);
    }
  }

  return {
    framework,
    language,
    template,
    templatePath
  };
}

/**
 * Display template selection summary
 */
export function displayTemplateSelection(selection: TemplateSelection): void {
  console.log('\n' + chalk.hex('#00d2d3')('📋 Template Selection Summary:'));
  console.log('');
  console.log(`  ${chalk.hex('#ffa502')('Framework:')} ${chalk.hex('#00d2d3')(selection.framework)}`);
  if (selection.language) {
    console.log(`  ${chalk.hex('#ffa502')('Language:')} ${chalk.hex('#10ac84')(selection.language)}`);
  }
  console.log(`  ${chalk.hex('#ffa502')('Template:')} ${chalk.hex('#9c88ff')(selection.template)}`);
  console.log(`  ${chalk.hex('#ffa502')('Path:')} ${chalk.hex('#95afc0')(selection.templatePath)}`);
  console.log('');
}
