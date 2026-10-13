# Build stage: compiles the app into static files
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# vite mode, defines which .env.<mode> file is used
ARG BUILD_MODE=production
RUN npm run build -- --mode ${BUILD_MODE}

# Serve stage: static files over https, unknown paths fall back to index.html for client side routing
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ["./igroceh.xyz+5.pem", "/etc/nginx/certs/igroceh.pem"]
COPY ["./igroceh.xyz+5-key.pem", "/etc/nginx/certs/igroceh-key.pem"]
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173
