import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import https from 'https';

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
    getDependencies: (packageJson) => ({
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
    getDependencies: (cargoToml) => {
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
    }),
    getInstallCommand: (packages) => `composer require ${packages.join(' ')}`,
    getUpdateCommand: () => 'composer update',
    registryUrl: 'https://packagist.org/packages'
  }
];

export async function checkCommand(packageName?: string) {
  try {
    console.log('\n' + chalk.hex('#f39c12')('🔍 Starting package check...'));
    
    if (packageName) {
      getDependencies: (packageJson, filename) => ({
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }),
      await checkProjectPackages();
    }
  } catch (error: any) {
    console.error(chalk.hex('#ff4757')(`❌ Failed to check packages: ${error.message}`));
    throw error;
      getDependencies: (cargoToml, filename) => {
}

async function checkSinglePackage(packageName: string) {
  const spinner = ora(chalk.hex('#f39c12')(`🔄 Checking ${packageName}...`)).start();
  getDependencies: (content, filename) => {
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
      const key = kvMatch[1].trim();
      let value = kvMatch[2].trim();
      
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
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

async function getPackageInfo(packageName: string, currentVersion?: string, projectType?: ProjectType): Promise<PackageInfo> {
  try {
    let registryData: any;
    let latestVersion = 'unknown';
    
    // Determine which registry to use
    const actualProjectType = projectType || PROJECT_TYPES[0];
    
    switch (actualProjectType.name) {
      case 'Node.js':
        registryData = await fetchFromNpmRegistry(packageName);
        latestVersion = registryData['dist-tags']?.latest || 'unknown';
        break;
      case 'Rust':
        registryData = await fetchFromCratesRegistry(packageName);
        latestVersion = registryData.crate?.max_version || 'unknown';
        break;
      case 'Python':
        registryData = await fetchFromPyPiRegistry(packageName);
        latestVersion = registryData.info?.version || 'unknown';
        break;
      default:
        // For other types, try npm registry as fallback
        try {
          registryData = await fetchFromNpmRegistry(packageName);
          latestVersion = registryData['dist-tags']?.latest || 'unknown';
        } catch {
          registryData = { description: 'Package info not available' };
        }
    }
    
    const currentVersionClean = currentVersion ? currentVersion.replace(/^[\^~>=<]/, '') : 'unknown';
    
    const packageInfo: PackageInfo = {
      name: packageName,
      currentVersion: currentVersionClean,
      latestVersion,
      isDeprecated: !!registryData.deprecated,
      deprecatedMessage: registryData.deprecated,
      homepage: registryData.homepage || registryData.info?.home_page,
      repository: typeof registryData.repository === 'string' 
        ? registryData.repository 
        : registryData.repository?.url || registryData.info?.project_urls?.Repository,
      description: registryData.description || registryData.info?.summary,
      needsUpdate: currentVersion && latestVersion !== 'unknown' ? 
        semver.lt(currentVersionClean, latestVersion) : false,
      packageManager: actualProjectType.packageManager,
      projectType: actualProjectType.name
    };

    // Add alternatives for deprecated packages
    if (packageInfo.isDeprecated) {
      packageInfo.alternatives = getAlternatives(packageName, actualProjectType.name);
    }

    return packageInfo;
  } catch (error: any) {
    throw new Error(`Failed to fetch info for ${packageName}: ${error.message}`);
  }
}

async function fetchFromNpmRegistry(packageName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${packageName}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`Package not found: ${packageName}`));
          } else {
            resolve(parsed);
          }
        } catch (error) {
          reject(new Error(`Invalid response for ${packageName}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function fetchFromCratesRegistry(packageName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `https://crates.io/api/v1/crates/${packageName}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors) {
            reject(new Error(`Crate not found: ${packageName}`));
          } else {
            resolve(parsed);
          }
        } catch (error) {
          reject(new Error(`Invalid response for ${packageName}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function fetchFromPyPiRegistry(packageName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `https://pypi.org/pypi/${packageName}/json`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 404) {
            reject(new Error(`Package not found: ${packageName}`));
          } else {
            resolve(parsed);
          }
        } catch (error) {
          reject(new Error(`Invalid response for ${packageName}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function getAlternatives(packageName: string, projectType: string): string[] {
  const alternatives: Record<string, Record<string, string[]>> = {
    'Node.js': {
      'request': ['axios', 'node-fetch', 'got'],
      'moment': ['date-fns', 'dayjs', 'luxon'],
      'lodash': ['ramda', 'native JavaScript methods'],
      'bower': ['npm', 'yarn', 'pnpm'],
      'gulp': ['webpack', 'vite', 'rollup'],
      'grunt': ['webpack', 'vite', 'rollup'],
      'node-sass': ['sass', 'dart-sass'],
      'tslint': ['eslint with @typescript-eslint'],
      'istanbul': ['nyc', 'c8'],
      'should': ['jest', 'chai', 'vitest'],
      'phantomjs': ['puppeteer', 'playwright'],
      'protractor': ['cypress', 'playwright', 'webdriver.io']
    },
    'Rust': {
      'time': ['chrono'],
      'rustc-serialize': ['serde'],
      'hyper': ['reqwest', 'ureq'],
      'iron': ['warp', 'axum', 'actix-web'],
      'nickel': ['warp', 'axum', 'actix-web']
    },
    'Python': {
      'requests': ['httpx', 'aiohttp'],
      'flask': ['fastapi', 'django'],
      'nose': ['pytest'],
      'unittest2': ['pytest'],
      'pycrypto': ['cryptography'],
      'mysql-python': ['PyMySQL', 'mysql-connector-python'],
      'PIL': ['Pillow']
    }
  };

  return alternatives[projectType]?.[packageName] || [];
}

function displayPackageInfo(packages: PackageInfo[], projectType?: ProjectType) {
  // Separate packages by status
  const deprecated = packages.filter(p => p.isDeprecated);
  const outdated = packages.filter(p => !p.isDeprecated && p.needsUpdate);
  const upToDate = packages.filter(p => !p.isDeprecated && !p.needsUpdate);

  const projectName = projectType ? projectType.name : packages[0]?.projectType || 'Unknown';

  console.log('\n' + boxen(
    chalk.cyan(`📊 ${projectName} Package Status Report`) + '\n' +
    '═══════════════════════════════════════════════════════════\n' +
    chalk.green(`✅ Up to date: ${upToDate.length}`) + '\n' +
    chalk.yellow(`📦 Outdated: ${outdated.length}`) + '\n' +
    chalk.red(`⚠️  Deprecated: ${deprecated.length}`) + '\n' +
    '═══════════════════════════════════════════════════════════',
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));

  // Show deprecated packages
  if (deprecated.length > 0) {
    console.log('\n' + chalk.red.bold('⚠️  DEPRECATED PACKAGES'));
    console.log(chalk.red('═══════════════════════════════════════'));
    
    deprecated.forEach(pkg => {
      console.log(`\n${chalk.red('•')} ${chalk.white.bold(pkg.name)}`);
      console.log(`  ${chalk.gray('Current:')} ${pkg.currentVersion}`);
      console.log(`  ${chalk.gray('Project Type:')} ${pkg.projectType}`);
      if (pkg.deprecatedMessage) {
        console.log(`  ${chalk.red('Reason:')} ${pkg.deprecatedMessage}`);
      }
      if (pkg.alternatives && pkg.alternatives.length > 0) {
        console.log(`  ${chalk.green('Alternatives:')} ${pkg.alternatives.join(', ')}`);
      }
    });
  }

  // Show outdated packages
  if (outdated.length > 0) {
    console.log('\n' + chalk.yellow.bold('📦 OUTDATED PACKAGES'));
    console.log(chalk.yellow('═══════════════════════════════════════'));
    
    outdated.forEach(pkg => {
      console.log(`\n${chalk.yellow('•')} ${chalk.white.bold(pkg.name)}`);
      console.log(`  ${chalk.gray('Current:')} ${pkg.currentVersion}`);
      console.log(`  ${chalk.green('Latest:')} ${pkg.latestVersion}`);
      console.log(`  ${chalk.gray('Project Type:')} ${pkg.projectType}`);
      
      // Show appropriate install command
      switch (pkg.projectType) {
        case 'Node.js':
          console.log(`  ${chalk.blue('Update:')} npm install ${pkg.name}@${pkg.latestVersion}`);
          break;
        case 'Rust':
          console.log(`  ${chalk.blue('Update:')} cargo add ${pkg.name}@${pkg.latestVersion}`);
          break;
        case 'Python':
          console.log(`  ${chalk.blue('Update:')} pip install ${pkg.name}==${pkg.latestVersion}`);
          break;
        case 'Go':
          console.log(`  ${chalk.blue('Update:')} go get ${pkg.name}@v${pkg.latestVersion}`);
          break;
        case 'Ruby':
          console.log(`  ${chalk.blue('Update:')} bundle add ${pkg.name} --version ${pkg.latestVersion}`);
          break;
        case 'PHP':
          console.log(`  ${chalk.blue('Update:')} composer require ${pkg.name}:${pkg.latestVersion}`);
          break;
        default:
          console.log(`  ${chalk.blue('Latest:')} ${pkg.latestVersion}`);
      }
    });
  }

  // Show update commands based on project type
  if (outdated.length > 0 && projectType) {
    const updateCommands = getUpdateCommandsForProjectType(projectType);
    
    console.log('\n' + boxen(
      chalk.blue('🔄 Update Commands') + '\n\n' +
      updateCommands.map(cmd => 
        `${chalk.white(cmd.description)}\n${chalk.gray(`  ${cmd.command}`)}`
      ).join('\n\n'),
      {
        padding: 1,
        borderStyle: 'single',
        borderColor: 'blue'
      }
    ));
  }

  // Show summary for single package
  if (packages.length === 1) {
    const pkg = packages[0];
    console.log('\n' + boxen(
      `${chalk.cyan('Package:')} ${pkg.name}\n` +
      `${chalk.cyan('Project Type:')} ${pkg.projectType}\n` +
      `${chalk.cyan('Package Manager:')} ${pkg.packageManager}\n` +
      `${chalk.cyan('Description:')} ${pkg.description || 'N/A'}\n` +
      `${chalk.cyan('Current Version:')} ${pkg.currentVersion}\n` +
      `${chalk.cyan('Latest Version:')} ${pkg.latestVersion}\n` +
      `${chalk.cyan('Status:')} ${pkg.isDeprecated ? chalk.red('Deprecated') : 
        pkg.needsUpdate ? chalk.yellow('Outdated') : chalk.green('Up to date')}\n` +
      (pkg.homepage ? `${chalk.cyan('Homepage:')} ${pkg.homepage}\n` : '') +
      (pkg.repository ? `${chalk.cyan('Repository:')} ${pkg.repository}` : ''),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: pkg.isDeprecated ? 'red' : pkg.needsUpdate ? 'yellow' : 'green'
      }
    ));
  }
}

function getUpdateCommandsForProjectType(projectType: ProjectType): Array<{description: string, command: string}> {
  switch (projectType.name) {
    case 'Node.js':
      return [
        { description: 'Update all packages:', command: 'npm update' },
        { description: 'Update with pnpm:', command: 'pnpm update' },
        { description: 'Update with yarn:', command: 'yarn upgrade' },
        { description: 'Check for major updates:', command: 'npx npm-check-updates' }
      ];
    case 'Rust':
      return [
        { description: 'Update all packages:', command: 'cargo update' },
        { description: 'Update specific package:', command: 'cargo update -p <package>' },
        { description: 'Check for outdated packages:', command: 'cargo outdated' }
      ];
    case 'Python':
      return [
        { description: 'Update all packages:', command: 'pip list --outdated | pip install --upgrade' },
        { description: 'Update with poetry:', command: 'poetry update' },
        { description: 'Update with pipenv:', command: 'pipenv update' },
        { description: 'Show outdated packages:', command: 'pip list --outdated' }
      ];
    case 'Go':
      return [
        { description: 'Update all packages:', command: 'go get -u ./...' },
        { description: 'Update specific package:', command: 'go get -u <package>' },
        { description: 'Tidy up dependencies:', command: 'go mod tidy' }
      ];
    case 'Ruby':
      return [
        { description: 'Update all gems:', command: 'bundle update' },
        { description: 'Update specific gem:', command: 'bundle update <gem>' },
        { description: 'Show outdated gems:', command: 'bundle outdated' }
      ];
    case 'PHP':
      return [
        { description: 'Update all packages:', command: 'composer update' },
        { description: 'Update specific package:', command: 'composer update <package>' },
        { description: 'Show outdated packages:', command: 'composer outdated' }
      ];
    default:
      return [
        { description: 'Update command:', command: projectType.getUpdateCommand() }
      ];
  }
}
}