/**
 * Cache Manager - Centralized caching operations for Package Installer CLI
 */

import { cacheManager, ProjectCache, AnalysisCache } from './cache.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

/**
 * Initialize cache system on CLI startup
 */
export async function initializeCache(): Promise<void> {
  await cacheManager.init();
}

/**
 * Check if project has been cached recently
 */
export async function getCachedProject(projectPath: string): Promise<ProjectCache | null> {
  return await cacheManager.getProject(projectPath);
}

/**
 * Cache project analysis data
 */
export async function cacheProjectData(
  projectPath: string,
  name: string,
  language: string,
  framework: string | undefined,
  dependencies: string[],
  size: number
): Promise<void> {
  await cacheManager.setProject({
    path: projectPath,
    name,
    language,
    framework,
    dependencies,
    size
  });
}

/**
 * Get cached analysis results
 */
export async function getCachedAnalysis(projectPath: string): Promise<AnalysisCache | null> {
  return await cacheManager.getAnalysis(projectPath);
}

/**
 * Cache analysis results
 */
export async function cacheAnalysisResults(projectPath: string, analysisStats: any): Promise<void> {
  await cacheManager.setAnalysis(projectPath, analysisStats);
}

/**
 * Check if package version is cached
 */
export async function getCachedPackageVersion(packageName: string): Promise<string | null> {
  const pkg = await cacheManager.getPackage(packageName);
  return pkg ? pkg.latestVersion : null;
}

/**
 * Cache package version information
 */
export async function cachePackageVersion(
  packageName: string,
  currentVersion: string,
  latestVersion: string,
  updateAvailable: boolean
): Promise<void> {
  await cacheManager.setPackage({
    name: packageName,
    version: currentVersion,
    latestVersion,
    updateAvailable
  });
}

/**
 * Get cached node_modules information
 */
export async function getCachedNodeModules(projectPath: string) {
  return await cacheManager.getNodeModules(projectPath);
}

/**
 * Cache node_modules scan results
 */
export async function cacheNodeModulesData(
  projectPath: string,
  packages: string[],
  size: number
): Promise<void> {
  await cacheManager.setNodeModules({
    projectPath,
    packages,
    size
  });
}

/**
 * Get cached system information
 */
export async function getCachedSystemInfo() {
  return await cacheManager.getSystem();
}

/**
 * Cache system information
 */
export async function cacheSystemInfo(
  os: string,
  nodeVersion: string,
  packageManagers: Record<string, string>,
  installedTools: Record<string, string>
): Promise<void> {
  await cacheManager.setSystem({
    os,
    nodeVersion,
    packageManagers,
    installedTools
  });
}

/**
 * Update template usage statistics
 */
export async function updateTemplateUsage(
  templateName: string,
  framework: string,
  language: string,
  features: string[]
): Promise<void> {
  await cacheManager.updateTemplateUsage(templateName, framework, language, features);
}

/**
 * Get template usage statistics for recommendations
 */
export function getTemplateStats() {
  return cacheManager.getTemplateStats();
}

/**
 * Fast directory size calculation with caching
 */
export async function getDirectorySize(dirPath: string, useCache = true): Promise<number> {
  if (useCache) {
    const cached = await getCachedNodeModules(dirPath);
    if (cached) {
      return cached.size;
    }
  }

  try {
    let totalSize = 0;
    
    const calculateSize = async (currentPath: string): Promise<void> => {
      const stats = await fs.stat(currentPath);
      
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        const items = await fs.readdir(currentPath);
        
        // Skip node_modules subdirectories for performance
        const filteredItems = items.filter(item => item !== 'node_modules' || currentPath === dirPath);
        
        await Promise.all(
          filteredItems.map(item => calculateSize(path.join(currentPath, item)))
        );
      }
    };

    await calculateSize(dirPath);
    return totalSize;
  } catch (error) {
    return 0;
  }
}

/**
 * Fast dependency list with caching
 */
