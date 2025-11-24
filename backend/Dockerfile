FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy only backend files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Install ALL dependencies (not just production)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 8080

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
