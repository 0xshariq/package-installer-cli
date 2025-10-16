# Serverless Framework Deployment

Deploy serverless applications to multiple cloud providers using the Serverless Framework.

## Supported Providers

- **AWS**: Lambda functions, API Gateway, DynamoDB, S3
- **Azure**: Azure Functions, Cosmos DB, Storage
- **Google Cloud**: Cloud Functions, Firestore, Cloud Storage
- **Cloudflare**: Cloudflare Workers

## Prerequisites

### 1. Install Serverless Framework

This CLI will automatically install the serverless cli<br>
You don't have to manually install the serverless cli <br>
If any error occurs then you can install manually
```bash
npm install -g serverless
```

### 2. Cloud Provider CLI

**AWS**:
```bash
# Install AWS CLI
aws configure
```

**Azure**:
```bash
# Install Azure CLI  
az login
```

**Google Cloud**:
```bash
# Install gcloud CLI
gcloud auth login
```

**Cloudflare**:
```bash
# Get API token from Cloudflare Dashboard
export CLOUDFLARE_API_TOKEN=your-token
```

## Usage

```bash
# Interactive deployment
pi deploy --platform serverless

# Or directly
pi deploy -p serverless
```

## Deployment Process

1. **Provider Selection**: Choose cloud provider (AWS, Azure, GCP, Cloudflare)
2. **Service Configuration**: Set service name and runtime
3. **Region Selection**: Choose deployment region
4. **Stage Configuration**: Set deployment stage (dev, staging, prod)
5. **Auto Configuration**: Generate serverless.yml and handler files
6. **Plugin Installation**: Install required Serverless plugins
7. **Deploy**: Deploy to selected cloud provider

## Configuration Files

### serverless.yml
```yaml
service: my-service

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}

functions:
  hello:
    handler: handler.hello
    events:
      - http:
          path: /hello
          method: get
          cors: true

  api:
    handler: handler.api
    events:
      - http:
          path: /api/{proxy+}
          method: ANY
          cors: true
```

### handler.js
```javascript
'use strict';

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message: 'Hello from Serverless!',
      input: event,
    }),
  };
};
```

## Framework Support

### Express.js with Serverless
```yaml
functions:
  app:
    handler: handler.server
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-http
```

```javascript
const serverless = require('serverless-http');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.json({ message: 'Hello from Express!' }));

module.exports.server = serverless(app);
```

### Next.js with Serverless
```yaml
functions:
  nextjs:
    handler: handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY

plugins:
  - serverless-nextjs-plugin
```

## Provider-Specific Features

### AWS
- **Lambda Functions**: Event-driven compute
- **API Gateway**: REST and WebSocket APIs
- **DynamoDB**: NoSQL database
- **S3**: Object storage
- **CloudWatch**: Monitoring and logs

### Azure
- **Azure Functions**: Event-driven serverless compute
- **Cosmos DB**: Multi-model database
- **Storage**: Blob, queue, and table storage
- **Application Insights**: Monitoring

### Google Cloud
- **Cloud Functions**: Event-driven functions
- **Firestore**: NoSQL document database  
- **Cloud Storage**: Object storage
- **Cloud Monitoring**: Observability

### Cloudflare
- **Workers**: Edge computing platform
- **KV Storage**: Key-value storage
- **Durable Objects**: Stateful serverless

## Environment Variables

### Local Development
```yaml
provider:
  environment:
    NODE_ENV: ${opt:stage, 'dev'}
    API_KEY: ${env:API_KEY}
    DATABASE_URL: ${env:DATABASE_URL}
```

### Per Stage Configuration
```yaml
custom:
  stages:
    dev:
      DATABASE_URL: dev-db-url
    prod:
      DATABASE_URL: prod-db-url

provider:
  environment:
    DATABASE_URL: ${self:custom.stages.${opt:stage}.DATABASE_URL}
```

## Plugins

### Popular Plugins
```yaml
plugins:
  - serverless-offline          # Local development
  - serverless-webpack          # Bundle with Webpack
  - serverless-typescript       # TypeScript support
  - serverless-domain-manager   # Custom domains
  - serverless-plugin-warmup    # Keep functions warm
```

### Installation
```bash
npm install serverless-offline --save-dev
```

## Local Development

### Serverless Offline
```bash
# Install plugin
npm install serverless-offline --save-dev

# Run locally
serverless offline start
```

### Testing Functions
```bash
# Invoke function locally
serverless invoke local --function hello

# With data
serverless invoke local --function hello --data '{"name": "world"}'
```

## Deployment Commands

```bash
# Deploy all functions
serverless deploy

# Deploy single function
serverless deploy function --function hello

# Deploy to specific stage
serverless deploy --stage prod

# Deploy with verbose logging
serverless deploy --verbose
```

## Monitoring & Logging

### AWS CloudWatch
```bash
# View logs
serverless logs --function hello

# Tail logs
serverless logs --function hello --tail
```

### Metrics
```yaml
provider:
  tracing:
    lambda: true
    
custom:
  alerts:
    - functionErrors
    - functionDuration
```

## Security

### IAM Roles (AWS)
```yaml
provider:
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:GetItem
        - dynamodb:PutItem
      Resource: "arn:aws:dynamodb:region:account:table/MyTable"
```

### VPC Configuration
```yaml
provider:
  vpc:
    securityGroupIds:
      - sg-12345678
    subnetIds:
      - subnet-12345678
      - subnet-87654321
```

## Custom Domains

```yaml
plugins:
  - serverless-domain-manager

custom:
  customDomain:
    domainName: api.example.com
    basePath: v1
    stage: ${self:provider.stage}
    createRoute53Record: true
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Deploy Serverless

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: serverless deploy --stage prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Best Practices

1. **Use environment variables for configuration**
2. **Implement proper error handling**
3. **Set up monitoring and alerting**
4. **Use stages for different environments**
5. **Keep functions small and focused**
6. **Implement proper logging**
7. **Use plugins for common functionality**
8. **Set up CI/CD pipelines**
9. **Monitor cold starts and optimize**
10. **Implement proper security practices**

## Troubleshooting

### Common Issues

1. **Deployment Timeout**
   - Increase timeout in serverless.yml
   - Check function memory allocation
   - Optimize bundle size

2. **Cold Start Issues**
   - Use serverless-plugin-warmup
   - Optimize function initialization
   - Consider provisioned concurrency

3. **Permission Errors**
   - Check IAM roles and policies
   - Verify resource permissions
   - Review provider credentials

4. **Package Size Limits**
   - Use webpack or similar bundler
   - Exclude dev dependencies
   - Use layers for common dependencies

### Getting Help

- Serverless Documentation: https://www.serverless.com/framework/docs
- Community Forum: https://forum.serverless.com
- GitHub Issues: https://github.com/serverless/serverless
- Stack Overflow: Tag with `serverless-framework`

## Pricing

### Framework
- Open source and free
- Serverless Dashboard has paid plans for teams

### Cloud Provider Costs
- **AWS Lambda**: Pay per request and compute time
- **Azure Functions**: Consumption or premium plans
- **Google Cloud Functions**: Pay per invocation and compute time
- **Cloudflare Workers**: $5/month for 10M requests
