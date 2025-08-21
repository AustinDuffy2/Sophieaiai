#!/bin/bash

echo "🚀 Setting up Fast API Integration for YouTube Transcription"
echo "=========================================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📥 Installing/upgrading dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.template .env
    echo "⚠️  Please edit .env file and add your OpenAI API key for fast processing"
    echo "   Get your API key from: https://platform.openai.com/api-keys"
else
    echo "✅ .env file already exists"
fi

# Test the installation
echo "🧪 Testing installation..."
python test_fast_api.py

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your OpenAI API key"
echo "2. Start the API server: python api_server.py"
echo "3. Test with a YouTube URL in your app"
echo ""
echo "The system will automatically use fast API when available,"
echo "or fall back to local processing if needed."
