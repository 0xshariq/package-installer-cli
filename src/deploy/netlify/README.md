# Netlify Deployment

Deploy static sites, JAMstack applications, and serverless functions to Netlify's global CDN.

## What Netlify Provides

- **Static Hosting**: Fast global CDN for static sites
- **Build Service**: Automated builds from Git repositories
- **Serverless Functions**: Deploy serverless functions alongside your site
- **Forms**: Handle form submissions without backend code
- **Identity**: User authentication and management
- **Edge Functions**: Run code at the edge globally

## Prerequisites

### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. Authentication

```bash
netlify login
```

### 3. Netlify Account

Sign up at https://netlify.com

## Usage

```bash
# Interactive deployment
pi deploy --platform netlify

# Or directly
pi deploy -p netlify
```

## Deployment Process

1. **Site Configuration**: Set site name and deployment type
2. **Framework Detection**: Automatically detect your framework
3. **Build Settings**: Configure build command and output directory
4. **Custom Domain**: Optional custom domain setup
5. **Configuration Files**: Generate netlify.toml, _redirects, _headers
6. **Build & Deploy**: Build project and deploy to Netlify

## Configuration Files

### netlify.toml
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

### _redirects
```
/*    /index.html   200
/api/* /.netlify/functions/:splat 200
```

### _headers
```
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff

/static/*
  Cache-Control: public, max-age=31536000, immutable
```

## Framework Support

### React (Create React App)
- **Build Command**: `npm run build`
- **Publish Directory**: `build`
- **Features**: SPA routing, code splitting
- **Redirects**: Automatic SPA redirect rules

### Next.js
- **Build Command**: `npm run build && npm run export`
- **Publish Directory**: `out`
- **Plugin**: `@netlify/plugin-nextjs`
- **Features**: Static generation, API routes as functions

### Vue.js
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Features**: Vue CLI, Vite support
- **SPA**: Automatic routing support

### Gatsby
- **Build Command**: `npm run build`
- **Publish Directory**: `public`
- **Plugin**: `netlify-plugin-gatsby-cache`
- **Features**: Static generation, GraphQL

### Nuxt.js
- **Build Command**: `npm run generate`
- **Publish Directory**: `dist`
- **Features**: Static generation, SSR
- **Mode**: Static generation recommended

### Svelte/SvelteKit
- **Build Command**: `npm run build`
- **Publish Directory**: `build`
- **Adapter**: `@sveltejs/adapter-netlify`
- **Features**: Static generation, serverless functions

### Eleventy (11ty)
- **Build Command**: `npm run build`
- **Publish Directory**: `_site`
- **Features**: Static site generation
- **Plugins**: Rich plugin ecosystem

### Hugo
- **Build Command**: `hugo`
- **Publish Directory**: `public`
- **Features**: Fast static generation
- **Themes**: Extensive theme support

### Jekyll
- **Build Command**: `bundle exec jekyll build`
- **Publish Directory**: `_site`
- **Features**: Blog-aware static generation
- **Ruby**: Built-in Ruby support

### Gridsome
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Features**: Vue.js + GraphQL
- **JAMstack**: Built for JAMstack

## Netlify Functions

### Creating Functions
```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Netlify Functions!',
      event: event
    })
  };
};
```

### Function Directory Structure
```
netlify/
  functions/
    hello.js
    api.js
    users/
      create.js
      update.js
```

### Environment Variables
```javascript
// Access environment variables
const API_KEY = process.env.API_KEY;

exports.handler = async (event, context) => {
  // Function logic
};
```

## Environment Variables

### Build Environment
```toml
[build.environment]
  NODE_VERSION = "18"
  RUBY_VERSION = "2.7.0"
  PYTHON_VERSION = "3.8"
```

### Runtime Environment
Set in Netlify Dashboard or via CLI:
```bash
netlify env:set API_KEY your-api-key
netlify env:set DATABASE_URL your-db-url
```

## Custom Domains

### Add Domain
```bash
# Via CLI
netlify sites:update --domain example.com

# Via Dashboard
# Go to Site settings > Domain management
```

### DNS Configuration
```
# A record
@ -> 75.2.60.5

# CNAME record  
www -> your-site.netlify.app
```

### SSL Certificates
Netlify automatically provides SSL certificates for all domains.

## Branch Deployments

### Deploy Previews
- Automatic deploy previews for pull requests
- Branch-specific URLs
- Environment-specific builds

