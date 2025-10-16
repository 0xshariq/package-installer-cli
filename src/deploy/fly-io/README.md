# Fly.io Deployment

Deploy applications to Fly.io, the platform that runs your code in Firecracker microVMs around the world.

## Prerequisites

### 1. Install Fly CLI

This CLI will automatically install the fly cli<br>
You don't have to manually install the fly cli <br>
If any error occurs then you can install manually

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows (PowerShell):**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Homebrew:**
```bash
brew install flyctl
```

### 2. Authentication

```bash
fly auth login
```

## Usage

```bash
# Interactive deployment
pi deploy --platform fly-io

# Or directly
pi deploy -p fly-io
```

## Deployment Process

1. **App Configuration**: Set app name, region, VM size
2. **Scaling Options**: Configure min/max machines
3. **Network Settings**: HTTP service and port configuration
4. **Dockerfile Generation**: Create optimized Dockerfile
5. **Fly.toml Creation**: Generate deployment configuration
6. **Launch & Deploy**: Create app and deploy

## Configuration Files

### fly.toml
Main configuration file for Fly.io deployment.

```toml
app = "my-app"
primary_region = "iad"

[build]

[http_service]
internal_port = 8080
force_https = true
auto_stop_machines = true
auto_start_machines = true
min_machines_running = 0
processes = ["app"]

[[vm]]
cpu_kind = "shared"
cpus = 1
memory_mb = 256

[env]
NODE_ENV = "production"
PORT = "8080"
```

### Dockerfile
Optimized container definition.

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
```

## Regions

Fly.io has regions worldwide:

### Americas
- **iad**: Ashburn, Virginia (US East)
- **ord**: Chicago, Illinois (US Central)  
- **lax**: Los Angeles, California (US West)
- **yyz**: Toronto, Canada
- **scl**: Santiago, Chile
- **gru**: São Paulo, Brazil

### Europe  
- **lhr**: London, England
- **ams**: Amsterdam, Netherlands
- **fra**: Frankfurt, Germany
- **cdg**: Paris, France
- **mad**: Madrid, Spain

### Asia Pacific
- **nrt**: Tokyo, Japan
- **sin**: Singapore
- **syd**: Sydney, Australia
- **hkg**: Hong Kong

## VM Sizes

### Shared CPU
- **shared-cpu-1x**: 256MB RAM (Free tier eligible)
- **shared-cpu-2x**: 512MB RAM
- **shared-cpu-4x**: 1GB RAM
- **shared-cpu-8x**: 2GB RAM

### Performance (Dedicated CPU)
- **performance-1x**: 2GB RAM
- **performance-2x**: 4GB RAM
- **performance-4x**: 8GB RAM
- **performance-8x**: 16GB RAM

## Framework Support

### Node.js/Next.js
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Python/Flask
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]
```

### Go
```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.* ./
RUN go mod download

COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
```

## Fly Commands

### Application Management
```bash
# Create and launch app
fly launch

# Deploy application
fly deploy

# Check app status
fly status

# Open app in browser
fly open

# View app info
fly info

# Scale application
fly scale count 3
fly scale memory 512

# Stop/Start machines
fly machine stop
fly machine start
```

### Logs and Monitoring
```bash
# View logs
fly logs

# Tail logs
fly logs -f

# SSH into machine
fly ssh console

# Execute commands
fly ssh console -C "ls -la"
```

### Networking
```bash
# Allocate IP addresses
fly ips allocate-v4
fly ips allocate-v6

# List IP addresses
fly ips list

# Release IP address
fly ips release <ip-address>
```

## Volumes

Persistent storage for stateful applications:

```bash
# Create volume
fly volumes create data --region iad --size 10

# List volumes
fly volumes list

# Destroy volume
fly volumes destroy vol_xyz123
```

Update fly.toml:
```toml
[[mounts]]
source = "data"
destination = "/data"
```

## Secrets

Secure environment variable management:

```bash
# Set secrets
fly secrets set DATABASE_URL=postgres://...
fly secrets set API_KEY=secret-key

# List secrets
fly secrets list

# Remove secret
fly secrets unset DATABASE_URL
```

