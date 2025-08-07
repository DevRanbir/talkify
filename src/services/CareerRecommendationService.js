import Groq from 'groq-sdk';

class CareerRecommendationService {
  constructor() {
    this.groq = new Groq({
      apiKey: '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',
      dangerouslyAllowBrowser: true
    });
    
    this.courses = [];
    this.userProfile = {
      interests: [],
      strengths: [],
      careerGoals: '',
      preferredField: '',
      previousStream: ''
    };
    
    this.conversationStage = 'welcome';
    this.loadCourses();
  }

  async loadCourses() {
    try {
      const response = await fetch('/talkify/cources.json');
      this.courses = await response.json();
    } catch (error) {
      console.error('Error loading courses:', error);
      // Fallback courses
      this.courses = [
        { name: "B.E. Computer Science & Engineering", link: "https://www.cuchd.in/engineering/be-computer-science-engineering.php" },
        { name: "B.E. Mechanical Engineering", link: "https://www.cuchd.in/engineering/be-mechanical-engineering.php" }
      ];
    }
  }

  async getRecommendation(userInput, stage, userProfile = {}) {
    this.userProfile = { ...this.userProfile, ...userProfile };
    
    const coursesList = this.courses.map(course => course.name).join(', ');
    
    const systemPrompt = `You are an expert career counselor for Chandigarh University engineering programs. 
    Your goal is to guide students through a personalized career discovery journey.
    
    Available courses: ${coursesList}
    
    Current conversation stage: ${stage}
    User profile so far: ${JSON.stringify(this.userProfile)}
    
    Guidelines:
    1. Ask ONE clear, engaging question at a time
    2. Keep responses conversational and encouraging
    3. Gradually build the user's profile through their answers
    4. When ready, recommend specific courses from the list
    5. Always provide 3-4 relevant response options for the user
    
    Response format should be JSON:
    {
      "message": "Your response message",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "nextStage": "next_conversation_stage",
      "recommendations": [{"name": "Course Name", "link": "Course Link", "reason": "Why this course"}] // Only include when making final recommendations
    }`;

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `User said: "${userInput}". Current stage: ${stage}. Please guide them to the next step in their career discovery journey.`
          }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        response_format: {
          type: "json_object"
        }
      });

      const response = JSON.parse(chatCompletion.choices[0].message.content);
      this.conversationStage = response.nextStage || stage;
      
      return response;
    } catch (error) {
      console.error('Error getting recommendation:', error);
      return this.getFallbackResponse(stage);
    }
  }

  getFallbackResponse(stage) {
    const fallbackResponses = {
      welcome: {
        message: "Welcome to Talkify! I'm here to help you discover the perfect engineering career path. Let's start by understanding what excites you most!",
        options: [
          "I love solving complex problems",
          "I'm interested in technology and innovation", 
          "I want to build and create things",
          "I'm not sure yet, help me explore"
        ],
        nextStage: "interests"
      },
      interests: {
        message: "Great choice! Understanding your interests is key. What type of work environment appeals to you most?",
        options: [
          "Working with cutting-edge technology",
          "Hands-on building and designing",
          "Research and development",
          "Managing projects and teams"
        ],
        nextStage: "work_style"
      },
      work_style: {
        message: "Excellent! Based on your preferences, I can see some great directions. What's your ultimate career goal?",
        options: [
          "Start my own tech company",
          "Work at top tech companies",
          "Become a research scientist",
          "Lead engineering projects"
        ],
        nextStage: "career_goals"
      }
    };

    return fallbackResponses[stage] || fallbackResponses.welcome;
  }

  updateUserProfile(key, value) {
    this.userProfile[key] = value;
  }

  getCoursesForRecommendation(interests, field) {
    // Simple matching logic for course recommendations
    const keywordMap = {
      'technology': ['Computer Science', 'Information Technology', 'Artificial Intelligence'],
      'building': ['Civil Engineering', 'Mechanical Engineering', 'Aerospace'],
      'innovation': ['Computer Science', 'Biotechnology', 'Chemical'],
      'research': ['Biotechnology', 'Chemical Engineering', 'Computer Science']
    };

    let relevantCourses = [];
    for (const [keyword, courseTypes] of Object.entries(keywordMap)) {
      if (interests.toLowerCase().includes(keyword)) {
        relevantCourses = this.courses.filter(course => 
          courseTypes.some(type => course.name.includes(type))
        );
        break;
      }
    }

    return relevantCourses.length > 0 ? relevantCourses.slice(0, 3) : this.courses.slice(0, 3);
  }
}

export default CareerRecommendationService;
