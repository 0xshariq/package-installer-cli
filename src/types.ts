/**
 * Type definitions for Package Installer CLI
 */

export interface DatabaseConfig {
  [language: string]: {
    orms: string[];
  };
}

export interface FrameworkConfig {
  type: 'frontend' | 'backend' | 'fullstack';
  description: string;
  languages: string[];
  databases?: {
    [database: string]: DatabaseConfig;
  };
  ui?: string[];
  options?: string[];
  bundlers?: string[];
  templates?: string[];
}

export interface TemplateConfig {
  frameworks: {
    [framework: string]: FrameworkConfig;
  };
}

export interface ProjectOptions {
  projectName?: string;
  framework: string;
  language?: string;
  templateName: string;
  bundler?: string;
  src?: boolean;
  tailwind?: boolean;
  ui?: string | null;
  database?: string;
  orm?: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}
