/**
 * User interaction prompts for Package Installer CLI v3.2.0
 * Handles framework selection and template configuration based on template.json
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCliRootPath, getFeaturesJsonPath } from './pathResolver.js';
import { getFrameworkConfig, getTemplateConfig } from './templateResolver.js';

export interface FrameworkOptions {
  tailwind?: boolean;
  src?: boolean;   // only for nextjs
  ui?: string;
  bundler?: string;   // only for reactjs
}

// Reuse centralized getTemplateConfig from templateResolver

function getAvailableFrameworks(typeFilter?: string): string[] {
  const config = getTemplateConfig();
  const frameworks: string[] = [];
  // template.json groups frameworks by top-level categories
  for (const categoryKey of Object.keys(config)) {
    const cat = config[categoryKey];
    if (cat && typeof cat === 'object') {
      for (const fw of Object.keys(cat)) {
        // If a typeFilter is provided, check the framework's declared 'type' or the category key
        if (typeFilter) {
          const fwConfig = cat[fw];
          const declaredType = (fwConfig && fwConfig.type) || categoryKey;
          if (declaredType === typeFilter) {
            frameworks.push(fw);
          }
        } else {
          frameworks.push(fw);
        }
      }
    }
  }
  return frameworks;
}

/**
 * Return a list of unique 'type' values available in template.json (e.g., 'mobile','desktop','frontend')
 */
function getAvailableTypes(): string[] {
  const config = getTemplateConfig();
  const types = new Set<string>();
  for (const categoryKey of Object.keys(config)) {
    const cat = config[categoryKey];
    if (cat && typeof cat === 'object') {
      for (const fw of Object.keys(cat)) {
        const fwConfig = cat[fw];
        if (fwConfig && fwConfig.type) {
          types.add(fwConfig.type);
        } else {
          // fallback to top-level category as type
          types.add(categoryKey);
        }
      }
    }
  }
  // Filter out types that should not be shown to the user
  const blacklist = new Set(['api', 'frontend', 'backend', 'fullstack']);
  return Array.from(types).filter(t => !blacklist.has(String(t).toLowerCase())).sort();
}

// `getFrameworkConfig` is provided by `templateResolver.ts` and imported above.

function getCategories(): string[] {
  const config = getTemplateConfig();
  return Object.keys(config);
}

function getFrameworksForCategory(category: string): string[] {
  const config = getTemplateConfig();
  const cat = config[category];
  if (!cat || typeof cat !== 'object') return [];
  return Object.keys(cat);
}

function getFrameworkDescription(framework: string): string {
  const config = getFrameworkConfig(framework);
  return config?.description || 'Modern framework';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Human-friendly display names for types/categories
const DISPLAY_NAME_MAP: Record<string, string> = {
  'c++_c': 'C++/C',
  'javascript': 'JavaScript',
  'go': 'Go',
  'mobile': 'Mobile',
  'desktop': 'Desktop',
  'rust': 'Rust',
  'python': 'Python',
  'ruby': 'Ruby'
};

function displayTypeName(key: string): string {
  return DISPLAY_NAME_MAP[key] || capitalize(key.replace(/[-_]/g, ' '));
}

/**
 * Project name prompt with enhanced styling
 */
export async function promptProjectName(): Promise<string> {
  console.log(chalk.hex('#00d2d3')('\n📝 Project Setup\n'));
  
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: `${chalk.blue('❯')} Enter your project name:`,
      default: 'my-app',
      validate: (input: string) => {
        // Allow empty input (will use default)
        if (!input.trim()) {
          return true;
        }
        if (!/^[a-zA-Z0-9-_\.]+$/.test(input)) {
          return chalk.red('Project name can only contain letters, numbers, hyphens, underscores, and dots');
        }
        return true;
      },
      transformer: (input: string) => {
        if (!input.trim()) {
          return chalk.gray('my-app');
        }
        return chalk.cyan(input);
      }
    }
  ]);

  return projectName.trim();
}

/**
 * Framework selection prompt with enhanced styling
 */
