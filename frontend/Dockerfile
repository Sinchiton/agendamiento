# frontend/Dockerfile
FROM node:20-alpine
WORKDIR /app

# Instala deps primero (cache mejor)
COPY package*.json ./
RUN npm ci

# El código lo montamos por volumen en compose
EXPOSE 5173
CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]
