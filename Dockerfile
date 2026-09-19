# Etape 1: Build de l'application (Vite + React)
FROM node:20-alpine as builder

WORKDIR /app

# Copie des fichiers de configuration pour installer les dépendances
COPY package*.json ./
RUN npm ci

# Copie du reste des fichiers du projet
COPY . .

# Build de l'application pour la production
RUN npm run build

# Etape 2: Serveur web (Nginx)
FROM nginx:alpine

# Copie de la configuration Nginx (pour la gestion du routing SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie du build frontend depuis l'étape précédente vers le dossier d'hébergement Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Le port 80 est exposé par défaut par Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
