/**
 * History Manager - Track CLI usage and store frameworks/features in hidden CLI folder
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import crypto from 'crypto';

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
  name: string;
  projectPath: string;
  projectName: string;
  framework: string;
  provider?: string;
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

export interface CloneHistoryEntry {
  repository: string;
  projectName: string;
  provider: string;
  clonedAt: string;
  success: boolean;
  error?: string;
}

export interface FrameworkUsage {
  [framework: string]: {
    count: number;
    lastUsed: string;
    languages: Record<string, number>;
    templates: Record<string, number>;
  };
}

export interface FeatureUsage {
  [feature: string]: {
    count: number;
    lastUsed: string;
    frameworks: Record<string, number>;
    providers: Record<string, number>;
  };
}

export interface CLIHistory {
  version: string;
  lastUpdated: string;
  projects: ProjectHistoryEntry[];
  features: FeatureHistoryEntry[];
  commands: CommandHistoryEntry[];
  cloneHistory?: CloneHistoryEntry[];
  statistics: {
    totalProjects: number;
    totalFeatures: number;
    totalCommands: number;
    frameworkUsage: FrameworkUsage;
    featureUsage: FeatureUsage;
    mostUsedFramework: string;
    mostUsedFeature: string;
    lastUsed: string;
    totalUsageTime: number;
  };
}

export class HistoryManager {
  private cliDir: string;
  private historyFile: string;
  private frameworksFile: string;
  private featuresFile: string;
  private history: CLIHistory;

  constructor() {
    // Use the same hidden folder as other cache files
    this.cliDir = path.join(os.homedir(), '.package-installer-cli');
    this.historyFile = path.join(this.cliDir, 'history.json');
    this.frameworksFile = path.join(this.cliDir, 'frameworks.json');
    this.featuresFile = path.join(this.cliDir, 'features-usage.json');
    this.history = this.getDefaultHistory();
  }

  /**
   * Initialize history system
   */
  async init(): Promise<void> {
    try {
      await fs.ensureDir(this.cliDir);

      if (await fs.pathExists(this.historyFile)) {
        const data = await fs.readJson(this.historyFile);
        this.history = { ...this.getDefaultHistory(), ...data };
      } else {
        await this.save();
      }

      // Update last used timestamp
      this.history.statistics.lastUsed = new Date().toISOString();
      await this.save();

      // Initialize separate framework and feature files
      await this.initializeFrameworksFile();
      await this.initializeFeaturesFile();

    } catch (error) {
      console.warn(chalk.yellow('⚠️  History initialization failed, using memory history'));
      this.history = this.getDefaultHistory();
    }
  }

  /**
   * Initialize frameworks tracking file
   */
  private async initializeFrameworksFile(): Promise<void> {
    if (!await fs.pathExists(this.frameworksFile)) {
      const frameworks = {
        lastUpdated: new Date().toISOString(),
        frameworks: this.history.statistics.frameworkUsage
      };
      await fs.writeJson(this.frameworksFile, frameworks, { spaces: 2 });
    }
  }

  /**
   * Initialize features tracking file
   */
  private async initializeFeaturesFile(): Promise<void> {
    if (!await fs.pathExists(this.featuresFile)) {
      const features = {
        lastUpdated: new Date().toISOString(),
        features: this.history.statistics.featureUsage
      };
      await fs.writeJson(this.featuresFile, features, { spaces: 2 });
    }
  }

  /**
   * Get default history structure
   */
  private getDefaultHistory(): CLIHistory {
    return {
      version: '3.0.0',
      lastUpdated: new Date().toISOString(),
      projects: [],
      features: [],
      commands: [],
      statistics: {
        totalProjects: 0,
        totalFeatures: 0,
        totalCommands: 0,
        frameworkUsage: {},
        featureUsage: {},
        mostUsedFramework: '',
        mostUsedFeature: '',
        lastUsed: new Date().toISOString(),
        totalUsageTime: 0
      }
    };
  }

  /**
   * Record a new project creation
   */
  async recordProject(project: {
    name: string;
    path: string;
    framework: string;
    language: string;
    template?: string;
    features?: string[];
  }): Promise<void> {
    const id = this.generateId();
    const now = new Date().toISOString();

    const projectEntry: ProjectHistoryEntry = {
      id,
      name: project.name,
      path: project.path,
      framework: project.framework,
      language: project.language,
      template: project.template,
      features: project.features || [],
      createdAt: now,
      lastModified: now,
      size: 0,
      dependencies: []
    };

    this.history.projects.unshift(projectEntry);

    // Update statistics
    this.history.statistics.totalProjects++;
    this.updateFrameworkUsage(project.framework, project.language, project.template);

    await this.save();
    await this.saveFrameworksFile();
  }

  /**
   * Record a feature addition
   */
  async recordFeature(feature: {
    name: string;
    projectPath: string;
    projectName: string;
    framework: string;
    provider?: string;
    success?: boolean;
  }): Promise<void> {
    const id = this.generateId();
    const now = new Date().toISOString();

    const featureEntry: FeatureHistoryEntry = {
      id,
      name: feature.name,
      projectPath: feature.projectPath,
      projectName: feature.projectName,
      framework: feature.framework,
      provider: feature.provider,
      addedAt: now,
      success: feature.success !== false
    };

    this.history.features.unshift(featureEntry);

    // Update project to include the feature
    const project = this.history.projects.find(p => p.path === feature.projectPath);
    if (project && !project.features.includes(feature.name)) {
      project.features.push(feature.name);
      project.lastModified = now;
    }

    // Update statistics
    this.history.statistics.totalFeatures++;
    this.updateFeatureUsage(feature.name, feature.framework, feature.provider);

    await this.save();
    await this.saveFeaturesFile();
  }

  /**
   * Record a command execution
   */
  async recordCommand(command: {
    command: string;
    args: string[];
    success: boolean;
    executionTime: number;
  }): Promise<void> {
    const id = this.generateId();
    const now = new Date().toISOString();

    const commandEntry: CommandHistoryEntry = {
      id,
      command: command.command,
      args: command.args,
      executedAt: now,
      success: command.success,
      executionTime: command.executionTime,
      workingDirectory: process.cwd()
    };

    this.history.commands.unshift(commandEntry);

    // Keep only last 100 commands
    if (this.history.commands.length > 100) {
      this.history.commands = this.history.commands.slice(0, 100);
    }

    // Update statistics
    this.history.statistics.totalCommands++;
    this.history.statistics.totalUsageTime += command.executionTime;

    await this.save();
  }

  /**
   * Update framework usage statistics
   */
  private updateFrameworkUsage(framework: string, language: string, template?: string): void {
    if (!this.history.statistics.frameworkUsage[framework]) {
      this.history.statistics.frameworkUsage[framework] = {
        count: 0,
        lastUsed: new Date().toISOString(),
        languages: {},
        templates: {}
      };
    }

    const fw = this.history.statistics.frameworkUsage[framework];
    fw.count++;
    fw.lastUsed = new Date().toISOString();

    if (!fw.languages[language]) {
      fw.languages[language] = 0;
    }
    fw.languages[language]++;

    if (template && !fw.templates[template]) {
      fw.templates[template] = 0;
    }
    if (template) {
      fw.templates[template]++;
    }

    // Update most used framework
    const frameworks = Object.entries(this.history.statistics.frameworkUsage);
    const mostUsed = frameworks.reduce((prev, curr) =>
      prev[1].count > curr[1].count ? prev : curr
    );
    this.history.statistics.mostUsedFramework = mostUsed[0];
  }

  /**
   * Update feature usage statistics
   */
  private updateFeatureUsage(feature: string, framework: string, provider?: string): void {
    if (!this.history.statistics.featureUsage[feature]) {
      this.history.statistics.featureUsage[feature] = {
        count: 0,
        lastUsed: new Date().toISOString(),
        frameworks: {},
        providers: {}
      };
    }

    const feat = this.history.statistics.featureUsage[feature];
    feat.count++;
    feat.lastUsed = new Date().toISOString();

    if (!feat.frameworks[framework]) {
      feat.frameworks[framework] = 0;
    }
    feat.frameworks[framework]++;

    if (provider) {
      if (!feat.providers[provider]) {
        feat.providers[provider] = 0;
      }
      feat.providers[provider]++;
    }

    // Update most used feature
    const features = Object.entries(this.history.statistics.featureUsage);
    if (features.length > 0) {
      const mostUsed = features.reduce((prev, curr) =>
        prev[1].count > curr[1].count ? prev : curr
      );
      this.history.statistics.mostUsedFeature = mostUsed[0];
    }
  }

  /**
   * Save frameworks data to separate file
   */
  private async saveFrameworksFile(): Promise<void> {
    const frameworks = {
      lastUpdated: new Date().toISOString(),
      frameworks: this.history.statistics.frameworkUsage
    };
    await fs.writeJson(this.frameworksFile, frameworks, { spaces: 2 });
  }

  /**
   * Save features data to separate file
   */
  private async saveFeaturesFile(): Promise<void> {
    const features = {
      lastUpdated: new Date().toISOString(),
      features: this.history.statistics.featureUsage
    };
    await fs.writeJson(this.featuresFile, features, { spaces: 2 });
  }

  /**
   * Get recent projects
   */
  getRecentProjects(limit: number = 10): ProjectHistoryEntry[] {
    return this.history.projects
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, limit);
  }

  /**
   * Get recent features
   */
  getRecentFeatures(limit: number = 10): FeatureHistoryEntry[] {
    return this.history.features
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get framework usage statistics
   */
  getFrameworkStats(): { framework: string; count: number; languages: string[]; lastUsed: string }[] {
    return Object.entries(this.history.statistics.frameworkUsage)
      .map(([framework, data]) => ({
        framework,
        count: data.count,
        languages: Object.keys(data.languages),
        lastUsed: data.lastUsed
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get feature usage statistics
   */
  getFeatureStats(): { feature: string; count: number; frameworks: string[]; lastUsed: string }[] {
    return Object.entries(this.history.statistics.featureUsage)
      .map(([feature, data]) => ({
        feature,
        count: data.count,
        frameworks: Object.keys(data.frameworks),
        lastUsed: data.lastUsed
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get command usage statistics
   */
  getCommandStats(): { command: string; count: number; lastUsed: string }[] {
    const commandCounts: Record<string, { count: number; lastUsed: string }> = {};

    this.history.commands.forEach(cmd => {
      if (!commandCounts[cmd.command]) {
        commandCounts[cmd.command] = { count: 0, lastUsed: cmd.executedAt };
      }
      commandCounts[cmd.command].count++;
      if (new Date(cmd.executedAt) > new Date(commandCounts[cmd.command].lastUsed)) {
        commandCounts[cmd.command].lastUsed = cmd.executedAt;
      }
    });

    return Object.entries(commandCounts)
      .map(([command, data]) => ({
        command,
        count: data.count,
        lastUsed: data.lastUsed
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get complete history
   */
  getHistory(): CLIHistory {
    return this.history;
  }

  /**
   * Save history to file
   */
  private async save(): Promise<void> {
    this.history.lastUpdated = new Date().toISOString();
    await fs.writeJson(this.historyFile, this.history, { spaces: 2 });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Clear history (with backup)
   */
  async clearHistory(): Promise<void> {
    // Create backup
    const backupFile = path.join(this.cliDir, `history-backup-${Date.now()}.json`);
    if (await fs.pathExists(this.historyFile)) {
      await fs.copy(this.historyFile, backupFile);
    }

    // Reset history
    this.history = this.getDefaultHistory();
    await this.save();

    // Clear separate files
    await fs.remove(this.frameworksFile);
    await fs.remove(this.featuresFile);
    await this.initializeFrameworksFile();
    await this.initializeFeaturesFile();
  }

  /**
   * Export history data
   */
  async exportHistory(outputPath: string): Promise<void> {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: this.history.version,
      history: this.history,
      frameworks: await this.loadFrameworksFile(),
      features: await this.loadFeaturesFile()
    };

    await fs.writeJson(outputPath, exportData, { spaces: 2 });
  }

  /**
   * Load frameworks data
   */
  private async loadFrameworksFile(): Promise<any> {
    try {
      if (await fs.pathExists(this.frameworksFile)) {
        return await fs.readJson(this.frameworksFile);
      }
    } catch (error) {
      console.warn('Could not load frameworks file');
    }
    return { frameworks: {} };
  }

  /**
   * Load features data
   */
  private async loadFeaturesFile(): Promise<any> {
    try {
      if (await fs.pathExists(this.featuresFile)) {
        return await fs.readJson(this.featuresFile);
      }
    } catch (error) {
      console.warn('Could not load features file');
    }
    return { features: {} };
  }

  /**
   * Add clone history entry
   */
  async addCloneHistory(entry: CloneHistoryEntry): Promise<void> {
    try {
      await this.init();

      // Create unique ID for the clone entry
      const id = crypto.randomBytes(8).toString('hex');

      // Add to history with ID
      const historyEntry = {
        id,
        ...entry
      };

      this.history.cloneHistory = this.history.cloneHistory || [];
      this.history.cloneHistory.unshift(historyEntry);

      // Keep only last 50 clone entries
      if (this.history.cloneHistory.length > 50) {
        this.history.cloneHistory = this.history.cloneHistory.slice(0, 50);
      }

      // Update statistics
      if (entry.success) {
        this.history.statistics.totalProjects++;
      }

      // Save to file
      await this.save();

    } catch (error: any) {
      console.error(chalk.red('Failed to add clone history:'), error.message);
    }
  }

  /**
   * Get clone history
   */
  async getCloneHistory(): Promise<CloneHistoryEntry[]> {
    try {
      await this.init();
      return this.history.cloneHistory || [];
    } catch (error) {
      console.error('Failed to get clone history');
      return [];
    }
  }

  /**
   * Get recent clone history (last 10)
   */
  async getRecentClones(): Promise<CloneHistoryEntry[]> {
    const history = await this.getCloneHistory();
    return history.slice(0, 10);
  }
}

// Export singleton instance
export const historyManager = new HistoryManager();
