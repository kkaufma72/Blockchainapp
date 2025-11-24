#!/bin/bash

# Bitcoin Whale Tracker - Docker Deployment Script
set -e

echo "🐳 Bitcoin Whale Tracker - Docker Deployment"
echo "=============================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if .env exists, if not create from .env.docker
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.docker..."
    cp .env.docker .env
    echo "✅ .env created. Edit it to add your API keys (optional)"
    echo ""
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building Docker images..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "=============================================="
echo "🎉 Deployment Complete!"
echo "=============================================="
echo ""
echo "📊 Backend API: http://localhost:3001"
echo "🗄️  Database:   localhost:5434"
echo ""
echo "Test your API:"
echo "  curl http://localhost:3001/api/health"
echo ""
echo "View logs:"
echo "  docker-compose logs -f backend"
echo ""
echo "Stop containers:"
echo "  docker-compose down"
echo ""
echo "To add API keys, edit .env and run:"
echo "  docker-compose restart backend"
echo ""

