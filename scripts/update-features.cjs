/**
 * Script to populate features.json with actual file paths
 * Only adds files that don't already exist in the configuration
 */

const fs = require('fs-extra');
const path = require('path');

const featuresDir = path.join(__dirname, '../features');
const featuresJsonPath = path.join(featuresDir, 'features.json');

async function scanDirectory(dirPath) {
  const files = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await scanDirectory(fullPath);
        files.push(...subFiles.map(f => path.join(entry.name, f)));
      } else {
        files.push(entry.name);
      }
    }
  } catch (error) {
    // Directory doesn't exist
  }
  return files;
}

async function updateFeaturesJson() {
  try {
    const featuresData = await fs.readJson(featuresJsonPath);
    
    for (const [featureName, featureConfig] of Object.entries(featuresData.features)) {
      if (featureConfig.files) {
        for (const [provider, providerConfig] of Object.entries(featureConfig.files)) {
          for (const [framework, frameworkConfig] of Object.entries(providerConfig)) {
            for (const [language, languageConfig] of Object.entries(frameworkConfig)) {
              const featurePath = path.join(featuresDir, featureName, provider, framework, language);
              if (await fs.pathExists(featurePath)) {
                const files = await scanDirectory(featurePath);
                const fileMap = {};
                
                // Only add files that don't already exist in the configuration
                files.forEach(file => {
                  if (!languageConfig[file]) {
                    fileMap[file] = { action: '' }; // Empty action to be filled manually
                  } else {
                    // Keep existing configuration
                    fileMap[file] = languageConfig[file];
                  }
                });
                
                featuresData.features[featureName].files[provider][framework][language] = fileMap;
              }
            }
          }
        }
      }
    }
    
    await fs.writeJson(featuresJsonPath, featuresData, { spaces: 2 });
    console.log('✅ Features.json updated successfully with file paths (preserving existing configurations)!');
  } catch (error) {
    console.error('❌ Error updating features.json:', error);
  }
}

updateFeaturesJson();