### Branch Configuration
```toml
[build]
  command = "npm run build"

[context.production]
  command = "npm run build:prod"

[context.branch-deploy]
  command = "npm run build:staging"

[context.deploy-preview]
  command = "npm run build:preview"
```

## Forms

### HTML Forms
```html
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <input type="text" name="name" />
  <input type="email" name="email" />
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```

### React Forms
```jsx
function ContactForm() {
  return (
    <form name="contact" method="POST" data-netlify="true">
      <input type="hidden" name="form-name" value="contact" />
      <input type="text" name="name" />
      <input type="email" name="email" />
      <textarea name="message" />
      <button type="submit">Send</button>
    </form>
  );
}
```

### Form Notifications
Configure in Netlify Dashboard:
- Email notifications
- Slack integration
- Webhook notifications

## Identity (Authentication)

### Enable Identity
```toml
[build]
  command = "npm run build"
  
[build.environment]
  NETLIFY_IDENTITY_WIDGET = "true"
```

### Identity Widget
```html
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
<script>
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
</script>
```

## Edge Functions

### Creating Edge Functions
```javascript
// netlify/edge-functions/hello.js
export default async (request, context) => {
  return new Response("Hello from the edge!");
};

export const config = {
  path: "/edge-hello"
};
```

### Geolocation
```javascript
export default async (request, context) => {
  const country = context.geo.country?.name || "Unknown";
  
  return new Response(`Hello from ${country}!`);
};
```

## Analytics

### Built-in Analytics
- Page views and unique visitors
- Top pages and referrers
- Geographic data
- Device and browser analytics

### Custom Events
```javascript
// Track custom events
if (window.netlifyAnalytics) {
  window.netlifyAnalytics.track('button_click', {
    button_name: 'subscribe'
  });
}
```

## Performance Optimization

### Asset Optimization
```toml
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[build.processing.images]
  compress = true
```

### Caching Headers
```
/static/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/
  Cache-Control: public, max-age=0, must-revalidate
```

## CI/CD Integration

### GitHub Integration
1. Connect repository in Netlify Dashboard
2. Configure build settings
3. Auto-deploy on push

### GitLab CI
```yaml
deploy:
  stage: deploy
  script:
    - npm install -g netlify-cli
    - netlify deploy --prod --dir=dist --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
  only:
    - main
```

### Custom Build Hooks
```bash
# Trigger build via webhook
curl -X POST -d {} https://api.netlify.com/build_hooks/your-hook-id
```

## Monitoring & Debugging

### Build Logs
- View in Netlify Dashboard
- Download build logs
- Debug build failures

### Function Logs
```bash
# View function logs
netlify functions:log

# Live tail logs
netlify dev
```

### Deploy Notifications
- Slack integration
- Email notifications
- Webhook notifications

## Best Practices

1. **Optimize build times with caching**
2. **Use environment variables for configuration**
3. **Implement proper redirects for SEO**
4. **Set up form spam protection**
5. **Use branch deploys for testing**
6. **Optimize images and assets**
7. **Implement proper security headers**
8. **Use Netlify Functions for dynamic functionality**
9. **Set up monitoring and alerts**
10. **Use deploy previews for code review**

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build command and dependencies
   - Verify Node.js version
   - Review build logs

2. **404 Errors on SPA Routes**
   - Add _redirects file
   - Configure SPA redirect rules
   - Check publish directory

3. **Function Errors**
   - Check function syntax
   - Verify environment variables
   - Review function logs

4. **Form Submission Issues**
   - Verify form attributes
   - Check spam filters
   - Review form notifications

### Getting Help

- Netlify Documentation: https://docs.netlify.com
- Community Forum: https://community.netlify.com
- Support: https://netlify.com/support
- Stack Overflow: Tag with `netlify`

## Pricing

### Starter (Free)
- 100GB bandwidth/month
- 300 build minutes/month
- 125K function invocations/month
- 100 form submissions/month

### Pro ($19/month)
- 400GB bandwidth/month
- 300 build minutes/month
- 2M function invocations/month
- 1,000 form submissions/month

### Business ($99/month)
- 1TB bandwidth/month
- 600 build minutes/month
- 8M function invocations/month
- 10,000 form submissions/month

### Enterprise
- Custom pricing
- Advanced security features
- SSO integration
- Priority support
