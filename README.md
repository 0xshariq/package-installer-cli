
# Package Installer CLI (pi)

[![npm version](https://img.shields.io/npm/v/package-installer-cli?style=flat-square)](https://www.npmjs.com/package/package-installer-cli)

**NPM Package:** [https://www.npmjs.com/package/package-installer-cli](https://www.npmjs.com/package/package-installer-cli)

A cross-platform, interactive CLI to scaffold modern web app templates with framework, language, UI, bundler, and more.

## ✨ Features

- 🚀 **Interactive prompts** - Easy-to-use interface with colored output
- 🎨 **Multiple frameworks** - Next.js, React, Vue, Angular, Express, Rust
- 💻 **Language support** - JavaScript & TypeScript
- 🧩 **UI libraries** - Shadcn/ui, Material-UI, Headless UI
- 📦 **Bundler options** - Vite and more
- 🌍 **Cross-platform** - Works on Windows, macOS, Linux, WSL
- ⚡ **Fast scaffolding** - Get started in seconds

## 🚀 Quick Start

### Global Installation

```bash
# Using npm
npm i -g pi

# Using pnpm
pnpm i -g pi

# Using yarn
yarn global add pi
```

### Usage

```bash
pi
```

Follow the interactive prompts to create your project!

## 📋 Available Templates

### Frontend Frameworks
- **Next.js** (JavaScript/TypeScript)
  - With/without src directory
  - With/without Tailwind CSS
  - With/without Shadcn/ui
  
- **React.js** with Vite (JavaScript/TypeScript)
  - With/without Shadcn/ui
  - With/without Tailwind CSS
  
- **Vue.js** (JavaScript/TypeScript)
  - With/without Tailwind CSS
  - With/without Headless UI
  
- **Angular** (TypeScript)
  - With/without Tailwind CSS
  - With/without Material-UI

### Backend Frameworks
- **Express.js** (JavaScript/TypeScript)
  - Basic template
  - Advanced template (with MongoDB, JWT, testing)

### Systems Programming
- **Rust**
  - Basic template
  - Advanced template

## 🎯 Example Workflow

1. Run `pi` command
2. Choose your framework (e.g., Next.js)
3. Select language (JavaScript/TypeScript)
4. Configure options (src directory, Tailwind, UI library)
5. Enter project name (default: my-app)
6. Review configuration summary
7. Project created! 🎉

## 📸 Screenshot

![Package Installer CLI Screenshot](./public/screenshot.png)

## 🛠️ Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/0xshariq/package-installer-cli.git
cd package-installer-cli

# Install dependencies
npm install

# Build the project
npm run build

# Run locally
./dist/index.js
```

### Project Structure

```
package-installer-cli/
├── src/
│   ├── index.ts          # Main CLI logic
│   ├── template.json     # Template configurations
│   └── templates.json    # Template mappings
├── templates/            # Template directories
│   ├── nextjs/
│   ├── reactjs/
│   ├── vuejs/
│   ├── angularjs/
│   ├── expressjs/
│   └── rust/
├── dist/                 # Compiled JavaScript
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.
