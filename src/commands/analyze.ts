/**
 * Analyze command - Terminal dashboard showing CLI usage analytics
 */

import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Display help for analyze command
 */
export function showAnalyzeHelp(): void {
  const piGradient = gradient(['#00c6ff', '#0072ff']);
  const headerGradient = gradient(['#667eea', '#764ba2']);
  
  console.log('\n' + boxen(
    headerGradient('📊 Analyze Command Help') + '\n\n' +
    chalk.white('Display a beautiful terminal dashboard with CLI usage analytics.') + '\n' +
    chalk.white('See which frameworks are popular and make data-driven decisions!') + '\n\n' +
    chalk.cyan('Usage:') + '\n' +
    chalk.white(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('analyze')}`) + '\n\n' +
    chalk.cyan('Options:') + '\n' +
    chalk.gray('  -h, --help    Display help for this command') + '\n\n' +
    chalk.cyan('Examples:') + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('analyze')}              # Show analytics dashboard`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#10ac84')('analyze')} ${chalk.hex('#ff6b6b')('--help')}     # Show this help message`) + '\n\n' +
    chalk.hex('#00d2d3')('💡 Dashboard Features:') + '\n' +
    chalk.hex('#95afc0')('  • Framework usage statistics') + '\n' +
    chalk.hex('#95afc0')('  • Most popular project types') + '\n' +
    chalk.hex('#95afc0')('  • Feature installation trends') + '\n' +
    chalk.hex('#95afc0')('  • Personalized recommendations'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'magenta',
      backgroundColor: '#0a0a0a'
    }
  ));
}

/**
 * Interface for analytics data
 */
interface AnalyticsData {
  totalProjects: number;
  frameworkStats: Record<string, number>;
  languageStats: Record<string, number>;
  featureStats: Record<string, number>;
  lastUsed: string;
  installCount: number;
}

/**
 * Get analytics data from local storage or return defaults
 */
function getAnalyticsData(): AnalyticsData {
  const analyticsFile = path.join(os.homedir(), '.pi-cli-analytics.json');
  
  try {
    if (fs.existsSync(analyticsFile)) {
      const data = fs.readFileSync(analyticsFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    // If file doesn't exist or is corrupted, return defaults
  }
  
  // Return mock data for demonstration
  return {
    totalProjects: 15,
    frameworkStats: {
      'Next.js': 6,
      'Express': 4,
      'React (Vite)': 3,
      'Angular': 1,
      'Rust': 1
    },
    languageStats: {
      'TypeScript': 9,
      'JavaScript': 5,
      'Rust': 1
    },
    featureStats: {
      'Auth (Clerk)': 4,
      'Tailwind CSS': 8,
      'ShadCN/UI': 5,
      'Docker': 3,
      'Material UI': 1
    },
    lastUsed: new Date().toISOString(),
    installCount: 28
  };
}

/**
 * Create a progress bar
 */
function createProgressBar(current: number, total: number, width: number = 20): string {
  const percentage = Math.round((current / total) * 100);
  const filledWidth = Math.round((current / total) * width);
  const emptyWidth = width - filledWidth;
  
  const filled = chalk.hex('#10ac84')('█'.repeat(filledWidth));
  const empty = chalk.hex('#2d3748')('░'.repeat(emptyWidth));
  
  return `${filled}${empty} ${chalk.hex('#00d2d3')(percentage + '%')}`;
}

/**
 * Display framework statistics
 */
function displayFrameworkStats(frameworkStats: Record<string, number>): void {
  const totalProjects = Object.values(frameworkStats).reduce((sum, count) => sum + count, 0);
  const sortedFrameworks = Object.entries(frameworkStats)
    .sort(([, a], [, b]) => b - a);
  
  console.log(boxen(
    chalk.hex('#667eea')('🚀 Framework Usage Statistics') + '\n\n' +
    sortedFrameworks.map(([framework, count]) => {
      const bar = createProgressBar(count, totalProjects);
      return `${chalk.white(framework.padEnd(15))} ${bar} ${chalk.hex('#ffa502')(`(${count} projects)`)}`;
    }).join('\n'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: '#667eea',
      backgroundColor: '#1a1a2e'
    }
  ));
}

/**
 * Display language statistics
 */
function displayLanguageStats(languageStats: Record<string, number>): void {
  const totalProjects = Object.values(languageStats).reduce((sum, count) => sum + count, 0);
  const sortedLanguages = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a);
  
  console.log(boxen(
    chalk.hex('#f093fb')('💻 Programming Language Usage') + '\n\n' +
    sortedLanguages.map(([language, count]) => {
      const bar = createProgressBar(count, totalProjects);
      return `${chalk.white(language.padEnd(15))} ${bar} ${chalk.hex('#ffa502')(`(${count} projects)`)}`;
    }).join('\n'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: '#f093fb',
      backgroundColor: '#2d1b40'
    }
  ));
}

/**
 * Display feature statistics
 */
function displayFeatureStats(featureStats: Record<string, number>): void {
  const totalFeatures = Object.values(featureStats).reduce((sum, count) => sum + count, 0);
  const sortedFeatures = Object.entries(featureStats)
    .sort(([, a], [, b]) => b - a);
  
  console.log(boxen(
    chalk.hex('#4facfe')('⚡ Popular Features & Add-ons') + '\n\n' +
    sortedFeatures.map(([feature, count]) => {
      const bar = createProgressBar(count, totalFeatures);
      return `${chalk.white(feature.padEnd(15))} ${bar} ${chalk.hex('#ffa502')(`(${count} installs)`)}`;
    }).join('\n'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: '#4facfe',
      backgroundColor: '#0a1a2e'
    }
  ));
}

/**
 * Display overview statistics
 */
function displayOverview(data: AnalyticsData): void {
  const lastUsedDate = new Date(data.lastUsed).toLocaleDateString();
  const avgFeaturesPerProject = (data.installCount / data.totalProjects).toFixed(1);
  
  console.log(boxen(
    gradient(['#ff6b6b', '#feca57'])('📈 CLI Usage Overview') + '\n\n' +
    `${chalk.hex('#00d2d3')('Total Projects Created:')} ${chalk.hex('#10ac84')(data.totalProjects)}` + '\n' +
    `${chalk.hex('#00d2d3')('Total Feature Installs:')} ${chalk.hex('#10ac84')(data.installCount)}` + '\n' +
    `${chalk.hex('#00d2d3')('Avg Features per Project:')} ${chalk.hex('#10ac84')(avgFeaturesPerProject)}` + '\n' +
    `${chalk.hex('#00d2d3')('Last Activity:')} ${chalk.hex('#ffa502')(lastUsedDate)}`,
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: '#ff6b6b',
      backgroundColor: '#2d1b1b'
    }
  ));
}

