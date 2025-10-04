// Bundle configuration for distuting to other package managers
import { build } from 'esbuild';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bundleDir = './bundle';

async function createBundle() {
  console.log('🚀 Starting bundle creation...');

  // Clean previous bundle
  await fs.remove(bundleDir);
  await fs.ensureDir(`${bundleDir}/standalone`);
  await fs.ensureDir(`${bundleDir}/executables`);
  await fs.ensureDir(`${bundleDir}/assets`);

  try {
    // 1. Build TypeScript to JavaScript first
    console.log('📦 Building TypeScript...');
    execSync('npm run build', { stdio: 'inherit' });

    // 2. Create standalone ESM bundle with all dependencies
    console.log('🔗 Creating standalone ESM bundle...');
    await build({
      entryPoints: ['./dist/index.js'],
      bundle: true,
      platform: 'node',
      target: 'node22',
      outfile: `${bundleDir}/standalone/index.js`,
      format: 'esm',
      minify: true,
      sourcemap: false,
      external: [], // Bundle everything
      banner: {
        js: '#!/usr/bin/env node\n'
      },
      define: {
        'process.env.NODE_ENV': '"production"',
        'process.env.BUNDLED': '"true"'
      },
      loader: {
        '.json': 'json',
        '.txt': 'text'
      },
      mainFields: ['module', 'main'],
      conditions: ['import', 'module', 'default']
    });

    // 3. Create ESM bundle for pkg (pkg now supports ESM with newer versions)
    console.log('🔗 Creating ESM bundle for executables...');
    await build({
      entryPoints: ['./dist/index.js'],
      bundle: true,
      platform: 'node',
      target: 'node22',
      outfile: `${bundleDir}/pkg-ready/index.js`,
      format: 'esm',
      minify: false, // Keep unminified for pkg compatibility
      sourcemap: false,
      external: [], // Bundle everything
      banner: {
        js: '#!/usr/bin/env node\n'
      },
      define: {
        'process.env.NODE_ENV': '"production"',
        'process.env.BUNDLED': '"true"'
      },
      loader: {
        '.json': 'json',
        '.txt': 'text'
      },
      mainFields: ['module', 'main'],
      conditions: ['import', 'module', 'default']
    });

    // 4. Copy all required assets
    console.log('📁 Copying assets...');
    await fs.ensureDir(`${bundleDir}/pkg-ready`);
    
    // Copy assets to bundle directory
    await fs.copy('./templates', `${bundleDir}/assets/templates`);
    await fs.copy('./features', `${bundleDir}/assets/features`);
    await fs.copy('./template.json', `${bundleDir}/assets/template.json`);
    
    // Copy dist folder for complete bundle
    await fs.copy('./dist', `${bundleDir}/assets/dist`);
    
    // Copy package.json for version info
    await fs.copy('./package.json', `${bundleDir}/assets/package.json`);

    // Copy assets to pkg-ready directory as well for executable building
    await fs.copy('./templates', `${bundleDir}/pkg-ready/templates`);
    await fs.copy('./features', `${bundleDir}/pkg-ready/features`);
    await fs.copy('./template.json', `${bundleDir}/pkg-ready/template.json`);

    // 5. Create executables using pkg with ESM bundle
    console.log('⚙️ Creating executables...');
    
    // Create package.json for pkg in the pkg-ready directory
    const originalPkg = await fs.readJson('./package.json');
    const pkgPackageJson = {
      "name": originalPkg.name,
      "version": originalPkg.version,
      "type": "module",
      "main": "index.js",
      "bin": {
        "pi": "index.js",
        "package-installer": "index.js"
      }
    };
    await fs.writeJson(`${bundleDir}/pkg-ready/package.json`, pkgPackageJson, { spaces: 2 });
    
    // Use pkg with the bundled ESM file
    execSync(`pkg ${bundleDir}/pkg-ready --out-path ${bundleDir}/executables --compress Gzip --targets node22-linux-x64,node22-macos-x64,node22-win-x64`, { stdio: 'inherit' });

    // 6. Create distribution info
    const packageJson = await fs.readJson('./package.json');
    const bundleInfo = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      bundleDate: new Date().toISOString(),
      format: 'ESM (ECMAScript Modules)',
      nodeVersion: 'Node.js 20+',
      files: {
        standalone: 'standalone/index.js (ESM bundle for direct Node.js execution)',
        executables: {
          linux: 'executables/pkg-ready-linux',
          macos: 'executables/pkg-ready-macos', 
          windows: 'executables/pkg-ready-win.exe'
        },
        assets: {
          templates: 'assets/templates/ (all project templates)',
          features: 'assets/features/ (all feature definitions)',
          templateConfig: 'assets/template.json (template configuration)',
          dist: 'assets/dist/ (compiled TypeScript)',
          packageJson: 'assets/package.json (version and metadata)'
        }
      },
      usage: {
        standalone: 'node standalone/index.js [command] [options]',
        executable: './executables/pkg-ready-linux [command] [options] (or equivalent for your platform)'
      },
      bundleContents: {
        allDependencies: 'All npm dependencies bundled using ESM format',
        templates: 'Complete template library for React, Next.js, Vue, Angular, etc.',
        features: 'Feature definitions for auth, database, AWS, Docker, etc.',
        config: 'Template configuration and metadata',
        crossPlatform: 'Native executables for Linux, macOS, and Windows',
        noWarnings: 'ESM-only bundle eliminates import.meta compatibility issues'
      }
    };

    await fs.writeJson(`${bundleDir}/bundle-info.json`, bundleInfo, { spaces: 2 });

    console.log('✅ Bundle created successfully!');
    console.log(`📦 Bundle location: ${path.resolve(bundleDir)}`);
    console.log('\n🎯 Bundle contents:');
    console.log('  - standalone/index.js (ESM bundle with all dependencies)');
    console.log('  - executables/ (native executables for Linux, macOS, Windows)');
    console.log('  - assets/templates/ (all project templates)');
    console.log('  - assets/features/ (all feature definitions)'); 
    console.log('  - assets/template.json (template configuration)');
    console.log('  - assets/dist/ (compiled TypeScript)');
    console.log('  - assets/package.json (version and metadata)');
    console.log('  - bundle-info.json (metadata and usage instructions)');
    console.log('\n✨ Features:');
    console.log('  ✅ Pure ESM format (no import.meta warnings)');
    console.log('  ✅ All dependencies bundled');
    console.log('  ✅ Cross-platform executables');
    console.log('  ✅ Complete template and feature library');
    console.log('  ✅ Ready for distribution to other package managers');

  } catch (error) {
    console.error('❌ Bundle creation failed:', error);
    process.exit(1);
  }
}

// Run the bundle creation
createBundle().catch(console.error);