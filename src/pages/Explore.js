import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./Explore.css";
import { useTheme } from "../contexts/ThemeContext";
import Groq from 'groq-sdk';
import CareerRecommendationService from "../services/CareerRecommendationService";

const Explore = () => {
  const { isDarkMode, showLoader, hideLoader } = useTheme();
  const { userName: urlUserName } = useParams();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userName, setUserName] = useState("");
  const [userStream, setUserStream] = useState("");
  const [currentOptions, setCurrentOptions] = useState([]);
  const [conversationStage, setConversationStage] = useState("welcome");
  const [userInteracted, setUserInteracted] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const [careerService, setCareerService] = useState(null);
  const [userProfile, setUserProfile] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentRecommendations, setCurrentRecommendations] = useState([]);
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  // Initialize Groq client
  const groq = new Groq({
    apiKey: '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',
    dangerouslyAllowBrowser: true
  });

  useEffect(() => {
    // Initialize career recommendation service
    const initCareerService = async () => {
      const service = new CareerRecommendationService();
      await service.loadCourses();
      setCareerService(service);
    };
    
    initCareerService();

    // Load user data from sessionStorage if coming from homepage
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserName(parsedData.name);
      setUserStream(parsedData.stream);
      setUserProfile({ previousStream: parsedData.stream });
      setConversationStage("welcome");
      // Clear the data after using it
      sessionStorage.removeItem('userData');
    } else if (urlUserName) {
      // If no userData but has URL parameter, extract name from URL
      const nameFromUrl = urlUserName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      setUserName(nameFromUrl);
      setConversationStage("welcome");
    }

    // Check if this is an initial load (not a refresh or reactivation)
    const isInitialLoad = !sessionStorage.getItem('explorePageVisited');
    
    // Only show loader on true initial load
    if (isInitialLoad && !document.querySelector('.loader-overlay')) {
      showLoader("Loading Career Guidance...", "explore-page");
      
      // Mark that the page has been visited
      sessionStorage.setItem('explorePageVisited', 'true');
      
      const timer = setTimeout(() => {
        hideLoader("explore-page");
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [urlUserName]);

  useEffect(() => {
    // Load the Spline viewer script if not already loaded
    if (!document.querySelector('script[src*="splinetool"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://unpkg.com/@splinetool/viewer@1.10.42/build/spline-viewer.js";
      
      script.onload = () => {
        // Script loaded successfully
      };
      
      script.onerror = () => {
        // Handle script loading error
      };
      
      document.head.appendChild(script);
    }
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Add message to chat
  const addMessage = (message, isUser = false) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      text: message,
      isUser,
      timestamp: new Date()
    }]);
  };

  // Text-to-Speech function using Groq
  const speakText = async (text) => {
    try {
      setIsSpeaking(true);
      
      const response = await groq.audio.speech.create({
        model: "playai-tts",
        voice: "Calum-PlayAI",
        input: text,
        response_format: "wav"
      });
      
      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
    }
  };

  // Handle start button click
  const handleStartConversation = async () => {
    setUserInteracted(true);
    setShowStartButton(false);
    await startConversation();
  };

  // Handle option selection
  const handleOptionSelect = async (option) => {
    if (!careerService || isProcessing) return;
    
    setIsProcessing(true);
    setUserInteracted(true);
    
    // Add user message
    addMessage(option, true);
    
    try {
      // Get AI-powered recommendation
      const response = await careerService.getRecommendation(
        option, 
        conversationStage, 
        { ...userProfile, previousStream: userStream }
      );
      
      // Update conversation state
      setConversationStage(response.nextStage || conversationStage);
      
      // Update user profile if needed
      if (response.profileUpdate) {
        setUserProfile(prev => ({ ...prev, ...response.profileUpdate }));
      }
      
      // Add AI response and speak it
      setTimeout(() => {
        let messageText = response.message;
        
        // If there are course recommendations, format them nicely
        if (response.recommendations && response.recommendations.length > 0) {
          messageText += "\n\nHere are my top recommendations for you:\n\n";
          response.recommendations.forEach((rec, index) => {
            messageText += `${index + 1}. ${rec.name}\n${rec.reason}\n\n`;
          });
        }
        
        addMessage(messageText, false);
        setCurrentOptions(response.options || []);
        
        // Store recommendations for potential display
        if (response.recommendations) {
          setCurrentRecommendations(response.recommendations);
        }
        
        speakText(response.message);
        setIsProcessing(false);
      }, 500);
      
    } catch (error) {
      console.error('Error getting career recommendation:', error);
      
      // Fallback response
      setTimeout(() => {
        const fallbackMessage = "I'm having trouble processing that right now. Let me help you explore some popular engineering options!";
        addMessage(fallbackMessage, false);
        setCurrentOptions([
          "Tell me about Computer Science",
          "What about Mechanical Engineering?",
          "Show me all engineering options",
          "Start over with my interests"
        ]);
        speakText(fallbackMessage);
        setIsProcessing(false);
      }, 500);
    }
  };

  // Initialize conversation
  const startConversation = async () => {
    if (chatMessages.length === 0 && careerService) {
      let welcomeMessage = "";
      let initialOptions = [];

      if (userName && userStream) {
        // Personalized greeting for users coming from homepage
        welcomeMessage = `Hello ${userName}! I see you've studied ${userStream}. I'm your AI career counselor and I'm excited to help you discover the perfect engineering career path at Chandigarh University!`;
        
        // Get AI-powered initial options
        try {
          const response = await careerService.getRecommendation(
            `User ${userName} from ${userStream} background wants career guidance`,
            "welcome",
            { previousStream: userStream }
          );
          initialOptions = response.options || [
            "Help me explore engineering options",
            "I want to continue in my field",
            "I'm interested in changing streams",
            "Show me trending career paths"
          ];
        } catch (error) {
          initialOptions = [
            "Help me explore engineering options",
            "I want to continue in my field", 
            "I'm interested in changing streams",
            "Show me trending career paths"
          ];
        }
      } else if (userName) {
        // User with name but no stream info
        welcomeMessage = `Hello ${userName}! Welcome to Talkify's AI-powered career guidance. I'm here to help you discover the perfect engineering program at Chandigarh University!`;
        initialOptions = [
          "I love solving complex problems",
          "I'm interested in technology and innovation",
          "I want to build and create things", 
          "I'm not sure yet, help me explore"
        ];
      } else {
        // Default for users without data
        welcomeMessage = "Hello! Welcome to Talkify's AI-powered career guidance. I'm here to help you discover the perfect engineering program at Chandigarh University!";
        initialOptions = [
          "I love solving complex problems",
          "I'm interested in technology and innovation",
          "I want to build and create things",
          "I'm not sure yet, help me explore"
        ];
      }

      addMessage(welcomeMessage, false);
      setCurrentOptions(initialOptions);
      
      // Speak the welcome message after adding it
      setTimeout(() => {
        speakText(welcomeMessage);
      }, 500);
    }
  };

  return (
    <div className="explore-page">
      {/* Always visible background */}
      <div className="spline-background">
        <spline-viewer
          url={"https://prod.spline.design/jmhMBw1w7fytoypD/scene.splinecode"}
        ></spline-viewer>
      </div>

      {/* Show special background overlay only when AI is speaking */}
      {isSpeaking && (
        <div className="spline-background overlay">
          <spline-viewer
            url={"https://prod.spline.design/4sg93nDCzKSe-h-N/scene.splinecode"}
          ></spline-viewer>
        </div>
      )}

      {/* Apple-style Chat Interface */}
      <div className="chat-interface">
        {/* Show Start Button if conversation hasn't started */}
        {showStartButton ? (
          <div className="start-container">
            <div className="welcome-card">
              <h2>🎯 Career Guidance Hub</h2>
              {userName && userStream ? (
                <p>Hello {userName}! Ready to explore engineering careers after {userStream}?</p>
              ) : userName ? (
                <p>Hello {userName}! Let's discover your perfect engineering career path!</p>
              ) : (
                <p>Welcome to AI-powered career guidance! Let's find your ideal engineering program.</p>
              )}
              <button 
                className="start-btn"
                onClick={handleStartConversation}
                disabled={!careerService}
              >
                🚀 Start Career Discovery
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Left side - Chat Messages */}
            <div className="chat-container">
              <div className="chat-header">
                <h3>🎯 Career Guidance Assistant</h3>
                {userName && (
                  <p>
                    Guiding {userName}'s career journey
                    {userStream && <span className="user-stream"> • From {userStream}</span>}
                  </p>
                )}
              </div>
              
              <div className="chat-messages">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
                  >
                    <div className="message-content">
                      <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              {(isSpeaking || isProcessing) && (
                <div className="speaking-indicator">
                  <div className="pulse-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p>{isProcessing ? "Processing your input..." : "AI is speaking..."}</p>
                </div>
              )}
            </div>

            {/* Right side - Option Buttons */}
            <div className="options-container">
              <div className="options-header">
                <h4>🎯 Career Exploration</h4>
              </div>
              
              <div className="options-list">
                {currentOptions.map((option, index) => (
                  <button
                    key={index}
                    className="option-btn"
                    onClick={() => handleOptionSelect(option)}
                    disabled={isSpeaking || isProcessing}
                  >
                    <span className="option-text">{option}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ))}
              </div>
              
              {/* Show course recommendations if available */}
              {currentRecommendations.length > 0 && (
                <div className="recommendations-section">
                  <h4>📚 Recommended Courses</h4>
                  <div className="recommendations-list">
                    {currentRecommendations.map((rec, index) => (
                      <div key={index} className="recommendation-card">
                        <h5>{rec.name}</h5>
                        <p>{rec.reason}</p>
                        <a href={rec.link} target="_blank" rel="noopener noreferrer" className="course-link">
                          Learn More →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Explore;
