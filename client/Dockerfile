# Specify a base image
FROM node:16.13-alpine

# Create a relative path for all the next instructions
WORKDIR /app

# Install some dependencies
COPY ./package.json ./
RUN npm install
# Skipped Dependency Re-runs during build process (CACHE till now)
COPY ./ ./

# Default command
CMD ["npm", "run", "dev"]