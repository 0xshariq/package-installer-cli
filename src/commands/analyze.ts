/**
 * Analyze command - Advanced terminal dashboard showing CLI usage analytics
 */

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import figlet from 'figlet';
import gradientString from 'gradient-string';
import boxen from 'boxen';
import { detectProjectLanguage } from '../utils/dependencyInstaller.js';
import { 
  createBanner, 
  displayProjectStats, 
  displayRecentProjects, 
  displayCommandsGrid,
  displaySystemInfo,
  displayFeatureUsage,
  gatherProjectStats,
  scanForRecentProjects,
  displaySuccessMessage
} from '../utils/dashboard.js';
import { 
  getCachedAnalysis, 
  cacheAnalysisResults, 
  scanProjectWithCache, 
  displayCacheStats 
} from '../utils/cacheManager.js';
import { historyManager } from '../utils/historyManager.js';

/**
 * Display help for analyze command
 */
export function showAnalyzeHelp(): void {
  console.clear();
  
  console.log(chalk.hex('#9c88ff')('📊 ANALYZE COMMAND HELP\n'));
  
  console.log(chalk.hex('#00d2d3')('Usage:'));
  console.log(chalk.white('  pi analyze [options]'));
  console.log(chalk.white('  pi stats [options]') + chalk.gray(' (alias)\n'));
  
  console.log(chalk.hex('#00d2d3')('Description:'));
  console.log(chalk.white('  Display comprehensive project analytics and system dashboard'));
  console.log(chalk.white('  Shows project statistics, recent projects, system info, and more\n'));
  
  console.log(chalk.hex('#00d2d3')('Options:'));
  console.log(chalk.white('  --current') + chalk.gray('     Analyze only the current project in detail'));
  console.log(chalk.white('  --system') + chalk.gray('      Show system information only'));
  console.log(chalk.white('  --projects') + chalk.gray('    Show recent projects only'));
  console.log(chalk.white('  --commands') + chalk.gray('    Show available commands only'));
  console.log(chalk.white('  -h, --help') + chalk.gray('     Show this help message\n'));
  
  console.log(chalk.hex('#00d2d3')('Examples:'));
  console.log(chalk.gray('  # Show complete analytics dashboard'));
  console.log(chalk.white('  pi analyze\n'));
  console.log(chalk.gray('  # Analyze current project in detail'));
  console.log(chalk.white('  pi analyze --current\n'));
  console.log(chalk.gray('  # Show system information only'));
  console.log(chalk.white('  pi analyze --system\n'));
  console.log(chalk.gray('  # Show recent projects'));
  console.log(chalk.white('  pi analyze --projects\n'));
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

  // Create beautiful banner with full name
  console.clear();
  
  // Create figlet text for "Package Installer"
  const figletText = figlet.textSync('Package\nInstaller', {
    font: 'ANSI Shadow',
    horizontalLayout: 'fitted',
    width: 80
  });
  
  // Apply blue gradient
  const gradientText = gradientString('#00d2d3', '#0084ff', '#2196f3')(figletText);
  
  // Create a box around it
  const banner = boxen(gradientText, {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'blue',
    backgroundColor: '#1a1a1a'
  });
  
  console.log(banner);
  
  // Add tagline
  const tagline = chalk.hex('#00d2d3')('🔍 Advanced Project Analytics Dashboard');
  const version = chalk.hex('#95afc0')('v2.5.0');
  const author = chalk.hex('#ffa502')('by @0xshariq');
  
  const centered = `${tagline} ${version} ${author}`;
  const padding = Math.max(0, Math.floor(((process.stdout.columns || 80) - centered.length) / 2));
  console.log(' '.repeat(padding) + centered);
  console.log();
  
  const spinner = ora(chalk.hex('#9c88ff')('🔍 Gathering real-time analytics data...')).start();
  
  try {
    const currentDir = process.cwd();
    
    // Initialize history manager
    await historyManager.init();
    
    // Check if cache should restart (5 hours)
    const shouldRestart = historyManager.shouldRestartCache();
    const history = historyManager.getHistory();
    
    if (shouldRestart) {
      spinner.text = chalk.hex('#ffa502')('🔄 Cache expired, gathering fresh data...');
      
      spinner.stop();
      
      console.log(chalk.green('🔄 Real-time analytics data (cache restarted after 5 hours)'));
      console.log(chalk.yellow(`📊 Data from: ${new Date(history.lastUpdated).toLocaleString()}`));
    } else {
      spinner.text = chalk.hex('#9c88ff')('⚡ Loading cached analytics data...');
      
      spinner.stop();
      
      console.log(chalk.green('⚡ Cached analytics data (updated: ' + 
        new Date(history.lastUpdated).toLocaleString() + ')'));
    }
    
    console.log();
    
    // Display comprehensive dashboard with real data from history
    displayProjectStats(history);
    displayRecentProjects(historyManager.getRecentProjects());
    displayFeatureUsage(historyManager.getFeatureStats());
    displayCommandsGrid();
    displaySystemInfo();
    displayCacheStats();
    
    displaySuccessMessage(
      'Analytics dashboard generated successfully!',
      [
        'Real-time data refreshed and cached',
        'Use analyze --current to analyze only the current project',
        'Use analyze --projects to see recent projects',  
        'Use analyze --system for system information only'
      ]
    );
    
  } catch (error: any) {
    spinner.fail(chalk.red('❌ Failed to generate analytics'));
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Analyze the current project in detail
 */
export async function analyzeCurrentProject(): Promise<void> {
  const projectPath = process.cwd();
  const projectName = path.basename(projectPath);
  
  console.log(chalk.hex('#00d2d3')(`\n🔍 ANALYZING PROJECT: ${chalk.white(projectName)}\n`));
  
  // Detect languages and frameworks
  const languages = await detectProjectLanguage(projectPath);
  
  if (languages.length === 0) {
    console.log(chalk.yellow('⚠️  No recognizable project structure found'));
    return;
  }
  
  // Analyze project structure
  const analysis = await analyzeProjectStructure(projectPath, languages);
  
  // Display results
  displayProjectAnalysis(projectName, analysis);
}

/**
 * Analyze project structure and dependencies
 */
async function analyzeProjectStructure(projectPath: string, languages: string[]): Promise<any> {
  const analysis: any = {
    languages,
    files: {},
    dependencies: {},
    structure: {},
    metrics: {},
    recommendations: []
  };
  
  // Analyze each language ecosystem
  for (const language of languages) {
    switch (language) {
      case 'nodejs':
        analysis.files.nodejs = await analyzeNodejsProject(projectPath);
        break;
      case 'rust':
        analysis.files.rust = await analyzeRustProject(projectPath);
        break;
      case 'python':
        analysis.files.python = await analyzePythonProject(projectPath);
        break;
    }
  }
  
  // Analyze directory structure
  analysis.structure = await analyzeDirectoryStructure(projectPath);
  
  // Calculate metrics
  analysis.metrics = await calculateProjectMetrics(projectPath);
  
  // Generate recommendations
  analysis.recommendations = generateRecommendations(analysis);
  
  return analysis;
}

/**
 * Analyze Node.js project specifics
 */
async function analyzeNodejsProject(projectPath: string): Promise<any> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const analysis: any = {
    hasPackageJson: false,
    packageManager: 'npm',
    scripts: {},
    dependencies: { production: 0, development: 0 },
    framework: 'unknown'
  };
  
  if (await fs.pathExists(packageJsonPath)) {
    analysis.hasPackageJson = true;
    const packageJson = await fs.readJson(packageJsonPath);
    
    // Detect package manager
    if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
      analysis.packageManager = 'pnpm';
    } else if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
      analysis.packageManager = 'yarn';
    }
    
    // Count dependencies
    if (packageJson.dependencies) {
      analysis.dependencies.production = Object.keys(packageJson.dependencies).length;
    }
    if (packageJson.devDependencies) {
      analysis.dependencies.development = Object.keys(packageJson.devDependencies).length;
    }
    
    // Detect framework
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (deps['next']) analysis.framework = 'Next.js';
    else if (deps['react']) analysis.framework = 'React';
    else if (deps['vue']) analysis.framework = 'Vue.js';
    else if (deps['@angular/core']) analysis.framework = 'Angular';
    else if (deps['express']) analysis.framework = 'Express';
    else if (deps['@nestjs/core']) analysis.framework = 'NestJS';
    
    // Get scripts
    analysis.scripts = packageJson.scripts || {};
  }
  
  return analysis;
}

