/**
 * Template path resolution utilities for Package Installer CLI v3.0.0
 * Simplified without database logic, focused on templates structure
 */

import path from 'path';
import fs from 'fs-extra';
import { ProjectOptions, FrameworkConfig } from './types.js';
import { isCombinationTemplate, getFrameworkDirectoryName } from './utils.js';

/**
 * Constructs the template directory path based on framework configuration
 */
export function getTemplateDir(
  framework: string,
  language: string,
  templateName: string,
  bundler?: string
): string {
  const templatesRoot = path.join(process.cwd(), 'templates');
  
  // Handle bundler-based frameworks (like React with Vite)
  if (bundler && ['reactjs'].includes(framework)) {
    return path.join(templatesRoot, framework, bundler, language, templateName);
  }
  
  // Standard framework/language/template structure
  return path.join(templatesRoot, framework, language, templateName);
}

/**
 * Resolves the complete template directory path based on project options
 * Simplified to match the new templates structure without database paths
 */
export function resolveTemplatePath(
  options: ProjectOptions,
  fwConfig: FrameworkConfig,
  templatesRoot: string
): string {
  const { framework, language, templateName, bundler } = options;
  
  if (isCombinationTemplate(framework)) {
    // For combination templates, convert framework name from '+' to '-' for directory structure
    const frameworkDir = getFrameworkDirectoryName(framework);
    return path.join(templatesRoot, frameworkDir, language ?? '', templateName);
  }

  // Handle framework-specific template paths based on new structure
  switch (framework) {
    case 'rust':
      // Rust templates are directly in the rust folder
      return path.join(templatesRoot, 'rust', templateName);
      
    case 'django':
      // Django templates with language structure
      return path.join(templatesRoot, 'django', language ?? '', templateName);
      
    case 'expressjs':
      // Express.js templates with language structure
      return path.join(templatesRoot, 'express', language ?? '', templateName);
      
    case 'nestjs':
      // Nest.js templates (typically TypeScript only)
      return path.join(templatesRoot, 'nestjs', language ?? '', templateName);
      
    case 'angularjs':
      // Angular templates with TypeScript and Material UI variants
      return path.join(templatesRoot, 'angularjs', language ?? '', templateName);
      
    case 'vuejs':
      // Vue.js templates with language structure
      return path.join(templatesRoot, 'vuejs', language ?? '', templateName);
      
    case 'reactjs':
      // React templates with bundler structure (Vite)
      if (bundler) {
        return path.join(templatesRoot, 'reactjs', bundler, language ?? '', templateName);
      }
      return path.join(templatesRoot, 'reactjs', 'vite', language ?? '', templateName);
      
    case 'nextjs':
      // Next.js templates with language structure
      return path.join(templatesRoot, 'nextjs', language ?? '', templateName);
      
    case 'remixjs':
      // Remix templates with language structure
      return path.join(templatesRoot, 'remixjs', language ?? '', templateName);
      
    default:
      return getTemplateDir(framework, language ?? '', templateName, bundler);
  }
}

/**
 * Generates template name based on framework options and available templates
 * Enhanced to better match template naming conventions
 */
export function generateTemplateName(
  framework: string,
  fwConfig: FrameworkConfig,
  options: {
    src?: boolean;
    ui?: string | null;
    tailwind?: boolean;
    typeChoice?: string;
    bundler?: string;
  }
): string {
  const { src, ui, tailwind, typeChoice } = options;

  // Handle specific framework template naming
  if (framework === 'rust') {
    return typeChoice === 'basic' ? 'basic-rust-template' : 'advance-rust-template';
  }

  if (framework === 'expressjs') {
    return typeChoice === 'basic' ? 'basic-expressjs-template' : 'advance-expressjs-template';
  }

  if (framework === 'nestjs') {
    return 'template'; // Simplified naming
  }

  if (framework === 'django') {
    return 'django-template'; // Simplified naming
  }

  // Handle Angular-specific naming (Material UI variants)
  if (framework === 'angularjs') {
    if (ui && tailwind) {
      return 'material-ui-tailwind-template';
    } else if (ui && !tailwind) {
      return 'material-ui-no-tailwind-template';
    } else {
      return 'basic-angular-template';
    }
  }

  // Handle Vue.js naming
  if (framework === 'vuejs') {
    if (ui && tailwind) {
      return `${ui}-tailwind-template`;
    } else if (ui) {
      return `${ui}-template`;
    } else if (tailwind) {
      return 'tailwind-template';
    } else {
      return 'basic-vue-template';
    }
  }

  // Handle combination templates
  if (isCombinationTemplate(framework)) {
    if (fwConfig.templates && fwConfig.templates.length > 0) {
      // For combination templates, return the selected template directly
      return fwConfig.templates[0]; // Default to first template, this will be overridden by template selection
    }
  }

  // Compose template name for React and Next.js frameworks
  if (framework === 'nextjs' || framework === 'reactjs') {
    const parts = [];
    
    // Add src/no-src prefix for Next.js
    if (framework === 'nextjs') {
      parts.push(src ? 'src' : 'no-src');
    }
    
    // Add UI library
    if (ui === 'shadcn') {
      parts.push('shadcn');
    } else {
      parts.push('no-shadcn');
    }
    
    // Add tailwind/no-tailwind suffix
    parts.push(tailwind ? 'tailwind' : 'no-tailwind');
    
    return parts.join('-') + '-template';
  }

  // Handle Remix-specific naming
  if (framework === 'remixjs') {
    const parts = [];
    
    if (ui === 'shadcn') {
      parts.push('shadcn');
    } else {
      parts.push('no-shadcn');
    }
    
    parts.push(tailwind ? 'tailwind' : 'no-tailwind');
    
    return parts.join('-') + '-template';
  }

  // Default template naming
  return 'template';
}

