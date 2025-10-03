import chalk from 'chalk';
import inquirer from 'inquirer';
import boxen from 'boxen';
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import { createStandardHelp, CommandHelpConfig } from '../utils/helpFormatter.js';
import { displayCommandBanner } from '../utils/banner.js';

// Email categories for user feedback
export interface EmailCategory {
  name: string;
  value: string;
  description: string;
  emoji: string;
  template: string;
}

const EMAIL_CATEGORIES: EmailCategory[] = [
  {
    name: '🐛 Bug Report',
    value: 'bug',
    description: 'Report a bug or issue with the CLI',
    emoji: '🐛',
    template: 'bug-report'
  },
  {
    name: '💡 Feature Request',
    value: 'feature',
    description: 'Suggest a new feature or enhancement',
    emoji: '💡',
    template: 'feature-request'
  },
  {
    name: '📋 Template Request',
    value: 'template',
    description: 'Request a new project template',
    emoji: '📋',
    template: 'template-request'
  },
  {
    name: '❓ General Question',
    value: 'question',
    description: 'Ask a general question about the CLI',
    emoji: '❓',
    template: 'question'
  },
  {
    name: '🚀 Improvement Suggestion',
    value: 'improvement',
    description: 'Suggest improvements to existing features',
    emoji: '🚀',
    template: 'improvement'
  },
  {
    name: '📖 Documentation Issue',
    value: 'docs',
    description: 'Report issues with documentation',
    emoji: '📖',
    template: 'docs-issue'
  }
];

/**
 * Check if Email MCP CLI is available and get version info
 */
async function checkEmailMcpAvailability(): Promise<{ 
  available: boolean; 
  version?: string; 
  path?: string; 
  configured?: boolean;
  installationType?: 'global' | 'npx' | 'local';
}> {
  try {
    // First try the global npm package
    try {
      const output = execSync('npx @0xshariq/email-mcp-server --version', { 
        stdio: 'pipe', 
        encoding: 'utf8',
        timeout: 10000 
      });
      const versionMatch = output.match(/Version: ([\d.]+)/);
      const isConfigured = !output.includes('Environment not configured');
      return { 
        available: true, 
        version: versionMatch ? versionMatch[1] : 'unknown',
        path: 'npx @0xshariq/email-mcp-server',
        configured: isConfigured,
        installationType: 'npx'
      };
    } catch (npxError) {
      // Fallback to direct email-cli command if globally installed
      try {
        const output = execSync('email-cli --version', { 
          stdio: 'pipe', 
          encoding: 'utf8',
          timeout: 10000 
        });
        const versionMatch = output.match(/Version: ([\d.]+)/);
        const isConfigured = !output.includes('Environment not configured');
        return { 
          available: true, 
          version: versionMatch ? versionMatch[1] : 'unknown',
          path: 'email-cli',
          configured: isConfigured,
          installationType: 'global'
        };
      } catch (globalError) {
        // Last fallback to local development path
        const emailMcpPath = path.join(os.homedir(), 'desktop', 'shariq-mcp-servers', 'email-mcp-server');
        const emailCliPath = path.join(emailMcpPath, 'email-cli.js');
        
        if (await fs.pathExists(emailCliPath)) {
          try {
            const output = execSync(`node "${emailCliPath}" --version`, { 
              stdio: 'pipe', 
              encoding: 'utf8',
              cwd: emailMcpPath,
              timeout: 10000
            });
            const versionMatch = output.match(/Version: ([\d.]+)/);
            const isConfigured = !output.includes('Environment not configured');
            return { 
              available: true, 
              version: versionMatch ? versionMatch[1] : 'unknown',
              path: emailCliPath,
              configured: isConfigured,
              installationType: 'local'
            };
          } catch (localError) {
            // Local version exists but has issues (like missing dependencies)
            return { 
              available: true, 
              version: 'unknown',
              path: emailCliPath,
              configured: false,
              installationType: 'local'
            };
          }
        }
      }
    }
    
    return { available: false };
  } catch (error) {
    return { available: false };
  }
}

/**
 * Get system information for bug reports
 */
function getSystemInfo(): string {
  try {
    const nodeVersion = process.version;
    const platform = `${os.platform()} ${os.release()}`;
    const arch = os.arch();
    const cliVersion = process.env.CLI_VERSION || 'unknown';
    
    return `
System Information:
- OS: ${platform} (${arch})
- Node.js: ${nodeVersion}
- CLI Version: ${cliVersion}
- Working Directory: ${process.cwd()}
`;
  } catch (error) {
    return '\nSystem Information: Unable to gather system details';
  }
}

/**
 * Generate email templates based on category
 */
