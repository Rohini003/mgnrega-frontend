# Stage 1: Build the Vite frontend
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve static files with NGINX
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Optional: Add custom NGINX config if needed
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
