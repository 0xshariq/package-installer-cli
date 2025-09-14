/**
 * Analyze command - Advanced terminal dashboard showing CLI usage analytics
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import gradientString from 'gradient-string';
import boxen from 'boxen';
import { 
  createBanner, 
  displaySystemInfo,
  displaySuccessMessage
} from '../utils/dashboard.js';
import { HistoryManager } from '../utils/historyManager.js';

/**
 * Display help for analyze command
 */
export function showAnalyzeHelp(): void {
  console.clear();
  
  const helpContent = boxen(
    gradientString(['#667eea', '#764ba2'])('📊 Analyze Command Help') + '\n\n' +
    chalk.white('Display comprehensive CLI usage analytics and project dashboard') + '\n\n' +
    
    chalk.cyan('Usage:') + '\n' +
    chalk.white('  pi analyze [options]') + '\n' +
    
    chalk.cyan('Description:') + '\n' +
    chalk.white('  Interactive dashboard showing CLI usage statistics, project') + '\n' +
    chalk.white('  analytics, recent activities, and system information.') + '\n\n' +
    
    chalk.cyan('Options:') + '\n' +
    chalk.white('  --export') + chalk.gray('      Export analytics data to JSON file') + '\n' +
    chalk.white('  --reset') + chalk.gray('       Reset analytics history') + '\n' +
    chalk.white('  -h, --help') + chalk.gray('    Show this help message') + '\n\n' +
    
    chalk.cyan('Features:') + '\n' +
    chalk.green('  📈 Usage Statistics') + chalk.gray('   Command usage frequency and trends') + '\n' +
    chalk.green('  🚀 Project Analytics') + chalk.gray('  Created projects and framework breakdown') + '\n' +
    chalk.green('  📁 Recent Projects') + chalk.gray('   Last created/modified projects') + '\n' +
    chalk.green('  ⚙️  System Information') + chalk.gray('  Development environment overview') + '\n\n' +
    
    chalk.cyan('Examples:') + '\n' +
    chalk.white('  pi analyze') + chalk.gray('           Show complete analytics dashboard') + '\n' +
    chalk.white('  pi analyze --export') + chalk.gray('  Export analytics data to JSON') + '\n' +
    chalk.white('  pi analyze --reset') + chalk.gray('   Clear all analytics history') + '\n\n' +
    
    chalk.yellow('💡 Tip: Analytics data is collected from history.json'),
    {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'magenta',
      backgroundColor: '#000000'
    }
  );
  
  console.log(helpContent);
}

/**
 * Main analyze command function
 */
export async function analyzeCommand(options: any = {}): Promise<void> {
  // Show help if help flag is present
  if (options.help || options['--help'] || options['-h']) {
    showAnalyzeHelp();
    return;
  }

  createBanner('Analytics Dashboard');

  const historyManager = new HistoryManager();
  
  try {
    // Load analytics data from history.json
    const historyData = await loadAnalyticsData();
    
    // Handle specific options
    if (options.export) {
      await exportAnalyticsData(historyData);
      return;
    }
    
    if (options.reset) {
      await resetAnalyticsData();
      return;
    }

    // Display dashboard
    await displayAnalyticsDashboard(historyData);
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to load analytics:'), error);
    displaySuccessMessage(
      'Analytics Dashboard',
      ['No data available yet', 'Start using the CLI to see analytics!']
    );
  }
}

/**
 * Load analytics data from history.json
 */
async function loadAnalyticsData(): Promise<any> {
  const historyPath = path.join(os.homedir(), '.package-installer-cli', 'history.json');
  
  if (!await fs.pathExists(historyPath)) {
    return {
      commands: {},
      projects: [],
      features: [],
      statistics: {
        totalCommands: 0,
        totalProjects: 0,
        totalFeatures: 0,
        frameworks: {},
        languages: {}
      }
    };
  }
  
  return await fs.readJson(historyPath);
}

/**
 * Display analytics dashboard
 */
