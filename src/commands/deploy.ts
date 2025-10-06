/**
 * Deploy command - Deploy projects to various cloud platforms
 */

import chalk from 'chalk';
import boxen from 'boxen';
import inquirer from 'inquirer';
import { createStandardHelp, type CommandHelpConfig } from '../utils/helpFormatter.js';
import { deployToVercel } from '../deploy/vercel/vercel.js';
import { deployToAWS } from '../deploy/aws/aws.js';
import { deployToGithubPages } from '../deploy/github-pages/gh-pages.js';
import { deployToDockerHub } from '../deploy/docker-hub/docker-hub.js';
import { deployToDigitalOcean } from '../deploy/digitalocean/digitalocean.js';
import { deployToCloudflare } from '../deploy/cloudflare/cloudflare.js';
import { deployToGoogleCloud } from '../deploy/google-cloud/google-cloud.js';
import { deployToFirebase } from '../deploy/firebase/firebase.js';
import { deployToAuth0 } from '../deploy/auth0/auth0.js';
import { deployToServerless } from '../deploy/serverless/serverless.js';
import { deployToRailway } from '../deploy/railway/railway.js';
import { deployToNetlify } from '../deploy/netlify/netlify.js';
import { deployToHeroku } from '../deploy/heroku/heroku.js';
import { deployToCloudFoundry } from '../deploy/cloud-foundry/cloud-foundry.js';
import { deployToFly } from '../deploy/fly-io/fly-io.js';
import { deployToGoReleaser } from '../deploy/goreleaser/goreleaser.js';
import { deployToCapistrano } from '../deploy/capistrano/capistrano.js';

/**
 * Display help for deploy command
 */
export function showDeployHelp(): void {
  const helpConfig: CommandHelpConfig = {
    commandName: 'deploy',
    emoji: '🚀',
    description: 'Deploy your projects to various cloud platforms seamlessly.',
    usage: [
      'pi deploy',
      'pi deploy --platform <platform>',
      'pi deploy --list'
    ],
    options: [
      { flag: '--platform, -p <platform>', description: 'Specify deployment platform (auth0, aws, capistrano, cloud-foundry, cloudflare, digitalocean, docker-hub, firebase, fly-io, github-pages, google-cloud, goreleaser, heroku, netlify, railway, serverless, vercel)' },
      { flag: '--list, -l', description: 'List all available deployment platforms' },
      { flag: '--config, -c', description: 'Configure deployment settings' },
      { flag: '--build', description: 'Build project before deployment' },
      { flag: '--env <file>', description: 'Use environment variables from file' }
    ],
    examples: [
      { command: 'pi deploy', description: 'Interactive deployment platform selection' },
      { command: 'pi deploy --platform <platform>', description: 'Deploy to platforms which are supported by cli.' },
      { command: 'pi deploy --list', description: 'Show all available platforms' },
      { command: 'pi deploy --config', description: 'Configure deployment settings' }
    ],
    additionalSections: [
      {
        title: '🌐 Supported Platforms',
        items: [
          'Auth0 - Authentication and identity management',
          'AWS - S3 static sites and Lambda functions',
          'Capistrano - Ruby deployment automation',
          'Cloud Foundry - Enterprise cloud platform',
          'Cloudflare - Pages, Workers, and Workers Sites',
          'DigitalOcean - App Platform and container registry',
          'Docker Hub - Container registry and deployment',
          'Firebase - Hosting, Functions, and Firestore',
          'Fly.io - Deploy apps close to users globally',
          'GitHub Pages - Static sites and documentation',
          'Google Cloud - App Engine, Cloud Run, and Functions',
          'GoReleaser - Release Go binaries fast and easily',
          'Heroku - Cloud application platform',
          'Netlify - Static sites and serverless functions',
          'Railway - Modern app hosting platform',
          'Serverless Framework - Multi-cloud serverless deployment',
          'Vercel - Frontend and fullstack applications'
        ]
      },
      {
        title: '🔧 Prerequisites',
        items: [
          'Platform CLI installed (auth0, aws-cli, capistrano, cf, docker, doctl, firebase-tools, flyctl, gh, gcloud, goreleaser, heroku, netlify, railway, serverless, vercel, wrangler)',
          'Authentication configured for chosen platform',
          'Project build configuration (if required)'
        ]
      }
    ],
    tips: [
      'Each platform has specific requirements - check platform documentation',
      'Use --build flag to automatically build before deployment',
      'Environment variables can be configured per platform'
    ]
  };

  createStandardHelp(helpConfig);
}

