# Multi-stage build for optimized Node.js CLI
# Build stage
FROM node:20-alpine AS builder

# Set metadata labels
LABEL maintainer="Sharique Chaudhary <khanshariq92213@gmail.com>"
LABEL description="A cross-platform, interactive CLI to scaffold modern web app templates with email feedback system"
LABEL version="3.8.1"
LABEL image="0xshariq/package-installer-cli"
LABEL org.opencontainers.image.source="https://github.com/0xshariq/package-installer-cli"
LABEL org.opencontainers.image.documentation="https://github.com/0xshariq/package-installer-cli/blob/main/README.md"

# Install essential build dependencies
RUN apk add --no-cache \
    git \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json pnpm-lock.yaml* ./

# Enable pnpm and install dependencies
RUN corepack enable pnpm && \
    corepack prepare pnpm@latest --activate && \
    pnpm install --frozen-lockfile

# Copy source code and configuration files (exclude dev files via .dockerignore)
COPY . .

# Build the TypeScript application
RUN pnpm run build && \
    pnpm prune --production

# Production stage - smaller final image
FROM node:22-alpine AS production

# Install minimal runtime dependencies (only system CA certificates for TLS)
RUN apk add --no-cache ca-certificates && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy built application and required assets from builder stage (includes pruned node_modules)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/features ./features
COPY --from=builder /app/node_modules ./node_modules

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pi -u 1001 -G nodejs

# Change ownership of the app directory to the nodejs user
RUN chown -R pi:nodejs /app

# Switch to non-root user
USER pi

# Create directories for user projects and CLI operation
RUN mkdir -p /home/pi/projects /home/pi/.npm-global /home/pi/.config

# Set environment variables for better CLI experience
ENV PATH="/app/dist:/home/pi/.npm-global/bin:${PATH}"
ENV NPM_CONFIG_PREFIX=/home/pi/.npm-global
ENV SHELL=/bin/bash
ENV NODE_ENV=production

# Set the working directory to projects folder
WORKDIR /home/pi/projects

# Expose common development ports that might be used by generated projects
EXPOSE 3000 3001 8000 8080 5000 4000 5173 5174

# Health check to ensure the CLI is working
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node /app/dist/index.js --version || exit 1

# Default command
ENTRYPOINT ["node", "/app/dist/index.js"]
CMD ["--help"]