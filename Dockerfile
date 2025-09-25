# Multi-stage Dockerfile pour l'API Workshop B3
# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies

# Install system dependencies for building native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    netcat-openbsd

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm ci --production=false && \
    npm cache clean --force

# Stage 2: Production image
FROM node:18-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache \
    netcat-openbsd \
    dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production=true && \
    npm cache clean --force

# Copy built dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodejs:nodejs . .

# Create uploads directory with correct permissions
RUN mkdir -p public/uploads && \
    chown -R nodejs:nodejs public/uploads && \
    chmod 755 public/uploads

# Copy and prepare entrypoint script
COPY --chown=nodejs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user for security
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD nc -z localhost 3001 || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["./docker-entrypoint.sh"]