export async function getProjectDependencies(projectPath: string, useCache = true): Promise<string[]> {
  if (useCache) {
    const cached = await getCachedProject(projectPath);
    if (cached) {
      return cached.dependencies;
    }
  }

  const dependencies: string[] = [];
  
  // Check package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    try {
      const packageJson = await fs.readJson(packageJsonPath);
      const deps = [
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {})
      ];
      dependencies.push(...deps);
    } catch (error) {
      // Ignore parsing errors
    }
  }

  // Check Cargo.toml
  const cargoTomlPath = path.join(projectPath, 'Cargo.toml');
  if (await fs.pathExists(cargoTomlPath)) {
    try {
      const cargoContent = await fs.readFile(cargoTomlPath, 'utf-8');
      const dependencyMatches = cargoContent.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
      if (dependencyMatches) {
        const depLines = dependencyMatches[1].split('\n').filter(line => line.trim() && !line.startsWith('#'));
        depLines.forEach(line => {
          const match = line.match(/^([a-zA-Z0-9_-]+)\s*=/);
          if (match) {
            dependencies.push(match[1]);
          }
        });
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  // Check requirements.txt
  const requirementsPath = path.join(projectPath, 'requirements.txt');
  if (await fs.pathExists(requirementsPath)) {
    try {
      const content = await fs.readFile(requirementsPath, 'utf-8');
      const deps = content.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('==')[0].split('>=')[0].split('<=')[0].trim());
      dependencies.push(...deps);
    } catch (error) {
      // Ignore parsing errors
    }
  }

  // Check go.mod
  const goModPath = path.join(projectPath, 'go.mod');
  if (await fs.pathExists(goModPath)) {
    try {
      const content = await fs.readFile(goModPath, 'utf-8');
      const requireMatches = content.match(/require\s*\(([\s\S]*?)\)/);
      if (requireMatches) {
        const deps = requireMatches[1].split('\n')
          .filter(line => line.trim() && !line.startsWith('//'))
          .map(line => {
            const match = line.trim().match(/^([^\s]+)/);
            return match ? match[1] : '';
          })
          .filter(dep => dep);
        dependencies.push(...deps);
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  return [...new Set(dependencies)]; // Remove duplicates
}

/**
 * Smart cache-first project scanning
 */
export async function scanProjectWithCache(projectPath: string): Promise<{
  name: string;
  language: string;
  framework?: string;
  dependencies: string[];
  size: number;
  fromCache: boolean;
}> {
  // Try cache first
  const cached = await getCachedProject(projectPath);
  if (cached) {
    return {
      name: cached.name,
      language: cached.language,
      framework: cached.framework,
      dependencies: cached.dependencies,
      size: cached.size,
      fromCache: true
    };
  }

  // Perform actual scan
  const name = path.basename(projectPath);
  const dependencies = await getProjectDependencies(projectPath, false);
  const size = await getDirectorySize(projectPath, false);
  
  // Detect language and framework (simplified detection)
  let language = 'Unknown';
  let framework: string | undefined;

  if (await fs.pathExists(path.join(projectPath, 'package.json'))) {
    language = 'JavaScript/TypeScript';
    
    // Detect framework
    if (await fs.pathExists(path.join(projectPath, 'next.config.js')) || 
        await fs.pathExists(path.join(projectPath, 'next.config.mjs'))) {
      framework = 'Next.js';
    } else if (dependencies.includes('react')) {
      framework = 'React';
    } else if (dependencies.includes('vue')) {
      framework = 'Vue.js';
    } else if (dependencies.includes('express')) {
      framework = 'Express.js';
    } else if (dependencies.includes('@angular/core')) {
      framework = 'Angular';
    }
  } else if (await fs.pathExists(path.join(projectPath, 'Cargo.toml'))) {
    language = 'Rust';
  } else if (await fs.pathExists(path.join(projectPath, 'requirements.txt')) ||
             await fs.pathExists(path.join(projectPath, 'setup.py'))) {
    language = 'Python';
    
    if (dependencies.includes('django')) {
      framework = 'Django';
    } else if (dependencies.includes('flask')) {
      framework = 'Flask';
    }
  } else if (await fs.pathExists(path.join(projectPath, 'go.mod'))) {
    language = 'Go';
  }

  // Cache the results
  await cacheProjectData(projectPath, name, language, framework, dependencies, size);

  return {
    name,
    language,
    framework,
    dependencies,
    size,
    fromCache: false
  };
}

/**
 * Display cache statistics
 */
export async function displayCacheStats(): Promise<void> {
  const stats = cacheManager.getStats();
  const recentProjects = cacheManager.getRecentProjects();
  
  console.log(chalk.cyan('\n🗄️  Cache Statistics:'));
  console.log(chalk.gray(`   Cache Hits: ${stats.hits}`));
  console.log(chalk.gray(`   Cache Misses: ${stats.misses}`));
  console.log(chalk.gray(`   Hit Rate: ${stats.hitRate}`));
  console.log(chalk.gray(`   Cache Size: ${stats.size}`));
  console.log(chalk.gray(`   Cached Projects: ${stats.projects}`));
  console.log(chalk.gray(`   Cached Packages: ${stats.packages}`));
  
  if (recentProjects.length > 0) {
    console.log(chalk.cyan('\n📁 Recent Projects:'));
    recentProjects.slice(0, 5).forEach(project => {
      console.log(chalk.gray(`   ${project.name} (${project.language}${project.framework ? ` - ${project.framework}` : ''})`));
    });
  }
}

/**
 * Clear cache command
 */
export async function clearCache(type?: string): Promise<void> {
  const validTypes = ['projects', 'analysis', 'packages', 'templates', 'nodeModules', 'system', 'all'];
  
  if (type && !validTypes.includes(type)) {
    console.log(chalk.red(`❌ Invalid cache type. Valid types: ${validTypes.join(', ')}`));
    return;
  }

  await cacheManager.clearCache(type as any);
  
  const typeStr = type === 'all' || !type ? 'all caches' : `${type} cache`;
  console.log(chalk.green(`✅ Cleared ${typeStr} successfully`));
}
