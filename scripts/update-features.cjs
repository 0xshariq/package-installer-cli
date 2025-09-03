/**
 * Enhanced script to populate features.json with actual file paths and manage caching
 * Supports both file population and template caching for offline mode
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const featuresDir = path.join(__dirname, '../features');
const featuresJsonPath = path.join(featuresDir, 'features.json');
const templatesDir = path.join(__dirname, '../templates');
const cacheDir = path.join(require('os').homedir(), '.package-installer-cli');

/**
 * Scan directory recursively and return relative file paths
 */
async function scanDirectory(dirPath, excludePatterns = []) {
  const files = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = entry.name;
      
      // Skip excluded patterns
      if (excludePatterns.some(pattern => relativePath.match(pattern))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        // Skip common build/cache directories
        if (['node_modules', '.git', 'dist', '.next', 'build'].includes(entry.name)) {
          continue;
        }
        
        const subFiles = await scanDirectory(fullPath, excludePatterns);
        files.push(...subFiles.map(f => path.join(relativePath, f)));
      } else {
        // Skip common cache/build files
        if (!['.DS_Store', 'Thumbs.db', '.gitkeep'].includes(entry.name)) {
          files.push(relativePath);
        }
      }
    }
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  Could not scan directory: ${dirPath}`));
  }
  return files;
}

/**
 * Initialize features.json if it doesn't exist
 */
async function initializeFeaturesJson() {
  if (!await fs.pathExists(featuresJsonPath)) {
    const defaultStructure = {
      version: "2.0.0",
      lastUpdated: new Date().toISOString(),
      features: {
        auth: {
          supportedFrameworks: ["nextjs", "reactjs", "expressjs"],
          supportedLanguages: ["javascript", "typescript"],
          files: {}
        },
        database: {
          supportedFrameworks: ["nextjs", "reactjs", "expressjs"],
          supportedLanguages: ["javascript", "typescript"],
          files: {}
        },
        docker: {
          supportedFrameworks: ["nextjs", "reactjs", "expressjs", "vuejs"],
          supportedLanguages: ["javascript", "typescript"],
          files: {}
        }
      }
    };
    
    await fs.ensureDir(featuresDir);
    await fs.writeJson(featuresJsonPath, defaultStructure, { spaces: 2 });
    console.log(chalk.green('✅ Created features.json with default structure'));
  }
}

/**
 * Update features.json with actual file paths
 */
async function updateFeaturesJson() {
  await initializeFeaturesJson();
  
  try {
    const featuresData = await fs.readJson(featuresJsonPath);
    let updated = false;
    
    console.log(chalk.blue('🔍 Scanning features directory...'));
    
    for (const [featureName, featureConfig] of Object.entries(featuresData.features)) {
      console.log(chalk.hex('#9c88ff')(`\n📦 Processing feature: ${featureName}`));
      
      if (!featureConfig.files) {
        featureConfig.files = {};
      }
      
      const featureBasePath = path.join(featuresDir, featureName);
      if (!await fs.pathExists(featureBasePath)) {
        console.log(chalk.gray(`   ⚠️  Feature directory not found: ${featureName}`));
        continue;
      }
      
      // Scan providers
      const providers = await fs.readdir(featureBasePath, { withFileTypes: true });
      for (const provider of providers) {
        if (!provider.isDirectory()) continue;
        
        console.log(chalk.hex('#00d2d3')(`   🔧 Provider: ${provider.name}`));
        
        if (!featureConfig.files[provider.name]) {
          featureConfig.files[provider.name] = {};
        }
        
        const providerPath = path.join(featureBasePath, provider.name);
        
        // Scan frameworks
        const frameworks = await fs.readdir(providerPath, { withFileTypes: true });
        for (const framework of frameworks) {
          if (!framework.isDirectory()) continue;
          
          console.log(chalk.hex('#26de81')(`     📱 Framework: ${framework.name}`));
          
          if (!featureConfig.files[provider.name][framework.name]) {
            featureConfig.files[provider.name][framework.name] = {};
          }
          
          const frameworkPath = path.join(providerPath, framework.name);
          
          // Scan languages
          const languages = await fs.readdir(frameworkPath, { withFileTypes: true });
          for (const language of languages) {
            if (!language.isDirectory()) continue;
            
            console.log(chalk.hex('#fd79a8')(`       📝 Language: ${language.name}`));
            
            if (!featureConfig.files[provider.name][framework.name][language.name]) {
              featureConfig.files[provider.name][framework.name][language.name] = {};
            }
            
            const languagePath = path.join(frameworkPath, language.name);
            const files = await scanDirectory(languagePath);
            
            console.log(chalk.gray(`         Found ${files.length} files`));
            
            // Add new files, preserve existing configurations
            files.forEach(file => {
              if (!featureConfig.files[provider.name][framework.name][language.name][file]) {
                // Determine default action based on file type
                let defaultAction = 'create';
                if (file === 'package.json') {
                  defaultAction = 'install';
                } else if (file.includes('config') || file.includes('Config')) {
                  defaultAction = 'append';
                }
                
                featureConfig.files[provider.name][framework.name][language.name][file] = {
                  action: defaultAction
                };
                updated = true;
                console.log(chalk.green(`           ➕ Added: ${file} (${defaultAction})`));
              }
            });
          }
        }
      }
    }
    
    if (updated) {
      featuresData.lastUpdated = new Date().toISOString();
      await fs.writeJson(featuresJsonPath, featuresData, { spaces: 2 });
      console.log(chalk.green('\n✅ Features.json updated successfully!'));
    } else {
      console.log(chalk.blue('\n📋 Features.json is already up to date'));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error updating features.json:'), error);
    process.exit(1);
  }
}

/**
 * Cache templates for offline mode
 */
async function cacheTemplates() {
  console.log(chalk.blue('\n🗂️  Caching templates for offline mode...'));
  
  const templateCacheDir = path.join(cacheDir, 'complete-templates');
  await fs.ensureDir(templateCacheDir);
  
  if (!await fs.pathExists(templatesDir)) {
    console.log(chalk.yellow('⚠️  Templates directory not found, skipping template caching'));
    return;
  }
  
  const frameworks = await fs.readdir(templatesDir, { withFileTypes: true });
  
  for (const framework of frameworks) {
    if (!framework.isDirectory()) continue;
    
    console.log(chalk.hex('#9c88ff')(`📦 Caching framework: ${framework.name}`));
    
    const frameworkPath = path.join(templatesDir, framework.name);
    const languages = await fs.readdir(frameworkPath, { withFileTypes: true });
    
    for (const language of languages) {
      if (!language.isDirectory()) continue;
      
      const languagePath = path.join(frameworkPath, language.name);
      const templates = await fs.readdir(languagePath, { withFileTypes: true });
      
      for (const template of templates) {
        if (!template.isDirectory()) continue;
        
        const templatePath = path.join(languagePath, template.name);
        const cacheTemplatePath = path.join(templateCacheDir, `${framework.name}-${language.name}-${template.name}`);
        
        console.log(chalk.hex('#00d2d3')(`  🗂️  Caching: ${framework.name}/${language.name}/${template.name}`));
        
        try {
          await fs.copy(templatePath, cacheTemplatePath, {
            overwrite: true,
            filter: (src) => {
              // Skip node_modules, .git, and other unnecessary directories
              const relativePath = path.relative(templatePath, src);
              return !relativePath.includes('node_modules') && 
                     !relativePath.includes('.git') && 
                     !relativePath.includes('dist') && 
                     !relativePath.includes('.next') &&
                     !relativePath.includes('build');
            }
          });
          
          console.log(chalk.green(`    ✅ Cached successfully`));
        } catch (error) {
          console.log(chalk.red(`    ❌ Failed to cache: ${error.message}`));
        }
      }
    }
  }
  
  console.log(chalk.green('✅ Template caching completed!'));
}

/**
 * Cache features for offline mode
 */
async function cacheFeatures() {
  console.log(chalk.blue('\n🔧 Caching features for offline mode...'));
  
  const featureCacheDir = path.join(cacheDir, 'features');
  await fs.ensureDir(featureCacheDir);
  
  if (await fs.pathExists(featuresDir)) {
    try {
      await fs.copy(featuresDir, featureCacheDir, {
        overwrite: true,
        filter: (src) => {
          // Skip unnecessary files
          return !src.includes('.DS_Store') && !src.includes('Thumbs.db');
        }
      });
      
      console.log(chalk.green('✅ Features cached successfully!'));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to cache features: ${error.message}`));
    }
  }
}

