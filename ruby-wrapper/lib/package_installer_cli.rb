#!/usr/bin/env ruby

module PackageInstallerCli
  VERSION = "2.0.0"
  
  class << self
    def run(args = ARGV)
      # Get the path to the bundle-standalone pi executable
      standalone_pi_path = File.join(gem_root, 'bundle-standalone', 'pi')
      
      # Check if bundle-standalone pi exists
      unless File.exist?(standalone_pi_path)
        puts "❌ Error: Standalone pi command not found at #{standalone_pi_path}"
        puts "Please ensure the package is properly installed with bundled dependencies."
        exit 1
      end
      
      # Make sure the pi file is executable
      unless File.executable?(standalone_pi_path)
        puts "❌ Error: Standalone pi command is not executable"
        puts "Run: chmod +x #{standalone_pi_path}"
        exit 1
      end
      
      # Set up environment for bundle-standalone
      setup_standalone_environment
      
      # Execute the standalone pi command with all arguments
      begin
        exec(standalone_pi_path, *args)
      rescue Errno::ENOENT => e
        puts "❌ Error: Failed to execute standalone pi command: #{e.message}"
        exit 1
      rescue SystemExit => e
        exit e.status
      rescue Exception => e
        puts "❌ Unexpected error: #{e.message}"
        exit 1
      end
    end
    
    private
    
    def gem_root
      # Try multiple methods to find the gem root directory
      # Method 1: Standard relative path from this file
      standard_root = File.expand_path('..', __dir__)
      return standard_root if valid_gem_root?(standard_root)
      
      # Method 2: Use Gem specification if available
      begin
        gem_spec = Gem::Specification.find_by_name('package-installer-cli')
        return gem_spec.gem_dir if gem_spec && valid_gem_root?(gem_spec.gem_dir)
      rescue Gem::LoadError
        # Gem not found via specification
      end
      
      # Method 3: Search through gem paths
      gem_paths = Gem.path + [Gem.default_dir]
      gem_paths.each do |gem_path|
        potential_dirs = Dir.glob(File.join(gem_path, 'gems', 'package-installer-cli-*'))
        potential_dirs.each do |dir|
          return dir if valid_gem_root?(dir)
        end
      end
      
      # Method 4: Try bundler context (for local installations)
      if defined?(Bundler) && Bundler.rubygems.loaded_specs('package-installer-cli')
        spec = Bundler.rubygems.loaded_specs('package-installer-cli')
        return spec.gem_dir if spec && valid_gem_root?(spec.gem_dir)
      end
      
      # Fallback: return the standard path
      standard_root
    end
    
    def valid_gem_root?(path)
      return false unless path && File.directory?(path)
      # Check if bundle-standalone directory exists
      File.directory?(File.join(path, 'bundle-standalone'))
    end
    
    def setup_standalone_environment
      bundle_standalone_path = File.join(gem_root, 'bundle-standalone')
      
      # Set NODE_PATH to include bundle-standalone node_modules if it exists
      node_modules_path = File.join(bundle_standalone_path, 'node_modules')
      if File.directory?(node_modules_path)
        ENV['NODE_PATH'] = "#{node_modules_path}:#{ENV['NODE_PATH']}"
      end
      
      # Change to bundle-standalone directory for execution context
      Dir.chdir(bundle_standalone_path) if File.directory?(bundle_standalone_path)
    rescue => e
      # Continue if we can't change directory or set environment
      puts "⚠️  Warning: Could not setup standalone environment: #{e.message}"
    end
  end
end
