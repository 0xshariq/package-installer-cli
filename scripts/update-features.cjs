/**
 * Enhanced script to populate features.json with actual file paths and manage caching
 * Supports both file population and template caching for offline mode
 * Preserves existing action fields and only adds new files
 */

const fs = require("fs-extra");
const path = require("path");
// Import chalk v5 compatible way for CommonJS
const chalkImport = require("chalk");
// Create a chalk instance with basic methods
const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  hex: (hexColor) => (text) => {
    const ansiCode = convertHexToAnsi(hexColor);
    return `\x1b[38;5;${ansiCode}m${text}\x1b[0m`;
  },
};

// Helper function to convert hex color to ANSI color code
function convertHexToAnsi(hex) {
  // Simple conversion for common colors
  const colorMap = {
    "#9c88ff": "99", // Purple
    "#00d2d3": "44", // Cyan
    "#26de81": "42", // Green
    "#fd79a8": "205", // Pink
    "#ff6b6b": "196", // Red
    "#ffa502": "214", // Orange
  };
  return colorMap[hex] || "15"; // Default to white if color not found
}

const featuresDir = path.join(__dirname, "../features");
const featuresJsonPath = path.join(featuresDir, "features.json");
const templatesDir = path.join(__dirname, "../templates");
const cacheDir = path.join(require("os").homedir(), ".package-installer-cli");

/**
 * Scan directory recursively and return file objects with actions
 */
async function scanDirectoryWithActions(dirPath, excludePatterns = []) {
  const files = {};
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = entry.name;

      // Skip excluded patterns
      if (excludePatterns.some((pattern) => relativePath.match(pattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        // Skip common build/cache directories
        if (
          ["node_modules", ".git", "dist", ".next", "build", ".vscode"].includes(
            entry.name
          )
        ) {
          continue;
        }

        const subFiles = await scanDirectoryWithActions(fullPath, excludePatterns);
        Object.keys(subFiles).forEach(subFile => {
          const fullSubPath = path.join(relativePath, subFile);
          files[fullSubPath] = subFiles[subFile];
        });
      } else {
        // Skip common cache/build files
        if (![".DS_Store", "Thumbs.db", ".gitkeep"].includes(entry.name)) {
          // Determine action based on file type
          let action = "create"; // default action
          
          if (entry.name === ".env" || entry.name === ".env.local" || entry.name === ".env.example") {
            action = "append";
          } else if (entry.name === "package.json") {
            action = "install";
          } else if (entry.name.includes("index.") || entry.name.includes("main.") || entry.name.includes("app.")) {
            action = "prepend";
          }

          files[relativePath] = { action };
        }
      }
    }
  } catch (error) {
    console.warn(chalk.yellow(`  Could not scan directory: ${dirPath}`));
  }
  return files;
}

/**
 * Automatically detect all features from the features directory
 */