function generateEmailTemplate(category: string, data: any): { subject: string; body: string } {
  const systemInfo = getSystemInfo();
  const timestamp = new Date().toISOString();
  
  switch (category) {
    case 'bug':
      return {
        subject: `[Package Installer CLI] Bug Report: ${data.title}`,
        body: `Hi Shariq,

I encountered a bug while using Package Installer CLI.

Bug Title: ${data.title}

Description:
${data.description}

Steps to Reproduce:
${data.steps || 'Not provided'}

Expected Behavior:
${data.expected || 'Not provided'}

Actual Behavior:
${data.actual || 'Not provided'}

Additional Information:
${data.additional || 'None'}

${systemInfo}

Reported at: ${timestamp}

Best regards,
${data.name || 'Anonymous User'}
${data.email ? `Contact: ${data.email}` : ''}
`
      };
      
    case 'feature':
      return {
        subject: `[Package Installer CLI] Feature Request: ${data.title}`,
        body: `Hi Shariq,

I have a feature request for Package Installer CLI.

Feature Title: ${data.title}

Description:
${data.description}

Use Case:
${data.useCase || 'Not provided'}

Proposed Solution:
${data.solution || 'Not provided'}

Priority: ${data.priority || 'Medium'}

Additional Context:
${data.additional || 'None'}

Submitted at: ${timestamp}

Best regards,
${data.name || 'Anonymous User'}
${data.email ? `Contact: ${data.email}` : ''}
`
      };
      
    case 'template':
      return {
        subject: `[Package Installer CLI] Template Request: ${data.title}`,
        body: `Hi Shariq,

I would like to request a new template for Package Installer CLI.

Template Name: ${data.title}

Framework/Technology: ${data.framework || 'Not specified'}

Description:
${data.description}

Key Features Needed:
${data.features || 'Not provided'}

Similar Templates:
${data.similar || 'Not provided'}

Priority: ${data.priority || 'Medium'}

Additional Requirements:
${data.additional || 'None'}

Requested at: ${timestamp}

Best regards,
${data.name || 'Anonymous User'}
${data.email ? `Contact: ${data.email}` : ''}
`
      };
      
    case 'question':
      return {
        subject: `[Package Installer CLI] Question: ${data.title}`,
        body: `Hi Shariq,

I have a question about Package Installer CLI.

Question: ${data.title}

Details:
${data.description}

What I've Tried:
${data.tried || 'Not provided'}

Expected Outcome:
${data.expected || 'Not provided'}

${systemInfo}

Asked at: ${timestamp}

Best regards,
${data.name || 'Anonymous User'}
${data.email ? `Contact: ${data.email}` : ''}
`
      };
      
    case 'improvement':
      return {
        subject: `[Package Installer CLI] Improvement Suggestion: ${data.title}`,
        body: `Hi Shariq,

I have a suggestion to improve Package Installer CLI.

Improvement Title: ${data.title}

Current Behavior:
${data.current || 'Not provided'}

Suggested Improvement:
${data.description}

Benefits:
${data.benefits || 'Not provided'}

Implementation Ideas:
${data.implementation || 'Not provided'}

Priority: ${data.priority || 'Medium'}

Additional Context:
${data.additional || 'None'}

Suggested at: ${timestamp}

Best regards,
${data.name || 'Anonymous User'}
${data.email ? `Contact: ${data.email}` : ''}
`
      };
      
    case 'docs':
      return {
        subject: `[Package Installer CLI] Documentation Issue: ${data.title}`,
        body: `Hi Shariq,

I found an issue with Package Installer CLI documentation.

Issue Title: ${data.title}

Documentation Section: ${data.section || 'Not specified'}

Issue Description:
${data.description}

Current Content Problems:
${data.problems || 'Not provided'}

Suggested Improvements:
${data.suggestions || 'Not provided'}

Additional Context:
${data.additional || 'None'}

Reported at: ${timestamp}

Best regards,
${data.name || 'Anonymous User'}
${data.email ? `Contact: ${data.email}` : ''}
`
      };
      
    default:
      return {
        subject: `[Package Installer CLI] User Feedback: ${data.title}`,
        body: `Hi Shariq,

User feedback for Package Installer CLI.

Subject: ${data.title}

Message:
${data.description}

${systemInfo}

Sent at: ${timestamp}

Best regards,
${data.name || 'Anonymous User'}
${data.email ? `Contact: ${data.email}` : ''}
`
      };
  }
}

/**
 * Send email using Email MCP CLI with proper command structure
 */
async function sendEmailViaMcp(to: string, subject: string, body: string): Promise<boolean> {
  try {
    const mcpInfo = await checkEmailMcpAvailability();
    
    if (!mcpInfo.available) {
      throw new Error('Email MCP Server not available');
    }

    // The email-send command expects: esend <to> <subject> <body>
    const args = [to, subject, body];
    const escapedArgs = args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ');
    
    let command = '';
    let options: any = {
      stdio: 'pipe',
      timeout: 45000,
      encoding: 'utf8'
    };

    // Use the appropriate command based on installation type
    switch (mcpInfo.installationType) {
      case 'npx':
        command = `npx @0xshariq/email-mcp-server esend ${escapedArgs}`;
        break;
      case 'global':
        command = `email-cli esend ${escapedArgs}`;
        break;
      case 'local':
        command = `node "${mcpInfo.path}" esend ${escapedArgs}`;
        options.cwd = path.dirname(mcpInfo.path!);
        break;
      default:
        throw new Error('Unknown installation type');
    }

    const output = execSync(command, options);
    return true;
    
  } catch (error: any) {
    // Better error handling with specific error messages
    if (error.message?.includes('timeout')) {
      console.error(chalk.red('❌ Email sending timed out. Check your internet connection.'));
    } else if (error.message?.includes('Environment not configured')) {
      console.error(chalk.red('❌ Email MCP Server not configured. Run: pi email --setup'));
    } else if (error.message?.includes('ERR_MODULE_NOT_FOUND')) {
      console.error(chalk.red('❌ Email MCP Server has missing dependencies.'));
      console.error(chalk.yellow('💡 Try: npm install -g @0xshariq/email-mcp-server (for global use)'));
    } else if (error.message?.includes('Cannot find module')) {
      console.error(chalk.red('❌ Email MCP Server dependencies missing.'));
      if (error.message?.includes('local')) {
        console.error(chalk.yellow('💡 For local development: cd to email-mcp-server && npm install'));
      } else {
        console.error(chalk.yellow('💡 For global use: npm install -g @0xshariq/email-mcp-server'));
      }
    } else {
      console.error(chalk.red(`❌ Failed to send email: ${error.message || error}`));
    }
    return false;
  }
}

