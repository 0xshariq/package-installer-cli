/**
 * Cache Utility - Fast data caching system for Package Installer CLI
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

export interface CacheData {
  projects: ProjectCache[];
  analysis: AnalysisCache[];
  packages: PackageCache[];
  templates: TemplateCache[];
  templateFiles: TemplateCacheFiles[];
  system: SystemCache | null;
  featureUsage: FeatureUsageCache;
  metadata: CacheMetadata;
}

export interface ProjectCache {
  path: string;
  name: string;
  language: string;
  framework?: string;
  dependencies: string[];
  features?: string[];
  lastAnalyzed: string;
  size: number;
  hash: string;
}

export interface AnalysisCache {
  projectPath: string;
  stats: any;
  timestamp: string;
  hash: string;
}

export interface PackageCache {
  name: string;
  version: string;
  latestVersion: string;
  lastChecked: string;
  updateAvailable: boolean;
}

export interface TemplateCache {
  name: string;
  framework: string;
  language: string;
  features: string[];
  lastUsed: string;
  usageCount: number;
}

export interface FeatureUsageCache {
  [featureName: string]: {
    count: number;
    frameworks: Record<string, number>;
    lastUsed: string;
  };
}

export interface TemplateCacheFiles {
  templateName: string;
  templatePath: string;
  files: Record<string, string>; // filename -> content
  lastCached: string;
  size: number;
}

export interface SystemCache {
  os: string;
  nodeVersion: string;
  packageManagers: Record<string, string>;
  installedTools: Record<string, string>;
  lastUpdated: string;
}

export interface CacheMetadata {
  version: string;
  created: string;
  lastAccessed: string;
  totalHits: number;
  totalMisses: number;
}

/**
 * Cache Manager Class
 */
export class CacheManager {
  private cacheDir: string;
  private cacheFile: string;
  private cache: CacheData;

  constructor() {
    this.cacheDir = path.join(os.homedir(), '.pi-cache');
    this.cacheFile = path.join(this.cacheDir, 'cache.json');
    this.cache = this.getDefaultCache();
  }

  /**
   * Initialize cache system
   */
  async init(): Promise<void> {
    try {
      await fs.ensureDir(this.cacheDir);
      
      if (await fs.pathExists(this.cacheFile)) {
        const data = await fs.readJson(this.cacheFile);
        this.cache = { ...this.getDefaultCache(), ...data };
      } else {
        await this.save();
      }

      // Update last accessed time
      this.cache.metadata.lastAccessed = new Date().toISOString();
      await this.save();
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Cache initialization failed, using memory cache'));
      this.cache = this.getDefaultCache();
    }
  }

