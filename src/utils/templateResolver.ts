/**
 * Template path resolution utilities for Package Installer CLI v3.2.0
 * Handles template name generation and path resolution based on template.json
 */

import path from 'path';
import fs from 'fs-extra';

// Local lightweight FrameworkOptions type to avoid circular runtime imports
export interface FrameworkOptions {
  tailwind?: boolean;
  src?: boolean;
  ui?: string;
  bundler?: string;
}
import { getCliRootPath, getTemplatesPath } from './pathResolver.js';

export interface ProjectInfo {
  framework: string;
  language?: string;
  templateName?: string;
  options?: FrameworkOptions;
}

// Helper functions to read template.json
function getTemplateConfig() {
  const cliDir = getCliRootPath();
  const templatePath = path.join(cliDir, '/templates/template.json');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`template.json not found at: ${templatePath}`);
  }
  return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
}

// Export getTemplateConfig for other modules to reuse
export { getTemplateConfig };

function getFrameworkConfig(framework: string) {
  const config = getTemplateConfig();
  // New template.json structure groups frameworks under top-level categories
  for (const categoryKey of Object.keys(config)) {
    const cat = config[categoryKey];
    if (cat && typeof cat === 'object' && Object.prototype.hasOwnProperty.call(cat, framework)) {
      return cat[framework];
    }
  }
  return undefined;
}

// Export for use in other modules
export { getFrameworkConfig };

/**
 * Generate template name based on framework options - use exact template names from template.json
 * Only generates for frameworks that HAVE options
 */
export function generateTemplateName(framework: string, options: FrameworkOptions): string {
  const config = getFrameworkConfig(framework);
  
  // Only generate template names for frameworks that have options
  if (!config?.options && !config?.ui && !config?.bundlers) {
    return '';
  }

  // If framework has predefined templates, select the matching one based on options
  if (config.templates && config.templates.length > 0) {
    // Build template name based on selected options
    const parts: string[] = [];
    
    // Handle src option (only for nextjs and reactjs)
    if ((framework === 'nextjs' || framework === 'reactjs') && config.options?.includes('src')) {
      if (options.src) {
        parts.push('src');
      } else {
        parts.push('no-src');
      }
    }
    
    // Handle UI library - only add if actually selected (not "none")
    // When UI is "none", templates simply omit the UI part from their names
    if (config.ui && config.ui.length > 0) {
      if (options.ui && options.ui !== 'none') {
        parts.push(options.ui);
      }
      // For "none" selection, don't add any UI part to the template name
    }
    
    // Handle tailwind option
    if (config.options?.includes('tailwind')) {
      if (options.tailwind) {
        parts.push('tailwind');
      } else {
        parts.push('no-tailwind');
      }
    }
    
    const generatedName = parts.join('-') + '-template';
    
    // Find exact match in templates array
    const exactMatch = config.templates.find((template: string) => template === generatedName);
    if (exactMatch) {
      return exactMatch;
    }
    
    // If no exact match, return the first template as fallback
    return config.templates[0];
  }

  return '';
}

/**
 * Resolve template directory path based on framework and template name
 */
