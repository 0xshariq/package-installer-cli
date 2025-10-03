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
 * Generate HTML email template with CSS styling
 */
function generateHtmlEmailTemplate(category: string, data: any): { subject: string; htmlBody: string; plainBody: string } {
  const systemInfo = getSystemInfo();
  const timestamp = new Date().toLocaleString();
  
  // Common CSS styles for all emails
  const emailCSS = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8f9fa;
      }
      .email-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
      }
      .header .emoji {
        font-size: 48px;
        display: block;
        margin-bottom: 10px;
      }
      .content {
        padding: 30px;
      }
      .section {
        margin-bottom: 25px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }
      .section h3 {
        margin: 0 0 15px 0;
        color: #667eea;
        font-size: 18px;
        font-weight: 600;
      }
      .section p {
        margin: 0;
        white-space: pre-wrap;
      }
      .priority-high {
        border-left-color: #e74c3c;
      }
      .priority-high h3 {
        color: #e74c3c;
      }
      .priority-critical {
        border-left-color: #c0392b;
        background: #fdf2f2;
      }
      .priority-critical h3 {
        color: #c0392b;
      }
      .system-info {
        background: #e8f4f8;
        border: 1px solid #bee5eb;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 13px;
        color: #495057;
      }
      .steps-list {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 15px;
        margin: 10px 0;
      }
      .steps-list ol {
        margin: 0;
        padding-left: 20px;
      }
      .steps-list li {
        margin: 8px 0;
        padding: 5px 0;
      }
      .features-list {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 15px;
        margin: 10px 0;
      }
      .features-list ul {
        margin: 0;
        padding-left: 20px;
      }
      .features-list li {
        margin: 8px 0;
        padding: 5px 0;
      }
      .footer {
        background: #495057;
        color: white;
        padding: 20px 30px;
        text-align: center;
        font-size: 14px;
      }
      .priority-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        margin-left: 10px;
      }
      .priority-low {
        background: #d1ecf1;
        color: #0c5460;
      }
      .priority-medium {
        background: #fff3cd;
        color: #856404;
      }
      .priority-high-badge {
        background: #f8d7da;
        color: #721c24;
      }
      .priority-critical-badge {
        background: #f5c6cb;
        color: #491217;
      }
      .contact-info {
        background: #e8f5e8;
        border: 1px solid #c3e6cb;
        border-radius: 6px;
        padding: 15px;
        margin: 15px 0;
      }
      .timestamp {
        color: #6c757d;
        font-size: 13px;
        font-style: italic;
      }
    </style>
  `;

  // Category-specific configurations
  const categoryConfig = EMAIL_CATEGORIES.find(cat => cat.value === category) || EMAIL_CATEGORIES[0];
  
  switch (category) {
    case 'bug':
      const stepsHtml = data.steps ? 
        `<div class="steps-list"><ol>${data.steps.split('|').map((step: string) => `<li>${step.trim()}</li>`).join('')}</ol></div>` : 
        '<p style="color: #6c757d; font-style: italic;">Not provided</p>';
      
      return {
        subject: `[Package Installer CLI] 🐛 Bug Report: ${data.title}`,
        htmlBody: `
          ${emailCSS}
          <body>
            <div class="email-container">
              <div class="header">
                <span class="emoji">🐛</span>
                <h1>Bug Report</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Package Installer CLI</p>
              </div>
              
              <div class="content">
                <div class="section">
                  <h3>Bug Title</h3>
                  <p><strong>${data.title}</strong></p>
                </div>
                
                <div class="section">
                  <h3>Description</h3>
                  <p>${data.description}</p>
                </div>
                
                <div class="section">
                  <h3>Steps to Reproduce</h3>
                  ${stepsHtml}
                </div>
                
                <div class="section">
                  <h3>Expected Behavior</h3>
                  <p>${data.expected || '<span style="color: #6c757d; font-style: italic;">Not provided</span>'}</p>
                </div>
                
                <div class="section">
                  <h3>Actual Behavior</h3>
                  <p>${data.actual || '<span style="color: #6c757d; font-style: italic;">Not provided</span>'}</p>
                </div>
                
                ${data.additional ? `
                <div class="section">
                  <h3>Additional Information</h3>
                  <p>${data.additional}</p>
                </div>
                ` : ''}
                
                <div class="system-info">
                  <strong>System Information:</strong><br>
                  ${systemInfo.replace(/\n/g, '<br>')}
                </div>
                
                ${data.name || data.email ? `
                <div class="contact-info">
                  <strong>Contact Information:</strong><br>
                  ${data.name ? `Name: ${data.name}<br>` : ''}
                  ${data.email ? `Email: ${data.email}` : ''}
                </div>
                ` : ''}
              </div>
              
              <div class="footer">
                <div class="timestamp">Reported at: ${timestamp}</div>
                <p style="margin: 10px 0 0 0;">Thank you for helping improve Package Installer CLI! 🚀</p>
              </div>
            </div>
          </body>
        `,
        plainBody: `Hi Shariq,

