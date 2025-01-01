# Use an official Node.js runtime as a parent image
FROM node:22.11.0-alpine3.20 AS development

# Define environment as development
ARG NODE_ENV=development

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if available
COPY package*.json ./

# Force npm history cleaner
RUN npm cache clear --force

# Install npm dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Instalar OpenSSL atualizado
RUN apk add --no-cache openssl

# Building the project
RUN npm run build

FROM node:22.11.0-alpine3.20

COPY --from=development /usr/src/app /usr/src/app

WORKDIR /usr/src/app

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
ENTRYPOINT [ "npm" ]
CMD ["run", "start"]
