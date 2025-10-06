# 🌊 DigitalOcean App Platform Deployment

Deploy your applications to DigitalOcean App Platform using the Package Installer CLI.

## 🌟 Overview

DigitalOcean App Platform deployment allows you to:
- 🚀 Deploy web apps, APIs, and static sites
- 📈 Auto-scaling and load balancing
- 🔄 Git-based deployments
- 🌍 Global CDN and edge locations
- 💰 Cost-effective hosting solution

## 🚀 Quick Deploy

Run the Package Installer CLI deploy command and select DigitalOcean:

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
❯ 🌊 DigitalOcean - App Platform and container registry
  ☁️ Cloudflare - Pages, Workers, and Workers Sites
```

Or deploy directly:
```bash
pi deploy --platform digitalocean
```

## 📋 Prerequisites

### DigitalOcean CLI (doctl) Installation

The DigitalOcean CLI must be installed on your system:

**Official Installation:**
- 📖 **Documentation**: https://docs.digitalocean.com/reference/doctl/
- 🐧 **Linux**: 
  ```bash
  cd ~
  wget https://github.com/digitalocean/doctl/releases/download/v1.102.0/doctl-1.102.0-linux-amd64.tar.gz
  tar xf ~/doctl-1.102.0-linux-amd64.tar.gz
  sudo mv ~/doctl /usr/local/bin
  ```
- 🍎 **macOS**: 
  ```bash
  brew install doctl
  ```
- 🪟 **Windows**: 
  ```powershell
  # Using Chocolatey
  choco install doctl
  
  # Or download from releases
  # https://github.com/digitalocean/doctl/releases
  ```

### DigitalOcean Account

- Create account at https://www.digitalocean.com/
- Generate API token in Control Panel → API → Personal Access Token

## 🔧 Configuration

### 1. App Platform Configuration

The deployment process creates an `app.yaml` configuration file:

#### Node.js Application
```yaml
name: my-node-app
services:
  - name: web
    source_dir: /
    github:
      repo: username/my-repo
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
```

#### Static Site
```yaml
name: my-static-site
static_sites:
  - name: frontend
    source_dir: /
    github:
      repo: username/my-repo
      branch: main
    build_command: npm run build
    output_dir: dist
    routes:
      - path: /
```

#### Python Application
```yaml
name: my-python-app
services:
  - name: web
    source_dir: /
    github:
      repo: username/my-repo
      branch: main
    run_command: python app.py
    environment_slug: python
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
```

### 2. Authentication

Authenticate with DigitalOcean:
```bash
doctl auth init
```

Or the CLI will prompt you during deployment.

## 🚀 Deployment Process

### Interactive Deployment

1. **Start Deployment**
   ```bash
   pi deploy --platform digitalocean
   ```

2. **Authentication** (if not already authenticated)
   - Enter your DigitalOcean API token
   - Token is saved for future deployments

3. **Configure App**
   - Enter app name
   - Select deployment type (web service, static site, worker)
   - Configure environment variables

4. **App Configuration**
   - CLI generates `app.yaml` configuration
   - Select GitHub repository (if Git-based deployment)
   - Configure build and run commands

5. **Deploy**
   - App is created on DigitalOcean
   - Build and deployment starts
   - Live URL is provided

### Example Deployment Flow

```bash
$ pi deploy --platform digitalocean

🌊 Starting DigitalOcean App Platform deployment...

? Enter your app name: my-awesome-app
? Select deployment type: 
❯ Web Service - Node.js, Python, Go, etc.
  Static Site - React, Vue, Angular, etc.
  Worker - Background jobs and tasks

? Enter GitHub repository (username/repo): myusername/my-app
? Enter branch name: main

🔨 Creating app configuration...
🚀 Deploying to DigitalOcean App Platform...

✅ Successfully deployed to DigitalOcean!
🔗 URL: https://my-awesome-app-12345.ondigitalocean.app
```

## 🎯 Use Cases

### Web Applications
- Node.js/Express applications
- Python Flask/Django apps
- Ruby on Rails applications
- Go web services
- PHP applications

### Static Sites
- React/Vue.js applications
- Gatsby/Next.js sites
- Documentation sites
- Portfolio websites

### APIs and Microservices
- REST APIs
- GraphQL services
- Microservices architecture
- Background workers

## 🔧 Advanced Configuration

### Environment Variables

Add environment variables to your `app.yaml`:

```yaml
name: my-app
services:
  - name: web
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${DATABASE_URL}
      - key: API_SECRET
        type: SECRET
        value: ${API_SECRET}
    # ... rest of configuration
```

### Custom Domains

Add custom domains to your app:

```yaml
name: my-app
domains:
  - domain: myapp.com
    type: PRIMARY
  - domain: www.myapp.com
    type: ALIAS
services:
  # ... service configuration
```

### Database Integration

Add managed databases:

```yaml
name: my-app
databases:
  - engine: PG
    name: main-db
    num_nodes: 1
    size: db-s-1vcpu-1gb
    version: "13"
