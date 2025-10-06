# GitHub Pages Deployment 📚

Deploy your static sites and documentation to GitHub Pages with automated workflows and seamless GitHub integration.

## Overview

The Package Installer CLI provides a wrapper around the GitHub CLI and automated workflows, making deployment to GitHub Pages simple and powerful. When you run `pi deploy` and select GitHub Pages, the CLI offers multiple deployment methods:

- **GitHub Actions** - Automated workflows (Recommended)
- **Direct gh-pages branch** - Simple branch-based deployment
- **Manual upload** - Traditional file upload method

## Quick Start

```bash
# Interactive deployment - shows platform selection
pi deploy
```

**Platform Selection Interface:**
```
? Select deployment platform:
  🔺 Vercel - Frontend and fullstack applications
  ☁️ AWS - S3 static sites and Lambda functions  
❯ 📚 GitHub Pages - Static sites and documentation
```

```bash
# Direct GitHub Pages deployment  
pi deploy --platform github-pages

# List all available platforms
pi deploy --list
```

## Prerequisites

### GitHub CLI Installation
The GitHub CLI is required for seamless integration. The Package Installer CLI will guide you if it's missing:

**Official GitHub CLI Installation:**

```bash
# macOS (Official)
brew install gh

# Ubuntu/Debian (Official)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Windows (Official)
winget install --id GitHub.cli
# Or download from: https://github.com/cli/cli/releases
```

### gh-pages NPM Package
For direct branch deployment, the CLI uses the gh-pages package:

```bash
# Install globally (Optional - CLI handles this)
npm install -g gh-pages

# Or as dev dependency
npm install --save-dev gh-pages
```

**Official Links:**
- **GitHub CLI Documentation**: https://cli.github.com/manual/
- **gh-pages NPM Package**: https://www.npmjs.com/package/gh-pages
- **GitHub Pages Documentation**: https://docs.github.com/pages

### Git Repository
Your project must be in a Git repository:
```bash
# Initialize Git if needed
git init
git add .
git commit -m "Initial commit"
```

### GitHub Account
- GitHub account (free or paid)
- Repository on GitHub (public or private)

## Deployment Methods

### 1. GitHub Actions (Recommended)

Automated deployment with every push to your main branch.

**Benefits:**
- Automatic deployments
- Build environment isolation
- No local build required
- Advanced workflow customization
- Supports all frameworks

**Supported Frameworks:**
- React, Vue, Angular
- Next.js, Nuxt.js, SvelteKit
- Jekyll, Hugo, Gatsby
- Static HTML/CSS/JS
- Documentation sites

**Workflow Process:**
1. Code pushed to main branch
2. GitHub Actions triggers
3. Dependencies installed
4. Project built
5. Deployed to gh-pages branch
6. Site live at `username.github.io/repo-name`

### 2. Direct gh-pages Branch

Direct deployment to the gh-pages branch using the gh-pages npm package.

**Benefits:**
- Simple and fast
- Local control
- Works with any project type
- No workflow configuration

**Process:**
1. Build project locally
2. Push build files to gh-pages branch
3. GitHub serves from gh-pages branch

### 3. Manual Upload

Traditional method with full manual control.

**Benefits:**
- Complete control
- Custom configurations
- Works without automation

## Detailed Deployment Guides

### GitHub Actions Deployment

#### Step 1: Repository Setup
```bash
# Deploy using CLI (creates repo if needed)
pi deploy --platform github-pages
# Select: GitHub Actions (Recommended)
# Enter repository name: my-awesome-site
# Select: Public/Private
```

#### Step 2: Framework Selection
The CLI will prompt for your framework and automatically create the optimal workflow:

- **React**: Create React App or Vite setup  
- **Vue**: Vue CLI or Vite configuration
- **Angular**: Angular CLI workflow
- **Next.js**: Static export configuration
- **Nuxt.js**: Static generation setup
- **Static**: Direct file deployment