/**
 * Validates if a template path exists and is accessible
 */
export async function validateTemplatePath(templatePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(templatePath);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Gets all available templates for a given framework and language
 */
export async function getAvailableTemplates(
  framework: string, 
  language: string,
  bundler?: string
): Promise<string[]> {
  try {
    const templatesRoot = path.join(process.cwd(), 'templates');
    let templateDir: string;

    // Construct template directory path based on framework
    switch (framework) {
      case 'rust':
        templateDir = path.join(templatesRoot, 'rust');
        break;
      case 'reactjs':
        templateDir = path.join(templatesRoot, 'reactjs', bundler || 'vite', language);
        break;
      case 'nextjs':
      case 'vuejs':
      case 'angularjs':
      case 'expressjs':
      case 'nestjs':
      case 'django':
        templateDir = path.join(templatesRoot, framework, language);
        break;
      default:
        templateDir = path.join(templatesRoot, framework, language);
    }

    if (!await fs.pathExists(templateDir)) {
      return [];
    }

    const entries = await fs.readdir(templateDir, { withFileTypes: true });
    const templates = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => name.includes('template')); // Only return template directories

    return templates.sort();
  } catch (error) {
    console.warn(`Could not read templates for ${framework}/${language}`);
    return [];
  }
}

/**
 * Gets the template metadata if available
 */
export async function getTemplateMetadata(templatePath: string): Promise<any> {
  try {
    const metadataPath = path.join(templatePath, 'template.json');
    if (await fs.pathExists(metadataPath)) {
      return await fs.readJson(metadataPath);
    }
    
    // Fallback to package.json for basic info
    const packagePath = path.join(templatePath, 'package.json');
    if (await fs.pathExists(packagePath)) {
      const pkg = await fs.readJson(packagePath);
      return {
        name: pkg.name || 'Unknown Template',
        description: pkg.description || 'No description available',
        version: pkg.version || '1.0.0',
        dependencies: Object.keys(pkg.dependencies || {}),
        devDependencies: Object.keys(pkg.devDependencies || {})
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Analyzes a template directory and returns its structure
 */
export async function analyzeTemplateStructure(templatePath: string): Promise<{
  hasPackageJson: boolean;
  hasTsConfig: boolean;
  hasDockerfile: boolean;
  hasEnvExample: boolean;
  hasGitIgnore: boolean;
  fileCount: number;
  directories: string[];
}> {
  try {
    if (!await fs.pathExists(templatePath)) {
      throw new Error('Template path does not exist');
    }

    const items = await fs.readdir(templatePath, { withFileTypes: true });
    const files = items.filter(item => item.isFile()).map(item => item.name);
    const directories = items.filter(item => item.isDirectory()).map(item => item.name);

    return {
      hasPackageJson: files.includes('package.json'),
      hasTsConfig: files.includes('tsconfig.json'),
      hasDockerfile: files.includes('Dockerfile'),
      hasEnvExample: files.includes('.env.example') || files.includes('env.example'),
      hasGitIgnore: files.includes('.gitignore'),
      fileCount: files.length,
      directories: directories.filter(dir => !['node_modules', '.git', 'dist', 'build'].includes(dir))
    };
  } catch (error) {
    throw new Error(`Failed to analyze template structure: ${error}`);
  }
}
