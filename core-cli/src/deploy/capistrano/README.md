# Capistrano Deployment

Automate deployment of Ruby applications with Capistrano, the remote server automation and deployment tool.

## Prerequisites

### 1. Ruby Project

Ensure you have a Ruby project with a `Gemfile`:

```ruby
# Gemfile
source 'https://rubygems.org'

gem 'rails', '~> 7.0'

group :development do
  gem 'capistrano', '~> 3.18'
  gem 'capistrano-rails', '~> 1.6'
  gem 'capistrano-passenger', '~> 0.2.1'
  gem 'capistrano-rbenv', '~> 2.2'
  gem 'capistrano3-puma', '~> 5.2'
end
```

### 2. Git Repository

Capistrano requires a Git repository for deployment:

```bash
git init
git remote add origin https://github.com/yourusername/yourapp.git
```

### 3. Server Access

- SSH access to deployment servers
- Proper user permissions
- Ruby installed on servers

## Usage

```bash
# Interactive setup
pi deploy --platform capistrano

# Or directly
pi deploy -p capistrano
```

## Setup Process

1. **Application Configuration**: Set app name, repository, deploy path
2. **Framework Detection**: Rails, Sinatra, or custom Ruby app
3. **Server Configuration**: Add deployment servers and roles
4. **Ruby Version**: Specify Ruby version for deployment
5. **Web/App Server**: Choose Nginx/Apache and Puma/Unicorn
6. **Service Configuration**: Configure databases and services
7. **Capistrano Files**: Generate deploy.rb, stages, and tasks

## Configuration Files

### config/deploy.rb
Main deployment configuration:

```ruby
# config/deploy.rb
lock "~> 3.18.0"

set :application, "my_app"
set :repo_url, "git@github.com:username/my_app.git"

# Default branch is :master
ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, "/var/www/my_app"

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
set :local_user, -> { `whoami`.chomp }

# Default value for keep_releases is 5
set :keep_releases, 5

# Rails specific configuration
set :migration_role, :app
set :conditionally_migrate, true
set :assets_roles, [:web, :app]
set :normalize_asset_timestamps, %w{public/images public/javascripts public/stylesheets}

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

# Ruby version
set :rbenv_type, :user
set :rbenv_ruby, "3.2.0"

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
```

### config/deploy/production.rb
Production environment configuration:

```ruby
# config/deploy/production.rb

server "example.com", user: "deploy", roles: %w{app db web}

# server-based syntax
# ======================
# Defines a single server with a list of roles and multiple properties.

# role-based syntax
# ==================
# Defines a role with one or multiple servers.

# role :app, %w{deploy@example.com}
# role :web, %w{user1@primary.com user2@additional.com}
# role :db,  %w{deploy@example.com}

# Configuration
# =============
# You can set any configuration variable like in config/deploy.rb

# Custom SSH Options
# ==================
# You may pass any option but keep in mind that net/ssh understands a
# limited set of options, consult the Net::SSH documentation.

set :ssh_options, {
  keys: %w(~/.ssh/id_rsa),
  forward_agent: true,
  auth_methods: %w(publickey)
}
```

### Capfile
Defines which Capistrano features to load:

```ruby
# Load DSL and set up stages
require "capistrano/setup"

# Include default deployment tasks
require "capistrano/deploy"

# Load the SCM plugin appropriate to your project:
require "capistrano/scm/git"
install_plugin Capistrano::SCM::Git

# Include tasks from other gems included in your Gemfile
require "capistrano/rails/assets"
require "capistrano/rails/migrations"
require "capistrano/rbenv"
require "capistrano3/puma"

# Load custom tasks from `lib/capistrano/tasks` if you have any defined
Dir.glob("lib/capistrano/tasks/*.rake").each { |r| import r }

# Puma tasks
install_plugin Capistrano3::Puma::Systemd
```

## Server Roles

### Common Roles
- **:app**: Application servers (run your app)
- **:web**: Web servers (serve static files, proxy)
- **:db**: Database servers (run migrations)
- **:job**: Background job servers (Sidekiq, DelayedJob)

### Role Examples
```ruby
# Single server with multiple roles
server "app.example.com", user: "deploy", roles: %w{web app db}

# Multiple servers with different roles  
server "web1.example.com", user: "deploy", roles: %w{web}
server "web2.example.com", user: "deploy", roles: %w{web}
server "app1.example.com", user: "deploy", roles: %w{app}
server "db.example.com", user: "deploy", roles: %w{db}, primary: true

# Background job servers
server "job1.example.com", user: "deploy", roles: %w{job}
```

## Deployment Commands

