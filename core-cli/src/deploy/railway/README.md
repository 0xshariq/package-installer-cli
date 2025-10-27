# Railway Deployment

Deploy your applications to Railway, a modern app hosting platform with built-in CI/CD and infrastructure services.

## What Railway Provides

- **App Hosting**: Deploy web applications and APIs
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis
- **Environment Management**: Multiple environments per project
- **Auto-scaling**: Automatic scaling based on traffic
- **Custom Domains**: Connect your own domains
- **Metrics & Logging**: Built-in observability

## Prerequisites

### 1. Install Railway CLI
This CLI will automatically install the railway cli<br>
You don't have to manually install the railway cli <br>
If any error occurs then you can install manually

**macOS/Linux:**
```bash
curl -fsSL https://railway.app/install.sh | sh
```

**Windows:**
```bash
iwr https://railway.app/install.ps1 | iex
```

**npm:**
```bash
npm install -g @railway/cli
```

### 2. Authentication

```bash
railway login
```

### 3. Railway Account

Sign up at https://railway.app

## Usage

```bash
# Interactive deployment
pi deploy --platform railway

# Or directly
pi deploy -p railway
```

## Deployment Process

1. **Project Configuration**: Set project name and environment
2. **Framework Detection**: Automatically detect your framework
3. **Build/Start Commands**: Configure build and start commands
4. **Railway Initialization**: Initialize Railway project
5. **Configuration Files**: Generate railway.json and Procfile
6. **Environment Setup**: Configure environment variables
7. **Deploy**: Deploy to Railway

## Configuration Files

### railway.json
```json
{
  "build": {
    "command": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

### Procfile (for web services)
```
web: npm start
```

### Dockerfile (if needed)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Framework Support

### Next.js
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Features**: SSR, API routes, static optimization
- **Port**: Automatically detected from Next.js

### React (Create React App)
- **Build Command**: `npm run build`
- **Start Command**: `npx serve -s build`
- **Features**: Static hosting, SPA routing
- **Build Directory**: `build`

### Express.js
- **Start Command**: `npm start`
- **Features**: API hosting, middleware support
- **Environment**: Node.js runtime

### Vue.js
- **Build Command**: `npm run build`
- **Start Command**: `npx serve -s dist`
- **Features**: Vue CLI, Vite support
- **Build Directory**: `dist`

### Svelte/SvelteKit
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Features**: SSR, static generation
- **Adapter**: Node.js adapter

### Gatsby
- **Build Command**: `npm run build`
- **Start Command**: `npx serve -s public`
- **Features**: Static site generation
- **Build Directory**: `public`

### NestJS
- **Build Command**: `npm run build`
- **Start Command**: `npm run start:prod`
- **Features**: Decorators, dependency injection
- **TypeScript**: Full support

## Environment Variables

### Setting Variables
```bash
# Via CLI
railway variables set NODE_ENV=production
railway variables set API_KEY=your-api-key

# Via Railway Dashboard
# Go to project > Variables tab
```

### Environment Files
Railway automatically loads:
- `.env` (for all environments)
- `.env.production` (for production)

### Framework-Specific Variables

**Next.js:**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.example.com
```

**React:**
```env
REACT_APP_API_URL=https://api.example.com
GENERATE_SOURCEMAP=false
```

## Database Integration

### PostgreSQL
```bash
# Add PostgreSQL service
railway add postgresql

# Get connection URL
railway variables
```

### MySQL
```bash
# Add MySQL service
railway add mysql
```

### MongoDB
```bash
# Add MongoDB service
railway add mongodb
```

### Redis
```bash
# Add Redis service
railway add redis
```

### Connection Examples
```javascript
// PostgreSQL with Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// MongoDB with Mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);

// Redis
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});
```

## Custom Domains

### Add Domain
```bash
# Via CLI
railway domain add example.com

# Via Dashboard
# Go to project > Settings > Domains
```