/**
 * Collect bug report information
 */
async function collectBugReportInfo(): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Bug title (brief description):',
      validate: (input: string) => input.length > 0 || 'Title is required'
    },
    {
      type: 'editor',
      name: 'description',
      message: 'Detailed description of the bug:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed description'
    },
    {
      type: 'editor',
      name: 'steps',
      message: 'Steps to reproduce (optional):',
      default: '1. \n2. \n3. '
    },
    {
      type: 'input',
      name: 'expected',
      message: 'What did you expect to happen? (optional):'
    },
    {
      type: 'input',
      name: 'actual',
      message: 'What actually happened? (optional):'
    },
    {
      type: 'editor',
      name: 'additional',
      message: 'Any additional information? (optional):'
    }
  ]);
  
  return answers;
}

/**
 * Collect feature request information
 */
async function collectFeatureRequestInfo(): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Feature title:',
      validate: (input: string) => input.length > 0 || 'Title is required'
    },
    {
      type: 'editor',
      name: 'description',
      message: 'Detailed description of the feature:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed description'
    },
    {
      type: 'editor',
      name: 'useCase',
      message: 'Use case - why do you need this feature? (optional):'
    },
    {
      type: 'editor',
      name: 'solution',
      message: 'Proposed solution or implementation ideas (optional):'
    },
    {
      type: 'list',
      name: 'priority',
      message: 'Priority level:',
      choices: [
        { name: 'Low - Nice to have', value: 'Low' },
        { name: 'Medium - Would be helpful', value: 'Medium' },
        { name: 'High - Really needed', value: 'High' },
        { name: 'Critical - Blocking my work', value: 'Critical' }
      ]
    },
    {
      type: 'editor',
      name: 'additional',
      message: 'Additional context or information (optional):'
    }
  ]);
  
  return answers;
}

/**
 * Collect template request information
 */
async function collectTemplateRequestInfo(): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Template name:',
      validate: (input: string) => input.length > 0 || 'Template name is required'
    },
    {
      type: 'input',
      name: 'framework',
      message: 'Framework/Technology (e.g., Next.js, React, Vue, etc.):',
      validate: (input: string) => input.length > 0 || 'Framework is required'
    },
    {
      type: 'editor',
      name: 'description',
      message: 'Template description:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed description'
    },
    {
      type: 'editor',
      name: 'features',
      message: 'Key features/libraries needed:',
      default: '- \n- \n- '
    },
    {
      type: 'input',
      name: 'similar',
      message: 'Similar existing templates (optional):'
    },
    {
      type: 'list',
      name: 'priority',
      message: 'Priority level:',
      choices: [
        { name: 'Low - Nice to have', value: 'Low' },
        { name: 'Medium - Would be helpful', value: 'Medium' },
        { name: 'High - Really needed', value: 'High' }
      ]
    },
    {
      type: 'editor',
      name: 'additional',
      message: 'Additional requirements or context (optional):'
    }
  ]);
  
  return answers;
}

/**
 * Collect general question information
 */
async function collectQuestionInfo(): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Question summary:',
      validate: (input: string) => input.length > 0 || 'Question summary is required'
    },
    {
      type: 'editor',
      name: 'description',
      message: 'Detailed question:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed question'
    },
    {
      type: 'editor',
      name: 'tried',
      message: 'What have you tried so far? (optional):'
    },
    {
      type: 'input',
      name: 'expected',
      message: 'What outcome are you looking for? (optional):'
    }
  ]);
  
  return answers;
}

/**
 * Collect improvement suggestion information
 */
async function collectImprovementInfo(): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Improvement title:',
      validate: (input: string) => input.length > 0 || 'Title is required'
    },
    {
      type: 'input',
      name: 'current',
      message: 'Current behavior (what happens now):',
      validate: (input: string) => input.length > 0 || 'Current behavior description is required'
    },
    {
      type: 'editor',
      name: 'description',
      message: 'Suggested improvement:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed suggestion'
    },
    {
      type: 'editor',
      name: 'benefits',
      message: 'Benefits of this improvement (optional):'
    },
    {
      type: 'editor',
      name: 'implementation',
      message: 'Implementation ideas (optional):'
    },
    {
      type: 'list',
      name: 'priority',
      message: 'Priority level:',
      choices: [
        { name: 'Low - Nice to have', value: 'Low' },
        { name: 'Medium - Would be helpful', value: 'Medium' },
        { name: 'High - Really needed', value: 'High' }
      ]
    },
    {
      type: 'editor',
      name: 'additional',
      message: 'Additional context (optional):'
    }
  ]);
  
  return answers;
}

/**
 * Collect documentation issue information
 */
async function collectDocsIssueInfo(): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Documentation issue title:',
      validate: (input: string) => input.length > 0 || 'Title is required'
    },
    {
      type: 'input',
      name: 'section',
      message: 'Documentation section (e.g., README, commands.md):',
    },
    {
      type: 'editor',
      name: 'description',
      message: 'Issue description:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed description'
    },
    {
      type: 'editor',
      name: 'problems',
      message: 'Current content problems (optional):'
    },
    {
      type: 'editor',
      name: 'suggestions',
      message: 'Suggested improvements (optional):'
    },
    {
      type: 'editor',
      name: 'additional',
      message: 'Additional context (optional):'
    }
  ]);
  
  return answers;
}

/**
 * Collect quick feedback (minimal prompts for fast feedback)
 */