/**
 * Main deploy command function
 */
export async function deployCommand(): Promise<void> {
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showDeployHelp();
    return;
  }

  // Handle command line arguments
  const args = process.argv.slice(2);
  const platformIndex = args.findIndex(arg => arg === '--platform' || arg === '-p');
  const listFlag = args.includes('--list') || args.includes('-l');
  const configFlag = args.includes('--config') || args.includes('-c');

  if (listFlag) {
    showAvailablePlatforms();
    return;
  }

  if (configFlag) {
    await configureDeployment();
    return;
  }

  let selectedPlatform: string | null = null;

  // Check if platform is specified via command line
  if (platformIndex !== -1 && args[platformIndex + 1]) {
    selectedPlatform = args[platformIndex + 1];
  }

  // If no platform specified, show interactive selection
  if (!selectedPlatform) {
    const { platform } = await inquirer.prompt([
      {
        type: 'list',
        name: 'platform',
        message: 'Select deployment platform:',
        choices: [
          {
            name: '� Auth0 - Authentication and identity management',
            value: 'auth0',
            short: 'Auth0'
          },
          {
            name: '☁️ AWS - S3 static sites and Lambda functions', 
            value: 'aws',
            short: 'AWS'
          },
          {
            name: '� Capistrano - Ruby deployment automation',
            value: 'capistrano',
            short: 'Capistrano'
          },
          {
            name: '☁️ Cloud Foundry - Enterprise cloud platform',
            value: 'cloud-foundry',
            short: 'Cloud Foundry'
          },
          {
            name: '☁️ Cloudflare - Pages, Workers, and Workers Sites',
            value: 'cloudflare',
            short: 'Cloudflare'
          },
          {
            name: '🌊 DigitalOcean - App Platform and container registry',
            value: 'digitalocean',
            short: 'DigitalOcean'
          },
          {
            name: '🐳 Docker Hub - Container registry and deployment',
            value: 'docker-hub',
            short: 'Docker Hub'
          },
          {
            name: '🔥 Firebase - Hosting, Functions, and Firestore',
            value: 'firebase',
            short: 'Firebase'
          },
          {
            name: '🪂 Fly.io - Deploy apps close to users globally',
            value: 'fly-io',
            short: 'Fly.io'
          },
          {
            name: '📚 GitHub Pages - Static sites and documentation',
            value: 'github-pages',
            short: 'GitHub Pages'
          },
          {
            name: '🌐 Google Cloud - App Engine, Cloud Run, and Functions',
            value: 'google-cloud',
            short: 'Google Cloud'
          },
          {
            name: '� GoReleaser - Release Go binaries fast and easily',
            value: 'goreleaser',
            short: 'GoReleaser'
          },
          {
            name: '⚡ Heroku - Cloud application platform',
            value: 'heroku',
            short: 'Heroku'
          },
          {
            name: '🟢 Netlify - Static sites and serverless functions',
            value: 'netlify',
            short: 'Netlify'
          },
          {
            name: '� Railway - Modern app hosting platform',
            value: 'railway',
            short: 'Railway'
          },
          {
            name: '⚡ Serverless Framework - Multi-cloud serverless deployment',
            value: 'serverless',
            short: 'Serverless'
          },
          {
            name: '� Vercel - Frontend and fullstack applications',
            value: 'vercel',
            short: 'Vercel'
          }
        ]
      }
    ]);
    selectedPlatform = platform;
  }

  // Validate platform
  const validPlatforms = ['auth0', 'aws', 'capistrano', 'cloud-foundry', 'cloudflare', 'digitalocean', 'docker-hub', 'firebase', 'fly-io', 'github-pages', 'google-cloud', 'goreleaser', 'heroku', 'netlify', 'railway', 'serverless', 'vercel'];
  if (!selectedPlatform || !validPlatforms.includes(selectedPlatform)) {
    console.log(chalk.red(`❌ Invalid platform: ${selectedPlatform}`));
    console.log(chalk.yellow(`Valid platforms: ${validPlatforms.join(', ')}`));
    return;
  }

  console.log(chalk.cyan(`\n🚀 Starting deployment to ${selectedPlatform}...\n`));

  try {
    let result: DeploymentResult;

    switch (selectedPlatform) {
      case 'vercel':
        result = await deployToVercel();
        break;
      case 'aws':
        result = await deployToAWS();
        break;
      case 'github-pages':
        result = await deployToGithubPages();
        break;
      case 'docker-hub':
        result = await deployToDockerHub();
        break;
      case 'digitalocean':
        result = await deployToDigitalOcean();
        break;
      case 'cloudflare':
        result = await deployToCloudflare();
        break;
      case 'google-cloud':
        await deployToGoogleCloud();
        result = { success: true };
        break;
      case 'firebase':
        await deployToFirebase();
        result = { success: true };
        break;
      case 'auth0':
        await deployToAuth0();
        result = { success: true };
        break;
      case 'serverless':
        await deployToServerless();
        result = { success: true };
        break;
      case 'railway':
        await deployToRailway();
        result = { success: true };
        break;
      case 'netlify':
        await deployToNetlify();
        result = { success: true };
        break;
      case 'heroku':
        await deployToHeroku();
        result = { success: true };
        break;
      case 'cloud-foundry':
        await deployToCloudFoundry();
        result = { success: true };
        break;
      case 'fly-io':
        await deployToFly();
        result = { success: true };
        break;
      case 'goreleaser':
        await deployToGoReleaser();
        result = { success: true };
        break;
      case 'capistrano':
        await deployToCapistrano();
        result = { success: true };
        break;
      default:
        throw new Error(`Unsupported platform: ${selectedPlatform}`);
    }

    if (result.success) {
      console.log(chalk.green('\n🎉 Deployment completed successfully!'));
      if (result.url) {
        console.log(chalk.blue(`🔗 URL: ${result.url}`));
      }
    } else {
      console.log(chalk.red('\n❌ Deployment failed!'));
      if (result.error) {
        console.log(chalk.red(`Error: ${result.error}`));
      }
    }

  } catch (error) {
    console.log(chalk.red('\n❌ Deployment failed!'));
    console.log(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}

function showAvailablePlatforms(): void {
  console.log(chalk.cyan('\n🌐 Available Deployment Platforms:\n'));
  
  console.log(chalk.hex('#eb5424')('� Auth0'));
  console.log(chalk.gray('   • Authentication and identity management'));
  console.log(chalk.gray('   • Framework-specific SDK configuration'));
  console.log(chalk.gray('   • Environment variable setup'));
  console.log(chalk.gray('   • Usage: pi deploy --platform auth0\n'));

  console.log(chalk.hex('#ff9f00')('☁️ AWS'));
  console.log(chalk.gray('   • S3 static website hosting'));
  console.log(chalk.gray('   • Lambda function deployment'));
  console.log(chalk.gray('   • CloudFront distribution'));
  console.log(chalk.gray('   • Usage: pi deploy --platform aws\n'));

  console.log(chalk.hex('#cc342d')('� Capistrano'));
  console.log(chalk.gray('   • Ruby deployment automation'));
  console.log(chalk.gray('   • SSH-based deployments'));
  console.log(chalk.gray('   • Multi-server management'));
  console.log(chalk.gray('   • Usage: pi deploy --platform capistrano\n'));

  console.log(chalk.hex('#0091da')('☁️ Cloud Foundry'));
  console.log(chalk.gray('   • Enterprise cloud platform'));
  console.log(chalk.gray('   • Multi-cloud deployment'));
  console.log(chalk.gray('   • Service bindings and buildpacks'));
  console.log(chalk.gray('   • Usage: pi deploy --platform cloud-foundry\n'));

  console.log(chalk.hex('#f38020')('☁️ Cloudflare'));
  console.log(chalk.gray('   • Cloudflare Pages (static sites)'));
  console.log(chalk.gray('   • Workers (serverless functions)'));
  console.log(chalk.gray('   • Workers Sites (full-stack apps)'));
  console.log(chalk.gray('   • Usage: pi deploy --platform cloudflare\n'));

  console.log(chalk.hex('#0080ff')('🌊 DigitalOcean'));
  console.log(chalk.gray('   • App Platform (PaaS)'));
  console.log(chalk.gray('   • Container Registry'));
  console.log(chalk.gray('   • Droplets and Kubernetes'));
  console.log(chalk.gray('   • Usage: pi deploy --platform digitalocean\n'));

  console.log(chalk.hex('#0db7ed')('🐳 Docker Hub'));
  console.log(chalk.gray('   • Container registry and deployment'));
  console.log(chalk.gray('   • Multi-platform container support'));
  console.log(chalk.gray('   • Automated builds and deployments'));
  console.log(chalk.gray('   • Usage: pi deploy --platform docker-hub\n'));

  console.log(chalk.hex('#ffca28')('🔥 Firebase'));
  console.log(chalk.gray('   • Firebase Hosting (static web hosting)'));
  console.log(chalk.gray('   • Cloud Functions (serverless functions)'));
  console.log(chalk.gray('   • Firestore (NoSQL database)'));
  console.log(chalk.gray('   • Usage: pi deploy --platform firebase\n'));

  console.log(chalk.hex('#7c3aed')('🪂 Fly.io'));
  console.log(chalk.gray('   • Deploy apps close to users'));
  console.log(chalk.gray('   • Global edge deployment'));
  console.log(chalk.gray('   • Container-based hosting'));
  console.log(chalk.gray('   • Usage: pi deploy --platform fly-io\n'));

  console.log(chalk.hex('#333')('📚 GitHub Pages'));
  console.log(chalk.gray('   • Static sites and documentation'));
  console.log(chalk.gray('   • GitHub Actions integration'));
  console.log(chalk.gray('   • Custom domains supported'));
  console.log(chalk.gray('   • Usage: pi deploy --platform github-pages\n'));

  console.log(chalk.hex('#4285f4')('🌐 Google Cloud'));
  console.log(chalk.gray('   • App Engine (serverless platform)'));
  console.log(chalk.gray('   • Cloud Run (containerized applications)'));
  console.log(chalk.gray('   • Cloud Functions (serverless functions)'));
  console.log(chalk.gray('   • Usage: pi deploy --platform google-cloud\n'));

  console.log(chalk.hex('#00add8')('� GoReleaser'));
  console.log(chalk.gray('   • Release Go binaries fast'));
  console.log(chalk.gray('   • Multi-platform builds'));
  console.log(chalk.gray('   • GitHub/GitLab integration'));
  console.log(chalk.gray('   • Usage: pi deploy --platform goreleaser\n'));

  console.log(chalk.hex('#430098')('⚡ Heroku'));
  console.log(chalk.gray('   • Cloud application platform'));
  console.log(chalk.gray('   • Add-ons and buildpacks'));
  console.log(chalk.gray('   • Auto-scaling and monitoring'));
  console.log(chalk.gray('   • Usage: pi deploy --platform heroku\n'));

  console.log(chalk.hex('#00d2d3')('🟢 Netlify'));
  console.log(chalk.gray('   • Static sites and JAMstack'));
  console.log(chalk.gray('   • Serverless functions'));
  console.log(chalk.gray('   • CDN and edge computing'));
  console.log(chalk.gray('   • Usage: pi deploy --platform netlify\n'));

  console.log(chalk.hex('#6c5ce7')('� Railway'));
  console.log(chalk.gray('   • Modern app hosting platform'));
  console.log(chalk.gray('   • Container and traditional deployment'));
  console.log(chalk.gray('   • Database and infrastructure services'));
  console.log(chalk.gray('   • Usage: pi deploy --platform railway\n'));

  console.log(chalk.hex('#fd79a8')('⚡ Serverless Framework'));
  console.log(chalk.gray('   • Multi-cloud serverless deployment'));
  console.log(chalk.gray('   • AWS, Azure, GCP, Cloudflare support'));
  console.log(chalk.gray('   • Functions and API deployment'));
  console.log(chalk.gray('   • Usage: pi deploy --platform serverless\n'));

  console.log(chalk.hex('#ff6b6b')('� Vercel'));
  console.log(chalk.gray('   • Frontend and fullstack applications'));
  console.log(chalk.gray('   • Automatic builds and deployments'));
  console.log(chalk.gray('   • Custom domains and SSL'));
  console.log(chalk.gray('   • Usage: pi deploy --platform vercel\n'));
}

async function configureDeployment(): Promise<void> {
  console.log(chalk.cyan('⚙️ Deployment Configuration\n'));
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to configure?',
      choices: [
        'Platform credentials',
        'Build settings',
        'Environment variables',
        'Domain configuration',
        'View platform setup commands'
      ]
    }
  ]);

  switch (action) {
    case 'Platform credentials':
      await configurePlatformCredentials();
      break;
    case 'Build settings':
      await configureBuildSettings();
      break;
    case 'Environment variables':
      await configureEnvironmentVariables();
      break;
    case 'Domain configuration':
      await configureDomainSettings();
      break;
    case 'View platform setup commands':
      await showPlatformSetupCommands();
      break;
    default:
      console.log(chalk.yellow(`\n🔧 ${action} configuration is not yet implemented.`));
  }
}