#### Step 3: Automatic Workflow Creation
The CLI creates `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Direct gh-pages Branch Deployment

#### Step 1: Build Your Project
```bash
# Build your project
npm run build
# or
yarn build
```

#### Step 2: Deploy
```bash
pi deploy --platform github-pages
# Select: Direct gh-pages branch
# Enter build directory: dist (or build)
```

The CLI will:
1. Install gh-pages package if needed
2. Deploy build folder to gh-pages branch
3. Enable GitHub Pages in repository settings

### Manual Deployment

#### Step 1: Enable GitHub Pages
1. Go to repository Settings
2. Navigate to Pages section
3. Select source branch (main or gh-pages)
4. Choose root directory or /docs folder

#### Step 2: Upload Files
Either commit to main branch or upload to chosen directory.

## Framework-Specific Configurations

### React Applications

**Create React App:**
```json
{
  "homepage": "https://username.github.io/repository-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

**Vite React:**
```javascript
// vite.config.js
export default {
  base: '/repository-name/',
  build: {
    outDir: 'dist'
  }
}
```

### Vue.js Applications

**Vue CLI:**
```javascript
// vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/repository-name/'
    : '/'
}
```

**Vite Vue:**
```javascript
// vite.config.js
export default {
  base: '/repository-name/',
}
```

### Next.js Applications

**Static Export Configuration:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/repository-name',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### Angular Applications

**Angular.json Configuration:**
```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "baseHref": "/repository-name/"
            }
          }
        }
      }
    }
  }
}
```

## Custom Domains

### Setting Up Custom Domain

#### Step 1: Add CNAME File
Create `CNAME` file in your repository root or build output:
```
yourdomain.com
```

#### Step 2: Configure DNS
Add DNS records with your domain registrar:

**For Apex Domain (yourdomain.com):**
```
A    185.199.108.153
A    185.199.109.153  
A    185.199.110.153
A    185.199.111.153
```

**For Subdomain (www.yourdomain.com):**
```
CNAME    username.github.io
```

#### Step 3: Enable in Repository Settings
1. Repository Settings → Pages
2. Enter custom domain
3. Enable "Enforce HTTPS"

### Domain Verification
GitHub may require domain verification for organization accounts:
```bash
# Add verification meta tag or DNS TXT record
gh api repos/:owner/:repo/pages --field source='{"branch":"main","path":"/"}'
```

## Advanced Workflows

### Multi-Environment Deployment

**Development Environment:**
```yaml
# .github/workflows/deploy-dev.yml
name: Deploy Development

on:
  push:
    branches: [ develop ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to dev branch
        run: |
          npm install
          npm run build:dev
          gh-pages -d dist -b gh-pages-dev
```

### Build Matrix for Multiple Frameworks
```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    framework: [react, vue, angular]
```

### Environment Variables
```yaml
env:
  NODE_ENV: production
  API_URL: https://api.yourdomain.com
  
# Or use repository secrets
env:
  API_KEY: ${{ secrets.API_KEY }}
```

## Authentication & Permissions

### GitHub CLI Authentication
```bash
# Login via browser
gh auth login

# Login with token
gh auth login --with-token < token.txt

# Check authentication status
gh auth status
```

### Repository Permissions
Ensure your account has:
- Read access to repository
- Write access for branch creation
- Pages deployment permissions

### Fine-grained Tokens
For enhanced security, use fine-grained personal access tokens:
- Repository access: Contents (read/write)
- Repository access: Pages (write)  
- Repository access: Actions (write)

## Monitoring & Analytics

### GitHub Insights
- **Traffic**: View visitor statistics
- **Popular Content**: Most visited pages
- **Referring Sites**: Traffic sources
- **Popular Repositories**: Related projects

### Build Status
Monitor deployment status:
```bash
# Check workflow runs
gh run list --workflow=deploy-pages.yml

# View specific run
gh run view <run-id>

# Check Pages deployment
gh api repos/:owner/:repo/pages
```

### Custom Analytics
Add analytics to your site:

**Google Analytics:**
```html
<!-- Add to your HTML head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check build logs in Actions tab
gh run view --log

# Test build locally
npm run build
```

**404 Errors:**
- Check base URL configuration
- Verify build output directory
- Check routing setup for SPAs

**Custom Domain Issues:**
```bash
# Verify DNS configuration
nslookup yourdomain.com

# Check CNAME file
cat CNAME
```

**Permission Denied:**
```bash
# Re-authenticate
gh auth logout
gh auth login

# Check repository permissions
gh repo view --json permissions
```

### Debugging Workflows

**View workflow logs:**
```bash
# List workflow runs
gh run list

# View specific run logs
gh run view <run-id> --log
```

**Local workflow testing:**
```bash
# Install act for local testing
brew install act

# Run workflow locally
act -j build
```

## Best Practices

### 1. Performance Optimization
- Optimize images and assets
- Use build-time optimizations
- Enable gzip compression
- Implement proper caching headers

### 2. SEO Optimization
- Add proper meta tags
- Implement structured data
- Create sitemap.xml
- Use semantic HTML

### 3. Security
- Keep dependencies updated
- Use HTTPS (enforced by GitHub Pages)
- Implement CSP headers where possible
- Regular security audits

### 4. Workflow Optimization
- Cache dependencies in workflows
- Use matrix builds for testing
- Implement proper error handling
- Add notification systems

## Limitations

### GitHub Pages Limitations
- **File Size**: Max 1GB repository size
- **Bandwidth**: 100GB/month soft limit
- **Build Time**: 10-minute limit per workflow
- **No Server-Side**: Static sites only
- **Jekyll Processing**: May interfere with some frameworks

### Workarounds
- Use `.nojekyll` file to disable Jekyll
- Optimize assets and use CDNs
- Split large repositories
- Use external APIs for dynamic content

## Cost & Usage

### Free Tier
- **Public Repositories**: Unlimited
- **Private Repositories**: 2,000 minutes/month
- **Storage**: 500MB
- **Bandwidth**: 1GB/month

### GitHub Pro/Team
- Increased private repository minutes
- Advanced insights and analytics
- Enhanced support

## CLI Commands Reference

```bash
# GitHub Pages deployment options
pi deploy --platform github-pages

# Deploy with build step
pi deploy --platform github-pages --build

# Deploy with custom configuration
pi deploy --platform github-pages --config

# Deploy specific branch
git checkout gh-pages
pi deploy --platform github-pages
```

## Example Projects

### React Portfolio
```bash
# Create and deploy React portfolio
npx create-react-app my-portfolio
cd my-portfolio
# Edit package.json homepage
pi deploy --platform github-pages
# Select: GitHub Actions
```

### Vue.js Documentation
```bash
# Deploy Vue documentation site
vue create docs-site
cd docs-site
pi deploy --platform github-pages
# Select: GitHub Actions
```

### Static HTML Site
```bash
# Deploy static site
mkdir my-site
cd my-site
# Add HTML, CSS, JS files
git init && git add . && git commit -m "Initial"
pi deploy --platform github-pages
# Select: Direct gh-pages branch
```

## Migration from Other Platforms

### From Netlify
1. Export your site files
2. Update build configuration
3. Deploy using GitHub Actions
4. Update DNS records

### From Vercel
1. Clone repository to GitHub
2. Update deployment scripts
3. Configure build settings
4. Deploy with GitHub Actions

## Support & Resources

- **GitHub Pages Documentation**: https://docs.github.com/pages
- **GitHub CLI Documentation**: https://cli.github.com/manual/
- **GitHub Actions Documentation**: https://docs.github.com/actions
- **Community Support**: https://github.community/

## Integration Examples

### Automated Testing + Deployment
```yaml
name: Test and Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          npm install
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Pages
        # Deploy only if tests pass
```

### Multi-Stage Deployment
```yaml
# Deploy to staging first, then production
jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    # Deploy to staging environment
    
  deploy-production:
    if: github.ref == 'refs/heads/main'
    # Deploy to production
```

---

**Package Installer CLI** - Simplifying GitHub Pages deployment! 📚