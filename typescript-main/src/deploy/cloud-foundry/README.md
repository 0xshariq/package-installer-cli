# Cloud Foundry Deployment

Deploy applications to Cloud Foundry, the open-source cloud application platform that provides a choice of clouds, developer frameworks, and application services.

## Prerequisites

### 1. Install Cloud Foundry CLI

**macOS:**
```bash
brew install cloudfoundry/tap/cf-cli@8
```

**Linux:**
```bash
wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -
echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list
sudo apt-get update && sudo apt-get install cf8-cli
```

**Windows:**
Download from: https://github.com/cloudfoundry/cli/releases

### 2. Authentication

```bash
cf login -a https://api.your-cf-foundation.com
```

## Usage

```bash
# Interactive deployment
pi deploy --platform cloud-foundry

# Or directly
pi deploy -p cloud-foundry
```

## Deployment Process

1. **API Endpoint Selection**: Choose CF foundation endpoint
2. **Organization & Space**: Target org and space
3. **Application Configuration**: Set name, memory, instances
4. **Buildpack Selection**: Choose or auto-detect buildpack
5. **Service Binding**: Create and bind services
6. **Manifest Generation**: Create manifest.yml
7. **Push Application**: Deploy to Cloud Foundry

## Configuration Files

### manifest.yml
Describes application deployment configuration.

```yaml
---
version: 1
applications:
- name: my-app
  memory: 512M
  instances: 1
  buildpack: nodejs_buildpack
  services:
    - my-postgres-db
  env:
    NODE_ENV: production
```

### Procfile
Optional process definition file.

```
web: npm start
worker: node worker.js
```

## Supported Platforms

### Popular CF Providers
- **Pivotal Web Services** (discontinued)
- **IBM Cloud Foundry**
- **SAP Cloud Platform**
- **VMware Tanzu Application Service**
- **Open Source CF Deployments**

## Buildpacks

Built-in buildpacks available:

- **nodejs_buildpack**: Node.js applications
- **python_buildpack**: Python applications  
- **java_buildpack**: Java applications
- **ruby_buildpack**: Ruby applications
- **go_buildpack**: Go applications
- **php_buildpack**: PHP applications
- **staticfile_buildpack**: Static files
- **dotnet_core_buildpack**: .NET Core applications

## Services

Common services in CF marketplaces:

### Databases
- **PostgreSQL**: `cf create-service postgresql shared-psql my-postgres`
- **MySQL**: `cf create-service mysql shared-mysql my-mysql`
- **MongoDB**: `cf create-service mongodb shared-vm my-mongo`

### Messaging
- **RabbitMQ**: `cf create-service rabbitmq shared-vm my-rabbit`
- **Redis**: `cf create-service redis shared-vm my-redis`

### Other Services
- **Elasticsearch**: For search and analytics
- **User Provided Services**: For external services

## Framework Support

### Node.js/Next.js
```json
{
  "engines": {
    "node": "18.x",
    "npm": "8.x"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

### Python
```
# requirements.txt
Flask==2.3.3
gunicorn==21.2.0

# runtime.txt
python-3.11
```

### Java
```xml
<!-- pom.xml -->
<properties>
    <java.version>17</java.version>
</properties>
```

### Ruby
```ruby
# Gemfile
ruby '3.2.0'
gem 'rails', '~> 7.0'
```

## Application Commands

### Basic Commands
```bash
# Target org and space
cf target -o myorg -s development

# Push application
cf push

# Check app status
cf app my-app

# View logs
cf logs my-app --recent
cf logs my-app # tail logs

# Scale application
cf scale my-app -i 3 -m 1G

# Restart application
cf restart my-app

# Stop/Start application
cf stop my-app
cf start my-app
```

### Service Commands
```bash
# List marketplace services
cf marketplace

# Create service
cf create-service postgresql shared-psql my-db

# Bind service to app
cf bind-service my-app my-db

# View service details
cf service my-db

# Create service key
cf create-service-key my-db my-key

# Delete service
cf delete-service my-db
```

### Environment & Configuration
```bash
# Set environment variables
cf set-env my-app NODE_ENV production

