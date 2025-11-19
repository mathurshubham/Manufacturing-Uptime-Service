# Stage 1: Build the React application (Heavy)
# Using 'alpine' version of node is smaller
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx (Lightweight - Final Image)
# This throws away all the Node.js stuff, keeping the image tiny (~20MB)
FROM nginx:alpine

# Copy build artifacts from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 for Cloud Run
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]