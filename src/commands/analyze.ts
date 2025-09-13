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
import { 
  createBanner, 
  displayProjectStats, 
  displayRecentProjects, 
  displayCommandsGrid,
  displaySystemInfo,
  gatherProjectStats,
  scanForRecentProjects,
  displaySuccessMessage
} from '../utils/dashboard.js';
import { 
  updateTemplateUsage, 
  getCachedTemplateFiles, 
  cacheTemplateFiles, 
  getDirectorySize,
  cacheProjectData,
  getCachedProject,
  getCacheStats
} from '../utils/cacheManager.js';
import { CacheManager } from '../utils/cacheUtils.js';
import { HistoryManager } from '../utils/historyManager.js';
import { detectProjectStack } from '../utils/featureInstaller.js';
import { SupportedLanguage } from '../utils/dependencyInstaller.js';

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
  console.log(chalk.white('  --history') + chalk.gray('     Show comprehensive history and statistics'));
  console.log(chalk.white('  --stats') + chalk.gray('       Show usage statistics from history'));
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
  const version = chalk.hex('#95afc0')('v3.0.0');
  const author = chalk.hex('#ffa502')('by @0xshariq');
  
  const centered = `${tagline} ${version} ${author}`;
  const padding = Math.max(0, Math.floor(((process.stdout.columns || 80) - centered.length) / 2));
  console.log(' '.repeat(padding) + centered);
  console.log();
  
  const spinner = ora(chalk.hex('#9c88ff')('🔍 Gathering real-time analytics data...')).start();
  
  try {
    const currentDir = process.cwd();
    
    // Initialize history manager
    const historyManager = new HistoryManager();
    await historyManager.init();
    
    // Get history data
    const history = historyManager.getHistory();
    
    spinner.text = chalk.hex('#9c88ff')('📊 Analyzing project data...');
    
    // Check for cached analysis first
    let projectAnalysis = await getCachedProject(currentDir);
    
    if (!projectAnalysis || Date.now() - (projectAnalysis.timestamp || 0) > 3600000) {
      // Perform fresh analysis if cache is older than 1 hour
      spinner.text = chalk.hex('#9c88ff')('🔍 Performing fresh project analysis...');
      projectAnalysis = await analyzeCurrentProject();
      
      // Cache the analysis
      if (projectAnalysis) {
        await cacheProjectData(
          currentDir,
          projectAnalysis.name || path.basename(currentDir),
          projectAnalysis.language || 'unknown',
          projectAnalysis.framework,
          projectAnalysis.dependencies || [],
          projectAnalysis.size || 0
        );
      }
    }
    
    spinner.text = chalk.hex('#9c88ff')('⚡ Loading analytics data...');
    spinner.stop();
    
    console.log(chalk.green('⚡ Analytics data loaded'));
    console.log();
    
    // Handle specific options
    if (options.current) {
      await displayCurrentProjectInfo(projectAnalysis);
      return;
    }
    
    if (options.system) {
      displaySystemInfo();
      return;
    }
    
    if (options.projects) {
      await displayRecentProjectsInfo(history);
      return;
    }
    
    if (options.commands) {
      displayCommandsGrid();
      return;
    }
    
    if (options.history || options.stats) {
      await displayHistoryAnalytics(options.stats);
      return;
    }
    
    // Display comprehensive dashboard
    createBanner();
    
    if (projectAnalysis) {
      await displayCurrentProjectInfo(projectAnalysis);
    }
    
    displayCommandsGrid();
    displaySystemInfo();
    await displayCacheInfo();
    await displayRecentProjectsInfo(history);
    
    displaySuccessMessage(
      'Analytics dashboard generated successfully!',
      [
        'Project data analyzed and cached',
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
export async function analyzeCurrentProject(): Promise<any> {
  const projectPath = process.cwd();
  const projectName = path.basename(projectPath);
  
  console.log(chalk.hex('#00d2d3')(`\n🔍 ANALYZING PROJECT: ${chalk.white(projectName)}\n`));
  
  // Use enhanced project detection
  let projectInfo = await detectProjectStack(projectPath);
  
  // Fallback to simple analysis if detectProjectStack fails
  if (!projectInfo.framework) {
    const packageJson = path.join(projectPath, 'package.json');
    projectInfo = { 
      framework: 'unknown', 
      language: 'javascript' as SupportedLanguage,
      projectLanguage: 'javascript' as 'javascript' | 'typescript',
      packageManager: 'npm',
      hasSrcFolder: false
    } as any;
    
    if (await fs.pathExists(packageJson)) {
      try {
        const pkg = await fs.readJson(packageJson);
        (projectInfo as any).name = pkg.name || projectName;
        
        // Detect framework from dependencies
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps.next) projectInfo.framework = 'nextjs';
        else if (deps.react) projectInfo.framework = 'reactjs';
        else if (deps.vue) projectInfo.framework = 'vuejs';
        else if (deps.express) projectInfo.framework = 'expressjs';
        else if (deps['@nestjs/core']) projectInfo.framework = 'nestjs';
        
        // Detect language
        if (deps.typescript || pkg.devDependencies?.typescript) {
          projectInfo.language = 'typescript';
          projectInfo.projectLanguage = 'typescript';
        }
        
        // Detect package manager
        if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
          projectInfo.packageManager = 'pnpm';
        } else if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
          projectInfo.packageManager = 'yarn';
        }
        
        // Check for src folder
        projectInfo.hasSrcFolder = await fs.pathExists(path.join(projectPath, 'src'));
        
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not read package.json'));
      }
    }
  }
  
  // Display results
  console.log(chalk.green('✅ Project analysis complete'));
  console.log(`${chalk.blue('Framework:')} ${projectInfo.framework}`);
  console.log(`${chalk.blue('Language:')} ${projectInfo.language || projectInfo.projectLanguage}`);
  console.log(`${chalk.blue('Package Manager:')} ${projectInfo.packageManager}`);
  
  // Add timestamp for cache expiry
  (projectInfo as any).timestamp = Date.now();
  
  return projectInfo;
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

/**
 * Display current project information
 */
async function displayCurrentProjectInfo(projectInfo: any): Promise<void> {
  if (!projectInfo) {
    console.log(chalk.yellow('⚠️  No project information available'));
    return;
  }
  
  console.log(chalk.hex('#00d2d3')('\n📊 CURRENT PROJECT ANALYSIS\n'));
  
  const projectBox = boxen(
    `${chalk.bold.white('Project:')} ${projectInfo.name || 'Unknown'}\n` +
    `${chalk.bold.cyan('Framework:')} ${projectInfo.framework || 'Unknown'}\n` +
    `${chalk.bold.green('Language:')} ${projectInfo.language || projectInfo.projectLanguage || 'Unknown'}\n` +
    `${chalk.bold.yellow('Package Manager:')} ${projectInfo.packageManager || 'npm'}\n` +
    `${chalk.bold.magenta('Has Src Folder:')} ${projectInfo.hasSrcFolder ? 'Yes' : 'No'}`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'blue'
    }
  );
  
  console.log(projectBox);
}

