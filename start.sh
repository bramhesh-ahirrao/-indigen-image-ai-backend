#!/bin/bash

# Indigen AI Backend Startup Script

echo "🚀 Starting Indigen AI Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create .env file first."
    echo "Copy .env.example to .env and configure your settings."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check MongoDB connection
echo "🔍 Checking MongoDB connection..."
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 
})
.then(() => {
    console.log('✅ MongoDB connected successfully');
    mongoose.connection.close();
})
.catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
});
"

# Start the server
echo "🌐 Starting server..."
if command -v pm2 &> /dev/null; then
    echo "Using PM2 for process management..."
    pm2 start server.js --name indigen-ai-backend
    pm2 logs indigen-ai-backend
else
    echo "Using Node.js directly..."
    node server.js
fi