### Basic Commands
```bash
# Initial setup (first deployment)
cap production deploy:setup

# Deploy application
cap production deploy

# Deploy specific branch
cap production deploy BRANCH=feature-branch

# Rollback to previous release
cap production deploy:rollback

# Check deployment status
cap production deploy:check

# List releases
cap production releases

# Clean old releases (keep only 5)
cap production deploy:cleanup
```

### Server Management
```bash
# SSH to servers
cap production ssh

# Execute commands on servers
cap production invoke COMMAND="ls -la"

# Upload files to servers
cap production upload FILES=config/secrets.yml

# Download files from servers
cap production download FILES=log/production.log
```

### Application Management
```bash
# Restart application
cap production puma:restart

# Start/Stop Puma
cap production puma:start
cap production puma:stop

# Check Puma status
cap production puma:status

# Restart Nginx
cap production nginx:restart
```

## Framework Support

### Ruby on Rails
```ruby
# Capfile
require "capistrano/rails/assets"
require "capistrano/rails/migrations"

# config/deploy.rb
set :migration_role, :app
set :conditionally_migrate, true
set :assets_roles, [:web, :app]
```

### Sinatra
```ruby
# config/deploy.rb
set :application, "my_sinatra_app"
set :repo_url, "git@github.com:username/my_sinatra_app.git"

# No special Rails tasks needed
```

### Custom Ruby Applications
```ruby
# config/deploy.rb
namespace :deploy do
  desc 'Restart application'
  task :restart do
    on roles(:app), in: :sequence, wait: 5 do
      execute :touch, release_path.join('tmp/restart.txt')
    end
  end

  after :publishing, :restart
end
```

## Web Servers

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/my_app
upstream puma {
  server unix:///var/www/my_app/shared/tmp/sockets/my_app-puma.sock;
}

server {
  listen 80 default_server deferred;
  server_name example.com;

  root /var/www/my_app/current/public;
  access_log /var/www/my_app/current/log/nginx.access.log;
  error_log /var/www/my_app/current/log/nginx.error.log info;

  location ^~ /assets/ {
    gzip_static on;
    expires 1y;
    add_header Cache-Control public;
    add_header ETag "";
  }

  try_files $uri/index.html $uri @puma;

  location @puma {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_redirect off;
    proxy_pass http://puma;
  }

  error_page 500 502 503 504 /500.html;
  client_max_body_size 10M;
  keepalive_timeout 10;
}
```

### Apache Configuration
```apache
# /etc/apache2/sites-available/my_app.conf
<VirtualHost *:80>
  ServerName example.com
  DocumentRoot /var/www/my_app/current/public
  
  <Directory /var/www/my_app/current/public>
    AllowOverride all
    Options -MultiViews
    Require all granted
  </Directory>
  
  PassengerEnabled on
  PassengerAppRoot /var/www/my_app/current
  PassengerMinInstances 1
</VirtualHost>
```

## Application Servers

### Puma
```ruby
# config/puma.rb
workers Integer(ENV['WEB_CONCURRENCY'] || 2)
threads_count = Integer(ENV['RAILS_MAX_THREADS'] || 5)
threads threads_count, threads_count

preload_app!

rackup      DefaultRackup
port        ENV['PORT']     || 3000
environment ENV['RACK_ENV'] || 'development'

on_worker_boot do
  ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
end
```

### Unicorn
```ruby
# config/unicorn.rb
worker_processes Integer(ENV["WEB_CONCURRENCY"] || 3)
timeout 15
preload_app true

before_fork do |server, worker|
  Signal.trap 'TERM' do
    puts 'Unicorn master intercepting TERM and sending myself QUIT instead'
    Process.kill 'QUIT', Process.pid
  end

  defined?(ActiveRecord::Base) and
    ActiveRecord::Base.connection.disconnect!
end

after_fork do |server, worker|
  Signal.trap 'TERM' do
    puts 'Unicorn worker intercepting TERM and doing nothing. Wait for master to send QUIT'
  end

  defined?(ActiveRecord::Base) and
    ActiveRecord::Base.establish_connection
end
```

## Environment Variables

### Shared Configuration
```ruby
# config/deploy.rb
set :default_env, {
  'RAILS_ENV' => 'production',
  'NODE_ENV' => 'production',
  'PATH' => '/opt/ruby/bin:/opt/node/bin:$PATH'
}
```

### Stage-specific Configuration
```ruby
# config/deploy/production.rb
set :rails_env, 'production'
set :branch, 'main'

# config/deploy/staging.rb  
set :rails_env, 'staging'
set :branch, 'develop'
```

## Database Integration

### PostgreSQL
```ruby
# config/deploy.rb
namespace :postgresql do
  desc 'Create database'
  task :create_database do
    on roles(:db) do
      execute "createdb #{fetch(:application)}_#{fetch(:rails_env)}"
    end
  end