I encountered a bug while using Package Installer CLI.

Bug Title: ${data.title}

Description:
${data.description}

Steps to Reproduce:
${data.steps ? data.steps.split('|').map((step: string, index: number) => `${index + 1}. ${step.trim()}`).join('\n') : 'Not provided'}

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
${data.email ? `Contact: ${data.email}` : ''}`
      };
      
    case 'feature':
      const priorityClass = data.priority === 'High' ? 'priority-high' : 
                           data.priority === 'Critical' ? 'priority-critical' : '';
      const priorityBadgeClass = data.priority === 'High' ? 'priority-high-badge' : 
                                data.priority === 'Critical' ? 'priority-critical-badge' :
                                data.priority === 'Medium' ? 'priority-medium' : 'priority-low';
      
      return {
        subject: `[Package Installer CLI] 💡 Feature Request: ${data.title}`,
        htmlBody: `
          ${emailCSS}
          <body>
            <div class="email-container">
              <div class="header">
                <span class="emoji">💡</span>
                <h1>Feature Request</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Package Installer CLI</p>
              </div>
              
              <div class="content">
                <div class="section ${priorityClass}">
                  <h3>Feature Title 
                    <span class="priority-badge ${priorityBadgeClass}">${data.priority || 'Medium'} Priority</span>
                  </h3>
                  <p><strong>${data.title}</strong></p>
                </div>
                
                <div class="section">
                  <h3>Description</h3>
                  <p>${data.description}</p>
                </div>
                
                ${data.useCase ? `
                <div class="section">
                  <h3>Use Case</h3>
                  <p>${data.useCase}</p>
                </div>
                ` : ''}
                
                ${data.solution ? `
                <div class="section">
                  <h3>Proposed Solution</h3>
                  <p>${data.solution}</p>
                </div>
                ` : ''}
                
                ${data.additional ? `
                <div class="section">
                  <h3>Additional Context</h3>
                  <p>${data.additional}</p>
                </div>
                ` : ''}
                
                ${data.name || data.email ? `
                <div class="contact-info">
                  <strong>Contact Information:</strong><br>
                  ${data.name ? `Name: ${data.name}<br>` : ''}
                  ${data.email ? `Email: ${data.email}` : ''}
                </div>
                ` : ''}
              </div>
              
              <div class="footer">
                <div class="timestamp">Submitted at: ${timestamp}</div>
                <p style="margin: 10px 0 0 0;">Thank you for helping improve Package Installer CLI! 🚀</p>
              </div>
            </div>
          </body>
        `,
        plainBody: `Hi Shariq,

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
${data.email ? `Contact: ${data.email}` : ''}`
      };
      
    case 'template':
      const featuresHtml = data.features ? 
        `<div class="features-list"><ul>${data.features.split('|').map((feature: string) => `<li>${feature.trim()}</li>`).join('')}</ul></div>` : 
        '<p style="color: #6c757d; font-style: italic;">Not provided</p>';
      const templatePriorityClass = data.priority === 'High' ? 'priority-high' : '';
      const templatePriorityBadgeClass = data.priority === 'High' ? 'priority-high-badge' : 
                                        data.priority === 'Medium' ? 'priority-medium' : 'priority-low';
      
      return {
        subject: `[Package Installer CLI] 📋 Template Request: ${data.title}`,
        htmlBody: `
          ${emailCSS}
          <body>
            <div class="email-container">
              <div class="header">
                <span class="emoji">📋</span>
                <h1>Template Request</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Package Installer CLI</p>
              </div>
              
              <div class="content">
                <div class="section ${templatePriorityClass}">
                  <h3>Template Request 
                    <span class="priority-badge ${templatePriorityBadgeClass}">${data.priority || 'Medium'} Priority</span>
                  </h3>
                  <p><strong>${data.title}</strong></p>
                </div>
                
                <div class="section">
                  <h3>Framework/Technology</h3>
                  <p><code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${data.framework || 'Not specified'}</code></p>
                </div>
                
                <div class="section">
                  <h3>Description</h3>
                  <p>${data.description}</p>
                </div>
                
                <div class="section">
                  <h3>Key Features Needed</h3>
                  ${featuresHtml}
                </div>
                
                ${data.similar ? `
                <div class="section">
                  <h3>Similar Templates</h3>
                  <p>${data.similar}</p>
                </div>
                ` : ''}
                
                ${data.additional ? `
                <div class="section">
                  <h3>Additional Requirements</h3>
                  <p>${data.additional}</p>
                </div>
                ` : ''}
                
                ${data.name || data.email ? `
                <div class="contact-info">
                  <strong>Contact Information:</strong><br>
                  ${data.name ? `Name: ${data.name}<br>` : ''}
                  ${data.email ? `Email: ${data.email}` : ''}
                </div>
                ` : ''}
              </div>
              
              <div class="footer">
                <div class="timestamp">Requested at: ${timestamp}</div>
                <p style="margin: 10px 0 0 0;">Thank you for helping expand Package Installer CLI templates! 🚀</p>
              </div>
            </div>
          </body>
        `,
        plainBody: `Hi Shariq,