async function collectQuickFeedback(category: string): Promise<any> {
  console.log(chalk.hex('#ffa502')('🚀 Quick Mode - Minimal prompts for fast feedback'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: `Brief ${category} summary:`,
      validate: (input: string) => input.length > 0 || 'Summary is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Detailed description:',
      validate: (input: string) => input.length > 10 || 'Please provide more details (min 10 characters)'
    },
    {
      type: 'input',
      name: 'email',
      message: 'Your email (optional, for follow-up):',
      validate: (input: string) => {
        if (!input) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || 'Please enter a valid email address';
      }
    }
  ]);
  
  return answers;
}

/**
 * Collect user contact information (optional)
 */
async function collectContactInfo(): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Your name (optional):',
    },
    {
      type: 'input',
      name: 'email',
      message: 'Your email (optional, for follow-up):',
      validate: (input: string) => {
        if (!input) return true; // Optional field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || 'Please enter a valid email address';
      }
    }
  ]);
  
  return answers;
}

/**
 * Show available email categories
 */
async function showEmailCategories(): Promise<void> {
  console.log(boxen(
    chalk.hex('#00d2d3')('📋 Available Email Categories') + '\n\n' +
    EMAIL_CATEGORIES.map(cat => 
      `${cat.emoji} ${chalk.bold.cyan(cat.value)} - ${chalk.white(cat.name.replace(cat.emoji + ' ', ''))}\n  ${chalk.gray(cat.description)}`
    ).join('\n\n') + '\n\n' +
    chalk.hex('#95afc0')('Usage: ') + chalk.hex('#00d2d3')('pi email <category>') + '\n' +
    chalk.hex('#95afc0')('Example: ') + chalk.hex('#00d2d3')('pi email bug'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));
}

/**
 * Show installation instructions
 */
async function showInstallInstructions(): Promise<void> {
  console.log(boxen(
    chalk.hex('#00d2d3')('📦 Email MCP Server Installation') + '\n\n' +
    chalk.hex('#ffa502')('Option 1: Global Installation (Recommended)') + '\n' +
    chalk.hex('#00d2d3')('npm install -g @0xshariq/email-mcp-server') + '\n\n' +
    chalk.hex('#ffa502')('Option 2: One-time Usage') + '\n' +
    chalk.hex('#00d2d3')('npx @0xshariq/email-mcp-server') + '\n\n' +
    chalk.hex('#ffa502')('Option 3: Local Development') + '\n' +
    chalk.hex('#00d2d3')('git clone <repo> && npm install') + '\n\n' +
    chalk.hex('#95afc0')('After installation, configure your email credentials.') + '\n' +
    chalk.hex('#95afc0')('Then use: ') + chalk.hex('#00d2d3')('pi email --setup'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'blue'
    }
  ));
}

/**
 * Show setup instructions for email configuration
 */
async function showSetupInstructions(): Promise<void> {
  console.log(boxen(
    chalk.hex('#00d2d3')('🔧 Email Configuration Setup') + '\n\n' +
    chalk.hex('#ffa502')('Required Environment Variables:') + '\n' +
    chalk.hex('#95afc0')('• EMAIL_HOST - SMTP server (e.g., smtp.gmail.com)') + '\n' +
    chalk.hex('#95afc0')('• EMAIL_PORT - Port number (e.g., 587)') + '\n' +
    chalk.hex('#95afc0')('• EMAIL_USER - Your email address') + '\n' +
    chalk.hex('#95afc0')('• EMAIL_PASS - App password or email password') + '\n\n' +
    chalk.hex('#ffa502')('Gmail Setup Example:') + '\n' +
    chalk.gray('EMAIL_HOST=smtp.gmail.com') + '\n' +
    chalk.gray('EMAIL_PORT=587') + '\n' +
    chalk.gray('EMAIL_USER=your-email@gmail.com') + '\n' +
    chalk.gray('EMAIL_PASS=your-app-password') + '\n\n' +
    chalk.hex('#95afc0')('💡 For Gmail, use App Passwords, not your regular password') + '\n' +
    chalk.hex('#95afc0')('💡 Enable 2FA and generate an App Password in Google Account settings'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'yellow'
    }
  ));
}

/**
 * Show email system status
 */
async function showEmailStatus(): Promise<void> {
  console.log(chalk.hex('#00d2d3')('🔍 Checking Email System Status...\n'));
  
  const mcpInfo = await checkEmailMcpAvailability();
  
  const statusColor = mcpInfo.available ? (mcpInfo.configured ? 'green' : 'yellow') : 'red';
  const statusIcon = mcpInfo.available ? (mcpInfo.configured ? '✅' : '⚠️') : '❌';
  const statusText = mcpInfo.available ? 
    (mcpInfo.configured ? 'Ready' : 'Available (Not Configured)') : 
    'Not Found';
  
  console.log(boxen(
    chalk.hex('#00d2d3')('📊 Email System Status') + '\n\n' +
    `${statusIcon} Email MCP Server: ${chalk[statusColor](statusText)}` + '\n' +
    (mcpInfo.version ? `${chalk.blue('ℹ️')} Version: ${chalk.cyan(mcpInfo.version)}` + '\n' : '') +
    (mcpInfo.installationType ? `${chalk.blue('ℹ️')} Type: ${chalk.cyan(mcpInfo.installationType)}` + '\n' : '') +
    (mcpInfo.path ? `${chalk.blue('ℹ️')} Path: ${chalk.gray(mcpInfo.path)}` + '\n' : '') +
    `${chalk.blue('ℹ️')} Configuration: ${mcpInfo.configured ? chalk.green('✅ Configured') : chalk.yellow('⚠️  Not Configured')}` + '\n' +
    `${chalk.blue('ℹ️')} Target Email: ${chalk.cyan('khanshariq92213@gmail.com')}` + '\n' +
    `${chalk.blue('ℹ️')} Package: ${chalk.cyan('@0xshariq/email-mcp-server')}` + '\n\n' +
    
    chalk.hex('#ffa502')('Available Commands:') + '\n' +
    chalk.hex('#95afc0')('• esend - Send basic email (up to 3 recipients)') + '\n' +
    chalk.hex('#95afc0')('• eattach - Send email with attachments') + '\n' +
    chalk.hex('#95afc0')('• ebulk - Send bulk emails to many recipients') + '\n' +
    chalk.hex('#95afc0')('• eread - Read recent emails') + '\n' +
    chalk.hex('#95afc0')('• esearch - Search emails with filters') + '\n\n' +
    
    (mcpInfo.available ? 
      (mcpInfo.configured ? 
        chalk.green('🎉 Ready to send emails! Use: pi email <category>') :
        chalk.yellow('⚠️  Configuration required: pi email --setup')
      ) :
      chalk.yellow('⚠️  Install required: npm install -g @0xshariq/email-mcp-server')
    ) + '\n\n' +
    
    (mcpInfo.installationType === 'local' && !mcpInfo.configured ? 
      chalk.hex('#ffa502')('💡 Local Development Setup:') + '\n' +
      chalk.hex('#95afc0')('• For testing: Use global install (npm install -g @0xshariq/email-mcp-server)') + '\n' +
      chalk.hex('#95afc0')('• For development: Configure .env in email-mcp-server directory') + '\n' +
      chalk.hex('#95afc0')('• See: pi email --setup for configuration details') : ''
    ),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: statusColor
    }
  ));
}

