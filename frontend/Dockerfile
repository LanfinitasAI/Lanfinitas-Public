# ============================================================================
# Frontend Dockerfile - Lanfinitas AI
# Multi-stage build: Build with Node.js, serve with Nginx
# ============================================================================

# ============================================================================
# Stage 1: Build stage
# ============================================================================
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Set environment variables for build
ENV NODE_ENV=production \
    VITE_API_URL=/api

# Install dependencies first (for better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================================================
# Stage 2: Production stage with Nginx
# ============================================================================
FROM nginx:alpine as production

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create nginx user for security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
