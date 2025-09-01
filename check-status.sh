#!/bin/bash

echo "🔍 Admin Panel Server Status Check"
echo "=================================="

# Check if server is running
if pgrep -f "node server.js" > /dev/null; then
    echo "✅ Server Status: RUNNING"
    
    # Get process info
    PID=$(pgrep -f "node server.js")
    echo "🆔 Process ID: $PID"
    
    # Check port usage
    PORT=$(netstat -tulpn 2>/dev/null | grep ":$PID" | awk '{print $4}' | cut -d: -f2 | head -1)
    if [ ! -z "$PORT" ]; then
        echo "🌐 Port: $PORT"
    fi
    
    # Check memory usage
    MEMORY=$(ps -p $PID -o %mem --no-headers)
    echo "💾 Memory Usage: ${MEMORY}%"
    
    # Check uptime
    UPTIME=$(ps -p $PID -o etime --no-headers)
    echo "⏱️  Uptime: $UPTIME"
    
else
    echo "❌ Server Status: NOT RUNNING"
fi

echo ""

# Check if port 3000 is listening
if netstat -tulpn 2>/dev/null | grep ":3000" > /dev/null; then
    echo "✅ Port 3000: LISTENING"
else
    echo "❌ Port 3000: NOT LISTENING"
fi

echo ""

# Test server response
echo "🧪 Testing server response..."
if curl -s -o /dev/null -w "%{http_code}" http://51.79.254.237:3000 | grep -q "200"; then
    echo "✅ Server Response: OK (HTTP 200)"
else
    echo "❌ Server Response: FAILED"
fi

echo ""
echo "🌐 Access URL: http://51.79.254.237:3000"
echo "📁 Logs Directory: ./logs/"
echo "📋 PM2 Status: pm2 status"
