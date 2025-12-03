# Use Node.js 20 LTS (Alpine for smaller image)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 5500

# Start the application
CMD ["node", "app.js"]
