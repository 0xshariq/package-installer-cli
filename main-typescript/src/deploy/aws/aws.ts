import { execSync, spawn } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

export interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function deployToAWS(): Promise<DeploymentResult> {
  try {
    console.log(chalk.cyan('☁️ Starting AWS deployment...\n'));

    // Check if AWS CLI is installed
    try {
      execSync('aws --version', { stdio: 'pipe' });
    } catch (error) {
      return {
        success: false,
        error: 'AWS CLI not found. Please install AWS CLI: https://aws.amazon.com/cli/'
      };
    }

    // Check if AWS is configured
    try {
      execSync('aws sts get-caller-identity', { stdio: 'pipe' });
    } catch (error) {
      console.log(chalk.yellow('🔐 AWS credentials not configured. Please configure...'));
      console.log(chalk.blue('Run: aws configure'));
      return {
        success: false,
        error: 'AWS credentials not configured. Run "aws configure" to set up credentials.'
      };
    }

    // Choose deployment type
    const { deploymentType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'deploymentType',
        message: 'Select AWS deployment type:',
        choices: [
          { name: 'S3 Static Website', value: 's3-static' },
          { name: 'S3 + CloudFront Distribution', value: 's3-cloudfront' },
          { name: 'Lambda Function', value: 'lambda' },
          { name: 'Elastic Beanstalk', value: 'beanstalk' }
        ]
      }
    ]);

    switch (deploymentType) {
      case 's3-static':
        return await deployToS3Static();
      case 's3-cloudfront':
        return await deployToS3CloudFront();
      case 'lambda':
        return await deployToLambda();
      case 'beanstalk':
        return await deployToBeanstalk();
      default:
        return {
          success: false,
          error: 'Invalid deployment type selected'
        };
    }

  } catch (error) {
    return {
      success: false,
      error: `AWS deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployToS3Static(): Promise<DeploymentResult> {
  try {
    const { bucketName, buildDir } = await inquirer.prompt([
      {
        type: 'input',
        name: 'bucketName',
        message: 'Enter S3 bucket name:',
        validate: (input) => input.length > 0 || 'Bucket name is required'
      },
      {
        type: 'input',
        name: 'buildDir',
        message: 'Enter build directory:',
        default: 'build'
      }
    ]);

    const buildPath = path.join(process.cwd(), buildDir);
    if (!fs.existsSync(buildPath)) {
      return {
        success: false,
        error: `Build directory "${buildDir}" not found. Please build your project first.`
      };
    }

    console.log(chalk.cyan('📦 Creating S3 bucket (if not exists)...'));
    try {
      execSync(`aws s3 mb s3://${bucketName}`, { stdio: 'pipe' });
    } catch (error) {
      // Bucket might already exist, continue
    }

    console.log(chalk.cyan('🌐 Configuring bucket for static website hosting...'));
    execSync(`aws s3 website s3://${bucketName} --index-document index.html --error-document error.html`, { stdio: 'inherit' });

    console.log(chalk.cyan('📤 Uploading files to S3...'));
    execSync(`aws s3 sync ${buildPath} s3://${bucketName} --delete`, { stdio: 'inherit' });

    console.log(chalk.cyan('🔓 Setting bucket policy for public read...'));
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`
        }
      ]
    };

    const policyFile = path.join(process.cwd(), 'temp-bucket-policy.json');
    fs.writeJsonSync(policyFile, bucketPolicy);
    execSync(`aws s3api put-bucket-policy --bucket ${bucketName} --policy file://${policyFile}`, { stdio: 'pipe' });
    fs.removeSync(policyFile);

    const websiteUrl = `http://${bucketName}.s3-website-us-east-1.amazonaws.com`;
    console.log(chalk.green('✅ Successfully deployed to S3!'));

    return {
      success: true,
      url: websiteUrl
    };

  } catch (error) {
    return {
      success: false,
      error: `S3 deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployToS3CloudFront(): Promise<DeploymentResult> {
  console.log(chalk.yellow('🚧 CloudFront deployment requires additional setup...'));
  console.log(chalk.blue('Please use AWS Console or CDK for CloudFront distribution setup.'));
  
  return {
    success: false,
    error: 'CloudFront deployment not yet implemented. Use S3 static deployment for now.'
  };
}

async function deployToLambda(): Promise<DeploymentResult> {
  try {
    const { functionName, runtime } = await inquirer.prompt([
      {
        type: 'input',
        name: 'functionName',
        message: 'Enter Lambda function name:',
        validate: (input) => input.length > 0 || 'Function name is required'
      },
      {
        type: 'list',
        name: 'runtime',
        message: 'Select Lambda runtime:',
        choices: [
          'nodejs18.x',
          'nodejs20.x',
          'python3.9',
          'python3.10',
          'python3.11'
        ]
      }
    ]);

    // Check for deployment package
    const zipFile = 'function.zip';
    if (!fs.existsSync(zipFile)) {
      console.log(chalk.yellow('📦 Creating deployment package...'));
      execSync(`zip -r ${zipFile} . -x "node_modules/*" "*.git*" "*.zip"`, { stdio: 'inherit' });
    }

    console.log(chalk.cyan('🚀 Deploying Lambda function...'));
    try {
      // Try to update existing function
      execSync(`aws lambda update-function-code --function-name ${functionName} --zip-file fileb://${zipFile}`, { stdio: 'inherit' });
    } catch (error) {
      // Function doesn't exist, create it
      execSync(`aws lambda create-function --function-name ${functionName} --runtime ${runtime} --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role --handler index.handler --zip-file fileb://${zipFile}`, { stdio: 'inherit' });
    }

    console.log(chalk.green('✅ Successfully deployed Lambda function!'));
    return {
      success: true,
      url: `Lambda function: ${functionName}`
    };

  } catch (error) {
    return {
      success: false,
      error: `Lambda deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function deployToBeanstalk(): Promise<DeploymentResult> {
  console.log(chalk.yellow('🚧 Elastic Beanstalk deployment requires EB CLI...'));
  console.log(chalk.blue('Please install EB CLI: pip install awsebcli'));
  
  return {
    success: false,
    error: 'Elastic Beanstalk deployment not yet implemented. Please use EB CLI directly.'
  };
}