import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface NetlifyConfig {
  siteName: string;
  buildCommand?: string;
  buildDirectory: string;
  framework: string;
  domain?: string;
  environment: 'production' | 'preview' | 'branch-deploy';
}

export async function deployToNetlify(): Promise<void> {
  console.log(chalk.blue('🟢 Starting Netlify deployment...'));

  // Check if Netlify CLI is installed
  if (!isNetlifyInstalled()) {
    console.log(chalk.red('❌ Netlify CLI is not installed.'));
    console.log(chalk.yellow('📥 Please install it from: https://docs.netlify.com/cli/get-started/'));
    console.log(chalk.gray('Installation command:'));
    console.log(chalk.gray('  npm install -g netlify-cli'));
    return;
  }

  // Check authentication
  if (!isNetlifyAuthenticated()) {
    console.log(chalk.yellow('🔐 You need to authenticate with Netlify first.'));
    console.log(chalk.blue('Running: netlify login'));
    try {
      execSync('netlify login', { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('❌ Authentication failed.'));
      return;
    }
  }

  const config = await getNetlifyConfig();
  
  try {
    await deployProject(config);
    console.log(chalk.green('✅ Successfully deployed to Netlify!'));
  } catch (error) {
    console.log(chalk.red('❌ Deployment failed:'), error);
  }
}

function isNetlifyInstalled(): boolean {
  try {
    execSync('netlify --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isNetlifyAuthenticated(): boolean {
  try {
    const result = execSync('netlify status', { encoding: 'utf8', stdio: 'pipe' });
    return !result.includes('Not logged in');
  } catch {
    return false;
  }
}

async function getNetlifyConfig(): Promise<NetlifyConfig> {
  console.log(chalk.blue('🔧 Configuring Netlify deployment...'));

  const framework = detectFramework();
  const defaultConfig = getDefaultConfig(framework);

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'siteName',
      message: 'Enter site name:',
      default: path.basename(process.cwd()),
      validate: (input: string) => input.trim().length > 0 || 'Site name is required'
    },
    {
      type: 'list',
      name: 'environment',
      message: 'Select deployment type:',
      choices: [
        { name: 'Production - Deploy to main site', value: 'production' },
        { name: 'Preview - Deploy preview from branch', value: 'preview' },
        { name: 'Branch Deploy - Deploy specific branch', value: 'branch-deploy' }
      ]
    },
    {
      type: 'input',
      name: 'buildCommand',
      message: 'Enter build command (optional):',
      default: defaultConfig.buildCommand,
      when: () => defaultConfig.buildCommand !== undefined
    },
    {
      type: 'input',
      name: 'buildDirectory',
      message: 'Enter build/publish directory:',
      default: defaultConfig.buildDirectory,
      validate: (input: string) => input.trim().length > 0 || 'Build directory is required'
    },
    {
      type: 'input',
      name: 'domain',
      message: 'Enter custom domain (optional):',
      validate: (input: string) => {
        if (input && !input.includes('.')) {
          return 'Please enter a valid domain';
        }
        return true;
      }
    }
  ]);

  return { ...answers, framework };
}

function detectFramework(): string {
  if (!fs.existsSync('package.json')) return 'generic';
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps.next) return 'nextjs';
  if (deps.react && deps['react-scripts']) return 'create-react-app';
  if (deps.react && deps.vite) return 'vite-react';
  if (deps.vue && deps.vite) return 'vite-vue';
  if (deps.vue && deps['@vue/cli-service']) return 'vue-cli';
  if (deps.svelte) return 'svelte';
  if (deps.gatsby) return 'gatsby';
  if (deps.nuxt) return 'nuxtjs';
  if (deps.gridsome) return 'gridsome';
  if (deps.eleventy) return '11ty';
  if (deps.hugo) return 'hugo';
  if (deps.jekyll) return 'jekyll';
  
  return 'static';
}

function getDefaultConfig(framework: string): { buildCommand?: string; buildDirectory: string } {
  switch (framework) {
    case 'nextjs':
      return { buildCommand: 'npm run build && npm run export', buildDirectory: 'out' };
    case 'create-react-app':
      return { buildCommand: 'npm run build', buildDirectory: 'build' };
    case 'vite-react':
    case 'vite-vue':
      return { buildCommand: 'npm run build', buildDirectory: 'dist' };
    case 'vue-cli':
      return { buildCommand: 'npm run build', buildDirectory: 'dist' };
    case 'gatsby':
      return { buildCommand: 'npm run build', buildDirectory: 'public' };
    case 'nuxtjs':
      return { buildCommand: 'npm run generate', buildDirectory: 'dist' };
    case 'svelte':
      return { buildCommand: 'npm run build', buildDirectory: 'public' };
    case 'gridsome':
      return { buildCommand: 'npm run build', buildDirectory: 'dist' };
    case '11ty':
      return { buildCommand: 'npm run build', buildDirectory: '_site' };
    case 'hugo':
      return { buildCommand: 'hugo', buildDirectory: 'public' };
    case 'jekyll':
      return { buildCommand: 'bundle exec jekyll build', buildDirectory: '_site' };
    default:
      return { buildDirectory: 'dist' };
  }
}

