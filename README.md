
# Package Installer CLI (pi)

## 🆕 What's New (v2.0.0)

- **Express.js Database Support:**
  - **26+ Express.js Templates** with MongoDB, Supabase (PostgreSQL), NeonDB (PostgreSQL)
  - **Available ORMs:** Mongoose, Typegoose, TypeORM, Prisma, Drizzle
  - Both Basic & Advanced templates for each database/ORM combination

- **Next.js Database Integration:**
  - Database selection with PostgreSQL, MySQL, MongoDB support
  - ORM selection matching your database choice
  - Generated projects ready for data-driven development

- **Combination Templates Database Support:**
  - **React + Express + Shadcn/ui** - Now supports database and ORM selection
  - **React + NestJS + Shadcn/ui** - Full database integration available
  - Same database options as standalone Express.js: MongoDB, Supabase, NeonDB
  - Compatible ORMs: Mongoose, Typegoose, TypeORM, Prisma, Drizzle
  - Example:
    ```bash
    $ pi my-fullstack-app
    🚀 Choose a framework: reactjs+expressjs+shadcn
    🗄️ Choose a database: MongoDB
    🔧 Choose an ORM: Mongoose
    📋 Choose template: react-advance-express-shadcn-template
    ```

- **Enhanced CLI Experience:**
  - Updated to version 2.0.0 with comprehensive database keywords
  - Database and ORM selection available in: Next.js, Express.js, and both Combination Templates
  - Better error handling and validation
  - Improved template organization and structure


[![npm version](https://img.shields.io/npm/v/package-installer-cli?style=flat-square)](https://www.npmjs.com/package/package-installer-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

**NPM Package:** [https://www.npmjs.com/package/package-installer-cli](https://www.npmjs.com/package/package-installer-cli)

A modern, cross-platform CLI tool to scaffold web applications with comprehensive database support, beautiful styling, and production-ready templates. Create full-stack projects with Express.js + databases, Next.js applications, and more in seconds.

## ✨ Features

- 🚀 **10+ Frameworks** - Next.js, React, Vue, Angular, Express, Rust, **Remix**, **NestJS**
- 🗄️ **Comprehensive Database Support** - MongoDB, PostgreSQL (Supabase, NeonDB) with multiple ORMs
- 💻 **Language Support** - JavaScript & TypeScript with full type safety
- 🧩 **UI Libraries** - Shadcn/ui, Material-UI, Headless UI integration
- 📦 **Build Tools** - Vite, Webpack, and framework-specific bundlers
- 🔧 **26+ Express.js Templates** - Every database and ORM combination covered
- 🎨 **Beautiful Styling** - Gradient colors, styled boxes, enhanced UX
- 🌍 **Cross-platform** - Works on Windows, macOS, Linux, WSL
- ⚡ **Production-Ready** - Pre-configured with schemas, connections, and best practices
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
npm i -g @0xshariq/package-installer

# Using pnpm
pnpm i -g @0xshariq/package-installer

# Using yarn

The Ultimate Tool for Creating Modern Web Applications

## ✨ Features

- Interactive CLI with beautiful UI and comprehensive database support
- Argument-based project name (supports `pi my-app` or `pi .` for current directory)
- Framework, language, and UI library selection
- **Database & ORM selection** for Next.js, Express.js, and Combination Templates
- **Dynamic ORM filtering** (ORMs shown based on selected database)
- Automatic dependency installation (`pnpm` or `npm`)
- Cross-platform path handling
- Graceful exit and error messaging
- Combination templates for full-stack setups
- Production-ready templates with authentication, validation, and testing

## 🗄️ Database Support

Database and ORM selection is available for:
- **Next.js** - PostgreSQL, MySQL, MongoDB with compatible ORMs
- **Express.js** - MongoDB, Supabase (PostgreSQL), NeonDB (PostgreSQL) with Mongoose, Typegoose, TypeORM, Prisma, Drizzle
- **Combination Templates** - Same database options as Express.js for the backend

## 📋 Example Usage

### Express.js with Database
```bash
$ pi my-backend-app
🚀 Choose a framework: Express.js
💻 Choose a language: TypeScript
🗄️ Choose a database: MongoDB
🔧 Choose an ORM: Mongoose
📋 Choose your template: advance-expressjs-template
✅ Project created with full MongoDB + Mongoose integration!
```

### Next.js with Database
```bash
$ pi my-next-app
🚀 Choose a framework: Next.js
💻 Choose a language: TypeScript
🧩 Do you want to add a UI library? Yes
✨ Choose a UI library: Shadcn
📦 Choose a bundler: Vite
📂 Do you want a src directory? Yes
🎨 Do you want to use Tailwind CSS? Yes
🗄️ Choose a database: PostgreSQL
🔧 Choose an ORM: Prisma
```

### Full-Stack Combination
```bash
$ pi my-fullstack-app
🚀 Choose a framework: reactjs+expressjs+shadcn
💻 Choose a language: TypeScript
📋 Choose your template: react-advance-express-shadcn-template
✅ Pre-configured full-stack setup with React + Express + Shadcn/ui!
```

## 📦 Installation

```bash
npm install -g package-installer-cli
```

## 🛠️ Usage

```bash
pi my-app
# or
package-installer my-app
```

## 💡 Tips

- Use `pi .` to scaffold in the current directory
- Check the generated `README.md` for next steps
- Visit framework docs for advanced features

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
│ 📦 Version: 2.0.1                                      │
│ 🌍 Framework Support: 10+ frameworks                    │
│ 🗄️ Database Support: MongoDB, PostgreSQL (26+ templates) │
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

### Express.js 🟢
- **Green theme** for backend development
- **26+ Template Combinations** - Every database/ORM pairing
- **Database Support**: MongoDB, Supabase (PostgreSQL), NeonDB (PostgreSQL)
- **ORM Support**: Mongoose, Typegoose, TypeORM, Prisma, Drizzle
- **Both Basic & Advanced** templates for each combination
- **Production-Ready** with authentication, validation, testing
- **Environment Configuration** templates included
- **Database Schemas** pre-configured for each ORM

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
# Frontend with Next.js + Database
pi my-next-app
# → Next.js + TypeScript + Tailwind + Shadcn/ui + PostgreSQL + Prisma

# Backend with Express + MongoDB
pi my-api
# → Express.js + TypeScript + MongoDB + Mongoose + JWT + Testing

# Backend with Express + PostgreSQL
pi my-postgres-api
# → Express.js + TypeScript + Supabase + Prisma + Authentication

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
