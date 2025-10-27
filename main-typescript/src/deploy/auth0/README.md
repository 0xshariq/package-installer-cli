# Auth0 Integration

Configure Auth0 authentication for your applications with framework-specific implementations.

## What is Auth0?

Auth0 is a flexible, drop-in solution to add authentication and authorization services to your applications. It provides:

- **Universal Login**: Centralized login experience
- **Social Connections**: Login with Google, Facebook, GitHub, etc.
- **Enterprise Connections**: SAML, LDAP, Active Directory
- **Multi-factor Authentication**: SMS, email, authenticator apps
- **User Management**: User profiles, roles, and permissions

## Prerequisites

### 1. Install Auth0 CLI

**macOS:**
```bash
brew tap auth0/auth0-cli && brew install auth0
```

**Linux:**
```bash
curl -sSfL https://raw.githubusercontent.com/auth0/auth0-cli/main/install.sh | sh -s -- -b /usr/local/bin
```

**Windows:**
```powershell
scoop bucket add auth0 https://github.com/auth0/scoop-auth0-cli.git
scoop install auth0
```

### 2. Create Auth0 Account

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new account or sign in
3. Create a new application
4. Note your Domain, Client ID, and Client Secret

### 3. Authentication

```bash
auth0 login
```

## Usage

```bash
# Interactive configuration
pi deploy --platform auth0

# Or directly
pi deploy -p auth0
```

## Configuration Process

1. **Domain Setup**: Enter your Auth0 domain (e.g., `myapp.auth0.com`)
2. **Application Credentials**: Provide Client ID and Client Secret
3. **Framework Detection**: Automatic detection of your framework
4. **SDK Installation**: Install appropriate Auth0 SDK
5. **Configuration Files**: Generate framework-specific configuration
6. **Environment Variables**: Create `.env` file with Auth0 settings

## Framework Support

### Next.js Integration

#### Installation
```bash
npm install @auth0/nextjs-auth0
```

#### Configuration

**API Route** (`pages/api/auth/[...auth0].js`):
```javascript
import { handleAuth } from '@auth0/nextjs-auth0';

export default handleAuth();
```

**App Wrapper** (`pages/_app.js`):
```javascript
import React from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
```

**Usage in Components**:
```javascript
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
```

### React Integration

#### Installation
```bash
npm install @auth0/auth0-react
```

#### Configuration

**Auth0 Provider**:
```javascript
import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

const Auth0ProviderWithHistory = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
```

**Login/Logout Components**:
```javascript
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  return <button onClick={() => loginWithRedirect()}>Log In</button>;
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

  if (isLoading) return <div>Loading ...</div>;

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
```

### Express.js Integration

#### Installation
```bash
npm install express-openid-connect
```

#### Configuration

**Middleware Setup**:
```javascript
const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`
};

app.use(auth(config));
```

**Protected Routes**:
```javascript
const { requiresAuth } = require('express-openid-connect');

app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.json(req.oidc.user);
});
```

### Angular Integration

#### Installation
```bash
npm install @auth0/auth0-angular
```

#### Configuration

**app.module.ts**:
```typescript
import { NgModule } from '@angular/core';
import { AuthModule } from '@auth0/auth0-angular';

@NgModule({
  imports: [
    AuthModule.forRoot({
      domain: 'YOUR_AUTH0_DOMAIN',
      clientId: 'YOUR_AUTH0_CLIENT_ID',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    }),
  ],
})
export class AppModule {}
```

**Component Usage**:
```typescript
import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-auth',
  template: `
    <button *ngIf="!(auth.isAuthenticated$ | async)" (click)="auth.loginWithRedirect()">
      Log in
    </button>
    <button *ngIf="auth.isAuthenticated$ | async" (click)="auth.logout()">
      Log out
    </button>
  `
})
export class AuthComponent {
  constructor(public auth: AuthService) {}
}
```

### Vue.js Integration

#### Installation
```bash
npm install @auth0/auth0-vue
```

#### Configuration

**main.js**:
```javascript
import { createApp } from 'vue';
import { createAuth0 } from '@auth0/auth0-vue';