/**
 * Test email connection
 */
async function testEmailConnection(): Promise<void> {
  console.log(chalk.hex('#00d2d3')('🧪 Testing Email Connection...\n'));
  
  const mcpInfo = await checkEmailMcpAvailability();
  
  if (!mcpInfo.available) {
    console.log(boxen(
      chalk.red('❌ Email MCP Server Not Available') + '\n\n' +
      chalk.yellow('Cannot test connection without Email MCP Server.') + '\n' +
      chalk.hex('#95afc0')('Install it first: npm install -g @0xshariq/email-mcp-server'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'red'
      }
    ));
    return;
  }

  console.log(chalk.hex('#9c88ff')('📧 Sending test email...'));
  
  const testSubject = `[Package Installer CLI] Test Email - ${new Date().toISOString()}`;
  const testBody = `This is a test email from Package Installer CLI.

System Information:
- Timestamp: ${new Date().toISOString()}
- Node.js: ${process.version}
- Platform: ${process.platform}
- CLI Version: ${process.env.CLI_VERSION || 'development'}

If you receive this email, the email functionality is working correctly!

Test completed successfully.`;

  const success = await sendEmailViaMcp('khanshariq92213@gmail.com', testSubject, testBody);
  
  if (success) {
    console.log(boxen(
      chalk.green('✅ Test Email Sent Successfully!') + '\n\n' +
      chalk.white('A test email has been sent to khanshariq92213@gmail.com') + '\n' +
      chalk.hex('#95afc0')('The email functionality is working correctly.') + '\n\n' +
      chalk.hex('#00d2d3')('You can now use: pi email <category> to send feedback'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    ));
  } else {
    console.log(boxen(
      chalk.red('❌ Test Email Failed') + '\n\n' +
      chalk.yellow('There was an issue sending the test email.') + '\n' +
      chalk.hex('#95afc0')('Check your email configuration and try again.') + '\n\n' +
      chalk.cyan('Troubleshooting:') + '\n' +
      chalk.hex('#95afc0')('• Run: pi email --setup (for configuration help)') + '\n' +
      chalk.hex('#95afc0')('• Check email credentials and SMTP settings') + '\n' +
      chalk.hex('#95afc0')('• Verify internet connection'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'red'
      }
    ));
  }
}

/**
 * Show development information for local Email MCP Server
 */
async function showDevelopmentInfo(): Promise<void> {
  const mcpInfo = await checkEmailMcpAvailability();
  
  console.log(boxen(
    chalk.hex('#00d2d3')('🛠️ Email MCP Server Development Info') + '\n\n' +
    chalk.hex('#ffa502')('Local Development Status:') + '\n' +
    `${mcpInfo.available && mcpInfo.installationType === 'local' ? chalk.green('✅') : chalk.red('❌')} Local Email MCP Server: ${mcpInfo.available && mcpInfo.installationType === 'local' ? 'Found' : 'Not Found'}` + '\n' +
    (mcpInfo.path && mcpInfo.installationType === 'local' ? `${chalk.blue('ℹ️')} Path: ${chalk.gray(mcpInfo.path)}` + '\n' : '') +
    `${chalk.blue('ℹ️')} Configuration: ${mcpInfo.configured ? chalk.green('✅ Configured') : chalk.yellow('⚠️  Not Configured')}` + '\n\n' +
    
    chalk.hex('#ffa502')('Development Setup Options:') + '\n' +
    chalk.hex('#95afc0')('1. Use Global Install (Recommended for testing):') + '\n' +
    chalk.hex('#00d2d3')('   npm install -g @0xshariq/email-mcp-server') + '\n' +
    chalk.hex('#95afc0')('   # Configure once globally, works everywhere') + '\n\n' +
    
    chalk.hex('#95afc0')('2. Configure Local Development:') + '\n' +
    chalk.hex('#00d2d3')('   cd ~/desktop/shariq-mcp-servers/email-mcp-server') + '\n' +
    chalk.hex('#00d2d3')('   npm install  # Install dependencies') + '\n' +
    chalk.hex('#00d2d3')('   cp .env.example .env  # Create .env file') + '\n' +
    chalk.hex('#00d2d3')('   # Edit .env with your email settings') + '\n\n' +
    
    chalk.hex('#95afc0')('3. One-time Usage (No setup needed):') + '\n' +
    chalk.hex('#00d2d3')('   npx @0xshariq/email-mcp-server esend "email" "subject" "body"') + '\n\n' +
    
    chalk.hex('#ffa502')('Environment Variables (.env):') + '\n' +
    chalk.hex('#95afc0')('EMAIL_HOST=smtp.gmail.com') + '\n' +
    chalk.hex('#95afc0')('EMAIL_PORT=587') + '\n' +
    chalk.hex('#95afc0')('EMAIL_USER=your-email@gmail.com') + '\n' +
    chalk.hex('#95afc0')('EMAIL_PASS=your-app-password') + '\n\n' +
    
    chalk.hex('#ffa502')('Current Issue:') + '\n' +
    (mcpInfo.installationType === 'local' && !mcpInfo.configured ? 
      chalk.yellow('⚠️  Local version found but not configured or has dependency issues') :
      chalk.green('✅ No issues detected')
    ) + '\n\n' +
    
    chalk.hex('#ffa502')('Recommended Action:') + '\n' +
    (mcpInfo.installationType === 'local' && !mcpInfo.configured ? 
      chalk.hex('#00d2d3')('npm install -g @0xshariq/email-mcp-server  # Use global version for testing') :
      chalk.hex('#00d2d3')('pi email --status  # Check current status')
    ),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'blue'
    }
  ));
}

