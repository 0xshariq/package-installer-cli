# Use the latest Node.js LTS version with Alpine for smaller image size
FROM node:20-alpine

# Set metadata labels
LABEL maintainer="Sharique Chaudhary"
LABEL description="A cross-platform, interactive CLI to scaffold modern web app templates"
LABEL version="3.2.0"
LABEL image="0xshariq/package-installer-cli"

# Install system dependencies required for the CLI
RUN apk add --no-cache \
    git \
    openssh-client \
    bash \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json pnpm-lock.yaml* ./

# Install pnpm globally and dependencies
RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile --production=false

# Copy source code and configuration files
COPY . .

# Build the TypeScript application
RUN pnpm run build

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