end

before 'deploy:migrate', 'postgresql:create_database'
```

### MySQL
```ruby
# config/deploy.rb
namespace :mysql do
  desc 'Create database'
  task :create_database do
    on roles(:db) do
      execute "mysql -e 'CREATE DATABASE #{fetch(:application)}_#{fetch(:rails_env)};'"
    end
  end
end
```

## Background Jobs

### Sidekiq
```ruby
# Capfile
require 'capistrano/sidekiq'

# config/deploy.rb
set :sidekiq_role, :job
```

### DelayedJob
```ruby
# Capfile
require 'capistrano/delayed_job'

# config/deploy.rb
set :delayed_job_workers, 2
```

## Custom Tasks

### Example Custom Tasks
```ruby
# lib/capistrano/tasks/custom.rake
namespace :custom do
  desc "Restart application"
  task :restart do
    on roles(:app), in: :sequence, wait: 5 do
      execute :touch, release_path.join('tmp/restart.txt')
    end
  end

  desc "Check application status"
  task :status do
    on roles(:app) do
      execute "ps aux | grep my_app"
    end
  end

  desc "Tail log files"
  task :logs do
    on roles(:app) do
      execute "tail -f #{shared_path}/log/production.log"
    end
  end

  desc "Setup logrotate"
  task :setup_logrotate do
    on roles(:app) do
      template = <<-EOF
#{shared_path}/log/*.log {
  daily
  missingok
  rotate 30
  compress
  delaycompress
  notifempty
  create 644 deploy deploy
}
EOF
      
      upload! StringIO.new(template), "/tmp/#{fetch(:application)}_logrotate"
      execute :sudo, :mv, "/tmp/#{fetch(:application)}_logrotate", "/etc/logrotate.d/#{fetch(:application)}"
    end
  end
end

# Hook into deployment
after 'deploy:publishing', 'custom:restart'
```

## Security

### SSH Configuration
```ruby
# config/deploy/production.rb
set :ssh_options, {
  keys: %w(~/.ssh/deploy_key),
  forward_agent: false,
  auth_methods: %w(publickey),
  port: 2222,
  user: 'deploy'
}
```

### File Permissions
```ruby
# config/deploy.rb
set :file_permissions_paths, %w{log tmp public/uploads}
set :file_permissions_users, %w{deploy www-data}
set :file_permissions_chmod_mode, "0775"
```

## Monitoring Integration

### New Relic
```ruby
# config/deploy.rb
namespace :newrelic do
  desc "Notify New Relic of deployment"
  task :notify do
    on roles(:app) do
      execute "curl -H 'x-api-key:YOUR_API_KEY' -d 'deployment[application_id]=YOUR_APP_ID' -d 'deployment[description]=#{fetch(:current_revision)}' https://api.newrelic.com/deployments.xml"
    end
  end
end

after 'deploy:finished', 'newrelic:notify'
```

### Slack Notifications
```ruby
# Gemfile
gem 'capistrano-slack', group: :development

# config/deploy.rb
require 'capistrano/slack'

set :slack_webhook, 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
set :slack_channel, '#deployments'
set :slack_username, 'Capistrano'
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Check SSH key
   ssh-add -l
   
   # Test SSH connection
   ssh deploy@your-server.com
   
   # Check file permissions
   cap production invoke COMMAND="ls -la /var/www"
   ```

2. **Git Issues**
   ```bash
   # Check Git access
   cap production invoke COMMAND="git ls-remote #{fetch(:repo_url)}"
   
   # Clear Git cache
   cap production git:create_release
   ```

3. **Bundle Install Failures**
   ```bash
   # Check Ruby version
   cap production invoke COMMAND="ruby --version"
   
   # Clear bundle cache
   cap production bundler:install
   ```

4. **Asset Compilation Issues**
   ```bash
   # Compile assets locally
   RAILS_ENV=production bundle exec rails assets:precompile
   
   # Skip asset compilation
   cap production deploy SKIP_ASSET_COMPILATION=true
   ```

## Best Practices

1. **Use deploy keys for Git access**
2. **Keep secrets in environment variables**
3. **Use shared directories for uploads and logs**
4. **Implement proper backup strategies**
5. **Monitor deployment with notifications**
6. **Test deployments on staging first**
7. **Use rolling deployments for zero downtime**
8. **Keep deployment scripts in version control**
9. **Document server setup procedures**
10. **Implement health checks**

## Getting Help

- Capistrano Documentation: https://capistranorb.com/
- GitHub: https://github.com/capistrano/capistrano
- Ruby Community: https://www.ruby-lang.org/en/community/
- Stack Overflow: Tag with `capistrano`
