/**
 * Template path resolution utilities for Package Installer CLI v3.0.0
 * Handles template name generation and path resolution based on template.json
 */

import path from 'path';
import fs from 'fs-extra';
import { FrameworkOptions } from './prompts.js';

export interface ProjectInfo {
  framework: string;
  language?: string;
  templateName?: string;
  options?: FrameworkOptions;
}

// Helper functions to read template.json
function getTemplateConfig() {
  const templatePath = path.join(process.cwd(), 'template.json');
  if (!fs.existsSync(templatePath)) {
    throw new Error('template.json not found');
  }
  return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
}

function getFrameworkConfig(framework: string) {
  const config = getTemplateConfig();
  return config.frameworks[framework];
}

/**
 * Generate template name based on framework options
 */
export function generateTemplateName(framework: string, options: FrameworkOptions): string {
  const config = getFrameworkConfig(framework);
  
  // If framework doesn't have options, return empty (will use provided template name)
  if (!config?.options) {
    return '';
  }

  // Build template name based on selected options
  const parts: string[] = [];
  
  // Handle UI library
  if (options.ui && options.ui !== 'none') {
    parts.push(options.ui);
  } else {
    parts.push('no-' + (config.ui?.[0] || 'ui'));
  }
  
  // Handle tailwind option
  if (config.options.includes('tailwind')) {
    if (options.tailwind) {
      parts.push('tailwind');
    } else {
      parts.push('no-tailwind');
    }
  }
  
  // Handle src option
  if (config.options.includes('src')) {
    if (options.src) {
      parts.push('src');
    } else {
      parts.push('no-src');
    }
  }
  
  return parts.join('-') + '-template';
}

/**
 * Resolve template directory path based on framework and template name
 */
export function resolveTemplatePath(projectInfo: ProjectInfo): string {
  const { framework, templateName } = projectInfo;
  const templatesRoot = path.join(process.cwd(), 'templates');
  
  // Handle combination templates (like reactjs+expressjs+shadcn)
  if (framework.includes('+')) {
    const frameworkDir = framework.replace(/\+/g, '-');
    return path.join(templatesRoot, frameworkDir);
  }
  
  // Standard framework templates
  if (templateName) {
    return path.join(templatesRoot, framework);
  }
  
  // For frameworks with options, use the framework directory directly
  return path.join(templatesRoot, framework);
}

/**
 * Check if template directory exists
 */
export function templateExists(templatePath: string): boolean {
  return fs.existsSync(templatePath) && fs.statSync(templatePath).isDirectory();
}

/**
 * Get all available templates for a framework
 */
export function getFrameworkTemplates(framework: string): string[] {
  const frameworkPath = path.join(process.cwd(), 'templates', framework);
  
  if (!fs.existsSync(frameworkPath)) {
    return [];
  }
  
  return fs.readdirSync(frameworkPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}
