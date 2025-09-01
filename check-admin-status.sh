#!/bin/bash

echo "🔍 Admin Panel Server Status Check (Port 3001)"
echo "=============================================="

# Check if admin server is running
if netstat -tulpn 2>/dev/null | grep ":3001" > /dev/null; then
    echo "✅ Server Status: RUNNING on Port 3001"
    
    # Get process info
    PID=$(netstat -tulpn 2>/dev/null | grep ":3001" | awk '{print $7}' | cut -d/ -f1)
    if [ ! -z "$PID" ]; then
        echo "🆔 Process ID: $PID"
        
        # Check memory usage
        MEMORY=$(ps -p $PID -o %mem --no-headers 2>/dev/null)
        if [ ! -z "$MEMORY" ]; then
            echo "💾 Memory Usage: ${MEMORY}%"
        fi
        
        # Check uptime
        UPTIME=$(ps -p $PID -o etime --no-headers 2>/dev/null)
        if [ ! -z "$UPTIME" ]; then
            echo "⏱️  Uptime: $UPTIME"
        fi
    fi
    
else
    echo "❌ Server Status: NOT RUNNING on Port 3001"
fi

echo ""

# Check if port 3001 is listening
if netstat -tulpn 2>/dev/null | grep ":3001" > /dev/null; then
    echo "✅ Port 3001: LISTENING"
else
    echo "❌ Port 3001: NOT LISTENING"
fi

echo ""

# Test server response
echo "🧪 Testing admin panel response..."
if curl -s -o /dev/null -w "%{http_code}" http://51.79.254.237:3001 | grep -q "200"; then
    echo "✅ Server Response: OK (HTTP 200)"
else
    echo "❌ Server Response: FAILED"
fi

echo ""

# Check Next.js specific info
echo "📋 Next.js Information:"
if curl -s http://51.79.254.237:3001 | grep -q "Next.js"; then
    echo "✅ Next.js Framework: Detected"
else
    echo "❌ Next.js Framework: Not detected"
fi

echo ""
echo "🌐 Access URL: http://51.79.254.237:3001"
echo "📁 Admin App Location: ./apps/admin/"
echo "📁 Build Output: ./apps/admin/.next/"
echo "🚀 Startup Script: ./start-admin-simple.sh"
echo "📋 Process Status: ps aux | grep next-server"
