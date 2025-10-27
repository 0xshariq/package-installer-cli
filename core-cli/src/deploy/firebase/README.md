# Firebase Deployment

Deploy your static sites, functions, and web apps to Firebase using the Firebase CLI (`firebase`). This guide matches the style used for other platform README files in this repo.
## Supported Deployment Types

- **Firebase Hosting**: Static web hosting with global CDN
- **Cloud Functions**: Serverless functions (Node.js)
- **Authentication**: Firebase Authentication integration
- **Cloud Storage**: File uploads and storage buckets

## Prerequisites

### 1. Install Firebase CLI

**macOS / Linux / Windows (recommended)**
```bash
npm install -g firebase-tools
```
```bash
firebase --version
```

### 2. Login and Initialize

```bash
firebase login
firebase init
```

During `firebase init` choose the features you want (Hosting, Functions, Firestore/Realtime Database, Storage, etc.) and select the project you wish to deploy to.

## Usage

```bash
# Interactive deploy using our CLI
pi deploy --platform google-cloud

# Use explicit firebase-hosting option via google-cloud deploy flow
pi deploy -p google-cloud
```

Or run Firebase directly:

```bash
# Build your app first
npm run build

# Deploy hosting only
firebase deploy --only hosting

# Deploy functions only
firebase deploy --only functions

# Deploy hosting and functions
firebase deploy --only hosting,functions
```

## Deployment Notes

- The tool will automatically create a `firebase.json` during deployment if one is not present and you selected Hosting or Functions during `firebase init`.
- Ensure `public` (or your configured hosting output directory) has the built assets before deploying.
- For frameworks like Next.js, prefer static export or configure rewrites to route dynamic serverless logic to Cloud Functions.

## Framework Support

- Next.js: Use static export or Cloud Functions for SSR. Configure `firebase.json` rewrites as needed.
- React / Vite: Build to `build/` or `dist/` and point Hosting `public` to that folder.
- Angular / Vue: Build and deploy the production output directory.

## Troubleshooting

- Authentication issues: `firebase login --reauth`
- Permission issues: Ensure your Google account has appropriate IAM roles for the selected project
- Build failures: Run `npm run build` locally and check the output folder

## Best Practices

- Use environment-specific Firebase projects (staging/production)
- Secure service accounts and restrict IAM roles
- Use Cloud Functions with appropriate memory/timeouts for longer-running processes
- Use Cloud Storage for large asset uploads

## References

- Firebase Hosting: https://firebase.google.com/docs/hosting
- Firebase CLI: https://firebase.google.com/docs/cli
- Cloud Functions: https://firebase.google.com/docs/functions

````
