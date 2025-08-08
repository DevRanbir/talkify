@echo off
echo Setting up Talkify Course Recommendation Backend...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.11 or higher from https://python.org
    pause
    exit /b 1
)

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo Error: Failed to create virtual environment
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

REM Create .env file from example
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit the .env file and add your Groq API key!
    echo You can get a free API key from: https://console.groq.com/
    echo.
)

REM Create data directories
if not exist data mkdir data
if not exist data\sessions mkdir data\sessions

echo.
echo Setup completed successfully!
echo.
echo Next steps:
echo 1. Edit the .env file and add your GROQ_API_KEY
echo 2. Run: python main.py
echo 3. API will be available at: http://localhost:8000
echo.
pause
