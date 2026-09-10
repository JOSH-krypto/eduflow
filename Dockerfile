# Multi-stage Dockerfile for EduFlow Fullstack App

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Build Backend ---
FROM node:20-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
COPY server/prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY server/ ./
RUN npm run build || true

# --- Stage 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies for server
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/
WORKDIR /app/server
RUN npm ci --only=production
RUN npx prisma generate

WORKDIR /app
COPY --from=frontend-builder /app/dist ./public
COPY --from=backend-builder /app/server/dist ./server/dist

EXPOSE 4000

CMD ["node", "server/dist/index.js"]
