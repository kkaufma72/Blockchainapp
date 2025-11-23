#!/bin/bash

# Start Bitcoin Whale Tracker - Backend and Frontend
# This script starts both servers concurrently

echo "🚀 Starting Bitcoin Whale Tracker..."
echo ""

# Kill any existing processes on ports 4000 and 3004
echo "🔍 Checking for existing processes..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:3004 | xargs kill -9 2>/dev/null || true

echo "✅ Ports cleared"
echo ""

# Start backend in background
echo "🔧 Starting backend server on port 4000..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend PID: $BACKEND_PID"
cd ..

# Wait a bit for backend to initialize
sleep 3

# Start frontend in background
echo "🎨 Starting frontend server on port 3004..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "✨ Both servers are running!"
echo ""
echo "📊 Backend:  http://localhost:4000"
echo "🌐 Frontend: http://localhost:3004"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 To stop both servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "💾 Process IDs saved to .pids file"
echo "$BACKEND_PID,$FRONTEND_PID" > .pids

# Keep script running and monitor processes
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
