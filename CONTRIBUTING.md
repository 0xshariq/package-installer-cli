# Contributing to Package Installer CLI

We're thrilled that you're interested in contributing to Package Installer CLI! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Workflows](#development-workflows)
- [Adding New Templates](#adding-new-templates)
- [Adding New Features](#adding-new-features)

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Git
- TypeScript knowledge

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/package-installer-cli.git
   cd package-installer-cli
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the project**
   ```bash
   pnpm run build
   ```

4. **Test the CLI locally**
   ```bash
   node dist/index.js --help
   ```

5. **Run in development mode**
   ```bash
   pnpm run dev
   ```

## Project Structure

```
package-installer-cli/
├── src/
│   ├── commands/          # Command implementations
│   │   ├── create.ts      # Create command
│   │   ├── clone.ts       # Clone command
│   │   ├── add.ts         # Add features command
│   │   └── check.ts       # Package check command
│   ├── utils/             # Utility functions
│   │   ├── ui.ts          # UI and banner utilities
│   │   ├── prompts.ts     # Interactive prompts
│   │   ├── types.ts       # Type definitions
│   │   ├── templateCreator.ts    # Template creation logic
│   │   ├── dependencyInstaller.ts # Package installation
│   │   ├── featureInstaller.ts   # Feature addition logic
│   │   └── cloneUtils.ts  # Repository cloning utilities
│   └── index.ts           # Main CLI entry point
├── templates/             # Project templates
│   ├── nextjs/           # Next.js templates
│   ├── reactjs/          # React templates
│   ├── express/          # Express templates
│   ├── rust/             # Rust templates
│   └── ...               # Other framework templates
├── features/             # Feature templates (auth, docker, etc.)
└── tests/               # Test files
```

## Contributing Guidelines

### 1. Code Style

- Use TypeScript for all new code
- Follow the existing code style and conventions
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Use `chalk` for colored console output
- Use `boxen` for styled boxes in the terminal

### 2. Commit Messages

Follow the conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(create): add Vue.js template support
fix(clone): resolve issue with GitLab repositories
docs(readme): update installation instructions
```

### 3. Testing

- Test your changes thoroughly
- Ensure all existing tests pass
- Add tests for new features when applicable
- Test on different operating systems if possible

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding guidelines
   - Test your changes
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template with details about your changes

### PR Requirements

- [ ] Code follows the project's style guidelines
- [ ] Self-review of the code has been performed
- [ ] Code has been tested locally
- [ ] Documentation has been updated (if applicable)
- [ ] No breaking changes (or clearly documented)

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: 
  - OS (Windows/macOS/Linux)
  - Node.js version
  - Package Installer CLI version
- **Screenshots/Logs**: If applicable

### Feature Requests

When requesting features, please include:

- **Description**: Clear description of the feature
- **Use Case**: Why this feature would be useful
- **Proposed Solution**: Your ideas on how it could be implemented
- **Alternatives**: Alternative solutions you've considered

## Adding New Features

The CLI now uses a dynamic feature detection system. Here's how to add new features:

### Feature Directory Structure

Features are organized in the `features/` directory:

```
features/
├── auth/                    # Feature name
│   ├── clerk/              # Provider (if applicable)
│   │   └── nextjs/         # Framework
│   │       ├── javascript/ # Language
│   │       └── typescript/ # Language
│   ├── next-auth/          # Another provider
│   └── auth0/              # Another provider
├── docker/                 # Simple feature (no providers)
│   └── nextjs/            # Framework support
└── payments/              # Coming Soon feature
```

### Creating a New Feature

1. **Create feature directory**
   ```bash
   mkdir -p features/your-feature/framework-name/language
   ```

2. **Add implementation files**
   - Include actual implementation files (.ts, .tsx, .js, .jsx, .vue)
   - Add configuration files (package.json, .env, Dockerfile, etc.)
   - Support both `src/` and root project structures

3. **Framework-specific implementations**
   - Create separate folders for each framework (nextjs, reactjs, etc.)
   - Include both JavaScript and TypeScript variants
   - Ensure files work with both src/ and non-src/ project structures

4. **Automatic detection**
   - The CLI will automatically detect your feature
   - No need to manually update `SUPPORTED_FEATURES` constant
   - Feature status (✅ Ready vs 🚧 Coming Soon) is auto-determined

### Feature Integration Guidelines

1. **Smart file placement**
   - Use the `hasSrcFolder` parameter to place files correctly
   - Example: `middleware.ts` goes in `src/` if folder exists, otherwise root

2. **Template variables**
   - Use `{templateTitle}` and `{templateDescription}` in layout files
   - These will be replaced with actual project metadata

3. **Provider support**
   - For features with multiple providers (auth, payments), create provider subdirectories
   - Users can specify: `pi add auth clerk` or `pi add auth next-auth`

4. **Environment files**
   - Always place `.env` and `package.json` at project root
   - Use append action for `.env` to avoid overwriting existing variables

### Example Feature Structure

```
features/your-feature/
├── nextjs/
│   ├── javascript/
│   │   ├── .env                    # Root level
│   │   ├── package.json           # Root level  
│   │   ├── app/
│   │   │   └── layout.jsx         # Use {templateTitle}
│   │   ├── lib/
│   │   │   └── feature.js
│   │   └── middleware.js          # Placed based on src/ detection
│   └── typescript/
│       └── ... (similar structure)
└── reactjs/
    └── ... (similar structure)
```

## Development Workflows

### Adding New Templates

1. **Create template directory**
   ```bash
   mkdir -p templates/framework/language/template-name
   ```

2. **Add template files**
   - Include all necessary files for a basic project
   - Use placeholders like `{{PROJECT_NAME}}` for dynamic content
   - Include a `package.json` with appropriate dependencies

3. **Update template resolver**
   - Add your template to the appropriate framework in `src/utils/templateResolver.ts`
   - Add template metadata and configuration

4. **Test the template**
   ```bash
   node dist/index.js create test-project
   # Select your new template and verify it works
   ```

### Adding New Features

1. **Define feature structure**
   ```bash
   mkdir -p features/feature-name/framework/language
   ```

2. **Create feature files**
   - Add all necessary configuration files
   - Include installation scripts if needed
   - Add documentation files

3. **Update feature installer**
   - Add your feature to `SUPPORTED_FEATURES` in `src/utils/featureInstaller.ts`
   - Implement the installation logic

4. **Test the feature**
   ```bash
   cd existing-project
   node /path/to/pi/dist/index.js add your-feature
   ```

### Command Development

When adding or modifying commands:

1. **Update command file**
   - Commands are in `src/commands/`
   - Include proper help functionality
   - Add error handling

2. **Update index.ts**
   - Register the command in the main CLI
   - Add proper description and arguments

3. **Add help documentation**
   - Each command should have a `showCommandHelp()` function
   - Include usage examples and options

## Debugging Tips

### Local Development

```bash
# Build and test changes
pnpm run build
node dist/index.js --help

# Test specific commands
node dist/index.js create test-app
node dist/index.js check
node dist/index.js add auth
```

### Common Issues

1. **Path Resolution**: Ensure file paths work in both development and production
2. **Template Variables**: Test variable replacement in templates
3. **Dependency Installation**: Verify package manager detection and installation
4. **Cross-Platform**: Test on different operating systems

## Recognition

Contributors will be recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes for significant contributions

## Questions and Support

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and community discussions
- **Email**: For private inquiries

## License

By contributing to Package Installer CLI, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Package Installer CLI! Your efforts help make development easier and more enjoyable for developers worldwide. 🚀