/**
 * Show all available Email MCP Server commands
 */
async function showEmailCommands(): Promise<void> {
  const mcpInfo = await checkEmailMcpAvailability();
  
  console.log(boxen(
    chalk.hex('#00d2d3')('📧 Email MCP Server Commands') + '\n\n' +
    chalk.hex('#ffa502')('Basic Email Operations:') + '\n' +
    chalk.hex('#95afc0')('• esend <to> <subject> <body> - Send email (max 3 recipients)') + '\n' +
    chalk.hex('#95afc0')('• eread [count] - Read recent emails') + '\n' +
    chalk.hex('#95afc0')('• eget <id> - Get specific email by ID') + '\n' +
    chalk.hex('#95afc0')('• edelete <id> - Delete an email') + '\n' +
    chalk.hex('#95afc0')('• emarkread <id> - Mark email as read/unread') + '\n\n' +
    
    chalk.hex('#ffa502')('Advanced Email Operations:') + '\n' +
    chalk.hex('#95afc0')('• eattach <to> <subject> <body> <file> - Send with attachment') + '\n' +
    chalk.hex('#95afc0')('• esearch <query> - Search emails with filters') + '\n' +
    chalk.hex('#95afc0')('• eforward <id> <to> - Forward an email') + '\n' +
    chalk.hex('#95afc0')('• ereply <id> <body> - Reply to an email') + '\n' +
    chalk.hex('#95afc0')('• estats - Get email statistics') + '\n' +
    chalk.hex('#95afc0')('• edraft <to> <subject> <body> - Create email draft') + '\n' +
    chalk.hex('#95afc0')('• eschedule <to> <subject> <body> <time> - Schedule email') + '\n' +
    chalk.hex('#95afc0')('• ebulk <file> <subject> <body> - Send bulk emails') + '\n\n' +
    
    chalk.hex('#ffa502')('Contact Management:') + '\n' +
    chalk.hex('#95afc0')('• cadd <name> <email> - Add new contact') + '\n' +
    chalk.hex('#95afc0')('• clist - List all contacts') + '\n' +
    chalk.hex('#95afc0')('• csearch <query> - Search contacts') + '\n' +
    chalk.hex('#95afc0')('• cgroup <group> - Get contacts by group') + '\n' +
    chalk.hex('#95afc0')('• cupdate <id> <field> <value> - Update contact') + '\n' +
    chalk.hex('#95afc0')('• cdelete <id> - Delete contact') + '\n\n' +
    
    `${mcpInfo.available ? chalk.green('✅') : chalk.red('❌')} Status: ${mcpInfo.available ? 'Available' : 'Not Installed'}` + '\n' +
    (mcpInfo.version ? `${chalk.blue('ℹ️')} Version: ${mcpInfo.version}` + '\n' : '') +
    `${chalk.blue('ℹ️')} Package: @0xshariq/email-mcp-server` + '\n\n' +
    
    chalk.hex('#00d2d3')('Usage Examples:') + '\n' +
    chalk.gray('esend "user@example.com" "Hello" "Test message"') + '\n' +
    chalk.gray('eattach "user@example.com" "Report" "See attached" "./file.pdf"') + '\n' +
    chalk.gray('ebulk "recipients.txt" "Newsletter" "Monthly update"'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: mcpInfo.available ? 'cyan' : 'yellow'
    }
  ));
}

/**
 * Show help for email command
 */