/**
 * Display recent projects information
 */
async function displayRecentProjectsInfo(history: any): Promise<void> {
  console.log(chalk.hex('#00d2d3')('\n📁 RECENT PROJECTS\n'));
  
  if (!history.projects || history.projects.length === 0) {
    console.log(chalk.yellow('⚠️  No recent projects found'));
    return;
  }
  
  const recentProjects = history.projects.slice(0, 5);
  
  recentProjects.forEach((project: any, index: number) => {
    console.log(
      `${chalk.gray(`${index + 1}.`)} ${chalk.white(project.name)} ` +
      `${chalk.gray('(')}${chalk.cyan(project.framework)}${chalk.gray(')')} ` +
      `${chalk.gray('-')} ${chalk.blue(project.language)}`
    );
  });
  
  console.log(chalk.gray(`\nShowing ${recentProjects.length} of ${history.projects.length} projects`));
}

/**
 * Display cache information
 */
async function displayCacheInfo(): Promise<void> {
  console.log(chalk.hex('#00d2d3')('\n🗄️  CACHE INFORMATION\n'));
  
  try {
    const stats = getCacheStats();
    
    const cacheBox = boxen(
      `${chalk.bold.white('Cached Projects:')} ${stats.projects?.length || 0}\n` +
      `${chalk.bold.cyan('Template Files:')} ${Object.keys(stats.templateFiles || {}).length}\n` +
      `${chalk.bold.green('Cache Hits:')} ${stats.hits || 0}\n` +
      `${chalk.bold.yellow('Cache Misses:')} ${stats.misses || 0}\n` +
      `${chalk.bold.magenta('Hit Ratio:')} ${((stats.hits || 0) / Math.max(1, (stats.hits || 0) + (stats.misses || 0)) * 100).toFixed(1)}%`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    );
    
    console.log(cacheBox);
  } catch (error) {
    console.log(chalk.yellow('⚠️  Cache information not available'));
  }
}

/**
 * Display comprehensive history analytics
 */
