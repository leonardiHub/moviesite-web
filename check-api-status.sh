#!/bin/bash

echo "🔍 API Server Status Check (Port 4000)"
echo "======================================"

# Check if API server is running
if netstat -tulpn 2>/dev/null | grep ":4000" > /dev/null; then
    echo "✅ Server Status: RUNNING on Port 4000"
    
    # Get process info
    PID=$(netstat -tulpn 2>/dev/null | grep ":4000" | awk '{print $7}' | cut -d/ -f1)
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
    echo "❌ Server Status: NOT RUNNING on Port 4000"
fi

echo ""

# Check if port 4000 is listening
if netstat -tulpn 2>/dev/null | grep ":4000" > /dev/null; then
    echo "✅ Port 4000: LISTENING"
else
    echo "❌ Port 4000: NOT LISTENING"
fi

echo ""

# Test API server response
echo "🧪 Testing API server response..."
if curl -s -o /dev/null -w "%{http_code}" http://51.79.254.237:4000/v1 | grep -q "200\|404\|401"; then
    echo "✅ Server Response: OK (API endpoint responding)"
else
    echo "❌ Server Response: FAILED"
fi

echo ""

# Test API documentation
echo "📚 Testing API documentation..."
if curl -s -o /dev/null -w "%{http_code}" http://51.79.254.237:4000/docs | grep -q "200"; then
    echo "✅ API Documentation: Accessible"
else
    echo "❌ API Documentation: Not accessible"
fi

echo ""

# Check NestJS specific info
echo "📋 NestJS Information:"
if curl -s http://51.79.254.237:4000/v1 | grep -q "NestJS\|movie\|api"; then
    echo "✅ NestJS Framework: Detected"
else
    echo "❌ NestJS Framework: Not detected or no response"
fi

echo ""
echo "🌐 Access URLs:"
echo "   API Base: http://51.79.254.237:4000/v1"
echo "   Documentation: http://51.79.254.237:4000/docs"
echo "   OpenAPI JSON: http://51.79.254.237:4000/openapi.json"
echo "📁 API App Location: ./apps/api/"
echo "📁 Build Output: ./apps/api/dist/"
echo "🚀 Startup Script: ./start-api.sh"
echo "📋 Process Status: ps aux | grep 'npm.*start:prod'"
