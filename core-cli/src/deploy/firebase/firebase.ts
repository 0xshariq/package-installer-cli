import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface FirebaseConfig {
  projectId: string;
  deploymentType: 'hosting' | 'functions' | 'firestore' | 'storage';
  buildDir?: string;
}

export async function deployToFirebase(): Promise<void> {
  console.log(chalk.blue('🔥 Starting Firebase deployment...'));

  // Check if Firebase CLI is installed
  if (!isFirebaseInstalled()) {
    console.log(chalk.red('❌ Firebase CLI is not installed.'));
    console.log(chalk.yellow('📥 Please install it from: https://firebase.google.com/docs/cli'));
    console.log(chalk.gray('Installation command:'));
    console.log(chalk.gray('  npm install -g firebase-tools'));
    return;
  }

  // Check authentication
  if (!isFirebaseAuthenticated()) {
    console.log(chalk.yellow('🔐 You need to authenticate with Firebase first.'));
    console.log(chalk.blue('Running: firebase login'));
    try {
      execSync('firebase login', { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('❌ Authentication failed.'));
      return;
    }
  }

  const config = await getFirebaseConfig();
  
  try {
    await deployProject(config);
    console.log(chalk.green('✅ Successfully deployed to Firebase!'));
  } catch (error) {
    console.log(chalk.red('❌ Deployment failed:'), error);
  }
}

function isFirebaseInstalled(): boolean {
  try {
    execSync('firebase --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isFirebaseAuthenticated(): boolean {
  try {
    const result = execSync('firebase projects:list', { encoding: 'utf8', stdio: 'pipe' });
    return !result.includes('not logged in');
  } catch {
    return false;
  }
}

async function getFirebaseConfig(): Promise<FirebaseConfig> {
  // Get available projects
  let projects: string[] = [];
  try {
    const projectsOutput = execSync('firebase projects:list --json', { encoding: 'utf8', stdio: 'pipe' });
    const projectsData = JSON.parse(projectsOutput);
    projects = projectsData.map((p: any) => p.projectId);
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not fetch projects. You may need to create one.'));
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'deploymentType',
      message: 'Select Firebase deployment type:',
      choices: [
        { name: 'Hosting - Static web hosting', value: 'hosting' },
        { name: 'Functions - Serverless functions', value: 'functions' },
        { name: 'Firestore - NoSQL database', value: 'firestore' },
        { name: 'Storage - File storage', value: 'storage' }
      ]
    },
    {
      type: projects.length > 0 ? 'list' : 'input',
      name: 'projectId',
      message: projects.length > 0 ? 'Select a Firebase project:' : 'Enter your Firebase project ID:',
      choices: projects.length > 0 ? projects : undefined,
      validate: (input: string) => input.trim().length > 0 || 'Project ID is required'
    },
    {
      type: 'input',
      name: 'buildDir',
      message: 'Enter build directory (for hosting):',
      default: detectBuildDir(),
      when: (answers) => answers.deploymentType === 'hosting'
    }
  ]);

  return answers;
}

function detectBuildDir(): string {
  if (fs.existsSync('dist')) return 'dist';
  if (fs.existsSync('build')) return 'build';
  if (fs.existsSync('public')) return 'public';
  return 'dist';
}

async function deployProject(config: FirebaseConfig): Promise<void> {
  console.log(chalk.blue(`📦 Deploying to Firebase ${config.deploymentType}...`));

  // Initialize Firebase if not already done
  if (!fs.existsSync('firebase.json')) {
    console.log(chalk.blue('🔧 Initializing Firebase...'));
    await initializeFirebase(config);
  }

  // Set the project
  execSync(`firebase use ${config.projectId}`, { stdio: 'inherit' });

  switch (config.deploymentType) {
    case 'hosting':
      await deployToHosting(config);
      break;
    case 'functions':
      await deployToFunctions(config);
      break;
    case 'firestore':
      await deployToFirestore(config);
      break;
    case 'storage':
      await deployToStorage(config);
      break;
  }
}

async function initializeFirebase(config: FirebaseConfig): Promise<void> {
  const firebaseConfig: any = {
    hosting: {
      public: config.buildDir || 'dist',
      ignore: [
        'firebase.json',
        '**/.*',
        '**/node_modules/**'
      ],
      rewrites: [
        {
          source: '**',
          destination: '/index.html'
        }
      ]
    }
  };

  if (config.deploymentType === 'functions') {
    firebaseConfig.functions = {
      source: 'functions',
      runtime: 'nodejs18'
    };
  }

  if (config.deploymentType === 'firestore') {
    firebaseConfig.firestore = {
      rules: 'firestore.rules',
      indexes: 'firestore.indexes.json'
    };
  }

  if (config.deploymentType === 'storage') {
    firebaseConfig.storage = {
      rules: 'storage.rules'
    };
  }

  fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
  console.log(chalk.green('📄 Created firebase.json'));

  // Create .firebaserc
  const firebaserc = {
    projects: {
      default: config.projectId
    }
  };
  fs.writeFileSync('.firebaserc', JSON.stringify(firebaserc, null, 2));
  console.log(chalk.green('📄 Created .firebaserc'));
}

async function deployToHosting(config: FirebaseConfig): Promise<void> {
  // Build the project if needed
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts?.build) {
      console.log(chalk.blue('🔨 Building project...'));
      execSync('npm run build', { stdio: 'inherit' });
    }
  }

  console.log(chalk.blue('🚀 Deploying to Firebase Hosting...'));
  execSync('firebase deploy --only hosting', { stdio: 'inherit' });
}