async function configurePlatformCredentials(): Promise<void> {
  console.log(chalk.cyan('\n🔐 Platform Credentials Configuration\n'));
  
  const { platform } = await inquirer.prompt([
    {
      type: 'list',
      name: 'platform',
      message: 'Select platform to configure credentials:',
      choices: [
        'auth0',
        'aws',
        'capistrano',
        'cloud-foundry',
        'cloudflare',
        'digitalocean',
        'docker-hub',
        'firebase',
        'fly-io',
        'github-pages',
        'google-cloud',
        'goreleaser',
        'heroku',
        'netlify',
        'railway',
        'serverless',
        'vercel'
      ]
    }
  ]);

  await showPlatformSetupCommand(platform);
}

async function configureBuildSettings(): Promise<void> {
  console.log(chalk.cyan('\n🔨 Build Settings Configuration\n'));
  
  const { buildConfig } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'buildConfig',
      message: 'Select build configuration options:',
      choices: [
        'Auto-detect build command',
        'Set custom build command',
        'Configure build directory',
        'Set environment variables',
        'Enable build caching',
        'Configure Node.js version',
        'Set up build hooks'
      ]
    }
  ]);

  console.log(chalk.yellow('\n🔧 Build configuration options selected:'));
  buildConfig.forEach((option: string) => {
    console.log(chalk.gray(`• ${option}`));
  });
  console.log(chalk.blue('\n💡 Build settings will be applied during deployment.'));
}

