import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

interface CapistranoConfig {
  appName: string;
  repository: string;
  deployTo: string;
  servers: Array<{
    host: string;
    user: string;
    roles: string[];
  }>;
  rubyVersion: string;
  framework: 'rails' | 'sinatra' | 'custom';
  webServer: 'nginx' | 'apache' | 'passenger';
  appServer: 'unicorn' | 'puma' | 'thin' | 'passenger';
}

export async function deployToCapistrano(): Promise<void> {
  console.log(chalk.blue('💎 Starting Capistrano deployment setup...'));

  // Check if this is a Ruby project
  if (!fs.existsSync('Gemfile') && !fs.existsSync('Gemfile.lock')) {
    console.log(chalk.red('❌ This doesn\'t appear to be a Ruby project.'));
    console.log(chalk.yellow('Capistrano is designed for Ruby applications. Please ensure you have a Gemfile.'));
    return;
  }

  // Check if Capistrano is installed
  if (!isCapistranoInstalled()) {
    console.log(chalk.yellow('⚠️  Capistrano is not installed. Installing...'));
    await installCapistrano();
  }

  // Check if Git is initialized
  if (!isGitInitialized()) {
    console.log(chalk.red('❌ Git repository is not initialized.'));
    console.log(chalk.yellow('Capistrano requires a Git repository for deployment.'));
    return;
  }

  const config = await getCapistranoConfig();
  
  try {
    await setupCapistrano(config);
    console.log(chalk.green('✅ Capistrano deployment setup completed!'));
    console.log(chalk.blue('📖 Next steps:'));
    console.log(chalk.gray('1. Configure your servers in config/deploy/production.rb'));
    console.log(chalk.gray('2. Set up your server with: cap production deploy:setup'));
    console.log(chalk.gray('3. Deploy your application: cap production deploy'));
  } catch (error) {
    console.log(chalk.red('❌ Setup failed:'), error);
  }
}

function isCapistranoInstalled(): boolean {
  try {
    execSync('cap --version', { stdio: 'ignore' });
    return true;
  } catch {
    // Check if it's in Gemfile
    if (fs.existsSync('Gemfile')) {
      const gemfile = fs.readFileSync('Gemfile', 'utf8');
      return gemfile.includes('capistrano');
    }
    return false;
  }
}

async function installCapistrano(): Promise<void> {
  try {
    // Add to Gemfile if not present
    if (fs.existsSync('Gemfile')) {
      const gemfile = fs.readFileSync('Gemfile', 'utf8');
      if (!gemfile.includes('capistrano')) {
        const capistranoGems = `
# Deployment
group :development do
  gem 'capistrano', '~> 3.18'
  gem 'capistrano-rails', '~> 1.6'
  gem 'capistrano-passenger', '~> 0.2.1'
  gem 'capistrano-rbenv', '~> 2.2'
  gem 'capistrano3-puma', '~> 5.2'
end
`;
        fs.appendFileSync('Gemfile', capistranoGems);
        console.log(chalk.green('📄 Added Capistrano gems to Gemfile'));
      }
    }

    console.log(chalk.blue('📦 Installing Capistrano gems...'));
    execSync('bundle install', { stdio: 'inherit' });
    console.log(chalk.green('✅ Capistrano installed successfully'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to install Capistrano'));
    throw error;
  }
}

function isGitInitialized(): boolean {
  try {
    return fs.existsSync('.git');
  } catch {
    return false;
  }
}

async function getCapistranoConfig(): Promise<CapistranoConfig> {
  // Detect framework
  let defaultFramework: 'rails' | 'sinatra' | 'custom' = 'custom';
  if (fs.existsSync('config/application.rb')) defaultFramework = 'rails';
  if (fs.existsSync('config.ru') && !fs.existsSync('config/application.rb')) defaultFramework = 'sinatra';

  // Get git repository URL
  let defaultRepository = '';
  try {
    defaultRepository = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  } catch {
    // No remote configured
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'appName',
      message: 'Enter application name:',
      default: path.basename(process.cwd()),
      validate: (input: string) => input.trim().length > 0 || 'Application name is required'
    },
    {
      type: 'input',
      name: 'repository',
      message: 'Enter Git repository URL:',
      default: defaultRepository,
      validate: (input: string) => {
        if (!input.trim()) return 'Repository URL is required';
        if (!input.includes('git') && !input.includes('github') && !input.includes('gitlab')) {
          return 'Please enter a valid Git repository URL';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'deployTo',
      message: 'Enter deployment path on server:',
      default: '/var/www/html',
      validate: (input: string) => input.trim().length > 0 || 'Deployment path is required'
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Select Ruby framework:',
      choices: [
        { name: 'Ruby on Rails', value: 'rails' },
        { name: 'Sinatra', value: 'sinatra' },
        { name: 'Custom Ruby Application', value: 'custom' }
      ],
      default: defaultFramework
    },
    {
      type: 'input',
      name: 'rubyVersion',
      message: 'Enter Ruby version:',
      default: detectRubyVersion(),
      validate: (input: string) => {
        if (!input.trim()) return 'Ruby version is required';
        if (!/^\d+\.\d+\.\d+$/.test(input)) return 'Ruby version should be in format X.Y.Z';
        return true;
      }
    },
    {
      type: 'list',
      name: 'webServer',
      message: 'Select web server:',
      choices: [
        { name: 'Nginx', value: 'nginx' },
        { name: 'Apache', value: 'apache' },
        { name: 'Passenger Standalone', value: 'passenger' }
      ],
      default: 'nginx'
    },
    {
      type: 'list',
      name: 'appServer',
      message: 'Select application server:',
      choices: [
        { name: 'Puma', value: 'puma' },
        { name: 'Unicorn', value: 'unicorn' },
        { name: 'Thin', value: 'thin' },
        { name: 'Passenger', value: 'passenger' }
      ],
      default: 'puma'
    }
  ]);

  // Get server configuration
  const servers: Array<{ host: string; user: string; roles: string[] }> = [];
  let addMore = true;

  while (addMore) {
    const serverConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'host',
        message: 'Enter server hostname or IP:',
        validate: (input: string) => input.trim().length > 0 || 'Server hostname is required'
      },
      {
        type: 'input',
        name: 'user',
        message: 'Enter SSH username:',
        default: 'deploy',
        validate: (input: string) => input.trim().length > 0 || 'SSH username is required'
      },
      {
        type: 'checkbox',
        name: 'roles',
        message: 'Select server roles:',
        choices: [
          { name: 'Web Server', value: 'web', checked: true },
          { name: 'Application Server', value: 'app', checked: true },
          { name: 'Database Server', value: 'db' },
          { name: 'Background Jobs', value: 'job' }
        ],
        validate: (input: string[]) => input.length > 0 || 'Select at least one role'
      },
      {
        type: 'confirm',
        name: 'addAnother',
        message: 'Add another server?',
        default: false
      }
    ]);

    servers.push({
      host: serverConfig.host,
      user: serverConfig.user,
      roles: serverConfig.roles
    });

    addMore = serverConfig.addAnother;
  }

  return { ...answers, servers };
}

