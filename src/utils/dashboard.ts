/**
 * Advanced Dashboard Utility
 * Creates beautiful terminal interfaces with advanced styling
 */

import chalk from 'chalk';
import figlet from 'figlet';
import gradientString from 'gradient-string';
import Table from 'cli-table3';
import boxen from 'boxen';
import fs from 'fs-extra';
import path from 'path';
import { detectProjectLanguage } from './dependencyInstaller.js';

export interface DashboardStats {
  totalProjects: number;
  languageBreakdown: Record<string, number>;
  frameworkBreakdown: Record<string, number>;
  recentProjects: string[];
  featuresUsed: string[];
  cacheHits: number;
}

export interface ProjectInfo {
  name: string;
  path: string;
  language: string;
  framework?: string;
  lastModified: Date;
  size: number;
}

/**
 * Create an amazing CLI banner
 */
export function createBanner(title: string = 'Package Installer CLI'): void {
  console.clear();
  
  // Create figlet text
  const figletText = figlet.textSync(title.length > 15 ? 'PKG CLI' : title, {
    font: 'ANSI Shadow',
    horizontalLayout: 'fitted',
    width: 80
  });
  
  // Apply gradient
  const gradientText = gradientString('cyan', 'magenta', 'yellow')(figletText);
  
  // Create a box around it
  const banner = boxen(gradientText, {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'cyan',
    backgroundColor: '#1a1a1a'
  });
  
  console.log(banner);
  
  // Add tagline
  const tagline = chalk.hex('#00d2d3')('🚀 The Ultimate Developer Productivity Tool');
  const version = chalk.hex('#95afc0')('v2.4.0');
  const author = chalk.hex('#ffa502')('by @0xshariq');
  
  const centered = `${tagline} ${version} ${author}`;
  const padding = Math.max(0, Math.floor(((process.stdout.columns || 80) - centered.length) / 2));
  console.log(' '.repeat(padding) + centered);
  console.log();
}

/**
 * Display project statistics in a beautiful table
 */
