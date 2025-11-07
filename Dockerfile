# Build stage för frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiera package files för både root och client
COPY package*.json ./
COPY client/package*.json ./client/

# Installera dependencies
RUN npm ci --only=production && \
    cd client && npm ci

# Kopiera källkod
COPY client/ ./client/

# Bygg frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Kopiera package files och installera backend dependencies
COPY package*.json ./
RUN npm ci --only=production

# Kopiera backend kod
COPY server/ ./server/

# Kopiera byggd frontend från builder stage
COPY --from=builder /app/client/dist ./client/dist

# Skapa directories för persistent data
RUN mkdir -p /app/uploads /app/data

# Exponera port
EXPOSE 3001

# Sätt environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Starta servern
CMD ["node", "server/index.js"]
