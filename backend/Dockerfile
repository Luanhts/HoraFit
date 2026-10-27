FROM node:22-alpine AS base
RUN npm install --global npm@11.9.0

FROM base AS dependencies
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM dependencies AS build

COPY prisma ./prisma
RUN npx --no-install prisma generate

COPY nest-cli.json tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM dependencies AS migration

COPY prisma ./prisma
RUN npx --no-install prisma generate

USER node

CMD ["npx", "--no-install", "prisma", "migrate", "deploy"]

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --omit=optional --omit=peer && npm cache clean --force

COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma

USER node

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3333) + '/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1));"

CMD ["node", "dist/src/main.js"]
