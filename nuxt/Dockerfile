# syntax=docker/dockerfile:1

# ------------------------------
# Build stage
# ------------------------------
FROM node:26-alpine AS build
WORKDIR /app

# Node 26 images no longer ship corepack: install the pnpm version pinned in package.json
RUN npm install -g pnpm@11.10.0

# Install dependencies first for layer caching; postinstall (nuxt prepare) needs the
# full source, so scripts are skipped here and the build below prepares the app.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source and build the production server
COPY . .
RUN pnpm build

# ------------------------------
# Runtime stage
# ------------------------------
FROM node:26-alpine AS runtime
WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Copy only the production server output
COPY --from=build /app/.output ./.output

USER node

CMD ["node", ".output/server/index.mjs"]
