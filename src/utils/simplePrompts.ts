/**
 * Simplified user interaction prompts for CLI commands
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { loadTemplateConfig } from './templateSelector.js';
import { 
  capitalize, 
  getFrameworkTheme, 
  frameworkSupportsDatabase, 
  getAvailableDatabases, 
  getAvailableOrms,
  isCombinationTemplate 
} from './utils.js';

/**
 * Prompts for framework selection
 */
export async function promptFrameworkSelection(): Promise<string> {
  const config = await loadTemplateConfig();
  
  const { framework } = await inquirer.prompt([
    {
      name: 'framework',
      type: 'list',
      message: chalk.green('🚀 Choose a framework:'),
      choices: Object.keys(config.frameworks).map(fw => {
        const fwConfig = config.frameworks[fw];
        const type = fwConfig.type || 'unknown';
        const description = fwConfig.description || 'Modern, Fast, Production-ready';
        
        // Color coding based on framework type
        let typeColor;
        switch (type) {
          case 'frontend':
            typeColor = chalk.cyan;
            break;
          case 'backend':
            typeColor = chalk.magenta;
            break;
          case 'fullstack':
            typeColor = chalk.green;
            break;
          default:
            typeColor = chalk.gray;
        }
        
        return {
          name: `${capitalize(fw)} ${typeColor(`[${type.toUpperCase()}]`)} ${chalk.gray(`(${description})`)}`,
          value: fw
        };
      })
    }
  ]);
  
  return framework;
}

/**
 * Prompts for language selection
 */
export async function promptLanguageSelection(framework: string): Promise<string | undefined> {
  const config = await loadTemplateConfig();
  const fwConfig = config.frameworks[framework];
  
  if (!fwConfig.languages || fwConfig.languages.length <= 1) {
    return fwConfig.languages?.[0];
  }

  const theme = getFrameworkTheme(framework);
  const { language } = await inquirer.prompt([
    {
      name: 'language',
      type: 'list',
      message: theme('💻 Choose a language:'),
      choices: fwConfig.languages.map((lang: string) => ({
        name: `${capitalize(lang)} ${chalk.gray('(Type-safe, Modern syntax)')}`,
        value: lang
      })),
    },
  ]);
  
  return language;
}

/**
 * Prompts for template selection for combination templates
 */
export async function promptTemplateSelection(framework: string, templates: any): Promise<string> {
  const theme = getFrameworkTheme(framework);
  
  const { selectedTemplate } = await inquirer.prompt([
    {
      name: 'selectedTemplate',
      type: 'list',
      message: theme('📋 Choose your template:'),
      choices: Object.keys(templates).map((templateKey: string) => ({
        name: `${templates[templateKey].name} ${chalk.gray(`(${templates[templateKey].description})`)}`,
        value: templateKey
      }))
    }
  ]);
  
  return selectedTemplate;
}

/**
 * Prompts for database selection
 */
export async function promptDatabaseSelection(framework: string): Promise<string | undefined> {
  const config = await loadTemplateConfig();
  const fwConfig = config.frameworks[framework];
  
  if (!frameworkSupportsDatabase(fwConfig)) {
    return undefined;
  }

  const databases = getAvailableDatabases(fwConfig);
  if (!databases || databases.length === 0) {
    return undefined;
  }

  const theme = getFrameworkTheme(framework);
  const { database } = await inquirer.prompt([
    {
      name: 'database',
      type: 'list',
      message: theme('🗄️  Choose a database:'),
      choices: [
        { name: 'None (Skip database setup)', value: null },
        ...databases.map((db: string) => ({
          name: `${capitalize(db)} ${chalk.gray('(Popular, Well-supported)')}`,
          value: db
        }))
      ]
    }
  ]);
  
  return database;
}

/**
 * Prompts for ORM selection
 */
export async function promptOrmSelection(framework: string, database: string): Promise<string | undefined> {
  const config = await loadTemplateConfig();
  const fwConfig = config.frameworks[framework];
  
  const orms = getAvailableOrms(fwConfig, database, 'typescript'); // Default to typescript for ORM check
  if (!orms || orms.length === 0) {
    return undefined;
  }

  const theme = getFrameworkTheme(framework);
  const { orm } = await inquirer.prompt([
    {
      name: 'orm',
      type: 'list',
      message: theme('⚡ Choose an ORM:'),
      choices: orms.map((ormName: string) => ({
        name: `${capitalize(ormName)} ${chalk.gray('(Type-safe, Modern ORM)')}`,
        value: ormName
      }))
    }
  ]);
  
  return orm;
}
