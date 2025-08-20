/**
 * Multi-language dependency installer utility
 * Supports Node.js, Rust, Python, Go, Ruby, PHP, Java, C#, Swift, Dart/Flutter
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { 
  LANGUAGE_CONFIGS, 
  SupportedLanguage, 
  LanguageConfig, 
  PackageManager,
  getSupportedLanguages,
  getLanguageConfig,
  getAllConfigFiles,
  detectLanguageFromFiles,
  getPreferredPackageManager,
  matchesLanguagePattern
} from './languageConfig.js';

const execAsync = promisify(exec);

export interface DependencyInstaller {
  name: string;
  command: string;
  configFiles: string[];
  detectCommand?: string;
  priority: number;
}

export { SupportedLanguage };

// Convert shared language config to legacy format for backward compatibility
export const DEPENDENCY_INSTALLERS: Record<SupportedLanguage, DependencyInstaller[]> = 
  Object.fromEntries(
    Object.entries(LANGUAGE_CONFIGS).map(([lang, config]) => [
      lang,
      config.packageManagers.map(pm => ({
        name: pm.name,
        command: pm.installCommand,
        configFiles: [
          ...config.configFiles.map(cf => cf.filename),
          ...pm.lockFiles,
          ...pm.configFiles
        ],
        detectCommand: pm.detectCommand,
        priority: pm.priority
      }))
    ])
  ) as Record<SupportedLanguage, DependencyInstaller[]>;

/**
 * Recursively find package.json files and other config files
 */