export function displayProjectStats(stats: DashboardStats): void {
  console.log(gradientString('cyan', 'magenta')('📊 PROJECT STATISTICS\n'));
  
  // Main stats table
  const statsTable = new Table({
    head: [
      chalk.hex('#00d2d3')('Metric'),
      chalk.hex('#10ac84')('Value'),
      chalk.hex('#ffa502')('Details')
    ],
    colWidths: [25, 15, 40],
    style: {
      head: [],
      border: ['cyan']
    }
  });
  
  statsTable.push(
    [
      chalk.white('🏗️  Total Projects'),
      chalk.green(stats.totalProjects.toString()),
      chalk.gray('Projects created with CLI')
    ],
    [
      chalk.white('📝 Languages Used'),
      chalk.blue(Object.keys(stats.languageBreakdown).length.toString()),
      chalk.gray(Object.keys(stats.languageBreakdown).join(', '))
    ],
    [
      chalk.white('🎯 Frameworks Used'),
      chalk.cyan(Object.keys(stats.frameworkBreakdown).length.toString()),
      chalk.gray(Object.keys(stats.frameworkBreakdown).join(', '))
    ],
    [
      chalk.white('⚡ Cache Hits'),
      chalk.yellow(stats.cacheHits.toString()),
      chalk.gray('Cached preferences used')
    ],
    [
      chalk.white('� Features Added'),
      chalk.magenta(stats.featuresUsed.length.toString()),
      chalk.gray(stats.featuresUsed.slice(0, 3).join(', '))
    ]
  );
  
  console.log(statsTable.toString());
  
  // Language breakdown pie chart (text-based)
  if (Object.keys(stats.languageBreakdown).length > 0) {
    console.log('\n' + gradientString('yellow', 'red')('🎯 LANGUAGE BREAKDOWN\n'));
    
    const total = Object.values(stats.languageBreakdown).reduce((a, b) => a + b, 0);
    const langTable = new Table({
      head: [
        chalk.hex('#ffa502')('Language'),
        chalk.hex('#00d2d3')('Projects'),
        chalk.hex('#10ac84')('Percentage'),
        chalk.hex('#95afc0')('Visual')
      ],
      style: {
        head: [],
        border: ['yellow']
      }
    });
    
    for (const [lang, count] of Object.entries(stats.languageBreakdown)) {
      const percentage = ((count / total) * 100).toFixed(1);
      const barLength = Math.round((count / total) * 20);
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
      
      langTable.push([
        getLanguageIcon(lang) + ' ' + chalk.white(lang),
        chalk.cyan(count.toString()),
        chalk.green(percentage + '%'),
        chalk.hex('#00d2d3')(bar)
      ]);
    }
    
    console.log(langTable.toString());
  }
  
  // Framework breakdown display
  if (Object.keys(stats.frameworkBreakdown).length > 0) {
    console.log('\n' + gradientString('magenta', 'cyan')('🎯 FRAMEWORK BREAKDOWN\n'));
    
    const total = Object.values(stats.frameworkBreakdown).reduce((a, b) => a + b, 0);
    const frameworkTable = new Table({
      head: [
        chalk.hex('#ff6b6b')('Framework'),
        chalk.hex('#00d2d3')('Projects'),
        chalk.hex('#10ac84')('Percentage'),
        chalk.hex('#95afc0')('Visual')
      ],
      style: {
        head: [],
        border: ['magenta']
      }
    });
    
    for (const [framework, count] of Object.entries(stats.frameworkBreakdown)) {
      const percentage = ((count / total) * 100).toFixed(1);
      const barLength = Math.round((count / total) * 20);
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
      
      frameworkTable.push([
        getFrameworkIcon(framework) + ' ' + chalk.white(framework),
        chalk.cyan(count.toString()),
        chalk.green(percentage + '%'),
        chalk.hex('#ff6b6b')(bar)
      ]);
    }
    
    console.log(frameworkTable.toString());
  }
}

/**
 * Display recent projects in a beautiful format
 */
export function displayRecentProjects(projects: ProjectInfo[]): void {
  if (projects.length === 0) return;
  
  console.log('\n' + gradientString('green', 'blue')('📂 RECENT PROJECTS\n'));
  
  const projectTable = new Table({
    head: [
      chalk.hex('#10ac84')('Project'),
      chalk.hex('#00d2d3')('Language'),
      chalk.hex('#ffa502')('Framework'),
      chalk.hex('#95afc0')('Size'),
      chalk.hex('#ff6b6b')('Last Modified')
    ],
    style: {
      head: [],
      border: ['green']
    }
  });
  
  projects.slice(0, 10).forEach(project => {
    projectTable.push([
      chalk.white('📁 ' + project.name),
      getLanguageIcon(project.language) + ' ' + chalk.cyan(project.language),
      chalk.yellow(project.framework || 'N/A'),
      chalk.magenta(formatFileSize(project.size)),
      chalk.gray(formatDate(project.lastModified))
    ]);
  });
  
  console.log(projectTable.toString());
}

/**
 * Display available commands in a beautiful grid
 */
