# AWS Deployment ☁️

Deploy your applications to Amazon Web Services with comprehensive support for S3 static hosting, Lambda functions, and more.

## Overview

The Package Installer CLI provides a wrapper around the official AWS CLI, enabling seamless deployment to various AWS services. When you run `pi deploy` and select AWS, the CLI offers multiple deployment options:

- **S3 Static Website Hosting** - For static sites and SPAs
- **S3 + CloudFront** - Global CDN distribution
- **Lambda Functions** - Serverless compute
- **Elastic Beanstalk** - Application platform

## Quick Start

```bash
# Interactive deployment - shows platform selection
pi deploy
```

**Platform Selection Interface:**
```
? Select deployment platform:
  🔺 Vercel - Frontend and fullstack applications
❯ ☁️ AWS - S3 static sites and Lambda functions  
  📚 GitHub Pages - Static sites and documentation
```

```bash
# Direct AWS deployment  
pi deploy --platform aws

# List all available platforms
pi deploy --list
```## Prerequisites

### AWS CLI Installation
The AWS CLI must be installed and configured. The Package Installer CLI will guide you if it's missing:

**Official AWS CLI Installation:**

**Linux:**
```bash
# Download and install AWS CLI v2 (Official)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

**macOS:**
```bash
# Download and install AWS CLI v2 (Official)
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Verify installation
aws --version
```

**Windows:**
```bash
# Download and install AWS CLI v2 (Official)
# Visit: https://awscli.amazonaws.com/AWSCLIV2.msi
# Or use chocolatey:
choco install awscli

# Verify installation
aws --version
```

**Official Links:**
- **Linux Installation**: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#cliv2-linux-install
- **macOS Installation**: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#cliv2-macos-install
- **Windows Installation**: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#cliv2-windows-install
- **AWS CLI Documentation**: https://docs.aws.amazon.com/cli/

### AWS Account Setup
1. Create an AWS account at https://aws.amazon.com
2. Create an IAM user with appropriate permissions
3. Generate access keys

### Configuration
```bash
# Configure AWS credentials
aws configure

# Enter your credentials:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: us-east-1
# Default output format: json
```

## Deployment Options

### S3 Static Website Hosting

Perfect for static sites, SPAs, and client-side applications.

**Supported Projects:**
- React, Vue, Angular applications
- Static HTML/CSS/JS sites
- Jekyll, Hugo, Gatsby sites
- Documentation sites

**Features:**
- Automatic bucket creation
- Static website configuration
- Public read access setup
- Fast global delivery

**Process:**
1. CLI creates S3 bucket (if doesn't exist)
2. Configures bucket for static website hosting
3. Uploads your build files
4. Sets up public access policies
5. Provides website URL

### S3 + CloudFront Distribution

Enhanced static hosting with global CDN, SSL, and custom domains.

**Benefits:**
- Global edge locations
- HTTPS/SSL certificates
- Custom domain support
- Enhanced security
- Better performance

**Status:** Coming Soon - Manual setup required for now

### Lambda Function Deployment

Deploy serverless functions to AWS Lambda.

**Supported Runtimes:**
- Node.js 18.x, 20.x
- Python 3.9, 3.10, 3.11
- Java, Go, .NET (via manual setup)

**Features:**
- Automatic function packaging
- Runtime detection
- Function updates
- Basic configuration

### Elastic Beanstalk

Full application platform for web applications.

**Status:** Coming Soon - Use EB CLI directly for now

## Detailed Deployment Guides

### S3 Static Website

#### Step 1: Prepare Your Project
```bash
# Build your project
npm run build
# or
yarn build
```

#### Step 2: Deploy
```bash
pi deploy --platform aws
# Select: S3 Static Website
# Enter bucket name: my-awesome-website
# Enter build directory: build (or dist)
```

#### Step 3: Access Your Site
Your site will be available at:
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

### Lambda Function Deployment

#### Step 1: Prepare Function
Create a simple function structure:
```javascript
// index.js
exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello from Lambda!',
            event: event
        })
    };
};
```

#### Step 2: Deploy
```bash
pi deploy --platform aws
# Select: Lambda Function
# Enter function name: my-lambda-function
# Select runtime: nodejs20.x
```

## AWS Services Integration

### S3 Configuration

**Bucket Policy for Public Website:**
```json
{
    "Version": "2012-10-17",  
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

**Website Configuration:**
- Index document: `index.html`
- Error document: `error.html`
- CORS configuration for APIs

### IAM Permissions

**Minimum S3 Deployment Permissions:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket",
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutBucketWebsite",
                "s3:PutBucketPolicy"
            ],
            "Resource": [
                "arn:aws:s3:::*",
                "arn:aws:s3:::*/*"
            ]
        }
    ]
}
```

**Lambda Deployment Permissions:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lambda:CreateFunction",
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration",
                "lambda:GetFunction",
                "iam:PassRole"
            ],
            "Resource": "*"
        }
    ]
}
```

