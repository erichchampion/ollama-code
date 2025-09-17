#!/bin/bash

# Ollama Code CLI Installation Script

echo "🚀 Installing Ollama Code CLI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama is not installed. Please install Ollama first:"
    echo "   https://ollama.ai"
    echo ""
    echo "After installing Ollama, run:"
    echo "   ollama serve"
    echo "   ollama pull llama3.2"
    echo ""
    read -p "Continue with installation anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Navigate to the project directory
cd "$(dirname "$0")/ollama-code"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Install globally
echo "🌍 Installing globally..."
npm install -g .

echo ""
echo "✅ Installation complete!"
echo ""
echo "Usage:"
echo "  ollama-code help"
echo "  ollama-code list-models"
echo "  ollama-code ask \"How do I implement a binary search?\""
echo ""
echo "Make sure Ollama is running:"
echo "  ollama serve"
echo ""
echo "Download a model:"
echo "  ollama-code pull-model llama3.2"