## Databases

### PostgreSQL
```bash
# Create Postgres cluster
fly postgres create --name my-postgres

# Connect to database
fly postgres connect -a my-postgres

# Attach to app
fly postgres attach --app my-app my-postgres
```

### Redis
```bash
# Create Redis instance
fly redis create --name my-redis

# Connect to Redis
fly redis connect -a my-redis

# Attach to app
fly redis attach --app my-app my-redis
```

## Custom Domains

```bash
# Add custom domain
fly certs create example.com

# Check certificate status
fly certs list

# Verify domain
fly certs check example.com
```

## Autoscaling

Configure automatic scaling in fly.toml:

```toml
[http_service]
internal_port = 8080
auto_stop_machines = true
auto_start_machines = true
min_machines_running = 0

[http_service.concurrency]
type = "connections"
hard_limit = 1000
soft_limit = 500

[[http_service.checks]]
grace_period = "10s"
interval = "30s"
method = "GET"
timeout = "5s"
path = "/health"
```

## Multi-region Deployment

Deploy to multiple regions:

```bash
# Clone to new region
fly machine clone --region lax

# Scale in specific region
fly scale count 2 --region iad
fly scale count 1 --region lax
```

## Health Checks

Configure health checks:

```toml
[[services.http_checks]]
interval = 10000
timeout = 2000
grace_period = "5s"
method = "get"
path = "/health"
protocol = "http"

[[services.tcp_checks]]
interval = 15000
timeout = 2000
grace_period = "1s"
port = 8080
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    name: Deploy app
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: superfly/flyctl-actions/setup-flyctl@master
      
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### GitLab CI
```yaml
stages:
  - deploy

deploy:
  stage: deploy
  image: flyio/flyctl:latest
  script:
    - flyctl deploy --remote-only
  only:
    - main
  variables:
    FLY_API_TOKEN: $FLY_API_TOKEN
```

## Monitoring

### Built-in Metrics
- Machine CPU and memory usage
- HTTP request metrics
- Response times
- Error rates

### External Monitoring
Integration with:
- Prometheus
- Grafana
- DataDog
- New Relic
- Sentry

## Pricing

### Compute
- **Free tier**: 3 shared-cpu-1x machines with 160GB/month transfer
- **Shared CPU**: $1.94/month per 256MB
- **Performance**: $62.00/month per 1x performance CPU

### Storage
- **Volumes**: $0.15/GB per month
- **Bandwidth**: $0.02/GB after free tier

### Databases
- **PostgreSQL**: Starting at $1.94/month
- **Redis**: Starting at $1.94/month

## Security

### Network Security
- Private networking between apps
- WireGuard VPN access
- Firewall rules

### Application Security
- Automatic SSL/TLS certificates
- Secret management
- Private images

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   ```bash
   # Check build logs
   fly logs
   
   # Debug build
   fly deploy --verbose
   
   # SSH to debug
   fly ssh console
   ```

2. **Performance Issues**
   ```bash
   # Check machine metrics
   fly status --all
   
   # Scale up
   fly scale memory 512
   fly scale count 2
   ```

3. **Connection Issues**
   ```bash
   # Check IP allocation
   fly ips list
   
   # Test connectivity
   fly ping
   ```

### Debug Mode
```bash
# Verbose logging
fly --verbose deploy

# Local development
fly dev

# Machine shell access
fly ssh console --pty
```

## Best Practices

1. **Use multi-stage Docker builds**
2. **Implement health checks**
3. **Use secrets for sensitive data**
4. **Deploy to multiple regions for redundancy**
5. **Configure autoscaling appropriately**
6. **Monitor application performance**
7. **Use volumes for persistent data**
8. **Implement graceful shutdowns**
9. **Use private networking for internal services**
10. **Keep Docker images small**

## Getting Help

- Fly.io Documentation: https://fly.io/docs/
- Community Forum: https://community.fly.io/
- Discord: https://fly.io/discord
- Support: support@fly.io