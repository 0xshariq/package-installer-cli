# Multi-stage build for optimized Node.js CLI
# Build stage
FROM node:20-alpine AS builder

# Set metadata labels
LABEL maintainer="Sharique Chaudhary"
LABEL description="A cross-platform, interactive CLI to scaffold modern web app templates"
LABEL version="3.4.0"
LABEL image="0xshariq/package-installer-cli"

# Install only essential build dependencies
RUN apk add --no-cache \
    git \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json pnpm-lock.yaml* ./

# Install pnpm and all dependencies (including dev dependencies for build)
RUN corepack enable pnpm && \
    pnpm install --frozen-lockfile

# Copy source code and configuration files
COPY . .

# Build the TypeScript application
RUN pnpm run build

# Production stage - smaller final image
FROM node:20-alpine AS production

# Install only essential runtime dependencies
RUN apk add --no-cache \
    git \
    bash \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN corepack enable pnpm && \
    pnpm install --frozen-lockfile --production=true && \
    pnpm store prune && \
    rm -rf ~/.local/share/pnpm/store

# Copy built application and required assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/features ./features

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pi -u 1001 -G nodejs

# Change ownership of the app directory to the nodejs user
RUN chown -R pi:nodejs /app

# Switch to non-root user
USER pi

# Create a directory for user projects (mounted volume)
RUN mkdir -p /home/pi/projects

# Set the working directory to projects folder
WORKDIR /home/pi/projects

# Make the CLI globally available
ENV PATH="/app/dist:${PATH}"

# Set default shell to bash for better user experience
ENV SHELL=/bin/bash

# Expose default ports that might be used by generated projects
EXPOSE 3000 3001 8000 8080 5000 4000

# Health check to ensure the CLI is working
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node /app/dist/index.js --version || exit 1

# Default command
ENTRYPOINT ["node", "/app/dist/index.js"]
CMD ["--help"]