/**
 * Shared Language Configuration - Ensures consistency across all commands
 * Used by dependencyInstaller, check command, update command, and others
 */

export type SupportedLanguage = 'nodejs' | 'rust' | 'python' | 'go' | 'ruby' | 'php' | 'java' | 'csharp' | 'swift' | 'dart';

export interface LanguageConfig {
  name: string;
  displayName: string;
  packageManagers: PackageManager[];
  configFiles: ConfigFile[];
  buildFiles: string[];
  sourceFileExtensions: string[];
  frameworkDetection: FrameworkPattern[];
}

export interface PackageManager {
  name: string;
  displayName: string;
  installCommand: string;
  updateCommand?: string;
  addCommand?: string;
  lockFiles: string[];
  configFiles: string[];
  detectCommand: string;
  priority: number;
  globalFlag?: string;
}

export interface ConfigFile {
  filename: string;
  description: string;
  required: boolean;
  type: 'dependency' | 'build' | 'config' | 'lock';
  parser?: 'json' | 'toml' | 'yaml' | 'ini';
}

export interface FrameworkPattern {
  framework: string;
  patterns: string[];
  dependencies?: string[];
}

// Comprehensive language configurations
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  nodejs: {
    name: 'nodejs',
    displayName: 'Node.js',
    packageManagers: [
      {
        name: 'pnpm',
        displayName: 'pnpm',
        installCommand: 'pnpm install',
        updateCommand: 'pnpm update',
        addCommand: 'pnpm add',
        lockFiles: ['pnpm-lock.yaml'],
        configFiles: ['pnpm-workspace.yaml', '.pnpmrc'],
        detectCommand: 'pnpm --version',
        priority: 1,
        globalFlag: '-g'
      },
      {
        name: 'yarn',
        displayName: 'Yarn',
        installCommand: 'yarn install',
        updateCommand: 'yarn upgrade',
        addCommand: 'yarn add',
        lockFiles: ['yarn.lock'],
        configFiles: ['.yarnrc.yml', '.yarnrc'],
        detectCommand: 'yarn --version',
        priority: 2,
        globalFlag: 'global'
      },
      {
        name: 'npm',
        displayName: 'npm',
        installCommand: 'npm install',
        updateCommand: 'npm update',
        addCommand: 'npm install',
        lockFiles: ['package-lock.json'],
        configFiles: ['.npmrc'],
        detectCommand: 'npm --version',
        priority: 3,
        globalFlag: '-g'
      }
    ],
    configFiles: [
      { filename: 'package.json', description: 'Main package configuration', required: true, type: 'dependency', parser: 'json' },
      { filename: 'package-lock.json', description: 'npm lock file', required: false, type: 'lock', parser: 'json' },
      { filename: 'yarn.lock', description: 'Yarn lock file', required: false, type: 'lock' },
      { filename: 'pnpm-lock.yaml', description: 'pnpm lock file', required: false, type: 'lock', parser: 'yaml' },
      { filename: 'tsconfig.json', description: 'TypeScript configuration', required: false, type: 'config', parser: 'json' },
      { filename: 'jsconfig.json', description: 'JavaScript configuration', required: false, type: 'config', parser: 'json' },
      { filename: '.eslintrc.js', description: 'ESLint configuration', required: false, type: 'config' },
      { filename: '.eslintrc.json', description: 'ESLint configuration', required: false, type: 'config', parser: 'json' },
      { filename: 'jest.config.js', description: 'Jest configuration', required: false, type: 'config' },
      { filename: 'next.config.js', description: 'Next.js configuration', required: false, type: 'config' },
      { filename: 'vite.config.js', description: 'Vite configuration', required: false, type: 'config' },
      { filename: 'webpack.config.js', description: 'Webpack configuration', required: false, type: 'config' }
    ],
    buildFiles: ['dist', 'build', '.next', '.nuxt', 'out'],
    sourceFileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
    frameworkDetection: [
      { framework: 'nextjs', patterns: ['next.config.*'], dependencies: ['next'] },
      { framework: 'reactjs', patterns: ['src/App.jsx', 'src/App.tsx'], dependencies: ['react'] },
      { framework: 'vuejs', patterns: ['vue.config.*'], dependencies: ['vue'] },
      { framework: 'angular', patterns: ['angular.json'], dependencies: ['@angular/core'] },
      { framework: 'nestjs', patterns: ['nest-cli.json'], dependencies: ['@nestjs/core'] },
      { framework: 'expressjs', patterns: ['app.js', 'server.js'], dependencies: ['express'] }
    ]
  },
  rust: {
    name: 'rust',
    displayName: 'Rust',
    packageManagers: [
      {
        name: 'cargo',
        displayName: 'Cargo',
        installCommand: 'cargo build',
        updateCommand: 'cargo update',
        addCommand: 'cargo add',
        lockFiles: ['Cargo.lock'],
        configFiles: ['.cargo/config.toml'],
        detectCommand: 'cargo --version',
        priority: 1
      }
    ],
    configFiles: [
      { filename: 'Cargo.toml', description: 'Rust package manifest', required: true, type: 'dependency', parser: 'toml' },
      { filename: 'Cargo.lock', description: 'Rust lock file', required: false, type: 'lock', parser: 'toml' },
      { filename: 'rust-toolchain.toml', description: 'Rust toolchain configuration', required: false, type: 'config', parser: 'toml' }
    ],
    buildFiles: ['target'],
    sourceFileExtensions: ['.rs'],
    frameworkDetection: [
      { framework: 'actix-web', dependencies: ['actix-web'] },
      { framework: 'rocket', dependencies: ['rocket'] },
      { framework: 'warp', dependencies: ['warp'] },
      { framework: 'axum', dependencies: ['axum'] }
    ]
  },
  python: {
    name: 'python',
    displayName: 'Python',
    packageManagers: [
      {
        name: 'poetry',
        displayName: 'Poetry',
        installCommand: 'poetry install',
        updateCommand: 'poetry update',
        addCommand: 'poetry add',
        lockFiles: ['poetry.lock'],
        configFiles: ['pyproject.toml'],
        detectCommand: 'poetry --version',
        priority: 1
      },
      {
        name: 'pip',
        displayName: 'pip',
        installCommand: 'pip install -r requirements.txt',
        updateCommand: 'pip install --upgrade -r requirements.txt',
        addCommand: 'pip install',
        lockFiles: ['requirements.txt'],
        configFiles: ['pip.conf', 'pip.ini'],
        detectCommand: 'pip --version',
        priority: 2
      },
      {
        name: 'conda',
        displayName: 'Conda',
        installCommand: 'conda env update -f environment.yml',
        updateCommand: 'conda update --all',
        addCommand: 'conda install',
        lockFiles: ['environment.yml'],
        configFiles: ['.condarc'],
        detectCommand: 'conda --version',
        priority: 3
      }
    ],
    configFiles: [
      { filename: 'requirements.txt', description: 'pip requirements', required: false, type: 'dependency' },
      { filename: 'pyproject.toml', description: 'Python project configuration', required: false, type: 'dependency', parser: 'toml' },
      { filename: 'setup.py', description: 'Python setup script', required: false, type: 'build' },
      { filename: 'setup.cfg', description: 'Python setup configuration', required: false, type: 'config', parser: 'ini' },
      { filename: 'Pipfile', description: 'Pipenv configuration', required: false, type: 'dependency' },
      { filename: 'Pipfile.lock', description: 'Pipenv lock file', required: false, type: 'lock', parser: 'json' },
      { filename: 'poetry.lock', description: 'Poetry lock file', required: false, type: 'lock' },
      { filename: 'environment.yml', description: 'Conda environment', required: false, type: 'dependency', parser: 'yaml' },
      { filename: 'requirements-dev.txt', description: 'Development requirements', required: false, type: 'dependency' }
    ],
    buildFiles: ['__pycache__', 'build', 'dist', '*.egg-info'],
    sourceFileExtensions: ['.py', '.pyx', '.pyi'],
    frameworkDetection: [
      { framework: 'django', dependencies: ['Django'] },
      { framework: 'flask', dependencies: ['Flask'] },
      { framework: 'fastapi', dependencies: ['fastapi'] },
      { framework: 'tornado', dependencies: ['tornado'] }
    ]
  },
  go: {
    name: 'go',
    displayName: 'Go',
    packageManagers: [
      {
        name: 'go',
        displayName: 'Go Modules',
        installCommand: 'go mod download',
        updateCommand: 'go get -u ./...',
        addCommand: 'go get',
        lockFiles: ['go.sum'],
        configFiles: ['go.work'],
        detectCommand: 'go version',
        priority: 1
      }
    ],
    configFiles: [
      { filename: 'go.mod', description: 'Go module file', required: true, type: 'dependency' },
      { filename: 'go.sum', description: 'Go module checksums', required: false, type: 'lock' },
      { filename: 'go.work', description: 'Go workspace', required: false, type: 'config' }
    ],
    buildFiles: ['bin', 'pkg'],
    sourceFileExtensions: ['.go'],
    frameworkDetection: [
      { framework: 'gin', dependencies: ['github.com/gin-gonic/gin'] },
      { framework: 'echo', dependencies: ['github.com/labstack/echo'] },
      { framework: 'gorilla', dependencies: ['github.com/gorilla/mux'] }
    ]
  },
  ruby: {
    name: 'ruby',
    displayName: 'Ruby',
    packageManagers: [
      {
        name: 'bundler',
        displayName: 'Bundler',
        installCommand: 'bundle install',
        updateCommand: 'bundle update',
        addCommand: 'bundle add',
        lockFiles: ['Gemfile.lock'],
        configFiles: ['.bundle/config'],
        detectCommand: 'bundle --version',
        priority: 1
      },
      {
        name: 'gem',
        displayName: 'RubyGems',
        installCommand: 'gem install',
        updateCommand: 'gem update',
        addCommand: 'gem install',
        lockFiles: [],
        configFiles: ['.gemrc'],
        detectCommand: 'gem --version',
        priority: 2
      }
    ],
    configFiles: [
      { filename: 'Gemfile', description: 'Ruby dependencies', required: true, type: 'dependency' },
      { filename: 'Gemfile.lock', description: 'Bundler lock file', required: false, type: 'lock' },
      { filename: '.ruby-version', description: 'Ruby version specification', required: false, type: 'config' },
      { filename: 'config.ru', description: 'Rack configuration', required: false, type: 'config' }
    ],
    buildFiles: ['vendor', 'log', 'tmp'],
    sourceFileExtensions: ['.rb', '.rake', '.gemspec'],
    frameworkDetection: [
      { framework: 'rails', dependencies: ['rails'] },
      { framework: 'sinatra', dependencies: ['sinatra'] }
    ]
  },
  php: {
    name: 'php',
    displayName: 'PHP',
    packageManagers: [
      {
        name: 'composer',
        displayName: 'Composer',
        installCommand: 'composer install',
        updateCommand: 'composer update',
        addCommand: 'composer require',
        lockFiles: ['composer.lock'],
        configFiles: ['composer.json'],
        detectCommand: 'composer --version',
        priority: 1
      }
    ],
    configFiles: [
      { filename: 'composer.json', description: 'Composer configuration', required: true, type: 'dependency', parser: 'json' },
      { filename: 'composer.lock', description: 'Composer lock file', required: false, type: 'lock', parser: 'json' },
      { filename: 'artisan', description: 'Laravel artisan command', required: false, type: 'build' }
    ],
    buildFiles: ['vendor', 'bootstrap/cache'],
    sourceFileExtensions: ['.php'],
    frameworkDetection: [
      { framework: 'laravel', dependencies: ['laravel/framework'] },
      { framework: 'symfony', dependencies: ['symfony/symfony'] },
      { framework: 'slim', dependencies: ['slim/slim'] }
    ]
  },
  java: {
    name: 'java',
    displayName: 'Java',
    packageManagers: [
      {
        name: 'maven',
        displayName: 'Maven',
        installCommand: 'mvn compile',
        updateCommand: 'mvn versions:use-latest-versions',
        addCommand: 'mvn dependency:get',
        lockFiles: [],
        configFiles: ['pom.xml'],
        detectCommand: 'mvn --version',
        priority: 1
      },
      {
        name: 'gradle',
        displayName: 'Gradle',
        installCommand: './gradlew build',
        updateCommand: './gradlew dependencyUpdates',
        addCommand: './gradlew dependencies',
        lockFiles: ['gradle.lockfile'],
        configFiles: ['build.gradle', 'build.gradle.kts'],
        detectCommand: 'gradle --version',
        priority: 2
      }
    ],
    configFiles: [
      { filename: 'pom.xml', description: 'Maven configuration', required: false, type: 'dependency' },
      { filename: 'build.gradle', description: 'Gradle build script', required: false, type: 'build' },
      { filename: 'build.gradle.kts', description: 'Gradle Kotlin build script', required: false, type: 'build' },
      { filename: 'gradle.properties', description: 'Gradle properties', required: false, type: 'config' }
    ],
    buildFiles: ['target', 'build', '.gradle'],
    sourceFileExtensions: ['.java', '.kt', '.scala'],
    frameworkDetection: [
      { framework: 'spring', dependencies: ['org.springframework'] },
      { framework: 'quarkus', dependencies: ['io.quarkus'] }
    ]
  },
  csharp: {
    name: 'csharp',
    displayName: 'C#',
    packageManagers: [
      {
        name: 'dotnet',
        displayName: '.NET CLI',
        installCommand: 'dotnet restore',
        updateCommand: 'dotnet list package --outdated',
        addCommand: 'dotnet add package',
        lockFiles: ['packages.lock.json'],
        configFiles: ['nuget.config'],
        detectCommand: 'dotnet --version',
        priority: 1
      }
    ],
    configFiles: [
      { filename: '*.csproj', description: 'C# project file', required: true, type: 'dependency' },
      { filename: '*.sln', description: 'Solution file', required: false, type: 'build' },
      { filename: 'global.json', description: 'Global .NET configuration', required: false, type: 'config', parser: 'json' },
      { filename: 'nuget.config', description: 'NuGet configuration', required: false, type: 'config' }
    ],
    buildFiles: ['bin', 'obj'],
    sourceFileExtensions: ['.cs', '.vb', '.fs'],
    frameworkDetection: [
      { framework: 'aspnet', dependencies: ['Microsoft.AspNetCore'] }
    ]
  },
  swift: {
    name: 'swift',
    displayName: 'Swift',
    packageManagers: [
      {
        name: 'swift',
        displayName: 'Swift Package Manager',
        installCommand: 'swift package resolve',
        updateCommand: 'swift package update',
        addCommand: 'swift package add',
        lockFiles: ['Package.resolved'],
        configFiles: ['Package.swift'],
        detectCommand: 'swift --version',
        priority: 1
      }
    ],
    configFiles: [
      { filename: 'Package.swift', description: 'Swift package manifest', required: true, type: 'dependency' },
      { filename: 'Package.resolved', description: 'Swift package lock file', required: false, type: 'lock', parser: 'json' }
    ],
    buildFiles: ['.build'],
    sourceFileExtensions: ['.swift'],
    frameworkDetection: []
  },
  dart: {
    name: 'dart',
    displayName: 'Dart/Flutter',
    packageManagers: [
      {
        name: 'pub',
        displayName: 'Pub',
        installCommand: 'dart pub get',
        updateCommand: 'dart pub upgrade',
        addCommand: 'dart pub add',
        lockFiles: ['pubspec.lock'],
        configFiles: ['pubspec.yaml'],
        detectCommand: 'dart --version',
        priority: 1
      },
      {
        name: 'flutter',
        displayName: 'Flutter',
        installCommand: 'flutter pub get',
        updateCommand: 'flutter pub upgrade',
        addCommand: 'flutter pub add',
        lockFiles: ['pubspec.lock'],
        configFiles: ['pubspec.yaml'],
        detectCommand: 'flutter --version',
        priority: 1
      }
    ],
    configFiles: [
      { filename: 'pubspec.yaml', description: 'Dart/Flutter configuration', required: true, type: 'dependency', parser: 'yaml' },
      { filename: 'pubspec.lock', description: 'Pub lock file', required: false, type: 'lock', parser: 'yaml' }
    ],
    buildFiles: ['build'],
    sourceFileExtensions: ['.dart'],
    frameworkDetection: [
      { framework: 'flutter', dependencies: ['flutter'] }
    ]
  }
};

