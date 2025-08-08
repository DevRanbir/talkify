# Frontend Integration Guide

This guide explains how to integrate your React frontend with the Talkify Course Recommendation Backend API.

## 🔗 API Base URL

**Local Development**: `http://localhost:8000/api/v1`
**Production**: Update this to your deployed Railway URL

## 📋 Integration Steps

### Step 1: API Configuration

Create an API configuration file in your React app:

```javascript
// src/config/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend.railway.app/api/v1'  // Replace with your Railway URL
  : 'http://localhost:8000/api/v1';

export default API_BASE_URL;
```

### Step 2: API Service Functions

Create API service functions:

```javascript
// src/services/api.js
import API_BASE_URL from '../config/api.js';

class TalkifyAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.sessionId = null;
    this.conversationHistory = [];
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Start a new quiz session
  async startQuiz(userId = null) {
    try {
      this.conversationHistory = [];
      const response = await this.getNextQuestion();
      return response;
    } catch (error) {
      console.error('Failed to start quiz:', error);
      throw error;
    }
  }

  // Get the next question
  async getNextQuestion() {
    try {
      const response = await fetch(`${this.baseURL}/next-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_history: this.conversationHistory,
          user_id: this.sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get next question');
      }

      const data = await response.json();
      
      // Store session ID for future requests
      if (data.session_id) {
        this.sessionId = data.session_id;
      }

      return data;
    } catch (error) {
      console.error('Failed to get next question:', error);
      throw error;
    }
  }

  // Submit an answer and get the next question
  async submitAnswer(question, answer, questionType, options = null) {
    try {
      // Add the Q&A to conversation history
      this.conversationHistory.push({
        question: question,
        answer: answer,
        question_type: questionType,
        options: options
      });

      // Get the next question
      return await this.getNextQuestion();
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw error;
    }
  }

  // Get final course recommendation
  async getRecommendation() {
    try {
      const response = await fetch(`${this.baseURL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_history: this.conversationHistory,
          user_id: this.sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get recommendation');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get recommendation:', error);
      throw error;
    }
  }

  // Get all available courses
  async getAllCourses() {
    try {
      const response = await fetch(`${this.baseURL}/courses`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      return data.courses;
    } catch (error) {
      console.error('Failed to get courses:', error);
      throw error;
    }
  }

  // Search courses
  async searchCourses(query) {
    try {
      const response = await fetch(`${this.baseURL}/courses/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search courses');
      }

      const data = await response.json();
      return data.courses;
    } catch (error) {
      console.error('Failed to search courses:', error);
      throw error;
    }
  }

  // Get conversation history
  getConversationHistory() {
    return this.conversationHistory;
  }

  // Reset the quiz
  resetQuiz() {
    this.conversationHistory = [];
    this.sessionId = null;
  }
}

// Export a singleton instance
export default new TalkifyAPI();
```

### Step 3: React Hook for Quiz Management

Create a custom hook to manage the quiz state:

```javascript
// src/hooks/useQuiz.js
import { useState, useCallback } from 'react';
import TalkifyAPI from '../services/api.js';

