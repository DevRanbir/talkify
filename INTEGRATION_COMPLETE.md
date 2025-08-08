# 🎯 Talkify AI-Powered Course Recommendation System

A complete AI-powered career guidance platform that uses adaptive questioning to provide personalized course recommendations.

## 🚀 Features Implemented

### Frontend (React)
- ✅ **Dynamic AI Chat Interface**: Real-time conversation history display
- ✅ **Adaptive Action Buttons**: Buttons update based on AI questions (multiple choice, rating scale, yes/no)
- ✅ **Smart Progress Tracking**: Step indicator shows current progress (1-6 steps)
- ✅ **Dynamic Course Showcase**: Only appears after quiz completion with recommended course
- ✅ **Mobile-Responsive Design**: Optimized for all device sizes
- ✅ **Error Handling**: Graceful error handling with retry options
- ✅ **Loading States**: Visual feedback during AI processing

### Backend (FastAPI + Groq AI)
- ✅ **Adaptive Question Generation**: AI generates 6-8 questions based on user responses
- ✅ **Multiple Question Types**: Support for multiple choice, rating scale, yes/no, and open-ended questions
- ✅ **Session Management**: Persistent conversation history across interactions
- ✅ **Course Recommendation Engine**: AI analyzes responses to suggest best-fit courses
- ✅ **20 Real Courses**: Pre-loaded with actual courses from platforms like Coursera
- ✅ **RESTful API**: Well-documented endpoints for frontend integration
- ✅ **Error Handling**: Fallback questions and graceful error recovery

## 🏗️ Project Structure

```
talkify/
├── frontend/                    # React Application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/
│   │   │   └── Explore.js      # ✨ Main integrated page
│   │   ├── hooks/
│   │   │   └── useQuizManager.js # 🎯 Quiz state management
│   │   ├── services/
│   │   │   └── TalkifyAPI.js   # 🌐 Backend integration
│   │   └── contexts/           # Theme and global state
│   └── public/
├── backend/                    # FastAPI Backend
│   ├── api/
│   │   └── routes.py          # 🛠️ API endpoints
│   ├── services/
│   │   ├── groq_service.py    # 🤖 AI question generation
│   │   └── session_service.py # 💾 Session management
│   ├── models/
│   │   └── schemas.py         # 📋 Data validation
│   ├── data/
│   │   └── courses.json       # 📚 Course database
│   └── config/
└── docs/                      # Documentation
```

## 🎯 How It Works

### 1. User Journey
1. **Welcome**: User lands on Explore page
2. **Start Quiz**: Clicks "Career Guidance" to begin AI assessment
3. **Dynamic Questions**: AI generates 6-8 adaptive questions based on responses
4. **Real-time Feedback**: Progress bar updates, chat shows conversation
5. **Final Recommendation**: AI analyzes all responses and recommends best course
6. **Course Showcase**: Recommended course appears with direct link to enroll

### 2. AI Question Flow
```
Question 1: Work Environment Preference → Multiple Choice
Question 2: Creativity Importance → Rating Scale  
Question 3: Leadership Interest → Yes/No
Question 4: Learning Style → Multiple Choice
Question 5: Career Motivation → Multiple Choice
Question 6: Final Adaptive Question → Based on Previous Answers
→ AI ANALYSIS → COURSE RECOMMENDATION
```

### 3. Backend AI Processing
- **Groq API**: Powers question generation and course matching
- **Adaptive Logic**: Each question builds on previous answers
- **Course Matching**: AI analyzes personality profile against 20 courses
- **Confidence Scoring**: Provides match percentage for recommendations

## 📋 Setup Instructions

### Backend Setup
1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your Groq API key
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start the server**:
   ```bash
   python main.py
   ```
   Server runs on: `http://localhost:8000`

### Frontend Integration
1. **API Service is already integrated** in `src/services/TalkifyAPI.js`
2. **Quiz Manager hook** handles all state management in `src/hooks/useQuizManager.js`
3. **Explore page** is fully integrated with backend in `src/pages/Explore.js`

### Getting Groq API Key
1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up for a free account
3. Generate API key from dashboard
4. Add to `backend/.env` file

## 🔌 API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `POST /api/v1/next-question` - Get next adaptive question
- `POST /api/v1/recommend` - Get final course recommendation
- `GET /api/v1/courses` - Get all available courses

