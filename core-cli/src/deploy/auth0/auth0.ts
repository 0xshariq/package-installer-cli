import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface Auth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
  audience?: string;
  scope?: string;
}

export async function deployToAuth0(): Promise<void> {
  console.log(chalk.blue('🔐 Starting Auth0 configuration...'));

  // Check if Auth0 CLI is installed
  if (!isAuth0Installed()) {
    console.log(chalk.red('❌ Auth0 CLI is not installed.'));
    console.log(chalk.yellow('📥 Please install it from: https://github.com/auth0/auth0-cli'));
    console.log(chalk.gray('Installation commands:'));
    console.log(chalk.gray('  # macOS'));
    console.log(chalk.gray('  brew tap auth0/auth0-cli && brew install auth0'));
    console.log(chalk.gray('  # Linux'));
    console.log(chalk.gray('  curl -sSfL https://raw.githubusercontent.com/auth0/auth0-cli/main/install.sh | sh -s -- -b /usr/local/bin'));
    console.log(chalk.gray('  # Windows'));
    console.log(chalk.gray('  scoop bucket add auth0 https://github.com/auth0/scoop-auth0-cli.git'));
    console.log(chalk.gray('  scoop install auth0'));
    return;
  }

  // Check authentication
  if (!isAuth0Authenticated()) {
    console.log(chalk.yellow('🔐 You need to authenticate with Auth0 first.'));
    console.log(chalk.blue('Running: auth0 login'));
    try {
      execSync('auth0 login', { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('❌ Authentication failed.'));
      return;
    }
  }

  const config = await getAuth0Config();
  
  try {
    await configureAuth0(config);
    console.log(chalk.green('✅ Successfully configured Auth0!'));
  } catch (error) {
    console.log(chalk.red('❌ Configuration failed:'), error);
  }
}

function isAuth0Installed(): boolean {
  try {
    execSync('auth0 --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isAuth0Authenticated(): boolean {
  try {
    execSync('auth0 tenants list', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function getAuth0Config(): Promise<Auth0Config> {
  console.log(chalk.blue('🔧 Configuring Auth0 settings...'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'domain',
      message: 'Enter your Auth0 domain (e.g., myapp.auth0.com):',
      validate: (input: string) => {
        if (!input.trim()) return 'Domain is required';
        if (!input.includes('.auth0.com') && !input.includes('.')) {
          return 'Please enter a valid Auth0 domain';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'clientId',
      message: 'Enter your Auth0 Client ID:',
      validate: (input: string) => input.trim().length > 0 || 'Client ID is required'
    },
    {
      type: 'password',
      name: 'clientSecret',
      message: 'Enter your Auth0 Client Secret:',
      validate: (input: string) => input.trim().length > 0 || 'Client Secret is required'
    },
    {
      type: 'input',
      name: 'audience',
      message: 'Enter API Audience (optional, for API access):',
      default: ''
    },
    {
      type: 'input',
      name: 'scope',
      message: 'Enter default scopes (optional):',
      default: 'openid profile email'
    }
  ]);

  return answers;
}

async function configureAuth0(config: Auth0Config): Promise<void> {
  console.log(chalk.blue('⚙️  Configuring Auth0 application...'));

  // Detect framework and create appropriate configuration
  const framework = detectFramework();
  
  switch (framework) {
    case 'nextjs':
      await configureNextJsAuth0(config);
      break;
    case 'react':
      await configureReactAuth0(config);
      break;
    case 'angular':
      await configureAngularAuth0(config);
      break;
    case 'vue':
      await configureVueAuth0(config);
      break;
    case 'express':
      await configureExpressAuth0(config);
      break;
    default:
      await createGenericAuth0Config(config);
      break;
  }

  // Create .env file with Auth0 configuration
  await createEnvFile(config);
  
  console.log(chalk.green('📄 Auth0 configuration files created!'));
  console.log(chalk.blue('📖 Next steps:'));
  console.log(chalk.gray('1. Add your domain to Auth0 Dashboard > Applications > Settings > Allowed Callback URLs'));
  console.log(chalk.gray('2. Add your domain to Allowed Logout URLs'));
  console.log(chalk.gray('3. Configure CORS settings if needed'));
  console.log(chalk.yellow('4. Install required dependencies and restart your application'));
}

function detectFramework(): string {
  if (!fs.existsSync('package.json')) return 'generic';
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps.next) return 'nextjs';
  if (deps.react) return 'react';
  if (deps['@angular/core']) return 'angular';
  if (deps.vue) return 'vue';
  if (deps.express) return 'express';
  
  return 'generic';
}

async function configureNextJsAuth0(config: Auth0Config): Promise<void> {
  console.log(chalk.blue('⚛️  Configuring for Next.js...'));

  // Install Auth0 Next.js SDK
  console.log(chalk.blue('📦 Installing @auth0/nextjs-auth0...'));
  execSync('npm install @auth0/nextjs-auth0', { stdio: 'inherit' });

  // Create API route for Auth0
  const apiDir = 'pages/api/auth';
  if (!fs.existsSync('pages')) fs.mkdirSync('pages');
  if (!fs.existsSync('pages/api')) fs.mkdirSync('pages/api');
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);

  const authHandler = `import { handleAuth } from '@auth0/nextjs-auth0';

export default handleAuth();
`;

  fs.writeFileSync(`${apiDir}/[...auth0].js`, authHandler);
  console.log(chalk.green('📄 Created Auth0 API route'));

  // Create _app.js wrapper
  const appWrapper = `import React from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
`;

  if (!fs.existsSync('pages/_app.js')) {
    fs.writeFileSync('pages/_app.js', appWrapper);
    console.log(chalk.green('📄 Created _app.js with Auth0 UserProvider'));
  }

  // Create example usage component
  const exampleComponent = `import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Profile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    user && (
      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  );
}
`;

  fs.writeFileSync('components/Profile.js', exampleComponent);
  console.log(chalk.green('📄 Created example Profile component'));
}

async function configureReactAuth0(config: Auth0Config): Promise<void> {
  console.log(chalk.blue('⚛️  Configuring for React...'));

  // Install Auth0 React SDK
  console.log(chalk.blue('📦 Installing @auth0/auth0-react...'));
  execSync('npm install @auth0/auth0-react', { stdio: 'inherit' });

  // Create Auth0 provider wrapper
  const auth0Provider = `import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

const Auth0ProviderWithHistory = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "openid profile email"
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
`;

  fs.writeFileSync('src/auth/Auth0ProviderWithHistory.js', auth0Provider);
  console.log(chalk.green('📄 Created Auth0 provider wrapper'));

  // Create login/logout buttons component
  const authButtons = `import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button onClick={() => loginWithRedirect()}>
      Log In
    </button>
  );
};

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
      Log Out
    </button>
  );
};

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated && (
      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  );
};

export { LoginButton, LogoutButton, Profile };
`;

  if (!fs.existsSync('src/components')) fs.mkdirSync('src/components', { recursive: true });
  fs.writeFileSync('src/components/Auth.js', authButtons);
  console.log(chalk.green('📄 Created Auth components'));
}

async function configureExpressAuth0(config: Auth0Config): Promise<void> {
  console.log(chalk.blue('🚂 Configuring for Express.js...'));

  // Install Auth0 Express SDK
  console.log(chalk.blue('📦 Installing express-openid-connect...'));
  execSync('npm install express-openid-connect', { stdio: 'inherit' });

  // Create Auth0 middleware
  const auth0Middleware = `const { auth } = require('express-openid-connect');

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: \`https://\${process.env.AUTH0_DOMAIN}\`
};

module.exports = { auth, authConfig };
`;

  if (!fs.existsSync('middleware')) fs.mkdirSync('middleware');
  fs.writeFileSync('middleware/auth0.js', auth0Middleware);
  console.log(chalk.green('📄 Created Auth0 middleware'));

  // Create example routes
  const exampleRoutes = `const express = require('express');
const { requiresAuth } = require('express-openid-connect');
const router = express.Router();

// Public route
router.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// Protected route
router.get('/profile', requiresAuth(), (req, res) => {
  res.json(req.oidc.user);
});

module.exports = router;
`;

  if (!fs.existsSync('routes')) fs.mkdirSync('routes');
  fs.writeFileSync('routes/auth.js', exampleRoutes);
  console.log(chalk.green('📄 Created example auth routes'));
}

async function configureAngularAuth0(config: Auth0Config): Promise<void> {
  console.log(chalk.blue('🅰️  Configuring for Angular...'));

  // Install Auth0 Angular SDK
  console.log(chalk.blue('📦 Installing @auth0/auth0-angular...'));
  execSync('npm install @auth0/auth0-angular', { stdio: 'inherit' });

  console.log(chalk.yellow('📝 Manual configuration required for Angular:'));
  console.log(chalk.gray('1. Add AuthModule to your app.module.ts'));
  console.log(chalk.gray('2. Configure the Auth0 domain and clientId'));
  console.log(chalk.gray('3. Add AuthGuard to protect routes'));
}

async function configureVueAuth0(config: Auth0Config): Promise<void> {
  console.log(chalk.blue('💚 Configuring for Vue.js...'));

  // Install Auth0 Vue SDK
  console.log(chalk.blue('📦 Installing @auth0/auth0-vue...'));
  execSync('npm install @auth0/auth0-vue', { stdio: 'inherit' });

  console.log(chalk.yellow('📝 Manual configuration required for Vue:'));
  console.log(chalk.gray('1. Add Auth0 plugin to your main.js'));
  console.log(chalk.gray('2. Configure the Auth0 domain and clientId'));
  console.log(chalk.gray('3. Use authGuard for protected routes'));
}

async function createGenericAuth0Config(config: Auth0Config): Promise<void> {
  console.log(chalk.blue('⚙️  Creating generic Auth0 configuration...'));

  const configFile = `// Auth0 Configuration
const auth0Config = {
  domain: '${config.domain}',
  clientId: '${config.clientId}',
  ${config.audience ? `audience: '${config.audience}',` : ''}
  scope: '${config.scope || 'openid profile email'}'
};

module.exports = auth0Config;
`;

  fs.writeFileSync('auth0.config.js', configFile);
  console.log(chalk.green('📄 Created auth0.config.js'));
}

async function createEnvFile(config: Auth0Config): Promise<void> {
  const envContent = `# Auth0 Configuration
AUTH0_DOMAIN=${config.domain}
AUTH0_CLIENT_ID=${config.clientId}
AUTH0_CLIENT_SECRET=${config.clientSecret}
${config.audience ? `AUTH0_AUDIENCE=${config.audience}` : ''}
AUTH0_SCOPE=${config.scope || 'openid profile email'}

# For Next.js
NEXT_PUBLIC_AUTH0_DOMAIN=${config.domain}
NEXT_PUBLIC_AUTH0_CLIENT_ID=${config.clientId}
AUTH0_SECRET=${generateRandomString(32)}
AUTH0_BASE_URL=http://localhost:3000

# For React
REACT_APP_AUTH0_DOMAIN=${config.domain}
REACT_APP_AUTH0_CLIENT_ID=${config.clientId}
${config.audience ? `REACT_APP_AUTH0_AUDIENCE=${config.audience}` : ''}
`;

  // Append to existing .env or create new one
  if (fs.existsSync('.env')) {
    fs.appendFileSync('.env', '\n' + envContent);
    console.log(chalk.green('📄 Added Auth0 variables to existing .env file'));
  } else {
    fs.writeFileSync('.env', envContent);
    console.log(chalk.green('📄 Created .env file with Auth0 variables'));
  }

  // Create .env.example
  const envExampleContent = envContent.replace(/=.+$/gm, '=');
  fs.writeFileSync('.env.example', envExampleContent);
  console.log(chalk.green('📄 Created .env.example file'));
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
