# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle vite-plugin-pwa compatibility
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for Docker
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint and healthcheck scripts
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY healthcheck.sh /healthcheck.sh
RUN chmod +x /docker-entrypoint.sh /healthcheck.sh

# Verify files are copied
RUN ls -la /usr/share/nginx/html && \
    echo "Files in nginx html directory:" && \
    find /usr/share/nginx/html -type f | head -20

# Add health check that respects PORT env var
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD /healthcheck.sh

# Expose port 80 by default (container will use PORT env var if provided)
# Common ports: 80, 1000, 3000, 8080
EXPOSE 80 1000 3000 8080

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]