# View environment
cf env my-app

# Create user-provided service
cf create-user-provided-service my-external-api -p '{"url":"https://api.example.com","key":"secret"}'
```

## Blue-Green Deployment

Zero-downtime deployment pattern:

```bash
# Deploy new version
cf push my-app-green

# Test green version
cf map-route my-app-green your-domain.com --hostname my-app-temp

# Switch traffic
cf unmap-route my-app your-domain.com --hostname my-app
cf map-route my-app-green your-domain.com --hostname my-app

# Clean up old version
cf delete my-app
cf rename my-app-green my-app
```

## Health Checks

Configure health checks in manifest.yml:

```yaml
applications:
- name: my-app
  health-check-type: http
  health-check-http-endpoint: /health
  timeout: 60
```

## Monitoring & Logging

### Application Logs
```bash
# Recent logs
cf logs my-app --recent

# Tail logs
cf logs my-app

# Filter logs
cf logs my-app | grep ERROR
```

### Metrics
```bash
# App events
cf events my-app

# App usage
cf app my-app
```

### Third-party Monitoring
- New Relic
- AppDynamics
- Dynatrace
- DataDog

## Security

### Network Security
- Application security groups
- Private networking
- Service mesh integration

### Identity & Access
- UAA (User Account and Authentication)
- LDAP/SAML integration
- OAuth 2.0

### Compliance
- Platform-specific compliance features
- Audit logging
- Container security

## CI/CD Integration

### GitHub Actions
```yaml
name: Deploy to Cloud Foundry

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install CF CLI
        run: |
          curl -L "https://packages.cloudfoundry.org/stable?release=linux64-binary&version=v8" | tar -zx
          sudo mv cf8 /usr/local/bin/cf
          
      - name: Deploy to CF
        run: |
          cf login -a ${{ secrets.CF_API }} -u ${{ secrets.CF_USERNAME }} -p ${{ secrets.CF_PASSWORD }} -o ${{ secrets.CF_ORG }} -s ${{ secrets.CF_SPACE }}
          cf push
```

### GitLab CI
```yaml
stages:
  - deploy

deploy:
  stage: deploy
  image: governmentpaas/cf-cli
  script:
    - cf login -a $CF_API -u $CF_USERNAME -p $CF_PASSWORD -o $CF_ORG -s $CF_SPACE
    - cf push
  only:
    - main
```

## Multi-target Deployment

Deploy to multiple foundations:

```yaml
# manifest-staging.yml
applications:
- name: my-app-staging
  instances: 1
  memory: 256M

# manifest-production.yml  
applications:
- name: my-app
  instances: 3
  memory: 512M
```

```bash
# Deploy to staging
cf push -f manifest-staging.yml

# Deploy to production
cf push -f manifest-production.yml
```

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   ```bash
   # Check app logs
   cf logs my-app --recent
   
   # Check app events
   cf events my-app
   
   # SSH into app container
   cf ssh my-app
   ```

2. **Memory Issues**
   ```bash
   # Check memory usage
   cf app my-app
   
   # Scale memory
   cf scale my-app -m 1G
   ```

3. **Service Binding Issues**
   ```bash
   # Check service binding
   cf env my-app
   
   # Restage after binding
   cf restage my-app
   ```

### Debug Mode
```bash
# Enable debug logging
CF_TRACE=true cf push

# Or save to file
CF_TRACE=debug.log cf push
```

## Best Practices

1. **Use manifest.yml for configuration**
2. **Implement health checks**
3. **Use services for data persistence**
4. **Follow twelve-factor app principles**
5. **Use environment variables for configuration**
6. **Implement proper logging**
7. **Use blue-green deployments for zero downtime**
8. **Monitor application performance**
9. **Secure service credentials**
10. **Use appropriate buildpack versions**

## Getting Help

- Cloud Foundry Documentation: https://docs.cloudfoundry.org/
- CF CLI Documentation: https://cli.cloudfoundry.org/
- Community: https://cloudfoundry.org/community/
- Stack Overflow: Tag with `cloudfoundry`
