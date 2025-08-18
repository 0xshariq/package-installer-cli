import fs from 'fs-extra';
import path from 'path';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';

const execAsync = promisify(exec);

/**
 * Create a project from a template with progress indicators
 * @param projectName - Name of the project to create
 * @param templatePath - Path to the template directory
 * @returns Promise<string> - Path to the created project
 */
export async function createProjectFromTemplate(
    projectName: string, 
    templatePath: string
): Promise<string> {
    const spinner = ora(chalk.blue('Creating project structure...')).start();
    
    try {
        const projectPath = path.resolve(process.cwd(), projectName);
        
        // Check if directory already exists
        if (await fs.pathExists(projectPath)) {
            spinner.fail(chalk.red(`Directory ${projectName} already exists`));
            throw new Error(`Directory ${projectName} already exists`);
        }

        // Copy template files
        spinner.text = chalk.blue('Copying template files...');
        await fs.copy(templatePath, projectPath);
        
        spinner.succeed(chalk.green('Project structure created'));

        // Install dependencies if any configuration files exist
        await installDependenciesForCreate(projectPath);

        return projectPath;
        
    } catch (error: any) {
        spinner.fail(chalk.red('Failed to create project'));
        throw error;
    }
}/**
 * Install project dependencies with progress indicators
 * Uses the multi-language dependency installer
 * @param projectPath - Path to the project directory
 */
async function installDependenciesForCreate(projectPath: string): Promise<void> {
    try {
        const { installProjectDependencies } = await import('./dependencyInstaller.js');
        await installProjectDependencies(projectPath, path.basename(projectPath), true); // Install MCP server for created projects
        
        // Initialize git repository after dependencies are installed
        await initializeGitRepositoryForCreate(projectPath);
        
    } catch (installError: any) {
        // Only show manual installation message if auto-installation failed
        console.log(chalk.yellow('⚠️  Auto-installation failed. You can install dependencies manually:'));
        
        // Find all package.json locations to show proper commands
        const fs = await import('fs-extra');
        const { findProjectFiles } = await import('./dependencyInstaller.js');
        
        try {
            const { files: foundFiles } = await findProjectFiles(projectPath);
            const packageJsonFiles = foundFiles.filter(file => path.basename(file) === 'package.json');
            
            if (packageJsonFiles.length > 0) {
                console.log(chalk.gray('💡 Found package.json files in:'));
                for (const packageJsonPath of packageJsonFiles) {
                    const packageDir = path.dirname(packageJsonPath);
                    const relativePath = path.relative(projectPath, packageDir);
                    const displayPath = relativePath || 'root directory';
                    
                    console.log(chalk.gray(`   📦 ${displayPath}:`));
                    console.log(chalk.gray(`      cd ${path.basename(projectPath)}${relativePath ? '/' + relativePath : ''}`));
                    console.log(chalk.gray(`      npm install (or pnpm install/yarn)`));
                }
            } else {
                // Fallback to basic instructions
                console.log(chalk.gray(`   cd ${path.basename(projectPath)}`));
                console.log(chalk.gray(`   npm install (or pnpm install/yarn)`));
            }
        } catch (searchError) {
            // Fallback to basic instructions if search fails
            console.log(chalk.gray(`   cd ${path.basename(projectPath)}`));
            console.log(chalk.gray(`   npm install (or pnpm install/yarn)`));
        }
        
        // Try to initialize git even if dependencies failed
        try {
            await initializeGitRepositoryForCreate(projectPath);
        } catch (gitError) {
            console.log(chalk.yellow('⚠️  Could not initialize git repository'));
        }
    }
}

/**
 * Initialize git repository with fallback commands
 * @param projectPath - Path to the project directory
 */
async function initializeGitRepositoryForCreate(projectPath: string): Promise<void> {
    const gitSpinner = ora(chalk.cyan('Initializing git repository...')).start();
    
    try {
        // Try to initialize git repository using MCP server commands first
        try {
            gitSpinner.text = chalk.cyan('Initializing git with ginit...');
            await execAsync('ginit', { cwd: projectPath });
        } catch {
            gitSpinner.text = chalk.cyan('Initializing git with git init...');
            await execAsync('git init', { cwd: projectPath });
        }
        
        // Add all files to git
        try {
            gitSpinner.text = chalk.cyan('Adding files with gadd...');
            await execAsync('gadd', { cwd: projectPath });
        } catch {
            gitSpinner.text = chalk.cyan('Adding files with git add...');
            await execAsync('git add .', { cwd: projectPath });
        }
        
        // Make initial commit
        try {
            gitSpinner.text = chalk.cyan('Creating initial commit with gcommit...');
            await execAsync('gcommit "Initial Commit from Package Installer CLI"', { cwd: projectPath });
        } catch {
            gitSpinner.text = chalk.cyan('Creating initial commit with git commit...');
            await execAsync('git commit -m "Initial Commit from Package Installer CLI"', { cwd: projectPath });
        }
        
        gitSpinner.succeed(chalk.green('Git repository initialized with initial commit'));
        
    } catch (error: any) {
        gitSpinner.warn(chalk.yellow('Could not initialize git repository automatically'));
        console.log(chalk.gray('💡 You can initialize git manually:'));
        console.log(chalk.gray(`   cd ${path.basename(projectPath)}`));
        console.log(chalk.gray('   git init'));
        console.log(chalk.gray('   git add .'));
        console.log(chalk.gray('   git commit -m "Initial commit"'));
    }
}