import { useState, useCallback, useRef } from 'react';
import TalkifyAPI from '../services/TalkifyAPI';
import voiceChatService from '../services/VoiceChatService';
import talkifyAPI from '../services/TalkifyAPI';

export const useQuizManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [actionButtons, setActionButtons] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [progress, setProgress] = useState({ currentStep: 1, totalSteps: 15, percentage: 6 });
  
  const progressRef = useRef({ currentStep: 1, totalSteps: 15 });

  // Initialize quiz
  const initializeQuiz = useCallback(async (userName) => {
    console.log('🎯 Starting career guidance for:', userName);
    setIsLoading(true);
    setError(null);
    
    try {
      // Reset state
      talkifyAPI.resetQuiz();
      setChatMessages([]);
      setActionButtons([]);
      setCurrentQuestion(null);
      setIsQuizActive(false);
      setIsQuizComplete(false);
      setRecommendation(null);
      
      console.log('💓 Checking backend health...');
      // Check backend health
      const healthCheck = await talkifyAPI.healthCheck();
      console.log('✅ Backend health:', healthCheck);
      
      console.log('🚀 Starting quiz...');
      // Start quiz
      const response = await talkifyAPI.startQuiz(userName);
      console.log('📋 Quiz started, response:', response);
      
      // Add welcome message to chat
      setChatMessages([response.welcomeMessage]);
      
      // Set up first question
      if (response.question) {
        setCurrentQuestion(response.question);
        setIsQuizActive(true);
        
        // Add question to chat
        const questionMessage = {
          id: Date.now() + 1,
          text: response.question.question,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          type: "question"
        };
        
        setChatMessages(prev => [...prev, questionMessage]);
        
        // Speak the initial question
        voiceChatService.speakAIMessage(response.question.question);
        
        // Update action buttons
        const buttons = talkifyAPI.formatQuestionAsButtons(response.question);
        setActionButtons(buttons);
        
        // Update progress with dynamic calculation
        const newProgress = {
          currentStep: response.questionNumber,
          totalSteps: Math.max(response.totalQuestions, response.questionNumber + 2),
          percentage: Math.min(Math.round((response.questionNumber / Math.max(response.totalQuestions, 15)) * 100), 90)
        };
        setProgress(newProgress);
        progressRef.current = newProgress;
      }
      
    } catch (err) {
      console.error('❌ Quiz initialization failed:', err);
      // Better error handling - don't fail completely if backend is accessible
      if (err.message.includes('health')) {
        setError(`Cannot connect to server. Please ensure the backend is running.`);
      } else {
        setError(`Failed to initialize quiz: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit answer
  const submitAnswer = useCallback(async (answer) => {
    if (!currentQuestion || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Add user answer to chat immediately
      const userMessage = {
        id: Date.now(),
        text: answer,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
        type: "answer"
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      
      // Submit to backend
      const response = await talkifyAPI.submitAnswer(answer, currentQuestion);
      
      if (response.isComplete) {
        // Quiz is complete, show recommendation
        setIsQuizComplete(true);
        setIsQuizActive(false);
        setCurrentQuestion(null);
        setActionButtons([]);
        setRecommendation(response.recommendation);
        
        // Add recommendation message to chat
        const recommendationMessage = {
          id: Date.now() + 1,
          text: `Great! Based on your responses, I have the perfect course recommendation for you. Check out the showcase below!`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          type: "recommendation"
        };
        
        setChatMessages(prev => [...prev, recommendationMessage]);
        
        // Speak the recommendation message
        voiceChatService.speakAIMessage(recommendationMessage.text);
        
        // Update progress to 100%
        setProgress({
          currentStep: progressRef.current.totalSteps,
          totalSteps: progressRef.current.totalSteps,
          percentage: 100
        });
        
      } else if (response.nextQuestion) {
        // Continue with next question
        setCurrentQuestion(response.nextQuestion.question);
        
        // Add next question to chat
        const nextQuestionMessage = {
          id: Date.now() + 2,
          text: response.nextQuestion.question.question,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
          type: "question"
        };
        
        setChatMessages(prev => [...prev, nextQuestionMessage]);
        
        // Speak the next question
        voiceChatService.speakAIMessage(response.nextQuestion.question.question);
        
        // Update action buttons
        const buttons = talkifyAPI.formatQuestionAsButtons(response.nextQuestion.question);
        setActionButtons(buttons);
        
        // Update progress with dynamic calculation
        const newProgress = {
          currentStep: response.nextQuestion.questionNumber,
          totalSteps: Math.max(response.nextQuestion.totalQuestions, response.nextQuestion.questionNumber + 2),
          percentage: Math.min(Math.round((response.nextQuestion.questionNumber / Math.max(response.nextQuestion.totalQuestions, 15)) * 100), 90)
        };
        setProgress(newProgress);
        progressRef.current = newProgress;
      }
      
    } catch (err) {
      console.error('❌ Failed to submit answer:', err);
      // Improved error handling - check if it's a completion signal
      if (err.message.includes('Quiz complete') || 
          err.message.includes('Maximum number of questions') ||
          err.message.includes('Please proceed to get your course recommendation')) {
        // Try to get recommendation instead of showing error
        try {
          const recommendation = await talkifyAPI.getRecommendation();
          setIsQuizComplete(true);
          setIsQuizActive(false);
          setCurrentQuestion(null);
          setActionButtons([]);
          setRecommendation(recommendation);
          
          const recommendationMessage = {
            id: Date.now() + 1,
            text: `Great! Based on your responses, I have the perfect course recommendation for you. Check out the showcase below!`,
            sender: "bot",
            timestamp: new Date().toLocaleTimeString(),
            type: "recommendation"
          };
          
          setChatMessages(prev => [...prev, recommendationMessage]);
          setProgress({
            currentStep: progressRef.current.totalSteps,
            totalSteps: progressRef.current.totalSteps,
            percentage: 100
          });
        } catch (recError) {
          setError(`Quiz completed but failed to get recommendation: ${recError.message}`);
        }
      } else {
        setError(`Failed to submit answer: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, isLoading]);

  // Get showcase data from recommendation
  const getShowcaseData = useCallback(() => {
    if (!recommendation || !recommendation.recommended_course) {
      return null;
    }
    
    const course = recommendation.recommended_course;
    return {
      title: course.name,
      subtitle: `${course.provider} • ${course.duration} • ${course.level}`,
      imageUrl: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80`,
      badge: `${Math.round(recommendation.confidence_score * 100)}% Match`,
      link: course.link,
      description: course.description,
      reasoning: recommendation.reasoning,
      tags: course.tags
    };
  }, [recommendation]);

  // Reset quiz
  const resetQuiz = useCallback(() => {
    talkifyAPI.resetQuiz();
    setChatMessages([]);
    setActionButtons([]);
    setCurrentQuestion(null);
    setIsQuizActive(false);
    setIsQuizComplete(false);
    setRecommendation(null);
    setProgress({ currentStep: 1, totalSteps: 15, percentage: 6 });
    progressRef.current = { currentStep: 1, totalSteps: 15 };
    setError(null);
  }, []);

  // Start career guidance (main quiz flow)
  const startCareerGuidance = useCallback((userName) => {
    initializeQuiz(userName);
  }, [initializeQuiz]);

  return {
    // State
    isLoading,
    error,
    chatMessages,
    actionButtons,
    currentQuestion,
    isQuizActive,
    isQuizComplete,
    recommendation,
    progress,
    
    // Actions
    initializeQuiz,
    submitAnswer,
    resetQuiz,
    startCareerGuidance,
    
    // Derived data
    showcaseData: getShowcaseData(),
    
    // Utility
    conversationHistory: talkifyAPI.getConversationHistory()
  };
};
