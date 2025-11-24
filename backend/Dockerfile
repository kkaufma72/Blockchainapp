FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install --only=production

# Copy prisma schema
COPY prisma ./prisma

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate && npm run build

EXPOSE 8080

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
