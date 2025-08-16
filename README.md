
# Package Installer CLI (pi)

[![npm version](https://img.shields.io/npm/v/@0xshariq/package-installer?style=flat-square)](https://www.npmjs.com/package/@0xshariq/package-installer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A modern CLI tool to scaffold web applications, clone repositories from GitHub/GitLab/BitBucket/SourceHut, and manage projects with automatic git initialization and dependency installation.

## 🚀 Quick Start

```bash
# Install globally
npm install -g @0xshariq/package-installer

# Create a new project
pi create my-awesome-app

# Clone repositories from multiple providers
pi clone facebook/react my-react-copy    # GitHub
pi clone gitlab:user/project             # GitLab  
pi clone bitbucket:user/repo             # BitBucket

# Check package versions
pi check react

# Show help
pi --help
```

## ✨ Key Features

- **10+ Frameworks** - Next.js, React, Vue, Angular, Express, Rust, Remix, NestJS
- **Database Support** - MongoDB, PostgreSQL (Supabase, NeonDB) with multiple ORMs
- **GitHub Cloning** - Auto dependency installation and git initialization
- **Package Management** - Version checking and update recommendations
- **Beautiful UI** - Gradient colors, progress indicators, styled help
- **Cross-platform** - Windows, macOS, Linux, WSL support
- **Production Ready** - Pre-configured templates with best practices

## �️ Commands

| Command | Description | Example |
|---------|-------------|---------|
| `create` | Create new project from templates | `pi create my-app` |
| `clone` | Clone from GitHub, GitLab, BitBucket, SourceHut | `pi clone user/repo` |
| `check` | Check package versions | `pi check react` |
| `add` | Add features (coming soon) | `pi add auth` |

### Create Command
```bash
pi create [project-name]          # Interactive project creation
pi create my-app                  # Create with specific name
pi create --help                  # Show help
```

### Clone Command  
```bash
# GitHub (default)
pi clone user/repo                # Clone from GitHub with default name
pi clone user/repo my-project     # Clone from GitHub with custom name

# GitLab
pi clone gitlab:user/repo         # Clone from GitLab
pi clone gitlab:user/repo my-app  # Clone from GitLab with custom name

# BitBucket
pi clone bitbucket:user/repo      # Clone from BitBucket  
pi clone bitbucket:user/repo app  # Clone from BitBucket with custom name

# SourceHut
pi clone sourcehut:user/repo      # Clone from SourceHut
pi clone sourcehut:user/repo app  # Clone from SourceHut with custom name

# Full URLs also supported
pi clone https://github.com/user/repo.git
pi clone https://gitlab.com/user/repo.git
pi clone https://bitbucket.org/user/repo.git
pi clone https://git.sr.ht/~user/repo

pi clone --help                   # Show help
```

**Supported Git Providers:**
- **GitHub** - `user/repo` (default) or `github.com/user/repo`
- **GitLab** - `gitlab:user/repo` or `gitlab.com/user/repo` 
- **BitBucket** - `bitbucket:user/repo` or `bitbucket.org/user/repo`
- **SourceHut** - `sourcehut:user/repo` or `git.sr.ht/~user/repo`

All cloned repositories automatically get:
- Dependencies installed (pnpm/npm)
- Environment file created from templates (.env.example → .env)
- Git repository re-initialized with fresh commit
- GitHub MCP server installed for enhanced git workflow

### Check Command
```bash
pi check                          # Check all packages
pi check react                    # Check specific package
pi check --help                   # Show help
```

## 🗄️ Supported Frameworks & Templates

### Frontend Frameworks
- **Next.js** - Full-stack React framework with SSR/SSG
- **React** - Modern UI library with extensive ecosystem
- **Vue** - Progressive framework with excellent DX
- **Angular** - Enterprise-grade TypeScript framework
- **Remix** - Web standards focused full-stack framework

### Backend Frameworks
- **Express** - 26+ templates with database/ORM combinations
- **NestJS** - Enterprise Node.js framework with TypeScript
- **Rust** - High-performance systems programming

### Database Support
- **MongoDB** - With Mongoose, Typegoose
- **PostgreSQL** - With Supabase, NeonDB, Prisma, TypeORM, Drizzle
- **MySQL** - With compatible ORMs

### UI Libraries
- Shadcn/ui, Material-UI, Headless UI integration
- Tailwind CSS, CSS Modules support
- Component library templates

## 🌟 Auto Git Initialization

Every created/cloned project automatically gets:
- Git repository initialization (`git init`)
- All files added (`git add .`)
- Initial commit with message: "Initial Commit from Package Installer CLI"
- GitHub MCP server installed for enhanced git workflow

## 📋 Example Usage

### Create Express API with MongoDB
```bash
$ pi create my-api
🚀 Framework: Express.js [BACKEND]
💻 Language: TypeScript  
🗄️ Database: MongoDB
🔧 ORM: Mongoose
✅ Project created with git initialization!
```

### Clone and Setup Repository
```bash
$ pi clone microsoft/TypeScript ts-playground
📥 Cloning repository...
🔧 Installing dependencies...
📄 Creating .env file...
🌟 Initializing git repository...
✅ Ready for development!
```

## 🛠️ Development

```bash
# Clone and setup
git clone https://github.com/0xshariq/package-installer-cli.git
cd package-installer-cli
pnpm install

# Build and test
pnpm build
node dist/index.js --help
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **NPM Package**: [https://www.npmjs.com/package/@0xshariq/package-installer](https://www.npmjs.com/package/@0xshariq/package-installer)
- **GitHub**: [https://github.com/0xshariq/package-installer-cli](https://github.com/0xshariq/package-installer-cli)
- **Issues**: [https://github.com/0xshariq/package-installer-cli/issues](https://github.com/0xshariq/package-installer-cli/issues)

---

**Made with ❤️ by [Sharique Chaudhary](https://github.com/0xshariq)**

# Clone with custom project name
pi clone vercel/next.js my-nextjs-copy

# Show detailed help
pi clone --help
```

**Features:**
- Automatic dependency installation (tries pnpm first, then npm)
- Environment file creation from .env templates
- Progress indicators with colored status messages
- Error handling for private/non-existent repos
- Project structure preservation

### 3. 🔍 Check Command

Check package versions and get update suggestions.

```bash
# Check all packages in current project
pi check

# Check specific package
pi check react

# Check scoped packages
pi check @types/node

# Show detailed help
pi check --help
```

**Features:**
- Version comparison with latest releases
- Security vulnerability detection
- Update recommendations
- Dependency tree analysis

### 4. ➕ Add Command (Coming Soon)

Add new features to existing projects.

```bash
# Show available features (coming soon)
pi add

# Add authentication (coming soon)
pi add auth

# Show detailed help
pi add --help
```

**Planned Features:**
- Authentication systems (Auth0, Firebase, Clerk)
- Database integrations (MongoDB, PostgreSQL, MySQL)
- Docker containerization
- Testing frameworks (Jest, Cypress, Playwright)
- CI/CD pipelines

## 🗄️ Database Support

Comprehensive database and ORM support for modern web applications:

### Express.js Templates (26+ Combinations)
- **Databases:** MongoDB, Supabase (PostgreSQL), NeonDB (PostgreSQL)
- **ORMs:** Mongoose, Typegoose, TypeORM, Prisma, Drizzle
- **Template Types:** Basic & Advanced for each combination

### Next.js Templates
- **Databases:** PostgreSQL, MySQL, MongoDB
- **ORMs:** Compatible with selected database
- **Integration:** Built-in authentication and API routes

### Combination Templates
- **React + Express + Shadcn/ui** with full database support
- **React + NestJS + Shadcn/ui** with enterprise features
- Pre-configured CORS and environment setup

## 📋 Example Usage

### Creating an Express.js API with MongoDB

```bash
$ pi create my-backend-app

🚀 Choose a framework: Express.js [BACKEND]
💻 Choose a language: TypeScript
🗄️ Choose a database: MongoDB
🔧 Choose an ORM: Mongoose
📋 Choose your template: advance-expressjs-template

✅ Project created with full MongoDB + Mongoose integration!
```

### Creating a Next.js App with PostgreSQL

```bash
$ pi create my-next-app

🚀 Choose a framework: Next.js [FULLSTACK]
💻 Choose a language: TypeScript
🧩 Do you want to add a UI library? Yes
✨ Choose a UI library: Shadcn
📦 Choose a bundler: Vite
📂 Do you want a src directory? Yes
🎨 Do you want to use Tailwind CSS? Yes
🗄️ Choose a database: PostgreSQL
🔧 Choose an ORM: Prisma

✅ Created Next.js app with PostgreSQL and Prisma!
```

### Cloning and Setting Up a Repository

```bash
$ pi clone microsoft/TypeScript ts-playground

📥 Cloning repository...
✅ Successfully cloned microsoft/TypeScript
🔧 Installing dependencies with pnpm...
✅ Dependencies installed with pnpm
📄 Creating .env file...
✅ Created .env file with 3 variables
🎉 Project "ts-playground" created successfully!
```

### Creating a Full-Stack Application

```bash
$ pi create my-fullstack-app

🚀 Choose a framework: reactjs+expressjs+shadcn [FULLSTACK]
💻 Choose a language: TypeScript
🗄️ Choose a database: MongoDB
🔧 Choose an ORM: Mongoose
📋 Choose your template: react-advance-express-shadcn-template

✅ Pre-configured full-stack setup with React + Express + Shadcn/ui!
```

## 🎨 Beautiful Interface

The CLI features a modern, elegant interface with:

- **Gradient ASCII Art** - Vibrant multi-color banner
- **Styled Information Boxes** - Color-coded sections with beautiful borders
- **Interactive Prompts** - Emoji-enhanced questions with clear options
- **Progress Indicators** - Animated spinners with detailed status messages
- **Success Messages** - Comprehensive next steps and usage information
- **Error Handling** - Graceful error messages with helpful suggestions
- **Framework Type Indicators** - [FRONTEND], [BACKEND], [FULLSTACK] labels
- **Command-Specific Help** - Detailed usage examples for each command

### Main Interface Preview

```bash
┌─────────────────────────────────────────────────────────┐
│                    ✨ Package Installer CLI             │
│                                                         │
```

## 🌟 Framework Support

### Frontend Frameworks
- **Next.js** [FULLSTACK] - Modern React framework with SSR/SSG
- **React.js** [FRONTEND] - Popular UI library with extensive ecosystem
- **Vue.js** [FRONTEND] - Progressive framework with excellent DX
- **Angular.js** [FRONTEND] - Enterprise-grade framework with TypeScript
- **Remix** [FRONTEND] - Full-stack web framework focused on web standards

### Backend Frameworks
- **Express.js** [BACKEND] - Fast, minimalist web framework for Node.js
- **NestJS** [BACKEND] - Progressive framework for building efficient server-side applications
- **Rust** [BACKEND] - Systems programming language for high-performance applications

### Full-Stack Solutions
- **reactjs+expressjs+shadcn** [FULLSTACK] - React frontend with Express backend
- **reactjs+nestjs+shadcn** [FULLSTACK] - React frontend with NestJS backend

### Framework-Specific Features

#### Express.js 🟢
- **26+ Template combinations** covering all database/ORM pairings
- **Database Support:** MongoDB, Supabase (PostgreSQL), NeonDB (PostgreSQL)
- **ORM Support:** Mongoose, Typegoose, TypeORM, Prisma, Drizzle
- **Template Types:** Basic & Advanced variants
- **Production Features:** Authentication, validation, testing, Docker support

#### Next.js ⚫
- **Full-stack capabilities** with API routes and middleware
- **Database Integration:** Built-in support for PostgreSQL, MySQL, MongoDB
- **UI Library Integration:** Seamless Shadcn/ui, Material-UI setup
- **Bundler Options:** Webpack, Turbopack support
- **Styling Options:** Tailwind CSS, CSS Modules, Styled Components

#### Rust 🦀
- **Cargo Integration:** Uses `cargo` commands instead of npm
- **Template Variants:** Basic and Advanced project structures
- **Performance Focus:** Optimized for high-performance applications
- **System Integration:** Native OS integration capabilities

#### NestJS 🟣
- **Enterprise Ready:** Built-in features for scalable applications
- **TypeScript First:** Full type safety throughout the stack
- **Modular Architecture:** Dependency injection and decorators
- **Built-in Features:** Guards, interceptors, pipes, and more

## 🔧 Advanced Usage

### Environment Variables

The CLI automatically creates `.env` files from available templates:

```bash
# If your cloned repo has .env.example, .env.local, etc.
pi clone user/repo my-project

# Output:
✅ Created .env file with 5 variables:
DATABASE_URL=
API_SECRET=
NEXT_PUBLIC_APP_URL=
JWT_SECRET=
SMTP_PASSWORD=
```

### Smart Dependency Installation

The CLI intelligently chooses the best package manager:

```bash
# Tries pnpm first (faster), falls back to npm
🔧 Installing dependencies with pnpm...
✅ Dependencies installed with pnpm

# If pnpm is not available:
🔧 Installing dependencies with npm...
✅ Dependencies installed with npm
```

### Project Name Strategies

```bash
# Use current directory name
pi create .

# Kebab-case (recommended)
pi create my-awesome-project

# With numbers and special characters
pi create project-2024-v2
```

### Custom Repository Cloning

```bash
# Clone popular repositories
pi clone facebook/react
pi clone microsoft/TypeScript
pi clone vercel/next.js

# Clone with custom names
pi clone tailwindlabs/tailwindcss my-css-framework
pi clone prisma/prisma my-orm-study
```

## 🛠️ Development

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/0xshariq/package-installer-cli.git
cd package-installer-cli

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run locally
node dist/index.js

# Test specific commands
node dist/index.js create my-test-app
node dist/index.js clone microsoft/TypeScript test-clone
```

### Project Structure

```
package-installer-cli/
├── src/
│   ├── index.ts                    # Main CLI with enhanced styling and commands
│   ├── commands/
│   │   ├── create.ts               # Project creation from templates
│   │   ├── clone.ts                # GitHub repository cloning
│   │   ├── check.ts                # Package version checking
│   │   └── add.ts                  # Feature addition (coming soon)
│   └── utils/
│       ├── cloneUtils.ts           # GitHub cloning utilities
│       ├── ui.ts                   # Beautiful CLI interfaces and styling
│       ├── utils.ts                # Common utilities and themes
│       └── types.ts                # TypeScript type definitions
├── templates/                      # Template directories
│   ├── nextjs/
│   ├── reactjs/
│   ├── expressjs/                  # 26+ Express templates
│   ├── rust/                       # Rust project templates
│   └── combination/                # Full-stack templates
├── template.json                   # Framework configurations
├── dist/                          # Compiled JavaScript
└── package.json
```

### Key Implementation Features

- **Commander.js Integration** - Robust command-line argument parsing
- **Beautiful Styling** - Chalk, gradient-string, and boxen for enhanced UX
- **Error Handling** - Graceful error messages with helpful suggestions
- **Cross-Platform Support** - Works on Windows, macOS, Linux, WSL
- **TypeScript Support** - Full type safety throughout the codebase
- **Modular Architecture** - Separated commands and utilities
- **Progress Indicators** - Ora spinners with detailed status messages

## 🚨 Troubleshooting

### Common Issues

**Command not found: pi**
```bash
# Solution: Reinstall globally
npm uninstall -g @0xshariq/package-installer
npm install -g @0xshariq/package-installer
```

**Permission denied errors**
```bash
# Solution: Use proper permissions or sudo (Unix-like systems)
sudo npm install -g @0xshariq/package-installer
```

**Network errors during cloning**
```bash
# Solution: Check internet connection and repository accessibility
pi clone --help  # Check command format
```

**Dependency installation fails**
```bash
# Solution: Manual installation
cd your-project
npm install
# or
pnpm install
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Guidelines

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Install** dependencies (`pnpm install`)
5. **Make** your changes with proper TypeScript types
6. **Build** and test (`pnpm build && node dist/index.js --help`)
7. **Commit** with descriptive messages (`git commit -m 'Add amazing feature'`)
8. **Push** to your branch (`git push origin feature/amazing-feature`)
9. **Open** a Pull Request with detailed description

### Code Standards

- **TypeScript First** - Use proper types and interfaces
- **Error Handling** - Add comprehensive error handling
- **Styling** - Follow existing color schemes and UI patterns
- **Documentation** - Update README for new features
- **Testing** - Test on multiple platforms (Windows, macOS, Linux)
- **Comments** - Add JSDoc comments for functions and classes

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Open Source Community** - For the amazing tools and libraries
- **Contributors** - Everyone who has contributed to this project
- **Framework Creators** - Teams behind React, Next.js, Express, etc.
- **Modern CLI Tools** - Inspired by `create-next-app`, `create-react-app`, and similar tools
- **Typography & Design** - Beautiful ASCII art and gradient styling libraries

## 🔗 Links

- **NPM Package:** [https://www.npmjs.com/package/@0xshariq/package-installer](https://www.npmjs.com/package/@0xshariq/package-installer)
- **GitHub Repository:** [https://github.com/0xshariq/package-installer-cli](https://github.com/0xshariq/package-installer-cli)
- **Issues & Bug Reports:** [https://github.com/0xshariq/package-installer-cli/issues](https://github.com/0xshariq/package-installer-cli/issues)
- **Author:** [Sharique Chaudhary](https://github.com/0xshariq)

---

**Made with ❤️ by [Sharique Chaudhary](https://github.com/0xshariq)**

*Star this repository if you find it helpful! ⭐*

**🚀 Ready to build something amazing? Start with `pi create my-awesome-project`**
```

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
npm install -g @0xshariq/package-installer
```

## 🛠️ Usage

```bash
pi my-app
# or
package-installer my-app
```

## 💡 Tips

- Use `pi .` to scaffold in the current directory
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