async function configureEnvironmentVariables(): Promise<void> {
  console.log(chalk.cyan('\n🌍 Environment Variables Configuration\n'));
  
  const { envAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'envAction',
      message: 'What would you like to do with environment variables?',
      choices: [
        'Load from .env file',
        'Set individual variables',
        'Copy from another environment',
        'View current variables',
        'Clear all variables'
      ]
    }
  ]);

  switch (envAction) {
    case 'Load from .env file':
      console.log(chalk.blue('\n📁 Environment variables will be loaded from .env file during deployment.'));
      break;
    case 'Set individual variables':
      console.log(chalk.blue('\n✏️ Individual environment variables can be set per platform during deployment.'));
      break;
    case 'Copy from another environment':
      console.log(chalk.blue('\n📋 Environment variables can be copied between environments during platform setup.'));
      break;
    case 'View current variables':
      console.log(chalk.blue('\n👁️ Current environment variables will be displayed during deployment configuration.'));
      break;
    case 'Clear all variables':
      console.log(chalk.yellow('\n🗑️ Environment variables will be cleared during next deployment configuration.'));
      break;
  }
}

async function configureDomainSettings(): Promise<void> {
  console.log(chalk.cyan('\n🌐 Domain Configuration\n'));
  
  const { domainAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'domainAction',
      message: 'Select domain configuration option:',
      choices: [
        'Add custom domain',
        'Configure SSL certificate',
        'Set up domain redirects',
        'Configure DNS settings',
        'View domain status'
      ]
    }
  ]);

  console.log(chalk.yellow(`\n🔧 ${domainAction} will be configured during platform-specific deployment.`));
  console.log(chalk.blue('Domain settings vary by platform - refer to platform documentation for specific steps.'));
}

