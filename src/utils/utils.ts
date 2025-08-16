/**
 * Utility functions for Package Installer CLI
 */

import chalk from 'chalk';
import path from 'path';

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Normalizes a file path for cross-platform compatibility
 */
export function normalizePath(inputPath: string): string {
  return path.normalize(inputPath).replace(/\\/g, '/');
}

/**
 * Returns the appropriate color theme for a given framework
 */
export function getFrameworkTheme(framework: string) {
  switch (framework.toLowerCase()) {
    case 'react':
    case 'reactjs':
      return chalk.cyanBright;
    case 'nextjs':
      return chalk.whiteBright.bgBlack;
    case 'vue':
    case 'vuejs':
      return chalk.greenBright;
    case 'angular':
    case 'angularjs':
      return chalk.redBright;
    case 'express':
    case 'expressjs':
      return chalk.greenBright;
    case 'remix':
    case 'remixjs':
      return chalk.blueBright;
    case 'nestjs':
      return chalk.magentaBright;
    case 'rust':
      return chalk.yellowBright;
    default:
      return chalk.blueBright;
  }
}

/**
 * Validates project names for compatibility and best practices
 */
export function validateProjectName(name: string): string | true {
  if (!name || name.trim().length === 0) {
    return 'Project name cannot be empty';
  }

  if (name.length > 50) {
    return 'Project name is too long (max 50 characters)';
  }

  // Allow letters, numbers, underscores, dashes, and dots
  const validNameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!validNameRegex.test(name)) {
    return 'Project name may only include letters, numbers, underscores, dashes, and dots';
  }

  // Check for reserved names
  const reservedNames = ['node_modules', 'package.json', 'package-lock.json', 'pnpm-lock.yaml'];
  if (reservedNames.includes(name.toLowerCase())) {
    return `"${name}" is a reserved name`;
  }

  return true;
}

/**
 * Determines if a framework supports database configuration
 */
export function frameworkSupportsDatabase(frameworkConfig: any): boolean {
  return frameworkConfig && 
         frameworkConfig.options && 
         frameworkConfig.options.databases && 
         frameworkConfig.options.databases.length > 0;
}

/**
 * Gets available databases for a framework
 */
export function getAvailableDatabases(frameworkConfig: any): string[] {
  if (!frameworkSupportsDatabase(frameworkConfig)) {
    return [];
  }
  return frameworkConfig.options.databases || [];
}

/**
 * Gets available ORMs for a database and language combination
 */
export function getAvailableOrms(frameworkConfig: any, database: string, language: string): string[] {
  if (!frameworkSupportsDatabase(frameworkConfig)) {
    return [];
  }

  const orms = frameworkConfig.options?.orms?.[database];
  if (!orms || !Array.isArray(orms)) {
    return [];
  }

  return orms;
}

/**
 * Checks if a framework is a combination template
 */
export function isCombinationTemplate(framework: string): boolean {
  return framework.includes('+');
}

/**
 * Converts framework name from '+' to '-' for directory structure
 */
export function getFrameworkDirectoryName(framework: string): string {
  return framework.replace(/\+/g, '-');
}

/**
 * Get project name from user input or prompt for it
 */
export async function getProjectName(providedName?: string): Promise<string> {
  if (providedName) {
    return providedName;
  }
  
  const { default: inquirer } = await import('inquirer');
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      default: 'my-app',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Project name cannot be empty';
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      }
    }
  ]);
  
  return projectName;
}
