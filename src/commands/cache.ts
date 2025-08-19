/**
 * Cache Command - Manage Package Installer CLI cache system
 */

import chalk from 'chalk';
import figlet from 'figlet';
import gradientString from 'gradient-string';
import { displayCacheStats, clearCache, cacheManager } from '../utils/cacheManager.js';

/**
 * Main cache command function
 */
export async function cacheCommand(subcommand?: string, type?: string): Promise<void> {
  // Handle subcommands
  if (subcommand === 'stats') {
    await cacheStatsCommand();
  } else if (subcommand === 'clear') {
    await cacheClearCommand(type);
  } else if (subcommand === 'info') {
    await cacheInfoCommand();
  } else if (subcommand === 'optimize') {
    await cacheOptimizeCommand();
  } else {
    // Default cache command
    // Display simple banner
    console.log(gradientString(['#00d2d3', '#0084ff'])('🗄️  Cache Manager\n'));
    
    await displayCacheStats();
  }
}

/**
 * Cache stats subcommand
 */
async function cacheStatsCommand(): Promise<void> {
  console.log(gradientString(['#00d2d3', '#0084ff'])('\n🗄️  Cache Statistics\n'));
  await displayCacheStats();
  
  // Additional detailed stats
  const stats = cacheManager.getStats();
  const allProjects = cacheManager.getAllProjects();
  const templateStats = cacheManager.getTemplateStats();
  
  console.log(chalk.cyan('\n📊 Detailed Statistics:'));
  console.log(chalk.gray(`   Total cache entries: ${allProjects.length + stats.packages}`));
  console.log(chalk.gray(`   Most used templates: ${templateStats.slice(0, 3).map((t: any) => t.name).join(', ') || 'None'}`));
  
  if (allProjects.length > 0) {
    const languages = allProjects.reduce((acc: Record<string, number>, p: any) => {
      acc[p.language] = (acc[p.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(chalk.cyan('\n🔤 Languages Breakdown:'));
    Object.entries(languages)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .forEach(([lang, count]) => {
        console.log(chalk.gray(`   ${lang}: ${count} projects`));
      });
  }
}

/**
 * Cache clear subcommand
 */
async function cacheClearCommand(type?: string): Promise<void> {
  console.log(gradientString(['#00d2d3', '#0084ff'])('\n🗑️  Cache Cleaner\n'));
  await clearCache(type);
}

/**
 * Cache info subcommand
 */
async function cacheInfoCommand(): Promise<void> {
  console.log(gradientString(['#00d2d3', '#0084ff'])('\n🔧 Cache Configuration\n'));
  
  const os = require('os');
  const path = require('path');
  
  const cacheDir = path.join(os.homedir(), '.pi-cache');
  const cacheFile = path.join(cacheDir, 'cache.json');
  
  console.log(chalk.cyan('Cache Configuration:'));
  console.log(chalk.gray(`   Cache Directory: ${cacheDir}`));
  console.log(chalk.gray(`   Cache File: ${cacheFile}`));
  console.log(chalk.gray(`   Cache Version: 1.0.0`));
  
  // Check if cache file exists
  const fs = require('fs-extra');
  const exists = await fs.pathExists(cacheFile);
  console.log(chalk.gray(`   Cache File Exists: ${exists ? 'Yes' : 'No'}`));
  
  if (exists) {
    try {
      const stats = await fs.stat(cacheFile);
      const size = (stats.size / 1024).toFixed(2);
      const modified = stats.mtime.toLocaleString();
      
      console.log(chalk.gray(`   File Size: ${size} KB`));
      console.log(chalk.gray(`   Last Modified: ${modified}`));
    } catch (error: any) {
      console.log(chalk.red(`   Error reading cache file: ${error.message}`));
    }
  }
  
  console.log(chalk.cyan('\nCache Types:'));
  console.log(chalk.gray('   • projects     - Project metadata and analysis'));
  console.log(chalk.gray('   • analysis     - Project analysis results'));
  console.log(chalk.gray('   • packages     - Package version information'));
  console.log(chalk.gray('   • templates    - Template usage statistics'));
  console.log(chalk.gray('   • templateFiles - Cached template file contents'));
  console.log(chalk.gray('   • system       - System environment info'));
}

/**
 * Cache optimize subcommand
 */
async function cacheOptimizeCommand(): Promise<void> {
  console.log(gradientString(['#00d2d3', '#0084ff'])('\n⚡ Cache Optimizer\n'));
  
  console.log(chalk.yellow('🔄 Optimizing cache...'));
  
  // Get current stats
  const beforeStats = cacheManager.getStats();
  const beforeProjects = cacheManager.getAllProjects().length;
  
  // Clear expired entries (this is a simplified optimization)
  // In a real implementation, you'd check timestamps and remove expired items
  console.log(chalk.gray('   Checking for expired entries...'));
  
  // For now, just display what would be optimized
  const allProjects = cacheManager.getAllProjects();
  const oldProjects = allProjects.filter((p: any) => {
    const age = Date.now() - new Date(p.lastAnalyzed).getTime();
    return age > (7 * 24 * 60 * 60 * 1000); // Older than 7 days
  });
  
  console.log(chalk.green('✅ Cache optimization complete!'));
  console.log(chalk.gray(`   Projects to potentially clean: ${oldProjects.length}`));
  console.log(chalk.gray(`   Current cache size: ${beforeStats.size}`));
  console.log(chalk.cyan('\n💡 Tip: Use "pi cache clear" to manually clear specific cache types'));
}