async function displayAnalyticsDashboard(data: any): Promise<void> {
  console.log('\n');
  
  // Display command usage statistics
  displayCommandStatistics(data);
  
  // Display project statistics
  displayProjectStatistics(data);
  
  // Display recent activity
  displayRecentActivity(data);
  
  // Display system info
  displaySystemInfo();
}

/**
 * Display command usage statistics
 */
function displayCommandStatistics(data: any): void {
  const commands = data.commands || {};
  const totalCommands = data.statistics?.totalCommands || 0;
  
  console.log(boxen(
    gradientString(['#4facfe', '#00f2fe'])('📊 Command Usage Statistics') + '\n\n' +
    (totalCommands > 0 
      ? Object.entries(commands)
          .sort(([,a]: any, [,b]: any) => b - a)
          .slice(0, 5)
          .map(([cmd, count]: any) => 
            chalk.white(`  ${cmd.padEnd(12)} `) + 
            chalk.cyan('█'.repeat(Math.min(count, 20))) + 
            chalk.gray(` ${count}`)
          ).join('\n')
      : chalk.gray('  No command data available yet')
    ),
    {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));
}

/**
 * Display project statistics
 */
function displayProjectStatistics(data: any): void {
  const projects = data.projects || [];
  const frameworks = data.statistics?.frameworks || {};
  const languages = data.statistics?.languages || {};
  
  console.log(boxen(
    gradientString(['#ff6b6b', '#feca57'])('🚀 Project Statistics') + '\n\n' +
    chalk.white(`Total Projects: `) + chalk.cyan(projects.length) + '\n\n' +
    (Object.keys(frameworks).length > 0 
      ? chalk.white('Top Frameworks:\n') +
        Object.entries(frameworks)
          .sort(([,a]: any, [,b]: any) => b - a)
          .slice(0, 3)
          .map(([fw, count]: any) => chalk.white(`  ${fw}: `) + chalk.green(count))
          .join('\n') + '\n\n'
      : chalk.gray('No framework data\n\n')
    ) +
    (Object.keys(languages).length > 0
      ? chalk.white('Languages Used:\n') +
        Object.entries(languages)
          .sort(([,a]: any, [,b]: any) => b - a)
          .slice(0, 3)
          .map(([lang, count]: any) => chalk.white(`  ${lang}: `) + chalk.yellow(count))
          .join('\n')
      : chalk.gray('No language data')
    ),
    {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'yellow'
    }
  ));
}

/**
 * Display recent activity
 */
function displayRecentActivity(data: any): void {
  const projects = data.projects || [];
  const recentProjects = projects
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);
    
  console.log(boxen(
    gradientString(['#a8edea', '#fed6e3'])('📁 Recent Activity') + '\n\n' +
    (recentProjects.length > 0
      ? recentProjects
          .map((project: any) => 
            chalk.white(`  ${project.name || 'Unknown'} `) +
            chalk.gray(`(${project.framework || 'unknown'})`) +
            (project.createdAt ? '\n    ' + chalk.dim(new Date(project.createdAt).toLocaleDateString()) : '')
          ).join('\n')
      : chalk.gray('  No recent projects')
    ),
    {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'magenta'
    }
  ));
}

/**
 * Export analytics data
 */
async function exportAnalyticsData(data: any): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `analytics-export-${timestamp}.json`;
  
  await fs.writeJson(filename, data, { spaces: 2 });
  
  displaySuccessMessage(
    'Analytics data exported',
    [`Saved to ${filename}`, 'Contains all CLI usage statistics and project data']
  );
}

/**
 * Reset analytics data
 */
async function resetAnalyticsData(): Promise<void> {
  const historyPath = path.join(os.homedir(), '.package-installer-cli', 'history.json');
  
  const emptyData = {
    commands: {},
    projects: [],
    features: [],
    statistics: {
      totalCommands: 0,
      totalProjects: 0,
      totalFeatures: 0,
      frameworks: {},
      languages: {}
    }
  };
  
  await fs.ensureDir(path.dirname(historyPath));
  await fs.writeJson(historyPath, emptyData, { spaces: 2 });
  
  displaySuccessMessage(
    'Analytics data reset',
    ['All usage statistics have been cleared', 'Fresh analytics will be collected from now on']
  );
}