I would like to request a new template for Package Installer CLI.

Template Name: ${data.title}

Framework/Technology: ${data.framework || 'Not specified'}

Description:
${data.description}

Key Features Needed:
${data.features ? data.features.split('|').map((feature: string) => `- ${feature.trim()}`).join('\n') : 'Not provided'}

Similar Templates:
${data.similar || 'Not provided'}

Priority: ${data.priority || 'Medium'}

Additional Requirements:
${data.additional || 'None'}

Requested at: ${timestamp}

Best regards,
${data.name || 'Anonymous User'}
${data.email ? `Contact: ${data.email}` : ''}`
      };
      
    case 'question':
      return {
        subject: `[Package Installer CLI] ❓ Question: ${data.title}`,
        htmlBody: `
          ${emailCSS}
          <body>
            <div class="email-container">
              <div class="header">
                <span class="emoji">❓</span>
                <h1>General Question</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Package Installer CLI</p>
              </div>
              
              <div class="content">
                <div class="section">
                  <h3>Question</h3>
                  <p><strong>${data.title}</strong></p>
                </div>
                
                <div class="section">
                  <h3>Details</h3>
                  <p>${data.description}</p>
                </div>
                
                ${data.tried ? `
                <div class="section">
                  <h3>What I've Tried</h3>
                  <p>${data.tried}</p>
                </div>
                ` : ''}
                
                ${data.expected ? `
                <div class="section">
                  <h3>Expected Outcome</h3>
                  <p>${data.expected}</p>
                </div>
                ` : ''}
                
                <div class="system-info">
                  <strong>System Information:</strong><br>
                  ${systemInfo.replace(/\n/g, '<br>')}
                </div>
                
                ${data.name || data.email ? `
                <div class="contact-info">
                  <strong>Contact Information:</strong><br>
                  ${data.name ? `Name: ${data.name}<br>` : ''}
                  ${data.email ? `Email: ${data.email}` : ''}
                </div>
                ` : ''}
              </div>
              
              <div class="footer">
                <div class="timestamp">Asked at: ${timestamp}</div>
                <p style="margin: 10px 0 0 0;">Thank you for reaching out! 🚀</p>
              </div>
            </div>
          </body>
        `,
        plainBody: `Hi Shariq,

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
${data.email ? `Contact: ${data.email}` : ''}`
      };
      
    case 'improvement':
      const improvementPriorityClass = data.priority === 'High' ? 'priority-high' : '';
      const improvementPriorityBadgeClass = data.priority === 'High' ? 'priority-high-badge' : 
                                           data.priority === 'Medium' ? 'priority-medium' : 'priority-low';
      
      return {
        subject: `[Package Installer CLI] 🚀 Improvement Suggestion: ${data.title}`,
        htmlBody: `
          ${emailCSS}
          <body>
            <div class="email-container">
              <div class="header">
                <span class="emoji">🚀</span>
                <h1>Improvement Suggestion</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Package Installer CLI</p>
              </div>
              
              <div class="content">
                <div class="section ${improvementPriorityClass}">
                  <h3>Improvement Title 
                    <span class="priority-badge ${improvementPriorityBadgeClass}">${data.priority || 'Medium'} Priority</span>
                  </h3>
                  <p><strong>${data.title}</strong></p>
                </div>
                
                <div class="section">
                  <h3>Current Behavior</h3>
                  <p>${data.current}</p>
                </div>
                
                <div class="section">
                  <h3>Suggested Improvement</h3>
                  <p>${data.description}</p>
                </div>
                
                ${data.benefits ? `
                <div class="section">
                  <h3>Benefits</h3>
                  <p>${data.benefits}</p>
                </div>
                ` : ''}
                
                ${data.implementation ? `
                <div class="section">
                  <h3>Implementation Ideas</h3>
                  <p>${data.implementation}</p>
                </div>
                ` : ''}
                
                ${data.additional ? `
                <div class="section">
                  <h3>Additional Context</h3>
                  <p>${data.additional}</p>
                </div>
                ` : ''}
                
                ${data.name || data.email ? `
                <div class="contact-info">
                  <strong>Contact Information:</strong><br>
                  ${data.name ? `Name: ${data.name}<br>` : ''}
                  ${data.email ? `Email: ${data.email}` : ''}
                </div>
                ` : ''}
              </div>
              
              <div class="footer">
                <div class="timestamp">Suggested at: ${timestamp}</div>
                <p style="margin: 10px 0 0 0;">Thank you for helping improve Package Installer CLI! 🚀</p>
              </div>
            </div>
          </body>
        `,
        plainBody: `Hi Shariq,

I have a suggestion to improve Package Installer CLI.

Improvement Title: ${data.title}

