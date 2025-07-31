
# Package Installer CLI (pi)

[![npm version](https://img.shields.io/npm/v/package-installer-cli?style=flat-square)](https://www.npmjs.com/package/package-installer-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

**NPM Package:** [https://www.npmjs.com/package/package-installer-cli](https://www.npmjs.com/package/package-installer-cli)

A modern, cross-platform CLI tool to scaffold web applications with beautiful styling, interactive prompts, and comprehensive framework support. Create production-ready projects in seconds with the ultimate developer experience.

## ✨ Features

- 🚀 **10+ Frameworks** - Next.js, React, Vue, Angular, Express, Rust, **Remix**, **NestJS**
- 💻 **Language Support** - JavaScript & TypeScript
- 🧩 **UI Libraries** - Shadcn/ui, Material-UI, Headless UI
- 📦 **Bundler Options** - Vite and more
- 🎨 **Beautiful Styling** - Gradient colors, styled boxes, enhanced UX
- 🌍 **Cross-platform** - Works on Windows, macOS, Linux, WSL
- ⚡ **Fast Scaffolding** - Get started in seconds
- 🔧 **Dual Commands** - Use `pi` or `package-installer`
- 📁 **Smart Project Names** - Use "." for current directory name
- 👋 **Graceful Exits** - Proper error handling and goodbye messages
- 🎯 **Combination Templates** - Pre-configured full-stack setups
- 🦀 **Rust Support** - Cargo commands and project structure
- 🔄 **Auto Dependency Installation** - Smart package manager detection
- 🏷️ **Framework Types** - Frontend, Backend, Fullstack indicators
- 🔗 **CORS Integration** - Pre-configured for full-stack templates
- 📊 **Enhanced Project Summary** - Detailed configuration overview

## 🚀 Quick Start

### Global Installation

```bash
# Using npm
npm i -g package-installer-cli

# Using pnpm
pnpm i -g package-installer-cli

# Using yarn
yarn global add package-installer-cli
```

### Usage

```bash
# Quick command
pi

# Full command name
package-installer

# With project name
pi my-awesome-app

# Use current directory name
pi .
```

## 📋 Available Frameworks & Templates

### Frontend Frameworks
- **Next.js** [FULLSTACK] (JavaScript/TypeScript)
  - With/without src directory
  - With/without Tailwind CSS
  - With/without Shadcn/ui
  
- **React.js** [FRONTEND] with Vite (JavaScript/TypeScript)
  - With/without Shadcn/ui
  - With/without Tailwind CSS
  
- **Vue.js** [FRONTEND] (JavaScript/TypeScript)
  - With/without Tailwind CSS
  - With/without Headless UI
  
- **Angular** [FRONTEND] (TypeScript)
  - With/without Tailwind CSS
  - With/without Material-UI

### Modern Full-Stack Frameworks
- **Remix** [FRONTEND] (TypeScript)
  - With/without Shadcn/ui
  - With/without Tailwind CSS
  - Full-stack React framework

- **NestJS** [BACKEND] (TypeScript)
  - Enterprise-ready backend framework
  - Simplified setup with single template
  - Built-in TypeScript support

### Backend Frameworks
- **Express.js** [BACKEND] (JavaScript/TypeScript)
  - Basic template
  - Advanced template (with MongoDB, JWT, testing)

### Systems Programming
- **Rust** [BACKEND]
  - Basic template
  - Advanced template

### Combination Templates 🆕
- **React + Express + Shadcn/ui** [FULLSTACK]
  - Pre-configured full-stack setup
  - React frontend with Express backend
  - Shadcn/ui components included
  - CORS pre-configured for frontend-backend communication
- **React + NestJS + Shadcn/ui** [FULLSTACK]
  - Modern full-stack with NestJS backend
  - TypeScript throughout
  - Enterprise-ready architecture
  - CORS pre-configured for frontend-backend communication

## 🎯 Enhanced Workflow

1. **Run command** - `pi` or `package-installer`
2. **Project name** - Enter name or use "." for current directory
3. **Choose framework** - Select from 10+ modern frameworks with type indicators
4. **Select language** - JavaScript or TypeScript (for combination templates too)
5. **Configure options** - UI library, bundler, styling (skipped for combination templates)
6. **Review summary** - Beautiful configuration overview
7. **Project created!** 🎉 - Auto-install dependencies (frontend + backend for combination templates)

## 🎨 Enhanced Styling

The CLI features a modern, beautiful interface with:

- **Gradient ASCII Art** - Vibrant multi-color banner
- **Styled Information Boxes** - Color-coded sections
- **Interactive Prompts** - Emoji-enhanced questions
- **Progress Indicators** - Animated spinners
- **Success Messages** - Detailed next steps
- **Error Handling** - Graceful error messages
- **Framework Type Indicators** - [FRONTEND], [BACKEND], [FULLSTACK]

## 📸 Examples & Usage

### Main Interface Example

```bash
$ pi

┌─────────────────────────────────────────────────────────┐
│                    ✨ Package Installer CLI             │
│                                                         │
│  ██████╗ █████╗  ██████╗██╗  ██╗ █████╗ ██╗         │
│  ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██║         │
│  ██████╔╝███████║██║     █████╔╝ ███████║██║         │
│  ██╔═══╝ ██╔══██║██║     ██╔═██╗ ██╔══██║██║         │
│  ██║     ██║  ██║╚██████╗██║  ██╗██║  ██║███████╗    │
│  ╚═╝     ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝    │
│                                                         │
│  🚀 The Ultimate Tool for Creating Modern Web Apps     │
│  ✨ Fast • Modern • Production-Ready • Beautiful       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 📦 Version: 1.4.8                                      │
│ 🌍 Framework Support: 10+ frameworks                    │
│ ⚡ Quick Start: pi <project-name>                       │
└─────────────────────────────────────────────────────────┘
```

### Framework Selection Example

```bash
📁 Enter the project folder name: my-awesome-app

🚀 Choose a framework:
❯ Next.js [FULLSTACK] (Modern, Fast, Production-ready)
  React.js [FRONTEND] (Modern, Fast, Production-ready)
  Vue.js [FRONTEND] (Modern, Fast, Production-ready)
  Angular.js [FRONTEND] (Modern, Fast, Production-ready)
  Express.js [BACKEND] (Modern, Fast, Production-ready)
  Remix.js [FRONTEND] (Modern, Fast, Production-ready)
  NestJS [BACKEND] (Modern, Fast, Production-ready)
  Rust [BACKEND] (Modern, Fast, Production-ready)
  reactjs+expressjs+shadcn [FULLSTACK] (Complete full-stack solution with React frontend, Express backend, and Shadcn UI)
  reactjs+nestjs+shadcn [FULLSTACK] (Enterprise-grade full-stack solution with React frontend, NestJS backend, and Shadcn UI)
```

### Combination Template Example

```bash
💻 Choose a language:
❯ TypeScript (Type-safe, Modern syntax)
  JavaScript (Type-safe, Modern syntax)

📋 Choose your template:
❯ react-basic-express-shadcn-template (Pre-configured setup)
  react-advance-express-shadcn-template (Pre-configured setup)

📋 Template includes:
  ✅ Shadcn/ui components
  ✅ Express.js backend
  ✅ React.js frontend
  💡 All configurations are pre-configured for optimal setup!
```

### Project Summary Example

```bash
📋 Project Configuration Summary:
════════════════════════════════════════════════════════════
  Project Name: my-awesome-app
  Framework: reactjs+expressjs+shadcn
  Language: TypeScript
  Template: react-basic-express-shadcn-template
  Type: Combination Template (Pre-configured)
════════════════════════════════════════════════════════════
```

### Success Message Example (Combination Template)

```bash
┌─────────────────────────────────────────────────────────┐
│                        ✨ Success                       │
│                                                         │
│  🎉 Project "my-awesome-app" created successfully!     │
│                                                         │
│  📁 Location: /path/to/my-awesome-app                  │
│  🚀 Next steps:                                        │
│    # Frontend (in project root)                        │
│    npm run dev                                         │
│                                                         │
│    # Backend (in backend folder)                       │
│    cd backend && npm run dev                           │
│                                                         │
│  💡 Pro Tip: Run frontend and backend in separate     │
│     terminals for better development experience!        │
└─────────────────────────────────────────────────────────┘
```

### Rust Project Example

```bash
🦀 Choose Rust template type:
❯ Basic (Simple, Clean structure)
  Advanced (Full-featured, Production-ready)

# Success message shows Cargo commands
┌─────────────────────────────────────────────────────────┐
│                        ✨ Success                       │
│                                                         │
│  🎉 Project "my-rust-app" created successfully!       │
│                                                         │
│  📁 Location: /path/to/my-rust-app                    │
│  🚀 Next steps:                                        │
│    cd my-rust-app                                      │
│    cargo run                                           │
│    cargo build                                         │
└─────────────────────────────────────────────────────────┘
```

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
node dist/index.js

# Or use the pi command
./dist/index.js
```

### Project Structure

```
package-installer-cli/
├── src/
│   └── index.ts          # Main CLI logic with enhanced styling
├── templates/            # Template directories
│   ├── nextjs/
│   ├── reactjs/
│   ├── vuejs/
│   ├── angularjs/
│   ├── expressjs/
│   ├── remixjs/          # 🆕 Remix templates
│   ├── nestjs/           # 🆕 NestJS templates
│   ├── rust/             # 🦀 Rust templates
│   ├── reactjs-expressjs-shadcn/  # 🆕 Combination templates
│   └── reactjs-nestjs-shadcn/     # 🆕 Combination templates
├── template.json         # Framework configurations with types
├── dist/                 # Compiled JavaScript
└── package.json
```

### Key Features Implementation

- **Dual Command Support**: Both `pi` and `package-installer` commands
- **Smart Project Names**: Handles "." for current directory
- **Enhanced Error Handling**: Graceful exits and proper error messages
- **Framework Validation**: Ensures compatible options
- **Auto Dependency Installation**: Tries pnpm first, then npm
- **Rust Support**: Cargo commands and project structure
- **Combination Templates**: Pre-configured full-stack setups
- **Framework Types**: Frontend, Backend, Fullstack indicators
- **CORS Integration**: Pre-configured for full-stack communication

## 🎯 Command Examples

```bash
# Basic usage
pi

# Create project with name
pi my-next-app

# Use current directory name
pi .

# Full command name
package-installer my-react-app

# Help and version
pi --help
pi --version
package-installer --help

# Create Rust project
pi my-rust-app  # Will show Cargo commands

# Create combination template
pi my-fullstack-app  # Will show pre-configured options
```

## 🔧 Framework-Specific Features

### Remix
- **Blue theme** with modern styling
- **Shadcn/ui integration** with Tailwind CSS
- **Template validation** for UI library requirements
- **3 template variants** for different setups

### NestJS
- **Magenta theme** for enterprise feel
- **Simplified setup** - no extra questions
- **Single template** for consistency
- **TypeScript-only** for type safety

### Express.js
- **Green theme** for backend development
- **Basic and Advanced** templates
- **MongoDB integration** in advanced template
- **Testing setup** with Jest

### Rust 🦀
- **Yellow theme** for systems programming
- **Cargo commands** instead of npm
- **Basic and Advanced** templates
- **Auto dependency fetching** with `cargo build`

### Combination Templates 🆕
- **Pre-configured setups** - no extra questions
- **Full-stack ready** - frontend + backend
- **UI components included** - Shadcn/ui
- **TypeScript throughout** - for type safety
- **CORS pre-configured** - for frontend-backend communication
- **Dual dependency installation** - both frontend and backend

## 🚀 Advanced Usage

### Creating Different Project Types

```bash
# Frontend with Next.js
pi my-next-app
# → Next.js + TypeScript + Tailwind + Shadcn/ui

# Backend with Express
pi my-api
# → Express.js + TypeScript + MongoDB + JWT

# Full-stack with combination template
pi my-fullstack
# → React + Express + Shadcn/ui (pre-configured)

# Systems programming with Rust
pi my-rust-service
# → Rust + Actix-web + PostgreSQL

# Enterprise backend with NestJS
pi my-enterprise-api
# → NestJS + TypeScript + Built-in features
```

### Project Name Variations

```bash
# Standard project name
pi my-app

# Use current directory name
pi .

# Kebab case (recommended)
pi my-awesome-project

# With numbers
pi project-2024

# With underscores
pi my_project
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add proper error handling
- Include emoji and styling for new features
- Update documentation for new frameworks
- Test on multiple platforms
- Add comprehensive comments to code
- Follow the existing code structure

### Adding New Frameworks

1. **Update `template.json`** with framework configuration and type
2. **Create template directory** in `templates/`
3. **Add framework theme** in `getFrameworkTheme()`
4. **Update documentation** in README.md
5. **Test thoroughly** on different platforms

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the developer community
- Inspired by modern CLI tools like `create-next-app`, `create-react-app`
- Enhanced with beautiful styling and developer experience
- Special thanks to the open-source community

---

**Made with ❤️ by [Sharique Chaudhary](https://github.com/0xshariq)**

*Star this repository if you find it helpful! ⭐*
