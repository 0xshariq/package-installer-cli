# Google Cloud Deployment

Deploy your applications to Google Cloud Platform using the official Google Cloud CLI (`gcloud`).

## Supported Deployment Types

- **App Engine**: Serverless platform for web applications
- **Cloud Run**: Containerized applications with automatic scaling
- **Cloud Functions**: Serverless functions for event-driven workloads
- **Firebase Hosting**: Static web hosting with global CDN

## Prerequisites

### 1. Install Google Cloud CLI

This CLI will automatically install the google-cloud cli<br>
You don't have to manually install the google-cloud cli <br>
If any error occurs then you can install manually

**macOS:**
```bash
brew install google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Windows:**
Download from: https://cloud.google.com/sdk/docs/install

### 2. Authentication

```bash
gcloud auth login
gcloud init
```

### 3. Enable APIs

```bash
# For App Engine
gcloud services enable appengine.googleapis.com

# For Cloud Run
gcloud services enable run.googleapis.com

# For Cloud Functions
gcloud services enable cloudfunctions.googleapis.com

# For Firebase Hosting
gcloud services enable firebase.googleapis.com
```

## Usage

```bash
# Interactive deployment
pi deploy --platform google-cloud

# Or directly
pi deploy -p google-cloud
```

## Deployment Process

1. **Platform Selection**: Choose between App Engine, Cloud Run, Cloud Functions, or Firebase Hosting
2. **Project Configuration**: Select or specify Google Cloud project
3. **Region Selection**: Choose deployment region
4. **Service Configuration**: Set service name and parameters
5. **Automatic Configuration**: Generate platform-specific config files
6. **Build & Deploy**: Build and deploy using gcloud CLI

## Configuration Files

### App Engine (`app.yaml`)
```yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production

automatic_scaling:
  min_instances: 0
  max_instances: 10
```

### Cloud Run (Dockerfile)
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

### Cloud Functions
For Node.js projects, the tool will automatically deploy the main function with HTTP trigger.

### Firebase Hosting
Requires `firebase.json` configuration file which will be created automatically.

## Framework Support

### Next.js
- Automatic detection and configuration
- Server-side rendering support
- Static export for hosting

### React
- Build optimization
- Static hosting configuration
- Nginx serving for production

### Express.js
- Container deployment via Cloud Run
- Environment variable management
- Health check endpoints

### Other Frameworks
Generic Node.js and containerized deployment support.

## Environment Variables

Set environment variables in Google Cloud:

```bash
# App Engine
gcloud app deploy --set-env-vars="NODE_ENV=production,API_KEY=your-key"

# Cloud Run
gcloud run deploy --set-env-vars="NODE_ENV=production,API_KEY=your-key"

# Cloud Functions
gcloud functions deploy myFunction --set-env-vars="NODE_ENV=production"
```

## Custom Domains

### App Engine
```bash
gcloud app domain-mappings create your-domain.com
```

### Cloud Run
```bash
gcloud run domain-mappings create --service=your-service --domain=your-domain.com
```

## Monitoring & Logging

- **Cloud Logging**: Automatic log collection
- **Cloud Monitoring**: Performance metrics
- **Error Reporting**: Automatic error tracking
- **Cloud Trace**: Request tracing

Access via Google Cloud Console or CLI:
```bash
gcloud logging read "resource.type=gae_app"
gcloud logging read "resource.type=cloud_run_revision"
```

## Pricing

- **App Engine**: Pay per instance hour, automatic scaling
- **Cloud Run**: Pay per request and compute time
- **Cloud Functions**: Pay per invocation and compute time
- **Firebase Hosting**: Free tier available, pay for bandwidth

## Security

- **IAM**: Identity and Access Management
- **VPC**: Virtual Private Cloud networking
- **SSL/TLS**: Automatic HTTPS certificates
- **Security Scanner**: Vulnerability scanning

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```bash
   gcloud auth list
   gcloud auth login
   ```

2. **Permission Denied**
   ```bash
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="user:your-email@domain.com" \
     --role="roles/editor"
   ```

3. **Build Failures**
   - Check build configuration in `app.yaml` or `Dockerfile`
   - Verify Node.js version compatibility
   - Check for missing dependencies

4. **Deployment Timeout**
   - Increase timeout settings
   - Optimize build process
   - Check resource limits

### Getting Help

- Google Cloud Documentation: https://cloud.google.com/docs
- Community Support: https://cloud.google.com/support/community
- Stack Overflow: Tag with `google-cloud-platform`

## Best Practices

1. **Use environment-specific projects**
2. **Enable audit logging**
3. **Set up monitoring and alerting**
4. **Implement proper error handling**
5. **Use Cloud Build for CI/CD**
6. **Secure sensitive data with Secret Manager**
7. **Implement health checks**
8. **Use Cloud CDN for static assets**
