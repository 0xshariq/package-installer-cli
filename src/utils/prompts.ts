/**
 * User interaction prompts for Package Installer CLI v3.0.0
 * Handles framework selection and template configuration based on template.json
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

export interface FrameworkOptions {
  tailwind?: boolean;
  src?: boolean;
  ui?: string;
  bundler?: string;
}

// Helper functions to read template.json
function getTemplateConfig() {
  const templatePath = path.join(process.cwd(), 'template.json');
  if (!fs.existsSync(templatePath)) {
    throw new Error('template.json not found');
  }
  return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
}

function getAvailableFrameworks(): string[] {
  const config = getTemplateConfig();
  return Object.keys(config.frameworks);
}

function getFrameworkConfig(framework: string) {
  const config = getTemplateConfig();
  return config.frameworks[framework];
}

function getFrameworkDescription(framework: string): string {
  const config = getFrameworkConfig(framework);
  return config?.description || 'Modern framework';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Framework selection prompt
 */
export async function promptFrameworkSelection(): Promise<string> {
  const frameworks = getAvailableFrameworks();
  
  const { framework } = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: '🚀 Choose your framework:',
      choices: frameworks.map(fw => ({
        name: `${fw.charAt(0).toUpperCase() + fw.slice(1)} - ${getFrameworkDescription(fw)}`,
        value: fw
      })),
      pageSize: 10
    }
  ]);

  return framework;
}

/**
 * Template selection - only for frameworks that have templates field without options
 */
export async function promptTemplateSelection(framework: string): Promise<string> {
  const config = getFrameworkConfig(framework);
  
  if (!config) {
    console.log(chalk.red(`❌ Framework ${framework} not found`));
    return '';
  }

  // Check if framework has templates field for dropdown selection
  if (config.templates && !config.options) {
    if (config.templates.length === 1) {
      return config.templates[0];
    }

    const { template } = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: `📋 Choose a template for ${framework}:`,
        choices: config.templates.map((template: string) => ({
          name: template.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          value: template
        }))
      }
    ]);

    return template;
  }

  // For frameworks with options, return empty string (template name will be generated)
  return '';
}

/**
 * Framework options prompt - for frameworks with configurable options
 */
export async function promptFrameworkOptions(framework: string): Promise<FrameworkOptions> {
  const config = getFrameworkConfig(framework);
  
  if (!config || !config.options) {
    return {};
  }

  const options: FrameworkOptions = {};

  // Prompt for available options
  if (config.options.includes('tailwind')) {
    const { tailwind } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'tailwind',
        message: '🎨 Do you want to use Tailwind CSS?',
        default: true
      }
    ]);
    options.tailwind = tailwind;
  }

  if (config.options.includes('src')) {
    const { src } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'src',
        message: '📁 Do you want to use src/ directory structure?',
        default: true
      }
    ]);
    options.src = src;
  }

  // Prompt for UI library if available
  if (config.ui && config.ui.length > 0) {
    if (config.ui.length === 1) {
      options.ui = config.ui[0];
    } else {
      const { ui } = await inquirer.prompt([
        {
          type: 'list',
          name: 'ui',
          message: '💎 Choose a UI library:',
          choices: [
            { name: 'None', value: 'none' },
            ...config.ui.map((uiLib: string) => ({
              name: uiLib.charAt(0).toUpperCase() + uiLib.slice(1),
              value: uiLib
            }))
          ]
        }
      ]);
      options.ui = ui === 'none' ? undefined : ui;
    }
  }

  // Prompt for bundler if available (only for react-based frameworks)
  if (config.bundlers && config.bundlers.length > 0) {
    const { bundler } = await inquirer.prompt([
      {
        type: 'list',
        name: 'bundler',
        message: '📦 Choose a bundler:',
        choices: config.bundlers.map((bundler: string) => ({
          name: bundler.charAt(0).toUpperCase() + bundler.slice(1),
          value: bundler
        }))
      }
    ]);
    options.bundler = bundler;
  }

  return options;
}

/**
 * Language selection prompt
 */
export async function promptLanguageSelection(framework: string): Promise<string> {
  const config = getFrameworkConfig(framework);
  
  if (!config.languages || config.languages.length <= 1) {
    return config.languages?.[0] || 'javascript';
  }

  const languageDescriptions: Record<string, string> = {
    javascript: 'Dynamic, flexible, widely supported',
    typescript: 'Type-safe JavaScript with enhanced tooling',
    python: 'Readable, powerful, extensive ecosystem',
    rust: 'Memory-safe, performance-focused systems language',
    go: 'Simple, fast, concurrent programming language'
  };

  const languageEmojis: Record<string, string> = {
    javascript: '📜',
    typescript: '🔷',
    python: '🐍',
    rust: '🦀',
    go: '🐹'
  };

  const { language } = await inquirer.prompt([
    {
      name: 'language',
      type: 'list',
      message: '💻 Choose your language:',
      choices: config.languages.map((lang: string) => ({
        name: `${languageEmojis[lang] || '📄'} ${chalk.bold(capitalize(lang))} ${chalk.hex('#95afc0')(`- ${languageDescriptions[lang] || 'Modern programming language'}`)}`,
        value: lang,
        short: lang
      })),
    },
  ]);
  
  return language;
}

/**
 * Project name prompt
 */
export async function promptProjectName(): Promise<string> {
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '📝 Enter your project name:',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Project name is required';
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      }
    }
  ]);

  return projectName.trim();
}

/**
 * Check if framework uses options-based configuration
 */
export function hasFrameworkOptions(framework: string): boolean {
  const config = getFrameworkConfig(framework);
  return !!(config?.options && config.options.length > 0);
}

/**
 * Check if framework uses template dropdown selection
 */
export function hasTemplateSelection(framework: string): boolean {
  const config = getFrameworkConfig(framework);
  return !!(config?.templates && !config.options);
}
