# Vercel Deployment 🔺

Deploy your frontend and fullstack applications to Vercel with seamless integration and automatic builds.

## Overview

The Package Installer CLI provides a wrapper around the official Vercel CLI, making deployment to Vercel simple and streamlined. When you run `pi deploy` and select Vercel, the CLI automatically:

- Checks for Vercel CLI installation
- Installs Vercel CLI if not present
- Handles authentication
- Creates optimal configuration
- Deploys your project

## Quick Start

```bash
# Interactive deployment - shows platform selection
pi deploy
```

**Platform Selection Interface:**
```
? Select deployment platform:
❯ 🔺 Vercel - Frontend and fullstack applications
  ☁️ AWS - S3 static sites and Lambda functions  
  📚 GitHub Pages - Static sites and documentation
```

```bash
# Direct Vercel deployment
pi deploy --platform vercel

# List all available platforms
pi deploy --list
```

## Prerequisites

### Automatic Installation
The CLI will automatically install the Vercel CLI if it's not present:
```bash
npm install -g vercel
```

### Manual Installation (Optional)
**Official Vercel CLI Installation:**
```bash
# Using npm (Official)
npm install -g vercel

# Using yarn
yarn global add vercel

# Using pnpm
pnpm add -g vercel
```

**Official Links:**
- **NPM Package**: https://www.npmjs.com/package/vercel
- **CLI Documentation**: https://vercel.com/docs/cli

## Supported Project Types

- **Next.js** - Full-stack React applications
- **React** - Single-page applications
- **Vue.js** - Progressive web applications  
- **Nuxt.js** - Universal Vue applications
- **Svelte/SvelteKit** - Modern web applications
- **Angular** - Enterprise applications
- **Static Sites** - HTML, CSS, JS sites
- **Node.js APIs** - Serverless functions

## Authentication

### First-Time Setup
When you first deploy, you'll be prompted to authenticate:

```bash
pi deploy --platform vercel
# You'll be redirected to login via browser
```

### Manual Authentication
```bash
vercel login
```

## Configuration

### Automatic Configuration
The CLI will prompt you to create a `vercel.json` if one doesn't exist:

```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

### Manual Configuration
Create a `vercel.json` in your project root:

```json
{
  "version": 2,
  "framework": "react",
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Deployment Process

1. **CLI Check**: Verifies Vercel CLI installation
2. **Authentication**: Ensures you're logged in
3. **Configuration**: Creates or validates vercel.json
4. **Build**: Runs your build command
5. **Deploy**: Pushes to Vercel's edge network
6. **URL**: Provides deployment URL

## Environment Variables

### Setting Environment Variables
```bash
# Through Vercel dashboard
vercel env add

# Via CLI during setup
vercel env add NODE_ENV production
vercel env add API_URL https://api.example.com
```

### Local Development
```bash
# Pull environment variables
vercel env pull .env.local
```

## Custom Domains

### Adding Custom Domain
```bash
# Through CLI
vercel domains add yourdomain.com

# Assign to project
vercel domains add yourdomain.com --project your-project
```

### DNS Configuration
Update the DNS settings provided by Vercel in your domain registrar.

## Advanced Features

### Preview Deployments
Every push to non-production branches creates a preview:
```bash
git push origin feature-branch
# Automatic preview deployment created
```

### Team Collaboration
```bash
# Invite team members
vercel teams add member@example.com

# Switch teams
vercel teams switch team-name
```

### Analytics
Enable Vercel Analytics in your project:
```bash
npm install @vercel/analytics
```

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Check build logs
vercel logs your-deployment-url

# Local build test
npm run build
```

**Authentication Issues**
```bash
# Re-authenticate
vercel logout
vercel login
```

**Domain Issues**
```bash
# Check domain status
vercel domains ls

# Verify domain
vercel domains verify yourdomain.com
```

### Build Optimization

**Next.js Projects**
```json
{
  "version": 2,
  "framework": "nextjs",
  "functions": {
    "app/api/**.ts": {
      "maxDuration": 10
    }
  }
}
```

**Static Sites**
```json
{
  "version": 2,
  "framework": null,
  "outputDirectory": "dist",
  "buildCommand": "npm run build"
}
```

## Best Practices

### 1. Environment Management
- Use Vercel's environment variable system
- Separate development, preview, and production variables
- Never commit sensitive data

### 2. Build Optimization
- Optimize bundle size
- Use static generation when possible
- Implement proper caching headers

### 3. Performance
- Enable Vercel Analytics
- Use Vercel's Image Optimization
- Implement proper SEO meta tags

### 4. Security
- Configure CSP headers
- Use HTTPS redirects
- Implement proper CORS policies

## Pricing & Limits

### Hobby Plan (Free)
- 100GB bandwidth
- 6,000 build minutes
- Custom domains
- HTTPS included

### Pro Plan ($20/month)
- 1TB bandwidth
- 24,000 build minutes
- Team collaboration
- Advanced analytics

## CLI Commands Reference

```bash
# Deploy to production
pi deploy --platform vercel

# Deploy with custom configuration
pi deploy --platform vercel --config

# Build before deployment
pi deploy --platform vercel --build

# Deploy with environment file
pi deploy --platform vercel --env .env.production
```

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **CLI Reference**: https://vercel.com/docs/cli
- **Community**: https://github.com/vercel/community
- **Support**: support@vercel.com

## Example Projects

### Next.js Application
```bash
# Create and deploy Next.js app
npx create-next-app@latest my-app
cd my-app
pi deploy --platform vercel
```

### React SPA
```bash
# Create and deploy React app
npx create-react-app my-react-app
cd my-react-app
npm run build
pi deploy --platform vercel
```

### Static Site
```bash
# Deploy existing static site
cd my-static-site
pi deploy --platform vercel
```

---

**Package Installer CLI** - Making deployment simple and powerful! 🚀