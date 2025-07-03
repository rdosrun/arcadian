# Use an official Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose internal container port (the port your app listens on)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