Current Behavior:
${data.current}

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
${data.email ? `Contact: ${data.email}` : ''}`
      };
      
    case 'docs':
      return {
        subject: `[Package Installer CLI] 📖 Documentation Issue: ${data.title}`,
        htmlBody: `
          ${emailCSS}
          <body>
            <div class="email-container">
              <div class="header">
                <span class="emoji">📖</span>
                <h1>Documentation Issue</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Package Installer CLI</p>
              </div>
              
              <div class="content">
                <div class="section">
                  <h3>Issue Title</h3>
                  <p><strong>${data.title}</strong></p>
                </div>
                
                ${data.section ? `
                <div class="section">
                  <h3>Documentation Section</h3>
                  <p><code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${data.section}</code></p>
                </div>
                ` : ''}
                
                <div class="section">
                  <h3>Issue Description</h3>
                  <p>${data.description}</p>
                </div>
                
                ${data.problems ? `
                <div class="section">
                  <h3>Current Content Problems</h3>
                  <p>${data.problems}</p>
                </div>
                ` : ''}
                
                ${data.suggestions ? `
                <div class="section">
                  <h3>Suggested Improvements</h3>
                  <p>${data.suggestions}</p>
                </div>
                ` : ''}
                
                ${data.additional ? `
                <div class="section">
                  <h3>Additional Context</h3>
                  <p>${data.additional}</p>
                </div>
                ` : ''}
                
                ${data.name || data.email ? `
                <div class="contact-info">
                  <strong>Contact Information:</strong><br>
                  ${data.name ? `Name: ${data.name}<br>` : ''}
                  ${data.email ? `Email: ${data.email}` : ''}
                </div>
                ` : ''}
              </div>
              
              <div class="footer">
                <div class="timestamp">Reported at: ${timestamp}</div>
                <p style="margin: 10px 0 0 0;">Thank you for helping improve our documentation! 📚</p>
              </div>
            </div>
          </body>
        `,
        plainBody: `Hi Shariq,

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
${data.email ? `Contact: ${data.email}` : ''}`
      };
      
    default:
      return {
        subject: `[Package Installer CLI] 📧 User Feedback: ${data.title}`,
        htmlBody: `
          ${emailCSS}
          <body>
            <div class="email-container">
              <div class="header">
                <span class="emoji">📧</span>
                <h1>User Feedback</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Package Installer CLI</p>
              </div>
              
              <div class="content">
                <div class="section">
                  <h3>Subject</h3>
                  <p><strong>${data.title}</strong></p>
                </div>
                
                <div class="section">
                  <h3>Message</h3>
                  <p>${data.description}</p>
                </div>
                
                <div class="system-info">
                  <strong>System Information:</strong><br>
                  ${systemInfo.replace(/\n/g, '<br>')}
                </div>
                
                ${data.name || data.email ? `
                <div class="contact-info">
                  <strong>Contact Information:</strong><br>
                  ${data.name ? `Name: ${data.name}<br>` : ''}
                  ${data.email ? `Email: ${data.email}` : ''}
                </div>
                ` : ''}
              </div>
              
              <div class="footer">
                <div class="timestamp">Sent at: ${timestamp}</div>
                <p style="margin: 10px 0 0 0;">Thank you for your feedback! 🚀</p>
              </div>
            </div>
          </body>
        `,
        plainBody: `Hi Shariq,

User feedback for Package Installer CLI.

Subject: ${data.title}

Message:
${data.description}

${systemInfo}

Sent at: ${timestamp}

