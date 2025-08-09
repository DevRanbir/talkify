// API configuration for Talkify backend integration with fallback
const PRIMARY_URL = process.env.NODE_ENV === 'production' 
  ? 'https://talkify-inproduction.up.railway.app/api/v1'  // Railway production URL
  : 'http://localhost:8000/api/v1';

const FALLBACK_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:8000/api/v1'  // Fallback to localhost in production
  : 'https://talkify-inproduction.up.railway.app/api/v1';  // Fallback to Railway in development

class TalkifyAPI {
  constructor() {
    this.primaryURL = PRIMARY_URL;
    this.fallbackURL = FALLBACK_URL;
    this.baseURL = this.primaryURL;
    this.sessionId = null;
    this.conversationHistory = [];
    this.currentStep = 1;
    this.totalSteps = 15; // Increased from 6 to allow more questions
    this.lastWorkingURL = null;
  }

  // Helper method to make requests with fallback
  async makeRequestWithFallback(endpoint, options = {}, useBaseUrl = false) {
    const urls = this.lastWorkingURL 
      ? [this.lastWorkingURL, this.lastWorkingURL === this.primaryURL ? this.fallbackURL : this.primaryURL]
      : [this.primaryURL, this.fallbackURL];

    let lastError;

    for (const baseURL of urls) {
      try {
        // For health check, remove /api/v1 from the URL
        const finalUrl = useBaseUrl ? baseURL.replace('/api/v1', '') : baseURL;
        console.log(`🔗 Trying request to: ${finalUrl}${endpoint}`);
        const response = await fetch(`${finalUrl}${endpoint}`, {
          ...options,
          timeout: 10000 // 10 second timeout
        });

        if (response.ok) {
          this.baseURL = baseURL;
          this.lastWorkingURL = baseURL;
          console.log(`✅ Successfully connected to: ${finalUrl}`);
          return response;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`❌ Failed to connect to ${baseURL}: ${error.message}`);
        lastError = error;
        continue;
      }
    }

    throw new Error(`All servers failed. Last error: ${lastError.message}`);
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.makeRequestWithFallback('/health', {}, true);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Start a new quiz session
  async startQuiz(userName = null) {
    try {
      this.conversationHistory = [];
      this.currentStep = 1;
      
      // Create initial welcome message
      const welcomeMessage = {
        id: Date.now(),
        text: `Welcome to Talkify! ${userName || 'User'}, I'm here to help you discover the perfect career path. Let's start with a few questions to understand your interests and goals.`,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
        type: "welcome"
      };

      // Get the first question
      const response = await this.getNextQuestion();
      
      return {
        welcomeMessage,
        ...response
      };
    } catch (error) {
      console.error('Failed to start quiz:', error);
      throw error;
    }
  }

  // Get the next question
  async getNextQuestion() {
    try {
      console.log(' Request data:', {
        conversation_history: this.conversationHistory,
        user_id: this.sessionId
      });
      
      const response = await this.makeRequestWithFallback('/next-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_history: this.conversationHistory,
          user_id: this.sessionId
        })
      });

      console.log('📥 Response status:', response.status, response.statusText);

      const data = await response.json();
      
      // Store session ID for future requests
      if (data.session_id) {
        this.sessionId = data.session_id;
      }

      // Update current step
      this.currentStep = data.question_number;

