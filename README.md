# 🌟 Talkify - AI-Powered Career Guidance Platform

<div align="center">
  <img src="public/logo192.png" alt="Talkify Logo" width="120" height="120">
  
  [![React](https://img.shields.io/badge/React-19.1.1-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Groq](https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge)](https://groq.com/)
  [![Railway](https://img.shields.io/badge/Railway-Deployed-purple?style=for-the-badge&logo=railway)](https://railway.app/)
  
  **Your AI Career Guide with Chandigarh University**
  
  *Helping you find your passion, pick the right course, and shape a future you'll be proud of.*
</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Installation](#️-installation)
- [📱 Usage Guide](#-usage-guide)
- [🔧 Configuration](#-configuration)
- [🌐 API Documentation](#-api-documentation)
- [🎨 Frontend Features](#-frontend-features)
- [🤖 AI Integration](#-ai-integration)
- [🎵 Voice Features](#-voice-features)
- [📊 Analytics & Tracking](#-analytics--tracking)
- [🚀 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🔒 Security](#-security)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

**Talkify** is an innovative AI-powered career guidance platform specifically designed for Chandigarh University students and prospective students. It combines the power of advanced AI with personalized career counseling to provide tailored course recommendations and comprehensive career guidance.

### 🌟 What Makes Talkify Special?

- **AI-Driven Personalization**: Uses Groq's advanced language models for intelligent question generation and personalized recommendations
- **Interactive Voice Interface**: Full voice integration with text-to-speech and speech recognition capabilities
- **Dynamic Question Flow**: Adaptive quiz system that adjusts questions based on user responses
- **Comprehensive Course Database**: Extensive database of Chandigarh University programs with detailed information
- **Real-time Chat Assistant**: 24/7 AI career counselor for ongoing support
- **Multi-modal Experience**: Seamlessly integrates text, voice, and visual interactions

---

## ✨ Key Features

### 🎓 **Intelligent Career Assessment**
- **Adaptive Quiz System**: 15+ personalized questions that adapt based on your responses
- **Multiple Question Types**: Multiple choice, rating scales, yes/no, and open-ended questions
- **Smart Analysis**: AI analyzes interests, skills, preferences, and career goals
- **Progressive Difficulty**: Questions become more specific as the system learns about you

### 🧠 **AI-Powered Recommendations**
- **Personalized Course Matching**: Matches your profile against 20+ available courses
- **Confidence Scoring**: Each recommendation comes with a confidence score and detailed reasoning
- **Alternative Suggestions**: Provides backup course options based on your profile
- **Detailed Course Information**: Complete course details, duration, provider, and career outcomes

### 💬 **Interactive Chat Assistant**
- **24/7 Availability**: Always-on AI counselor for career guidance
- **Context-Aware Conversations**: Remembers your conversation history and preferences
- **Multi-session Support**: Maintains conversation context across multiple sessions
- **Rich Response Formatting**: Structured responses with icons, formatting, and actionable insights

### 🎵 **Advanced Voice Integration**
- **Text-to-Speech**: AI responses are automatically spoken using Groq's TTS API
- **Voice Controls**: Complete voice navigation and interaction
- **Multiple Voices**: Choose from various AI voices and speaking styles
- **Audio Feedback**: Voice confirmations and guidance throughout the experience

### 🎨 **Modern User Experience**
- **Responsive Design**: Fully responsive across all devices (mobile, tablet, desktop)
- **Dark/Light Themes**: Customizable theme preferences with system detection
- **Smooth Animations**: Engaging animations and transitions
- **3D Welcome Experience**: Immersive 3D animations for first-time users
- **Progress Tracking**: Visual progress indicators and step-by-step guidance

### 📊 **Session Management**
- **Persistent Sessions**: Your progress is automatically saved
- **Cross-device Sync**: Continue your journey from any device
- **History Tracking**: Complete conversation and interaction history
- **Resume Capability**: Pick up exactly where you left off

---

## 🏗️ Architecture

### 🎨 **Frontend Architecture**
```
src/
├── components/          # Reusable UI components
│   ├── Navbar.js       # Navigation component with theme switching
│   ├── Footer.js       # Footer with links and information
│   └── Loader.js       # Loading animations and states
├── contexts/           # React contexts for state management
│   └── ThemeContext.js # Theme management and global state
├── hooks/              # Custom React hooks
│   ├── useLoader.js    # Loading state management
│   └── useQuizManager.js # Quiz state and logic management
├── pages/              # Main application pages
│   ├── Homepage.js     # Landing page with 3D animations
│   ├── Explore.js      # Main interactive experience
│   ├── Help.js         # User guide and FAQ
│   ├── Authors.js      # About the creators
│   └── Contact.js      # Contact information and support
├── services/           # API and external service integrations
│   ├── TalkifyAPI.js   # Main API service class
│   ├── TextToSpeechService.js # Groq TTS integration
│   ├── VideoService.js # Video content management
│   └── VoiceChatService.js # Voice interaction handling
└── utils/              # Utility functions and helpers
    └── welcomeMessageUtils.js # Welcome message generation
```

### 🔧 **Backend Architecture**
```
backend/
├── api/                # API routes and endpoints
│   └── routes.py       # FastAPI route definitions
├── config/             # Configuration management
│   └── settings.py     # Environment and app settings
├── data/               # Data storage and management
│   ├── courses.json    # Course database
│   └── sessions/       # User session storage
├── models/             # Data models and schemas
│   └── schemas.py      # Pydantic models for validation
├── services/           # Business logic services
│   ├── groq_service.py # Groq AI integration
│   └── session_service.py # Session management
├── utils/              # Utility functions
│   └── course_data.py  # Course data management
└── main.py             # FastAPI application entry point
```

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **Git**

### ⚡ One-Minute Setup

```bash
# Clone the repository
git clone https://github.com/DevRanbir/talkify.git
cd talkify

# Frontend setup
npm install
npm start

# Backend setup (in a new terminal)
cd backend
pip install -r requirements.txt
python main.py
```

🎉 **That's it!** Open http://localhost:3000 to start your Talkify experience!

---

## 🛠️ Installation

### 🎨 **Frontend Installation**

```bash
# Navigate to project directory
cd talkify

# Install dependencies
npm install

# Available dependencies:
# - React 19.1.1 (Latest React with concurrent features)
# - React Router DOM 7.7.1 (Navigation and routing)
# - Groq SDK 0.30.0 (AI integration)
# - Testing Libraries (Comprehensive testing setup)
```

### 🔧 **Backend Installation**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Dependencies include:
# - FastAPI 0.104.1 (Modern async web framework)
# - Uvicorn (ASGI server)
# - Groq API (AI language model)
# - Pydantic (Data validation)
# - Aiofiles (Async file operations)
```

### 🌍 **Environment Configuration**

Create `.env` file in the backend directory:

```env
# Required: Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_API_URL=https://api.groq.com/openai/v1

# Optional: Application Settings
DEBUG=true
LOG_LEVEL=INFO
SESSION_TIMEOUT=3600
MAX_CONVERSATION_HISTORY=50

# Optional: CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,https://devranbir.github.io
```

---

## 📱 Usage Guide

### 🎯 **Getting Started**

1. **Launch the Application**
   ```bash
   npm start  # Frontend on http://localhost:3000
   python backend/main.py  # Backend on http://localhost:8000
   ```

2. **Navigate to Explore Page**
   - Click "Get Started" or navigate to `/explore`
   - Enter your name for a personalized experience

3. **Choose Your Journey**
   - **Career Guidance MAX**: Complete AI assessment (15+ questions)
   - **Chat and Get Guided**: Free-form conversation with AI counselor
   - **Quick Actions**: Direct access to specific features

### 🎓 **Career Assessment Flow**

1. **Personalized Welcome**: 3D animated welcome with your name
2. **Adaptive Questioning**: AI asks relevant questions about:
   - Academic interests and subjects you enjoyed
   - Career aspirations and goals
   - Learning preferences and styles
   - Skills and technical interests
   - Work environment preferences
   - Time commitment and study duration

3. **Dynamic Question Types**:
   - **Multiple Choice**: Select from predefined options
   - **Rating Scale**: Rate preferences from 1-5 stars
   - **Yes/No**: Quick binary decisions
   - **Open-ended**: Express yourself freely

4. **Real-time Analysis**: AI analyzes your responses in real-time
5. **Personalized Recommendation**: Detailed course suggestion with:
   - Course name and provider
   - Duration and difficulty level
   - Career outcomes and opportunities
   - Why it matches your profile
   - Direct links to course information

### 💬 **Chat Assistant Features**

- **Conversational AI**: Natural language interaction
- **Context Awareness**: Remembers your preferences and history
- **Career Guidance**: Answers about courses, careers, and academic paths
- **Study Tips**: Provides learning strategies and study advice
- **Course Information**: Detailed information about specific programs

### 🎵 **Voice Interaction**

- **Auto-speak**: AI responses are automatically spoken
- **Voice Controls**: Navigate using voice commands
- **Speech Recognition**: Speak your answers instead of typing
- **Voice Preferences**: Customize voice speed, tone, and language

---

## 🔧 Configuration

### ⚙️ **Frontend Configuration**

**Package.json Scripts:**
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "deploy": "gh-pages -d build"
  }
}
```

**Theme Configuration:**
- **Dark/Light Mode**: Automatic system detection with manual override
- **Custom CSS Variables**: Easily customizable color schemes
- **Responsive Breakpoints**: Mobile-first responsive design

### 🔧 **Backend Configuration**

**Settings Management:**
```python
# config/settings.py
class Settings(BaseSettings):
    groq_api_key: str
    debug: bool = False
    log_level: str = "INFO"
    session_timeout: int = 3600
    max_questions: int = 15
```

**CORS Configuration:**
```python
# Configurable CORS for different environments
allow_origins=["*"]  # Development
allow_origins=["https://devranbir.github.io"]  # Production
```

---

## 🌐 API Documentation

### 📊 **Base Information**
- **Base URL**: `http://localhost:8000/api/v1`
- **Production URL**: `https://talkify-inproduction.up.railway.app/api/v1`
- **Documentation**: Available at `/docs` (Swagger UI)

### 🔗 **Core Endpoints**

#### **1. Health Check**
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "message": "API is operational"
}
```

#### **2. Start Quiz / Get Next Question**
```http
POST /next-question
```
**Request:**
```json
{
  "conversation_history": [],
  "user_id": "optional_user_id"
}
```
**Response:**
```json
{
  "question": "What subjects did you enjoy most in school?",
  "question_type": "multiple_choice",
  "options": ["Computer Science", "Mathematics", "Physics", "Arts"],
  "is_final": false,
  "progress": {
    "current_step": 1,
    "total_steps": 15
  }
}
```

#### **3. Get Course Recommendation**
```http
POST /recommend
```
**Request:**
```json
{
  "conversation_history": [
    {
      "question": "What subjects did you enjoy most?",
      "answer": "Computer Science and Mathematics",
      "question_type": "multiple_choice"
    }
  ],
  "user_id": "user_123"
}
```
**Response:**
```json
{
  "recommended_course": {
    "name": "Full Stack Web Development",
    "link": "https://www.coursera.org/specializations/full-stack-web-development",
    "tags": ["web development", "javascript", "react", "node.js"],
    "description": "Comprehensive course covering front-end and back-end development",
    "provider": "Meta via Coursera",
    "duration": "6 months",
    "level": "Beginner to Intermediate"
  },
  "confidence_score": 0.85,
  "reasoning": "Based on your interest in computer science and mathematics...",
  "alternative_courses": [...]
}
```

#### **4. Chat with AI Assistant**
```http
POST /chat
```
**Request:**
```json
{
  "message": "I'm interested in learning web development. Where should I start?",
  "session_id": "optional_session_id",
  "user_id": "optional_user_id"
}
```
**Response:**
```json
{
  "response": "Great choice! Web development is an exciting field...",
  "session_id": "uuid-session-id",
  "conversation_history": [...]
}
```

#### **5. Get All Courses**
```http
GET /courses
```
**Response:**
```json
{
  "courses": [...],
  "total": 20
}
```

#### **6. Search Courses**
```http
GET /courses/search?q=programming
```
**Response:**
```json
{
  "courses": [...],
  "total": 5,
  "query": "programming"
}
```

---

## 🎨 Frontend Features

### 🎭 **Component Architecture**

#### **Navbar Component**
- **Responsive Design**: Collapses on mobile devices
- **Theme Toggle**: Dark/light mode switching
- **Active Route Highlighting**: Shows current page
- **Smooth Animations**: Hover effects and transitions

#### **Theme Context**
```javascript
const { 
  isDarkMode, 
  toggleTheme, 
  isLoading, 
  setLoading 
} = useTheme();
```

#### **Quiz Manager Hook**
```javascript
const {
  currentQuestion,
  progress,
  submitAnswer,
  resetQuiz,
  conversationHistory
} = useQuizManager();
```

### 📱 **Responsive Design**

- **Mobile-First**: Optimized for mobile experience
- **Tablet Support**: Perfect tablet layout and interactions
- **Desktop Enhancement**: Rich desktop experience with additional features
- **Touch-Friendly**: Large touch targets and swipe gestures

### 🎨 **Styling and Animations**

- **CSS Custom Properties**: Consistent design system
- **Smooth Transitions**: 60fps animations throughout
- **Loading States**: Elegant loading animations and skeletons
- **Micro-interactions**: Delightful hover and click effects

---

## 🤖 AI Integration

### 🧠 **Groq API Integration**

**Question Generation Strategy:**
- Analyzes conversation history to avoid repetition
- Focuses on different aspects: interests, skills, preferences, goals
- Uses various question types for comprehensive assessment
- Adapts complexity based on previous answers

**Recommendation Engine:**
- Analyzes complete conversation history
- Matches user profile against available courses
- Provides confidence scores and detailed reasoning
- Considers interests, skills, learning preferences, and career goals

### 🎯 **AI Prompting Strategy**

**System Prompts:**
```python
QUESTION_GENERATION_PROMPT = """
You are an expert career counselor for Chandigarh University.
Generate the next question based on the conversation history.
Focus on understanding the student's:
- Academic interests and strongest subjects
- Career aspirations and goals
- Learning preferences and study habits
- Technical skills and interests
- Work environment preferences
"""
```

**Recommendation Prompts:**
```python
RECOMMENDATION_PROMPT = """
Based on the complete conversation, recommend the most suitable 
course from our database. Consider:
- Academic background and interests
- Career goals and aspirations
- Learning style and preferences
- Technical aptitude and skills
Provide a confidence score and detailed reasoning.
"""
```

---

## 🎵 Voice Features

### 🔊 **Text-to-Speech Integration**

**Groq TTS Service:**
```javascript
class TextToSpeechService {
  constructor() {
    this.selectedModel = 'playai-tts-arabic';
    this.selectedVoice = 'Amira-PlayAI';
    this.groq = new Groq({ apiKey: this.apiKey });
  }
}
```

**Voice Features:**
- **Auto-speak**: AI responses automatically spoken
- **Voice Selection**: Multiple voice options available
- **Speed Control**: Adjustable speaking speed
- **Volume Control**: Customizable audio levels
- **Voice Interruption**: Stop speaking with user interaction

### 🎤 **Speech Recognition**

- **Voice Input**: Speak your answers instead of typing
- **Real-time Transcription**: Live speech-to-text conversion
- **Multiple Languages**: Support for English and Hindi
- **Noise Filtering**: Advanced noise cancellation

### 🔧 **Voice Configuration**

```javascript
// Voice settings stored in localStorage
const voiceSettings = {
  model: localStorage.getItem('tts_model') || 'playai-tts-arabic',
  voice: localStorage.getItem('tts_voice') || 'Amira-PlayAI',
  speed: localStorage.getItem('tts_speed') || '1.0',
  autoSpeak: localStorage.getItem('auto_speak') !== 'false'
};
```

---

## 📊 Analytics & Tracking

### 📈 **Session Management**

**Frontend Session Tracking:**
- User journey tracking
- Question response analytics
- Time spent per section
- Completion rates

**Backend Session Storage:**
```python
# sessions/ directory stores individual session files
{
  "session_id": "uuid",
  "user_id": "optional",
  "conversation_history": [],
  "recommendations": [],
  "created_at": "timestamp",
  "last_activity": "timestamp"
}
```

### 📊 **Progress Tracking**

- **Quiz Progress**: Visual progress bar (1-15 questions)
- **Conversation Length**: Track interaction depth
- **Response Quality**: Analyze answer completeness
- **Recommendation Accuracy**: Track user satisfaction

---

## 🚀 Deployment

### 🌐 **Frontend Deployment (GitHub Pages)**

```bash
# Build and deploy to GitHub Pages
npm run build
npm run deploy
```

**Deployment Configuration:**
```json
{
  "homepage": "https://devranbir.github.io/talkify",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

### 🚂 **Backend Deployment (Railway)**

**railway.toml Configuration:**
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

**Environment Variables:**
```bash
GROQ_API_KEY=your_groq_api_key
PYTHON_VERSION=3.11
NODE_ENV=production
```

**Quick Deploy:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### 🐳 **Docker Deployment**

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Docker Commands:**
```bash
# Build and run
docker build -t talkify-backend .
docker run -p 8000:8000 -e GROQ_API_KEY=your_key talkify-backend
```

---

## 🧪 Testing

### 🔬 **Frontend Testing**

**Test Scripts:**
```bash
npm test          # Run tests in watch mode
npm run test:ci   # Run tests once for CI/CD
npm run coverage  # Generate coverage report
```

**Testing Libraries:**
- **React Testing Library**: Component testing
- **Jest**: Unit and integration tests
- **User Event**: User interaction simulation

**Example Test:**
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Homepage from './Homepage';

test('renders welcome message', () => {
  render(<Homepage />);
  expect(screen.getByText(/Welcome to Talkify/i)).toBeInTheDocument();
});
```

### 🧪 **Backend Testing**

**Test API Endpoints:**
```bash
python test_api.py  # Run comprehensive API tests
```

**Test Coverage:**
- Health check endpoints
- Question generation
- Course recommendation
- Chat functionality
- Error handling
- Session management

---

## 🔒 Security

### 🛡️ **Frontend Security**

- **Environment Variables**: Sensitive data in environment variables
- **HTTPS Enforcement**: All production traffic over HTTPS
- **XSS Protection**: React's built-in XSS protection
- **Content Security Policy**: Restrictive CSP headers

### 🔐 **Backend Security**

**Security Measures:**
```python
# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://devranbir.github.io"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

- **Input Validation**: Pydantic models for all inputs
- **Session Security**: Secure session management with expiration
- **Error Handling**: No sensitive data in error responses
- **Rate Limiting**: Protection against abuse
- **API Key Protection**: Environment variable protection

### 🔒 **Data Privacy**

- **No Personal Data Storage**: Only conversation history stored temporarily
- **Session Expiration**: Automatic cleanup of old sessions
- **GDPR Compliance**: Right to deletion and data portability
- **Minimal Data Collection**: Only necessary data collected

---

## 🤝 Contributing

### 🎯 **How to Contribute**

1. **Fork the Repository**
   ```bash
   git fork https://github.com/DevRanbir/talkify.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

3. **Make Your Changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Commit Your Changes**
   ```bash
   git commit -m "Add: Amazing new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/amazing-new-feature
   ```

### 📝 **Development Guidelines**

**Frontend:**
- Use functional components with hooks
- Follow React best practices
- Maintain responsive design
- Add prop types for components

**Backend:**
- Follow FastAPI conventions
- Add type hints to all functions
- Write comprehensive docstrings
- Include error handling

**Code Style:**
- Use ESLint for JavaScript
- Use Black for Python formatting
- Write meaningful commit messages
- Add comments for complex logic

---

## 📞 Support & Contact

### 🆘 **Getting Help**

- **Documentation**: Complete docs in `/help` page
- **FAQ**: Common questions answered in Contact page
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Community discussions on GitHub

### 👥 **Development Team**

- **Lead Developer**: [DevRanbir](https://github.com/DevRanbir)
- **Project Repository**: [Talkify on GitHub](https://github.com/DevRanbir/talkify)
- **Live Demo**: [Try Talkify](https://devranbir.github.io/talkify)

### 🌟 **Acknowledgments**

- **Groq**: For providing advanced AI capabilities
- **Chandigarh University**: For course data and institutional support
- **React Community**: For the amazing ecosystem
- **FastAPI**: For the modern API framework
- **Railway**: For reliable deployment infrastructure

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### 🎓 **Academic Use**

This project is created for educational purposes and career guidance for Chandigarh University students. Feel free to use, modify, and distribute according to the MIT License terms.

---

<div align="center">
  
  **Made with ❤️ for Chandigarh University students**
  
  *Empowering the next generation of learners with AI-driven career guidance*
  
  [![GitHub Stars](https://img.shields.io/github/stars/DevRanbir/talkify?style=social)](https://github.com/DevRanbir/talkify/stargazers)
  [![GitHub Forks](https://img.shields.io/github/forks/DevRanbir/talkify?style=social)](https://github.com/DevRanbir/talkify/network)
  
</div>
