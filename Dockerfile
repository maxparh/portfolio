FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit

FROM build AS frontend-build
COPY . .
ARG VITE_TURNSTILE_SITE_KEY
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
RUN npm run build:app

FROM caddy:2-alpine AS frontend
COPY deploy/frontend.Caddyfile /etc/caddy/Caddyfile
COPY --from=frontend-build /app/dist /srv

FROM build AS database-build
COPY tsconfig.server.json ./
COPY api/ api/
COPY server/ server/
RUN npm run build:server

FROM node:24-alpine AS database
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY src/utils/projects.json src/utils/posts.json ./src/utils/
COPY --from=database-build /app/dist-server ./dist-server
CMD ["node", "dist-server/server/index.js"]

FROM python:3.13-alpine AS form-worker
WORKDIR /app
COPY server/form_worker.py ./
USER nobody
CMD ["python", "-u", "form_worker.py"]
