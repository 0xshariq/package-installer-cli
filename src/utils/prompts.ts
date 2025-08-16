/**
 * User interaction prompts
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { FrameworkConfig } from './types.js';
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
export async function promptFrameworkSelection(templateConfig: any): Promise<string> {
  const { framework } = await inquirer.prompt([
    {
      name: 'framework',
      type: 'list',
      message: chalk.green('🚀 Choose a framework:'),
      choices: Object.keys(templateConfig.frameworks).map(fw => {
        const fwConfig = templateConfig.frameworks[fw];
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
      }),
    },
  ]);
  
  return framework;
}

/**
 * Prompts for language selection if multiple languages are available
 */
export async function promptLanguageSelection(fwConfig: FrameworkConfig, theme: any): Promise<string | undefined> {
  if (!fwConfig.languages || fwConfig.languages.length <= 1) {
    return fwConfig.languages?.[0];
  }

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
export async function promptTemplateSelection(fwConfig: FrameworkConfig, theme: any): Promise<string> {
  const templates = fwConfig.templates;
  if (!templates || templates.length === 0) {
    throw new Error('No templates available for this framework');
  }

  if (templates.length === 1) {
    return templates[0];
  }

  const { selectedTemplate } = await inquirer.prompt([
    {
      name: 'selectedTemplate',
      type: 'list',
      message: theme('📋 Choose your template:'),
      choices: templates.map((templateKey: string) => ({
        name: `${chalk.green(templateKey)} ${chalk.gray('(Pre-configured template)')}`,
        value: templateKey
      })),
    },
  ]);
  
  return selectedTemplate;
}

/**
 * Prompts for database selection
 */
export async function promptDatabaseSelection(fwConfig: FrameworkConfig, theme: any, allowNone: boolean = true): Promise<string | undefined> {
  if (!fwConfig.databases || Object.keys(fwConfig.databases).length === 0) {
    return undefined;
  }

  const dbKeys = Object.keys(fwConfig.databases);
  const choices = allowNone ? [
    { name: `${chalk.blue('None')} ${chalk.gray('(No database setup)')}`, value: 'none' }
  ] : [];
  
  choices.push(...dbKeys.map((db) => ({
    name: `${capitalize(db)}`,
    value: db
  })));

  const { selectedDatabase } = await inquirer.prompt([
    {
      name: 'selectedDatabase',
      type: 'list',
      message: theme('🗄️ Choose a database:'),
      choices,
    },
  ]);
  
  return selectedDatabase !== 'none' ? selectedDatabase : undefined;
}

/**
 * Prompts for ORM selection
 */
export async function promptOrmSelection(
  fwConfig: FrameworkConfig, 
  database: string, 
  language: string, 
  theme: any
): Promise<string | undefined> {
  if (!fwConfig.databases || !fwConfig.databases[database] || !fwConfig.databases[database][language]) {
    return undefined;
  }

  const availableOrms = fwConfig.databases[database][language].orms;
  
  if (availableOrms.length === 0) {
    return undefined;
  }

  if (availableOrms.length === 1) {
    return availableOrms[0];
  }

  const { selectedOrm } = await inquirer.prompt([
    {
      name: 'selectedOrm',
      type: 'list',
      message: theme('🔧 Choose an ORM:'),
      choices: availableOrms.map((o: string) => ({
        name: `${capitalize(o)}`,
        value: o
      })),
    },
  ]);
  
  return selectedOrm;
}

/**
 * Prompts for UI library selection
 */
export async function promptUiSelection(fwConfig: FrameworkConfig, theme: any): Promise<string | null> {
  if (!fwConfig.ui || fwConfig.ui.length === 0) {
    return null;
  }

  const wantsUI = (await inquirer.prompt([
    {
      name: 'wantsUI',
      type: 'confirm',
      message: theme('🧩 Do you want to add a UI library?'),
      default: true,
    },
  ])).wantsUI;

  if (!wantsUI) {
    return null;
  }

  const { ui } = await inquirer.prompt([
    {
      name: 'ui',
      type: 'list',
      message: theme('✨ Choose a UI library:'),
      choices: fwConfig.ui.map((u: string) => ({
        name: `${capitalize(u)} ${chalk.gray('(Beautiful, Accessible components)')}`,
        value: u
      })),
    },
  ]);

  return ui;
}

/**
 * Prompts for bundler selection
 */
export async function promptBundlerSelection(fwConfig: FrameworkConfig, theme: any): Promise<string | undefined> {
  if (!fwConfig.bundlers || fwConfig.bundlers.length === 0) {
    return undefined;
  }

  if (fwConfig.bundlers.length === 1) {
    return fwConfig.bundlers[0];
  }

  const { bundler } = await inquirer.prompt([
    {
      name: 'bundler',
      type: 'list',
      message: theme('📦 Choose a bundler:'),
      choices: fwConfig.bundlers.map((b: string) => ({
        name: `${capitalize(b)} ${chalk.gray('(Fast, Modern build tool)')}`,
        value: b
      })),
    },
  ]);

  return bundler;
}

/**
 * Prompts for src directory option
 */
export async function promptSrcDirectory(theme: any): Promise<boolean> {
  const { src } = await inquirer.prompt([
    {
      name: 'src',
      type: 'confirm',
      message: theme('📂 Do you want a src directory?'),
      default: true,
    },
  ]);

  return src;
}

/**
 * Prompts for Tailwind CSS option
 */
export async function promptTailwindCss(theme: any): Promise<boolean> {
  const { tailwind } = await inquirer.prompt([
    {
      name: 'tailwind',
      type: 'confirm',
      message: theme('🎨 Do you want to use Tailwind CSS?'),
      default: false,
    },
  ]);

  return tailwind;
}

/**
 * Prompts for framework-specific options (Rust, Express)
 */
export async function promptFrameworkSpecificOptions(framework: string, theme: any): Promise<string> {
  if (framework === 'rust') {
    const { typeChoice } = await inquirer.prompt([
      {
        name: 'typeChoice',
        type: 'list',
        message: theme('🦀 Choose Rust template type:'),
        choices: [
          { name: `${chalk.green('Basic')} ${chalk.gray('(Simple, Clean structure)')}`, value: 'basic' },
          { name: `${chalk.blue('Advanced')} ${chalk.gray('(Full-featured, Production-ready)')}`, value: 'advance' }
        ]
      }
    ]);
    return typeChoice;
  }

  if (framework === 'expressjs') {
    const { typeChoice } = await inquirer.prompt([
      {
        name: 'typeChoice',
        type: 'list',
        message: theme('🚦 Select Express template type:'),
        choices: [
          { name: `${chalk.green('Basic')} ${chalk.gray('(Simple API structure)')}`, value: 'basic' },
          { name: `${chalk.blue('Advanced')} ${chalk.gray('(Full-stack with auth, DB)')}`, value: 'advance' }
        ]
      }
    ]);
    return typeChoice;
  }

  return 'basic'; // Default fallback
}