      return {
        question: data.question,
        questionNumber: data.question_number,
        totalQuestions: data.total_questions_planned,
        sessionId: data.session_id,
        isLastQuestion: data.question.is_final
      };
    } catch (error) {
      console.error('Failed to get next question:', error);
      throw error;
    }
  }

  // Submit an answer and get the next question or recommendation
  async submitAnswer(answer, questionData) {
    try {
      // Add the Q&A to conversation history
      this.conversationHistory.push({
        question: questionData.question,
        answer: answer,
        question_type: questionData.question_type,
        options: questionData.options
      });

      // Create bot message for the question
      const questionMessage = {
        id: Date.now() - 1,
        text: questionData.question,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
        type: "question",
        questionType: questionData.question_type,
        options: questionData.options
      };

      // Create user message for the answer
      const answerMessage = {
        id: Date.now(),
        text: answer,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
        type: "answer"
      };

      // Check if this was the last question - use backend decision instead of hardcoded logic
      if (questionData.is_final) {
        // Get final recommendation
        const recommendation = await this.getRecommendation();
        return {
          questionMessage,
          answerMessage,
          recommendation,
          isComplete: true
        };
      } else {
        // Always try to get next question - let backend decide when to complete
        try {
          const nextQuestionResponse = await this.getNextQuestion();
          return {
            questionMessage,
            answerMessage,
            nextQuestion: nextQuestionResponse,
            isComplete: false
          };
        } catch (error) {
          // If backend says quiz is complete, get recommendation
          if (error.message.includes('Quiz complete') || error.message.includes('Maximum number of questions')) {
            const recommendation = await this.getRecommendation();
            return {
              questionMessage,
              answerMessage,
              recommendation,
              isComplete: true
            };
          } else {
            throw error; // Re-throw other errors
          }
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw error;
    }
  }

  // Get final course recommendation
  async getRecommendation() {
    try {
      const response = await this.makeRequestWithFallback('/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_history: this.conversationHistory,
          user_id: this.sessionId
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get recommendation:', error);
      throw error;
    }
  }

  // Convert question data to action buttons
  formatQuestionAsButtons(questionData) {
    const { question_type, options } = questionData;

    switch (question_type) {
      case 'multiple_choice':
        return options.map((option, index) => ({
          id: index + 1,
          label: option,
          icon: this.getIconForOption(option, index),
          action: option
        }));

      case 'rating_scale':
        return options.map((option, index) => ({
          id: index + 1,
          label: option,
          icon: this.getRatingIcon(index + 1),
          action: option
        }));

      case 'yes_no':
        return [
          { id: 1, label: "Yes", icon: "✅", action: "Yes" },
          { id: 2, label: "No", icon: "❌", action: "No" }
        ];

      case 'open_ended':
        return [
          { id: 1, label: "Creative Fields", icon: "🎨", action: "I'm interested in creative fields like design, arts, or media" },
          { id: 2, label: "Technology", icon: "💻", action: "I'm passionate about technology and programming" },
          { id: 3, label: "Business", icon: "💼", action: "I want to work in business, management, or entrepreneurship" },
          { id: 4, label: "Science", icon: "🔬", action: "I enjoy science, research, and analytical work" },
          { id: 5, label: "Other", icon: "🌟", action: "I have different interests or want to explore various options" }
        ];

      default:
        return [];
    }
  }

  // Helper method to get icons for options
  getIconForOption(option, index) {
    const icons = ["🎯", "📚", "⭐", "🎤", "💼", "🌟", "🔬", "💻", "🎨", "📊"];
    return icons[index] || "🔸";
  }

  // Helper method to get rating icons
  getRatingIcon(rating) {
    const icons = ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"];
    return icons[rating - 1] || "⭐";
  }

  // Get current progress
  getProgress() {
    return {
      currentStep: this.currentStep,
      totalSteps: Math.max(this.totalSteps, this.currentStep + 2), // Dynamic total steps
      percentage: Math.min(Math.round((this.currentStep / this.totalSteps) * 100), 90) // Cap at 90% until complete
    };
  }

  // Reset the quiz
  resetQuiz() {
    this.conversationHistory = [];
    this.sessionId = null;
    this.currentStep = 1;
  }

  // Get conversation history
  getConversationHistory() {
    return this.conversationHistory;
  }

  // Chat functionality
  async sendChatMessage(message, chatSessionId = null, userId = null) {
    try {
      const requestBody = {
        message: message,
        user_id: userId
      };

      if (chatSessionId) {
        requestBody.session_id = chatSessionId;
      }

      const response = await this.makeRequestWithFallback('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      return {
        response: data.response,
        sessionId: data.session_id,
        conversationHistory: data.conversation_history.map(msg => ({
          id: `${msg.role}-${Date.now()}-${Math.random()}`,
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'bot',
          timestamp: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      };
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    }
  }

  // Get chat history for a session
  async getChatHistory(chatSessionId) {
    try {
      const response = await this.makeRequestWithFallback(`/chat/${chatSessionId}/history`);

      const data = await response.json();
      
      return {
        sessionId: data.session_id,
        chatHistory: data.chat_history.map(msg => ({
          id: `${msg.role}-${Date.now()}-${Math.random()}`,
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'bot',
          timestamp: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })),
        messageCount: data.message_count
      };
    } catch (error) {
      console.error('Failed to get chat history:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const talkifyAPIInstance = new TalkifyAPI();
export default talkifyAPIInstance;
