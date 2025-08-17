import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { cloneRepo as cloneRepoUtil } from '../utils/cloneUtils.js';

/**
 * Display help for clone command
 */
export function showCloneHelp(): void {
  const piGradient = gradient(['#00c6ff', '#0072ff']);
  const headerGradient = gradient(['#4facfe', '#00f2fe']);
  
  console.log('\n' + boxen(
    headerGradient('📥 Clone Command Help') + '\n\n' +
    chalk.white('Clone any public repository from GitHub, GitLab, BitBucket, or SourceHut.') + '\n' +
    chalk.white('Automatically installs dependencies and creates .env file from templates.') + '\n\n' +
    chalk.cyan('Usage:') + '\n' +
    chalk.white(`  ${piGradient('pi')} ${chalk.hex('#00d2d3')('clone')} <user/repo> [project-name]`) + '\n\n' +
    chalk.cyan('Options:') + '\n' +
    chalk.gray('  -h, --help    Display help for this command') + '\n\n' +
    chalk.cyan('Examples:') + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#00d2d3')('clone')} facebook/react my-react-copy      # Clone from GitHub with custom name`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#00d2d3')('clone')} gitlab:user/project               # Clone from GitLab`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#00d2d3')('clone')} bitbucket:user/repo               # Clone from BitBucket`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#00d2d3')('clone')} sourcehut:user/repo               # Clone from SourceHut`) + '\n' +
    chalk.gray(`  ${piGradient('pi')} ${chalk.hex('#00d2d3')('clone')} ${chalk.hex('#ff6b6b')('--help')}                            # Show this help message`) + '\n\n' +
    chalk.hex('#00d2d3')('💡 Supported Platforms:') + '\n' +
    chalk.hex('#95afc0')('  • GitHub (default): user/repo') + '\n' +
    chalk.hex('#95afc0')('  • GitLab: gitlab:user/repo') + '\n' +
    chalk.hex('#95afc0')('  • BitBucket: bitbucket:user/repo') + '\n' +
    chalk.hex('#95afc0')('  • SourceHut: sourcehut:user/repo'),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#0a0a0a'
    }
  ));
}

export async function cloneRepo(userRepo: string, projectName?: string) {
  // Check for help flag
  if (userRepo === '--help' || userRepo === '-h') {
    showCloneHelp();
    return;
  }

  await cloneRepoUtil(userRepo, projectName);
}