Best regards,
${data.name || 'Anonymous User'}
${data.email ? `Contact: ${data.email}` : ''}`
      };
  }
}



/**
 * Configure Email MCP Server with user's email credentials
 */
async function configureEmailMcp(): Promise<boolean> {
  try {
    console.log(boxen(
      chalk.hex('#00d2d3')('🔧 Email Configuration Setup') + '\n\n' +
      chalk.white('To send emails, we need to configure your email credentials.') + '\n' +
      chalk.hex('#95afc0')('Your credentials will be stored securely and used only for sending feedback emails.') + '\n\n' +
      chalk.hex('#ffa502')('Supported Email Providers:') + '\n' +
      chalk.hex('#95afc0')('• Gmail (recommended)') + '\n' +
      chalk.hex('#95afc0')('• Outlook/Hotmail') + '\n' +
      chalk.hex('#95afc0')('• Yahoo') + '\n' +
      chalk.hex('#95afc0')('• Custom SMTP servers'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    ));

    // Collect email configuration
    const emailConfig = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select your email provider:',
        choices: [
          { name: '📧 Gmail', value: 'gmail' },
          { name: '🔷 Outlook/Hotmail', value: 'outlook' },
          { name: '🟡 Yahoo', value: 'yahoo' },
          { name: '⚙️ Custom SMTP', value: 'custom' }
        ]
      },
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email address:',
        validate: (input: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(input) || 'Please enter a valid email address';
        }
      },
      {
        type: 'password',
        name: 'password',
        message: (answers: any) => {
          if (answers.provider === 'gmail') {
            return 'Enter your Gmail App Password (not regular password):';
          }
          return 'Enter your email password or app password:';
        },
        validate: (input: string) => input.length > 0 || 'Password is required'
      }
    ]);

    // Add custom SMTP settings if needed
    let smtpConfig: any = {};
    if (emailConfig.provider === 'custom') {
      smtpConfig = await inquirer.prompt([
        {
          type: 'input',
          name: 'host',
          message: 'SMTP Host (e.g., smtp.gmail.com):',
          validate: (input: string) => input.length > 0 || 'SMTP host is required'
        },
        {
          type: 'input',
          name: 'port',
          message: 'SMTP Port (e.g., 587):',
          default: '587',
          validate: (input: string) => {
            const port = parseInt(input);
            return (port > 0 && port <= 65535) || 'Please enter a valid port number';
          }
        }
      ]);
    }

    // Set provider-specific SMTP settings
    let host: string, port: string;
    switch (emailConfig.provider) {
      case 'gmail':
        host = 'smtp.gmail.com';
        port = '587';
        break;
      case 'outlook':
        host = 'smtp.live.com';
        port = '587';
        break;
      case 'yahoo':
        host = 'smtp.mail.yahoo.com';
        port = '587';
        break;
      case 'custom':
        host = smtpConfig.host;
        port = smtpConfig.port;
        break;
      default:
        host = 'smtp.gmail.com';
        port = '587';
    }

    // Show provider-specific setup instructions
    if (emailConfig.provider === 'gmail') {
      console.log(boxen(
        chalk.hex('#ffa502')('📧 Gmail Setup Instructions') + '\n\n' +
        chalk.hex('#95afc0')('For Gmail, you need to use an App Password:') + '\n' +
        chalk.hex('#95afc0')('1. Enable 2-Factor Authentication in your Google Account') + '\n' +
        chalk.hex('#95afc0')('2. Go to Google Account Settings > Security') + '\n' +
        chalk.hex('#95afc0')('3. Under "2-Step Verification", click "App passwords"') + '\n' +
        chalk.hex('#95afc0')('4. Generate a new app password for "Mail"') + '\n' +
        chalk.hex('#95afc0')('5. Use that 16-character password above') + '\n\n' +
        chalk.hex('#00d2d3')('💡 Regular Gmail passwords will NOT work!'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'yellow'
        }
      ));
    }

    // Create .env content
    const envContent = `# Email MCP Server Configuration
# Generated by Package Installer CLI
EMAIL_HOST=${host}
EMAIL_PORT=${port}
EMAIL_USER=${emailConfig.email}
EMAIL_PASS=${emailConfig.password}
EMAIL_SECURE=false
EMAIL_TLS=true
`;

    // Find Email MCP Server directory and create .env file
    const mcpInfo = await checkEmailMcpAvailability();
    let envFilePath: string;

    if (mcpInfo.installationType === 'local' && mcpInfo.path) {
      // Local installation - create .env in the project directory
      const projectDir = path.dirname(mcpInfo.path);
      envFilePath = path.join(projectDir, '.env');
    } else {
      // Global or npx installation - create .env in home directory
      const configDir = path.join(os.homedir(), '.email-mcp-server');
      await fs.ensureDir(configDir);
      envFilePath = path.join(configDir, '.env');
    }

    // Write .env file
    await fs.writeFile(envFilePath, envContent, 'utf8');

    console.log(boxen(
      chalk.green('✅ Email Configuration Saved!') + '\n\n' +
      chalk.white('Email credentials have been configured successfully.') + '\n' +
      chalk.hex('#95afc0')(`Configuration saved to: ${chalk.cyan(envFilePath)}`) + '\n\n' +
      chalk.hex('#00d2d3')('You can now send feedback emails using the CLI!') + '\n' +
      chalk.hex('#95afc0')('Test the setup with: ') + chalk.cyan('pi email --test'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    ));

    return true;
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to configure email: ${error.message}`));
    return false;
  }
}

/**
 * Check if email is configured and prompt for setup if needed
 */
async function ensureEmailConfigured(): Promise<boolean> {
  const mcpInfo = await checkEmailMcpAvailability();
  
  if (!mcpInfo.available) {
    console.log(chalk.yellow('⚠️ Email MCP Server not installed. Please install it first:'));
    console.log(chalk.cyan('npm install -g @0xshariq/email-mcp-server'));
    return false;
  }

  if (!mcpInfo.configured) {
    console.log(chalk.yellow('⚠️ Email not configured. Setting up email configuration...'));
    return await configureEmailMcp();
  }

  return true;
}

/**
 * Get the configured email from .env file
 */
