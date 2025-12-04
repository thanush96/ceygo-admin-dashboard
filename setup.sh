#!/bin/bash

# CeyGo Admin Dashboard Setup Script

echo "🚀 Setting up CeyGo Admin Dashboard..."
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found!"
    echo "Creating .env.local from example..."
    cp .env.local.example .env.local
    echo ""
    echo "📝 Please edit .env.local and add your Firebase credentials:"
    echo "   1. Go to Firebase Console > Project Settings > Service Accounts"
    echo "   2. Click 'Generate New Private Key'"
    echo "   3. Copy the credentials to .env.local"
    echo ""
    read -p "Press Enter when you've updated .env.local..."
else
    echo "✅ .env.local file found"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully"
echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server, run:"
echo "   npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "Default login credentials:"
echo "   Email: admin@ceygo.com"
echo "   Password: admin123"
echo ""
echo "⚠️  Remember to change the default password in production!"
echo ""