export function displayCommandsGrid(): void {
  console.log('\n' + gradientString('purple', 'pink')('🎯 AVAILABLE COMMANDS\n'));
  
  const commands = [
    {
      name: 'create',
      description: 'Create new projects from templates',
      icon: '🏗️',
      color: '#00d2d3'
    },
    {
      name: 'analyze',
      description: 'Analyze project structure and dependencies',
      icon: '🔍',
      color: '#9c88ff'
    },
    {
      name: 'update',
      description: 'Update packages to latest versions',
      icon: '�',
      color: '#ff6b6b'
    },
    {
      name: 'add',
      description: 'Add features to existing projects',
      icon: '➕',
      color: '#ffa502'
    },
    {
      name: 'check',
      description: 'Check project health and issues',
      icon: '�',
      color: '#54a0ff'
    },
    {
      name: 'clean',
      description: 'Clean development artifacts (Coming Soon)',
      icon: '🧹',
      color: '#00d2d3'
    },
    {
      name: 'clone',
      description: 'Clone and setup repositories (Coming Soon)',
      icon: '�',
      color: '#10ac84'
    },
    {
      name: 'deploy',
      description: 'Deploy projects to platforms (Coming Soon)',
      icon: '🚀',
      color: '#ff9ff3'
    },
    {
      name: 'doctor',
      description: 'Diagnose and fix project issues (Coming Soon)',
      icon: '🩺',
      color: '#00d2d3'
    },
    {
      name: 'env',
      description: 'Manage environment variables (Coming Soon)',
      icon: '🌍',
      color: '#10ac84'
    },
    {
      name: 'upgrade-cli',
      description: 'Upgrade CLI to latest version',
      icon: '⬆️',
      color: '#5f27cd'
    }
  ];
  
  const commandTable = new Table({
    head: [
      chalk.hex('#ff6b6b')('Command'),
      chalk.hex('#00d2d3')('Description'),
      chalk.hex('#10ac84')('Usage')
    ],
    colWidths: [15, 40, 25],
    style: {
      head: [],
      border: ['magenta']
    }
  });
  
  commands.forEach(cmd => {
    commandTable.push([
      chalk.hex(cmd.color)(cmd.icon + ' ' + cmd.name),
      chalk.white(cmd.description),
      chalk.gray(`pi ${cmd.name}`)
    ]);
  });
  
  console.log(commandTable.toString());
}

/**
 * Create an interactive system info panel
 */
export function displaySystemInfo(): void {
  console.log('\n' + gradientString('orange', 'red')('💻 SYSTEM INFORMATION\n'));
  
  const systemTable = new Table({
    head: [
      chalk.hex('#ffa502')('Property'),
      chalk.hex('#00d2d3')('Value')
    ],
    colWidths: [20, 40],
    style: {
      head: [],
      border: ['yellow']
    }
  });
  
  systemTable.push(
    [chalk.white('🖥️  Platform'), chalk.cyan(process.platform)],
    [chalk.white('⚡ Node Version'), chalk.green(process.version)],
    [chalk.white('📁 Working Directory'), chalk.gray(process.cwd().replace(process.env.HOME || '', '~'))],
    [chalk.white('🔧 Architecture'), chalk.blue(process.arch)],
    [chalk.white('💾 Memory Usage'), chalk.magenta(formatMemory(process.memoryUsage().heapUsed))]
  );
  
  console.log(systemTable.toString());
}

/**
 * Create a beautiful loading animation
 */
export function createLoadingAnimation(message: string): NodeJS.Timer {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  return setInterval(() => {
    process.stdout.write('\r' + chalk.hex('#00d2d3')(frames[i]) + ' ' + chalk.white(message));
    i = (i + 1) % frames.length;
  }, 100);
}

/**
 * Display success message with celebration
 */
export function displaySuccessMessage(message: string, details?: string[]): void {
  const box = boxen(
    `${chalk.green('✨ SUCCESS! ✨')}\n\n${chalk.white(message)}${
      details ? '\n\n' + details.map(d => chalk.gray('• ' + d)).join('\n') : ''
    }`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'green',
      backgroundColor: '#0a3d0a'
    }
  );
  
  console.log('\n' + box);
}

/**
 * Display error message with helpful information
 */
export function displayErrorMessage(message: string, suggestions?: string[]): void {
  const box = boxen(
    `${chalk.red('❌ ERROR! ❌')}\n\n${chalk.white(message)}${
      suggestions ? '\n\n' + chalk.yellow('Suggestions:') + '\n' + 
      suggestions.map(s => chalk.gray('• ' + s)).join('\n') : ''
    }`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'red',
      backgroundColor: '#3d0a0a'
    }
  );
  
  console.log('\n' + box);
}

