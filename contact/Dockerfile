# Specify a base image
FROM node:16.13-alpine

# Create a relative path for all the next instructions
WORKDIR /app

# Install some dependencies
COPY ./package.json ./
RUN npm install --only=prod
# Skipped Dependency Re-runs during build process (CACHE till now)
COPY ./ ./

# Default command
CMD ["npm", "start"]