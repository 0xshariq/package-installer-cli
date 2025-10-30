Gem::Specification.new do |spec|
  spec.name          = "package-installer-cli"
  spec.version       = "2.5.0"
  spec.authors       = ["sharique"]
  spec.email         = ["khanshariq92213@gmail.com"]

  spec.summary       = "A cross-platform, interactive CLI to scaffold modern web app templates"
  spec.description   = "A cross-platform, interactive CLI to scaffold modern web application templates with framework, language, UI, bundler support and feature integration. Built with Ruby and includes all dependencies bundled."
  spec.homepage      = "https://github.com/0xshariq/package_installer_cli"
  spec.license       = "MIT"
  spec.required_ruby_version = ">= 2.6.0"

  spec.metadata["source_url"] = "https://github.com/0xshariq/package-installer-cli"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/0xshariq/package_installer_cli"
  spec.metadata["changelog_uri"] = "https://github.com/0xshariq/package_installer_cli/blob/main/CHANGELOG.md"
  spec.metadata["bug_tracker_uri"] = "https://github.com/0xshariq/package_installer_cli/issues"

  # No extensions needed - all dependencies are bundled


  # Specify which files should be added to the gem when it is released.
  spec.files = Dir.glob([
    "lib/**/*",
    "exe/*",
    "bundle-standalone/**/*",
    "vendor/**/*",
    "Gemfile",
    "Gemfile.lock",
    "README.md",
    "CHANGELOG.md",
    "LICENSE*"
  ]).select { |f| File.file?(f) }
  
  spec.bindir        = "exe"
  spec.executables   = ["pi", "package-installer"]
  spec.require_paths = ["lib"]

  # Runtime dependencies
  # All dependencies are bundled in vendor/bundle
  
  # Development dependencies
  spec.add_development_dependency "bundler", "~> 2.0"
  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "rspec", "~> 3.0"

  # Post-install message
  spec.post_install_message = <<~MSG
    🎉 Package Installer CLI has been installed successfully!
    
    📋 System Requirements:
    ✅ Ruby >= 2.6.0 (you're good to go!)
    ✅ All dependencies are bundled - no additional setup required!
    
    🚀 Quick Start:
      pi create        # Create a new project interactively
      pi analyze       # Analyze existing project structure
      pi doctor        # Run system diagnostics
      pi --help        # Show all available commands
    
     If 'pi' command is not found, add gem binaries to PATH:
      echo 'export PATH="$(gem environment | grep "EXECUTABLE DIRECTORY" | cut -d: -f2 | tr -d " "):$PATH"' >> ~/.bashrc
      source ~/.bashrc
    
    🆘 Need help?
      • Visit: https://github.com/0xshariq/package_installer_cli
      • Issues: https://github.com/0xshariq/package_installer_cli/issues
    
    💎 Happy coding with Package Installer CLI!
  MSG
end