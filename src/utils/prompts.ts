/**
 * User interaction prompts for Package Installer CLI v3.0.0
 * Focused on framework, language, and template selection without database logic
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { FrameworkConfig } from './types.js';
import { 
  capitalize, 
  getFrameworkTheme, 
  isCombinationTemplate 
} from './utils.js';

/**
 * Enhanced framework selection with better descriptions and categorization
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
        message: `� Choose a template for ${framework}:`,
        choices: config.templates.map(template => ({
          name: template.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
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
 * Enhanced language selection with better descriptions
 */
export async function promptLanguageSelection(fwConfig: FrameworkConfig, theme: any): Promise<string | undefined> {
  if (!fwConfig.languages || fwConfig.languages.length <= 1) {
    return fwConfig.languages?.[0];
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
      message: theme('💻 Choose your language:'),
      choices: fwConfig.languages.map((lang: string) => ({
        name: `${languageEmojis[lang] || '📄'} ${chalk.bold(capitalize(lang))} ${chalk.hex('#95afc0')(`- ${languageDescriptions[lang] || 'Modern programming language'}`)}`,
        value: lang,
        short: lang
      })),
    },
  ]);
  
  return language;
}

/**
 * Enhanced template selection for combination templates
 */
export async function promptTemplateSelection(fwConfig: FrameworkConfig, theme: any): Promise<string> {
  const templates = fwConfig.templates;
  if (!templates || templates.length === 0) {
    throw new Error('No templates available for this framework');
  }

  if (templates.length === 1) {
    return templates[0];
  }

  // Enhanced template descriptions based on template names
  const getTemplateDescription = (templateKey: string): string => {
    if (templateKey.includes('no-src')) return 'Root-level components structure';
    if (templateKey.includes('src')) return 'Organized src/ directory structure';
    if (templateKey.includes('tailwind')) return 'Pre-configured with Tailwind CSS';
    if (templateKey.includes('shadcn')) return 'shadcn/ui components included';
    if (templateKey.includes('material')) return 'Material Design components';
    if (templateKey.includes('basic')) return 'Minimal starter template';
    if (templateKey.includes('advanced')) return 'Feature-rich template';
    return 'Pre-configured template';
  };

  const getTemplateIcon = (templateKey: string): string => {
    if (templateKey.includes('shadcn')) return '🎨';
    if (templateKey.includes('tailwind')) return '💨';
    if (templateKey.includes('material')) return '🎯';
    if (templateKey.includes('advanced')) return '🚀';
    if (templateKey.includes('basic')) return '⚡';
    return '📋';
  };

  const { selectedTemplate } = await inquirer.prompt([
    {
      name: 'selectedTemplate',
      type: 'list',
      message: theme('📋 Choose your template configuration:'),
      pageSize: 8,
      choices: templates.map((templateKey: string) => ({
        name: `${getTemplateIcon(templateKey)} ${chalk.bold(templateKey)} ${chalk.hex('#95afc0')(`- ${getTemplateDescription(templateKey)}`)}`,
        value: templateKey,
        short: templateKey
      })),
    },
  ]);
  
  return selectedTemplate;
}

/**
 * Enhanced UI library selection with better descriptions
 */
export async function promptUiSelection(fwConfig: FrameworkConfig, theme: any): Promise<string | null> {
  if (!fwConfig.ui || fwConfig.ui.length === 0) {
    return null;
  }

  const wantsUI = (await inquirer.prompt([
    {
      name: 'wantsUI',
      type: 'confirm',
      message: theme('🧩 Add a UI component library?'),
      default: true,
    },
  ])).wantsUI;

  if (!wantsUI) {
    return null;
  }

  const uiDescriptions: Record<string, string> = {
    'shadcn': 'Beautiful, accessible components built with Radix UI',
    'material-ui': 'Google Material Design implementation',
    'chakra': 'Modular and accessible component library',
    'ant-design': 'Enterprise-class UI design language',
    'bootstrap': 'Popular CSS framework with components',
    'tailwind': 'Utility-first CSS framework',
    'bulma': 'Modern CSS framework based on Flexbox'
  };

  const uiEmojis: Record<string, string> = {
    'shadcn': '🎨',
    'material-ui': '🎯',
    'chakra': '⚡',
    'ant-design': '🐜',
    'bootstrap': '🅱️',
    'tailwind': '💨',
    'bulma': '💪'
  };

  const { ui } = await inquirer.prompt([
    {
      name: 'ui',
      type: 'list',
      message: theme('🎨 Choose your UI library:'),
      choices: fwConfig.ui.map((uiLib: string) => ({
        name: `${uiEmojis[uiLib] || '🎨'} ${chalk.bold(capitalize(uiLib))} ${chalk.hex('#95afc0')(`- ${uiDescriptions[uiLib] || 'UI component library'}`)}`,
        value: uiLib,
        short: uiLib
      })),
    },
  ]);
  
  return ui;
}

