# ☁️ Cloudflare Deployment

Deploy your applications to Cloudflare Pages, Workers, and Workers Sites using the Package Installer CLI.

## 🌟 Overview

Cloudflare deployment allows you to:
- ⚡ Deploy to Cloudflare Pages for static sites
- 🔧 Deploy serverless functions with Workers
- 🌍 Global edge network deployment
- 🚀 Zero cold start times
- 💰 Generous free tier

## 🚀 Quick Deploy

Run the Package Installer CLI deploy command and select Cloudflare:

```bash
pi deploy
```

When prompted, select:
```
? Select deployment platform: 
  🔺 Vercel - Frontend and fullstack applications
  ☁️ AWS - S3 static sites and Lambda functions  
  📚 GitHub Pages - Static sites and documentation
  🐳 Docker Hub - Container registry and deployment
  🌊 DigitalOcean - App Platform and container registry
❯ ☁️ Cloudflare - Pages, Workers, and Workers Sites
```

Or deploy directly:
```bash
pi deploy --platform cloudflare
```

## 📋 Prerequisites

### Wrangler CLI Installation

Cloudflare's Wrangler CLI must be installed on your system:

**Official Installation:**
- 📖 **Documentation**: https://developers.cloudflare.com/workers/wrangler/
- 📦 **npm**: 
  ```bash
  npm install -g wrangler
  ```
- 🧶 **yarn**: 
  ```bash
  yarn global add wrangler
  ```
- 🥡 **pnpm**: 
  ```bash
  pnpm add -g wrangler
  ```

### Cloudflare Account

- Create account at https://cloudflare.com/
- Have your API token ready (can be generated during authentication)

## 🔧 Configuration

### 1. Wrangler Configuration

The deployment process creates a `wrangler.toml` configuration file:

#### Cloudflare Pages (Static Site)
```toml
name = "my-static-site"
compatibility_date = "2023-12-01"

[env.production]
pages_build_output_dir = "dist"

[[env.production.pages_build_commands]]
command = "npm run build"
```

#### Cloudflare Workers (Serverless Functions)
```toml
name = "my-worker"
main = "src/index.js"
compatibility_date = "2023-12-01"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "MY_KV"
id = "your-kv-namespace-id"
```

#### Workers Sites (Static + Dynamic)
```toml
name = "my-workers-site"
type = "webpack"
account_id = "your-account-id"
workers_dev = true
route = ""
zone_id = ""

[site]
bucket = "./dist"
entry-point = "./workers-site"

[env.production.site]
bucket = "./dist"
entry-point = "./workers-site"
```

### 2. Authentication

Authenticate with Cloudflare:
```bash
wrangler login
```

Or use API token:
```bash
wrangler auth --api-token YOUR_API_TOKEN
```

## 🚀 Deployment Process

### Interactive Deployment

1. **Start Deployment**
   ```bash
   pi deploy --platform cloudflare
   ```

2. **Authentication** (if not already authenticated)
   - Login via browser OAuth
   - Or provide API token

3. **Select Deployment Type**
   - Cloudflare Pages (static sites)
   - Cloudflare Workers (serverless functions)
   - Workers Sites (static + edge functions)

4. **Configure Project**
   - Enter project name
   - Select build command (for Pages)
   - Configure environment variables

5. **Deploy**
   - Project is built and deployed
   - Live URL is provided
   - Custom domain setup options

### Example Deployment Flow

```bash
$ pi deploy --platform cloudflare

☁️ Starting Cloudflare deployment...

? Select deployment type: 
❯ Pages - Static sites with JAMstack
  Workers - Serverless edge functions
  Workers Sites - Static sites with edge functions

? Enter project name: my-awesome-site
? Enter build command: npm run build
? Enter build output directory: dist

🔨 Building project...
🚀 Deploying to Cloudflare Pages...

✅ Successfully deployed to Cloudflare!
🔗 URL: https://my-awesome-site.pages.dev
```

## 🎯 Use Cases

### Cloudflare Pages
- React/Vue.js applications
- Static site generators (Gatsby, Next.js, Nuxt.js)
- Documentation sites
- Portfolio websites
- Landing pages

### Cloudflare Workers
- API endpoints
- Edge computing functions
- Request/response manipulation
- Authentication middleware
- A/B testing logic

### Workers Sites
- JAMstack applications
- Static sites with dynamic features
- E-commerce sites
- Content management systems

## 🔧 Advanced Configuration

### Environment Variables

#### Pages Environment Variables
Set in Cloudflare dashboard or via API:
```bash
# Set environment variable for Pages
wrangler pages secret put API_KEY --project-name my-project
```

#### Workers Environment Variables
Add to `wrangler.toml`:
```toml
name = "my-worker"

[vars]
ENVIRONMENT = "production"
API_URL = "https://api.example.com"

[env.staging.vars]
ENVIRONMENT = "staging"
API_URL = "https://staging-api.example.com"
```

### Custom Domains

#### Pages Custom Domain
```bash
# Add custom domain to Pages project
wrangler pages domain add example.com --project-name my-project
```

#### Workers Custom Domain
Add route to `wrangler.toml`:
```toml
name = "my-worker"
route = "api.example.com/*"
zone_id = "your-zone-id"
```

### KV Storage

