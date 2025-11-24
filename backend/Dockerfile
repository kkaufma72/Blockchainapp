FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy backend package metadata and Prisma schema first (for layer caching + postinstall)
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Install ALL dependencies (dev + prod) for the backend workspace
RUN npm install

# Copy application source
COPY src ./src

# Generate Prisma client and build TypeScript output
RUN npx prisma generate
RUN npm run build

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
