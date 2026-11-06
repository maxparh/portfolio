# Образ сайта-портфолио: сборка Vite → минимальный рантайм на Node.js.
#
# В рантайме только Node.js и собранные файлы:
#   dist/        — статика frontend
#   dist-server/ — сервер, обслуживающий статику и POST /api/contact
# Vue компилируется в статику, поэтому node_modules в финальном образе не нужны.

FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit

COPY . .
ARG VITE_TURNSTILE_SITE_KEY
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY

# Проверка типов выполняется в CI (`npm run build`); здесь — только сборка.
RUN npm run build:app && npm run build:server

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server

EXPOSE 3000
USER node
CMD ["node", "dist-server/server/index.js"]