async function getConfiguredEmail(): Promise<string | null> {
  try {
    const mcpInfo = await checkEmailMcpAvailability();
    let envFilePath: string;

    if (mcpInfo.installationType === 'local' && mcpInfo.path) {
      const projectDir = path.dirname(mcpInfo.path);
      envFilePath = path.join(projectDir, '.env');
    } else {
      const configDir = path.join(os.homedir(), '.email-mcp-server');
      envFilePath = path.join(configDir, '.env');
    }

    if (await fs.pathExists(envFilePath)) {
      const envContent = await fs.readFile(envFilePath, 'utf8');
      const emailMatch = envContent.match(/EMAIL_USER=(.+)/);
      return emailMatch ? emailMatch[1].trim() : null;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Collect sender email option from user
 */
async function collectSenderEmailOption(): Promise<{ 
  useConfigured: boolean; 
  customEmail?: string; 
  customPassword?: string;
  customProvider?: string;
}> {
  const configuredEmail = await getConfiguredEmail();
  
  if (!configuredEmail) {
    // No configured email, must use custom
    console.log(chalk.yellow('⚠️ No configured email found. Please provide your email credentials:'));
    const customCredentials = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email address:',
        validate: (input: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(input) || 'Please enter a valid email address';
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter your email password or app password:',
        validate: (input: string) => input.length > 0 || 'Password is required'
      }
    ]);
    
    return {
      useConfigured: false,
      customEmail: customCredentials.email,
      customPassword: customCredentials.password
    };
  }

  // Show options for configured vs custom email
  const { emailOption } = await inquirer.prompt([
    {
      type: 'list',
      name: 'emailOption',
      message: 'Which email would you like to use for sending?',
      choices: [
        {
          name: `📧 Use configured email: ${chalk.cyan(configuredEmail)}`,
          value: 'configured'
        },
        {
          name: '✉️ Use a different email (temporary)',
          value: 'custom'
        }
      ]
    }
  ]);

  if (emailOption === 'configured') {
    return { useConfigured: true };
  }

  // Collect custom email credentials
  const customCredentials = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Enter your email address:',
      validate: (input: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || 'Please enter a valid email address';
      }
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your email password or app password:',
      validate: (input: string) => input.length > 0 || 'Password is required'
    },
    {
      type: 'list',
      name: 'provider',
      message: 'Select your email provider:',
      choices: [
        { name: '📧 Gmail', value: 'gmail' },
        { name: '🔷 Outlook/Hotmail', value: 'outlook' },
        { name: '🟡 Yahoo', value: 'yahoo' },
        { name: '⚙️ Custom SMTP', value: 'custom' }
      ]
    }
  ]);

  return {
    useConfigured: false,
    customEmail: customCredentials.email,
    customPassword: customCredentials.password,
    customProvider: customCredentials.provider
  };
}

/**
 * Send email using Email MCP CLI with proper command structure
 * Supports both plain text and HTML emails
 * Uses user's configured or custom email to send to khanshariq92213@gmail.com
 */