/**
 * Display recommendations
 */
function displayRecommendations(data: AnalyticsData): void {
  const recommendations = [];
  
  // Generate dynamic recommendations based on usage patterns
  const topFramework = Object.entries(data.frameworkStats)
    .sort(([, a], [, b]) => b - a)[0]?.[0];
  
  if (topFramework === 'Next.js') {
    recommendations.push('🎯 Consider trying our new Next.js templates with App Router');
    recommendations.push('💡 Explore ShadCN/UI components for faster development');
  } else if (topFramework === 'Express') {
    recommendations.push('🎯 Try our TypeScript Express template for better type safety');
    recommendations.push('💡 Add Docker support for easier deployment');
  }
  
  if (data.featureStats['Auth (Clerk)'] > data.featureStats['Auth (Auth0)'] || 0) {
    recommendations.push('🔐 Clerk authentication is popular - check our latest templates');
  }
  
  if (data.languageStats['TypeScript'] > data.languageStats['JavaScript']) {
    recommendations.push('⚡ Great choice using TypeScript! Try our advanced TS templates');
  }
  
  recommendations.push('📦 New templates added regularly - run "pi create" to see latest');
  
  console.log(boxen(
    chalk.hex('#00d2d3')('💡 Personalized Recommendations') + '\n\n' +
    recommendations.map((rec, index) => `${rec}`).join('\n'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: '#00d2d3',
      backgroundColor: '#0a2a2a'
    }
  ));
}

/**
 * Main analyze command function
 */
export async function analyzeCommand(): Promise<void> {
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showAnalyzeHelp();
    return;
  }
  
  console.log('\n' + gradient(['#667eea', '#764ba2'])('📊 Package Installer CLI Analytics Dashboard'));
  console.log(chalk.hex('#95afc0')('Analyzing your development patterns and usage statistics...\n'));
  
  try {
    const analyticsData = getAnalyticsData();
    
    // Display all sections with spacing
    displayOverview(analyticsData);
    console.log();
    
    displayFrameworkStats(analyticsData.frameworkStats);
    console.log();
    
    displayLanguageStats(analyticsData.languageStats);
    console.log();
    
    displayFeatureStats(analyticsData.featureStats);
    console.log();
    
    displayRecommendations(analyticsData);
    
    console.log('\n' + boxen(
      chalk.hex('#10ac84')('🎉 Dashboard Complete!') + '\n\n' +
      chalk.white('This analytics dashboard helps us understand which frameworks') + '\n' +
      chalk.white('and features are most popular, allowing us to prioritize') + '\n' +
      chalk.white('development efforts and add the most requested templates.') + '\n\n' +
      chalk.hex('#00d2d3')('📈 Benefits:') + '\n' +
      chalk.hex('#95afc0')('  • See your development patterns') + '\n' +
      chalk.hex('#95afc0')('  • Get personalized recommendations') + '\n' +
      chalk.hex('#95afc0')('  • Discover popular frameworks') + '\n' +
      chalk.hex('#95afc0')('  • Help shape future CLI features'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: '#10ac84',
        backgroundColor: '#001a00'
      }
    ));
    
  } catch (error) {
    console.log(chalk.red('❌ Failed to load analytics data'));
    console.log(chalk.hex('#95afc0')('This might be your first time using the analyze command.'));
    console.log(chalk.hex('#95afc0')('Create some projects first, then check back!'));
  }
}
