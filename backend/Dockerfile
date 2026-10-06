# Imagen de la API de KeyRing (Nest.js + better-sqlite3).
# Se construye dentro del contenedor para compilar TypeScript con la misma
# versión de Node que luego lo ejecuta (node:20-alpine).
FROM node:20-alpine AS build
WORKDIR /app

# better-sqlite3 compila su binario nativo: alpine necesita python3/make/g++.
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine
WORKDIR /app

# better-sqlite3 compila su binario nativo: alpine necesita las herramientas
# de compilación (python3/make/g++), que no vienen en la imagen base.
RUN apk add --no-cache python3 make g++

# Solo las dependencias de producción: la imagen final no lleva TypeScript
COPY package*.json ./
RUN npm ci --omit=dev && apk del python3 make g++

COPY --from=build /app/dist ./dist

# La base de datos vive fuera del código, en un volumen
ENV NODE_ENV=production
VOLUME ["/app/data"]
ENV DB_PATH=/app/data/database.sqlite

EXPOSE 3000

CMD ["node", "dist/main.js"]
