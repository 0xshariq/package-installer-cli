# frozen_string_literal: true

require "bundler/gem_tasks"
require "rspec/core/rake_task"

RSpec::Core::RakeTask.new(:spec)

require "rubocop/rake_task"

RuboCop::RakeTask.new

task default: %i[spec rubocop]

desc "Build and install the gem locally"
task :install_local do
  sh "gem build package-installer-cli.gemspec"
  sh "gem install package-installer-cli-*.gem"
end

desc "Clean up built gems"
task :clean do
  sh "rm -f package-installer-cli-*.gem"
end

desc "Prepare release"
task :prepare_release => [:clean, :build] do
  puts "✅ Gem built successfully!"
  puts "📦 To publish to RubyGems, run: gem push package-installer-cli-*.gem"
end

desc "Check if bundled dependencies are available"
task :check_deps do
  puts "🔍 Checking bundled dependencies..."
  
  # Check if vendor/bundle exists
  if File.directory?('vendor/bundle')
    puts "✅ Bundled dependencies found at vendor/bundle"
  else
    puts "❌ Bundled dependencies not found. Please run 'bundle install --deployment'"
    exit 1
  end
  
  puts "🎉 All bundled dependencies are ready!"
end

desc "Test the CLI"
task :test_cli => :check_deps do
  puts "🧪 Testing CLI..."
  system('ruby exe/pi --help')
end