async function findProjectFiles(projectPath: string, maxDepth: number = 2): Promise<{files: string[], directories: string[]}> {
  const foundFiles: string[] = [];
  const foundDirectories: string[] = [];
  
  async function searchDirectory(currentPath: string, currentDepth: number) {
    if (currentDepth > maxDepth) return;
    
    try {
      const files = await fs.readdir(currentPath);
      
      for (const file of files) {
        const filePath = path.join(currentPath, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isDirectory()) {
          // Skip common directories that shouldn't contain main config files
          if (!['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'coverage', '.vscode'].includes(file)) {
            foundDirectories.push(filePath);
            await searchDirectory(filePath, currentDepth + 1);
          }
        } else {
          // Check if this is a config file we're interested in
          const configFiles = [
            // Node.js
            'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.yarnrc.yml',
            // Rust  
            'Cargo.toml', 'Cargo.lock',
            // Python
            'requirements.txt', 'pyproject.toml', 'setup.py', 'poetry.lock', 'Pipfile', 'Pipfile.lock', 'setup.cfg',
            // Go
            'go.mod', 'go.sum',
            // Ruby
            'Gemfile', 'Gemfile.lock', '.ruby-version',
            // PHP  
            'composer.json', 'composer.lock',
            // Java
            'pom.xml', 'build.gradle', 'build.gradle.kts', 'gradle.properties',
            // C#/.NET
            '*.csproj', '*.sln', 'global.json', 'nuget.config',
            // Swift
            'Package.swift', 'Package.resolved',
            // Kotlin
            'build.gradle.kts',
            // Scala  
            'build.sbt',
            // Dart/Flutter
            'pubspec.yaml', 'pubspec.lock'
          ];
          
          if (configFiles.includes(file) || configFiles.some(pattern => 
            pattern.includes('*') ? file.match(new RegExp(pattern.replace('*', '.*'))) : false
          )) {
            foundFiles.push(filePath);
          }
        }
      }
    } catch (error) {
      // Ignore permission errors or other file system issues
    }
  }
  
  await searchDirectory(projectPath, 0);
  return { files: foundFiles, directories: foundDirectories };
}

/**
 * Detect project language based on configuration files (including nested ones)
 */
export async function detectProjectLanguage(projectPath: string): Promise<SupportedLanguage[]> {
  const detectedLanguages: SupportedLanguage[] = [];
  
  try {
    // First check root directory for immediate detection
    const rootFiles = await fs.readdir(projectPath);
    const rootFileSet = new Set(rootFiles);
    
    // Check for root level config files first
    for (const [language, installers] of Object.entries(DEPENDENCY_INSTALLERS)) {
      for (const installer of installers) {
        const hasConfigFile = installer.configFiles.some(configFile => 
          rootFileSet.has(configFile)
        );
        
        if (hasConfigFile && !detectedLanguages.includes(language as SupportedLanguage)) {
          detectedLanguages.push(language as SupportedLanguage);
          break;
        }
      }
    }
    
    // If no languages detected in root, search nested directories
    if (detectedLanguages.length === 0) {
      console.log(chalk.hex('#f39c12')('🔍 No config files found in root, searching subdirectories...'));
      
      const { files: foundFiles } = await findProjectFiles(projectPath);
      
      for (const filePath of foundFiles) {
        const fileName = path.basename(filePath);
        
        for (const [language, installers] of Object.entries(DEPENDENCY_INSTALLERS)) {
          for (const installer of installers) {
            const hasConfigFile = installer.configFiles.includes(fileName);
            
            if (hasConfigFile && !detectedLanguages.includes(language as SupportedLanguage)) {
              detectedLanguages.push(language as SupportedLanguage);
              console.log(chalk.hex('#00d2d3')(`📁 Found ${fileName} in ${path.dirname(filePath)}`));
              break;
            }
          }
        }
      }
    }
    
    return detectedLanguages;
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  Could not detect project language: ${error}`));
    return [];
  }
}

/**
 * Check if a package manager is available
 */
async function isPackageManagerAvailable(installer: DependencyInstaller): Promise<boolean> {
  if (!installer.detectCommand) return true;
  
  try {
    await execAsync(installer.detectCommand, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the best available package manager for a language
 */
async function getBestPackageManager(language: SupportedLanguage, projectPath: string): Promise<DependencyInstaller | null> {
  const installers = DEPENDENCY_INSTALLERS[language];
  const availableInstallers: DependencyInstaller[] = [];
  
  // Check which installers are available and have config files
  for (const installer of installers) {
    const isAvailable = await isPackageManagerAvailable(installer);
    
    if (isAvailable) {
      const hasConfigFile = installer.configFiles.some(configFile => 
        fs.existsSync(path.join(projectPath, configFile))
      );
      
      if (hasConfigFile) {
        availableInstallers.push(installer);
      }
    }
  }
  
  // Return the installer with highest priority (lowest number)
  availableInstallers.sort((a, b) => a.priority - b.priority);
  return availableInstallers[0] || null;
}

/**
 * Install dependencies for a specific language
 */
async function installDependenciesForLanguage(
  language: SupportedLanguage, 
  projectPath: string,
  spinner: Ora
): Promise<boolean> {
  const packageManager = await getBestPackageManager(language, projectPath);
  
  if (!packageManager) {
    spinner.warn(chalk.yellow(`⚠️  No suitable package manager found for ${language}`));
    return false;
  }
  
  try {
    spinner.text = chalk.hex('#f39c12')(`Installing ${language} dependencies with ${packageManager.name}...`);
    
    await execAsync(packageManager.command, { 
      cwd: projectPath,
      timeout: 300000 // 5 minutes timeout
    });
    
    spinner.succeed(chalk.green(`✅ ${language} dependencies installed with ${packageManager.name}`));
    return true;
  } catch (error: any) {
    spinner.warn(chalk.yellow(`⚠️  Failed to install ${language} dependencies with ${packageManager.name}: ${error.message}`));
    return false;
  }
}

/**
 * Install dependencies for all detected languages in the project
 */
/**
 * Install dependencies for all detected languages in the project
 */
export async function installProjectDependencies(projectPath: string, projectName?: string, installMCP: boolean = true): Promise<void> {
  const detectedLanguages = await detectProjectLanguage(projectPath);
  
  if (detectedLanguages.length === 0) {
    console.log(chalk.hex('#ffa502')('ℹ️  No dependency files detected, skipping installation'));
    return;
  }
  
  console.log(chalk.hex('#00d2d3')(`🔍 Detected languages: ${detectedLanguages.map(l => chalk.bold(l)).join(', ')}`));
  
  // Find all package.json files for Node.js projects
  if (detectedLanguages.includes('nodejs')) {
    const { files: foundFiles } = await findProjectFiles(projectPath);
    const packageJsonFiles = foundFiles.filter(file => path.basename(file) === 'package.json');
    
    if (packageJsonFiles.length > 0) {
      console.log(chalk.hex('#00d2d3')(`📦 Found ${packageJsonFiles.length} package.json file(s)`));
      
      for (const packageJsonPath of packageJsonFiles) {
        const packageDir = path.dirname(packageJsonPath);
        const relativePath = path.relative(projectPath, packageDir);
        const displayPath = relativePath || 'root';
        
        const spinner = ora(chalk.hex('#f39c12')(`Installing dependencies in ${displayPath}...`)).start();
        
        try {
          const success = await installDependenciesForLanguage('nodejs', packageDir, spinner);
          if (success) {
            spinner.succeed(chalk.green(`✅ Dependencies installed in ${displayPath}`));
          } else {
            spinner.fail(chalk.red(`❌ Failed to install dependencies in ${displayPath}`));
          }
        } catch (error) {
          spinner.fail(chalk.red(`❌ Error installing dependencies in ${displayPath}: ${error}`));
        }
      }
    }
  }
  
  // Handle other languages that might not be Node.js
  const nonNodeLanguages = detectedLanguages.filter(lang => lang !== 'nodejs');
  for (const language of nonNodeLanguages) {
    const spinner = ora(chalk.hex('#f39c12')(`Installing ${language} dependencies...`)).start();
    const success = await installDependenciesForLanguage(language, projectPath, spinner);
    if (success) {
      spinner.succeed(chalk.green(`✅ ${language} dependencies installed`));
    } else {
      spinner.fail(chalk.red(`❌ Failed to install ${language} dependencies`));
    }
  }
  
  // Install GitHub MCP server for Node.js projects if requested
  if (installMCP && detectedLanguages.includes('nodejs')) {
    try {
      const mcpSpinner = ora(chalk.hex('#00d2d3')('Installing GitHub MCP server...')).start();
      await installAdditionalPackages('nodejs', ['@0xshariq/github-mcp-server'], projectPath, false);
      mcpSpinner.succeed(chalk.green('✅ GitHub MCP server installed for git operations'));
    } catch (error) {
      const mcpSpinner = ora().start();
      mcpSpinner.warn(chalk.yellow('⚠️  Could not install GitHub MCP server'));
    }
  }
  
  console.log(chalk.hex('#10ac84')('\n🎉 Dependency installation completed!'));
}

/**
 * Install additional packages for a specific language
 */
export async function installAdditionalPackages(
  language: SupportedLanguage,
  packages: string[],
  projectPath: string,
  isDev: boolean = false
): Promise<void> {
  const packageManager = await getBestPackageManager(language, projectPath);
  
  if (!packageManager) {
    throw new Error(`No suitable package manager found for ${language}`);
  }
  
  let command = '';
  
  switch (language) {
    case 'nodejs':
      const devFlag = isDev ? '-D' : '';
      if (packageManager.name === 'pnpm') {
        command = `pnpm add ${devFlag} ${packages.join(' ')}`;
      } else if (packageManager.name === 'yarn') {
        command = `yarn add ${isDev ? '--dev' : ''} ${packages.join(' ')}`;
      } else {
        command = `npm install ${isDev ? '--save-dev' : '--save'} ${packages.join(' ')}`;
      }
      break;
      
    case 'rust':
      command = `cargo add ${packages.join(' ')}`;
      break;
      
    case 'python':
      if (packageManager.name === 'poetry') {
        command = `poetry add ${isDev ? '--group dev' : ''} ${packages.join(' ')}`;
      } else {
        command = `pip install ${packages.join(' ')}`;
      }
      break;
      
    case 'go':
      command = `go get ${packages.join(' ')}`;
      break;
      
    case 'ruby':
      // For Ruby, packages are usually added to Gemfile manually
      throw new Error('Ruby package installation requires manual Gemfile editing');
      
    case 'php':
      command = `composer require ${isDev ? '--dev' : ''} ${packages.join(' ')}`;
      break;
      
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
  
  const spinner = ora(chalk.hex('#f39c12')(`Installing ${packages.join(', ')} for ${language}...`)).start();
  
  try {
    await execAsync(command, { 
      cwd: projectPath,
      timeout: 120000 // 2 minutes timeout for individual packages
    });
    
    spinner.succeed(chalk.green(`✅ Installed ${packages.join(', ')} for ${language}`));
  } catch (error: any) {
    spinner.fail(chalk.red(`❌ Failed to install ${packages.join(', ')} for ${language}: ${error.message}`));
    throw error;
  }
}