/**
 * Create a progress bar
 */
export function createProgressBar(current: number, total: number, width: number = 40): string {
  const percentage = current / total;
  const filled = Math.round(width * percentage);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = (percentage * 100).toFixed(1);
  
  return `${chalk.hex('#00d2d3')(bar)} ${chalk.white(percent)}% (${current}/${total})`;
}

// Helper functions
function getLanguageIcon(language: string): string {
  const icons: Record<string, string> = {
    'nodejs': '🟢',
    'typescript': '🔵',
    'javascript': '🟡',
    'rust': '🦀',
    'python': '🐍',
    'go': '🐹',
    'java': '☕',
    'php': '🐘',
    'ruby': '💎',
    'nextjs': '⚫',
    'reactjs': '⚛️',
    'vuejs': '💚',
    'angularjs': '🅰️',
    'express': '🚂',
    'nestjs': '🔴'
  };
  
  return icons[language.toLowerCase()] || '📄';
}

function getFrameworkIcon(framework: string): string {
  const icons: Record<string, string> = {
    'next.js': '⚫',
    'nextjs': '⚫',
    'react': '⚛️',
    'reactjs': '⚛️',
    'vue.js': '💚',
    'vue': '💚',
    'vuejs': '💚',
    'angular': '🅰️',
    'angularjs': '🅰️',
    'express': '🚂',
    'express.js': '🚂',
    'nestjs': '🔴',
    'nest.js': '🔴',
    'rust': '🦀',
    'django': '🐍',
    'flask': '🐍',
    'spring': '🍃',
    'laravel': '🔴'
  };
  
  return icons[framework.toLowerCase()] || '🏗️';
}

