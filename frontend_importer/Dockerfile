# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files

# Copy source code
COPY . .

# Install dependencies
RUN npm install


# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 5173

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 