  /**
   * Get default cache structure
   */
  private getDefaultCache(): CacheData {
    return {
      projects: [],
      analysis: [],
      packages: [],
      templates: [],
      templateFiles: [],
      system: null,
      featureUsage: {},
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        totalHits: 0,
        totalMisses: 0
      }
    };
  }

  /**
   * Save cache to disk
   */
  private async save(): Promise<void> {
    try {
      await fs.writeJson(this.cacheFile, this.cache, { spaces: 2 });
    } catch (error) {
      // Silent fail - cache will work in memory
    }
  }

  /**
   * Generate hash for cache keys
   */
  private generateHash(data: any): string {
    return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16);
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(timestamp: string, maxAgeHours: number = 24): boolean {
    const cacheTime = new Date(timestamp).getTime();
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
    return (now - cacheTime) > maxAge;
  }

  /**
   * PROJECT CACHE METHODS
   */

  /**
   * Get cached project data
   */
  async getProject(projectPath: string): Promise<ProjectCache | null> {
    const project = this.cache.projects.find(p => p.path === projectPath);
    
    if (project && !this.isExpired(project.lastAnalyzed, 6)) { // 6 hours cache
      this.cache.metadata.totalHits++;
      await this.save();
      return project;
    }

    this.cache.metadata.totalMisses++;
    return null;
  }

  /**
   * Cache project data
   */
  async setProject(projectData: Omit<ProjectCache, 'lastAnalyzed' | 'hash'>): Promise<void> {
    const hash = this.generateHash({ path: projectData.path, dependencies: projectData.dependencies });
    
    const project: ProjectCache = {
      ...projectData,
      lastAnalyzed: new Date().toISOString(),
      hash
    };

    // Remove existing entry
    this.cache.projects = this.cache.projects.filter(p => p.path !== project.path);
    
    // Add new entry
    this.cache.projects.unshift(project);
    
    // Keep only recent 50 projects
    if (this.cache.projects.length > 50) {
      this.cache.projects = this.cache.projects.slice(0, 50);
    }

    await this.save();
  }

  /**
   * ANALYSIS CACHE METHODS
   */

  /**
   * Get cached analysis data
   */
  async getAnalysis(projectPath: string): Promise<AnalysisCache | null> {
    const analysis = this.cache.analysis.find(a => a.projectPath === projectPath);
    
    if (analysis && !this.isExpired(analysis.timestamp, 2)) { // 2 hours cache
      this.cache.metadata.totalHits++;
      await this.save();
      return analysis;
    }

    this.cache.metadata.totalMisses++;
    return null;
  }

  /**
   * Cache analysis data
   */
  async setAnalysis(projectPath: string, stats: any): Promise<void> {
    const hash = this.generateHash({ projectPath, stats });
    
    const analysis: AnalysisCache = {
      projectPath,
      stats,
      timestamp: new Date().toISOString(),
      hash
    };

    // Remove existing entry
    this.cache.analysis = this.cache.analysis.filter(a => a.projectPath !== projectPath);
    
    // Add new entry
    this.cache.analysis.unshift(analysis);
    
    // Keep only recent 30 analyses
    if (this.cache.analysis.length > 30) {
      this.cache.analysis = this.cache.analysis.slice(0, 30);
    }

    await this.save();
  }

  /**
   * PACKAGE CACHE METHODS
   */

  /**
   * Get cached package data
   */
  async getPackage(packageName: string): Promise<PackageCache | null> {
    const pkg = this.cache.packages.find(p => p.name === packageName);
    
    if (pkg && !this.isExpired(pkg.lastChecked, 1)) { // 1 hour cache
      this.cache.metadata.totalHits++;
      await this.save();
      return pkg;
    }

    this.cache.metadata.totalMisses++;
    return null;
  }

  /**
   * Cache package data
   */
  async setPackage(packageData: Omit<PackageCache, 'lastChecked'>): Promise<void> {
    const pkg: PackageCache = {
      ...packageData,
      lastChecked: new Date().toISOString()
    };

    // Remove existing entry
    this.cache.packages = this.cache.packages.filter(p => p.name !== pkg.name);
    
    // Add new entry
    this.cache.packages.unshift(pkg);
    
    // Keep only recent 200 packages
    if (this.cache.packages.length > 200) {
      this.cache.packages = this.cache.packages.slice(0, 200);
    }

    await this.save();
  }

  /**
   * TEMPLATE FILE CACHE METHODS
   */

  /**
   * Get cached template files
   */
  async getTemplateFiles(templateName: string): Promise<TemplateCacheFiles | null> {
    const template = this.cache.templateFiles.find(t => t.templateName === templateName);
    
    if (template && !this.isExpired(template.lastCached, 168)) { // 7 days cache
      this.cache.metadata.totalHits++;
      await this.save();
      return template;
    }

    this.cache.metadata.totalMisses++;
    return null;
  }

  /**
   * Cache template files
   */
  async setTemplateFiles(templateData: Omit<TemplateCacheFiles, 'lastCached'>): Promise<void> {
    const template: TemplateCacheFiles = {
      ...templateData,
      lastCached: new Date().toISOString()
    };

    // Remove existing entry
    this.cache.templateFiles = this.cache.templateFiles.filter(t => t.templateName !== template.templateName);
    
    // Add new entry
    this.cache.templateFiles.unshift(template);
    
    // Keep only recent 10 templates
    if (this.cache.templateFiles.length > 10) {
      this.cache.templateFiles = this.cache.templateFiles.slice(0, 10);
    }

    await this.save();
  }

  /**
   * SYSTEM CACHE METHODS
   */

  /**
   * Get cached system data
   */
  async getSystem(): Promise<SystemCache | null> {
    if (this.cache.system && !this.isExpired(this.cache.system.lastUpdated, 24)) { // 24 hours cache
      this.cache.metadata.totalHits++;
      await this.save();
      return this.cache.system;
    }

    this.cache.metadata.totalMisses++;
    return null;
  }

  /**
   * Cache system data
   */
  async setSystem(systemData: Omit<SystemCache, 'lastUpdated'>): Promise<void> {
    this.cache.system = {
      ...systemData,
      lastUpdated: new Date().toISOString()
    };

    await this.save();
  }

  /**
   * TEMPLATE CACHE METHODS
   */

  /**
   * Get template usage stats
   */
  getTemplateStats(): TemplateCache[] {
    return this.cache.templates.sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Update template usage
   */
  async updateTemplateUsage(templateName: string, framework: string, language: string, features: string[]): Promise<void> {
    let template = this.cache.templates.find(t => t.name === templateName);
    
    if (template) {
      template.usageCount++;
      template.lastUsed = new Date().toISOString();
      template.features = features;
    } else {
      template = {
        name: templateName,
        framework,
        language,
        features,
        lastUsed: new Date().toISOString(),
        usageCount: 1
      };
      this.cache.templates.push(template);
    }

    await this.save();
  }

  /**
   * UTILITY METHODS
   */

  /**
   * Get cache statistics
   */
  getStats(): { hits: number; misses: number; hitRate: string; size: string; projects: number; packages: number } {
    const total = this.cache.metadata.totalHits + this.cache.metadata.totalMisses;
    const hitRate = total > 0 ? ((this.cache.metadata.totalHits / total) * 100).toFixed(1) : '0.0';
    
    return {
      hits: this.cache.metadata.totalHits,
      misses: this.cache.metadata.totalMisses,
      hitRate: `${hitRate}%`,
      size: `${(JSON.stringify(this.cache).length / 1024).toFixed(1)} KB`,
      projects: this.cache.projects.length,
      packages: this.cache.packages.length
    };
  }

  /**
   * Clear specific cache type
   */
  async clearCache(type?: 'projects' | 'analysis' | 'packages' | 'templates' | 'templateFiles' | 'system' | 'all'): Promise<void> {
    switch (type) {
      case 'projects':
        this.cache.projects = [];
        break;
      case 'analysis':
        this.cache.analysis = [];
        break;
      case 'packages':
        this.cache.packages = [];
        break;
      case 'templates':
        this.cache.templates = [];
        break;
      case 'templateFiles':
        this.cache.templateFiles = [];
        break;
      case 'system':
        this.cache.system = null;
        break;
      case 'all':
      default:
        this.cache = this.getDefaultCache();
        break;
    }

    await this.save();
  }

  /**
   * Get all cached projects
   */
  getAllProjects(): ProjectCache[] {
    return this.cache.projects;
  }

  /**
   * Get recent projects (last 10)
   */
  getRecentProjects(): ProjectCache[] {
    return this.cache.projects.slice(0, 10);
  }

  /**
   * Get cache data
   */
  getCache(): CacheData {
    return this.cache;
  }

  /**
   * Save cache data
   */
  async saveCache(cacheData: CacheData): Promise<void> {
    this.cache = cacheData;
    await this.save();
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
