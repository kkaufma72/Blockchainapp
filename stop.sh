#!/bin/bash

# Stop Bitcoin Whale Tracker servers

echo "🛑 Stopping Bitcoin Whale Tracker..."

if [ -f .pids ]; then
  PIDS=$(cat .pids)
  IFS=',' read -ra PID_ARRAY <<< "$PIDS"
  
  for PID in "${PID_ARRAY[@]}"; do
    if ps -p $PID > /dev/null; then
      echo "   Killing process $PID"
      kill $PID 2>/dev/null
    fi
  done
  
  rm .pids
fi

# Also kill by port
echo "   Cleaning up ports 4000 and 3004..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:3004 | xargs kill -9 2>/dev/null || true

echo "✅ All servers stopped"
