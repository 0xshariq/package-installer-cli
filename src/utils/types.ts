/**
 * Type definitions for Package Installer CLI
 */

export interface DatabaseConfig {
  [language: string]: {
    orms: string[];
  };
}

export interface FrameworkConfig {
  type: string;
  description: string;
  options?: {
    languages?: string[];
    uiLibraries?: string[];
    bundlers?: string[];
    srcDirectory?: boolean;
    tailwind?: boolean;
    databases?: string[];
    orms?: { [database: string]: string[] };
  };
  templates: {
    [key: string]: {
      name: string;
      description: string;
      path: string;
    };
  };
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