export async function showEmailHelp(): Promise<void> {
  const helpConfig: CommandHelpConfig = {
    commandName: 'Email',
    emoji: '📧',
    description: 'Contact the developer with feedback, bug reports, feature requests, and questions.\nDirect communication channel to improve Package Installer CLI.',
    usage: [
      'email',
      'email [category]'
    ],
    options: [
      { flag: '-h, --help', description: 'Show this help message' },
      { flag: '-l, --list', description: 'List all available email categories' },
      { flag: '--install', description: 'Show Email MCP Server installation instructions' },
      { flag: '--setup', description: 'Show email configuration setup guide' },
      { flag: '--status', description: 'Check email system status and availability' },
      { flag: '--test', description: 'Send a test email to verify functionality' },
      { flag: '--commands', description: 'Show all available Email MCP Server commands' },
      { flag: '--dev', description: 'Show development setup information and troubleshooting' },
      { flag: '--quick', description: 'Quick feedback mode (minimal prompts)' }
    ],
    examples: [
      { command: 'email', description: 'Interactive feedback form with category selection' },
      { command: 'email bug', description: 'Quick bug report form' },
      { command: 'email feature', description: 'Feature request form' },
      { command: 'email template', description: 'Request a new project template' },
      { command: 'email --list', description: 'Show all available categories' },
      { command: 'email --status', description: 'Check if email system is ready' },
      { command: 'email --test', description: 'Send test email to verify setup' },
      { command: 'email --install', description: 'Show installation instructions' },
      { command: 'email --setup', description: 'Show email configuration guide' },
      { command: 'email --commands', description: 'Show all Email MCP Server commands' },
      { command: 'email --dev', description: 'Development setup and troubleshooting' }
    ],
    additionalSections: [
      {
        title: 'Available Categories',
        items: EMAIL_CATEGORIES.map(cat => `${cat.emoji} ${cat.value} - ${cat.description}`)
      },
      {
        title: 'What You Can Contact About',
        items: [
          'Bug reports with detailed reproduction steps',
          'Feature requests and enhancement ideas', 
          'New project template suggestions',
          'Documentation improvements',
          'General questions about CLI usage',
          'Performance or usability improvements'
        ]
      },
      {
        title: 'Email Setup (Required for sending)',
        items: [
          'Install: npm install -g @0xshariq/email-mcp-server',
          'Or use: npx @0xshariq/email-mcp-server',
          'Configure email credentials after installation',
          'Fallback: Manual contact via provided email address'
        ]
      }
    ],
    tips: [
      'Be specific and detailed in your reports',
      'Include system information for bug reports',
      'Provide use cases for feature requests',
      'Your contact info is optional but helpful for follow-up'
    ]
  };
  
  createStandardHelp(helpConfig);
}

/**
 * Main email command handler
 */
