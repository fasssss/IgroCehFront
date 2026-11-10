# Build stage: compiles the app into static files
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# vite mode, defines which .env.<mode> file is used
ARG BUILD_MODE=production
RUN npm run build -- --mode ${BUILD_MODE}

# Server stage: plain http on 80 behind the nginx of the server, which holds the certificate
FROM nginx:1.27-alpine AS production

COPY nginx.prod.config /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Local stage: static files over https, unknown paths fall back to index.html for client side routing
FROM nginx:1.27-alpine AS final

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ["./gamews-quest.pem", "/etc/nginx/certs/gamews-quest.pem"]
COPY ["./gamews-quest-key.pem", "/etc/nginx/certs/gamews-quest-key.pem"]
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173