Add KV namespace to Workers:
```toml
[[kv_namespaces]]
binding = "MY_KV"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"
```

Use in Worker code:
```javascript
export default {
  async fetch(request, env) {
    // Store data
    await env.MY_KV.put("key", "value");
    
    // Retrieve data
    const value = await env.MY_KV.get("key");
    
    return new Response(value);
  },
};
```

### Durable Objects

Configure Durable Objects:
```toml
[[durable_objects.bindings]]
name = "COUNTER"
class_name = "Counter"

[[migrations]]
tag = "v1"
new_classes = ["Counter"]
```

## 🔍 Troubleshooting

### Common Issues

#### Authentication Failed
```bash
# Error: Authentication failed
# Solution: Re-authenticate with Cloudflare
wrangler logout
wrangler login

# Or use API token
wrangler auth --api-token YOUR_API_TOKEN
```

#### Build Failures
```bash
# Check build logs
wrangler pages deployment list --project-name my-project

# Test build locally
npm run build

# Check build output directory
ls -la dist/
```

#### Domain Issues
```bash
# Check domain status
wrangler pages domain list --project-name my-project

# Verify DNS settings
dig example.com

# Check SSL certificate
curl -I https://example.com
```

#### Worker Errors
```bash
# Check Worker logs
wrangler tail my-worker

# Test Worker locally
wrangler dev

# Check resource limits
wrangler status my-worker
```

### Performance Issues

```bash
# Check Pages analytics
# View in Cloudflare dashboard: Analytics → Web Analytics

# Monitor Worker performance
# View in Cloudflare dashboard: Workers & Pages → Analytics

# Check cache hit rates
# View in Cloudflare dashboard: Analytics → Caching
```

## 📚 Best Practices

### Performance
- Optimize build output size
- Use Cloudflare's CDN effectively
- Implement proper caching strategies
- Minimize cold start times for Workers

### Security
- Use environment variables for secrets
- Implement proper CORS policies
- Use Cloudflare's security features
- Regular security audits

### Cost Optimization
- Monitor usage limits
- Optimize Worker execution time
- Use KV storage efficiently
- Implement proper caching

### Development
- Use Wrangler dev for local development
- Test thoroughly before deployment
- Use staging environments
- Monitor error rates

## 🌐 Integration

### CI/CD Pipelines

#### GitHub Actions
```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Deploy to Cloudflare
        run: |
          npm install -g @0xshariq/package-installer
          pi deploy --platform cloudflare
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

#### GitLab CI
```yaml
deploy:
  stage: deploy
  script:
    - npm install -g wrangler @0xshariq/package-installer
    - pi deploy --platform cloudflare
  variables:
    CLOUDFLARE_API_TOKEN: $CLOUDFLARE_API_TOKEN
  only:
    - main
```

### Framework Integration

#### Next.js with Cloudflare Pages
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

#### React with Workers
```javascript
// Worker script for API routes
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/data') {
      return new Response(JSON.stringify({ data: 'Hello from Worker!' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Serve static assets
    return env.ASSETS.fetch(request);
  },
};
```

## 🔧 Cloudflare Features

### Pages Functions

Add serverless functions to Pages:
```javascript
// functions/api/hello.js
export async function onRequest(context) {
  return new Response('Hello from Pages Functions!');
}

// functions/api/users/[id].js
export async function onRequest(context) {
  const { id } = context.params;
  return new Response(`User ID: ${id}`);
}
```

### Workers Analytics

Monitor Workers performance:
```javascript
export default {
  async fetch(request, env, ctx) {
    const start = Date.now();
    
    try {
      const response = await handleRequest(request);
      
      // Log analytics
      ctx.waitUntil(logAnalytics({
        status: response.status,
        duration: Date.now() - start,
        path: new URL(request.url).pathname
      }));
      
      return response;
    } catch (error) {
      // Log error
      ctx.waitUntil(logError(error));
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
```

### Edge Caching

Implement custom caching:
```javascript
export default {
  async fetch(request, env) {
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    
    // Check cache
    let response = await cache.match(cacheKey);
    
    if (!response) {
      // Fetch from origin
      response = await fetch(request);
      
      // Cache response
      if (response.status === 200) {
        const responseClone = response.clone();
        responseClone.headers.set('Cache-Control', 'public, max-age=3600');
        await cache.put(cacheKey, responseClone);
      }
    }
    
    return response;
  },
};
```

## 🎉 Next Steps

After deploying to Cloudflare:

1. **Custom Domain**
   - Configure custom domain
   - Set up SSL certificate
   - Update DNS records

2. **Performance Optimization**
   - Monitor Core Web Vitals
   - Optimize caching strategies
   - Use Cloudflare's performance features

3. **Security Enhancement**
   - Enable Cloudflare security features
   - Implement rate limiting
   - Set up firewall rules

4. **Monitoring & Analytics**
   - Set up Web Analytics
   - Monitor Worker performance
   - Create custom dashboards

## 🔗 Resources

- **Cloudflare Pages**: https://pages.cloudflare.com/
- **Cloudflare Workers**: https://workers.cloudflare.com/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **Developer Documentation**: https://developers.cloudflare.com/
- **Community Forum**: https://community.cloudflare.com/

---

*Deploy with confidence using Cloudflare and Package Installer CLI! ☁️*
