/**
 * Type definitions for Package Installer CLI v3.2.0
 * Comprehensive type system for enhanced CLI functionality
 */

export interface FrameworkConfig {
  type: string;
  description: string;
  languages?: string[];
  ui?: string[];
  options?: string[];
  bundlers?: string[];
  templates?: string[];
  features?: string[];
}

export interface TemplateConfig {
  version: string;
  lastUpdated: string;
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
  features?: Array<{ feature: string; provider?: string }>;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface FeatureConfig {
  description: string;
  supportedFrameworks: string[];
  supportedLanguages: string[];
  providers?: string[];
  files: {
    [provider: string]: {
      [framework: string]: {
        [language: string]: {
          [filePath: string]: {
            action: 'create' | 'append' | 'prepend' | 'overwrite' | 'install';
            content?: string;
          };
        };
      };
    };
  };
}

export interface FeaturesConfig {
  version: string;
  lastUpdated: string;
  features: {
    [featureName: string]: FeatureConfig;
  };
}

export interface TemplateMetadata {
  name: string;
  framework: string;
  language: string;
  bundler?: string;
  ui?: string;
  features: string[];
  hasSrc: boolean;
  hasTailwind: boolean;
  createdAt: string;
  size: number;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  description?: string;
  homepage?: string;
  repository?: string;
}

export interface ProjectCreationOptions {
  projectName: string;
  framework: string;
  language: string;
  templateName: string;
  templatePath: string;
  features: Array<{ feature: string; provider?: string }>;
  options: {
    bundler?: string;
    ui?: string;
    src?: boolean;
    tailwind?: boolean;
  };
}

export interface FileOperation {
  type: 'create' | 'append' | 'prepend' | 'overwrite' | 'install';
  filePath: string;
  content?: string;
  dependencies?: DependencyInfo[];
}

export interface FeatureIntegration {
  feature: string;
  provider?: string;
  framework: string;
  language: string;
  operations: FileOperation[];
}

export interface CacheEntry<T = any> {
  id: string;
  data: T;
  createdAt: string;
  lastAccessed: string;
  size: number;
  metadata?: Record<string, any>;
}

export interface TemplateCache extends CacheEntry {
  data: {
    name: string;
    framework: string;
    language: string;
    files: Record<string, string>;
    metadata: TemplateMetadata;
  };
}

export interface FeatureCache extends CacheEntry {
  data: {
    name: string;
    providers: string[];
    supportedFrameworks: string[];
    supportedLanguages: string[];
    files: Record<string, Record<string, string>>;
  };
}

export interface UILibraryInfo {
  name: string;
  description: string;
  framework: string[];
  installCommand: string;
  configFiles?: string[];
  dependencies: DependencyInfo[];
}

export interface BundlerInfo {
  name: string;
  description: string;
  framework: string[];
  configFiles: string[];
  buildCommand: string;
  devCommand: string;
}

export interface LanguageInfo {
  name: string;
  extension: string;
  description: string;
  compiler?: string;
  runtime?: string;
  packageManager: string[];
}

export interface FrameworkInfo {
  name: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'system';
  description: string;
  languages: string[];
  defaultLanguage: string;
  packageManager: string[];
  defaultPackageManager: string;
  buildTool?: string;
  devServer?: string;
  productionBuild?: string;
}

export interface CLIConfig {
  version: string;
  defaultFramework?: string;
  defaultLanguage?: string;
  defaultPackageManager?: string;
  cacheEnabled: boolean;
  historyEnabled: boolean;
  telemetryEnabled: boolean;
  updateCheckEnabled: boolean;
  lastUpdateCheck?: string;
}

export interface CommandContext {
  command: string;
  args: string[];
  options: Record<string, any>;
  workingDirectory: string;
  timestamp: string;
  user?: string;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: string;
  stack?: string;
  context?: CommandContext;
  timestamp: string;
}

export interface SuccessResult<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResult {
  success: false;
  error: ErrorInfo;
  timestamp: string;
}

export type Result<T = any> = SuccessResult<T> | ErrorResult;

export type CacheStrategy = 'lru' | 'lfu' | 'ttl';

export interface ProgressCallback {
  (progress: number, message: string): void;
}

export interface InstallationProgress {
  step: string;
  progress: number;
  message: string;
  details?: string;
}

export interface TemplateValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface FeatureValidation {
  isValid: boolean;
  compatibility: {
    framework: boolean;
    language: boolean;
    dependencies: boolean;
  };
  conflicts: string[];
  requirements: string[];
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  indicators: string[];
  configFiles: any[];
  sourceFiles: string[];
}

export interface PackageManagerDetectionResult {
  packageManager: string;
  confidence: number;
  lockFiles: string[];
  configFiles: string[];
  recommended: boolean;
}

export interface ValidationResult<T = any> {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  value?: T;
}

