/**
 * Cache Manager - Centralized caching operations for Package Installer CLI
 */

import { cacheManager as cacheManagerInstance, ProjectCache, AnalysisCache, TemplateCacheFiles } from './cacheUtils.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

// Export the cache manager instance
export const cacheManager = cacheManagerInstance;

/**
 * Initialize cache system on CLI startup
 */
export async function initializeCache(): Promise<void> {
  await cacheManagerInstance.init();
}

/**
 * Check if project has been cached recently
 */
export async function getCachedProject(projectPath: string): Promise<ProjectCache | null> {
  return await cacheManagerInstance.getProject(projectPath);
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
  await cacheManagerInstance.setProject({
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
  return await cacheManagerInstance.getAnalysis(projectPath);
}

/**
 * Cache analysis results
 */
export async function cacheAnalysisResults(projectPath: string, analysisStats: any): Promise<void> {
  await cacheManagerInstance.setAnalysis(projectPath, analysisStats);
}

/**
 * Check if package version is cached
 */
export async function getCachedPackageVersion(packageName: string): Promise<string | null> {
  const pkg = await cacheManagerInstance.getPackage(packageName);
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
  await cacheManagerInstance.setPackage({
    name: packageName,
    version: currentVersion,
    latestVersion,
    updateAvailable
  });
}

/**
 * Get cached template files
 */
export async function getCachedTemplateFiles(templateName: string): Promise<TemplateCacheFiles | null> {
  return await cacheManagerInstance.getTemplateFiles(templateName);
}

/**
 * Cache template files
 */
export async function cacheTemplateFiles(
  templateName: string,
  templatePath: string,
  files: Record<string, string>,
  size: number
): Promise<void> {
  await cacheManagerInstance.setTemplateFiles({
    templateName,
    templatePath,
    files,
    size
  });
}

/**
 * Get cached system information
 */
export async function getCachedSystemInfo() {
  return await cacheManagerInstance.getSystem();
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
  await cacheManagerInstance.setSystem({
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
  await cacheManagerInstance.updateTemplateUsage(templateName, framework, language, features);
}

/**
 * Get template usage statistics for recommendations
 */
export function getTemplateStats() {
  return cacheManagerInstance.getTemplateStats();
}

/**
 * Fast directory size calculation for templates
 */
export async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    let totalSize = 0;
    
    const calculateSize = async (currentPath: string): Promise<void> => {
      const stats = await fs.stat(currentPath);
      
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        const items = await fs.readdir(currentPath);
        
        // Skip common directories that shouldn't be cached
        const filteredItems = items.filter(item => 
          !['node_modules', '.git', 'dist', 'build', '.next', '.nuxt'].includes(item)
        );
        
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
 * Fast dependency list with caching for multiple languages
 */
export async function getProjectDependencies(projectPath: string, useCache = true): Promise<string[]> {
  if (useCache) {
    const cached = await getCachedProject(projectPath);
    if (cached) {
      return cached.dependencies;
    }
  }

  const dependencies: string[] = [];
  
  // Check package.json (Node.js)
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

  // Check Cargo.toml (Rust)
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

  // Check requirements.txt (Python)
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

  // Check pipfile (Python - Pipenv)
  const pipfilePath = path.join(projectPath, 'Pipfile');
  if (await fs.pathExists(pipfilePath)) {
    try {
      const content = await fs.readFile(pipfilePath, 'utf-8');
      const packageMatches = content.match(/\[packages\]([\s\S]*?)(?=\[|$)/);
      if (packageMatches) {
        const depLines = packageMatches[1].split('\n').filter(line => line.trim() && !line.startsWith('#'));
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

  // Check go.mod (Go)
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

  // Check composer.json (PHP)
  const composerJsonPath = path.join(projectPath, 'composer.json');
  if (await fs.pathExists(composerJsonPath)) {
    try {
      const composerJson = await fs.readJson(composerJsonPath);
      const deps = [
        ...Object.keys(composerJson.require || {}),
        ...Object.keys(composerJson['require-dev'] || {})
      ];
      dependencies.push(...deps);
    } catch (error) {
      // Ignore parsing errors
    }
  }

  // Check Gemfile (Ruby)
  const gemfilePath = path.join(projectPath, 'Gemfile');
  if (await fs.pathExists(gemfilePath)) {
    try {
      const content = await fs.readFile(gemfilePath, 'utf-8');
      const gemMatches = content.match(/gem\s+['"]([^'"]+)['"]/g);
      if (gemMatches) {
        const gems = gemMatches.map(match => {
          const gemMatch = match.match(/gem\s+['"]([^'"]+)['"]/);
          return gemMatch ? gemMatch[1] : '';
        }).filter(gem => gem);
        dependencies.push(...gems);
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
  const size = await getDirectorySize(projectPath);
  
  // Detect language and framework (enhanced detection for multiple languages)
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
    } else if (dependencies.includes('@nestjs/core')) {
      framework = 'NestJS';
    }
  } else if (await fs.pathExists(path.join(projectPath, 'Cargo.toml'))) {
    language = 'Rust';
    
    // Check for common Rust frameworks
    if (dependencies.includes('actix-web')) {
      framework = 'Actix Web';
    } else if (dependencies.includes('warp')) {
      framework = 'Warp';
    } else if (dependencies.includes('rocket')) {
      framework = 'Rocket';
    } else if (dependencies.includes('axum')) {
      framework = 'Axum';
    }
  } else if (await fs.pathExists(path.join(projectPath, 'requirements.txt')) ||
             await fs.pathExists(path.join(projectPath, 'setup.py')) ||
             await fs.pathExists(path.join(projectPath, 'Pipfile'))) {
    language = 'Python';
    
    if (dependencies.includes('django')) {
      framework = 'Django';
    } else if (dependencies.includes('flask')) {
      framework = 'Flask';
    } else if (dependencies.includes('fastapi')) {
      framework = 'FastAPI';
    } else if (dependencies.includes('tornado')) {
      framework = 'Tornado';
    }
  } else if (await fs.pathExists(path.join(projectPath, 'go.mod'))) {
    language = 'Go';
    
    if (dependencies.some(dep => dep.includes('gin-gonic/gin'))) {
      framework = 'Gin';
    } else if (dependencies.some(dep => dep.includes('gorilla/mux'))) {
      framework = 'Gorilla Mux';
    } else if (dependencies.some(dep => dep.includes('echo'))) {
      framework = 'Echo';
    }
  } else if (await fs.pathExists(path.join(projectPath, 'composer.json'))) {
    language = 'PHP';
    
    if (dependencies.includes('laravel/framework')) {
      framework = 'Laravel';
    } else if (dependencies.includes('symfony/symfony')) {
      framework = 'Symfony';
    } else if (dependencies.includes('slim/slim')) {
      framework = 'Slim';
    }
  } else if (await fs.pathExists(path.join(projectPath, 'Gemfile'))) {
    language = 'Ruby';
    
    if (dependencies.includes('rails')) {
      framework = 'Ruby on Rails';
    } else if (dependencies.includes('sinatra')) {
      framework = 'Sinatra';
    }
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
  const stats = cacheManagerInstance.getStats();
  const recentProjects = cacheManagerInstance.getRecentProjects();
  
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
  const validTypes = ['projects', 'analysis', 'packages', 'templates', 'templateFiles', 'system', 'all'];
  
  if (type && !validTypes.includes(type)) {
    console.log(chalk.red(`❌ Invalid cache type. Valid types: ${validTypes.join(', ')}`));
    return;
  }

  await cacheManagerInstance.clearCache(type as any);
  
  const typeStr = type === 'all' || !type ? 'all caches' : `${type} cache`;
  console.log(chalk.green(`✅ Cleared ${typeStr} successfully`));
}