async function displayHistoryAnalytics(statsOnly: boolean = false): Promise<void> {
  const cacheManager = new CacheManager();
  
  try {
    console.log(chalk.hex('#00d2d3')('📈 HISTORY & ANALYTICS DASHBOARD\n'));
    
    const history = await cacheManager.getHistory();
    const featureStats = await cacheManager.getFeatureStats();
    
    // Overall statistics
    const statsBox = boxen(
      `${chalk.bold.white('Total Projects:')} ${history.projects?.length || 0}\n` +
      `${chalk.bold.cyan('Features Used:')} ${featureStats.totalUsages}\n` +
      `${chalk.bold.green('Unique Features:')} ${featureStats.uniqueFeatures}\n` +
      `${chalk.bold.yellow('Commands Executed:')} ${history.commands?.length || 0}\n` +
      `${chalk.bold.magenta('Success Rate:')} ${featureStats.successRate.toFixed(1)}%`,
      {
        title: '📊 Usage Statistics',
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'blue'
      }
    );
    
    console.log(statsBox);
    
    if (!statsOnly) {
      // Recent projects
      if (history.projects?.length > 0) {
        console.log(chalk.hex('#00d2d3')('\n🏗️  RECENT PROJECTS:'));
        history.projects.slice(0, 8).forEach((project: any, index: number) => {
          const timeAgo = getTimeAgo(project.createdAt);
          const framework = project.framework ? chalk.blue(`[${project.framework}]`) : '';
          console.log(`  ${chalk.white((index + 1).toString().padStart(2))}. ${chalk.white(project.name)} ${framework} ${chalk.gray(`(${timeAgo})`)}`);
          console.log(`      ${chalk.gray(project.path)}`);
          if (project.features?.length) {
            console.log(`      ${chalk.cyan('Features:')} ${project.features.slice(0, 3).join(', ')}${project.features.length > 3 ? '...' : ''}`);
          }
        });
      }
      
      // Feature usage breakdown
      if (Object.keys(featureStats.mostUsedFeatures).length > 0) {
        console.log(chalk.hex('#00d2d3')('\n🧩 FEATURE USAGE BREAKDOWN:'));
        const mostUsed = Object.entries(featureStats.mostUsedFeatures)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10);
          
        mostUsed.forEach(([feature, count], index) => {
          const maxCount = Math.max(...Object.values(featureStats.mostUsedFeatures).map(c => Number(c)));
          const bar = '█'.repeat(Math.max(1, Math.floor((count as number) / maxCount * 20)));
          console.log(`  ${chalk.white((index + 1).toString().padStart(2))}. ${chalk.white(feature.padEnd(25))} ${chalk.cyan(bar)} ${chalk.gray(`(${count} times)`)}`);
        });
      }
      
      // Recent commands
      if (history.commands?.length > 0) {
        console.log(chalk.hex('#00d2d3')('\n⚡ RECENT COMMANDS:'));
        history.commands.slice(0, 10).forEach((cmd: any, index: number) => {
          const timeAgo = getTimeAgo(cmd.executedAt);
          const status = cmd.success ? chalk.green('✓') : chalk.red('✗');
          const duration = cmd.duration ? ` ${chalk.gray(`(${cmd.duration}ms)`)}` : '';
          const args = cmd.args?.length ? chalk.gray(` ${cmd.args.join(' ')}`) : '';
          console.log(`  ${chalk.white((index + 1).toString().padStart(2))}. ${status} ${chalk.white(cmd.command)}${args} ${chalk.gray(`${timeAgo}${duration}`)}`);
        });
      }
      
      // Framework usage statistics
      if (history.projects?.length > 0) {
        const frameworks = history.projects
          .filter((p: any) => p.framework)
          .reduce((acc: Record<string, number>, p: any) => {
            acc[p.framework] = (acc[p.framework] || 0) + 1;
            return acc;
          }, {});
          
        if (Object.keys(frameworks).length > 0) {
          console.log(chalk.hex('#00d2d3')('\n🔧 FRAMEWORK DISTRIBUTION:'));
          Object.entries(frameworks)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .forEach(([framework, count], index) => {
              const percentage = ((count as number) / history.projects.length * 100).toFixed(1);
              const maxCount = Math.max(...Object.values(frameworks).map(c => Number(c)));
              const bar = '█'.repeat(Math.max(1, Math.floor((count as number) / maxCount * 20)));
              console.log(`  ${chalk.white((index + 1).toString().padStart(2))}. ${chalk.white(framework.padEnd(15))} ${chalk.blue(bar)} ${chalk.gray(`${count} projects (${percentage}%)`)}`);
            });
        }
      }
    }
    
    // Performance insights
    console.log(chalk.hex('#00d2d3')('\n🚀 PERFORMANCE INSIGHTS:'));
    if (history.commands?.length > 0) {
      const commandStats = history.commands.reduce((acc: Record<string, {count: number, avgDuration: number, successRate: number}>, cmd: any) => {
        if (!acc[cmd.command]) {
          acc[cmd.command] = { count: 0, avgDuration: 0, successRate: 0 };
        }
        acc[cmd.command].count++;
        if (cmd.duration) {
          acc[cmd.command].avgDuration = (acc[cmd.command].avgDuration * (acc[cmd.command].count - 1) + cmd.duration) / acc[cmd.command].count;
        }
        acc[cmd.command].successRate = (acc[cmd.command].successRate * (acc[cmd.command].count - 1) + (cmd.success ? 1 : 0)) / acc[cmd.command].count;
        return acc;
      }, {});
      
      Object.entries(commandStats)
        .sort(([,a], [,b]) => (b as any).count - (a as any).count)
        .slice(0, 5)
        .forEach(([command, stats]) => {
          const statData = stats as any;
          const avgTime = statData.avgDuration > 0 ? `${statData.avgDuration.toFixed(0)}ms` : 'N/A';
          const successRate = `${(statData.successRate * 100).toFixed(1)}%`;
          console.log(`  ${chalk.white(command.padEnd(12))} - ${chalk.cyan(statData.count)} uses, ${chalk.yellow(avgTime)} avg, ${chalk.green(successRate)} success`);
        });
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to load history analytics:'), error);
  }
}

/**
 * Get human-readable time ago string
 */
function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
