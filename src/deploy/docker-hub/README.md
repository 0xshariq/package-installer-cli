# 🐳 Docker Hub Deployment

Deploy your containerized applications to Docker Hub using the Package Installer CLI.

## 🌟 Overview

Docker Hub deployment allows you to:
- 📦 Build and push Docker images
- 🔄 Automated container deployments
- 🌍 Multi-platform container support
- 🔐 Secure image registry
- 📊 Image analytics and insights

## 🚀 Quick Deploy

Run the Package Installer CLI deploy command and select Docker Hub:

```bash
pi deploy
```

When prompted, select:
```
? Select deployment platform: 
  🔺 Vercel - Frontend and fullstack applications
  ☁️ AWS - S3 static sites and Lambda functions  
  📚 GitHub Pages - Static sites and documentation
❯ 🐳 Docker Hub - Container registry and deployment
  🌊 DigitalOcean - App Platform and container registry
  ☁️ Cloudflare - Pages, Workers, and Workers Sites
```

Or deploy directly:
```bash
pi deploy --platform docker-hub
```

## 📋 Prerequisites

### Docker Installation

Docker must be installed on your system:

**Official Docker Installation:**
- 📖 **Documentation**: https://docs.docker.com/get-docker/
- 🐧 **Linux**: https://docs.docker.com/engine/install/
- 🍎 **macOS**: https://docs.docker.com/desktop/mac/install/
- 🪟 **Windows**: https://docs.docker.com/desktop/windows/install/

### Docker Hub Account

- Create account at https://hub.docker.com/
- Have your username and password ready

## 🔧 Configuration

### 1. Dockerfile

The deployment process will help you create a Dockerfile if one doesn't exist:

#### Node.js Application
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### React Static Site
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Python Application
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]
```

### 2. Authentication

Login to Docker Hub:
```bash
docker login
```

Or the CLI will prompt you during deployment.

## 🚀 Deployment Process

### Interactive Deployment

1. **Start Deployment**
   ```bash
   pi deploy --platform docker-hub
   ```

2. **Docker Hub Login** (if not already logged in)
   - Enter your Docker Hub username
   - Enter your password or access token

3. **Configure Repository**
   - Enter Docker Hub username
   - Enter repository name
   - Choose image tag (default: latest)

4. **Dockerfile Creation** (if needed)
   - Select your application framework
   - CLI generates appropriate Dockerfile

5. **Build and Push**
   - Docker image is built locally
   - Image is pushed to Docker Hub
   - Deployment URL is provided

### Example Deployment Flow

```bash
$ pi deploy --platform docker-hub

🐳 Starting Docker Hub deployment...

? Enter your Docker Hub username: myusername
? Enter repository name: my-awesome-app
? Enter image tag: v1.0.0

🔨 Building Docker image...
📤 Pushing image to Docker Hub...

✅ Successfully deployed to Docker Hub!
🔗 URL: https://hub.docker.com/r/myusername/my-awesome-app
```

## 🎯 Use Cases

### Web Applications
- Node.js/Express servers
- React/Vue.js static sites
- Python Flask/Django apps
- Go web services

### Microservices
- API services
- Background workers
- Database services
- Message queues

### Development Environments
- Consistent dev environments
- CI/CD pipeline images
- Testing environments

## 🔧 Advanced Configuration

### Multi-stage Builds

For optimized production images:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables

Set build-time variables:

```dockerfile
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

ARG API_URL
ENV REACT_APP_API_URL=$API_URL
```

Build with arguments:
```bash
docker build --build-arg API_URL=https://api.example.com -t myapp .
```

### Image Optimization

1. **Use Alpine Images**
   ```dockerfile
   FROM node:18-alpine
   ```

2. **Multi-stage Builds**
   - Separate build and runtime stages
   - Reduce final image size

3. **Layer Caching**
   - Copy package files first
   - Install dependencies before copying code

4. **Ignore Files**
   Create `.dockerignore`:
   ```
   node_modules
   npm-debug.log
   .git
   .gitignore
   README.md
   .env
   coverage
   .nyc_output
   ```

## 🔍 Troubleshooting

### Common Issues

#### Docker Not Running
```bash
# Error: Cannot connect to Docker daemon
# Solution: Start Docker Desktop or Docker daemon
systemctl start docker  # Linux
# Or start Docker Desktop app
```

#### Authentication Failed
```bash
# Error: Authentication required
# Solution: Login to Docker Hub
docker login

# Or use access token instead of password
```

#### Build Failures
```bash
# Check Dockerfile syntax
docker build --no-cache -t test-image .

# Verify base image exists
docker pull node:18-alpine

# Check build context
ls -la  # Ensure all required files are present
```

#### Push Failures
```bash
# Error: denied: requested access to the resource is denied
# Solution: Verify repository name and permissions
docker tag local-image username/repository-name:tag
docker push username/repository-name:tag
```

### Image Size Issues

```bash
# Check image size
docker images

# Analyze layers
docker history username/repository-name:tag

# Use dive for detailed analysis
dive username/repository-name:tag
```

## 📚 Best Practices

### Security
- Use non-root users in containers
- Keep base images updated
- Scan images for vulnerabilities
- Use minimal base images (Alpine)

### Performance
- Optimize layer caching
- Use multi-stage builds
- Minimize image size
- Use specific version tags

### Maintainability
- Document Dockerfile
- Use consistent naming conventions
- Version your images properly
- Keep Dockerfiles simple

## 🌐 Integration

### CI/CD Pipelines

#### GitHub Actions
```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy with Package Installer CLI
        run: |
          npm install -g @0xshariq/package-installer
          pi deploy --platform docker-hub
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
```

#### GitLab CI
```yaml
docker-deploy:
  stage: deploy
  script:
    - npm install -g @0xshariq/package-installer
    - pi deploy --platform docker-hub
  variables:
    DOCKER_USERNAME: $DOCKER_USERNAME
    DOCKER_PASSWORD: $DOCKER_PASSWORD
```

### Container Orchestration

After deploying to Docker Hub, you can use the image with:

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    image: username/my-app:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

#### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: username/my-app:latest
        ports:
        - containerPort: 3000
```

## 🎉 Next Steps

After deploying to Docker Hub:

1. **Monitor Usage**
   - Check pull statistics
   - Monitor image analytics
   - Review security scan results

2. **Automate Updates**
   - Set up automated builds
   - Configure webhooks
   - Implement rolling updates

3. **Scale Deployment**
   - Use container orchestration
   - Implement load balancing
   - Configure auto-scaling

4. **Enhance Security**
   - Regular security scans
   - Update base images
   - Implement image signing

## 🔗 Resources

- **Docker Hub**: https://hub.docker.com/
- **Docker Documentation**: https://docs.docker.com/
- **Dockerfile Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Docker Security**: https://docs.docker.com/engine/security/

---

*Deploy with confidence using Docker Hub and Package Installer CLI! 🐳*
