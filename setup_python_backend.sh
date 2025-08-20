#!/bin/bash

# Python Backend Setup Script
echo "🚀 Setting up Python Backend for YouTube Transcription"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip."
    exit 1
fi

echo "✓ pip3 found"

# Navigate to python-backend directory
cd python-backend

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing Python packages..."
pip install -r requirements.txt

# Test installation
echo "🧪 Testing installation..."
python test_installation.py

echo ""
echo "🎉 Python backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Activate virtual environment: source python-backend/venv/bin/activate"
echo "2. Test installation: python python-backend/test_installation.py"
echo "3. Run transcription: python python-backend/youtube_transcriber.py"
echo "4. Start API server: python python-backend/api_server.py"
echo ""
echo "Note: The first run will download Whisper models (~1GB for base model)"
