/**
 * Doctor command - Diagnose and fix common development issues
 */

import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { createBanner, displaySuccessMessage } from '../utils/dashboard.js';

/**
 * Display help for doctor command
 */
export function showDoctorHelp(): void {
  console.clear();
  
  console.log(chalk.hex('#9c88ff')('🩺 DOCTOR COMMAND HELP\n'));
  
  console.log(chalk.hex('#00d2d3')('Usage:'));
  console.log(chalk.white('  pi doctor [options]'));
  console.log(chalk.white('  pi diagnose [options]') + chalk.gray(' (alias)\n'));
  
  console.log(chalk.hex('#00d2d3')('Description:'));
  console.log(chalk.white('  Diagnose and fix common development environment issues'));
  console.log(chalk.white('  Performs comprehensive health checks and suggests fixes\n'));
  
  console.log(chalk.hex('#00d2d3')('Options:'));
  console.log(chalk.white('  --fix') + chalk.gray('          Automatically fix detected issues'));
  console.log(chalk.white('  --check-deps') + chalk.gray('    Check for dependency issues'));
  console.log(chalk.white('  --check-config') + chalk.gray('  Check configuration files'));
  console.log(chalk.white('  --check-tools') + chalk.gray('   Check development tools'));
  console.log(chalk.white('  --verbose') + chalk.gray('       Show detailed diagnostic information'));
  console.log(chalk.white('  -h, --help') + chalk.gray('      Show this help message\n'));
  
  console.log(chalk.hex('#00d2d3')('Examples:'));
  console.log(chalk.gray('  # Run complete diagnosis'));
  console.log(chalk.white('  pi doctor\n'));
  console.log(chalk.gray('  # Automatically fix issues'));
  console.log(chalk.white('  pi doctor --fix\n'));
  console.log(chalk.gray('  # Check dependencies only'));
  console.log(chalk.white('  pi doctor --check-deps\n'));
}

/**
 * Main doctor command function
 */
export async function doctorCommand(options: any = {}): Promise<void> {
  createBanner('Development Doctor');
  
  const spinner = ora(chalk.hex('#9c88ff')('🩺 Running diagnostics...')).start();
  
  try {
    const issues = await runDiagnostics(options);
    spinner.stop();
    
    if (issues.length === 0) {
      displaySuccessMessage(
        'No issues detected!',
        ['Your development environment is healthy 🎉']
      );
      return;
    }
    
    displayIssues(issues);
    
    if (options.fix) {
      await attemptFixes(issues);
    } else {
      console.log(chalk.hex('#ffa502')('\n💡 Run with --fix to automatically resolve some issues'));
    }
    
  } catch (error: any) {
    spinner.fail(chalk.red('❌ Diagnostics failed'));
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Run comprehensive diagnostics
 */
async function runDiagnostics(options: any): Promise<any[]> {
  const issues: any[] = [];
  const projectPath = process.cwd();
  
  // Check Node.js and npm issues
  if (!options.checkDeps && !options.checkConfig && !options.checkTools) {
    issues.push(...await checkNodejsIssues());
    issues.push(...await checkDependencyIssues(projectPath));
    issues.push(...await checkConfigurationIssues(projectPath));
    issues.push(...await checkToolsIssues());
  } else {
    if (options.checkDeps) {
      issues.push(...await checkDependencyIssues(projectPath));
    }
    if (options.checkConfig) {
      issues.push(...await checkConfigurationIssues(projectPath));
    }
    if (options.checkTools) {
      issues.push(...await checkToolsIssues());
    }
  }
  
  return issues;
}

/**
 * Check Node.js and npm related issues
 */
async function checkNodejsIssues(): Promise<any[]> {
  const issues: any[] = [];
  
  try {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    
    if (majorVersion < 16) {
      issues.push({
        type: 'warning',
        category: 'nodejs',
        title: 'Outdated Node.js version',
        description: `Node.js ${nodeVersion} is outdated. Consider upgrading to v18+`,
        fixable: false,
        recommendation: 'Visit https://nodejs.org to download the latest version'
      });
    }
    
    // Check npm configuration
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      const npmMajor = parseInt(npmVersion.split('.')[0]);
      
      if (npmMajor < 8) {
        issues.push({
          type: 'info',
          category: 'npm',
          title: 'Outdated npm version',
          description: `npm ${npmVersion} could be updated`,
          fixable: true,
          fix: 'npm install -g npm@latest'
        });
      }
    } catch (error) {
      issues.push({
        type: 'error',
        category: 'npm',
        title: 'npm not available',
        description: 'npm is not installed or not in PATH',
        fixable: false,
        recommendation: 'Reinstall Node.js from https://nodejs.org'
      });
    }
    
    // Check npm cache issues
    try {
      const cacheInfo = execSync('npm config get cache', { encoding: 'utf8' }).trim();
      if (!await fs.pathExists(cacheInfo)) {
        issues.push({
          type: 'warning',
          category: 'npm',
          title: 'npm cache directory missing',
          description: 'npm cache directory does not exist',
          fixable: true,
          fix: 'npm cache clean --force'
        });
      }
    } catch (error) {
      // Ignore cache check errors
    }
    
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'nodejs',
      title: 'Node.js not available',
      description: 'Node.js is not installed or not in PATH',
      fixable: false,
      recommendation: 'Install Node.js from https://nodejs.org'
    });
  }
  
  return issues;
}

