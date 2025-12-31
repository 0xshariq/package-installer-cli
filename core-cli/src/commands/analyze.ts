/**
 * Analyze command - Advanced terminal dashboard showing Package Installer CLI usage analytics
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import gradientString from 'gradient-string';
import boxen from 'boxen';
import { createStandardHelp, CommandHelpConfig } from '../utils/helpFormatter.js';
import { displayCommandBanner } from '../utils/banner.js';
import {
  createBanner,
  displaySystemInfo,
  displaySuccessMessage
} from '../utils/dashboard.js';
import { HistoryManager } from '../utils/historyManager.js';

/**
 * Display help for analyze command using standardized format
 */
export function showAnalyzeHelp(): void {
  const helpConfig: CommandHelpConfig = {
    commandName: 'Analyze',
    emoji: '📊',
    description: 'Display comprehensive CLI usage analytics and project dashboard.\nInteractive dashboard showing Package Installer CLI usage statistics, project analytics, recent activities, and development environment info.',
    usage: [
      'analyze [options]',
      'stats [options]   # alias'
    ],
    options: [
      { flag: '--export <method>', description: 'Export analytics data to specified file format (json, xml, yaml)' },
      { flag: '--reset', description: 'Reset analytics history' },
      { flag: '--detailed', description: 'Show detailed analytics breakdown' }
    ],
    examples: [
      { command: 'analyze', description: 'Show complete analytics dashboard' },
      { command: 'analyze --detailed', description: 'Show detailed breakdown with more metrics' },
      { command: 'analyze --export json', description: 'Export analytics data to JSON file' },
      { command: 'analyze --export xml', description: 'Export analytics data to XML file' },
      { command: 'analyze --export yaml', description: 'Export analytics data to YAML file' },
      { command: 'analyze --reset', description: 'Clear all analytics history' },
      { command: 'stats', description: 'Use alias command' }
    ],
    additionalSections: [
      {
        title: 'Features',
        items: [
          '📈 Command Usage Stats - Frequency and trends of CLI commands',
          '🚀 Project Analytics - Created projects and framework breakdown',
          '📁 Recent Activity - Last created/modified projects timeline',
          '🎯 Feature Usage - Most used features and integrations',
          '⚙️ Environment Info - Development environment overview',
          '📊 Performance - CLI performance metrics and insights'
        ]
      }
    ],
    tips: [
      'Analytics data is collected from ~/.package-installer-cli/history.json',
      'Use --export to backup your analytics data in JSON, XML, or YAML format',
      'Use --reset to start fresh analytics tracking'
    ]
  };

  createStandardHelp(helpConfig);
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

  displayCommandBanner('Analytics', 'Comprehensive project analytics and usage insights');

  const historyManager = new HistoryManager();

  try {
    // Load analytics data from history.json
    const historyData = await loadAnalyticsData();

    // Handle specific options
    if (options.export) {
      await exportAnalyticsData(historyData, options.export || 'json');
      return;
    }

    if (options.reset) {
      await resetAnalyticsData();
      return;
    }

    // Display dashboard
    if (options.detailed) {
      await displayDetailedAnalyticsDashboard(historyData);
    } else {
      await displayAnalyticsDashboard(historyData);
    }

  } catch (error) {
    console.error(chalk.red('❌ Failed to load analytics:'), error);
    displaySuccessMessage(
      'Package Installer CLI Analytics Dashboard',
      ['No data available yet - start using the CLI to see analytics!', 'Use commands like "pi create", "pi add", "pi clone" to generate data']
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

  // Show summary overview first
  displaySummaryOverview(data);

  // Display command usage statistics
  displayCommandStatistics(data);

  // Display project statistics
  displayProjectStatistics(data);

  // Display feature usage
  displayFeatureUsage(data);

  // Display recent activity
  displayRecentActivity(data);

  // Display performance insights
  displayPerformanceInsights(data);

  // Display system info
  displaySystemInfo();
}

/**
 * Display detailed analytics dashboard with more metrics
 */
async function displayDetailedAnalyticsDashboard(data: any): Promise<void> {
  console.log('\n');

  // Show summary overview first
  displaySummaryOverview(data);

  // Display command usage statistics with trends
  displayDetailedCommandStatistics(data);

  // Display detailed project statistics
  displayDetailedProjectStatistics(data);

  // Display feature usage breakdown
  displayDetailedFeatureUsage(data);

  // Display time-based analytics
  displayTimeBasedAnalytics(data);

  // Display recent activity with more details
  displayDetailedRecentActivity(data);

  // Display performance insights
  displayPerformanceInsights(data);

  // Display system info
  displaySystemInfo();
}

/**
 * Display summary overview with enhanced visual appeal
 */
function displaySummaryOverview(data: any): void {
  const totalCommands = data.statistics?.totalCommands || 0;
  const totalProjects = data.statistics?.totalProjects || 0;
  const totalFeatures = data.statistics?.totalFeatures || 0;
  const uniqueFrameworks = Object.keys(data.statistics?.frameworks || {}).length;
  const uniqueLanguages = Object.keys(data.statistics?.languages || {}).length;

  // Calculate productivity score
  const productivityScore = calculateProductivityScore(totalCommands, totalProjects, totalFeatures);
  const scoreColor = productivityScore >= 80 ? '#10ac84' : productivityScore >= 60 ? '#ffa502' : productivityScore >= 40 ? '#ff6b6b' : '#95afc0';

  const summaryContent =
    gradientString(['#e056fd', '#f18a8a'])('🚀 Package Installer CLI Analytics Dashboard') + '\n' +
    gradientString(['#74b9ff', '#0984e3'])('━'.repeat(60)) + '\n\n' +

    // Main metrics row
    chalk.hex('#00d2d3')('📈 OVERVIEW METRICS') + '\n\n' +
    `${chalk.white('⚡ Commands Executed:')} ${chalk.cyan.bold(totalCommands.toString().padStart(8))} ${getUsageEmoji(totalCommands)}\n` +
    `${chalk.white('🏗️  Projects Created: ')} ${chalk.green.bold(totalProjects.toString().padStart(8))} ${getProjectEmoji(totalProjects)}\n` +
    `${chalk.white('🎯 Features Added:   ')} ${chalk.yellow.bold(totalFeatures.toString().padStart(8))} ${getFeatureEmoji(totalFeatures)}\n` +
    `${chalk.white('🎨 Frameworks Used:  ')} ${chalk.blue.bold(uniqueFrameworks.toString().padStart(8))} ${getFrameworkEmoji(uniqueFrameworks)}\n` +
    `${chalk.white('🔤 Languages Used:   ')} ${chalk.magenta.bold(uniqueLanguages.toString().padStart(8))} ${getLanguageEmoji(uniqueLanguages)}\n\n` +

    // Productivity section
    chalk.hex('#ff6b6b')('🎯 PRODUCTIVITY SCORE') + '\n\n' +
    `${chalk.white('Overall Score:')} ${chalk.hex(scoreColor).bold(productivityScore + '/100')} ` +
    getScoreBar(productivityScore) + '\n' +
    chalk.gray(`${getProductivityMessage(productivityScore)}`) + '\n\n' +

    // Journey summary
    chalk.hex('#9c88ff')('✨ YOUR CODING JOURNEY') + '\n\n' +
    chalk.gray('You\'ve been building amazing projects with Package Installer CLI!\n') +
    chalk.gray(`Keep exploring new frameworks and features to boost your productivity.`);

  console.log(boxen(summaryContent, {
    padding: 2,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'double',
    borderColor: 'magenta',
    backgroundColor: '#1a1a2e'
  }));
}

// Helper functions for enhanced display
function getUsageEmoji(count: number): string {
  if (count >= 100) return '🔥';
  if (count >= 50) return '⚡';
  if (count >= 20) return '👍';
  if (count >= 5) return '🌱';
  return '🆕';
}

function getProjectEmoji(count: number): string {
  if (count >= 20) return '🏆';
  if (count >= 10) return '🎯';
  if (count >= 5) return '📈';
  if (count >= 1) return '🚀';
  return '💡';
}

function getFeatureEmoji(count: number): string {
  if (count >= 30) return '🌟';
  if (count >= 15) return '⭐';
  if (count >= 5) return '✨';
  if (count >= 1) return '💫';
  return '🔮';
}

function getFrameworkEmoji(count: number): string {
  if (count >= 5) return '🎨';
  if (count >= 3) return '🎭';
  if (count >= 2) return '🎪';
  if (count >= 1) return '🎨';
  return '🎁';
}

function getLanguageEmoji(count: number): string {
  if (count >= 4) return '🌈';
  if (count >= 3) return '🌊';
  if (count >= 2) return '🌟';
  if (count >= 1) return '💎';
  return '🔤';
}

function getScoreBar(score: number): string {
  const barLength = 20;
  const filled = Math.round((score / 100) * barLength);
  const empty = barLength - filled;

  let bar = '';
  if (score >= 80) {
    bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  } else if (score >= 60) {
    bar = chalk.yellow('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  } else if (score >= 40) {
    bar = chalk.red('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  } else {
    bar = chalk.gray('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  return `[${bar}]`;
}

function getProductivityMessage(score: number): string {
  if (score >= 90) return 'Outstanding! You\'re a CLI power user! 🏆';
  if (score >= 80) return 'Excellent productivity! Keep up the great work! 🌟';
  if (score >= 70) return 'Great job! You\'re making good use of the CLI 👏';
  if (score >= 60) return 'Good progress! Try exploring more features 📈';
  if (score >= 40) return 'Getting started! Consider using more commands 🚀';
  if (score >= 20) return 'Just beginning! Explore the help with "pi --help" 💡';
  return 'Welcome! Start your journey by creating your first project! 🌱';
}

/**
 * Display command usage statistics with enhanced visuals
 */
function displayCommandStatistics(data: any): void {
  const commands = data.commands || {};
  const totalCommands = data.statistics?.totalCommands || 0;
  const commandEntries = Object.entries(commands);

  let content = gradientString(['#4facfe', '#00f2fe'])('📊 Command Usage Statistics') + '\n' +
    gradientString(['#74b9ff', '#0984e3'])('━'.repeat(45)) + '\n\n';

  if (totalCommands > 0 && commandEntries.length > 0) {
    const sortedCommands = commandEntries.sort(([, a]: any, [, b]: any) => b - a).slice(0, 8);
    const maxCount = Math.max(...Object.values(commands).map(c => Number(c)));

    // Add header
    content += chalk.hex('#00d2d3')('Command'.padEnd(12)) + ' ' +
      chalk.hex('#ffa502')('Usage'.padEnd(35)) + ' ' +
      chalk.hex('#10ac84')('Count') + '\n\n';

    sortedCommands.forEach(([cmd, count]: any, index: number) => {
      const percentage = ((count / totalCommands) * 100).toFixed(1);
      const barLength = Math.min(Math.ceil((count / maxCount) * 25), 25);

      // Create a colorful progress bar
      let bar = '';
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
      const color = colors[index % colors.length];
      bar = chalk.hex(color)('█'.repeat(barLength)) + chalk.gray('░'.repeat(25 - barLength));

      // Get command emoji
      const emoji = getCommandEmoji(cmd);

      content += `${emoji} ${chalk.white(cmd.padEnd(10))} ${bar} ${chalk.cyan(count.toString().padStart(4))} ${chalk.gray('(' + percentage + '%)')}\n`;
    });

    content += '\n' + chalk.hex('#95afc0')(`📈 Total: ${totalCommands} commands • Most used: ${sortedCommands[0][0]}`);

    // Add usage insights
    const insights = generateUsageInsights(sortedCommands, totalCommands);
    if (insights) {
      content += '\n\n' + chalk.hex('#9c88ff')('💡 Insights: ') + chalk.gray(insights);
    }
  } else {
    content += chalk.gray('🔍 No command usage data available yet\n\n') +
      chalk.gray('Start using the CLI to see your command patterns!\n') +
      chalk.hex('#00d2d3')('Try: ') + chalk.white('pi create my-app') + chalk.gray(' or ') + chalk.white('pi add auth');
  }

  console.log(boxen(content, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'cyan',
    backgroundColor: '#0d1b2a'
  }));
}

function getCommandEmoji(command: string): string {
  const emojis: Record<string, string> = {
    'create': '🏗️',
    'add': '➕',
    'analyze': '📊',
    'update': '⬆️',
    'check': '✅',
    'doctor': '🩺',
    'clean': '🧹',
    'clone': '📂',
    'deploy': '🚀',
    'env': '🌍',
    'upgrade-cli': '📦',
    'email': '📧',
    'cache': '💾'
  };
  return emojis[command] || '⚡';
}

function generateUsageInsights(sortedCommands: any[], totalCommands: number): string {
  if (sortedCommands.length === 0) return '';

  const topCommand = sortedCommands[0];
  const topPercentage = ((topCommand[1] / totalCommands) * 100).toFixed(0);

  if (topCommand[0] === 'create' && parseInt(topPercentage) > 40) {
    return 'You love creating new projects! Consider exploring "pi add" to enhance them.';
  } else if (topCommand[0] === 'analyze' && parseInt(topPercentage) > 30) {
    return 'Great job staying analytical! You\'re monitoring your projects well.';
  } else if (topCommand[0] === 'add' && parseInt(topPercentage) > 30) {
    return 'You\'re actively enhancing projects with features - excellent!';
  } else if (sortedCommands.length >= 5) {
    return 'Balanced CLI usage across multiple commands - you\'re a power user!';
  }

  return `${topCommand[0]} is your go-to command (${topPercentage}% usage)`;
}

/**
 * Display detailed command statistics with trends
 */
function displayDetailedCommandStatistics(data: any): void {
  const commands = data.commands || {};
  const totalCommands = data.statistics?.totalCommands || 0;
  const commandEntries = Object.entries(commands);

  console.log(boxen(
    gradientString(['#4facfe', '#00f2fe'])('📊 Detailed Command Usage Statistics') + '\n\n' +
    (totalCommands > 0 && commandEntries.length > 0
      ? commandEntries
        .sort(([, a]: any, [, b]: any) => b - a)
        .map(([cmd, count]: any, index: number) => {
          const percentage = ((count / totalCommands) * 100).toFixed(1);
          const maxCount = Math.max(...Object.values(commands).map(c => Number(c)));
          const barLength = Math.min(Math.ceil((count / maxCount) * 25), 25);
          const bar = '█'.repeat(barLength);
          const rank = index + 1;
          const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
          return `${rankEmoji} ${chalk.white(cmd.padEnd(18))} ` +
            chalk.cyan(bar.padEnd(25)) +
            chalk.gray(` ${count} uses (${percentage}%)`);
        }).join('\n') + '\n\n' +
      chalk.gray(`Total: ${totalCommands} commands • Average: ${(totalCommands / commandEntries.length).toFixed(1)} per command`)
      : chalk.gray('  No command usage data available yet')
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
/**
 * Display enhanced performance insights
 */
function displayPerformanceInsights(data: any): void {
  const commands = data.commands || {};
  const projects = data.projects || [];
  const features = data.features || [];

  const totalCommands = Object.values(commands).reduce((sum: number, count: any) => sum + Number(count), 0);
  const productivityScore = calculateProductivityScore(totalCommands, projects.length, features.length);
  const commandsPerProject = projects.length > 0 ? (totalCommands / projects.length).toFixed(1) : '0';
  const featuresPerProject = projects.length > 0 ? (features.length / projects.length).toFixed(1) : '0';

  // Calculate efficiency metrics
  const efficiencyRating = getEfficiencyRating(parseFloat(commandsPerProject), parseFloat(featuresPerProject));
  const developmentVelocity = getDevelopmentVelocity(projects, features);

  let content = gradientString(['#74b9ff', '#00b894'])('⚡ Performance & Productivity Insights') + '\n' +
    gradientString(['#0984e3', '#00b894'])('━'.repeat(50)) + '\n\n';

  // Performance metrics grid
  content += chalk.hex('#00d2d3')('📊 CORE METRICS') + '\n\n';
  content += `${chalk.white('🎯 Productivity Score:')} ${getScoreDisplay(productivityScore)}\n`;
  content += `${chalk.white('⚡ Commands per Project:')} ${chalk.blue(commandsPerProject)} ${getCommandsRating(parseFloat(commandsPerProject))}\n`;
  content += `${chalk.white('🔧 Features per Project:')} ${chalk.cyan(featuresPerProject)} ${getFeaturesRating(parseFloat(featuresPerProject))}\n`;
  content += `${chalk.white('🚀 Development Velocity:')} ${chalk.yellow(developmentVelocity)} ${getVelocityEmoji(developmentVelocity)}\n`;
  content += `${chalk.white('⭐ Efficiency Rating:')} ${chalk.magenta(efficiencyRating)} ${getEfficiencyEmoji(efficiencyRating)}\n\n`;

  // Insights section
  content += chalk.hex('#ff6b6b')('💡 INSIGHTS & RECOMMENDATIONS') + '\n\n';
  const insights = generatePerformanceInsights(productivityScore, commandsPerProject, featuresPerProject, projects.length);
  content += chalk.gray(insights.join('\n• '));

  // Achievement badges
  const badges = generateAchievementBadges(totalCommands, projects.length, features.length, productivityScore);
  if (badges.length > 0) {
    content += '\n\n' + chalk.hex('#9c88ff')('🏆 ACHIEVEMENTS UNLOCKED') + '\n\n';
    content += badges.join(' ');
  }

  console.log(boxen(content, {
    padding: 2,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'double',
    borderColor: 'blue',
    backgroundColor: '#1a1a2e'
  }));
}

function getScoreDisplay(score: number): string {
  const color = score >= 80 ? '#10ac84' : score >= 60 ? '#ffa502' : score >= 40 ? '#ff6b6b' : '#95afc0';
  return chalk.hex(color).bold(`${score}/100`) + ' ' + getScoreBar(score);
}

function getCommandsRating(commands: number): string {
  if (commands >= 10) return chalk.green('🔥 Power User');
  if (commands >= 7) return chalk.yellow('⚡ Active');
  if (commands >= 5) return chalk.blue('👍 Good');
  if (commands >= 3) return chalk.gray('🌱 Growing');
  return chalk.gray('🆕 New');
}

function getFeaturesRating(features: number): string {
  if (features >= 5) return chalk.green('🌟 Feature Rich');
  if (features >= 3) return chalk.yellow('✨ Enhanced');
  if (features >= 2) return chalk.blue('💫 Improved');
  if (features >= 1) return chalk.gray('🔮 Basic');
  return chalk.gray('💡 Minimal');
}

function getEfficiencyRating(commandsPerProject: number, featuresPerProject: number): string {
  const efficiency = (commandsPerProject * 0.6) + (featuresPerProject * 0.4);
  if (efficiency >= 8) return 'Excellent';
  if (efficiency >= 6) return 'Very Good';
  if (efficiency >= 4) return 'Good';
  if (efficiency >= 2) return 'Fair';
  return 'Getting Started';
}

function getEfficiencyEmoji(rating: string): string {
  const emojis: Record<string, string> = {
    'Excellent': '🏆',
    'Very Good': '🌟',
    'Good': '👍',
    'Fair': '📈',
    'Getting Started': '🌱'
  };
  return emojis[rating] || '⚡';
}

function getDevelopmentVelocity(projects: any[], features: any[]): string {
  const totalItems = projects.length + features.length;
  if (totalItems >= 50) return 'Lightning Fast';
  if (totalItems >= 30) return 'Very Fast';
  if (totalItems >= 20) return 'Fast';
  if (totalItems >= 10) return 'Moderate';
  if (totalItems >= 5) return 'Steady';
  return 'Just Started';
}

function getVelocityEmoji(velocity: string): string {
  const emojis: Record<string, string> = {
    'Lightning Fast': '⚡',
    'Very Fast': '🚀',
    'Fast': '🏃',
    'Moderate': '🚶',
    'Steady': '🐢',
    'Just Started': '🌱'
  };
  return emojis[velocity] || '📈';
}

function generatePerformanceInsights(score: number, commandsPerProject: string, featuresPerProject: string, projectCount: number): string[] {
  const insights: string[] = [];

  if (score >= 80) {
    insights.push('Outstanding performance! You\'re maximizing CLI potential.');
  } else if (score >= 60) {
    insights.push('Great productivity! Consider exploring more advanced features.');
  } else if (score >= 40) {
    insights.push('Good progress! Try using more CLI commands for better workflow.');
  } else {
    insights.push('Getting started! Run "pi --help" to discover powerful features.');
  }

  const commandsNum = parseFloat(commandsPerProject);
  if (commandsNum < 3 && projectCount > 0) {
    insights.push('Consider using more commands per project for better automation.');
  } else if (commandsNum >= 8) {
    insights.push('Excellent command usage! You\'re leveraging CLI automation well.');
  }

  const featuresNum = parseFloat(featuresPerProject);
  if (featuresNum < 2 && projectCount > 0) {
    insights.push('Try adding more features with "pi add" to enhance your projects.');
  } else if (featuresNum >= 4) {
    insights.push('Great feature adoption! Your projects are well-equipped.');
  }

  if (projectCount >= 10) {
    insights.push('Impressive project count! You\'re a prolific builder.');
  } else if (projectCount >= 5) {
    insights.push('Good project activity! Keep building and experimenting.');
  }

  return insights;
}

function generateAchievementBadges(commands: number, projects: number, features: number, score: number): string[] {
  const badges: string[] = [];

  if (commands >= 100) badges.push(chalk.hex('#ffd700')('🥇 Command Master'));
  else if (commands >= 50) badges.push(chalk.hex('#c0c0c0')('🥈 Command Expert'));
  else if (commands >= 25) badges.push(chalk.hex('#cd7f32')('🥉 Command User'));

  if (projects >= 20) badges.push(chalk.hex('#ff6b6b')('🏗️ Architect'));
  else if (projects >= 10) badges.push(chalk.hex('#4ecdc4')('🚀 Builder'));
  else if (projects >= 5) badges.push(chalk.hex('#45b7d1')('🌱 Creator'));

  if (features >= 30) badges.push(chalk.hex('#9c88ff')('🌟 Feature Master'));
  else if (features >= 15) badges.push(chalk.hex('#feca57')('✨ Feature Explorer'));

  if (score >= 90) badges.push(chalk.hex('#10ac84')('👑 CLI Legend'));
  else if (score >= 80) badges.push(chalk.hex('#00d2d3')('⚡ Power User'));

  return badges;
}

/**
 * Display time-based analytics
 */
function displayTimeBasedAnalytics(data: any): void {
  const projects = data.projects || [];
  const features = data.features || [];
  const allEvents = [...projects, ...features];

  const timeStats = analyzeTimePatterns(allEvents);

  console.log(boxen(
    gradientString(['#fd79a8', '#fdcb6e'])('📅 Time-Based Analytics') + '\n\n' +
    chalk.white(`Most Active Day: `) + chalk.yellow(timeStats.mostActiveDay || 'N/A') + '\n' +
    chalk.white(`Most Active Hour: `) + chalk.yellowBright(timeStats.mostActiveHour || 'N/A') + '\n' +
    chalk.white(`Weekly Activity: `) + chalk.green(`${timeStats.weeklyAverage || 0} actions/week`) + '\n\n' +
    chalk.gray('📊 ') + chalk.white(getTimeInsight(timeStats)),
    {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: 'yellow'
    }
  ));
}

/**
 * Display detailed recent activity
 */
function displayDetailedRecentActivity(data: any): void {
  const projects = data.projects || [];
  const features = data.features || [];
  const commands = data.commands || {};

  // Get recent projects (last 30 days)
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentProjects = projects.filter((p: any) =>
    new Date(p.createdAt || 0).getTime() > thirtyDaysAgo
  );

  const recentFeatures = features.filter((f: any) =>
    new Date(f.createdAt || 0).getTime() > thirtyDaysAgo
  );

  console.log(boxen(
    gradientString(['#6c5ce7', '#a29bfe'])('📈 Detailed Recent Activity (Last 30 Days)') + '\n\n' +
    chalk.white(`Recent Projects: `) + chalk.cyan(recentProjects.length) + '\n' +
    chalk.white(`Recent Features: `) + chalk.magenta(recentFeatures.length) + '\n' +
    chalk.white(`Total CLI Commands: `) + chalk.green(Object.values(commands).reduce((sum: number, count: any) => sum + Number(count), 0)) + '\n\n' +

    (recentProjects.length > 0
      ? chalk.white('Latest Projects:\n') +
      recentProjects
        .slice(0, 5)
        .map((p: any) => chalk.gray(`  • ${p.name || 'Unnamed'} (${getTimeAgo(p.createdAt)})`))
        .join('\n') + '\n\n'
      : chalk.gray('No recent projects\n\n')
    ) +

    (recentFeatures.length > 0
      ? chalk.white('Latest Features:\n') +
      recentFeatures
        .slice(0, 5)
        .map((f: any) => chalk.gray(`  • ${f.name || 'Unnamed'} (${getTimeAgo(f.createdAt)})`))
        .join('\n')
      : chalk.gray('No recent features')
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
 * Helper functions for analytics
 */
function calculateProductivityScore(totalCommands: number, projectCount: number, featureCount: number): number {
  let score = 0;

  // Command usage (0-40 points)
  score += Math.min(40, totalCommands * 2);

  // Project diversity (0-30 points)
  score += Math.min(30, projectCount * 5);

  // Feature adoption (0-30 points)
  score += Math.min(30, featureCount * 3);

  return Math.round(score);
}

function getProductivityTip(score: number): string {
  if (score >= 80) return 'Excellent CLI usage! You\'re maximizing productivity.';
  if (score >= 60) return 'Good productivity! Try exploring more features.';
  if (score >= 40) return 'Moderate usage. Consider using more CLI commands.';
  if (score >= 20) return 'Getting started! Explore more commands and features.';
  return 'Just beginning your journey. Run "pi --help" to discover more!';
}

function analyzeTimePatterns(events: any[]): any {
  if (events.length === 0) return {};

  const dayCount: Record<string, number> = {};
  const hourCount: Record<string, number> = {};

  events.forEach(event => {
    if (event.createdAt) {
      const date = new Date(event.createdAt);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();

      dayCount[day] = (dayCount[day] || 0) + 1;
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    }
  });

  const mostActiveDay = Object.entries(dayCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  const mostActiveHour = Object.entries(hourCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  return {
    mostActiveDay,
    mostActiveHour: mostActiveHour ? `${mostActiveHour}:00` : undefined,
    weeklyAverage: (events.length / Math.max(1, getWeeksSpan(events))).toFixed(1)
  };
}

function getTimeInsight(timeStats: any): string {
  if (!timeStats.mostActiveDay) return 'No activity patterns detected yet.';

  const insights = [
    `You're most active on ${timeStats.mostActiveDay}s`,
    timeStats.mostActiveHour ? `Peak activity around ${timeStats.mostActiveHour}` : '',
    `Averaging ${timeStats.weeklyAverage} actions per week`
  ].filter(Boolean);

  return insights.join(' • ');
}

function getWeeksSpan(events: any[]): number {
  if (events.length === 0) return 1;

  const dates = events
    .map(e => new Date(e.createdAt || Date.now()))
    .filter(d => !isNaN(d.getTime()));

  if (dates.length === 0) return 1;

  const earliest = Math.min(...dates.map(d => d.getTime()));
  const weeksSpan = Math.max(1, (Date.now() - earliest) / (1000 * 60 * 60 * 24 * 7));

  return weeksSpan;
}
function getProjectsPerMonth(projects: any[]): string {
  if (projects.length === 0) return '0.0';

  const dates = projects
    .map(p => new Date(p.createdAt || Date.now()))
    .filter(d => !isNaN(d.getTime()));

  if (dates.length === 0) return '0.0';

  const earliest = Math.min(...dates.map(d => d.getTime()));
  const monthsSpan = Math.max(1, (Date.now() - earliest) / (1000 * 60 * 60 * 24 * 30));

  return (projects.length / monthsSpan).toFixed(1);
}

function getCategoryEmoji(category: string): string {
  const categoryMap: Record<string, string> = {
    ui: '🎨',
    auth: '🔐',
    database: '🗄️',
    aws: '☁️',
    payment: '💳',
    analytics: '📊',
    monitoring: '📈',
    testing: '🧪',
    docker: '🐳',
    ai: '🤖',
    storage: '💾'
  };

  return categoryMap[category] || '⚡';
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return `${Math.floor(diffDays / 365)} years ago`;
}

function displayProjectStatistics(data: any): void {
  const projects = data.projects || [];
  const frameworks = data.statistics?.frameworks || {};
  const languages = data.statistics?.languages || {};

  console.log(boxen(
    gradientString(['#ff6b6b', '#feca57'])('🚀 Project Statistics') + '\n\n' +
    chalk.white(`Total Projects Created: `) + chalk.cyan(projects.length) + '\n\n' +
    (Object.keys(frameworks).length > 0
      ? chalk.white('Most Used Frameworks:\n') +
      Object.entries(frameworks)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
        .map(([fw, count]: any) => chalk.white(`  ${fw.padEnd(12)}: `) + chalk.green(count))
        .join('\n') + '\n\n'
      : chalk.gray('No framework data available\n\n')
    ) +
    (Object.keys(languages).length > 0
      ? chalk.white('Languages Explored:\n') +
      Object.entries(languages)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
        .map(([lang, count]: any) => chalk.white(`  ${lang.padEnd(12)}: `) + chalk.yellow(count))
        .join('\n')
      : chalk.gray('No language data available')
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
 * Display detailed project statistics
 */
function displayDetailedProjectStatistics(data: any): void {
  const projects = data.projects || [];
  const frameworks = data.statistics?.frameworks || {};
  const languages = data.statistics?.languages || {};

  console.log(boxen(
    gradientString(['#ff6b6b', '#feca57'])('🚀 Detailed Project Statistics') + '\n\n' +
    chalk.white(`Total Projects Created: `) + chalk.cyan(projects.length) + '\n' +
    chalk.white(`Average Projects per Month: `) + chalk.green(getProjectsPerMonth(projects)) + '\n\n' +

    (Object.keys(frameworks).length > 0
      ? chalk.white('Framework Distribution:\n') +
      Object.entries(frameworks)
        .sort(([, a]: any, [, b]: any) => b - a)
        .map(([fw, count]: any) => {
          const percentage = ((count / projects.length) * 100).toFixed(1);
          return chalk.white(`  ${fw.padEnd(15)}: `) + chalk.green(`${count} (${percentage}%)`);
        }).join('\n') + '\n\n'
      : chalk.gray('No framework data available\n\n')
    ) +

    (Object.keys(languages).length > 0
      ? chalk.white('Language Preferences:\n') +
      Object.entries(languages)
        .sort(([, a]: any, [, b]: any) => b - a)
        .map(([lang, count]: any) => {
          const percentage = ((count / projects.length) * 100).toFixed(1);
          return chalk.white(`  ${lang.padEnd(15)}: `) + chalk.yellow(`${count} (${percentage}%)`);
        }).join('\n')
      : chalk.gray('No language data available')
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
 * Display feature usage statistics
 */
function displayFeatureUsage(data: any): void {
  const features = data.features || [];
  const featureStats: Record<string, number> = {};

  // Count feature usage
  features.forEach((feature: any) => {
    if (feature.name) {
      featureStats[feature.name] = (featureStats[feature.name] || 0) + 1;
    }
  });

  console.log(boxen(
    gradientString(['#9c88ff', '#f093fb'])('🎯 Feature Usage') + '\n\n' +
    (Object.keys(featureStats).length > 0
      ? Object.entries(featureStats)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 8)
        .map(([feature, count]: any) =>
          chalk.white(`  ${feature.padEnd(18)}: `) + chalk.magenta(`${count} times`))
        .join('\n')
      : chalk.gray('  No feature usage data available yet\n  Install features with "pi add" to see usage stats!')
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
 * Display detailed feature usage
 */
function displayDetailedFeatureUsage(data: any): void {
  const features = data.features || [];
  const featureStats: Record<string, { count: number; category: string; lastUsed: string }> = {};

  // Count feature usage and track categories
  features.forEach((feature: any) => {
    if (feature.name) {
      if (!featureStats[feature.name]) {
        featureStats[feature.name] = {
          count: 0,
          category: feature.category || 'misc',
          lastUsed: feature.createdAt || new Date().toISOString()
        };
      }
      featureStats[feature.name].count++;
    }
  });

  console.log(boxen(
    gradientString(['#9c88ff', '#f093fb'])('🎯 Detailed Feature Usage Analytics') + '\n\n' +
    (Object.keys(featureStats).length > 0
      ? Object.entries(featureStats)
        .sort(([, a]: any, [, b]: any) => b.count - a.count)
        .map(([feature, stats]: any) => {
          const categoryEmoji = getCategoryEmoji(stats.category);
          return `${categoryEmoji} ${chalk.white(feature.padEnd(20))} ` +
            chalk.magenta(`${stats.count} uses`) +
            chalk.gray(` • Last: ${getTimeAgo(stats.lastUsed)}`);
        }).join('\n') + '\n\n' +
      chalk.gray(`Total features used: ${Object.keys(featureStats).length}`)
      : chalk.gray('  No feature usage data available yet')
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
 * Export analytics data in specified format
 */
async function exportAnalyticsData(data: any, method: string = 'json'): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];

  // Ensure method is a string and normalize it
  const methodStr = typeof method === 'string' ? method : 'json';
  const normalizedMethod = methodStr.toLowerCase().trim();

  let filename = '';
  let content = '';

  try {
    switch (normalizedMethod) {
      case 'xml':
        filename = `analytics-export-${timestamp}.xml`;
        content = convertToXML(data);
        await fs.writeFile(filename, content, 'utf8');
        break;

      case 'yaml':
      case 'yml':
        filename = `analytics-export-${timestamp}.yaml`;
        content = convertToYAML(data);
        await fs.writeFile(filename, content, 'utf8');
        break;

      case 'json':
      default:
        filename = `analytics-export-${timestamp}.json`;
        await fs.writeJson(filename, data, { spaces: 2 });
        break;
    }

    displaySuccessMessage(
      `Analytics exported as ${normalizedMethod.toUpperCase()}`,
      [
        `📄 Saved to: ${filename}`,
        `📊 Format: ${normalizedMethod.toUpperCase()}`,
        `📈 Contains all CLI usage statistics and project data`,
        `💾 Size: ${await getFileSize(filename)}`
      ]
    );

  } catch (error) {
    console.error(chalk.red('❌ Export failed:'), error);
    console.log(chalk.yellow('\n💡 Supported formats: json, xml, yaml, yml'));
    console.log(chalk.gray('   Example: analyze --export json'));
  }
}

/**
 * Convert analytics data to XML format
 */
function convertToXML(data: any): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const xmlContent = objectToXML(data, 'analytics');
  return xmlHeader + xmlContent;
}

/**
 * Convert object to XML recursively
 */
function objectToXML(obj: any, rootName: string = 'root', indent: string = ''): string {
  if (obj === null || obj === undefined) {
    return `${indent}<${rootName}></${rootName}>\n`;
  }

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return `${indent}<${rootName}>${escapeXML(String(obj))}</${rootName}>\n`;
  }

  if (Array.isArray(obj)) {
    let xml = `${indent}<${rootName}>\n`;
    obj.forEach((item, index) => {
      xml += objectToXML(item, 'item', indent + '  ');
    });
    xml += `${indent}</${rootName}>\n`;
    return xml;
  }

  if (typeof obj === 'object') {
    let xml = `${indent}<${rootName}>\n`;
    Object.entries(obj).forEach(([key, value]) => {
      const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
      xml += objectToXML(value, safeKey, indent + '  ');
    });
    xml += `${indent}</${rootName}>\n`;
    return xml;
  }

  return `${indent}<${rootName}>${escapeXML(String(obj))}</${rootName}>\n`;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert analytics data to YAML format
 */
function convertToYAML(data: any): string {
  return objectToYAML(data, 0);
}

/**
 * Convert object to YAML recursively
 */
function objectToYAML(obj: any, indent: number = 0): string {
  const spaces = '  '.repeat(indent);

  if (obj === null || obj === undefined) {
    return 'null\n';
  }

  if (typeof obj === 'string') {
    // Escape strings that might need quotes
    if (obj.includes('\n') || obj.includes('"') || obj.includes("'") || obj.includes(':')) {
      return `"${obj.replace(/"/g, '\\"')}"\n`;
    }
    return `${obj}\n`;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return `${obj}\n`;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]\n';

    let yaml = '\n';
    obj.forEach(item => {
      yaml += `${spaces}- `;
      if (typeof item === 'object' && item !== null) {
        const itemYaml = objectToYAML(item, indent + 1);
        yaml += itemYaml.substring(itemYaml.indexOf('\n') + 1);
      } else {
        yaml += objectToYAML(item, 0).trim() + '\n';
      }
    });
    return yaml;
  }

  if (typeof obj === 'object') {
    if (Object.keys(obj).length === 0) return '{}\n';

    let yaml = '\n';
    Object.entries(obj).forEach(([key, value]) => {
      yaml += `${spaces}${key}: `;
      if (typeof value === 'object' && value !== null) {
        yaml += objectToYAML(value, indent + 1);
      } else {
        yaml += objectToYAML(value, 0);
      }
    });
    return yaml;
  }

  return `${obj}\n`;
}

/**
 * Get file size in human readable format
 */
async function getFileSize(filename: string): Promise<string> {
  try {
    const stats = await fs.stat(filename);
    const bytes = stats.size;

    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  } catch (error) {
    return 'Unknown';
  }
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