## Environment Variables

### For Lambda Functions
```bash
# Set environment variables during deployment
aws lambda update-function-configuration \
    --function-name my-function \
    --environment Variables='{NODE_ENV=production,API_KEY=your-key}'
```

### For Static Sites
Environment variables must be built into your application during build time.

## Custom Domains

### S3 Static Website with Route 53
1. **Register Domain** in Route 53
2. **Create S3 Bucket** with domain name
3. **Configure DNS** records
4. **Setup SSL** with CloudFront

### CloudFront Distribution
```bash
# Create CloudFront distribution (manual)
aws cloudfront create-distribution --distribution-config file://distribution-config.json
```

## Advanced Configuration

### Multiple Environments
```bash
# Development
aws configure set profile.dev.region us-west-2
pi deploy --platform aws --profile dev

# Production  
aws configure set profile.prod.region us-east-1
pi deploy --platform aws --profile prod
```

### Build Scripts Integration
```json
{
  "scripts": {
    "build": "react-scripts build",
    "deploy:aws": "npm run build && pi deploy --platform aws",
    "deploy:dev": "npm run build && aws s3 sync build/ s3://dev-bucket --delete",
    "deploy:prod": "npm run build && aws s3 sync build/ s3://prod-bucket --delete"
  }
}
```

## Monitoring & Logging

### CloudWatch Logs
```bash
# View Lambda logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/

# Stream logs
aws logs tail /aws/lambda/my-function --follow
```

### S3 Access Logs
```bash
# Enable S3 access logging
aws s3api put-bucket-logging \
    --bucket source-bucket \
    --bucket-logging-status file://logging.json
```

## Cost Optimization

### S3 Storage Classes
- **Standard** - Frequently accessed data
- **IA** - Infrequently accessed (>30 days)
- **Glacier** - Archive (>90 days)

### Lambda Cost Tips
- Right-size memory allocation
- Optimize function duration
- Use provisioned concurrency carefully
- Monitor with AWS Cost Explorer

## Troubleshooting

### Common S3 Issues

**403 Forbidden Error:**
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket your-bucket-name

# Verify public access settings
aws s3api get-public-access-block --bucket your-bucket-name
```

**Bucket Already Exists:**
```bash
# Check bucket in different regions
aws s3api list-buckets --query 'Buckets[?Name==`your-bucket-name`]'
```

### Lambda Issues

**Function Not Found:**
```bash
# List functions
aws lambda list-functions

# Check function details
aws lambda get-function --function-name your-function
```

**Permission Denied:**
```bash
# Check execution role
aws lambda get-function-configuration --function-name your-function
```

## Security Best Practices

### 1. IAM Least Privilege
- Use specific resource ARNs
- Limit actions to necessary ones
- Regular permission audits

### 2. S3 Security
- Enable versioning
- Use bucket encryption
- Configure CORS properly
- Regular access reviews

### 3. Lambda Security
- Use environment variables for secrets
- Enable VPC if needed
- Regular dependency updates
- Monitor function logs

## Pricing Guide

### S3 Static Website
- **Storage**: $0.023/GB/month
- **Requests**: $0.0004/1,000 requests
- **Data Transfer**: $0.09/GB (first 1GB free)

### Lambda Functions
- **Requests**: $0.20/1M requests
- **Duration**: $0.0000166667/GB-second
- **Free Tier**: 1M requests + 400,000 GB-seconds

### CloudFront (Optional)
- **Data Transfer**: $0.085/GB
- **Requests**: $0.0075/10,000 requests

## CLI Commands Reference

```bash
# AWS deployment options
pi deploy --platform aws

# Deploy with build step
pi deploy --platform aws --build

# Deploy with specific profile
AWS_PROFILE=production pi deploy --platform aws

# Deploy with environment variables
pi deploy --platform aws --env .env.production
```

## Example Deployments

### React Application
```bash
# Build and deploy React app
create-react-app my-app
cd my-app
npm run build
pi deploy --platform aws
# Select: S3 Static Website
```

### Node.js Lambda
```bash
# Deploy Lambda function
cd my-lambda-function
pi deploy --platform aws  
# Select: Lambda Function
```

### Vue.js SPA
```bash
# Deploy Vue application
vue create my-vue-app
cd my-vue-app
npm run build
pi deploy --platform aws
# Select: S3 Static Website
```

## Support & Resources

- **AWS Documentation**: https://docs.aws.amazon.com
- **AWS CLI Reference**: https://docs.aws.amazon.com/cli/
- **AWS Free Tier**: https://aws.amazon.com/free/
- **AWS Support**: https://aws.amazon.com/support/

## Migration Guides

### From Other Platforms
- **Netlify to AWS**: S3 + CloudFront setup
- **Vercel to AWS**: Lambda + API Gateway
- **GitHub Pages to AWS**: S3 static hosting

---

**Package Installer CLI** - Powering your AWS deployments! ☁️