# Talkify Course Recommendation System - Backend

An AI-powered course recommendation system that generates adaptive quiz questions, provides personalized course recommendations, and includes an intelligent chat assistant using Groq API.

## 🚀 Features

- **Adaptive Quiz Generation**: AI-generated questions that adapt based on user responses
- **Personalized Recommendations**: Course recommendations based on complete quiz analysis
- **AI Chat Assistant**: Interactive chat for career guidance and educational support
- **Session Management**: Persistent conversation history across sessions for both quiz and chat
- **RESTful API**: Clean and documented API endpoints
- **Cloud Ready**: Configured for deployment on Railway and other platforms
- **Comprehensive Course Database**: Pre-loaded with diverse course options

## 🏗️ Architecture

```
backend/
├── api/                    # API routes and endpoints
├── config/                 # Configuration and settings
├── data/                   # Course data and session storage
├── models/                 # Pydantic models for validation
├── services/               # Business logic services
├── utils/                  # Utility functions
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
└── railway.toml           # Railway deployment config
```

## 🛠️ Setup Instructions

### Prerequisites

- Python 3.11 or higher
- Groq API key ([Get one here](https://console.groq.com/))

### Local Development

1. **Clone and navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   # Copy the example environment file
   copy .env.example .env
   
   # Edit .env and add your Groq API key:
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. **Run the application**:
   ```bash
   python main.py
   ```

   The API will be available at: `http://localhost:8000`

6. **Test the API**:
   ```bash
   python test_api.py
   ```

### Production Deployment

#### Railway Deployment

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Deploy**:
   ```bash
   railway create talkify-backend
   railway deploy
   ```

4. **Set environment variables**:
   ```bash
   railway variables set GROQ_API_KEY=your_groq_api_key_here
   railway variables set ENVIRONMENT=production
   ```

## 📚 API Documentation

### Base URL
- Local: `http://localhost:8000/api/v1`
- Production: `https://your-app.railway.app/api/v1`

### Endpoints

#### 1. Health Check
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

#### 2. Get Next Question
```http
POST /api/v1/next-question
```
**Request Body:**
```json
{
  "conversation_history": [
    {
      "question": "What subjects did you enjoy most in school?",
      "answer": "I loved computer science and mathematics",
      "question_type": "open_ended",
      "options": null
    }
  ],
  "user_id": "optional_user_id"
}
```
**Response:**
```json
{
  "question": {
    "question": "Do you prefer working with people or with data/technology?",
    "question_type": "multiple_choice",
    "options": ["Working with people", "Working with data/technology", "Both equally", "Neither specifically"],
    "is_final": false
  },
  "question_number": 2,
  "total_questions_planned": 8,
  "session_id": "uuid-session-id"
}
```

#### 3. Get Course Recommendation
```http
POST /api/v1/recommend
```
**Request Body:**
```json
{
  "conversation_history": [
    {
      "question": "What subjects did you enjoy most in school?",
      "answer": "I loved computer science and mathematics",
      "question_type": "open_ended",
      "options": null
    }
    // ... 5-8 more question-answer pairs
  ],
  "user_id": "optional_user_id"
}
```
**Response:**
```json
{
  "recommended_course": {
    "name": "Full Stack Web Development",
    "link": "https://www.coursera.org/specializations/full-stack-web-development",
    "tags": ["web development", "javascript", "react", "node.js"],
    "description": "Comprehensive course covering front-end and back-end web development",
    "provider": "Meta via Coursera",
    "duration": "6 months",
    "level": "Beginner to Intermediate"
  },
  "confidence_score": 0.85,
  "reasoning": "Based on your interest in computer science and preference for technical problem-solving, this course aligns perfectly with your profile.",
  "alternative_courses": null
}
```

#### 4. Get All Courses
```http
GET /api/v1/courses
```
**Response:**
```json
{
  "courses": [...],
  "total": 20
}
```

#### 5. Search Courses
```http
GET /api/v1/courses/search?q=programming
```
**Response:**
```json
{
  "courses": [...],
  "total": 5,
  "query": "programming"
}
```

#### 6. Chat with AI Assistant
```http
POST /api/v1/chat
```
**Request Body:**
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
  "response": "Great choice! Web development is an exciting field. I'd recommend starting with HTML and CSS to understand the basics of web structure and styling...",
  "session_id": "uuid-session-id",
  "conversation_history": [
    {
      "role": "user",
      "content": "I'm interested in learning web development. Where should I start?",
      "timestamp": "2025-08-08T10:30:00"
    },
    {
      "role": "assistant",
      "content": "Great choice! Web development is an exciting field. I'd recommend starting with HTML and CSS...",
      "timestamp": "2025-08-08T10:30:05"
    }
  ]
}
```

#### 7. Get Chat History
```http
GET /api/v1/chat/{session_id}/history
```
**Response:**
```json
{
  "session_id": "uuid-session-id",
  "chat_history": [
    {
      "role": "user",
      "content": "I'm interested in learning web development. Where should I start?",
      "timestamp": "2025-08-08T10:30:00"
    },
    {
      "role": "assistant", 
      "content": "Great choice! Web development is an exciting field...",
      "timestamp": "2025-08-08T10:30:05"
    }
  ],
  "message_count": 2
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key for AI services | Required |
| `ENVIRONMENT` | Environment (development/production) | development |
| `PORT` | Server port | 8000 |
| `MAX_QUESTIONS` | Maximum questions per quiz | 8 |
| `MIN_QUESTIONS` | Minimum questions before recommendation | 6 |

### Course Data

The system uses `data/courses.json` for course information. You can:
- Edit the file directly to add/modify courses
- The file is created automatically with sample data if it doesn't exist
- Each course should have: `name`, `link`, `tags`, `description`, `provider`, `duration`, `level`

## 🤖 AI Prompting Strategy

### Question Generation
The system uses sophisticated prompts to generate adaptive questions:
- Analyzes conversation history to avoid repetition
- Focuses on different aspects: interests, skills, preferences, goals
- Uses various question types: multiple choice, rating scale, yes/no, open-ended
- Adapts complexity based on previous answers

### Course Recommendation
The recommendation engine:
- Analyzes complete conversation history
- Matches user profile against available courses
- Provides confidence scores and detailed reasoning
- Considers interests, skills, learning preferences, and career goals

## 🔄 Frontend Integration

### API Call Examples

#### Getting the First Question
```javascript
const response = await fetch('http://localhost:8000/api/v1/next-question', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    conversation_history: [],
    user_id: 'user_123' // optional
  })
});
const data = await response.json();
```

#### Submitting an Answer and Getting Next Question
```javascript
const response = await fetch('http://localhost:8000/api/v1/next-question', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    conversation_history: [
      {
        question: "What subjects did you enjoy most in school?",
        answer: "Computer science and mathematics",
        question_type: "open_ended",
        options: null
      }
    ],
    user_id: 'user_123'
  })
});
```

#### Getting Final Recommendation
```javascript
const response = await fetch('http://localhost:8000/api/v1/recommend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    conversation_history: [/* array of 6-8 Q&A pairs */],
    user_id: 'user_123'
  })
});
```

## 🧪 Testing

Run the test script to verify all endpoints:
```bash
python test_api.py
```

## 📝 Logging

The application includes comprehensive logging:
- Request/response logging
- Error tracking
- Performance monitoring
- Debug information in development mode

## 🔒 Security

- CORS properly configured
- Input validation using Pydantic
- Environment variable protection
- Session management with expiration
- Error handling without sensitive data exposure

## 🚨 Troubleshooting

### Common Issues

1. **Groq API Key Issues**:
   - Ensure the API key is correctly set in environment variables
   - Check API key permissions and quotas

2. **Port Already in Use**:
   ```bash
   # Change port in .env file
   PORT=8001
   ```

3. **Module Import Errors**:
   ```bash
   # Ensure virtual environment is activated
   pip install -r requirements.txt
   ```

4. **Session Storage Issues**:
   - Check that `data/sessions` directory exists and is writable
   - Clear old session files if needed

### Development Tips

- Use the `/health` endpoint to verify the API is running
- Check logs for detailed error information
- Use the test script to validate functionality
- Monitor the `data/sessions` directory for session files

## 📈 Scaling Considerations

- Session data is currently file-based; consider Redis for production scaling
- Course data is loaded in memory; consider database for large datasets
- Add rate limiting for production use
- Implement caching for frequently requested data
- Consider load balancing for high traffic