function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function formatMemory(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

/**
 * Get project statistics from workspace
 */
/**
 * Detect project framework based on configuration files
 */
async function detectProjectFramework(projectPath: string): Promise<string | null> {
  try {
    // Check for Next.js
    if (await fs.pathExists(path.join(projectPath, 'next.config.js')) || 
        await fs.pathExists(path.join(projectPath, 'next.config.mjs')) ||
        await fs.pathExists(path.join(projectPath, 'next.config.ts'))) {
      return 'Next.js';
    }
    
    // Check for Angular
    if (await fs.pathExists(path.join(projectPath, 'angular.json'))) {
      return 'Angular';
    }
    
    // Check for Vue
    if (await fs.pathExists(path.join(projectPath, 'vue.config.js')) ||
        await fs.pathExists(path.join(projectPath, 'vite.config.js'))) {
      const packageJson = path.join(projectPath, 'package.json');
      if (await fs.pathExists(packageJson)) {
        const pkg = await fs.readJson(packageJson);
        if (pkg.dependencies?.vue || pkg.devDependencies?.vue) {
          return 'Vue.js';
        }
        if (pkg.dependencies?.react || pkg.devDependencies?.react) {
          return 'React';
        }
      }
    }
    
    // Check for Express
    const packageJson = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJson)) {
      const pkg = await fs.readJson(packageJson);
      if (pkg.dependencies?.express || pkg.devDependencies?.express) {
        return 'Express';
      }
    }
    
    // Check for Rust
    if (await fs.pathExists(path.join(projectPath, 'Cargo.toml'))) {
      return 'Rust';
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Detect features/technologies used in a project
 */
export async function detectProjectFeatures(projectPath: string, featuresArray: string[]): Promise<void> {
  try {
    // Check package.json for dependencies
    const packageJson = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJson)) {
      const pkg = await fs.readJson(packageJson);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      // Common feature detection
      const featureMap: Record<string, string> = {
        'tailwindcss': 'Tailwind CSS',
        '@tailwindcss/forms': 'Tailwind CSS',
        'typescript': 'TypeScript',
        'vite': 'Vite',
        'shadcn-ui': 'shadcn/ui',
        '@shadcn/ui': 'shadcn/ui',
        '@mui/material': 'Material-UI',
        '@material-ui/core': 'Material-UI',
        'jest': 'Jest Testing',
        'vitest': 'Vitest Testing',
        'prisma': 'Prisma ORM',
        '@prisma/client': 'Prisma ORM',
        'mongoose': 'MongoDB/Mongoose',
        'axios': 'Axios HTTP',
        'react-query': 'React Query',
        '@tanstack/react-query': 'TanStack Query',
        'zustand': 'Zustand State',
        'redux': 'Redux',
        '@reduxjs/toolkit': 'Redux Toolkit',
        'framer-motion': 'Framer Motion',
        'next-auth': 'NextAuth.js',
        'passport': 'Passport.js',
        'express': 'Express.js',
        'fastify': 'Fastify',
        'socket.io': 'Socket.IO',
        'graphql': 'GraphQL',
        '@apollo/client': 'Apollo GraphQL',
        'styled-components': 'Styled Components',
        'emotion': '@emotion/react',
        'chakra-ui': 'Chakra UI',
        '@chakra-ui/react': 'Chakra UI',
        'antd': 'Ant Design',
        'react-router-dom': 'React Router',
        'vue-router': 'Vue Router',
        'nuxt': 'Nuxt.js',
        '@nuxt/content': 'Nuxt Content',
        'svelte': 'Svelte',
        'sveltekit': 'SvelteKit',
        '@sveltejs/kit': 'SvelteKit'
      };
      
      Object.keys(allDeps).forEach(dep => {
        if (featureMap[dep] && !featuresArray.includes(featureMap[dep])) {
          featuresArray.push(featureMap[dep]);
        }
      });
    }
    
    // Check for configuration files
    const configFiles: Record<string, string> = {
      'tailwind.config.js': 'Tailwind CSS',
      'tailwind.config.ts': 'Tailwind CSS',
      'postcss.config.js': 'PostCSS',
      'vite.config.js': 'Vite',
      'vite.config.ts': 'Vite',
      'jest.config.js': 'Jest Testing',
      'vitest.config.js': 'Vitest Testing',
      'prisma/schema.prisma': 'Prisma ORM',
      'docker-compose.yml': 'Docker',
      'Dockerfile': 'Docker',
      '.github/workflows': 'GitHub Actions',
      'vercel.json': 'Vercel',
      'netlify.toml': 'Netlify'
    };
    
    for (const [file, feature] of Object.entries(configFiles)) {
      if (await fs.pathExists(path.join(projectPath, file))) {
        if (!featuresArray.includes(feature)) {
          featuresArray.push(feature);
        }
      }
    }
    
  } catch (error) {
    // Ignore errors in feature detection
  }
}