/**
 * Check dependency-related issues
 */
async function checkDependencyIssues(projectPath: string): Promise<any[]> {
  const issues: any[] = [];
  
  // Check for package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    try {
      const packageJson = await fs.readJson(packageJsonPath);
      
      // Check for missing node_modules
      const nodeModulesPath = path.join(projectPath, 'node_modules');
      if (!await fs.pathExists(nodeModulesPath)) {
        issues.push({
          type: 'error',
          category: 'dependencies',
          title: 'Missing node_modules',
          description: 'Dependencies are not installed',
          fixable: true,
          fix: 'npm install'
        });
      } else {
        // Check for outdated lock file
        const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
        let hasLockFile = false;
        
        for (const lockFile of lockFiles) {
          const lockPath = path.join(projectPath, lockFile);
          if (await fs.pathExists(lockPath)) {
            hasLockFile = true;
            
            // Check if lock file is older than package.json
            const packageStat = await fs.stat(packageJsonPath);
            const lockStat = await fs.stat(lockPath);
            
            if (lockStat.mtime < packageStat.mtime) {
              issues.push({
                type: 'warning',
                category: 'dependencies',
                title: 'Outdated lock file',
                description: `${lockFile} is older than package.json`,
                fixable: true,
                fix: 'npm install'
              });
            }
            break;
          }
        }
        
        if (!hasLockFile) {
          issues.push({
            type: 'info',
            category: 'dependencies',
            title: 'No lock file found',
            description: 'Consider using a lock file for reproducible builds',
            fixable: true,
            fix: 'npm install'
          });
        }
      }
      
      // Check for security vulnerabilities
      try {
        const auditResult = execSync('npm audit --audit-level moderate', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        if (auditResult.includes('vulnerabilities')) {
          issues.push({
            type: 'warning',
            category: 'security',
            title: 'Security vulnerabilities detected',
            description: 'Some dependencies have known security issues',
            fixable: true,
            fix: 'npm audit fix'
          });
        }
      } catch (error: any) {
        if (error.stdout && error.stdout.includes('vulnerabilities')) {
          issues.push({
            type: 'warning',
            category: 'security',
            title: 'Security vulnerabilities detected',
            description: 'Some dependencies have known security issues',
            fixable: true,
            fix: 'npm audit fix'
          });
        }
      }
      
      // Check for duplicate dependencies
      if (packageJson.dependencies && packageJson.devDependencies) {
        const duplicates = Object.keys(packageJson.dependencies)
          .filter(dep => packageJson.devDependencies[dep]);
        
        if (duplicates.length > 0) {
          issues.push({
            type: 'warning',
            category: 'dependencies',
            title: 'Duplicate dependencies',
            description: `Found in both dependencies and devDependencies: ${duplicates.join(', ')}`,
            fixable: false,
            recommendation: 'Remove duplicates from one of the sections'
          });
        }
      }
      
    } catch (error) {
      issues.push({
        type: 'error',
        category: 'dependencies',
        title: 'Invalid package.json',
        description: 'package.json file is corrupted or invalid',
        fixable: false,
        recommendation: 'Check package.json syntax'
      });
    }
  }
  
  return issues;
}

