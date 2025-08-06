/**
 * Template path resolution utilities
 */

import path from 'path';
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
  const bundlerPath = bundler ? path.join(bundler, language) : language;
  return path.join(templatesRoot, framework, bundlerPath, templateName);
}

/**
 * Resolves the complete template directory path based on project options
 */
export function resolveTemplatePath(
  options: ProjectOptions,
  fwConfig: FrameworkConfig,
  templatesRoot: string
): string {
  const { framework, language, templateName, bundler, database, orm } = options;
  
  if (isCombinationTemplate(framework)) {
    // For combination templates, convert framework name from '+' to '-' for directory structure
    const frameworkDir = getFrameworkDirectoryName(framework);
    if (database && orm) {
      // Include database and ORM in the path
      return path.join(templatesRoot, frameworkDir, language ?? '', database, orm, templateName);
    } else {
      // Fallback to old structure for templates without database selection
      return path.join(templatesRoot, frameworkDir, language ?? '', templateName);
    }
  }

  // Handle framework-specific template paths
  switch (framework) {
    case 'rust':
      return path.join(templatesRoot, 'rust', templateName);
      
    case 'expressjs':
      if (database === 'none' || !database) {
        // Use basic template without database
        return path.join(templatesRoot, 'expressjs', language ?? '', templateName);
      } else {
        // Use templates from specific database/ORM folder
        return path.join(templatesRoot, 'expressjs', language ?? '', database, orm ?? '', templateName);
      }
      
    case 'nestjs':
      if (database === 'none' || !database) {
        // Use basic template without database
        return path.join(templatesRoot, 'nestjs', language ?? '', templateName);
      } else {
        // Use templates from specific database/ORM folder
        return path.join(templatesRoot, 'nestjs', language ?? '', database, orm ?? '', templateName);
      }
      
    case 'remixjs':
      return getTemplateDir(framework, language ?? '', templateName, bundler);
      
    case 'nextjs':
      if (database === 'none' || !database) {
        // Use templates from 'none' folder
        return path.join(templatesRoot, 'nextjs', language ?? '', 'none', templateName);
      } else {
        // Use templates from specific database/ORM folder
        return path.join(templatesRoot, 'nextjs', language ?? '', database, orm ?? '', templateName);
      }
      
    default:
      return getTemplateDir(framework, language ?? '', templateName, bundler);
  }
}

/**
 * Generates template name based on framework options
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
    return 'template';
  }

  // Handle Angular-specific naming
  if (framework === 'angularjs') {
    if (ui && tailwind) {
      return 'material-ui-tailwind-template';
    } else if (ui && !tailwind) {
      return 'material-ui-no-tailwind-template';
    } else {
      return 'no-material-no-tailwind-template';
    }
  }

  // Handle Remix-specific naming
  if (framework === 'remixjs') {
    if (ui === 'shadcn' && tailwind) {
      return 'shadcn-tailwind-template';
    } else if (!ui && !tailwind) {
      return 'no-shadcn-no-tailwind-template';
    } else if (!ui && tailwind) {
      return 'no-shadcn-tailwind-template';
    }
  }

  // Compose template name for other frameworks
  const parts = [];
  
  // Add src/no-src prefix if applicable
  if (fwConfig.options?.includes('src') && 
      framework !== 'angularjs' && 
      framework !== 'nestjs' && 
      !(framework === 'reactjs' && options.bundler === 'vite')) {
    parts.push(src ? 'src' : 'no-src');
  }
  
  // Add UI library
  if (ui) {
    parts.push(ui);
  }
  
  // Add tailwind/no-tailwind suffix if applicable
  if (fwConfig.options?.includes('tailwind') && framework !== 'nestjs') {
    parts.push(tailwind ? 'tailwind' : 'no-tailwind');
  }

  return parts.length > 0 ? parts.join('-') + '-template' : 'template';
}
