FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Set environment variables
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]