export function resolveTemplatePath(projectInfo: ProjectInfo): string {
  const { framework, language, templateName } = projectInfo;
  const templatesRoot = getTemplatesPath();

  // Helper: find category that contains the framework
  function findCategoryForFramework(frameworkName: string): string | null {
    const config = getTemplateConfig();
    for (const categoryKey of Object.keys(config)) {
      const cat = config[categoryKey];
      if (cat && typeof cat === 'object' && Object.prototype.hasOwnProperty.call(cat, frameworkName)) {
        return categoryKey;
      }
    }
    return null;
  }

  // Combination templates are stored under a special category (e.g., combination-templates)
  if (framework.includes('+')) {
    const frameworkDir = framework.replace(/\+/g, '-');
    const combCategory = 'combination-templates';
    const combinationPath = path.join(templatesRoot, combCategory, frameworkDir);
    if (fs.existsSync(combinationPath)) {
      if (language) {
        const langPath = path.join(combinationPath, language);
        if (fs.existsSync(langPath)) {
          if (templateName) {
            const templatePath = path.join(langPath, templateName);
            if (fs.existsSync(templatePath)) return templatePath;
          }
          return langPath;
        }
      }
      if (templateName) {
        const templatePath = path.join(combinationPath, templateName);
        if (fs.existsSync(templatePath)) return templatePath;
      }
      return combinationPath;
    }
  }

  // Regular frameworks
  const category = findCategoryForFramework(framework);
  let baseFrameworkPath: string = path.join(templatesRoot, framework); // default fallback
  if (category) {
    baseFrameworkPath = path.join(templatesRoot, category, framework);
    // If the expected folder doesn't exist on disk (config/fs mismatch), try scanning categories
    if (!fs.existsSync(baseFrameworkPath)) {
      const topLevelItems = fs.readdirSync(templatesRoot, { withFileTypes: true });
      for (const dirent of topLevelItems) {
        if (!dirent.isDirectory()) continue;
        const candidate = path.join(templatesRoot, dirent.name, framework);
        if (fs.existsSync(candidate)) {
          baseFrameworkPath = candidate;
          break;
        }
      }
    }
  } else {
    // Fallback 1: try to find the framework directory under any category on disk
    let found = false;
    const topLevelItems = fs.readdirSync(templatesRoot, { withFileTypes: true });
    for (const dirent of topLevelItems) {
      if (!dirent.isDirectory()) continue;
      const candidate = path.join(templatesRoot, dirent.name, framework);
      if (fs.existsSync(candidate)) {
        baseFrameworkPath = candidate;
        found = true;
        break;
      }
    }
    if (!found) {
      // keep default baseFrameworkPath (top-level legacy location)
    }
  }

  // If a language-specific folder exists, prefer it
  // Use template.json config to resolve paths when available
  const fwConfig = getFrameworkConfig(framework as any);
  if (fwConfig) {
    const templatesEntry = fwConfig.templates;

    // Helper to test candidate paths
    const testCandidates = (candidates: string[]) => {
      for (const c of candidates) {
        if (fs.existsSync(c)) return c;
      }
      return null;
    };

    // If templates is an object keyed by language
    if (templatesEntry && typeof templatesEntry === 'object' && !Array.isArray(templatesEntry)) {
      // templatesEntry is like { "typescript": ["a","b"], "javascript": [...] }
      const langKey = language || Object.keys(templatesEntry)[0];
      const list = templatesEntry[langKey] || templatesEntry[Object.keys(templatesEntry)[0]] || [];
      if (templateName && list.includes(templateName)) {
        // Prefer language folder then direct
        const candidates = [
          path.join(baseFrameworkPath, langKey, templateName),
          path.join(baseFrameworkPath, templateName)
        ];
        const found = testCandidates(candidates);
        if (found) return found;
      }

      // If no specific templateName, prefer language folder if exists
      const langDir = path.join(baseFrameworkPath, langKey);
      if (fs.existsSync(langDir)) return langDir;

      // fallback to first template folder for any language
      const anyTemplate = list[0];
      if (anyTemplate) {
        const candidates = [
          path.join(baseFrameworkPath, langKey, anyTemplate),
          path.join(baseFrameworkPath, anyTemplate)
        ];
        const found = testCandidates(candidates);
        if (found) return found;
      }
    }

    // If templates is an array
    if (Array.isArray(templatesEntry)) {
      if (templateName && templatesEntry.includes(templateName)) {
        const candidates = [
          path.join(baseFrameworkPath, language || '', templateName),
          path.join(baseFrameworkPath, templateName)
        ];
        const found = testCandidates(candidates);
        if (found) return found;
      }

      // if no templateName, prefer language subdir if it exists
      if (language) {
        const langDir = path.join(baseFrameworkPath, language);
        if (fs.existsSync(langDir)) return langDir;
      }

      // fallback to first template folder if it exists
      const first = templatesEntry[0];
      if (first) {
        const candidates = [
          path.join(baseFrameworkPath, language || '', first),
          path.join(baseFrameworkPath, first)
        ];
        const found = testCandidates(candidates);
        if (found) return found;
      }
    }

    // If templates not declared or nothing matched, prefer language dir if exists
    if (language) {
      const langDir = path.join(baseFrameworkPath, language);
      if (fs.existsSync(langDir)) return langDir;
    }

    // Direct templateName fallback
    if (templateName) {
      const candidate = path.join(baseFrameworkPath, templateName);
      if (fs.existsSync(candidate)) return candidate;
    }

    // finally, return baseFrameworkPath (may or may not exist)
    return baseFrameworkPath;
  }

  // If no fwConfig available, fallback to previously implemented resolution (language dir, templateName, base)
  if (language) {
    const langDir = path.join(baseFrameworkPath, language);
    if (fs.existsSync(langDir)) {
      if (templateName) {
        const candidate = path.join(langDir, templateName);
        if (fs.existsSync(candidate)) return candidate;
      }
      return langDir;
    }
  }

  if (templateName) {
    const candidate = path.join(baseFrameworkPath, templateName);
    if (fs.existsSync(candidate)) return candidate;
  }

  return baseFrameworkPath;
}

/**
 * Check if template directory exists
 */
export function templateExists(templatePath: string): boolean {
  return fs.existsSync(templatePath) && fs.statSync(templatePath).isDirectory();
}
