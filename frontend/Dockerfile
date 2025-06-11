# Build-Stage
FROM node:18-alpine as build

WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY package*.json ./
RUN npm ci

# Quellcode kopieren
COPY . .

# Build erstellen
RUN npm run build

# Runtime-Stage
FROM nginx:alpine

# Nginx Konfiguration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build von der Build-Stage kopieren
COPY --from=build /app/build /usr/share/nginx/html

# Cache- und Run-Verzeichnisse mit korrekten Berechtigungen erstellen
RUN mkdir -p /var/cache/nginx /var/run \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/run \
    && chown -R nginx:nginx /usr/share/nginx/html

# Als Nicht-Root-Benutzer ausführen
USER nginx

EXPOSE 80

# Container starten
CMD ["nginx", "-g", "daemon off;"] 