### Example API Usage
```javascript
// Start quiz
const response = await fetch('/api/v1/next-question', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversation_history: [],
    user_id: 'user_123'
  })
});

// Submit answer
const nextResponse = await fetch('/api/v1/next-question', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversation_history: [
      {
        question: "What type of work environment energizes you most?",
        answer: "Collaborative team setting",
        question_type: "multiple_choice",
        options: ["Collaborative team setting", "Independent workspace", "Dynamic, fast-paced", "Structured and organized"]
      }
    ]
  })
});
```

## 🎨 UI/UX Features

### Enhanced Chat Interface
- Real-time message display
- User vs. AI message differentiation
- Typing indicators and smooth animations
- No input field (buttons only for answers)

### Dynamic Action Buttons
- **Normal State**: Shows default actions (Career Guidance, Study Plan, etc.)
- **Quiz Active**: Shows answer options with icons
- **Loading State**: Disabled with loading spinner
- **Error State**: Shows retry button

### Smart Progress Bar
- Shows current step (1-6)
- Updates percentage in real-time
- Visual step indicators with click navigation
- Completion celebration

### Course Showcase
- **Hidden**: During quiz or when not started
- **Placeholder**: Shows encouraging message during quiz
- **Active**: Displays recommended course with details
- **Interactive**: Click to open course link

## 🔧 Customization

### Adding New Question Types
1. **Backend**: Add new type to `QuestionType` enum in `models/schemas.py`
2. **AI Service**: Update prompts in `services/groq_service.py`
3. **Frontend**: Add handler in `services/TalkifyAPI.js` `formatQuestionAsButtons()`
4. **UI**: Add styling in `pages/Explore.css`

### Adding New Courses
1. **Edit**: `backend/data/courses.json`
2. **Format**:
   ```json
   {
     "name": "Course Name",
     "link": "https://course-url.com",
     "tags": ["tag1", "tag2"],
     "description": "Course description",
     "provider": "Provider Name",
     "duration": "6 months",
     "level": "Beginner"
   }
   ```

### Modifying AI Behavior
1. **Question Generation**: Edit prompts in `services/groq_service.py`
2. **Recommendation Logic**: Modify `_create_recommendation_prompt()`
3. **Fallback Questions**: Update `_get_fallback_question()`

## 🚀 Deployment

### Backend Deployment (Railway)
1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   cd backend
   railway login
   railway create talkify-backend
   railway variables set GROQ_API_KEY=your_key
   railway deploy
   ```

3. **Update Frontend**: Update `API_BASE_URL` in `src/services/TalkifyAPI.js`

### Frontend Deployment
1. **Update API URL** in `TalkifyAPI.js` to your Railway backend URL
2. **Deploy to Vercel/Netlify** or any React hosting platform

## 🧪 Testing

### Quick Integration Test
1. Open browser developer console on Explore page
2. Run the test script from `integration-test.js`
3. Check if all endpoints respond correctly

### Manual Testing Flow
1. Click "Career Guidance" button
2. Answer each question as it appears
3. Verify progress bar updates
4. Check final recommendation appears
5. Test course link opens correctly

## 🐛 Troubleshooting

### Common Issues
1. **"Groq API Error"**: Add valid API key to `.env`
2. **"CORS Error"**: Check backend CORS settings
3. **"Connection Refused"**: Ensure backend is running on port 8000
4. **"Questions Not Loading"**: Verify Groq API key is valid

### Debug Commands
```bash
# Check backend logs
cd backend && python main.py

# Test API directly
curl http://localhost:8000/health

# Check environment variables
cd backend && python -c "from config.settings import get_settings; print(get_settings().groq_api_key)"
```

## 📊 Analytics & Monitoring

### Available Metrics
- Question generation times
- User session duration
- Popular answer patterns
- Course recommendation accuracy
- API response times

### Logging
- All user interactions logged
- AI API calls tracked
- Error rates monitored
- Session management audited

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] **Multi-language Support**: Questions in multiple languages
- [ ] **Advanced Analytics**: User behavior insights
- [ ] **Course Filtering**: Filter by price, duration, difficulty
- [ ] **Progress Saving**: Resume quiz later
- [ ] **Social Sharing**: Share recommendations
- [ ] **Feedback System**: Rate recommendations

### Technical Improvements
- [ ] **Caching**: Redis for session management
- [ ] **Database**: PostgreSQL for production
- [ ] **Authentication**: User accounts and profiles
- [ ] **Rate Limiting**: API usage limits
- [ ] **Monitoring**: Health checks and alerts

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq AI** for powerful language model API
- **FastAPI** for excellent backend framework
- **React** for flexible frontend development
- **Railway** for seamless deployment platform

---

**🎯 Ready to help students find their perfect career path!** 🚀