/**
 * Enhanced bundler selection
 */
export async function promptBundlerSelection(fwConfig: FrameworkConfig, theme: any): Promise<string | undefined> {
  if (!fwConfig.bundlers || fwConfig.bundlers.length <= 1) {
    return fwConfig.bundlers?.[0];
  }

  const bundlerDescriptions: Record<string, string> = {
    vite: 'Lightning-fast build tool with HMR',
    webpack: 'Powerful, configurable module bundler',
    parcel: 'Zero-configuration build tool',
    rollup: 'Optimized for library bundling',
    esbuild: 'Extremely fast JavaScript bundler',
    turbo: 'High-performance build system'
  };

  const bundlerEmojis: Record<string, string> = {
    vite: '⚡',
    webpack: '📦',
    parcel: '🎁',
    rollup: '📦',
    esbuild: '🚀',
    turbo: '🌪️'
  };

  const { bundler } = await inquirer.prompt([
    {
      name: 'bundler',
      type: 'list',
      message: theme('⚙️ Choose your build tool:'),
      choices: fwConfig.bundlers.map((b: string) => ({
        name: `${bundlerEmojis[b] || '⚙️'} ${chalk.bold(capitalize(b))} ${chalk.hex('#95afc0')(`- ${bundlerDescriptions[b] || 'Build tool'}`)}`,
        value: b,
        short: b
      })),
    },
  ]);
  
  return bundler;
}

/**
 * Source directory structure prompt
 */
export async function promptSrcDirectory(theme: any): Promise<boolean> {
  const { useSrc } = await inquirer.prompt([
    {
      name: 'useSrc',
      type: 'confirm',
      message: theme('📁 Use src/ directory for organized structure?'),
      default: true,
    },
  ]);
  
  return useSrc;
}

/**
 * Tailwind CSS integration prompt
 */
export async function promptTailwindCss(theme: any): Promise<boolean> {
  const { useTailwind } = await inquirer.prompt([
    {
      name: 'useTailwind',
      type: 'confirm',
      message: theme('💨 Add Tailwind CSS for styling?'),
      default: true,
    },
  ]);
  
  return useTailwind;
}

/**
 * Framework-specific configuration options
 */
export async function promptFrameworkSpecificOptions(framework: string, theme: any): Promise<string> {
  let message = '';
  let choices: Array<{name: string; value: string}> = [];
  
  switch (framework) {
    case 'rust':
      message = '🦀 Choose Rust project type:';
      choices = [
        { name: `⚡ ${chalk.bold('Basic')} ${chalk.hex('#95afc0')('- Simple Rust application')}`, value: 'basic' },
        { name: `🚀 ${chalk.bold('Advanced')} ${chalk.hex('#95afc0')('- Feature-rich with async, testing, etc.')}`, value: 'advance' }
      ];
      break;
      
    case 'expressjs':
      message = '🚂 Choose Express.js setup:';
      choices = [
        { name: `⚡ ${chalk.bold('Basic')} ${chalk.hex('#95afc0')('- Simple REST API server')}`, value: 'basic' },
        { name: `🚀 ${chalk.bold('Advanced')} ${chalk.hex('#95afc0')('- Full-featured with auth, validation, etc.')}`, value: 'advance' }
      ];
      break;
      
    default:
      message = '⚙️ Choose configuration:';
      choices = [
        { name: `⚡ ${chalk.bold('Basic')} ${chalk.hex('#95afc0')('- Minimal setup')}`, value: 'basic' },
        { name: `🚀 ${chalk.bold('Advanced')} ${chalk.hex('#95afc0')('- Feature-rich setup')}`, value: 'advance' }
      ];
  }

  const { typeChoice } = await inquirer.prompt([
    {
      name: 'typeChoice',
      type: 'list',
      message: theme(message),
      choices
    },
  ]);
  
  return typeChoice;
}