export const useQuiz = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const startQuiz = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsQuizComplete(false);
    setRecommendation(null);
    
    try {
      TalkifyAPI.resetQuiz();
      const response = await TalkifyAPI.startQuiz();
      
      setCurrentQuestion(response.question);
      setQuestionNumber(response.question_number);
      setTotalQuestions(response.total_questions_planned);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (answer) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await TalkifyAPI.submitAnswer(
        currentQuestion.question,
        answer,
        currentQuestion.question_type,
        currentQuestion.options
      );

      if (response.question.is_final || response.question_number > totalQuestions) {
        // Quiz is complete, get recommendation
        setIsQuizComplete(true);
        const recommendationData = await TalkifyAPI.getRecommendation();
        setRecommendation(recommendationData);
        setCurrentQuestion(null);
      } else {
        // Continue with next question
        setCurrentQuestion(response.question);
        setQuestionNumber(response.question_number);
        setTotalQuestions(response.total_questions_planned);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, totalQuestions]);

  const getRecommendationDirectly = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const recommendationData = await TalkifyAPI.getRecommendation();
      setRecommendation(recommendationData);
      setIsQuizComplete(true);
      setCurrentQuestion(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetQuiz = useCallback(() => {
    TalkifyAPI.resetQuiz();
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setTotalQuestions(0);
    setIsQuizComplete(false);
    setRecommendation(null);
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    currentQuestion,
    questionNumber,
    totalQuestions,
    isQuizComplete,
    recommendation,
    
    // Actions
    startQuiz,
    submitAnswer,
    getRecommendationDirectly,
    resetQuiz,
    
    // Utility
    conversationHistory: TalkifyAPI.getConversationHistory()
  };
};
```

### Step 4: Quiz Component Example

Here's how to use the hook in your React components:

```javascript
// src/components/Quiz.js
import React from 'react';
import { useQuiz } from '../hooks/useQuiz';

const Quiz = () => {
  const {
    isLoading,
    error,
    currentQuestion,
    questionNumber,
    totalQuestions,
    isQuizComplete,
    recommendation,
    startQuiz,
    submitAnswer,
    resetQuiz
  } = useQuiz();

  const handleAnswerSubmit = (answer) => {
    submitAnswer(answer);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const { question, question_type, options } = currentQuestion;

    switch (question_type) {
      case 'multiple_choice':
        return (
          <div className="question-container">
            <h3>{question}</h3>
            <div className="options">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSubmit(option)}
                  className="option-button"
                  disabled={isLoading}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'rating_scale':
        return (
          <div className="question-container">
            <h3>{question}</h3>
            <div className="rating-options">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSubmit(option)}
                  className="rating-button"
                  disabled={isLoading}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'yes_no':
        return (
          <div className="question-container">
            <h3>{question}</h3>
            <div className="yes-no-options">
              <button
                onClick={() => handleAnswerSubmit('Yes')}
                className="yes-button"
                disabled={isLoading}
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswerSubmit('No')}
                className="no-button"
                disabled={isLoading}
              >
                No
              </button>
            </div>
          </div>
        );

      case 'open_ended':
        return (
          <div className="question-container">
            <h3>{question}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const answer = e.target.answer.value.trim();
              if (answer) {
                handleAnswerSubmit(answer);
                e.target.reset();
              }
            }}>
              <textarea
                name="answer"
                placeholder="Type your answer here..."
                required
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                Submit Answer
              </button>
            </form>
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  const renderRecommendation = () => {
    if (!recommendation) return null;

    const { recommended_course, confidence_score, reasoning } = recommendation;

    return (
      <div className="recommendation-container">
        <h2>Your Recommended Course</h2>
        
        <div className="course-card">
          <h3>{recommended_course.name}</h3>
          <p><strong>Provider:</strong> {recommended_course.provider}</p>
          <p><strong>Duration:</strong> {recommended_course.duration}</p>
          <p><strong>Level:</strong> {recommended_course.level}</p>
          <p><strong>Description:</strong> {recommended_course.description}</p>
          
          <div className="tags">
            {recommended_course.tags?.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
          
          <a 
            href={recommended_course.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="course-link"
          >
            View Course
          </a>
        </div>

        <div className="recommendation-details">
          <p><strong>Confidence Score:</strong> {Math.round(confidence_score * 100)}%</p>
          <p><strong>Why this course?</strong> {reasoning}</p>
        </div>

        <button onClick={resetQuiz} className="restart-button">
          Take Quiz Again
        </button>
      </div>
    );
  };

  if (error) {
    return (
      <div className="error-container">
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={resetQuiz}>Try Again</button>
      </div>
    );
  }

  if (isQuizComplete) {
    return renderRecommendation();
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-start">
        <h2>Career Path Discovery Quiz</h2>
        <p>Answer a few questions to get personalized course recommendations!</p>
        <button onClick={startQuiz} disabled={isLoading}>
          {isLoading ? 'Starting...' : 'Start Quiz'}
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        <p>Question {questionNumber} of {totalQuestions}</p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {renderQuestion()}

      {isLoading && <div className="loading">Processing...</div>}
    </div>
  );
};

export default Quiz;
```

### Step 5: CSS Styles (Optional)

```css
/* src/components/Quiz.css */
.quiz-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.quiz-progress {
  margin-bottom: 30px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

.question-container {
  margin-bottom: 30px;
}

.question-container h3 {
  margin-bottom: 20px;
  font-size: 1.2em;
  line-height: 1.5;
}

.options, .rating-options, .yes-no-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-button, .rating-button, .yes-button, .no-button {
  padding: 15px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-button:hover, .rating-button:hover, .yes-button:hover, .no-button:hover {
  border-color: #4caf50;
  background-color: #f8f8f8;
}

.option-button:disabled, .rating-button:disabled, .yes-button:disabled, .no-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.question-container textarea {
  width: 100%;
  min-height: 100px;
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
}

.recommendation-container {
  text-align: center;
}

.course-card {
  border: 2px solid #4caf50;
  border-radius: 12px;
  padding: 25px;
  margin: 20px 0;
  background: #f9f9f9;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
  justify-content: center;
}

.tag {
  background: #4caf50;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9em;
}

.course-link {
  display: inline-block;
  background: #4caf50;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  margin-top: 15px;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.error-container {
  text-align: center;
  padding: 20px;
  color: #d32f2f;
}
```

## 🚀 Environment Setup

### For Development
1. Ensure the backend is running on `http://localhost:8000`
2. Update your React app's API configuration
3. Add CORS handling if needed

### For Production
1. Deploy your backend to Railway or another platform
2. Update the `API_BASE_URL` in your frontend config
3. Ensure CORS is properly configured for your frontend domain

## 🔧 Error Handling

The API returns structured error responses:

```javascript
// Example error handling
try {
  const response = await TalkifyAPI.getNextQuestion();
  // Handle success
} catch (error) {
  if (error.message.includes('Groq API')) {
    // Handle AI service errors
    console.error('AI service unavailable:', error);
  } else if (error.message.includes('Session not found')) {
    // Handle session errors
    console.error('Session expired, restarting quiz');
    TalkifyAPI.resetQuiz();
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## 📱 Mobile Considerations

The API is designed to work seamlessly on mobile devices. Consider:
- Touch-friendly button sizes
- Responsive design for different screen sizes
- Loading states for slower mobile connections
- Offline handling for poor connectivity

## 🧪 Testing

Test your integration with:

```javascript
// Test API connection
import TalkifyAPI from './services/api.js';

async function testAPI() {
  try {
    // Test health check
    const health = await TalkifyAPI.healthCheck();
    console.log('API Health:', health);

    // Test quiz flow
    const firstQuestion = await TalkifyAPI.startQuiz();
    console.log('First Question:', firstQuestion);

    // Test courses endpoint
    const courses = await TalkifyAPI.getAllCourses();
    console.log('Available Courses:', courses.length);

  } catch (error) {
    console.error('API Test Failed:', error);
  }
}

testAPI();
```

This integration guide provides everything you need to connect your React frontend with the Talkify backend API. The system is designed to be robust, user-friendly, and production-ready!
