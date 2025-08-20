/**
 * History Manager - Track CLI usage for analytics
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

export interface ProjectHistoryEntry {
  id: string;
  name: string;
  path: string;
  framework: string;
  language: string;
  template?: string;
  features: string[];
  createdAt: string;
  lastModified: string;
  size: number;
  dependencies: string[];
}

export interface FeatureHistoryEntry {
  id: string;
  feature: string;
  projectPath: string;
  projectName: string;
  framework: string;
  addedAt: string;
  success: boolean;
}

export interface CommandHistoryEntry {
  id: string;
  command: string;
  args: string[];
  executedAt: string;
  success: boolean;
  executionTime: number;
  workingDirectory: string;
}

export interface CLIHistory {
  version: string;
  lastUpdated: string;
  projects: ProjectHistoryEntry[];
  features: FeatureHistoryEntry[];
  commands: CommandHistoryEntry[];
  statistics: {
    totalProjectsCreated: number;
    totalFeaturesAdded: number;
    totalCommandsExecuted: number;
    mostUsedFramework: string;
    mostUsedLanguage: string;
    mostUsedFeature: string;
    lastUsed: string;
  };
}

export class HistoryManager {
  private historyDir: string;
  private historyFile: string;
  private history: CLIHistory;

  constructor() {
    this.historyDir = path.join(os.homedir(), '.pi-cache');
    this.historyFile = path.join(this.historyDir, '.pi-history.json');
    this.history = this.getDefaultHistory();
  }

  /**
   * Initialize history system
   */
  async init(): Promise<void> {
    try {
      await fs.ensureDir(this.historyDir);
      
      if (await fs.pathExists(this.historyFile)) {
        const data = await fs.readJson(this.historyFile);
        this.history = { ...this.getDefaultHistory(), ...data };
      } else {
        await this.save();
      }

      // Update last used timestamp
      this.history.statistics.lastUsed = new Date().toISOString();
      await this.save();
    } catch (error) {
      console.warn(chalk.yellow('⚠️  History initialization failed, using memory history'));
      this.history = this.getDefaultHistory();
    }
  }

  /**
   * Get default history structure
   */
  private getDefaultHistory(): CLIHistory {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      projects: [],
      features: [],
      commands: [],
      statistics: {
        totalProjectsCreated: 0,
        totalFeaturesAdded: 0,
        totalCommandsExecuted: 0,
        mostUsedFramework: '',
        mostUsedLanguage: '',
        mostUsedFeature: '',
        lastUsed: new Date().toISOString()
      }
    };
  }

  /**
   * Save history to disk
   */
  private async save(): Promise<void> {
    try {
      this.history.lastUpdated = new Date().toISOString();
      await fs.writeJson(this.historyFile, this.history, { spaces: 2 });
    } catch (error) {
      // Silent fail - history will work in memory
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Record project creation
   */
  async recordProject(projectData: {
    name: string;
    path: string;
    framework: string;
    language: string;
    template?: string;
    features?: string[];
    size: number;
    dependencies: string[];
  }): Promise<void> {
    const entry: ProjectHistoryEntry = {
      id: this.generateId(),
      name: projectData.name,
      path: projectData.path,
      framework: projectData.framework,
      language: projectData.language,
      template: projectData.template,
      features: projectData.features || [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      size: projectData.size,
      dependencies: projectData.dependencies
    };

    this.history.projects.push(entry);
    this.history.statistics.totalProjectsCreated++;
    
    // Update statistics
    this.updateStatistics();
    await this.save();
  }

  /**
   * Record feature addition
   */
  async recordFeature(featureData: {
    feature: string;
    projectPath: string;
    projectName: string;
    framework: string;
    success: boolean;
  }): Promise<void> {
    const entry: FeatureHistoryEntry = {
      id: this.generateId(),
      feature: featureData.feature,
      projectPath: featureData.projectPath,
      projectName: featureData.projectName,
      framework: featureData.framework,
      addedAt: new Date().toISOString(),
      success: featureData.success
    };

    this.history.features.push(entry);
    if (featureData.success) {
      this.history.statistics.totalFeaturesAdded++;
    }
    
    this.updateStatistics();
    await this.save();
  }

  /**
   * Record command execution
   */
  async recordCommand(commandData: {
    command: string;
    args: string[];
    success: boolean;
    executionTime: number;
    workingDirectory: string;
  }): Promise<void> {
    const entry: CommandHistoryEntry = {
      id: this.generateId(),
      command: commandData.command,
      args: commandData.args,
      executedAt: new Date().toISOString(),
      success: commandData.success,
      executionTime: commandData.executionTime,
      workingDirectory: commandData.workingDirectory
    };

    this.history.commands.push(entry);
    this.history.statistics.totalCommandsExecuted++;
    
    this.updateStatistics();
    await this.save();
  }

  /**
   * Update statistics
   */
  private updateStatistics(): void {
    // Most used framework
    const frameworkCounts = new Map<string, number>();
    this.history.projects.forEach(project => {
      const count = frameworkCounts.get(project.framework) || 0;
      frameworkCounts.set(project.framework, count + 1);
    });
    
    let maxFramework = '';
    let maxFrameworkCount = 0;
    frameworkCounts.forEach((count, framework) => {
      if (count > maxFrameworkCount) {
        maxFrameworkCount = count;
        maxFramework = framework;
      }
    });
    this.history.statistics.mostUsedFramework = maxFramework;

    // Most used language
    const languageCounts = new Map<string, number>();
    this.history.projects.forEach(project => {
      const count = languageCounts.get(project.language) || 0;
      languageCounts.set(project.language, count + 1);
    });
    
    let maxLanguage = '';
    let maxLanguageCount = 0;
    languageCounts.forEach((count, language) => {
      if (count > maxLanguageCount) {
        maxLanguageCount = count;
        maxLanguage = language;
      }
    });
    this.history.statistics.mostUsedLanguage = maxLanguage;

    // Most used feature
    const featureCounts = new Map<string, number>();
    this.history.features.forEach(feature => {
      if (feature.success) {
        const count = featureCounts.get(feature.feature) || 0;
        featureCounts.set(feature.feature, count + 1);
      }
    });
    
    let maxFeature = '';
    let maxFeatureCount = 0;
    featureCounts.forEach((count, feature) => {
      if (count > maxFeatureCount) {
        maxFeatureCount = count;
        maxFeature = feature;
      }
    });
    this.history.statistics.mostUsedFeature = maxFeature;
  }

  /**
   * Get history data
   */
  getHistory(): CLIHistory {
    return this.history;
  }

  /**
   * Get recent projects
   */
  getRecentProjects(limit: number = 10): ProjectHistoryEntry[] {
    return this.history.projects
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get feature usage statistics
   */
  getFeatureStats(): Array<{ feature: string; count: number; frameworks: string[] }> {
    const stats = new Map<string, { count: number; frameworks: Set<string> }>();
    
    this.history.features
      .filter(f => f.success)
      .forEach(feature => {
        if (!stats.has(feature.feature)) {
          stats.set(feature.feature, { count: 0, frameworks: new Set() });
        }
        
        const stat = stats.get(feature.feature)!;
        stat.count++;
        stat.frameworks.add(feature.framework);
      });

    return Array.from(stats.entries())
      .map(([feature, data]) => ({
        feature,
        count: data.count,
        frameworks: Array.from(data.frameworks)
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get framework usage statistics
   */
  getFrameworkStats(): Array<{ framework: string; count: number; percentage: number }> {
    const total = this.history.projects.length;
    if (total === 0) return [];

    const stats = new Map<string, number>();
    this.history.projects.forEach(project => {
      const count = stats.get(project.framework) || 0;
      stats.set(project.framework, count + 1);
    });

    return Array.from(stats.entries())
      .map(([framework, count]) => ({
        framework,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Clear history (with backup)
   */
  async clearHistory(): Promise<void> {
    // Create backup
    const backupFile = path.join(this.historyDir, `.pi-history-backup-${Date.now()}.json`);
    await fs.copy(this.historyFile, backupFile);
    
    // Reset history
    this.history = this.getDefaultHistory();
    await this.save();
  }

  /**
   * Check if cache should restart (5 hours)
   */
  shouldRestartCache(): boolean {
    const lastUsed = new Date(this.history.statistics.lastUsed).getTime();
    const now = Date.now();
    const fiveHours = 5 * 60 * 60 * 1000;
    
    return (now - lastUsed) > fiveHours;
  }
}

// Export singleton instance
export const historyManager = new HistoryManager();
