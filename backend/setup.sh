#!/bin/bash

echo "Setting up Talkify Course Recommendation Backend..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.11 or higher"
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "Error: Failed to create virtual environment"
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

# Create .env file from example
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo
    echo "IMPORTANT: Please edit the .env file and add your Groq API key!"
    echo "You can get a free API key from: https://console.groq.com/"
    echo
fi

# Create data directories
mkdir -p data/sessions

echo
echo "Setup completed successfully!"
echo
echo "Next steps:"
echo "1. Edit the .env file and add your GROQ_API_KEY"
echo "2. Run: python main.py"
echo "3. API will be available at: http://localhost:8000"
echo