### SSL Certificates
Railway automatically provides SSL certificates for all domains.

## Monitoring & Logs

### View Logs
```bash
# Real-time logs
railway logs

# Historical logs via Dashboard
# Go to project > Logs tab
```

### Metrics
Available in Railway Dashboard:
- CPU usage
- Memory usage
- Network traffic
- Response times
- Error rates

## Scaling

### Automatic Scaling
Railway automatically scales based on:
- CPU usage
- Memory usage
- Request volume

### Resource Limits
Configure in Railway Dashboard:
- Memory limits
- CPU limits
- Instance count

## Deployment Strategies

### Git Integration
```bash
# Connect GitHub repository
railway connect

# Auto-deploy on push
railway service update --auto-deploy=true
```

### Manual Deployment
```bash
# Deploy current directory
railway up

# Deploy specific directory
railway up --detach
```

### Branch Deployments
```bash
# Deploy from specific branch
railway up --branch feature-branch
```

## Networking

### Internal Communication
Services can communicate using internal DNS:
```
http://service-name.railway.internal:port
```

### Port Configuration
Railway automatically detects the port from:
- `PORT` environment variable
- Framework defaults
- Dockerfile EXPOSE

## Security

### HTTPS
- Automatic HTTPS for all deployments
- Custom domain SSL certificates
- HTTP to HTTPS redirects

### Environment Variables
- Encrypted at rest and in transit
- Service isolation
- Access controls

### Private Networking
- Internal service communication
- VPC-like isolation
- Network policies

## CI/CD Integration

### GitHub Actions
```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        
      - name: Deploy to Railway
        uses: railwayapp/railway-deploy@v1
        with:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### GitLab CI
```yaml
deploy:
  stage: deploy
  script:
    - curl -fsSL https://railway.app/install.sh | sh
    - railway login --token $RAILWAY_TOKEN
    - railway up
  only:
    - main
```

## Best Practices

1. **Use environment variables for configuration**
2. **Set up health checks for your services**
3. **Monitor resource usage and optimize**
4. **Use Railway's built-in databases**
5. **Implement proper logging**
6. **Set up custom domains for production**
7. **Use multiple environments (dev, staging, prod)**
8. **Keep Docker images lightweight**
9. **Use Railway's service mesh for inter-service communication**
10. **Implement proper error handling**

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build command in railway.json
   - Verify Node.js version compatibility
   - Check for missing dependencies

2. **Service Won't Start**
   - Verify start command
   - Check port configuration
   - Review application logs

3. **Database Connection Issues**
   - Verify DATABASE_URL environment variable
   - Check service connectivity
   - Review database logs

4. **Memory/CPU Limits**
   - Monitor resource usage
   - Optimize application performance
   - Increase resource limits if needed

### Getting Help

- Railway Documentation: https://docs.railway.app
- Discord Community: https://discord.gg/railway
- GitHub Issues: https://github.com/railwayapp/railway-cli
- Support: help@railway.app

## Pricing

### Hobby Plan (Free)
- $5 of usage credits monthly
- All core features
- Community support

### Pro Plan ($20/month)
- $20 of usage credits included
- Additional usage-based pricing
- Priority support
- Advanced metrics

### Usage-Based Pricing
- **CPU**: $0.000463 per vCPU minute
- **Memory**: $0.000231 per GB minute
- **Network**: $0.10 per GB egress
- **Storage**: $0.25 per GB month

## Migration from Other Platforms

### From Heroku
```bash
# Export Heroku config
heroku config --json > heroku-config.json

# Import to Railway
railway variables set KEY=value
```

### From Vercel
- Static sites: Direct deployment
- API routes: Convert to Express/Fastify
- Serverless functions: Refactor to traditional server

### From Netlify
- Static sites: Build and deploy normally
- Netlify Functions: Convert to API routes
- Forms: Use Railway's form handling or third-party service