async function sendEmailViaMcp(
  subject: string, 
  body: string, 
  htmlBody?: string, 
  customCredentials?: { email: string; password: string; provider?: string }
): Promise<boolean> {
  let tempEnvFile = '';
  
  try {
    const mcpInfo = await checkEmailMcpAvailability();
    
    if (!mcpInfo.available) {
      throw new Error('Email MCP Server not available');
    }

    // Hardcoded recipient email
    const to = 'khanshariq92213@gmail.com';

    // Handle custom credentials if provided
    if (customCredentials) {
      // Create temporary .env file with custom credentials
      const tempDir = os.tmpdir();
      tempEnvFile = path.join(tempDir, `temp-email-config-${Date.now()}.env`);
      
      // Determine SMTP settings based on provider
      let host: string, port: string;
      switch (customCredentials.provider) {
        case 'gmail':
          host = 'smtp.gmail.com';
          port = '587';
          break;
        case 'outlook':
          host = 'smtp.live.com';
          port = '587';
          break;
        case 'yahoo':
          host = 'smtp.mail.yahoo.com';
          port = '587';
          break;
        default:
          host = 'smtp.gmail.com'; // Default to Gmail
          port = '587';
      }

      const tempEnvContent = `EMAIL_HOST=${host}
EMAIL_PORT=${port}
EMAIL_USER=${customCredentials.email}
EMAIL_PASS=${customCredentials.password}
EMAIL_SECURE=false
EMAIL_TLS=true
`;
      
      await fs.writeFile(tempEnvFile, tempEnvContent);
      
      // Set environment variable to use the temporary config
      process.env.EMAIL_CONFIG_PATH = tempEnvFile;
    }

    // Create temporary files for HTML content if provided
    let tempHtmlFile = '';
    let command = '';
    let options: any = {
      stdio: 'pipe',
      timeout: 45000,
      encoding: 'utf8'
    };

    if (htmlBody) {
      // Try HTML email with ehtml command (if supported) or fall back to esend
      const tempDir = os.tmpdir();
      tempHtmlFile = path.join(tempDir, `email-${Date.now()}.html`);
      
      try {
        await fs.writeFile(tempHtmlFile, htmlBody);
        
        // Try HTML command first
        const htmlArgs = [to, subject, tempHtmlFile];
        const escapedHtmlArgs = htmlArgs.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ');
        
        switch (mcpInfo.installationType) {
          case 'npx':
            command = `npx @0xshariq/email-mcp-server ehtml ${escapedHtmlArgs}`;
            break;
          case 'global':
            command = `email-cli ehtml ${escapedHtmlArgs}`;
            break;
          case 'local':
            command = `node "${mcpInfo.path}" ehtml ${escapedHtmlArgs}`;
            options.cwd = path.dirname(mcpInfo.path!);
            break;
        }
        
        try {
          const output = execSync(command, options);
          return true;
        } catch (htmlError) {
          // If HTML command fails, fall back to regular esend
          console.log(chalk.yellow('ℹ️ HTML email not supported, sending as rich text...'));
        }
      } catch (fileError) {
        console.log(chalk.yellow('ℹ️ Could not create HTML file, sending as plain text...'));
      } finally {
        // Clean up temp file
        if (tempHtmlFile && await fs.pathExists(tempHtmlFile)) {
          await fs.remove(tempHtmlFile);
        }
      }
    }

    // Fall back to regular text email
    const args = [to, subject, body];
    const escapedArgs = args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ');
    
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
  } finally {
    // Clean up temporary files
    try {
      if (tempEnvFile && await fs.pathExists(tempEnvFile)) {
        await fs.remove(tempEnvFile);
      }
      if (process.env.EMAIL_CONFIG_PATH) {
        delete process.env.EMAIL_CONFIG_PATH;
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
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
      type: 'input',
      name: 'description',
      message: 'Detailed description of the bug:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed description (min 10 characters)'
    },
    {
      type: 'input',
      name: 'steps',
      message: 'Steps to reproduce (optional, use | to separate steps):'
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
      type: 'input',
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
      type: 'input',
      name: 'description',
      message: 'Detailed description of the feature:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed description (min 10 characters)'
    },
    {
      type: 'input',
      name: 'useCase',
      message: 'Use case - why do you need this feature? (optional):'
    },
    {
      type: 'input',
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
      type: 'input',
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
      type: 'input',
      name: 'description',
      message: 'Template description:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed description (min 10 characters)'
    },
    {
      type: 'input',
      name: 'features',
      message: 'Key features/libraries needed (separate with |):',
      default: 'Authentication | Database | Styling'
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
      type: 'input',
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
      type: 'input',
      name: 'description',
      message: 'Detailed question:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed question (min 10 characters)'
    },
    {
      type: 'input',
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
      type: 'input',
      name: 'description',
      message: 'Suggested improvement:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed suggestion (min 10 characters)'
    },
    {
      type: 'input',
      name: 'benefits',
      message: 'Benefits of this improvement (optional):'
    },
    {
      type: 'input',
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
      type: 'input',
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
      type: 'input',
      name: 'description',
      message: 'Issue description:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed description (min 10 characters)'
    },
    {
      type: 'input',
      name: 'problems',
      message: 'Current content problems (optional):'
    },
    {
      type: 'input',
      name: 'suggestions',
      message: 'Suggested improvements (optional):'
    },
    {
      type: 'input',
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
    chalk.hex('#00d2d3')('🔧 Email Configuration Guide') + '\n\n' +
    chalk.white('To send feedback emails, configure your email credentials using:') + '\n\n' +
    chalk.hex('#ffa502')('Interactive Setup (Recommended):') + '\n' +
    chalk.hex('#00d2d3')('pi email --setup') + '\n\n' +
    chalk.hex('#95afc0')('This will guide you through:') + '\n' +
    chalk.hex('#95afc0')('• Selecting your email provider (Gmail, Outlook, Yahoo, Custom)') + '\n' +
    chalk.hex('#95afc0')('• Entering your email address') + '\n' +
    chalk.hex('#95afc0')('• Setting up your app password') + '\n' +
    chalk.hex('#95afc0')('• Automatically configuring SMTP settings') + '\n\n' +
    chalk.hex('#ffa502')('Supported Providers:') + '\n' +
    chalk.hex('#95afc0')('📧 Gmail (with App Password)') + '\n' +
    chalk.hex('#95afc0')('🔷 Outlook/Hotmail') + '\n' +
    chalk.hex('#95afc0')('🟡 Yahoo Mail') + '\n' +
    chalk.hex('#95afc0')('⚙️ Custom SMTP servers') + '\n\n' +
    chalk.hex('#95afc0')('💡 Your credentials are stored securely and used only for sending feedback'),
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

  // Collect sender email option for test
  console.log(chalk.hex('#95afc0')('📧 Email sending configuration for test:'));
  const senderOption = await collectSenderEmailOption();
  
  console.log(chalk.hex('#9c88ff')('📧 Sending test email...'));
  
  const testSubject = `[Package Installer CLI] 🧪 Test Email - ${new Date().toLocaleString()}`;
  const timestamp = new Date().toLocaleString();
  const systemInfo = getSystemInfo();
  
  const testHtmlBody = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8f9fa;
      }
      .test-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .test-header {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .test-emoji {
        font-size: 48px;
        display: block;
        margin-bottom: 10px;
      }
      .test-content {
        padding: 30px;
      }
      .test-success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
        font-weight: 600;
      }
      .system-info {
        background: #e8f4f8;
        border: 1px solid #bee5eb;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 13px;
      }
      .test-footer {
        background: #495057;
        color: white;
        padding: 20px 30px;
        text-align: center;
      }
    </style>
    <body>
      <div class="test-container">
        <div class="test-header">
          <span class="test-emoji">🧪</span>
          <h1 style="margin: 0; font-size: 28px;">Email Test</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Package Installer CLI</p>
        </div>
        
        <div class="test-content">
          <div class="test-success">
            ✅ Email functionality is working correctly!
          </div>
          
          <p>This is a test email from Package Installer CLI to verify that the email system is properly configured and working.</p>
          
          <div class="system-info">
            <strong>System Information:</strong><br>
            ${systemInfo.replace(/\n/g, '<br>')}
          </div>
          
          <p>If you receive this email with proper formatting, both HTML and plain text email delivery are functioning correctly.</p>
        </div>
        
        <div class="test-footer">
          <div style="font-size: 13px; font-style: italic;">Test completed at: ${timestamp}</div>
          <p style="margin: 10px 0 0 0;">Package Installer CLI Email System 📧</p>
        </div>
      </div>
    </body>
  `;

  const testPlainBody = `This is a test email from Package Installer CLI.

✅ EMAIL TEST SUCCESSFUL ✅

If you receive this email, the email functionality is working correctly!

${systemInfo}

Test completed at: ${timestamp}

Package Installer CLI Email System`;

  let customCredentials;
  if (!senderOption.useConfigured && senderOption.customEmail) {
    customCredentials = {
      email: senderOption.customEmail,
      password: senderOption.customPassword!,
      provider: senderOption.customProvider || 'gmail'
    };
  }

  const success = await sendEmailViaMcp(testSubject, testPlainBody, testHtmlBody, customCredentials);
  
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
      { flag: '--setup', description: 'Configure your email credentials for sending feedback' },
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
      { command: 'email --setup', description: 'Configure your email credentials interactively' },
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
          'Configure: pi email --setup (interactive setup)',
          'Supports Gmail, Outlook, Yahoo, and custom SMTP',
          'Your credentials are stored securely for sending feedback'
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
      await configureEmailMcp();
      return;
    }

    // Handle status flag
    if (options.status) {
      await showEmailStatus();
      return;
    }

    // Handle test flag
    if (options.test) {
      const isConfigured = await ensureEmailConfigured();
      if (isConfigured) {
        await testEmailConnection();
      }
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
    
    // Ensure email is configured before proceeding
    const isConfigured = await ensureEmailConfigured();
    if (!isConfigured) {
      console.log(boxen(
        chalk.yellow('⚠️ Email Configuration Required') + '\n\n' +
        chalk.white('To send feedback emails, you need to configure your email credentials.') + '\n\n' +
        chalk.cyan('📦 Quick Setup Steps:') + '\n' +
        chalk.hex('#95afc0')('1. Install: npm install -g @0xshariq/email-mcp-server') + '\n' +
        chalk.hex('#95afc0')('2. Configure: pi email --setup') + '\n' +
        chalk.hex('#95afc0')('3. Send feedback: pi email <category>') + '\n\n' +
        chalk.cyan('📞 Alternative Contact Methods:') + '\n' +
        chalk.hex('#95afc0')('📧 Direct Email: khanshariq92213@gmail.com') + '\n' +
        chalk.hex('#95afc0')('🐙 GitHub Issues: Create an issue on the repository'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'yellow'
        }
      ));
      
      console.log('\n' + chalk.hex('#00d2d3')('💻 Quick Setup Command:'));
      console.log(chalk.gray('pi email --setup'));
      
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

    // Collect sender email option
    console.log(chalk.hex('#95afc0')('\n📧 Email sending configuration:'));
    const senderOption = await collectSenderEmailOption();

    // Merge all data
    const allData = { ...categoryData, ...contactData };

    // Generate email content (both HTML and plain text)
    const { subject, htmlBody, plainBody } = generateHtmlEmailTemplate(selectedCategory!, allData);

    // Show preview
    console.log(boxen(
      chalk.hex('#00d2d3')('📧 Email Preview') + '\n\n' +
      chalk.gray('To: khanshariq92213@gmail.com') + '\n' +
      chalk.gray(`Subject: ${subject}`) + '\n' +
      chalk.gray('Format: HTML + Plain Text Fallback') + '\n\n' +
      chalk.white(plainBody.substring(0, 300) + (plainBody.length > 300 ? '...' : '')),
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
        message: 'Send this beautifully formatted email?',
        default: true
      }
    ]);

    if (!confirmSend) {
      console.log(chalk.yellow('📧 Email cancelled. Your feedback is still valuable!'));
      return;
    }

    // Send email (try HTML first, fall back to plain text)
    console.log(chalk.hex('#9c88ff')('📧 Sending formatted email...'));
    
    let customCredentials;
    if (!senderOption.useConfigured && senderOption.customEmail) {
      customCredentials = {
        email: senderOption.customEmail,
        password: senderOption.customPassword!,
        provider: senderOption.customProvider || 'gmail'
      };
    }
    
    const success = await sendEmailViaMcp(subject, plainBody, htmlBody, customCredentials);

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