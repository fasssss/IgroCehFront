# Use the latest LTS version of Node.js
FROM node:18-alpine

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

COPY ["IgroCehApp/IgroCehFrontend/localhost.pem", "/app/localhost.pem"]
COPY ["IgroCehApp/IgroCehFrontend/localhost-key.crt", "/app/localhost-key.pem"]

# Expose the port your app runs on
EXPOSE 5173
EXPOSE 6436
 
# Define the command to run your app
CMD ["npm", "start"]