# Heroku Deployment

Deploy your applications to Heroku, the cloud application platform that enables developers to build, run, and scale applications.

## Prerequisites

### 1. Install Heroku CLI

**macOS:**
```bash
brew tap heroku/brew && brew install heroku
```

**Ubuntu/Debian:**
```bash
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
```

**Windows:**
Download from: https://cli-assets.heroku.com/heroku-x64.exe

### 2. Authentication

```bash
heroku login
```

### 3. Git Repository

Heroku requires a Git repository for deployment.

## Usage

```bash
# Interactive deployment
pi deploy --platform heroku

# Or directly
pi deploy -p heroku
```

## Deployment Process

1. **App Configuration**: Enter app name, stack, and region
2. **Buildpack Selection**: Choose appropriate buildpack or auto-detect
3. **Add-ons Selection**: Choose Heroku add-ons to provision
4. **Configuration Files**: Generate Procfile, app.json, and other configs
5. **Git Integration**: Add Heroku remote and deploy

## Configuration Files

### Procfile
Defines the commands that are executed by the app on startup.

```
web: npm start
```

### app.json
Describes the app for Heroku Button and Review Apps.

```json
{
  "name": "My App",
  "description": "Application deployed via Package Installer CLI",
  "repository": "https://github.com/yourusername/yourapp",
  "keywords": ["node", "express"],
  "stack": "heroku-22",
  "env": {
    "NODE_ENV": {
      "description": "Environment",
      "value": "production"
    }
  },
  "formation": {
    "web": {
      "quantity": 1
    }
  },
  "addons": ["heroku-postgresql:mini"]
}
```

## Framework Support

### Node.js/Next.js/React
- Automatic package.json detection
- Engine specification support
- Build script execution

### Python
- requirements.txt or Pipfile support
- runtime.txt for Python version
- Gunicorn for WSGI applications

### Ruby
- Gemfile detection
- Bundler integration
- Rack applications

### Java
- Maven and Gradle support
- JVM version selection

### Go
- Go module support
- Binary compilation

### PHP
- Composer support
- Apache/Nginx serving

## Heroku Stacks

- **heroku-22**: Ubuntu 22.04 (recommended)
- **heroku-20**: Ubuntu 20.04
- **container**: Docker-based deployment

## Add-ons

Common add-ons available:

- **Heroku Postgres**: PostgreSQL database
- **Heroku Redis**: Redis caching
- **Papertrail**: Log management
- **New Relic**: Application monitoring
- **SendGrid**: Email delivery

## Environment Variables

Set environment variables using:

```bash
heroku config:set NODE_ENV=production
heroku config:set API_KEY=your-secret-key
```

Or in the Heroku Dashboard under Settings > Config Vars.

## Custom Domains

Add custom domains:

```bash
heroku domains:add www.example.com
```

SSL certificates are automatically managed for custom domains.

## Scaling

Scale your application:

```bash
# Scale web dynos
heroku ps:scale web=2

# Scale worker processes
heroku ps:scale worker=1
```

## Monitoring

- **Heroku Metrics**: Built-in application metrics
- **Logs**: `heroku logs --tail`
- **Add-ons**: New Relic, DataDog, etc.

## Database

### PostgreSQL

```bash
# Create database
heroku addons:create heroku-postgresql:mini

# Access database
heroku pg:psql
```

### Redis

```bash
# Create Redis instance
heroku addons:create heroku-redis:mini

# Access Redis CLI
heroku redis:cli
```

## Deployment Commands

```bash
# Deploy current branch
git push heroku main

# Deploy specific branch
git push heroku feature-branch:main

# Deploy with build
git push heroku main --force

# View app
heroku open

# Check app status
heroku ps

# View logs
heroku logs --tail

# Run one-off commands
heroku run bash
heroku run rails console
```

## Review Apps

Automatically create apps for pull requests:

```json
{
  "environments": {
    "review": {
      "addons": ["heroku-postgresql:mini"],
      "buildpacks": [
        { "url": "heroku/nodejs" }
      ]
    }
  }
}
```

## Container Deployment

For Docker-based deployment:

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]
```

### Deploy
```bash
heroku stack:set container
git push heroku main
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy to Heroku

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: akhileshns/heroku-deploy@v3.12.14
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

## Pricing

- **Free Tier**: No longer available
- **Eco**: $5/month per dyno
- **Basic**: $7/month per dyno
- **Standard**: $25-$500/month per dyno
- **Performance**: Custom pricing

## Security

- **SSL/TLS**: Automatic SSL certificates
- **Private Spaces**: Network isolation
- **OAuth**: Heroku Connect integration
- **Shield**: Compliance and security features

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   heroku logs --tail
   
   # Clear build cache
   heroku plugins:install heroku-repo
   heroku repo:purge_cache
   ```

2. **Memory Issues**
   ```bash
   # Check memory usage
   heroku logs --tail | grep "Memory"
   
   # Scale to larger dyno
   heroku ps:scale web=1:standard-1x
   ```

3. **Database Connection Issues**
   ```bash
   # Check database URL
   heroku config:get DATABASE_URL
   
   # Reset database
   heroku pg:reset DATABASE_URL
   ```

### Getting Help

- Heroku Dev Center: https://devcenter.heroku.com/
- Support: https://help.heroku.com/
- Status: https://status.heroku.com/

## Best Practices

1. **Use environment variables for configuration**
2. **Keep secrets out of version control**
3. **Use add-ons for databases and caching**
4. **Monitor application performance**
5. **Set up proper logging**
6. **Use Review Apps for testing**
7. **Scale appropriately based on traffic**
8. **Implement health checks**