export async function emailCommand(
  category?: string, 
  options: { 
    help?: boolean; 
    list?: boolean; 
    test?: boolean; 
    setup?: boolean; 
    status?: boolean;
    quick?: boolean;
    install?: boolean;
    commands?: boolean;
    dev?: boolean;
  } = {}
): Promise<void> {
  try {
    // Handle help flag
    if (options.help) {
      await showEmailHelp();
      return;
    }

    // Handle list categories flag
    if (options.list) {
      await showEmailCategories();
      return;
    }

    // Handle install flag
    if (options.install) {
      await showInstallInstructions();
      return;
    }

    // Handle setup flag
    if (options.setup) {
      await showSetupInstructions();
      return;
    }

    // Handle status flag
    if (options.status) {
      await showEmailStatus();
      return;
    }

    // Handle test flag
    if (options.test) {
      await testEmailConnection();
      return;
    }

    // Handle commands flag (show all available email commands)
    if (options.commands) {
      await showEmailCommands();
      return;
    }

    // Handle dev flag (development mode info)
    if (options.dev) {
      await showDevelopmentInfo();
      return;
    }

    // Display command banner
    displayCommandBanner('Email', 'Contact the developer with feedback, suggestions, and questions');
    
    // Check if Email MCP CLI is available
    const mcpInfo = await checkEmailMcpAvailability();
    if (!mcpInfo.available) {
      const statusMessage = mcpInfo.available ? 
        (mcpInfo.configured ? '' : 
          chalk.yellow('📧 Email MCP Server found but not configured') + '\n\n' +
          chalk.cyan('🔧 Configuration Required:') + '\n' +
          chalk.hex('#95afc0')('• Run: pi email --setup (for configuration guide)') + '\n' +
          chalk.hex('#95afc0')('• Or use global install: npm install -g @0xshariq/email-mcp-server') + '\n\n'
        ) :
        chalk.red('❌ Email MCP Server Not Available') + '\n\n' +
        chalk.cyan('📦 Quick Install:') + '\n' +
        chalk.hex('#00d2d3')('npm install -g @0xshariq/email-mcp-server') + '\n\n' +
        chalk.cyan('💡 One-time Usage:') + '\n' +
        chalk.hex('#00d2d3')('npx @0xshariq/email-mcp-server esend <email> <subject> <body>') + '\n\n';

      console.log(boxen(
        statusMessage +
        chalk.cyan('🔧 After Installation/Configuration:') + '\n' +
        chalk.hex('#95afc0')('• Configure your email credentials (Gmail, Outlook, etc.)') + '\n' +
        chalk.hex('#95afc0')('• Run this command again to send feedback') + '\n\n' +
        chalk.cyan('📞 Alternative Contact Methods:') + '\n' +
        chalk.hex('#95afc0')('📧 Direct Email: khanshariq92213@gmail.com') + '\n' +
        chalk.hex('#95afc0')('🐙 GitHub Issues: Create an issue on the repository'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: mcpInfo.available ? 'yellow' : 'red'
        }
      ));
      
      // Show a quick install command for easy copy-paste
      if (!mcpInfo.available) {
        console.log('\n' + chalk.hex('#00d2d3')('💻 Quick Install Command:'));
        console.log(chalk.gray('npm install -g @0xshariq/email-mcp-server'));
      } else if (!mcpInfo.configured) {
        console.log('\n' + chalk.hex('#00d2d3')('💻 Quick Setup:'));
        console.log(chalk.gray('pi email --setup'));
      }
      
      return;
    }

    // Show welcome message
    console.log(boxen(
      chalk.hex('#00d2d3')('📧 Contact Developer') + '\n\n' +
      chalk.white('I appreciate your feedback and contributions to improve Package Installer CLI!') + '\n\n' +
      chalk.hex('#95afc0')('• Bug reports help fix issues quickly') + '\n' +
      chalk.hex('#95afc0')('• Feature requests shape future development') + '\n' +
      chalk.hex('#95afc0')('• Template requests expand project options') + '\n' +
      chalk.hex('#95afc0')('• Questions help improve documentation'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    ));

    let selectedCategory = category;

    // If no category specified, show selection
    if (!selectedCategory) {
      const { category: chosenCategory } = await inquirer.prompt([
        {
          type: 'list',
          name: 'category',
          message: chalk.hex('#9c88ff')('What would you like to contact me about?'),
          choices: EMAIL_CATEGORIES.map(cat => ({
            name: `${cat.name} - ${chalk.gray(cat.description)}`,
            value: cat.value,
            short: cat.value
          })),
          pageSize: 10
        }
      ]);
      selectedCategory = chosenCategory;
    }

    // Validate category
    const categoryConfig = EMAIL_CATEGORIES.find(cat => cat.value === selectedCategory);
    if (!categoryConfig) {
      console.log(chalk.red(`❌ Invalid category: ${selectedCategory}`));
      console.log(chalk.yellow(`💡 Available categories: ${EMAIL_CATEGORIES.map(c => c.value).join(', ')}`));
      return;
    }

    console.log(`\n${categoryConfig.emoji} ${chalk.bold.cyan('Collecting information for:')} ${chalk.white(categoryConfig.name)}`);

    // Collect category-specific information
    let categoryData: any;
    
    if (options.quick) {
      // Quick mode - minimal prompts
      categoryData = await collectQuickFeedback(selectedCategory!);
    } else {
      // Full mode - detailed prompts
      switch (selectedCategory) {
        case 'bug':
          categoryData = await collectBugReportInfo();
          break;
        case 'feature':
          categoryData = await collectFeatureRequestInfo();
          break;
        case 'template':
          categoryData = await collectTemplateRequestInfo();
          break;
        case 'question':
          categoryData = await collectQuestionInfo();
          break;
        case 'improvement':
          categoryData = await collectImprovementInfo();
          break;
        case 'docs':
          categoryData = await collectDocsIssueInfo();
          break;
        default:
          categoryData = await collectQuestionInfo(); // Fallback
      }
    }

    // Collect optional contact information
    console.log(chalk.hex('#95afc0')('\n📞 Contact information (optional, for follow-up):'));
    const contactData = await collectContactInfo();

    // Merge all data
    const allData = { ...categoryData, ...contactData };

    // Generate email content
    const { subject, body } = generateEmailTemplate(selectedCategory!, allData);

    // Show preview
    console.log(boxen(
      chalk.hex('#00d2d3')('📧 Email Preview') + '\n\n' +
      chalk.gray('To: khanshariq92213@gmail.com') + '\n' +
      chalk.gray(`Subject: ${subject}`) + '\n\n' +
      chalk.white(body.substring(0, 300) + (body.length > 300 ? '...' : '')),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'blue'
      }
    ));

    // Confirm sending
    const { confirmSend } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmSend',
        message: 'Send this email?',
        default: true
      }
    ]);

    if (!confirmSend) {
      console.log(chalk.yellow('📧 Email cancelled. Your feedback is still valuable!'));
      return;
    }

    // Send email
    console.log(chalk.hex('#9c88ff')('📧 Sending email...'));
    const success = await sendEmailViaMcp('khanshariq92213@gmail.com', subject, body);

    if (success) {
      console.log(boxen(
        chalk.green('✅ Email sent successfully!') + '\n\n' +
        chalk.white('Thank you for your feedback!') + '\n' +
        chalk.hex('#95afc0')('I\'ll review your message and get back to you if needed.') + '\n\n' +
        chalk.hex('#00d2d3')('Your contribution helps make Package Installer CLI better! 🚀'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green'
        }
      ));
    } else {
      console.log(boxen(
        chalk.red('❌ Failed to send email') + '\n\n' +
        chalk.yellow('Troubleshooting:') + '\n' +
        chalk.hex('#95afc0')('• Ensure @0xshariq/email-mcp-server is installed') + '\n' +
        chalk.hex('#95afc0')('• Check your email configuration') + '\n' +
        chalk.hex('#95afc0')('• Verify internet connection') + '\n\n' +
        chalk.yellow('Alternative contact methods:') + '\n' +
        chalk.hex('#95afc0')('📧 Direct email: khanshariq92213@gmail.com') + '\n' +
        chalk.hex('#95afc0')('🐙 GitHub: Create an issue on the repository') + '\n\n' +
        chalk.gray('Subject: ' + subject) + '\n' +
        chalk.gray('Please copy the message content for manual sending.'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'red'
        }
      ));
    }

  } catch (error: any) {
    console.error(chalk.red(`❌ Error in email command: ${error.message}`));
  }
}