export async function promptFrameworkSelection(): Promise<string> {
  // First prompt: type selection (e.g., mobile, desktop, frontend)
  const types = getAvailableTypes();

  console.log(chalk.hex('#00d2d3')('\n🚀 Project Type Selection\n'));

  const { selectedType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedType',
      message: `${chalk.blue('❯')} Choose a project type/category:`,
      choices: types.map(t => ({
        name: `${chalk.green('●')} ${chalk.bold(displayTypeName(t))}`,
        value: t,
        short: displayTypeName(t)
      })),
      pageSize: 12
    }
  ]);

  // Then prompt frameworks within the selected type
  const frameworks = getAvailableFrameworks(selectedType);
  if (!frameworks || frameworks.length === 0) {
    console.log(chalk.yellow('⚠️  No frameworks found in selected category'));
    return '';
  }

  console.log(chalk.hex('#00d2d3')('\n🚀 Framework Selection\n'));

  const { framework } = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: `${chalk.blue('❯')} Choose your framework:`,
      choices: frameworks.map(fw => ({
        name: `${chalk.green('●')} ${chalk.bold(capitalize(fw))} ${chalk.gray('- ' + (getFrameworkDescription(fw) || ''))}`,
        value: fw,
        short: capitalize(fw)
      })),
      pageSize: 12
    }
  ]);

  return framework;
}

/**
 * Language selection prompt - framework specific from template.json
 */
export async function promptLanguageSelection(framework: string): Promise<string> {
  const config = getFrameworkConfig(framework);
  
  if (!config.languages || config.languages.length <= 1) {
    const defaultLang = config.languages?.[0] || 'javascript';
    console.log(chalk.cyan(`💻 Using ${chalk.bold(defaultLang)} as default language`));
    return defaultLang;
  }

  console.log(chalk.hex('#00d2d3')('\n💻 Language Selection\n'));

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
      message: `${chalk.blue('❯')} Choose your language for ${chalk.bold(framework)}:`,
      choices: config.languages.map((lang: string) => ({
        name: `${languageEmojis[lang] || '📄'} ${chalk.bold(capitalize(lang))}`,
        value: lang,
        short: lang
      })),
      pageSize: 6
    },
  ]);
  
  return language;
}

/**
 * Template selection with enhanced styling
 */
export async function promptTemplateSelection(framework: string): Promise<string> {
  const config = getFrameworkConfig(framework);
  
  if (!config || !config.templates) {
    return '';
  }

  if (config.templates.length === 1) {
    console.log(chalk.cyan(`📋 Using ${chalk.bold(config.templates[0])} template`));
    return config.templates[0];
  }

  console.log(chalk.hex('#00d2d3')('\n📋 Template Selection\n'));

  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: `${chalk.blue('❯')} Choose a template for ${chalk.bold(framework)}:`,
      choices: config.templates.map((template: string) => ({
        name: `${chalk.green('▸')} ${template.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`,
        value: template,
        short: template
      })),
      pageSize: 8
    }
  ]);

  return template;
}

/**
 * Framework options prompt - handles UI, bundlers, and other options
 */
export async function promptFrameworkOptions(framework: string): Promise<FrameworkOptions> {
  const config = getFrameworkConfig(framework);
  
  if (!config || (!config.ui && !config.options && !config.bundlers)) {
    return {};
  }

  console.log(chalk.hex('#00d2d3')(`\n⚙️  ${capitalize(framework)} Configuration\n`));

  const options: FrameworkOptions = {};

  // 1. UI Library selection (if available) - ALWAYS ASK if UI options exist
  if (config.ui && config.ui.length > 0) {
    const { ui } = await inquirer.prompt([
      {
        type: 'list',
        name: 'ui',
        message: `${chalk.blue('❯')} Choose a UI library:`,
        choices: [
          { 
            name: `${chalk.gray('◯')} None - Build your own UI`, 
            value: 'none' 
          },
          ...config.ui.map((uiLib: string) => ({
            name: `${chalk.green('●')} ${capitalize(uiLib)}`,
            value: uiLib
          }))
        ],
        pageSize: 8
      }
    ]);
    options.ui = ui === 'none' ? undefined : ui;
  }

  // 2. Tailwind CSS (if available in options) - ALWAYS ASK if tailwind option exists
  if (config.options?.includes('tailwind')) {
    const { tailwind } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'tailwind',
        message: `${chalk.blue('❯')} Add ${chalk.blue('Tailwind CSS')} for styling?`,
        default: true
      }
    ]);
    options.tailwind = tailwind;
  }

  // 3. Src directory (only for Next.js) - ALWAYS ASK if src option exists for nextjs
  if (framework === 'nextjs' && config.options?.includes('src')) {
    const { src } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'src',
        message: `${chalk.blue('❯')} Use ${chalk.yellow('src/')} directory structure?`,
        default: true
      }
    ]);
    options.src = src;
  }

  // 4. Bundler selection (only for React-based frameworks) - ALWAYS ASK if bundlers exist
  if (config.bundlers && config.bundlers.length > 0) {
    const { bundler } = await inquirer.prompt([
      {
        type: 'list',
        name: 'bundler',
        message: `${chalk.blue('❯')} Choose a bundler:`,
        choices: config.bundlers.map((bundler: string) => ({
          name: `${chalk.blue('▸')} ${capitalize(bundler)}`,
          value: bundler
        })),
        pageSize: 6
      }
    ]);
    options.bundler = bundler;
  }

  return options;
}

