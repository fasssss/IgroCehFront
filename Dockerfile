# Use the latest LTS version of Node.js
FROM node:18-alpine

USER root

# Install git
RUN apk add --no-cache git

# Set the working directory inside the container
WORKDIR /app
 
# Copy package.json and package-lock.json
COPY package.json ./
 
# Install dependencies
RUN npm install
 
# Copy the rest of your application files
COPY . .

# Discard all possible changes that may occure after copying
RUN git restore .

COPY ["./igroceh.xyz.pem", "/app/igroceh.xyz.pem"]
COPY ["./igroceh.xyz-key.pem", "/app/igroceh.xyz-key.pem"]

# Expose the port your app runs on
EXPOSE 5173
EXPOSE 6436
 
# Define the command to run your app
CMD ["npm", "start"]