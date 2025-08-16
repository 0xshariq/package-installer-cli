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
}

export async function checkCommand(packageName?: string) {
  try {
    console.log('\n' + chalk.hex('#f39c12')('🔍 Starting package check...'));
    
    if (packageName) {
      console.log(`${chalk.hex('#ffa502')('Target:')} ${chalk.hex('#00d2d3')(packageName)}`);
      await checkSinglePackage(packageName);
    } else {
      console.log(chalk.hex('#95afc0')('Checking all packages in current project...'));
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
    const packageInfo = await getPackageInfo(packageName);
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
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!await fs.pathExists(packageJsonPath)) {
      spinner.warn('No package.json found in current directory');
      console.log(chalk.yellow('💡 Run this command in a project directory or specify a package name'));
      console.log(chalk.gray('   pi check <package-name>'));
      return;
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    if (Object.keys(dependencies).length === 0) {
      spinner.warn('No dependencies found in package.json');
      return;
    }

    spinner.text = `Checking ${Object.keys(dependencies).length} packages...`;
    
    const packageInfos: PackageInfo[] = [];
    
    for (const [name, version] of Object.entries(dependencies)) {
      try {
        const info = await getPackageInfo(name, version as string);
        packageInfos.push(info);
      } catch (error) {
        console.warn(`⚠️  Could not check ${name}`);
      }
    }

    spinner.succeed(`Checked ${packageInfos.length} packages`);
    displayPackageInfo(packageInfos);
    
  } catch (error: any) {
    spinner.fail('Failed to analyze project dependencies');
    throw error;
  }
}

async function getPackageInfo(packageName: string, currentVersion?: string): Promise<PackageInfo> {
  try {
    // Get package info from npm registry
    const registryData = await fetchFromNpmRegistry(packageName);
    
    const latestVersion = registryData['dist-tags']?.latest || 'unknown';
    const currentVersionClean = currentVersion ? currentVersion.replace(/^[\^~]/, '') : 'unknown';
    
    const packageInfo: PackageInfo = {
      name: packageName,
      currentVersion: currentVersionClean,
      latestVersion,
      isDeprecated: !!registryData.deprecated,
      deprecatedMessage: registryData.deprecated,
      homepage: registryData.homepage,
      repository: typeof registryData.repository === 'string' 
        ? registryData.repository 
        : registryData.repository?.url,
      description: registryData.description,
      needsUpdate: currentVersion ? semver.lt(currentVersionClean, latestVersion) : false
    };

    // Add alternatives for deprecated packages
    if (packageInfo.isDeprecated) {
      packageInfo.alternatives = getAlternatives(packageName);
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

function getAlternatives(packageName: string): string[] {
  const alternatives: Record<string, string[]> = {
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
  };

  return alternatives[packageName] || [];
}

function displayPackageInfo(packages: PackageInfo[]) {
  // Separate packages by status
  const deprecated = packages.filter(p => p.isDeprecated);
  const outdated = packages.filter(p => !p.isDeprecated && p.needsUpdate);
  const upToDate = packages.filter(p => !p.isDeprecated && !p.needsUpdate);

  console.log('\n' + boxen(
    chalk.cyan('📊 Package Status Report') + '\n' +
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
      console.log(`  ${chalk.blue('Update:')} npm install ${pkg.name}@${pkg.latestVersion}`);
    });
  }

  // Show update commands
  if (outdated.length > 0) {
    console.log('\n' + boxen(
      chalk.blue('🔄 Update Commands') + '\n\n' +
      chalk.white('Update all packages:') + '\n' +
      chalk.gray('  npm update') + '\n' +
      chalk.gray('  # or') + '\n' +
      chalk.gray('  pnpm update') + '\n\n' +
      chalk.white('Check for major updates:') + '\n' +
      chalk.gray('  npx npm-check-updates') + '\n' +
      chalk.gray('  # or') + '\n' +
      chalk.gray('  npx ncu'),
      {
        padding: 1,
        borderStyle: 'single',
        borderColor: 'blue'
      }
    ));
  }

  // Show summary
  if (packages.length === 1) {
    const pkg = packages[0];
    console.log('\n' + boxen(
      `${chalk.cyan('Package:')} ${pkg.name}\n` +
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