async function deployProject(config: NetlifyConfig): Promise<void> {
  console.log(chalk.blue(`📦 Deploying ${config.siteName} to Netlify...`));

  // Create netlify.toml if it doesn't exist
  if (!fs.existsSync('netlify.toml')) {
    const netlifyConfig = generateNetlifyConfig(config);
    fs.writeFileSync('netlify.toml', netlifyConfig);
    console.log(chalk.green('📄 Created netlify.toml'));
  }

  // Create _redirects file for SPA routing
  await createRedirectsFile(config);

  // Create _headers file for security headers
  await createHeadersFile(config);

  // Build the project if build command is specified
  if (config.buildCommand) {
    console.log(chalk.blue('🔨 Building project...'));
    execSync(config.buildCommand, { stdio: 'inherit' });
  }

  // Initialize Netlify site if not exists
  if (!fs.existsSync('.netlify')) {
    console.log(chalk.blue('🔧 Initializing Netlify site...'));
    execSync(`netlify init --manual`, { stdio: 'inherit' });
  }

  // Deploy based on environment
  let deployCommand = '';
  if (config.environment === 'production') {
    deployCommand = `netlify deploy --prod --dir=${config.buildDirectory}`;
  } else {
    deployCommand = `netlify deploy --dir=${config.buildDirectory}`;
  }

  console.log(chalk.blue('🚀 Deploying to Netlify...'));
  execSync(deployCommand, { stdio: 'inherit' });

  // Set custom domain if specified
  if (config.domain) {
    try {
      execSync(`netlify sites:update --domain=${config.domain}`, { stdio: 'inherit' });
      console.log(chalk.green(`🌐 Custom domain set: ${config.domain}`));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not set custom domain. You may need to configure it manually.'));
    }
  }

  // Get site URL
  try {
    const result = execSync('netlify status', { encoding: 'utf8' });
    const urlMatch = result.match(/Website URL:\s+(https:\/\/[^\s]+)/);
    if (urlMatch) {
      console.log(chalk.green(`🌐 Site URL: ${urlMatch[1]}`));
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not retrieve site URL'));
  }
}

function generateNetlifyConfig(config: NetlifyConfig): string {
  let netlifyConfig = `[build]
  publish = "${config.buildDirectory}"`;

  if (config.buildCommand) {
    netlifyConfig += `
  command = "${config.buildCommand}"`;
  }

  // Add framework-specific configurations
  if (config.framework === 'nextjs') {
    netlifyConfig += `

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--prefix=/opt/buildhome/repo && npm run build && npm run export"

[[plugins]]
  package = "@netlify/plugin-nextjs"`;
  } else if (config.framework === 'gatsby') {
    netlifyConfig += `

[build.environment]
  NODE_VERSION = "18"
  GATSBY_TELEMETRY_DISABLED = "1"

[[plugins]]
  package = "netlify-plugin-gatsby-cache"`;
  } else if (config.framework === 'nuxtjs') {
    netlifyConfig += `

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@nuxtjs/netlify-files"`;
  }

  // Add redirects for SPA
  if (['create-react-app', 'vite-react', 'vue-cli', 'vite-vue'].includes(config.framework)) {
    netlifyConfig += `

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;
  }

  // Add security headers
  netlifyConfig += `

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "same-origin"`;

  return netlifyConfig;
}

async function createRedirectsFile(config: NetlifyConfig): Promise<void> {
  // Create _redirects file for SPA routing
  if (['create-react-app', 'vite-react', 'vue-cli', 'vite-vue'].includes(config.framework)) {
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true });
    }
    
    const redirectsContent = `/*    /index.html   200`;
    fs.writeFileSync('public/_redirects', redirectsContent);
    console.log(chalk.green('📄 Created _redirects file for SPA routing'));
  }
}

async function createHeadersFile(config: NetlifyConfig): Promise<void> {
  // Create _headers file for security
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }

  const headersContent = `/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: same-origin

/static/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable`;

  fs.writeFileSync('public/_headers', headersContent);
  console.log(chalk.green('📄 Created _headers file for security and caching'));
}