/**
 * Template creation confirmation
 */
export async function promptTemplateConfirmation(framework: string, language: string, templateName: string, options: FrameworkOptions): Promise<boolean> {
  console.log(chalk.hex('#00d2d3')('\n✅ Project Summary\n'));
  
  console.log(chalk.white('📦 Project Configuration:'));
  console.log(`   Framework: ${chalk.green(framework)}`);
  console.log(`   Language: ${chalk.blue(language)}`);
  if (templateName) {
    console.log(`   Template: ${chalk.yellow(templateName)}`);
  }
  if (options.ui) {
    console.log(`   UI Library: ${chalk.magenta(options.ui)}`);
  }
  if (options.tailwind) {
    console.log(`   Styling: ${chalk.cyan('Tailwind CSS')}`);
  }
  if (options.src) {
    console.log(`   Structure: ${chalk.yellow('src/ directory')}`);
  }
  if (options.bundler) {
    console.log(`   Bundler: ${chalk.blue(options.bundler)}`);
  }
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `${chalk.blue('❯')} Create project with these settings?`,
      default: true
    }
  ]);

  return confirm;
}

/**
 * Features selection prompt for post-creation
 */
export async function promptFeatureSelection(): Promise<string[]> {
  console.log(chalk.hex('#00d2d3')('\n🚀 Feature Enhancement\n'));
  
  const { addFeatures } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addFeatures',
      message: `${chalk.blue('❯')} Would you like to add features to your project?`,
      default: true
    }
  ]);

  if (!addFeatures) {
    return [];
  }

  // Get available feature categories from features.json
  const featuresPath = getFeaturesJsonPath();
  if (!fs.existsSync(featuresPath)) {
    console.log(chalk.yellow('⚠️  Features configuration not found'));
    return [];
  }

  const featuresConfig = JSON.parse(fs.readFileSync(featuresPath, 'utf-8'));
  const categories = Object.keys(featuresConfig);

  const { selectedCategories } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedCategories',
      message: `${chalk.blue('❯')} Select feature categories to add:`,
      choices: categories.map(category => ({
        name: `${chalk.green('□')} ${capitalize(category)}`,
        value: category,
        checked: false
      })),
      pageSize: 10
    }
  ]);

  return selectedCategories;
}

/**
 * Specific feature provider selection
 */
export async function promptFeatureProvider(category: string, framework: string): Promise<string | null> {
  const featuresPath = getFeaturesJsonPath();
  const featuresConfig = JSON.parse(fs.readFileSync(featuresPath, 'utf-8'));
  
  if (!featuresConfig[category]) {
    return null;
  }

  const providers = Object.keys(featuresConfig[category]);
  
  if (providers.length === 0) {
    console.log(chalk.yellow(`⚠️  No providers found for ${category}`));
    return null;
  }

  if (providers.length === 1) {
    console.log(chalk.cyan(`🔧 Using ${chalk.bold(providers[0])} for ${category}`));
    return providers[0];
  }

  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: `${chalk.blue('❯')} Choose a ${category} provider:`,
      choices: providers.map(provider => ({
        name: `${chalk.green('▸')} ${capitalize(provider)}`,
        value: provider,
        short: provider
      })),
      pageSize: 8
    }
  ]);

  return provider;
}

/**
 * Helper functions to check framework capabilities
 */
export function hasFrameworkOptions(framework: string): boolean {
  const config = getFrameworkConfig(framework);
  return !!(config?.options && config.options.length > 0);
}

export function hasUIOptions(framework: string): boolean {
  const config = getFrameworkConfig(framework);
  return !!(config?.ui && config.ui.length > 0);
}

export function hasBundlerOptions(framework: string): boolean {
  const config = getFrameworkConfig(framework);
  return !!(config?.bundlers && config.bundlers.length > 0);
}

export function hasTemplateSelection(framework: string): boolean {
  const config = getFrameworkConfig(framework);
  return !!(config?.templates && config.templates.length > 0);
}

export function shouldShowTemplates(framework: string): boolean {
  const config = getFrameworkConfig(framework);
  // Show templates ONLY for frameworks that have templates but NO options/ui/bundlers
  // Frameworks WITH options should generate template names based on user choices
  const hasOptions = !!(config?.options || config?.ui || config?.bundlers);
  const hasTemplates = !!(config?.templates && config.templates.length > 0);
  
  return hasTemplates && !hasOptions;
}