function detectRubyVersion(): string {
  try {
    // Check .ruby-version file
    if (fs.existsSync('.ruby-version')) {
      return fs.readFileSync('.ruby-version', 'utf8').trim();
    }

    // Check Gemfile
    if (fs.existsSync('Gemfile')) {
      const gemfile = fs.readFileSync('Gemfile', 'utf8');
      const rubyMatch = gemfile.match(/ruby ['"]([^'"]+)['"]/);
      if (rubyMatch) return rubyMatch[1];
    }

    // Get system Ruby version
    const rubyVersion = execSync('ruby --version', { encoding: 'utf8' });
    const versionMatch = rubyVersion.match(/ruby (\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : '3.2.0';
  } catch {
    return '3.2.0';
  }
}

async function setupCapistrano(config: CapistranoConfig): Promise<void> {
  console.log(chalk.blue('⚙️ Setting up Capistrano configuration...'));

  // Initialize Capistrano
  try {
    execSync('bundle exec cap install', { stdio: 'inherit' });
    console.log(chalk.green('📄 Initialized Capistrano configuration'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Capistrano already initialized or failed to initialize'));
  }

  // Create deploy.rb
  await createDeployConfig(config);

  // Create stage configurations
  await createStageConfigs(config);

  // Create additional configuration files
  await createAdditionalConfigs(config);

  console.log(chalk.green('📄 Capistrano configuration completed'));
}

async function createDeployConfig(config: CapistranoConfig): Promise<void> {
  const deployConfig = `# config/deploy.rb
lock "~> 3.18.0"

set :application, "${config.appName}"
set :repo_url, "${config.repository}"

# Default branch is :master
ask :branch, \`git rev-parse --abbrev-ref HEAD\`.chomp

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, "${config.deployTo}"

# Default value for :format is :airbrussh.
set :format, :airbrussh

# You can configure the Airbrussh format using :format_options.
set :format_options, command_output: true, log_file: "log/capistrano.log", color: :auto, truncate: :auto

# Default value for :pty is false
set :pty, true

# Default value for :linked_files is []
append :linked_files, "config/database.yml", "config/master.key"

# Default value for linked_dirs is []
append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "public/system", "vendor", "storage"

# Default value for default_env is {}
set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for local_user is ENV['USER']
set :local_user, -> { \`whoami\`.chomp }

# Default value for keep_releases is 5
set :keep_releases, 5

# Uncomment the following to require manually verifying the host key before first deploy.
# set :ssh_options, verify_host_key: :secure

${config.framework === 'rails' ? `
# Rails specific configuration
set :migration_role, :app
set :conditionally_migrate, true
set :assets_roles, [:web, :app]
set :normalize_asset_timestamps, %w{public/images public/javascripts public/stylesheets}
` : ''}

${config.appServer === 'puma' ? `
# Puma configuration
set :puma_threads,    [4, 16]
set :puma_workers,    0
set :puma_bind,       "unix://#{shared_path}/tmp/sockets/#{fetch(:application)}-puma.sock"
set :puma_state,      "#{shared_path}/tmp/pids/puma.state"
set :puma_pid,        "#{shared_path}/tmp/pids/puma.pid"
set :puma_access_log, "#{release_path}/log/puma.error.log"
set :puma_error_log,  "#{release_path}/log/puma.access.log"
set :puma_preload_app, true
set :puma_worker_timeout, nil
set :puma_init_active_record, true
` : ''}

# Ruby version
set :rbenv_type, :user
set :rbenv_ruby, "${config.rubyVersion}"

# Restart application after deployment
namespace :deploy do
  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      # Here we can do anything such as:
      # within release_path do
      #   execute :rake, 'cache:clear'
      # end
    end
  end
end
`;

  fs.writeFileSync('config/deploy.rb', deployConfig);
  console.log(chalk.green('📄 Created config/deploy.rb'));
}

async function createStageConfigs(config: CapistranoConfig): Promise<void> {
  const productionConfig = `# config/deploy/production.rb

${config.servers.map(server => 
  `server "${server.host}", user: "${server.user}", roles: %w{${server.roles.join(' ')}}`
).join('\n')}

# server-based syntax
# ======================
# Defines a single server with a list of roles and multiple properties.
# You can define all roles on a single server, or split them:

# server "example.com", user: "deploy", roles: %w{app db web}, my_property: :my_value
# server "example.com", user: "deploy", roles: %w{app web}, other_property: :other_value
# server "db.example.com", user: "deploy", roles: %w{db}

# role-based syntax
# ==================
# Defines a role with one or multiple servers. The primary server in each
# group is considered to be the first unless any hosts have the primary
# property set. Specify the username and a domain or IP for the server.
# Don't use \`:all\`, it's a meta role.

${(() => {
  const roleMap = config.servers.reduce((acc, server) => {
    server.roles.forEach(role => {
      if (!acc[role]) acc[role] = [];
      acc[role].push(server.host);
    });
    return acc;
  }, {} as Record<string, string[]>);
  
  return Object.entries(roleMap).map(([role, hosts]) => 
    `# role :${role}, %w{${[...new Set(hosts)].join(' ')}}`
  ).join('\n');
})()}

# Configuration
# =============
# You can set any configuration variable like in config/deploy.rb
# These variables are then only loaded and set in this stage.
# For available Capistrano configuration variables see the documentation page.
# http://capistranorb.com/documentation/getting-started/configuration/
# Feel free to add new variables to customise your setup.

# Custom SSH Options
# ==================
# You may pass any option but keep in mind that net/ssh understands a
# limited set of options, consult the Net::SSH documentation.
# http://net-ssh.github.io/net-ssh/classes/Net/SSH.html#method-c-start
#
# Global options
# --------------
set :ssh_options, {
  keys: %w(~/.ssh/id_rsa),
  forward_agent: true,
  auth_methods: %w(publickey)
}
`;

  fs.writeFileSync('config/deploy/production.rb', productionConfig);
  console.log(chalk.green('📄 Created config/deploy/production.rb'));

  // Create staging configuration
  const stagingConfig = productionConfig.replace(/production/g, 'staging');
  fs.writeFileSync('config/deploy/staging.rb', stagingConfig);
  console.log(chalk.green('📄 Created config/deploy/staging.rb'));
}

async function createAdditionalConfigs(config: CapistranoConfig): Promise<void> {
  // Create Capfile
  const capfile = `# Load DSL and set up stages
require "capistrano/setup"

# Include default deployment tasks
require "capistrano/deploy"

# Load the SCM plugin appropriate to your project:
require "capistrano/scm/git"
install_plugin Capistrano::SCM::Git

# Include tasks from other gems included in your Gemfile
${config.framework === 'rails' ? `
require "capistrano/rails/assets"
require "capistrano/rails/migrations"
` : ''}
require "capistrano/rbenv"
${config.appServer === 'puma' ? 'require "capistrano3/puma"' : ''}
${config.webServer === 'passenger' ? 'require "capistrano/passenger"' : ''}

# Load custom tasks from \`lib/capistrano/tasks\` if you have any defined
Dir.glob("lib/capistrano/tasks/*.rake").each { |r| import r }

${config.appServer === 'puma' ? `
# Puma tasks
install_plugin Capistrano3::Puma::Systemd
` : ''}
`;

  fs.writeFileSync('Capfile', capfile);
  console.log(chalk.green('📄 Created Capfile'));

  // Create lib/capistrano/tasks directory for custom tasks
  const tasksDir = 'lib/capistrano/tasks';
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
    
    // Create example custom task
    const customTask = `# lib/capistrano/tasks/custom.rake
namespace :custom do
  desc "Restart application"
  task :restart do
    on roles(:app), in: :sequence, wait: 5 do
      # Your custom restart logic here
      execute :touch, release_path.join('tmp/restart.txt')
    end
  end

  desc "Check application status"
  task :status do
    on roles(:app) do
      execute "ps aux | grep ${config.appName}"
    end
  end
end
`;
    
    fs.writeFileSync(`${tasksDir}/custom.rake`, customTask);
    console.log(chalk.green('📄 Created custom Capistrano tasks'));
  }
}
