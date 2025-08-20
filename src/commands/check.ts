import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import gradient from 'gradient-string';
import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import { 
  getCachedPackageVersion, 
  cachePackageVersion,
  scanProjectWithCache 
} from '../utils/cacheManager.js';
import { 
  LANGUAGE_CONFIGS, 
  SupportedLanguage, 
  getSupportedLanguages,
  getLanguageConfig,
  getAllConfigFiles,
  detectLanguageFromFiles 
} from '../utils/languageConfig.js';

const execAsync = promisify(exec);

interface PackageInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  isDeprecated: boolean;
  deprecatedMessage?: string;
  alternatives?: string[];
  homepage?: string;
  repository?: string;
  description?: string;
  needsUpdate: boolean;
  packageManager: string;
  projectType: string;
}

interface ProjectType {
  name: string;
  files: string[];
  packageManager: string;
  getDependencies: (content: any, filename: string) => Record<string, string>;
  getInstallCommand: (packages: string[]) => string;
  getUpdateCommand: () => string;
  registryUrl?: string;
}

const PROJECT_TYPES: ProjectType[] = [
  {
    name: 'Node.js',
    files: ['package.json'],
    packageManager: 'npm/pnpm/yarn',
    getDependencies: (packageJson, filename) => ({
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    }),
    getInstallCommand: (packages) => `npm install ${packages.join(' ')}`,
    getUpdateCommand: () => 'npm update',
    registryUrl: 'https://registry.npmjs.org'
  },
  {
    name: 'Rust',
    files: ['Cargo.toml'],
    packageManager: 'cargo',
    getDependencies: (cargoToml, filename) => {
      const deps: Record<string, string> = {};
      if (cargoToml.dependencies) {
        Object.entries(cargoToml.dependencies).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'string') {
            deps[key] = value;
          } else if (value && value.version) {
            deps[key] = value.version;
          }
        });
      }
      if (cargoToml['dev-dependencies']) {
        Object.entries(cargoToml['dev-dependencies']).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'string') {
            deps[key] = value;
          } else if (value && value.version) {
            deps[key] = value.version;
          }
        });
      }
      return deps;
    },
    getInstallCommand: (packages) => `cargo add ${packages.join(' ')}`,
    getUpdateCommand: () => 'cargo update',
    registryUrl: 'https://crates.io/api/v1/crates'
  },
  {
    name: 'Python',
    files: ['requirements.txt', 'pyproject.toml', 'Pipfile', 'setup.py'],
    packageManager: 'pip/poetry/pipenv',
    getDependencies: (content, filename) => {
      const deps: Record<string, string> = {};
      
      if (filename === 'requirements.txt') {
        const lines = content.toString().split('\n');
        lines.forEach((line: string) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const match = trimmed.match(/^([a-zA-Z0-9_-]+)([>=<!~]+)?(.*)?$/);
            if (match) {
              deps[match[1]] = match[3] || 'latest';
            }
          }
        });
      } else if (filename === 'pyproject.toml') {
        if (content.tool?.poetry?.dependencies) {
          Object.entries(content.tool.poetry.dependencies).forEach(([key, value]: [string, any]) => {
            if (key !== 'python') {
              deps[key] = typeof value === 'string' ? value : value.version || 'latest';
            }
          });
        }
      } else if (filename === 'Pipfile') {
        if (content.packages) {
          Object.entries(content.packages).forEach(([key, value]: [string, any]) => {
            deps[key] = typeof value === 'string' ? value : value.version || 'latest';
          });
        }
      }
      
      return deps;
    },
    getInstallCommand: (packages) => `pip install ${packages.join(' ')}`,
    getUpdateCommand: () => 'pip list --outdated',
    registryUrl: 'https://pypi.org/pypi'
  },
  {
    name: 'Go',
    files: ['go.mod'],
    packageManager: 'go',
    getDependencies: (content) => {
      const deps: Record<string, string> = {};
      const lines = content.toString().split('\n');
      let inRequire = false;
      
      lines.forEach((line: string) => {
        const trimmed = line.trim();
        if (trimmed === 'require (') {
          inRequire = true;
        } else if (trimmed === ')' && inRequire) {
          inRequire = false;
        } else if (inRequire || trimmed.startsWith('require ')) {
          const match = trimmed.match(/^(?:require\s+)?([^\s]+)\s+([^\s]+)/);
          if (match) {
            deps[match[1]] = match[2];
          }
        }
      });
      
      return deps;
    },
    getInstallCommand: (packages) => `go get ${packages.join(' ')}`,
    getUpdateCommand: () => 'go get -u ./...',
    registryUrl: 'https://proxy.golang.org'
  },
  {
    name: 'Ruby',
    files: ['Gemfile', 'gemspec'],
    packageManager: 'gem/bundler',
    getDependencies: (content) => {
      const deps: Record<string, string> = {};
      const lines = content.toString().split('\n');
      
      lines.forEach((line: string) => {
        const trimmed = line.trim();
        const match = trimmed.match(/gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/);
        if (match) {
          deps[match[1]] = match[2] || 'latest';
        }
      });
      
      return deps;
    },
    getInstallCommand: (packages) => `bundle add ${packages.join(' ')}`,
    getUpdateCommand: () => 'bundle update',
    registryUrl: 'https://rubygems.org/api/v1/gems'
  },
  {
    name: 'PHP',
    files: ['composer.json'],
    packageManager: 'composer',
    getDependencies: (composerJson) => ({
      ...composerJson.require,
      ...composerJson['require-dev']
// Generate PROJECT_TYPES from shared language configuration
const PROJECT_TYPES: ProjectType[] = getSupportedLanguages().map(lang => {
  const config = getLanguageConfig(lang)!;
  const primaryPackageManager = config.packageManagers[0];
  
  return {
    name: config.displayName,
    files: config.configFiles.filter(cf => cf.required || cf.type === 'dependency').map(cf => cf.filename),
    packageManager: config.packageManagers.map(pm => pm.name).join('/'),
    getDependencies: (content: any, filename: string) => {
      const deps: Record<string, string> = {};
      
      // Language-specific dependency parsing
      switch (lang) {
        case 'nodejs':
          if (filename === 'package.json') {
            return {
              ...content.dependencies,
              ...content.devDependencies
            };
          }
          break;
          
        case 'rust':
          if (filename === 'Cargo.toml') {
            if (content.dependencies) {
              Object.entries(content.dependencies).forEach(([key, value]: [string, any]) => {
                if (typeof value === 'string') {
                  deps[key] = value;
                } else if (value && value.version) {
                  deps[key] = value.version;
                }
              });
            }
            if (content['dev-dependencies']) {
              Object.entries(content['dev-dependencies']).forEach(([key, value]: [string, any]) => {
                if (typeof value === 'string') {
                  deps[key] = value;
                } else if (value && value.version) {
                  deps[key] = value.version;
                }
              });
            }
          }
          break;
          
        case 'python':
          if (filename === 'requirements.txt') {
            const lines = content.toString().split('\n');
            lines.forEach((line: string) => {
              const trimmed = line.trim();
              if (trimmed && !trimmed.startsWith('#')) {
                const match = trimmed.match(/^([a-zA-Z0-9_-]+)([>=<!~]+)?(.*)?$/);
                if (match) {
                  deps[match[1]] = match[3] || 'latest';
                }
              }
            });
          } else if (filename === 'pyproject.toml') {
            if (content.dependencies) {
              content.dependencies.forEach((dep: string) => {
                const match = dep.match(/^([a-zA-Z0-9_-]+)([>=<!~]+)?(.*)?$/);
                if (match) {
                  deps[match[1]] = match[3] || 'latest';
                }
              });
            }
          }
          break;
          
        case 'php':
          if (filename === 'composer.json') {
            return {
              ...content.require,
              ...content['require-dev']
            };
          }
          break;
          
        case 'ruby':
          if (filename === 'Gemfile') {
            const lines = content.toString().split('\n');
            lines.forEach((line: string) => {
              const trimmed = line.trim();
              const match = trimmed.match(/gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/);
              if (match) {
                deps[match[1]] = match[2] || 'latest';
              }
            });
          }
          break;
          
        case 'go':
          if (filename === 'go.mod') {
            const lines = content.toString().split('\n');
            let inRequire = false;
            lines.forEach((line: string) => {
              const trimmed = line.trim();
              if (trimmed === 'require (') {
                inRequire = true;
                return;
              }
              if (trimmed === ')') {
                inRequire = false;
                return;
              }
              if (inRequire || trimmed.startsWith('require ')) {
                const match = trimmed.match(/^(?:require\s+)?([^\s]+)\s+([^\s]+)/);
                if (match) {
                  deps[match[1]] = match[2];
                }
              }
            });
          }
          break;
      }
      
      return deps;
    },
    getInstallCommand: (packages) => {
      const addCmd = primaryPackageManager.addCommand || primaryPackageManager.installCommand;
      return `${addCmd} ${packages.join(' ')}`;
    },
    getUpdateCommand: () => primaryPackageManager.updateCommand || primaryPackageManager.installCommand,
    registryUrl: getRegistryUrl(lang)
  };
});

function getRegistryUrl(lang: SupportedLanguage): string {
  switch (lang) {
    case 'nodejs': return 'https://registry.npmjs.org';
    case 'rust': return 'https://crates.io/api/v1/crates';
    case 'python': return 'https://pypi.org/pypi';
    case 'go': return 'https://proxy.golang.org';
    case 'ruby': return 'https://rubygems.org/api/v1/gems';
    case 'php': return 'https://packagist.org/packages';
    case 'java': return 'https://repo1.maven.org/maven2';
    case 'csharp': return 'https://api.nuget.org/v3-flatcontainer';
    case 'swift': return 'https://packagecatalog.com';
    case 'dart': return 'https://pub.dev/api/packages';
    default: return '';
  }
}

/**
 * Display help for check command
 */
export function showCheckHelp(): void {
  const piGradient = gradient(['#00c6ff', '#0072ff']);
  const headerGradient = gradient(['#4facfe', '#00f2fe']);
  
  console.log('\n' + boxen(
    headerGradient('🔍 Check Command Help') + '\n\n' +
    chalk.white('Check package versions in your project and get suggestions for updates.') + '\n' +
    chalk.white('Helps you keep your dependencies up-to-date and secure.') + '\n\n' +
    chalk.cyan('Usage:') + '\n' +
    chalk.white(`  ${piGradient('pi')} ${chalk.hex('#f39c12')('check')} [package-name]`) + '\n\n' +
    chalk.cyan('Options:') + '\n' +
    chalk.gray('  -h, --help    Display help for this command') + '\n\n' +
    chalk.cyan('Examples:') + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#f39c12')('check')}                    # Check all packages in current project`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#f39c12')('check')} react              # Check specific package version`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#f39c12')('check')} @types/node        # Check scoped packages`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#f39c12')('check')} ${chalk.hex('#ff6b6b')('--help')}             # Show this help message`) + '\n\n' +
    chalk.hex('#00d2d3')('💡 Supported Package Managers:') + '\n' +
    chalk.hex('#95afc0')('  • npm, pnpm, yarn (Node.js)') + '\n' +
    chalk.hex('#95afc0')('  • pip, pipenv, poetry (Python)') + '\n' +
    chalk.hex('#95afc0')('  • cargo (Rust)') + '\n' +
    chalk.hex('#95afc0')('  • go modules (Go)') + '\n' +
    chalk.hex('#95afc0')('  • composer (PHP)'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#0a0a0a'
    }
  ));
}

export async function checkCommand(packageName?: string) {
  // Check for help flag
  if (packageName === '--help' || packageName === '-h') {
    showCheckHelp();
    return;
  }
  try {
    console.log('\n' + chalk.hex('#f39c12')('🔍 Starting package check...'));
    
    if (packageName) {
      await checkSinglePackage(packageName);
    } else {
      await checkProjectPackages();
    }
  } catch (error: any) {
    console.error(chalk.hex('#ff4757')(`❌ Failed to check packages: ${error.message}`));
    throw error;
  }
}

async function checkSinglePackage(packageName: string) {
  const spinner = ora(chalk.hex('#f39c12')(`🔄 Checking ${packageName}...`)).start();
  
  try {
    // Try to detect what kind of package this might be
    const projectType = await detectProjectType();
    const packageInfo = await getPackageInfo(packageName, undefined, projectType);
    spinner.succeed(chalk.hex('#10ac84')(`✅ Package information retrieved for ${packageName}`));
    
    displayPackageInfo([packageInfo]);
  } catch (error: any) {
    spinner.fail(chalk.hex('#ff4757')(`❌ Failed to check ${packageName}`));
    throw error;
  }
}

async function checkProjectPackages() {
  const spinner = ora('Analyzing project dependencies...').start();
  
  try {
    const projectType = await detectProjectType();
    
    if (!projectType) {
      spinner.warn('No supported project files found in current directory');
      console.log(chalk.yellow('💡 Supported project types:'));
      PROJECT_TYPES.forEach(type => {
        console.log(`   ${chalk.cyan(type.name)}: ${type.files.join(', ')}`);
      });
      console.log(chalk.gray('\n   Or specify a package name: pi check <package-name>'));
      return;
    }

    const dependencies = await getDependenciesForProject(projectType);

    if (Object.keys(dependencies).length === 0) {
      spinner.warn(`No dependencies found in ${projectType.name} project`);
      return;
    }

    spinner.text = `Checking ${Object.keys(dependencies).length} ${projectType.name} packages...`;
    
    const packageInfos: PackageInfo[] = [];
    
    for (const [name, version] of Object.entries(dependencies)) {
      try {
        const info = await getPackageInfo(name, version, projectType);
        packageInfos.push(info);
      } catch (error) {
        console.warn(`⚠️  Could not check ${name}`);
      }
    }

    spinner.succeed(`Checked ${packageInfos.length} ${projectType.name} packages`);
    displayPackageInfo(packageInfos, projectType);
    
  } catch (error: any) {
    spinner.fail('Failed to analyze project dependencies');
    throw error;
  }
}

async function detectProjectType(): Promise<ProjectType | null> {
  for (const projectType of PROJECT_TYPES) {
    for (const file of projectType.files) {
      if (await fs.pathExists(path.join(process.cwd(), file))) {
        return projectType;
      }
    }
  }
  return PROJECT_TYPES[0]; // Default to Node.js for single package checks
}

async function getDependenciesForProject(projectType: ProjectType): Promise<Record<string, string>> {
  for (const file of projectType.files) {
    const filePath = path.join(process.cwd(), file);
    if (await fs.pathExists(filePath)) {
      try {
        let content: any;
        
        if (file.endsWith('.json')) {
          content = await fs.readJson(filePath);
        } else if (file.endsWith('.toml')) {
          // Simple TOML parser for basic cases
          const tomlContent = await fs.readFile(filePath, 'utf-8');
          content = parseSimpleToml(tomlContent);
        } else {
          content = await fs.readFile(filePath, 'utf-8');
        }
        
        return projectType.getDependencies(content, file);
      } catch (error) {
        console.warn(`⚠️  Could not parse ${file}`);
      }
    }
  }
  return {};
}

function parseSimpleToml(content: string): any {
  const result: any = {};
  const lines = content.split('\n');
  let currentSection: string | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Section header
    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      const sections = currentSection.split('.');
      let current = result;
      for (let i = 0; i < sections.length - 1; i++) {
        if (!current[sections[i]]) current[sections[i]] = {};
        current = current[sections[i]];
      }
      if (!current[sections[sections.length - 1]]) {
        current[sections[sections.length - 1]] = {};
      }
      continue;
    }
    
    // Key-value pair
    const kvMatch = trimmed.match(/^([^=]+)=(.+)$/);
    if (kvMatch && currentSection) {
      const key = kvMatch[1].trim().replace(/"/g, '');
      const value = kvMatch[2].trim().replace(/"/g, '');
      
      const sections = currentSection.split('.');
      let current = result;
      for (const section of sections) {
        if (!current[section]) current[section] = {};
        current = current[section];
      }
      current[key] = value;
    }
  }
  
  return result;
}

async function getPackageInfo(
  packageName: string, 
  currentVersion?: string, 
  projectType?: ProjectType | null
): Promise<PackageInfo> {
  const type = projectType || PROJECT_TYPES[0];
  
  try {
    // Clean up version string (remove ^ ~ and similar prefixes)
    const cleanCurrentVersion = currentVersion?.replace(/[\^~>=<]/, '') || 'unknown';
    
    // Enhanced NPM registry support
    if (type.name === 'Node.js') {
      const response = await fetch(`https://registry.npmjs.org/${packageName}`);
      
      if (!response.ok) {
        throw new Error(`Package ${packageName} not found in NPM registry`);
      }
      
      const data = await response.json();
      const latestVersion = data['dist-tags']?.latest || 'unknown';
      const maintainers = data.maintainers || [];
      const keywords = data.keywords || [];
      
      // Enhanced version comparison
      let needsUpdate = false;
      if (cleanCurrentVersion !== 'unknown' && latestVersion !== 'unknown') {
        try {
          if (semver.valid(cleanCurrentVersion) && semver.valid(latestVersion)) {
            needsUpdate = semver.lt(cleanCurrentVersion, latestVersion);
          }
        } catch (error) {
          // Fallback to string comparison if semver fails
          needsUpdate = cleanCurrentVersion !== latestVersion;
        }
      }
      
      return {
        name: packageName,
        currentVersion: cleanCurrentVersion,
        latestVersion,
        isDeprecated: !!data.deprecated,
        deprecatedMessage: data.deprecated || undefined,
        alternatives: data.alternatives || [],
        homepage: data.homepage || undefined,
        repository: typeof data.repository === 'string' 
          ? data.repository 
          : data.repository?.url || undefined,
        description: data.description || undefined,
        needsUpdate,
        packageManager: type.packageManager,
        projectType: type.name
      };
    }
    
    // Enhanced support for Rust packages
    if (type.name === 'Rust') {
      try {
        const response = await fetch(`https://crates.io/api/v1/crates/${packageName}`);
        
        if (response.ok) {
          const data = await response.json();
          const latestVersion = data.crate?.newest_version || 'unknown';
          
          return {
            name: packageName,
            currentVersion: cleanCurrentVersion,
            latestVersion,
            isDeprecated: false, // Crates.io doesn't have deprecated flag in this endpoint
            homepage: data.crate?.homepage || undefined,
            repository: data.crate?.repository || undefined,
            description: data.crate?.description || undefined,
            needsUpdate: cleanCurrentVersion !== 'unknown' && latestVersion !== 'unknown' 
              ? cleanCurrentVersion !== latestVersion 
              : false,
            packageManager: type.packageManager,
            projectType: type.name
          };
        }
      } catch (error) {
        // Fall through to basic info
      }
    }
    
    // Enhanced support for Python packages
    if (type.name === 'Python') {
      try {
        const response = await fetch(`https://pypi.org/pypi/${packageName}/json`);
        
        if (response.ok) {
          const data = await response.json();
          const latestVersion = data.info?.version || 'unknown';
          
          return {
            name: packageName,
            currentVersion: cleanCurrentVersion,
            latestVersion,
            isDeprecated: false,
            homepage: data.info?.home_page || undefined,
            repository: data.info?.project_urls?.Repository || data.info?.project_urls?.Homepage || undefined,
            description: data.info?.summary || undefined,
            needsUpdate: cleanCurrentVersion !== 'unknown' && latestVersion !== 'unknown' 
              ? cleanCurrentVersion !== latestVersion 
              : false,
            packageManager: type.packageManager,
            projectType: type.name
          };
        }
      } catch (error) {
        // Fall through to basic info
      }
    }
    
    // For other project types or when registry lookup fails, return basic info
    return {
      name: packageName,
      currentVersion: cleanCurrentVersion,
      latestVersion: 'unknown',
      isDeprecated: false,
      needsUpdate: false,
      packageManager: type.packageManager,
      projectType: type.name,
      description: `${type.name} package - registry lookup not available`
    };
    
  } catch (error: any) {
    throw new Error(`Failed to fetch info for ${packageName}: ${error.message}`);
  }
}

function displayPackageInfo(packages: PackageInfo[], projectType?: ProjectType) {
  if (packages.length === 0) {
    console.log(chalk.yellow('📦 No packages to display'));
    return;
  }

  console.log('\n' + chalk.hex('#00d2d3')('📊 Package Analysis Results'));
  console.log(chalk.gray('─'.repeat(60)));

  const outdatedPackages = packages.filter(pkg => pkg.needsUpdate);
  const deprecatedPackages = packages.filter(pkg => pkg.isDeprecated);
  const upToDatePackages = packages.filter(pkg => !pkg.needsUpdate && !pkg.isDeprecated);

  // Enhanced Summary with statistics
  console.log(`\n${chalk.hex('#10ac84')('✅ Total packages checked:')} ${chalk.bold(packages.length.toString())}`);
  console.log(`${chalk.hex('#10ac84')('✅ Up to date:')} ${chalk.bold(upToDatePackages.length.toString())}`);
  
  if (outdatedPackages.length > 0) {
    console.log(`${chalk.hex('#f39c12')('⚠️  Packages needing updates:')} ${chalk.bold(outdatedPackages.length.toString())}`);
  }
  if (deprecatedPackages.length > 0) {
    console.log(`${chalk.hex('#ff4757')('🚨 Deprecated packages:')} ${chalk.bold(deprecatedPackages.length.toString())}`);
  }

  // Show severity breakdown
  if (projectType) {
    console.log(`\n${chalk.hex('#00d2d3')('📋 Project Type:')} ${chalk.bold(projectType.name)} (${chalk.cyan(projectType.packageManager)})`);
  }

  // Show first few packages in detail with enhanced info
  const packagesToShow = packages.slice(0, 8); // Show more packages
  
  packagesToShow.forEach((pkg, index) => {
    const statusIcon = pkg.isDeprecated ? '🚨' : pkg.needsUpdate ? '⚠️' : '✅';
    const statusColor = pkg.isDeprecated ? '#ff4757' : pkg.needsUpdate ? '#f39c12' : '#10ac84';
    const statusText = pkg.isDeprecated ? 'DEPRECATED' : pkg.needsUpdate ? 'UPDATE AVAILABLE' : 'UP TO DATE';
    
    const versionComparison = pkg.currentVersion !== 'unknown' && pkg.latestVersion !== 'unknown'
      ? ` ${chalk.gray('→')} ${chalk.hex('#10ac84')(pkg.latestVersion)}`
      : '';

    console.log('\n' + boxen(
      `${statusIcon} ${chalk.bold(pkg.name)} ${chalk.hex(statusColor)(`[${statusText}]`)}\n` +
      `${chalk.gray('Current:')} ${chalk.yellow(pkg.currentVersion)}${versionComparison}\n` +
      `${chalk.gray('Type:')} ${chalk.blue(pkg.projectType)} ${chalk.gray('via')} ${chalk.cyan(pkg.packageManager)}\n` +
      (pkg.description ? `${chalk.gray('Description:')} ${pkg.description.slice(0, 70)}${pkg.description.length > 70 ? '...' : ''}\n` : '') +
      (pkg.homepage ? `${chalk.gray('Homepage:')} ${chalk.blue(pkg.homepage)}\n` : '') +
      (pkg.isDeprecated ? `${chalk.hex('#ff4757')('⚠️ DEPRECATED:')} ${pkg.deprecatedMessage || 'This package is no longer maintained'}\n` : '') +
      (pkg.alternatives && pkg.alternatives.length > 0 ? `${chalk.gray('Alternatives:')} ${pkg.alternatives.join(', ')}\n` : ''),
      {
        padding: 1,
        margin: 0,
        borderStyle: 'round',
        borderColor: statusColor,
        title: `Package ${index + 1}/${packagesToShow.length}`,
        titleAlignment: 'left'
      }
    ));
  });

  if (packages.length > 8) {
    console.log(chalk.gray(`\n📦 ... and ${packages.length - 8} more packages (use --verbose to see all)`));
  }

  // Enhanced recommendations section
  console.log('\n' + chalk.hex('#00d2d3')('💡 Recommendations:'));
  console.log(chalk.gray('─'.repeat(30)));

  if (deprecatedPackages.length > 0) {
    console.log(`${chalk.hex('#ff4757')('🚨 URGENT:')} Replace ${deprecatedPackages.length} deprecated package(s) immediately`);
    deprecatedPackages.slice(0, 3).forEach(pkg => {
      console.log(`   • ${chalk.red(pkg.name)} ${chalk.gray(pkg.deprecatedMessage ? '- ' + pkg.deprecatedMessage.slice(0, 50) + '...' : '')}`);
    });
  }

  if (outdatedPackages.length > 0 && projectType) {
    console.log(`${chalk.hex('#f39c12')('⚠️  UPDATE:')} Run the following command to update all packages:`);
    console.log(`   ${chalk.cyan(projectType.getUpdateCommand())}`);
    
    // Show individual update commands for major version updates
    const majorUpdates = outdatedPackages.filter(pkg => {
      if (pkg.currentVersion === 'unknown' || pkg.latestVersion === 'unknown') return false;
      try {
        const currentMajor = semver.major(pkg.currentVersion.replace(/[\^~]/, ''));
        const latestMajor = semver.major(pkg.latestVersion);
        return latestMajor > currentMajor;
      } catch {
        return false;
      }
    });

    if (majorUpdates.length > 0) {
      console.log(`${chalk.hex('#f39c12')('📈 MAJOR UPDATES:')} ${majorUpdates.length} package(s) have major version updates:`);
      majorUpdates.slice(0, 3).forEach(pkg => {
        console.log(`   • ${chalk.yellow(pkg.name)}: ${chalk.gray(pkg.currentVersion)} → ${chalk.green(pkg.latestVersion)} ${chalk.red('(Breaking changes possible)')}`);
      });
    }
  }

  if (upToDatePackages.length === packages.length) {
    console.log(`${chalk.hex('#10ac84')('🎉 EXCELLENT:')} All packages are up to date! Your project is in great shape.`);
  }

  // Security and performance tips
  if (packages.length > 0) {
    console.log(`\n${chalk.hex('#00d2d3')('🛡️  Security Tips:')}`);
    console.log(`   • Run ${chalk.cyan('npm audit')} to check for security vulnerabilities`);
    console.log(`   • Consider using ${chalk.cyan('renovate')} or ${chalk.cyan('dependabot')} for automated updates`);
    console.log(`   • Review package licenses with ${chalk.cyan('license-checker')} if needed`);
  }
}