/**
 * Check configuration file issues
 */
async function checkConfigurationIssues(projectPath: string): Promise<any[]> {
  const issues: any[] = [];
  
  // Check for .gitignore
  const gitignorePath = path.join(projectPath, '.gitignore');
  if (!await fs.pathExists(gitignorePath)) {
    issues.push({
      type: 'info',
      category: 'configuration',
      title: 'Missing .gitignore',
      description: 'No .gitignore file found',
      fixable: true,
      fix: 'create-gitignore'
    });
  } else {
    // Check if .gitignore includes node_modules
    const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
    if (!gitignoreContent.includes('node_modules')) {
      issues.push({
        type: 'warning',
        category: 'configuration',
        title: 'Incomplete .gitignore',
        description: '.gitignore should include node_modules',
        fixable: true,
        fix: 'update-gitignore'
      });
    }
  }
  
  // Check for README.md
  const readmePath = path.join(projectPath, 'README.md');
  if (!await fs.pathExists(readmePath)) {
    issues.push({
      type: 'info',
      category: 'documentation',
      title: 'Missing README.md',
      description: 'No README.md file found',
      fixable: true,
      fix: 'create-readme'
    });
  }
  
  // Check TypeScript configuration
  const tsconfigPath = path.join(projectPath, 'tsconfig.json');
  if (await fs.pathExists(tsconfigPath)) {
    try {
      const tsconfig = await fs.readJson(tsconfigPath);
      
      if (!tsconfig.compilerOptions) {
        issues.push({
          type: 'warning',
          category: 'configuration',
          title: 'Invalid TypeScript config',
          description: 'tsconfig.json missing compilerOptions',
          fixable: false,
          recommendation: 'Add compilerOptions to tsconfig.json'
        });
      }
    } catch (error) {
      issues.push({
        type: 'error',
        category: 'configuration',
        title: 'Invalid tsconfig.json',
        description: 'TypeScript configuration file is invalid',
        fixable: false,
        recommendation: 'Fix tsconfig.json syntax'
      });
    }
  }
  
  return issues;
}

/**
 * Check development tools issues
 */
async function checkToolsIssues(): Promise<any[]> {
  const issues: any[] = [];
  
  // Check Git installation and configuration
  try {
    execSync('git --version', { stdio: 'ignore' });
    
    // Check Git user configuration
    try {
      execSync('git config user.name', { stdio: 'ignore' });
    } catch (error) {
      issues.push({
        type: 'warning',
        category: 'git',
        title: 'Git user name not configured',
        description: 'Git user.name is not set',
        fixable: false,
        recommendation: 'Run: git config --global user.name "Your Name"'
      });
    }
    
    try {
      execSync('git config user.email', { stdio: 'ignore' });
    } catch (error) {
      issues.push({
        type: 'warning',
        category: 'git',
        title: 'Git email not configured',
        description: 'Git user.email is not set',
        fixable: false,
        recommendation: 'Run: git config --global user.email "your.email@example.com"'
      });
    }
    
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'git',
      title: 'Git not installed',
      description: 'Git is required for version control',
      fixable: false,
      recommendation: 'Install Git from https://git-scm.com'
    });
  }
  
  return issues;
}

/**
 * Display detected issues
 */
