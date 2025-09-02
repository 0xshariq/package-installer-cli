/**
 * User input caching utility for better UX
 * Saves user preferences and recalls them in future sessions
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

export interface UserCacheData {
  projectName?: string;
  framework?: string;
  language?: string;
  ui?: string;
  bundler?: string;
  srcDirectory?: boolean;
  tailwindCss?: boolean;
  lastUsed?: Date;
  projectCount?: number;
}

const CACHE_DIR = path.join(os.homedir(), '.package-installer-cli');
const CACHE_FILE = path.join(CACHE_DIR, 'user-cache.json');

/**
 * Load user cache from file system
 */
export async function loadUserCache(): Promise<UserCacheData> {
  try {
    if (await fs.pathExists(CACHE_FILE)) {
      const cacheData = await fs.readJson(CACHE_FILE);
      return cacheData;
    }
  } catch (error) {
    // Ignore cache loading errors, use defaults
    console.log(chalk.yellow('⚠️  Could not load user cache, using defaults'));
  }
  
  return {
    projectCount: 0
  };
}

/**
 * Save user cache to file system
 */
export async function saveUserCache(cacheData: UserCacheData): Promise<void> {
  try {
    await fs.ensureDir(CACHE_DIR);
    
    // Update last used timestamp and increment project count
    cacheData.lastUsed = new Date();
    cacheData.projectCount = (cacheData.projectCount || 0) + 1;
    
    await fs.writeJson(CACHE_FILE, cacheData, { spaces: 2 });
  } catch (error) {
    // Don't fail the entire process if cache saving fails
    console.log(chalk.yellow('⚠️  Could not save user preferences'));
  }
}

/**
 * Get cache-aware default value for inquirer prompts
 */
export function getCacheDefault<T>(
  cacheData: UserCacheData,
  field: keyof UserCacheData,
  fallback: T
): T {
  const cachedValue = cacheData[field] as T;
  return cachedValue || fallback;
}

/**
 * Clear user cache
 */
export async function clearUserCache(): Promise<void> {
  try {
    if (await fs.pathExists(CACHE_FILE)) {
      await fs.remove(CACHE_FILE);
      console.log(chalk.green('✅ User cache cleared successfully'));
    } else {
      console.log(chalk.yellow('ℹ️  No cache file found'));
    }
  } catch (error) {
    console.log(chalk.red('❌ Failed to clear user cache'));
  }
}

/**
 * Show cached user preferences
 */
export async function showUserCache(): Promise<void> {
  try {
    const cache = await loadUserCache();
    
    console.log('\n' + chalk.hex('#00d2d3')('📋 Your Cached Preferences:'));
    console.log(chalk.hex('#95afc0')('─'.repeat(40)));
    
    if (cache.projectCount && cache.projectCount > 0) {
      console.log(chalk.hex('#10ac84')(`Projects Created: ${cache.projectCount}`));
      if (cache.lastUsed) {
        console.log(chalk.hex('#95afc0')(`Last Used: ${new Date(cache.lastUsed).toLocaleDateString()}`));
      }
      console.log('');
      
      // Show preferences
      if (cache.framework) {
        console.log(chalk.hex('#667eea')(`Preferred Framework: ${cache.framework}`));
      }
      if (cache.language) {
        console.log(chalk.hex('#667eea')(`Preferred Language: ${cache.language}`));
      }
      if (cache.database) {
        console.log(chalk.hex('#667eea')(`Preferred Database: ${cache.database}`));
      }
      if (cache.orm) {
        console.log(chalk.hex('#667eea')(`Preferred ORM: ${cache.orm}`));
      }
      if (cache.ui) {
        console.log(chalk.hex('#667eea')(`Preferred UI: ${cache.ui}`));
      }
      if (cache.bundler) {
        console.log(chalk.hex('#667eea')(`Preferred Bundler: ${cache.bundler}`));
      }
      if (cache.srcDirectory !== undefined) {
        console.log(chalk.hex('#667eea')(`Src Directory: ${cache.srcDirectory ? 'Yes' : 'No'}`));
      }
      if (cache.tailwindCss !== undefined) {
        console.log(chalk.hex('#667eea')(`Tailwind CSS: ${cache.tailwindCss ? 'Yes' : 'No'}`));
      }
      if (cache.authProvider) {
        console.log(chalk.hex('#667eea')(`Auth Provider: ${cache.authProvider}`));
      }
      
      console.log('\n' + chalk.hex('#95afc0')('💡 These preferences will be used as defaults in future sessions'));
      console.log(chalk.hex('#95afc0')('   Run "pi create --clear-cache" to reset preferences'));
    } else {
      console.log(chalk.hex('#ffa502')('No cached preferences found'));
      console.log(chalk.hex('#95afc0')('Create your first project to start building your preference cache!'));
    }
    
    console.log('');
    
  } catch (error) {
    console.log(chalk.red('❌ Failed to load user cache'));
  }
}

/**
 * Generate intelligent project name suggestions based on cache
 */
export function generateProjectNameSuggestions(cache: UserCacheData): string[] {
  const suggestions = ['my-awesome-project'];
  
  if (cache.framework) {
    const frameworkSuggestions = {
      'nextjs': ['nextjs-app', 'next-project', 'my-next-app'],
      'reactjs': ['react-app', 'react-project', 'my-react-app'],
      'expressjs': ['express-api', 'api-server', 'my-express-app'],
      'nestjs': ['nestjs-api', 'nest-app', 'my-nest-project'],
      'vuejs': ['vue-app', 'vue-project', 'my-vue-app'],
      'rust': ['rust-app', 'rust-project', 'my-rust-app']
    };
    
    const fwSuggestions = frameworkSuggestions[cache.framework as keyof typeof frameworkSuggestions];
    if (fwSuggestions) {
      suggestions.unshift(...fwSuggestions);
    }
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}
