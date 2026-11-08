
# Angular build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Nginx runtime stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Find Angular's generated index.html and copy its directory
COPY --from=build /app/dist /tmp/dist

RUN set -eux; \
    INDEX_FILE="$(find /tmp/dist -name index.html -type f | head -n 1)"; \
    test -n "$INDEX_FILE"; \
    APP_DIR="$(dirname "$INDEX_FILE")"; \
    cp -a "$APP_DIR"/. /usr/share/nginx/html/; \
    rm -rf /tmp/dist

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