const app = createApp(App);

app.use(
  createAuth0({
    domain: "YOUR_AUTH0_DOMAIN",
    clientId: "YOUR_AUTH0_CLIENT_ID",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })
);

app.mount('#app');
```

**Component Usage**:
```vue
<template>
  <div>
    <button v-if="!$auth0.isAuthenticated.value" @click="$auth0.loginWithRedirect()">
      Log in
    </button>
    <button v-if="$auth0.isAuthenticated.value" @click="$auth0.logout()">
      Log out
    </button>
  </div>
</template>
```

## Environment Variables

The tool automatically creates environment variables for your framework:

### Next.js
```env
AUTH0_SECRET=your-generated-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

### React
```env
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=your-api-audience
```

### Express.js
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_BASE_URL=http://localhost:3000
```

## Auth0 Dashboard Configuration

### Application Settings

1. **Allowed Callback URLs**: Add your application URLs
   - Development: `http://localhost:3000/api/auth/callback`
   - Production: `https://yourdomain.com/api/auth/callback`

2. **Allowed Logout URLs**: Add your logout redirect URLs
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

3. **Allowed Web Origins**: Add your application origins
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

### Social Connections

Enable social login providers:

1. Go to Authentication > Social
2. Enable desired providers (Google, Facebook, GitHub, etc.)
3. Configure provider settings with client credentials

### Rules and Hooks

Customize authentication flow:

```javascript
// Add custom claims to tokens
function addRolesToUser(user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  
  // Add role to the user
  const assignedRoles = (context.authorization || {}).roles;
  const idTokenClaims = context.idToken || {};
  
  idTokenClaims['https://myapp.com/roles'] = assignedRoles;
  context.idToken = idTokenClaims;
  
  callback(null, user, context);
}
```

## Security Best Practices

### 1. Use HTTPS in Production
Always use HTTPS for production applications.

### 2. Secure Client Secret
Never expose client secret in frontend applications.

### 3. Implement Proper Scopes
Request only necessary scopes:
```javascript
scope: "openid profile email"
```

### 4. Use Audience for APIs
Specify audience for API access:
```javascript
audience: "https://your-api.com"
```

### 5. Enable MFA
Configure multi-factor authentication in Auth0 dashboard.

## Testing

### Unit Testing
```javascript
// Mock Auth0 in tests
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    user: { sub: 'test-user', email: 'test@example.com' },
    loginWithRedirect: jest.fn(),
    logout: jest.fn()
  })
}));
```

### Integration Testing
Use Auth0's test endpoints for integration testing.

## Troubleshooting

### Common Issues

1. **Callback URL Mismatch**
   - Verify callback URLs in Auth0 dashboard
   - Check application settings

2. **CORS Issues**
   - Add origins to Allowed Web Origins
   - Check CORS settings

3. **Token Validation Errors**
   - Verify audience configuration
   - Check token expiration

4. **Silent Authentication Failures**
   - Check third-party cookies settings
   - Verify iframe settings

### Debug Mode

Enable debug mode to see detailed logs:

```javascript
// Next.js
AUTH0_DEBUG=true

// React
process.env.REACT_APP_AUTH0_DEBUG = 'true'
```

## Pricing

- **Free Tier**: Up to 7,000 active users
- **Essential**: $23/month per tenant
- **Professional**: $240/month per tenant
- **Enterprise**: Custom pricing

## Advanced Features

### Custom Domains
Configure custom domains for branded login experience.

### Branding
Customize login pages, emails, and error pages.

### Extensions
Use Auth0 Extensions for additional functionality.

### Management API
Programmatically manage users and configurations.

## Getting Help

- Auth0 Documentation: https://auth0.com/docs
- Community Forum: https://community.auth0.com
- Support: https://support.auth0.com

## Best Practices

1. **Use Universal Login for better security**
2. **Implement proper error handling**
3. **Use refresh tokens for long-lived sessions**
4. **Monitor authentication metrics**
5. **Implement proper logout functionality**
6. **Use role-based access control (RBAC)**
7. **Keep SDKs updated**
8. **Test authentication flows thoroughly**