export async function gatherProjectStats(workspacePath: string = process.cwd()): Promise<DashboardStats> {
  const stats: DashboardStats = {
    totalProjects: 0,
    languageBreakdown: {},
    frameworkBreakdown: {},
    recentProjects: [],
    featuresUsed: [],
    cacheHits: 0
  };
  
  try {
    // Check for cache file
    const cacheFile = path.join(process.env.HOME || '', '.pi-cache.json');
    if (await fs.pathExists(cacheFile)) {
      const cache = await fs.readJson(cacheFile);
      stats.cacheHits = cache.usageCount || 0;
      
      if (cache.recentProjects) {
        stats.recentProjects = cache.recentProjects.slice(0, 5);
        stats.totalProjects = cache.recentProjects.length;
      }
      
      if (cache.featuresUsed) {
        stats.featuresUsed = cache.featuresUsed;
      }
    }
    
    // Scan for actual projects in common directories
    const recentProjects = await scanForRecentProjects();
    if (recentProjects.length > 0) {
      stats.totalProjects = recentProjects.length;
      stats.recentProjects = recentProjects.slice(0, 5).map(p => p.name);
      
      // Count real language and framework usage from scanned projects
      for (const project of recentProjects) {
        // Count languages
        const languages = await detectProjectLanguage(project.path);
        languages.forEach(lang => {
          stats.languageBreakdown[lang] = (stats.languageBreakdown[lang] || 0) + 1;
        });
        
        // Count frameworks
        const framework = await detectProjectFramework(project.path);
        if (framework) {
          stats.frameworkBreakdown[framework] = (stats.frameworkBreakdown[framework] || 0) + 1;
        }
        
        // Detect features used
        await detectProjectFeatures(project.path, stats.featuresUsed);
      }
    }
    
    // Also analyze current project if it's different from scanned ones
    try {
      const currentProjectName = path.basename(workspacePath);
      const isCurrentProjectScanned = recentProjects.some(p => p.name === currentProjectName);
      
      if (!isCurrentProjectScanned) {
        const languages = await detectProjectLanguage(workspacePath);
        languages.forEach(lang => {
          stats.languageBreakdown[lang] = (stats.languageBreakdown[lang] || 0) + 1;
        });
        
        const framework = await detectProjectFramework(workspacePath);
        if (framework) {
          stats.frameworkBreakdown[framework] = (stats.frameworkBreakdown[framework] || 0) + 1;
        }
        
        await detectProjectFeatures(workspacePath, stats.featuresUsed);
      }
    } catch (error) {
      // Ignore if not in a valid project
    }
    
    // Remove duplicates from features
    stats.featuresUsed = [...new Set(stats.featuresUsed)];
    
    // If no projects found, provide a minimal real-time status
    if (stats.totalProjects === 0) {
      stats.totalProjects = 0;
      stats.languageBreakdown = {};
      stats.frameworkBreakdown = {};
      stats.featuresUsed = ['No projects detected'];
      stats.cacheHits = 0;
    }
    
  } catch (error) {
    console.error('Error gathering project stats:', error);
    // Return current workspace analysis as fallback
    try {
      const currentLangs = await detectProjectLanguage(workspacePath);
      const currentFramework = await detectProjectFramework(workspacePath);
      
      stats.totalProjects = 1;
      currentLangs.forEach(lang => {
        stats.languageBreakdown[lang] = 1;
      });
      if (currentFramework) {
        stats.frameworkBreakdown[currentFramework] = 1;
      }
      await detectProjectFeatures(workspacePath, stats.featuresUsed);
    } catch (innerError) {
      stats.featuresUsed = ['Error scanning projects'];
    }
  }
  
  return stats;
}

/**
 * Scan for recent projects in common directories
 */
export async function scanForRecentProjects(): Promise<ProjectInfo[]> {
  const projects: ProjectInfo[] = [];
  const commonDirs = [
    path.join(process.env.HOME || '', 'Desktop'),
    path.join(process.env.HOME || '', 'Documents'),
    path.join(process.env.HOME || '', 'Projects'),
    path.join(process.env.HOME || '', 'Code'),
    process.cwd()
  ];
  
  for (const dir of commonDirs) {
    try {
      if (await fs.pathExists(dir)) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries.slice(0, 20)) { // Limit to prevent too much scanning
          if (entry.isDirectory()) {
            const projectPath = path.join(dir, entry.name);
            
            // Check if it's a valid project
            const hasPackageJson = await fs.pathExists(path.join(projectPath, 'package.json'));
            const hasCargoToml = await fs.pathExists(path.join(projectPath, 'Cargo.toml'));
            const hasRequirementsTxt = await fs.pathExists(path.join(projectPath, 'requirements.txt'));
            
            if (hasPackageJson || hasCargoToml || hasRequirementsTxt) {
              const stats = await fs.stat(projectPath);
              const languages = await detectProjectLanguage(projectPath);
              
              projects.push({
                name: entry.name,
                path: projectPath,
                language: languages[0] || 'unknown',
                lastModified: stats.mtime,
                size: stats.size
              });
            }
          }
        }
      }
    } catch (error) {
      // Continue if directory can't be read
    }
  }
  
  return projects.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()).slice(0, 10);
}