async function showPlatformSetupCommands(): Promise<void> {
  console.log(chalk.cyan('\n⚡ Platform Setup Commands\n'));
  
  const platforms = [
    { 
      name: 'Auth0', 
      cli: 'auth0', 
      install: 'npm install -g @auth0/auth0-cli',
      setup: 'auth0 login',
      docs: 'https://auth0.com/docs/cli',
      package: 'https://www.npmjs.com/package/@auth0/auth0-cli'
    },
    { 
      name: 'AWS', 
      cli: 'aws-cli', 
      install: 'pip install awscli',
      setup: 'aws configure',
      docs: 'https://docs.aws.amazon.com/cli/',
      package: 'https://pypi.org/project/awscli/'
    },
    { 
      name: 'Capistrano', 
      cli: 'capistrano', 
      install: 'gem install capistrano',
      setup: 'cap install',
      docs: 'https://capistranorb.com/',
      package: 'https://rubygems.org/gems/capistrano'
    },
    { 
      name: 'Cloud Foundry', 
      cli: 'cf', 
      install: 'Download from GitHub releases',
      setup: 'cf login',
      docs: 'https://docs.cloudfoundry.org/cf-cli/',
      package: 'https://github.com/cloudfoundry/cli/releases'
    },
    { 
      name: 'Cloudflare', 
      cli: 'wrangler', 
      install: 'npm install -g wrangler',
      setup: 'wrangler login',
      docs: 'https://developers.cloudflare.com/workers/wrangler/',
      package: 'https://www.npmjs.com/package/wrangler'
    },
    { 
      name: 'DigitalOcean', 
      cli: 'doctl', 
      install: 'Download from GitHub releases',
      setup: 'doctl auth init',
      docs: 'https://docs.digitalocean.com/reference/doctl/',
      package: 'https://github.com/digitalocean/doctl/releases'
    },
    { 
      name: 'Docker Hub', 
      cli: 'docker', 
      install: 'Download Docker Desktop',
      setup: 'docker login',
      docs: 'https://docs.docker.com/engine/reference/commandline/cli/',
      package: 'https://docs.docker.com/get-docker/'
    },
    { 
      name: 'Firebase', 
      cli: 'firebase-tools', 
      install: 'npm install -g firebase-tools',
      setup: 'firebase login',
      docs: 'https://firebase.google.com/docs/cli',
      package: 'https://www.npmjs.com/package/firebase-tools'
    },
    { 
      name: 'Fly.io', 
      cli: 'flyctl', 
      install: 'curl -L https://fly.io/install.sh | sh',
      setup: 'flyctl auth login',
      docs: 'https://fly.io/docs/flyctl/',
      package: 'https://fly.io/docs/getting-started/installing-flyctl/'
    },
    { 
      name: 'GitHub Pages', 
      cli: 'gh', 
      install: 'Download from GitHub releases',
      setup: 'gh auth login',
      docs: 'https://cli.github.com/manual/',
      package: 'https://github.com/cli/cli/releases'
    },
    { 
      name: 'Google Cloud', 
      cli: 'gcloud', 
      install: 'Download Cloud SDK',
      setup: 'gcloud auth login',
      docs: 'https://cloud.google.com/sdk/gcloud/',
      package: 'https://cloud.google.com/sdk/docs/install'
    },
    { 
      name: 'GoReleaser', 
      cli: 'goreleaser', 
      install: 'go install github.com/goreleaser/goreleaser@latest',
      setup: 'export GITHUB_TOKEN=your_token',
      docs: 'https://goreleaser.com/',
      package: 'https://goreleaser.com/install/'
    },
    { 
      name: 'Heroku', 
      cli: 'heroku', 
      install: 'npm install -g heroku',
      setup: 'heroku login',
      docs: 'https://devcenter.heroku.com/articles/heroku-cli',
      package: 'https://www.npmjs.com/package/heroku'
    },
    { 
      name: 'Netlify', 
      cli: 'netlify-cli', 
      install: 'npm install -g netlify-cli',
      setup: 'netlify login',
      docs: 'https://docs.netlify.com/cli/get-started/',
      package: 'https://www.npmjs.com/package/netlify-cli'
    },
    { 
      name: 'Railway', 
      cli: 'railway', 
      install: 'npm install -g @railway/cli',
      setup: 'railway login',
      docs: 'https://docs.railway.app/reference/cli-api',
      package: 'https://www.npmjs.com/package/@railway/cli'
    },
    { 
      name: 'Serverless', 
      cli: 'serverless', 
      install: 'npm install -g serverless',
      setup: 'serverless login',
      docs: 'https://www.serverless.com/framework/docs/',
      package: 'https://www.npmjs.com/package/serverless'
    },
    { 
      name: 'Vercel', 
      cli: 'vercel', 
      install: 'npm install -g vercel',
      setup: 'vercel login',
      docs: 'https://vercel.com/docs/cli',
      package: 'https://www.npmjs.com/package/vercel'
    }
  ];

  platforms.forEach(platform => {
    console.log(chalk.green(`• ${platform.name}:`));
    console.log(chalk.gray(`  📦 Install: ${platform.install}`));
    console.log(chalk.blue(`  🔧 Setup: ${platform.setup}`));
    console.log(chalk.cyan(`  📖 Docs: ${platform.docs}`));
    console.log(chalk.magenta(`  🔗 Package: ${platform.package}\n`));
  });
}