/**
 * Analyze Rust project specifics
 */
async function analyzeRustProject(projectPath: string): Promise<any> {
  const cargoTomlPath = path.join(projectPath, 'Cargo.toml');
  const analysis: any = {
    hasCargoToml: false,
    isWorkspace: false,
    dependencies: { normal: 0, dev: 0, build: 0 },
    edition: '2021'
  };
  
  if (await fs.pathExists(cargoTomlPath)) {
    analysis.hasCargoToml = true;
    
    try {
      const cargoContent = await fs.readFile(cargoTomlPath, 'utf-8');
      
      if (cargoContent.includes('[workspace]')) {
        analysis.isWorkspace = true;
      }
      
      // Count dependency sections
      const depMatches = cargoContent.match(/\[dependencies\]/g);
      const devDepMatches = cargoContent.match(/\[dev-dependencies\]/g);
      const buildDepMatches = cargoContent.match(/\[build-dependencies\]/g);
      
      if (depMatches) analysis.dependencies.normal = 1;
      if (devDepMatches) analysis.dependencies.dev = 1;
      if (buildDepMatches) analysis.dependencies.build = 1;
      
      // Detect edition
      const editionMatch = cargoContent.match(/edition\s*=\s*"(\d+)"/);
      if (editionMatch) {
        analysis.edition = editionMatch[1];
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }
  
  return analysis;
}

/**
 * Analyze Python project specifics
 */
async function analyzePythonProject(projectPath: string): Promise<any> {
  const analysis: any = {
    hasRequirements: false,
    hasPyproject: false,
    hasPoetry: false,
    packageManager: 'pip',
    dependencies: 0
  };
  
  const requirementsPath = path.join(projectPath, 'requirements.txt');
  const pyprojectPath = path.join(projectPath, 'pyproject.toml');
  const poetryLockPath = path.join(projectPath, 'poetry.lock');
  
  analysis.hasRequirements = await fs.pathExists(requirementsPath);
  analysis.hasPyproject = await fs.pathExists(pyprojectPath);
  analysis.hasPoetry = await fs.pathExists(poetryLockPath);
  
  if (analysis.hasPoetry) {
    analysis.packageManager = 'poetry';
  } else if (analysis.hasPyproject) {
    analysis.packageManager = 'pip + pyproject.toml';
  }
  
  // Count dependencies from requirements.txt
  if (analysis.hasRequirements) {
    try {
      const requirements = await fs.readFile(requirementsPath, 'utf-8');
      analysis.dependencies = requirements.split('\n').filter(line => 
        line.trim() && !line.startsWith('#')
      ).length;
    } catch (error) {
      // Ignore errors
    }
  }
  
  return analysis;
}

/**
 * Analyze directory structure
 */
async function analyzeDirectoryStructure(projectPath: string): Promise<any> {
  const structure = {
    totalFiles: 0,
    directories: 0,
    hasTests: false,
    hasDocs: false,
    hasConfig: false,
    sourceStructure: 'unknown'
  };
  
  try {
    const entries = await fs.readdir(projectPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        structure.directories++;
        
        if (['test', 'tests', '__tests__', 'spec'].includes(entry.name.toLowerCase())) {
          structure.hasTests = true;
        }
        if (['docs', 'doc', 'documentation'].includes(entry.name.toLowerCase())) {
          structure.hasDocs = true;
        }
        if (entry.name === 'src') {
          structure.sourceStructure = 'src-based';
        }
      } else {
        structure.totalFiles++;
        
        if (['.gitignore', '.env', 'tsconfig.json', '.eslintrc', 'webpack.config.js'].includes(entry.name)) {
          structure.hasConfig = true;
        }
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  return structure;
}

/**
 * Calculate project metrics
 */
async function calculateProjectMetrics(projectPath: string): Promise<any> {
  const metrics = {
    totalSize: 0,
    codeFiles: 0,
    configFiles: 0,
    lastModified: new Date(0)
  };
  
  try {
    const stats = await fs.stat(projectPath);
    metrics.totalSize = stats.size;
    metrics.lastModified = stats.mtime;
    
    await walkDirectory(projectPath, (filePath: string, stat: fs.Stats) => {
      const ext = path.extname(filePath).toLowerCase();
      const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.rs', '.go', '.java', '.php', '.rb'];
      const configExtensions = ['.json', '.yml', '.yaml', '.toml', '.ini', '.conf'];
      
      if (codeExtensions.includes(ext)) {
        metrics.codeFiles++;
      } else if (configExtensions.includes(ext)) {
        metrics.configFiles++;
      }
      
      if (stat.mtime > metrics.lastModified) {
        metrics.lastModified = stat.mtime;
      }
    });
  } catch (error) {
    // Ignore errors
  }
  
  return metrics;
}

/**
 * Walk directory recursively
 */
async function walkDirectory(dir: string, callback: (filePath: string, stat: fs.Stats) => void): Promise<void> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && ['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
        continue;
      }
      
      const stat = await fs.stat(fullPath);
      callback(fullPath, stat);
      
      if (entry.isDirectory()) {
        await walkDirectory(fullPath, callback);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(analysis: any): string[] {
  const recommendations: string[] = [];
  
  if (analysis.files.nodejs) {
    const nodejs = analysis.files.nodejs;
    
    if (!nodejs.hasPackageJson) {
      recommendations.push('Initialize package.json with `npm init`');
    }
    
    if (nodejs.dependencies.production > 50) {
      recommendations.push('Consider reviewing dependencies - large dependency count detected');
    }
    
    if (!nodejs.scripts.test) {
      recommendations.push('Add test script to package.json for better project maintainability');
    }
  }
  
  if (!analysis.structure.hasTests) {
    recommendations.push('Add tests to improve code quality and reliability');
  }
  
  if (!analysis.structure.hasDocs) {
    recommendations.push('Consider adding documentation (README.md, docs folder)');
  }
  
  if (!analysis.structure.hasConfig) {
    recommendations.push('Add configuration files (.gitignore, .env.example, etc.)');
  }
  
  return recommendations;
}

/**
 * Display comprehensive project analysis
 */
function displayProjectAnalysis(projectName: string, analysis: any): void {
  const Table = require('cli-table3');
  
  const overviewTable = new Table({
    head: [chalk.hex('#00d2d3')('Property'), chalk.hex('#10ac84')('Value')],
    colWidths: [25, 55],
    style: { head: [], border: ['cyan'] }
  });
  
  overviewTable.push(
    [chalk.white('📁 Project Name'), chalk.green(projectName)],
    [chalk.white('🔧 Languages'), chalk.blue(analysis.languages.join(', '))],
    [chalk.white('📊 Total Files'), chalk.yellow(analysis.structure.totalFiles)],
    [chalk.white('📂 Directories'), chalk.magenta(analysis.structure.directories)],
    [chalk.white('📝 Code Files'), chalk.cyan(analysis.metrics.codeFiles)],
    [chalk.white('⚙️  Config Files'), chalk.hex('#ffa502')(analysis.metrics.configFiles)]
  );
  
  console.log(overviewTable.toString());
  
  if (analysis.recommendations.length > 0) {
    console.log('\n' + chalk.hex('#ffa502')('💡 RECOMMENDATIONS:\n'));
    analysis.recommendations.forEach((rec: string, index: number) => {
      console.log(chalk.gray(`${index + 1}. ${rec}`));
    });
    console.log();
  }
}