async function deployToFunctions(config: FirebaseConfig): Promise<void> {
  // Create functions directory if it doesn't exist
  if (!fs.existsSync('functions')) {
    fs.mkdirSync('functions');
    
    // Create basic function files
    const indexJs = `const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
`;

    const packageJsonContent = {
      name: 'functions',
      description: 'Cloud Functions for Firebase',
      scripts: {
        serve: 'firebase emulators:start --only functions',
        shell: 'firebase functions:shell',
        start: 'npm run shell',
        deploy: 'firebase deploy --only functions',
        logs: 'firebase functions:log'
      },
      engines: {
        node: '18'
      },
      main: 'index.js',
      dependencies: {
        'firebase-admin': '^11.8.0',
        'firebase-functions': '^4.3.1'
      },
      devDependencies: {
        'firebase-functions-test': '^3.1.0'
      },
      private: true
    };

    fs.writeFileSync('functions/index.js', indexJs);
    fs.writeFileSync('functions/package.json', JSON.stringify(packageJsonContent, null, 2));
    
    console.log(chalk.green('📄 Created functions directory with sample function'));
    console.log(chalk.blue('📦 Installing function dependencies...'));
    execSync('cd functions && npm install', { stdio: 'inherit' });
  }

  console.log(chalk.blue('🚀 Deploying to Firebase Functions...'));
  execSync('firebase deploy --only functions', { stdio: 'inherit' });
}

async function deployToFirestore(config: FirebaseConfig): Promise<void> {
  // Create firestore rules if they don't exist
  if (!fs.existsSync('firestore.rules')) {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users under any conditions
    // This rule set is useful for getting started, but it is configured to
    // expire after 30 days because it leaves your app open to attackers.
    // At that time, all client requests to your Firestore database will be denied.
    //
    // Make sure to write security rules for your app before that time, or else
    // your app will lose access to your Firestore database
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2024, 12, 31);
    }
  }
}`;
    fs.writeFileSync('firestore.rules', rules);
    console.log(chalk.green('📄 Created firestore.rules'));
  }

  // Create firestore indexes if they don't exist
  if (!fs.existsSync('firestore.indexes.json')) {
    const indexes = {
      indexes: [],
      fieldOverrides: []
    };
    fs.writeFileSync('firestore.indexes.json', JSON.stringify(indexes, null, 2));
    console.log(chalk.green('📄 Created firestore.indexes.json'));
  }

  console.log(chalk.blue('🚀 Deploying Firestore rules and indexes...'));
  execSync('firebase deploy --only firestore', { stdio: 'inherit' });
}

async function deployToStorage(config: FirebaseConfig): Promise<void> {
  // Create storage rules if they don't exist
  if (!fs.existsSync('storage.rules')) {
    const rules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;
    fs.writeFileSync('storage.rules', rules);
    console.log(chalk.green('📄 Created storage.rules'));
  }

  console.log(chalk.blue('🚀 Deploying Firebase Storage rules...'));
  execSync('firebase deploy --only storage', { stdio: 'inherit' });
}