services:
  - name: web
    envs:
      - key: DATABASE_URL
        scope: RUN_AND_BUILD_TIME
        value: ${main-db.DATABASE_URL}
    # ... rest of configuration
```

### Multi-Service Applications

Deploy multiple services:

```yaml
name: my-fullstack-app
services:
  - name: api
    source_dir: /api
    run_command: npm start
    environment_slug: node-js
    routes:
      - path: /api
  - name: worker
    source_dir: /worker
    run_command: npm run worker
    environment_slug: node-js
static_sites:
  - name: frontend
    source_dir: /frontend
    build_command: npm run build
    output_dir: dist
    routes:
      - path: /
```

## 🔍 Troubleshooting

### Common Issues

#### Authentication Failed
```bash
# Error: Unable to authenticate you
# Solution: Check API token and permissions
doctl auth init --access-token YOUR_TOKEN

# Verify authentication
doctl account get
```

#### Build Failures
```bash
# Check build logs
doctl apps logs APP_ID --type BUILD

# Update build command in app.yaml
# Ensure all dependencies are listed
```

#### Deployment Timeout
```bash
# Check deployment status
doctl apps get APP_ID

# View detailed logs
doctl apps logs APP_ID --type DEPLOY
```

#### Domain Issues
```bash
# Check domain configuration
doctl apps get APP_ID

# Verify DNS settings
dig myapp.com

# Check domain status
doctl apps list-domains APP_ID
```

### Resource Limits

```bash
# Check app resource usage
doctl apps get APP_ID

# Scale app if needed
doctl apps update APP_ID --spec app.yaml

# Monitor app metrics in DigitalOcean dashboard
```

## 📚 Best Practices

### Performance
- Choose appropriate instance sizes
- Use CDN for static assets
- Enable compression
- Optimize build processes

### Security
- Use environment variables for secrets
- Enable HTTPS (automatic with custom domains)
- Regular security updates
- Monitor access logs

### Cost Optimization
- Right-size your instances
- Use static sites for frontend-only apps
- Monitor resource usage
- Set up alerts for usage spikes

### Monitoring
- Set up health checks
- Monitor application logs
- Use DigitalOcean monitoring
- Set up alerts for downtime

## 🌐 Integration

### CI/CD Pipelines

#### GitHub Actions
```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to DigitalOcean
        run: |
          npm install -g @0xshariq/package-installer
          pi deploy --platform digitalocean
        env:
          DIGITALOCEAN_ACCESS_TOKEN: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
```

#### GitLab CI
```yaml
deploy:
  stage: deploy
  script:
    - npm install -g @0xshariq/package-installer
    - pi deploy --platform digitalocean
  variables:
    DIGITALOCEAN_ACCESS_TOKEN: $DIGITALOCEAN_ACCESS_TOKEN
  only:
    - main
```

### Database Management

#### PostgreSQL Database
```yaml
databases:
  - engine: PG
    name: primary-db
    num_nodes: 1
    size: db-s-1vcpu-1gb
    version: "13"
```

#### Redis Cache
```yaml
databases:
  - engine: REDIS
    name: cache
    num_nodes: 1
    size: db-s-1vcpu-1gb
    version: "7"
```

#### MongoDB
```yaml
databases:
  - engine: MONGODB
    name: documents
    num_nodes: 1
    size: db-s-1vcpu-1gb
    version: "5.0"
```

## 🔧 App Platform Features

### Auto-scaling
```yaml
services:
  - name: web
    instance_count: 1
    autoscaling:
      min_instance_count: 1
      max_instance_count: 5
      metrics:
        cpu:
          percent: 80
```

### Health Checks
```yaml
services:
  - name: web
    health_check:
      http_path: /health
      initial_delay_seconds: 30
      period_seconds: 10
      timeout_seconds: 5
      success_threshold: 1
      failure_threshold: 3
```

### Log Forwarding
```yaml
services:
  - name: web
    log_destinations:
      - name: my-logs
        papertrail:
          endpoint: logs.papertrailapp.com:12345
```

## 🎉 Next Steps

After deploying to DigitalOcean:

1. **Monitor Performance**
   - Check application metrics
   - Monitor resource usage
   - Set up alerts

2. **Custom Domain**
   - Configure custom domain
   - Set up SSL certificate
   - Update DNS records

3. **Scale Application**
   - Adjust instance counts
   - Optimize resource allocation
   - Implement auto-scaling

4. **Add Services**
   - Integrate databases
   - Add caching layer
   - Set up monitoring

## 🔗 Resources

- **DigitalOcean App Platform**: https://www.digitalocean.com/products/app-platform
- **doctl Documentation**: https://docs.digitalocean.com/reference/doctl/
- **App Platform Docs**: https://docs.digitalocean.com/products/app-platform/
- **Pricing Calculator**: https://www.digitalocean.com/pricing

---

*Deploy with confidence using DigitalOcean App Platform and Package Installer CLI! 🌊*
