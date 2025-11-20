FROM node:18-alpine

WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY mobile/package.json ./mobile/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build --workspace=client

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start", "--workspace=server"]