async function detectAllFeatures() {
  console.log(chalk.blue("🔍 Auto-detecting features from directory structure..."));
  
  const detectedFeatures = {};
  
  try {
    const featureEntries = await fs.readdir(featuresDir, { withFileTypes: true });
    
    for (const entry of featureEntries) {
      if (!entry.isDirectory() || entry.name === 'features.json') continue;
      
      const featureName = entry.name;
      console.log(chalk.hex("#9c88ff")(`📦 Detected feature: ${featureName}`));
      
      const featurePath = path.join(featuresDir, featureName);
      const feature = {
        description: `${featureName.charAt(0).toUpperCase() + featureName.slice(1)} integration for enhanced functionality`,
        supportedFrameworks: [],
        supportedLanguages: [],
        files: {}
      };
      
      // Detect providers/categories
      const providers = await fs.readdir(featurePath, { withFileTypes: true });
      
      for (const provider of providers) {
        if (!provider.isDirectory()) continue;
        
        console.log(chalk.hex("#00d2d3")(`  📁 Provider: ${provider.name}`));
        const providerPath = path.join(featurePath, provider.name);
        
        if (!feature.files[provider.name]) {
          feature.files[provider.name] = {};
        }
        
        // Detect frameworks
        const frameworks = await fs.readdir(providerPath, { withFileTypes: true });
        
        for (const framework of frameworks) {
          if (!framework.isDirectory()) continue;
          
          console.log(chalk.hex("#26de81")(`    🔧 Framework: ${framework.name}`));
          const frameworkPath = path.join(providerPath, framework.name);
          
          // Add framework to supported list if not already present
          if (!feature.supportedFrameworks.includes(framework.name)) {
            feature.supportedFrameworks.push(framework.name);
          }
          
          if (!feature.files[provider.name]) {
            feature.files[provider.name] = {};
          }
          if (!feature.files[provider.name][framework.name]) {
            feature.files[provider.name][framework.name] = {};
          }
          
          // Detect languages
          const languages = await fs.readdir(frameworkPath, { withFileTypes: true });
          
          for (const language of languages) {
            if (!language.isDirectory()) continue;
            
            console.log(chalk.hex("#fd79a8")(`      🌐 Language: ${language.name}`));
            const languagePath = path.join(frameworkPath, language.name);
            
            // Add language to supported list if not already present
            if (!feature.supportedLanguages.includes(language.name)) {
              feature.supportedLanguages.push(language.name);
            }
            
            // Scan files in this language directory
            const files = await scanDirectoryWithActions(languagePath);
            
            // Ensure the nested structure is properly created
            if (!feature.files[provider.name]) {
              feature.files[provider.name] = {};
            }
            if (!feature.files[provider.name][framework.name]) {
              feature.files[provider.name][framework.name] = {};
            }
            
            feature.files[provider.name][framework.name][language.name] = files;
          }
        }
      }
      
      detectedFeatures[featureName] = feature;
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error detecting features: ${error.message}`));
  }
  
  return detectedFeatures;
}
/**
 * Initialize features.json if it doesn't exist
 */
async function initializeFeaturesJson() {
  if (!(await fs.pathExists(featuresJsonPath))) {
    console.log(chalk.blue("📝 Creating new features.json file..."));
    
    const defaultStructure = {
      version: "3.0.0",
      lastUpdated: new Date().toISOString(),
      features: {}
    };

    await fs.ensureDir(featuresDir);
    await fs.writeJson(featuresJsonPath, defaultStructure, { spaces: 2 });
    console.log(chalk.green("✅ Created features.json with default structure"));
  } else {
    console.log(chalk.cyan("📋 Found existing features.json file"));
  }
}

/**
 * Merge new features with existing ones, preserving action fields
 */
function mergeFeatures(existingFeatures, newFeatures) {
  const merged = { ...existingFeatures };
  
  for (const [featureName, newFeature] of Object.entries(newFeatures)) {
    if (!merged[featureName]) {
      // New feature - add completely
      merged[featureName] = newFeature;
      console.log(chalk.green(`✨ Added new feature: ${featureName}`));
    } else {
      // Existing feature - merge carefully
      console.log(chalk.cyan(`🔄 Updating existing feature: ${featureName}`));
      
      // Update supported frameworks and languages
      if (newFeature.supportedFrameworks) {
        const existingFrameworks = merged[featureName].supportedFrameworks || [];
        merged[featureName].supportedFrameworks = [...new Set([...existingFrameworks, ...newFeature.supportedFrameworks])];
      }
      
      if (newFeature.supportedLanguages) {
        const existingLanguages = merged[featureName].supportedLanguages || [];
        merged[featureName].supportedLanguages = [...new Set([...existingLanguages, ...newFeature.supportedLanguages])];
      }
      
      // Merge files structure
      if (newFeature.files) {
        if (!merged[featureName].files) {
          merged[featureName].files = {};
        }
        
        for (const [provider, providerFiles] of Object.entries(newFeature.files)) {
          if (!merged[featureName].files[provider]) {
            merged[featureName].files[provider] = providerFiles;
            console.log(chalk.yellow(`  📁 Added new provider: ${provider}`));
          } else {
            // Merge provider files
            for (const [framework, frameworkFiles] of Object.entries(providerFiles)) {
              if (!merged[featureName].files[provider][framework]) {
                merged[featureName].files[provider][framework] = frameworkFiles;
                console.log(chalk.yellow(`    🔧 Added new framework: ${framework}`));
              } else {
                // Merge framework files
                for (const [language, languageFiles] of Object.entries(frameworkFiles)) {
                  if (!merged[featureName].files[provider][framework][language]) {
                    merged[featureName].files[provider][framework][language] = languageFiles;
                    console.log(chalk.yellow(`      🌐 Added new language: ${language}`));
                  } else {
                    // Merge individual files, preserving existing action fields
                    const existingFiles = merged[featureName].files[provider][framework][language];
                    let addedFiles = 0;
                    
                    for (const [fileName, fileConfig] of Object.entries(languageFiles)) {
                      if (!existingFiles[fileName]) {
                        existingFiles[fileName] = fileConfig;
                        addedFiles++;
                      }
                      // If file exists, preserve the existing action
                    }
                    
                    if (addedFiles > 0) {
                      console.log(chalk.magenta(`        📄 Added ${addedFiles} new file(s) for ${language}`));
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  return merged;
}

/**
 * Update features.json with actual file paths using auto-detection
 */
async function updateFeaturesJson() {
  await initializeFeaturesJson();

  try {
    console.log(chalk.blue("🚀 Starting features.json update process..."));
    
    // Load existing features.json
    const existingData = await fs.readJson(featuresJsonPath);
    
    // Auto-detect all features from directory structure
    const detectedFeatures = await detectAllFeatures();
    
    if (Object.keys(detectedFeatures).length === 0) {
      console.log(chalk.yellow("⚠️  No features detected in the features directory"));
      return;
    }
    
    // Merge detected features with existing ones
    console.log(chalk.blue("\n🔄 Merging detected features with existing data..."));
    const mergedFeatures = mergeFeatures(existingData.features || {}, detectedFeatures);
    
    // Sort features alphabetically
    const sortedFeatures = {};
    Object.keys(mergedFeatures)
      .sort()
      .forEach(key => {
        sortedFeatures[key] = mergedFeatures[key];
      });
    
    // Update the features data
    const updatedData = {
      ...existingData,
      version: "3.0.0",
      lastUpdated: new Date().toISOString(),
      features: sortedFeatures
    };
    
    // Write the updated data back to file
    await fs.writeJson(featuresJsonPath, updatedData, { spaces: 2 });
    
    console.log(chalk.green("\n✅ Successfully updated features.json"));
    console.log(chalk.cyan(`📊 Total features: ${Object.keys(sortedFeatures).length}`));
    
    // Display summary
    const summary = Object.entries(sortedFeatures).map(([name, feature]) => {
      const providerCount = Object.keys(feature.files || {}).length;
      const frameworkCount = feature.supportedFrameworks?.length || 0;
      const languageCount = feature.supportedLanguages?.length || 0;
      return `${name}: ${providerCount} providers, ${frameworkCount} frameworks, ${languageCount} languages`;
    });
    
    console.log(chalk.gray("\n📋 Feature Summary:"));
    summary.forEach(item => console.log(chalk.gray(`  • ${item}`)));
    
  } catch (error) {
    console.error(chalk.red(`\n❌ Error updating features.json: ${error.message}`));
    throw error;
  }
}

/**
 * Cache templates for offline use
 */
async function cacheTemplates() {
  const templateCacheDir = path.join(cacheDir, "templates");
  await fs.ensureDir(templateCacheDir);

  console.log(chalk.blue("\n🗄️  Caching templates for offline use..."));

  try {
    const frameworks = await fs.readdir(templatesDir, { withFileTypes: true });

    for (const framework of frameworks) {
      if (!framework.isDirectory()) continue;

      console.log(chalk.hex("#9c88ff")(`  📁 Framework: ${framework.name}`));

      const frameworkPath = path.join(templatesDir, framework.name);
      const languages = await fs.readdir(frameworkPath, {
        withFileTypes: true,
      });

      for (const language of languages) {
        if (!language.isDirectory()) continue;

        console.log(chalk.hex("#00d2d3")(`    🌐 Language: ${language.name}`));
        const languagePath = path.join(frameworkPath, language.name);
        const templates = await fs.readdir(languagePath, {
          withFileTypes: true,
        });

        for (const template of templates) {
          if (!template.isDirectory()) continue;

          const templatePath = path.join(languagePath, template.name);
          const cacheTemplatePath = path.join(
            templateCacheDir,
            `${framework.name}--${language.name}--${template.name}`
          );

          console.log(chalk.hex("#26de81")(`      📄 Caching: ${framework.name}/${language.name}/${template.name}`));

          try {
            await fs.copy(templatePath, cacheTemplatePath, {
              overwrite: true,
              filter: (src) => {
                // Skip node_modules, .git, and other unnecessary directories
                const relativePath = path.relative(templatePath, src);
                return (
                  !relativePath.includes("node_modules") &&
                  !relativePath.includes(".git") &&
                  !relativePath.includes("dist") &&
                  !relativePath.includes(".next") &&
                  !relativePath.includes("build") &&
                  !relativePath.includes(".cache") &&
                  !relativePath.includes("coverage")
                );
              },
            });

            console.log(chalk.green("        ✅ Cached successfully"));
          } catch (error) {
            console.log(chalk.red(`        ❌ Failed to cache: ${error.message}`));
          }
        }
      }
    }
    
    console.log(chalk.green(`\n✅ Template caching completed. Cache stored in: ${templateCacheDir}`));
  } catch (error) {
    console.log(chalk.red(`\n❌ Error caching templates: ${error.message}`));
  }
}

// Run the update process
async function main() {
  console.log(chalk.green("\n🚀 Package Installer CLI - Features Updater v3.0.0"));
  console.log(chalk.cyan("=" .repeat(60)));
  
  try {
    await updateFeaturesJson();
    await cacheTemplates();
    
    console.log(chalk.green("\n✅ All operations completed successfully!"));
    console.log(chalk.cyan("=" .repeat(60)));
  } catch (error) {
    console.error(chalk.red(`\n❌ Update process failed: ${error.message}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(chalk.red(`\n💥 Fatal error: ${err.message}`));
  console.error(chalk.gray(err.stack));
  process.exit(1);
});
