# 🚀 Deployment Guide

Package Installer CLI provides seamless deployment to multiple cloud platforms through official CLI wrappers. Deploy your projects with confidence using industry-standard tools.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Supported Platforms](#supported-platforms)
- [Quick Start](#quick-start)
- [Platform-Specific Guides](#platform-specific-guides)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

The deploy command acts as a unified wrapper around official platform CLIs:

- **🔺 Vercel**: Frontend and fullstack applications
- **☁️ AWS**: S3 static sites, Lambda functions, and more
- **📚 GitHub Pages**: Static sites and documentation

### How It Works

1. **Detection**: Automatically detects your project type
2. **CLI Management**: Installs and configures platform CLIs as needed
3. **Authentication**: Guides you through authentication setup
4. **Deployment**: Uses official CLIs for reliable deployments
5. **Feedback**: Provides clear deployment status and URLs

## ⚙️ Prerequisites

### General Requirements

- **Node.js**: Version 18+ required
- **Git**: Required for most deployments
- **Project Build**: Ensure your project builds successfully

### Platform-Specific CLIs

The deploy command will automatically install these when needed:

```bash
# Vercel CLI
npm install -g vercel

# AWS CLI
# Install from: https://aws.amazon.com/cli/

# GitHub CLI
# Install from: https://cli.github.com/
```

## 🌐 Supported Platforms

### 🔺 Vercel

**Best for**: React, Next.js, Vue, Angular, static sites

- ✅ Automatic builds and deployments
- ✅ Custom domains and SSL
- ✅ Edge functions support
- ✅ Environment variables
- ✅ Preview deployments

### ☁️ AWS

**Best for**: Static sites, serverless functions, complex infrastructure

- ✅ S3 static website hosting
- ✅ Lambda function deployment
- ✅ CloudFront CDN integration
- ✅ Custom domains with Route 53
- ✅ Advanced AWS services

### 📚 GitHub Pages

**Best for**: Documentation, static sites, open source projects

- ✅ GitHub Actions integration
- ✅ Custom domains
- ✅ Automatic deployments on push
- ✅ Jekyll support
- ✅ Free hosting for public repos

## 🚀 Quick Start

### Interactive Deployment

```bash
# Start interactive deployment
pi deploy

# Select your platform and follow the prompts
? Select deployment platform: 
❯ 🔺 Vercel - Frontend and fullstack applications
  ☁️ AWS - S3 static sites and Lambda functions  
  📚 GitHub Pages - Static sites and documentation
```

### Direct Platform Deployment

```bash
# Deploy to specific platform
pi deploy --platform vercel
pi deploy --platform aws
pi deploy --platform github-pages
```

### List Available Platforms

```bash
# Show all supported platforms
pi deploy --list
```

### Configuration

```bash
# Configure deployment settings
pi deploy --config
```

## 📖 Platform-Specific Guides

### 🔺 Vercel Deployment

#### Prerequisites
- Vercel account (free tier available)
- Project with supported framework

#### Steps

1. **Start Deployment**
   ```bash
   pi deploy --platform vercel
   ```

2. **Authentication** (if needed)
   - CLI will open browser for login
   - Follow Vercel authentication flow

3. **Configuration**
   - Choose existing project or create new
   - Configure build settings
   - Set environment variables

4. **Deploy**
   - Automatic build and deployment
   - Receive deployment URL

#### Supported Frameworks

- Next.js
- React
- Vue.js
- Nuxt.js
- Svelte
- Angular
- Static HTML

#### Example Configuration

```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

### ☁️ AWS Deployment

#### Prerequisites
- AWS account
- AWS CLI configured with credentials
- Appropriate IAM permissions

#### Deployment Types

##### S3 Static Website

```bash
pi deploy --platform aws
# Select: S3 Static Website
```

**Configuration:**
- Bucket name (will be created if doesn't exist)
- Build directory (default: `build`)
- Public read permissions
- Website hosting configuration

**Features:**
- Automatic bucket policy setup
- File synchronization
- Cache invalidation
- Custom error pages

##### Lambda Function

```bash
pi deploy --platform aws
# Select: Lambda Function
```

**Configuration:**
- Function name
- Runtime (Node.js, Python, etc.)
- Deployment package creation
- Environment variables

**Supported Runtimes:**
- nodejs18.x, nodejs20.x
- python3.9, python3.10, python3.11

#### Example S3 Deployment

```bash
# Deploy React app to S3
npm run build
pi deploy --platform aws

? Select AWS deployment type: S3 Static Website
? Enter S3 bucket name: my-awesome-app
? Enter build directory: build

# Automatic deployment process:
# ✅ Creating S3 bucket (if not exists)
# ✅ Configuring bucket for static website hosting
# ✅ Uploading files to S3
# ✅ Setting bucket policy for public read
# ✅ Deployment completed!
# 🔗 URL: http://my-awesome-app.s3-website-us-east-1.amazonaws.com
```

### 📚 GitHub Pages Deployment

#### Prerequisites
- GitHub account
- GitHub CLI authenticated
- Git repository

#### Deployment Methods

##### GitHub Actions (Recommended)

```bash
pi deploy --platform github-pages
# Select: GitHub Actions (Recommended)
```

**Features:**
- Automatic workflow creation
- Build on every push
- Configurable build process
- Multiple framework support

**Generated Workflow:**
- Node.js setup
- Dependency installation
- Build process
- GitHub Pages deployment

##### Direct Branch Deployment

```bash
pi deploy --platform github-pages
# Select: Direct gh-pages branch
```

**Features:**
- Direct deployment to gh-pages branch
- Uses `gh-pages` npm package
- Immediate deployment

#### Example GitHub Actions Setup

```bash
pi deploy --platform github-pages

? Select deployment method: GitHub Actions (Recommended)
? Select your framework: react
? Enter build command: npm run build
? Enter output directory: build

# Automatic setup:
# ✅ Created GitHub Actions workflow
# ✅ Committed workflow to repository
# ✅ Enabled GitHub Pages
# ✅ Workflow will run on next push
# 🔗 URL: https://username.github.io/repository
```

## ⚙️ Configuration

### Environment Variables

```bash
# Set environment variables for deployment
pi deploy --env .env.production

# Platform-specific environment setup
vercel env add    # For Vercel
aws configure     # For AWS
gh auth login     # For GitHub
```

### Build Configuration

```bash
# Build before deployment
pi deploy --build

# Custom build command
pi deploy --platform vercel --build
```

### Configuration Files

Each platform supports configuration files:

#### Vercel: `vercel.json`
```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### AWS: `aws-config.json`
```json
{
  "bucketName": "my-app-bucket",
  "region": "us-east-1",
  "buildDirectory": "dist",
  "errorDocument": "error.html"
}
```

#### GitHub Pages: `.github/workflows/deploy.yml`
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: actions/deploy-pages@v4
```

## 🔧 Advanced Usage

### Automated Deployment Scripts

```bash
#!/bin/bash
# deploy.sh - Automated deployment script

echo "🚀 Starting deployment process..."

# Build the project
npm run build

# Deploy to production
pi deploy --platform vercel

echo "✅ Deployment completed!"
```

### CI/CD Integration

#### GitHub Actions
```yaml
- name: Deploy with Package Installer CLI
  run: |
    npm install -g @0xshariq/package-installer
    pi deploy --platform vercel
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

#### Jenkins
```groovy
stage('Deploy') {
    steps {
        sh 'npm install -g @0xshariq/package-installer'
        sh 'pi deploy --platform aws'
    }
}
```

## 🐛 Troubleshooting

### Common Issues

#### CLI Not Found
```bash
# Error: Vercel CLI not found
# Solution: CLI will auto-install, or install manually:
npm install -g vercel
```

#### Authentication Issues
```bash
# Clear authentication and re-login
vercel logout && vercel login  # For Vercel
aws configure                  # For AWS
gh auth logout && gh auth login # For GitHub
```

#### Build Failures
```bash
# Check build process locally first
npm run build

# Check for missing dependencies
npm install

# Verify build output directory
ls -la build/  # or dist/, .next/, etc.
```

#### Permission Errors
```bash
# AWS S3 permissions
aws iam attach-user-policy --user-name my-user --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# GitHub repository permissions
gh repo edit --enable-pages --pages-branch gh-pages
```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* pi deploy --platform vercel

# Check CLI versions
vercel --version
aws --version
gh --version
```

### Getting Help

```bash
# Show deployment help
pi deploy --help

# Platform-specific help
pi deploy --config

# List all platforms
pi deploy --list
```

## 📚 Additional Resources

### Official Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [AWS CLI Documentation](https://aws.amazon.com/cli/)
- [GitHub CLI Documentation](https://cli.github.com/manual/)

### Community
- [GitHub Issues](https://github.com/0xshariq/package-installer-cli/issues)
- [Discussions](https://github.com/0xshariq/package-installer-cli/discussions)

### Examples
- [Example Projects](https://github.com/0xshariq/package-installer-cli/tree/main/examples)
- [Deployment Templates](https://github.com/0xshariq/package-installer-cli/tree/main/templates)

---

## 🎯 Summary

The Package Installer CLI deploy command provides:

✅ **Unified Interface**: One command for multiple platforms  
✅ **Official CLIs**: Uses platform-native tools for reliability  
✅ **Automatic Setup**: Installs and configures CLIs as needed  
✅ **Smart Detection**: Detects project types and configurations  
✅ **Interactive Guidance**: Step-by-step deployment assistance  
✅ **Production Ready**: Built for real-world deployment scenarios  

Ready to deploy? Start with:

```bash
pi deploy
```

---

*Need help? Check our [troubleshooting guide](#troubleshooting) or [open an issue](https://github.com/0xshariq/package-installer-cli/issues).*