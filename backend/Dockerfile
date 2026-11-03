FROM node:26-bookworm-slim AS build
WORKDIR /app
RUN npm install --global pnpm@11.10.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod

FROM node:26-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/keyring.sqlite
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
RUN mkdir -p /app/data
VOLUME /app/data
EXPOSE 3000
CMD ["node", "dist/main.js"]