/**
 * Get all supported languages
 */
export function getSupportedLanguages(): SupportedLanguage[] {
  return Object.keys(LANGUAGE_CONFIGS) as SupportedLanguage[];
}

/**
 * Get language configuration by name
 */
export function getLanguageConfig(language: SupportedLanguage): LanguageConfig | null {
  return LANGUAGE_CONFIGS[language] || null;
}

/**
 * Get all config files for all languages
 */
export function getAllConfigFiles(): string[] {
  const allFiles = new Set<string>();
  
  Object.values(LANGUAGE_CONFIGS).forEach(config => {
    config.configFiles.forEach(file => {
      allFiles.add(file.filename);
    });
    config.packageManagers.forEach(pm => {
      pm.lockFiles.forEach(file => allFiles.add(file));
      pm.configFiles.forEach(file => allFiles.add(file));
    });
  });
  
  return Array.from(allFiles);
}

/**
 * Detect language from config files
 */
export function detectLanguageFromFiles(files: string[]): SupportedLanguage[] {
  const detected: SupportedLanguage[] = [];
  const fileSet = new Set(files.map(f => f.split('/').pop() || f));
  
  for (const [language, config] of Object.entries(LANGUAGE_CONFIGS)) {
    const hasRequiredFile = config.configFiles
      .filter(cf => cf.required)
      .some(cf => fileSet.has(cf.filename));
    
    const hasAnyFile = config.configFiles
      .some(cf => fileSet.has(cf.filename)) || 
      config.packageManagers.some(pm => 
        pm.lockFiles.some(lf => fileSet.has(lf)) ||
        pm.configFiles.some(cf => fileSet.has(cf))
      );
    
    if (hasRequiredFile || hasAnyFile) {
      detected.push(language as SupportedLanguage);
    }
  }
  
  return detected;
}

/**
 * Get package manager for language by priority
 */
export function getPreferredPackageManager(language: SupportedLanguage): PackageManager | null {
  const config = LANGUAGE_CONFIGS[language];
  if (!config) return null;
  
  return config.packageManagers.sort((a, b) => a.priority - b.priority)[0] || null;
}

/**
 * Check if file matches any language patterns
 */
export function matchesLanguagePattern(filename: string): SupportedLanguage[] {
  const matches: SupportedLanguage[] = [];
  
  Object.entries(LANGUAGE_CONFIGS).forEach(([lang, config]) => {
    const isConfigFile = config.configFiles.some(cf => 
      cf.filename.includes('*') ? 
        new RegExp(cf.filename.replace('*', '.*')).test(filename) :
        cf.filename === filename
    );
    
    const isLockFile = config.packageManagers.some(pm =>
      pm.lockFiles.includes(filename) ||
      pm.configFiles.includes(filename)
    );
    
    if (isConfigFile || isLockFile) {
      matches.push(lang as SupportedLanguage);
    }
  });
  
  return matches;
}