function displayIssues(issues: any[]): void {
  const Table = require('cli-table3');
  
  const table = new Table({
    head: [
      chalk.hex('#00d2d3')('Type'), 
      chalk.hex('#10ac84')('Category'), 
      chalk.hex('#ffa502')('Issue'),
      chalk.hex('#9c88ff')('Fixable')
    ],
    colWidths: [10, 15, 45, 10],
    style: { head: [], border: ['cyan'] }
  });
  
  issues.forEach(issue => {
    const typeColor = issue.type === 'error' ? chalk.red : 
                     issue.type === 'warning' ? chalk.yellow : chalk.blue;
    
    table.push([
      typeColor(issue.type.toUpperCase()),
      chalk.white(issue.category),
      `${chalk.white(issue.title)}\n${chalk.gray(issue.description)}`,
      issue.fixable ? chalk.green('✓') : chalk.red('✗')
    ]);
  });
  
  console.log(chalk.hex('#ffa502')('\n🚨 DETECTED ISSUES\n'));
  console.log(table.toString());
  
  // Show recommendations for non-fixable issues
  const recommendations = issues
    .filter(issue => !issue.fixable && issue.recommendation)
    .map(issue => `${issue.title}: ${issue.recommendation}`);
  
  if (recommendations.length > 0) {
    console.log(chalk.hex('#00d2d3')('\n💡 MANUAL FIXES REQUIRED:\n'));
    recommendations.forEach((rec, index) => {
      console.log(chalk.gray(`${index + 1}. ${rec}`));
    });
  }
}

/**
 * Attempt to fix issues automatically
 */
async function attemptFixes(issues: any[]): Promise<void> {
  const fixableIssues = issues.filter(issue => issue.fixable);
  
  if (fixableIssues.length === 0) {
    console.log(chalk.yellow('\n⚠️ No automatically fixable issues found'));
    return;
  }
  
  console.log(chalk.hex('#00d2d3')('\n🔧 ATTEMPTING FIXES...\n'));
  
  for (const issue of fixableIssues) {
    const spinner = ora(`Fixing: ${issue.title}`).start();
    
    try {
      await applyFix(issue.fix);
      spinner.succeed(chalk.green(`Fixed: ${issue.title}`));
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to fix: ${issue.title} - ${error.message}`));
    }
  }
  
  displaySuccessMessage(
    'Automatic fixes completed!',
    ['Some issues may require manual intervention']
  );
}

/**
 * Apply a specific fix
 */
async function applyFix(fixCommand: string): Promise<void> {
  switch (fixCommand) {
    case 'npm install':
      execSync('npm install', { stdio: 'ignore' });
      break;
      
    case 'npm install -g npm@latest':
      execSync('npm install -g npm@latest', { stdio: 'ignore' });
      break;
      
    case 'npm cache clean --force':
      execSync('npm cache clean --force', { stdio: 'ignore' });
      break;
      
    case 'npm audit fix':
      execSync('npm audit fix', { stdio: 'ignore' });
      break;
      
    case 'create-gitignore':
      await createBasicGitignore();
      break;
      
    case 'update-gitignore':
      await updateGitignore();
      break;
      
    case 'create-readme':
      await createBasicReadme();
      break;
      
    default:
      throw new Error(`Unknown fix command: ${fixCommand}`);
  }
}

/**
 * Create a basic .gitignore file
 */
async function createBasicGitignore(): Promise<void> {
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
/dist
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;

  await fs.writeFile('.gitignore', gitignoreContent);
}

/**
 * Update existing .gitignore file
 */
async function updateGitignore(): Promise<void> {
  let gitignoreContent = await fs.readFile('.gitignore', 'utf-8');
  
  if (!gitignoreContent.includes('node_modules')) {
    gitignoreContent += '\n# Dependencies\nnode_modules/\n';
  }
  
  await fs.writeFile('.gitignore', gitignoreContent);
}

/**
 * Create a basic README.md file
 */
async function createBasicReadme(): Promise<void> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let projectName = path.basename(process.cwd());
  
  if (await fs.pathExists(packageJsonPath)) {
    try {
      const packageJson = await fs.readJson(packageJsonPath);
      projectName = packageJson.name || projectName;
    } catch (error) {
      // Use directory name
    }
  }
  
  const readmeContent = `# ${projectName}

A new project created with Package Installer CLI.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## License

MIT
`;

  await fs.writeFile('README.md', readmeContent);
}