/**
 * Display cache statistics
 */
async function showCacheStats() {
  console.log(chalk.blue('\n📊 Cache Statistics:'));
  
  const templateCacheDir = path.join(cacheDir, 'complete-templates');
  const featureCacheDir = path.join(cacheDir, 'features');
  
  try {
    if (await fs.pathExists(templateCacheDir)) {
      const templates = await fs.readdir(templateCacheDir);
      console.log(chalk.hex('#00d2d3')(`  📦 Cached templates: ${templates.length}`));
    } else {
      console.log(chalk.gray('  📦 No cached templates found'));
    }
    
    if (await fs.pathExists(featureCacheDir)) {
      console.log(chalk.hex('#00d2d3')(`  🔧 Features cache: Available`));
    } else {
      console.log(chalk.gray('  🔧 No features cache found'));
    }
    
    const cacheSize = await getCacheSize(cacheDir);
    console.log(chalk.hex('#95afc0')(`  💾 Total cache size: ${formatBytes(cacheSize)}`));
    
  } catch (error) {
    console.log(chalk.red('❌ Error reading cache statistics'));
  }
}

/**
 * Get directory size recursively
 */
async function getCacheSize(dirPath) {
  let size = 0;
  
  try {
    if (!await fs.pathExists(dirPath)) return 0;
    
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        size += await getCacheSize(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        size += stats.size;
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  return size;
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  console.log(chalk.hex('#9c88ff').bold('\n🚀 Package Installer CLI - Features Updater'));
  console.log(chalk.hex('#95afc0')('═'.repeat(50)));
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.hex('#00d2d3')('\nUsage:'));
    console.log('  node update-features.cjs [options]');
    console.log('\nOptions:');
    console.log('  --cache-templates    Cache templates for offline mode');
    console.log('  --cache-features     Cache features for offline mode');
    console.log('  --cache-all          Cache both templates and features');
    console.log('  --stats              Show cache statistics');
    console.log('  --help, -h           Show this help message');
    console.log('\nDefault: Update features.json with file paths');
    return;
  }
  
  try {
    if (args.includes('--stats')) {
      await showCacheStats();
      return;
    }
    
    if (args.includes('--cache-templates') || args.includes('--cache-all')) {
      await cacheTemplates();
    }
    
    if (args.includes('--cache-features') || args.includes('--cache-all')) {
      await cacheFeatures();
    }
    
    if (!args.includes('--cache-templates') && !args.includes('--cache-features') && !args.includes('--cache-all')) {
      // Default action: update features.json
      await updateFeaturesJson();
    }
    
    console.log(chalk.hex('#26de81')('\n🎉 All operations completed successfully!'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Script failed:'), error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  updateFeaturesJson,
  cacheTemplates,
  cacheFeatures,
  showCacheStats
};