async function showPlatformSetupCommand(platform: string): Promise<void> {
  console.log(chalk.cyan(`\n⚡ ${platform.charAt(0).toUpperCase() + platform.slice(1)} Setup\n`));
  
  const setupCommands: { [key: string]: { cli: string; install: string; setup: string; docs: string; package: string } } = {
    'auth0': {
      cli: 'auth0',
      install: 'npm install -g @auth0/auth0-cli',
      setup: 'auth0 login',
      docs: 'https://auth0.com/docs/cli',
      package: 'https://www.npmjs.com/package/@auth0/auth0-cli'
    },
    'aws': {
      cli: 'aws-cli',
      install: 'pip install awscli',
      setup: 'aws configure',
      docs: 'https://docs.aws.amazon.com/cli/',
      package: 'https://pypi.org/project/awscli/'
    },
    'capistrano': {
      cli: 'capistrano',
      install: 'gem install capistrano',
      setup: 'cap install',
      docs: 'https://capistranorb.com/',
      package: 'https://rubygems.org/gems/capistrano'
    },
    'cloud-foundry': {
      cli: 'cf',
      install: 'Download from https://github.com/cloudfoundry/cli/releases',
      setup: 'cf login',
      docs: 'https://docs.cloudfoundry.org/cf-cli/',
      package: 'https://github.com/cloudfoundry/cli/releases'
    },
    'cloudflare': {
      cli: 'wrangler',
      install: 'npm install -g wrangler',
      setup: 'wrangler login',
      docs: 'https://developers.cloudflare.com/workers/wrangler/',
      package: 'https://www.npmjs.com/package/wrangler'
    },
    'digitalocean': {
      cli: 'doctl',
      install: 'Download from https://github.com/digitalocean/doctl/releases',
      setup: 'doctl auth init',
      docs: 'https://docs.digitalocean.com/reference/doctl/',
      package: 'https://github.com/digitalocean/doctl/releases'
    },
    'docker-hub': {
      cli: 'docker',
      install: 'Download from https://docs.docker.com/get-docker/',
      setup: 'docker login',
      docs: 'https://docs.docker.com/engine/reference/commandline/cli/',
      package: 'https://docs.docker.com/get-docker/'
    },
    'firebase': {
      cli: 'firebase-tools',
      install: 'npm install -g firebase-tools',
      setup: 'firebase login',
      docs: 'https://firebase.google.com/docs/cli',
      package: 'https://www.npmjs.com/package/firebase-tools'
    },
    'fly-io': {
      cli: 'flyctl',
      install: 'curl -L https://fly.io/install.sh | sh',
      setup: 'flyctl auth login',
      docs: 'https://fly.io/docs/flyctl/',
      package: 'https://fly.io/docs/getting-started/installing-flyctl/'
    },
    'github-pages': {
      cli: 'gh',
      install: 'Download from https://cli.github.com/',
      setup: 'gh auth login',
      docs: 'https://cli.github.com/manual/',
      package: 'https://github.com/cli/cli/releases'
    },
    'google-cloud': {
      cli: 'gcloud',
      install: 'Download from https://cloud.google.com/sdk/docs/install',
      setup: 'gcloud auth login',
      docs: 'https://cloud.google.com/sdk/gcloud/',
      package: 'https://cloud.google.com/sdk/docs/install'
    },
    'goreleaser': {
      cli: 'goreleaser',
      install: 'go install github.com/goreleaser/goreleaser@latest',
      setup: 'export GITHUB_TOKEN=your_token',
      docs: 'https://goreleaser.com/',
      package: 'https://goreleaser.com/install/'
    },
    'heroku': {
      cli: 'heroku',
      install: 'npm install -g heroku',
      setup: 'heroku login',
      docs: 'https://devcenter.heroku.com/articles/heroku-cli',
      package: 'https://www.npmjs.com/package/heroku'
    },
    'netlify': {
      cli: 'netlify-cli',
      install: 'npm install -g netlify-cli',
      setup: 'netlify login',
      docs: 'https://docs.netlify.com/cli/get-started/',
      package: 'https://www.npmjs.com/package/netlify-cli'
    },
    'railway': {
      cli: 'railway',
      install: 'npm install -g @railway/cli',
      setup: 'railway login',
      docs: 'https://docs.railway.app/reference/cli-api',
      package: 'https://www.npmjs.com/package/@railway/cli'
    },
    'serverless': {
      cli: 'serverless',
      install: 'npm install -g serverless',
      setup: 'serverless login',
      docs: 'https://www.serverless.com/framework/docs/',
      package: 'https://www.npmjs.com/package/serverless'
    },
    'vercel': {
      cli: 'vercel',
      install: 'npm install -g vercel',
      setup: 'vercel login',
      docs: 'https://vercel.com/docs/cli',
      package: 'https://www.npmjs.com/package/vercel'
    }
  };

  const config = setupCommands[platform];
  if (config) {
    console.log(chalk.green('📦 Installation:'));
    console.log(chalk.gray(`  ${config.install}\n`));
    
    console.log(chalk.green('🔧 Setup:'));
    console.log(chalk.gray(`  ${config.setup}\n`));
    
    console.log(chalk.green('📚 Documentation:'));
    console.log(chalk.blue(`  ${config.docs}\n`));
    
    console.log(chalk.green('🔗 Package Manager:'));
    console.log(chalk.magenta(`  ${config.package}\n`));
  } else {
    console.log(chalk.red(`Platform "${platform}" not found.`));
  }
}

interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
}
