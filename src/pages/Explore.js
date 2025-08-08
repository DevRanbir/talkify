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
  const [enable3D, setEnable3D] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  // Initialize Groq client
  const groq = new Groq({
    apiKey: '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',
    dangerouslyAllowBrowser: true
  });

  useEffect(() => {
    // Load 3D preference from localStorage
    const saved3DPreference = localStorage.getItem('enable3D');
    if (saved3DPreference !== null) {
      setEnable3D(saved3DPreference === 'true');
    }

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
    // Load the Spline viewer script if not already loaded and 3D is enabled
    if (enable3D && !document.querySelector('script[src*="splinetool"]')) {
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
  }, [enable3D]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Toggle 3D function
  const toggle3D = () => {
    const newState = !enable3D;
    setEnable3D(newState);
    localStorage.setItem('enable3D', newState.toString());
  };

  // Typing animation effect
  const typeMessage = (message, callback) => {
    setIsTyping(true);
    let currentMessage = "";
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < message.length) {
        currentMessage += message[index];
        setChatMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0 && !newMessages[newMessages.length - 1].isUser) {
            newMessages[newMessages.length - 1].text = currentMessage;
          }
          return newMessages;
        });
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        if (callback) callback();
      }
    }, 30);
  };

  // Add message to chat with typing effect
  const addMessage = (message, isUser = false, useTyping = false) => {
    const newMessage = {
      id: Date.now(),
      text: isUser || !useTyping ? message : "",
      isUser,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    
    if (!isUser && useTyping) {
      setTimeout(() => {
        typeMessage(message, () => {
          // Message typing completed
        });
      }, 100);
    }
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
      
      // Add AI response with typing effect
      setTimeout(() => {
        let messageText = response.message;
        
        // If there are course recommendations, format them nicely
        if (response.recommendations && response.recommendations.length > 0) {
          messageText += "\n\nHere are my top recommendations for you:\n\n";
          response.recommendations.forEach((rec, index) => {
            messageText += `${index + 1}. ${rec.name}\n${rec.reason}\n\n`;
          });
        }
        
        addMessage(messageText, false, true);
        setCurrentOptions(response.options || []);
        
        // Store recommendations for potential display
        if (response.recommendations) {
          setCurrentRecommendations(response.recommendations);
        }
        
        // Speak after typing is complete
        setTimeout(() => {
          speakText(response.message);
        }, messageText.length * 30 + 500);
        
        setIsProcessing(false);
      }, 800);
      
    } catch (error) {
      console.error('Error getting career recommendation:', error);
      
      // Fallback response
      setTimeout(() => {
        const fallbackMessage = "I'm having trouble processing that right now. Let me help you explore some popular engineering options!";
        addMessage(fallbackMessage, false, true);
        setCurrentOptions([
          "Tell me about Computer Science",
          "What about Mechanical Engineering?",
          "Show me all engineering options",
          "Start over with my interests"
        ]);
        setTimeout(() => {
          speakText(fallbackMessage);
        }, fallbackMessage.length * 30 + 500);
        setIsProcessing(false);
      }, 800);
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

      addMessage(welcomeMessage, false, true);
      setCurrentOptions(initialOptions);
      
      // Speak the welcome message after typing is complete
      setTimeout(() => {
        speakText(welcomeMessage);
      }, welcomeMessage.length * 30 + 800);
    }
  };

  return (
    <div className={`explore-page ${!enable3D ? 'no-3d' : ''}`}>
      {/* 3D Toggle Button */}
      <button 
        className="toggle-3d-btn"
        onClick={toggle3D}
        title={enable3D ? "Disable 3D Effects" : "Enable 3D Effects"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {enable3D ? (
            <path d="M12 2L2 7L12 12L22 7L12 2Z M2 17L12 22L22 17 M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          ) : (
            <path d="M6 2L18 2 M6 6L18 6 M6 10L18 10 M6 14L18 14 M6 18L18 18 M6 22L18 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          )}
        </svg>
      </button>

      {/* Conditional 3D Background */}
      {enable3D && (
        <>
          {/* Show special background overlay only when AI is speaking */}
          {isSpeaking && (
            <div className="spline-background overlay">
              <spline-viewer
                url={"https://prod.spline.design/4sg93nDCzKSe-h-N/scene.splinecode"}
              ></spline-viewer>
            </div>
          )}
          
          {/* Always visible background */}
          <div className="spline-background">
            <spline-viewer
              url={"https://prod.spline.design/jmhMBw1w7fytoypD/scene.splinecode"}
            ></spline-viewer>
          </div>
        </>
      )}

      {/* Fallback gradient background when 3D is disabled */}
      {!enable3D && (
        <div className="gradient-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="explore-container">
        {/* Show Start Button if conversation hasn't started */}
        {showStartButton ? (
          <div className="start-container">
            <div className="welcome-card">
              <div className="welcome-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.5 7L14.5 12L9.5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h2>Career Discovery Hub</h2>
              
              <div className="welcome-subtitle">
                {userName && userStream ? (
                  <p>Welcome back, <span className="highlight">{userName}</span>! Ready to explore engineering careers after {userStream}?</p>
                ) : userName ? (
                  <p>Hello <span className="highlight">{userName}</span>! Let's discover your perfect engineering career path.</p>
                ) : (
                  <p>Welcome to AI-powered career guidance. Let's find your ideal engineering program.</p>
                )}
              </div>

              <div className="start-features">
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span>Personalized Recommendations</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🤖</span>
                  <span>AI-Powered Guidance</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎤</span>
                  <span>Voice Interactions</span>
                </div>
              </div>
              
              <button 
                className="start-btn"
                onClick={handleStartConversation}
                disabled={!careerService}
              >
                <span className="btn-text">Start Career Discovery</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {!careerService && (
                <div className="loading-notice">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p>Initializing AI system...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="chat-interface">
            {/* Chat Messages Panel */}
            <div className="chat-panel">
              <div className="chat-header">
                <div className="header-content">
                  <div className="chat-title">
                    <h3>Career Assistant</h3>
                    <div className="status-indicator">
                      <span className={`status-dot ${isSpeaking ? 'speaking' : isProcessing ? 'processing' : 'active'}`}></span>
                      <span className="status-text">
                        {isSpeaking ? 'Speaking' : isProcessing ? 'Processing' : 'Ready'}
                      </span>
                    </div>
                  </div>
                  {userName && (
                    <div className="user-info">
                      <span className="user-name">{userName}</span>
                      {userStream && <span className="user-stream">From {userStream}</span>}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="chat-messages">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
                  >
                    <div className="message-content">
                      <div className="message-text">
                        {message.text.split('\n').map((line, index) => (
                          <p key={index} style={{ margin: index === 0 ? '0' : '0.5rem 0 0 0' }}>
                            {line}
                          </p>
                        ))}
                      </div>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="message ai-message">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
              
              {/* Speaking/Processing Indicator */}
              {(isSpeaking || isProcessing) && (
                <div className="activity-indicator">
                  <div className="activity-animation">
                    <div className="pulse-ring"></div>
                    <div className="activity-icon">
                      {isSpeaking ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 1C9.5 1 7.5 3 7.5 5.5V11.5C7.5 14 9.5 16 12 16C14.5 16 16.5 14 16.5 11.5V5.5C16.5 3 14.5 1 12 1Z M19 10V11.5C19 15.65 15.65 19 11.5 19H12.5C16.65 19 20 15.65 20 11.5V10M12 19V23M8 23H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <p>{isProcessing ? "Processing your input..." : "AI is speaking..."}</p>
                </div>
              )}
            </div>

            {/* Options Panel */}
            <div className="options-panel">
              <div className="options-header">
                <h4>Explore Options</h4>
                <div className="options-count">
                  {currentOptions.length} {currentOptions.length === 1 ? 'option' : 'options'}
                </div>
              </div>
              
              <div className="options-list">
                {currentOptions.map((option, index) => (
                  <button
                    key={index}
                    className="option-btn"
                    onClick={() => handleOptionSelect(option)}
                    disabled={isSpeaking || isProcessing || isTyping}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="option-text">{option}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ))}
              </div>
              
              {/* Course Recommendations */}
              {currentRecommendations.length > 0 && (
                <div className="recommendations-section">
                  <div className="recommendations-header">
                    <h4>Recommended Courses</h4>
                    <span className="recommendations-count">{currentRecommendations.length}</span>
                  </div>
                  <div className="recommendations-list">
                    {currentRecommendations.map((rec, index) => (
                      <div key={index} className="recommendation-card" style={{ animationDelay: `${index * 0.15}s` }}>
                        <div className="rec-content">
                          <h5>{rec.name}</h5>
                          <p>{rec.reason}</p>
                        </div>
                        <a href={rec.link} target="_blank" rel="noopener noreferrer" className="course-link">
                          <span>Learn More</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Explore;
