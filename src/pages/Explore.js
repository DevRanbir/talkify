import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Explore.css";
import { useTheme } from "../contexts/ThemeContext";
import { useQuizManager } from "../hooks/useQuizManager";
import TalkifyAPI from "../services/TalkifyAPI";
import voiceChatService from "../services/VoiceChatService";

const Explore = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, showLoader, hideLoader, toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showShowcase, setShowShowcase] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [localChatMessages, setLocalChatMessages] = useState([]);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState(voiceChatService.getVoiceSettings());
  const [availableModels] = useState(voiceChatService.getAvailableModels());
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideoTransition, setShowVideoTransition] = useState(false);
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);
  const [videoHasPlayed, setVideoHasPlayed] = useState(false);
  const chatMessagesRef = useRef(null);
  const videoRef = useRef(null);
  const videoTimeoutRef = useRef(null);
  
  // Use the quiz manager hook
  const {
    isLoading,
    error,
    chatMessages,
    actionButtons,
    isQuizActive,
    isQuizComplete,
    progress,
    showcaseData,
    submitAnswer,
    startCareerGuidance,
    resetQuiz
  } = useQuizManager();

  // Initial action buttons for non-quiz interactions
  const [defaultActionButtons] = useState([
    { id: 1, label: "Career Guidance MAX", icon: "🎯", action: "career" },
    { id: 2, label: "Chat and Get Guided", icon: "💬", action: "chat" }
  ]);

  // Dynamic steps based on quiz progress
  const [steps, setSteps] = useState([
    { id: 1, label: "Welcome", status: "completed" },
    { id: 2, label: "Interests", status: "pending" },
    { id: 3, label: "Skills", status: "pending" },
    { id: 4, label: "Preferences", status: "pending" },
    { id: 5, label: "Mixup", status: "pending" },
    { id: 6, label: "Results", status: "pending" }
  ]);

  useEffect(() => {
    // Load user data from session storage
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else if (userName) {
      // If no stored data but userName exists, create basic user data
      setUserData({ name: userName.replace(/-/g, ' '), stream: 'Unknown' });
    }

    // Load the Spline viewer script for the main area
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@splinetool/viewer@1.10.42/build/spline-viewer.js";
    document.head.appendChild(script);

    // Periodic check for voice settings updates (to handle rate limit recovery)
    const voiceCheckInterval = setInterval(() => {
      setVoiceSettings(voiceChatService.getVoiceSettings());
    }, 30000); // Check every 30 seconds

    // Register for immediate voice status change notifications
    const handleVoiceStatusChange = () => {
      setVoiceSettings(voiceChatService.getVoiceSettings());
    };
    voiceChatService.addStatusChangeCallback(handleVoiceStatusChange);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      clearInterval(voiceCheckInterval);
      voiceChatService.removeStatusChangeCallback(handleVoiceStatusChange);
    };
  }, [userName]);

  // Update steps based on quiz progress and reset video state when quiz starts
  useEffect(() => {
    if (isQuizActive || isQuizComplete) {
      setSteps(prevSteps => 
        prevSteps.map((step, index) => {
          if (index + 1 < progress.currentStep) {
            return { ...step, status: "completed" };
          } else if (index + 1 === progress.currentStep) {
            return { ...step, status: "active" };
          } else {
            return { ...step, status: "pending" };
          }
        })
      );
      
      // Reset video state when a new quiz starts (but not when quiz completes)
      if (isQuizActive && progress.currentStep === 1 && videoHasPlayed) {
        console.log('🔄 New quiz started - resetting video state');
        setVideoHasPlayed(false);
        setVideoLoadFailed(false);
        setIsVideoPlaying(false);
        setShowVideoTransition(false);
      }
    }
  }, [progress, isQuizActive, isQuizComplete, videoHasPlayed]);

  // Show showcase when quiz completes and data is available
  useEffect(() => {
    if (isQuizComplete && showcaseData && !isVideoPlaying && !videoLoadFailed && !videoHasPlayed) {
      // Start video transition before showing showcase (only if video hasn't played yet)
      console.log('🎬 Starting video transition for the first time');
      setShowVideoTransition(true);
      setIsVideoPlaying(true);
      setShowShowcase(false); // Ensure showcase is hidden while video is playing
      
      // Set a longer timeout to allow video to load
      videoTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Video timeout reached - showing showcase');
        setVideoLoadFailed(true);
        handleVideoEnd();
      }, 10000); // Increased to 10 seconds
    } else if (isQuizComplete && showcaseData && (videoLoadFailed || videoHasPlayed) && !isVideoPlaying) {
      // Show showcase if video failed OR has already played
      console.log('🎬 Showing showcase - video failed or already played');
      setShowShowcase(true);
    }
    
    // Cleanup timeout on unmount or when video ends
    return () => {
      if (videoTimeoutRef.current) {
        clearTimeout(videoTimeoutRef.current);
        videoTimeoutRef.current = null;
      }
    };
  }, [isQuizComplete, showcaseData, isVideoPlaying, videoLoadFailed, videoHasPlayed]);

  // Auto-scroll chat messages when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      // For regular chat (expanded), scroll to bottom (normal behavior)
      if (isChatExpanded && localChatMessages.length > 0) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
      // For career guidance (collapsed quiz), scroll to top (reversed order)
      else if (!isChatExpanded && (isQuizActive || isQuizComplete) && chatMessages.length > 0) {
        chatMessagesRef.current.scrollTop = 0;
      }
    }
  }, [localChatMessages, chatMessages, isChatExpanded, isQuizActive, isQuizComplete]);

  const handleActionClick = async (action) => {
    console.log('🎬 Action clicked:', action, 'Loading state:', isLoading);
    if (isLoading) return;

    if (action === "career") {
      // Start the AI-powered career guidance quiz
      setIsChatExpanded(false); // Collapse chat when starting career guidance
      console.log('🎯 Starting career guidance for:', userData?.name || userName || "User");
      showLoader("Initializing AI Career Assistant...", "career");
      try {
        await startCareerGuidance(userData?.name || userName || "User");
        hideLoader("career");
        console.log('✅ Career guidance started successfully');
      } catch (error) {
        hideLoader("career");
        console.error("❌ Failed to start career guidance:", error);
      }
    } else if (action === "chat") {
      // Handle chat and get guided action
      setIsChatExpanded(true);
      setIsChatLoading(true);
      setChatError(null);
      showLoader("Starting guided chat session...", "chat");
      
      try {
        // Initialize chat session with a welcome message
        const welcomeMessage = {
          id: Date.now(),
          text: `Hello ${userData?.name || userName || "there"}! 👋 I’m Talkify, Your career guide with Chandigarh University — helping you find your passion, pick the right course, and shape a future you'll be proud of.`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setLocalChatMessages([welcomeMessage]);
        
        // Always speak the welcome message
        await voiceChatService.forceSpeak(welcomeMessage.text);
        
        hideLoader("chat");
        setIsChatLoading(false);
        console.log('✅ Chat and Get Guided mode activated');
      } catch (error) {
        hideLoader("chat");
        setIsChatLoading(false);
        setChatError('Failed to initialize chat. Please try again.');
        console.error('❌ Failed to initialize chat:', error);
      }
    } else {
      // Handle other actions (study, skills, interview, insights)
      showLoader(`Preparing ${action} module...`, action);
      setTimeout(() => {
        // Show coming soon message for other features
        console.log(`${action.charAt(0).toUpperCase() + action.slice(1)} module is coming soon!`);
        // Note: We'll handle this through the quiz manager in the future
        hideLoader(action);
      }, 1500);
    }
  };

  const handleButtonClick = async (buttonAction) => {
    if (isQuizActive && !isLoading) {
      // This is a quiz answer button
      await submitAnswer(buttonAction);
    } else {
      // This is a regular action button
      await handleActionClick(buttonAction);
    }
  };

  const handleSourceClick = () => {
    if (showcaseData && showcaseData.link) {
      showLoader("Opening course...", "source");
      setTimeout(() => {
        window.open(showcaseData.link, '_blank');
        hideLoader("source");
      }, 1000);
    }
  };

  const handleUtilityAction = (action) => {
    switch (action) {
      case 'voice':
        setShowVoiceSettings(true);
        break;
      case 'reset':
        showLoader("Resetting session...", "reset");
        setTimeout(() => {
          // Reset quiz and clear any session data
          resetQuiz();
          setIsChatExpanded(false); // Collapse chat on reset
          setShowShowcase(false); // Hide showcase on reset
          setIsVideoPlaying(false); // Reset video state
          setShowVideoTransition(false); // Reset video transition
          setVideoLoadFailed(false); // Reset video error state
          setVideoHasPlayed(false); // Reset video played state
          console.log("Session reset successfully!");
          hideLoader("reset");
        }, 1000);
        break;
      case 'theme':
        // Toggle theme using the theme context
        toggleTheme();
        console.log(`Switched to ${isDarkMode ? 'light' : 'dark'} mode!`);
        break;
      case 'exit':
        setShowExitWarning(true);
        break;
      default:
        break;
    }
  };

  const handleConfirmExit = () => {
    setShowExitWarning(false);
    showLoader("Returning to home...", "exit");
    setTimeout(() => {
      navigate('/');
      hideLoader("exit");
    }, 500);
  };

  const handleCancelExit = () => {
    setShowExitWarning(false);
  };

  const handleCloseVoiceSettings = () => {
    setShowVoiceSettings(false);
  };

  const handleCollapseChat = () => {
    setIsChatExpanded(false);
    setLocalChatMessages([]); // Clear local messages when collapsing
    setChatSessionId(null); // Clear session ID
    setChatError(null); // Clear any errors
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || isChatLoading) return;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message to local state immediately
    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: timestamp
    };
    
    setLocalChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    setChatError(null);
    
    try {
      // Send message to backend API
      const response = await TalkifyAPI.sendChatMessage(
        message, 
        chatSessionId, 
        userData?.name || userName || 'user'
      );
      
      // Update session ID if this is the first message
      if (!chatSessionId && response.sessionId) {
        setChatSessionId(response.sessionId);
      }
      
      // Add AI response to chat
      const botMessage = {
        id: Date.now() + 1,
        text: response.response,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setLocalChatMessages(prev => [...prev, botMessage]);
      
      // Speak the AI response
      await voiceChatService.speakAIMessage(response.response);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setChatError(error.message || 'Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      
      setLocalChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Voice control functions
  const toggleVoice = () => {
    const newSettings = { ...voiceSettings, isVoiceEnabled: !voiceSettings.isVoiceEnabled };
    setVoiceSettings(newSettings);
    voiceChatService.setVoiceEnabled(newSettings.isVoiceEnabled);
    
    // Note: Video sound is now independent of voice settings
  };

  const toggleAutoSpeak = () => {
    const newSettings = { ...voiceSettings, autoSpeak: !voiceSettings.autoSpeak };
    setVoiceSettings(newSettings);
    voiceChatService.setAutoSpeak(newSettings.autoSpeak);
  };

  const handleModelChange = (model) => {
    voiceChatService.setTTSModel(model);
    setVoiceSettings(voiceChatService.getVoiceSettings());
  };

  const handleVoiceChange = (voice) => {
    voiceChatService.setTTSVoice(voice);
    setVoiceSettings(voiceChatService.getVoiceSettings());
  };

  const stopSpeaking = () => {
    voiceChatService.stopSpeaking();
  };

  const retryTTS = () => {
    voiceChatService.retryTTS();
    setVoiceSettings(voiceChatService.getVoiceSettings());
    console.log('🔄 TTS retry requested');
    
    // Show feedback to user
    if (!voiceChatService.getVoiceSettings().isTemporarilyDisabled) {
      console.log('✅ TTS service restored successfully');
    }
  };

  // Video handling functions
  const handleVideoLoadedData = () => {
    console.log('✅ Video loaded successfully');
    // Clear timeout since video loaded successfully
    if (videoTimeoutRef.current) {
      clearTimeout(videoTimeoutRef.current);
      videoTimeoutRef.current = null;
    }
    
    // Ensure showcase is hidden while video plays
    setShowShowcase(false);
    
    // Only play if video hasn't played before and is supposed to be playing
    if (videoRef.current && isVideoPlaying && !videoHasPlayed) {
      // Enable video sound by default
      videoRef.current.muted = false;
      videoRef.current.volume = 0.8; // Set volume to 80%
      console.log('🎬 Starting video playback with sound...');
      videoRef.current.play().catch(error => {
        console.error('❌ Video play failed:', error);
        setVideoLoadFailed(true);
        handleVideoEnd();
      });
    } else if (videoHasPlayed) {
      console.log('🎬 Video has already played, skipping playback');
      handleVideoEnd();
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      
      // Show showcase 1 second before video ends
      if (duration - currentTime <= 1 && !showShowcase && isVideoPlaying) {
        console.log('🎬 Showing showcase 1 second before video ends');
        setShowShowcase(true);
      }
    }
  };

  const handleVideoEnd = () => {
    console.log('🎬 Video ended or failed - marking as played and showing showcase');
    // Clear timeout if video ends naturally
    if (videoTimeoutRef.current) {
      clearTimeout(videoTimeoutRef.current);
      videoTimeoutRef.current = null;
    }
    
    setIsVideoPlaying(false);
    setShowVideoTransition(false);
    setVideoHasPlayed(true); // Mark that video has played to prevent replay
    setShowShowcase(true);
  };

  const handleVideoError = (error) => {
    console.error('🚨 Video loading failed:', error.target?.error);
    console.log('📁 Video API endpoints attempted: /api/v1/vidmp4 and /api/v1/vidwebm');
    console.log('🔍 Check if backend is running and video files exist in backend/videos/ folder');
    setVideoLoadFailed(true);
    handleVideoEnd();
  };

  return (
    <div className="explore-page">
      <div className="explore-container">
        {/* Div 1 - Chat Box */}
        <div className={`explore-div ${isChatExpanded ? 'div1-expanded' : 'div1'}`}>
          <div className="chat-container">
            <div className="chat-header">
              <h3>Chat Assistant</h3>
              <div className="chat-controls">
                {isChatExpanded && (
                  <button 
                    className="collapse-chat-button" 
                    onClick={handleCollapseChat}
                    title="Collapse Chat"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="chat-messages" ref={chatMessagesRef}>
              {chatError && isChatExpanded && (
                <div className="chat-error">
                  <p>⚠️ {chatError}</p>
                </div>
              )}
              {(isChatExpanded ? localChatMessages : chatMessages).length > 0 ? (
                <>
                  {/* Show loading indicator first for career guidance (reverse order) */}
                  {isChatLoading && !isChatExpanded && (isQuizActive || isQuizComplete) && (
                    <div className="message bot-message loading-message">
                      <div className="message-content">
                        <p>
                          <span className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </span>
                          AI is typing...
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Messages display logic - reverse for career guidance, normal for chat */}
                  {(() => {
                    const messagesToShow = isChatExpanded ? localChatMessages : chatMessages;
                    const isCareerGuidance = !isChatExpanded && (isQuizActive || isQuizComplete);
                    
                    // For career guidance, reverse the order (newest first)
                    const orderedMessages = isCareerGuidance 
                      ? [...messagesToShow].reverse() 
                      : messagesToShow;
                    
                    return orderedMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'} ${message.isError ? 'error-message' : ''}`}
                      >
                        <div className="message-content">
                          <p>{message.text}</p>
                          <span className="message-time">{message.timestamp}</span>
                        </div>
                      </div>
                    ));
                  })()}
                  
                  {/* Show loading indicator at bottom for regular chat (normal order) */}
                  {isChatLoading && isChatExpanded && (
                    <div className="message bot-message loading-message">
                      <div className="message-content">
                        <p>
                          <span className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </span>
                          AI is typing...
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="chat-welcome">
                  <div className="welcome-icon">🤖</div>
                  <h4>{isChatExpanded ? "Guided Chat Session" : "Welcome to Talkify!"}</h4>
                  <p>
                    {isChatExpanded 
                      ? "Your guided chat session is now active. Ask me anything about your career, studies, or personal development!"
                      : "Choose an action from Quick Actions to get started with your learning journey."
                    }
                  </p>
                  {!isChatExpanded && (
                    <div className="welcome-suggestions">
                      <span>Try:</span>
                      <ul>
                        <li>🎯 Career Guidance MAX</li>
                        <li>💬 Chat and Get Guided</li>
                      </ul>
                    </div>
                  )}
                  {isChatExpanded && (
                    <div className="chat-examples">
                      <span>Examples:</span>
                      <ul>
                        <li>💡 "What career paths suit my interests?"</li>
                        <li>📚 "Help me plan my studies"</li>
                        <li>🎯 "What skills should I develop?"</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Chat Input - Only show when expanded */}
            {isChatExpanded && (
              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <input
                    type="text"
                    placeholder={isChatLoading ? "AI is typing..." : "Type your message here..."}
                    className="chat-input"
                    disabled={isChatLoading}
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter' && e.target.value.trim() && !isChatLoading) {
                        const message = e.target.value.trim();
                        e.target.value = '';
                        await handleSendMessage(message);
                      }
                    }}
                  />
                  <button 
                    className={`send-button ${isChatLoading ? 'loading' : ''}`}
                    disabled={isChatLoading}
                    onClick={async (e) => {
                      const input = e.target.parentElement.querySelector('.chat-input');
                      if (input.value.trim() && !isChatLoading) {
                        const message = input.value.trim();
                        input.value = '';
                        await handleSendMessage(message);
                      }
                    }}
                  >
                    {isChatLoading ? (
                      <div className="loading-spinner">⏳</div>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Div 2 - Action Buttons */}
        {!isChatExpanded && (
          <div className={`explore-div ${isQuizActive ? 'div2-quiz-active' : 'div2'}`}>
          <div className="action-buttons-container">
            <h3 className="section-title">
              {isQuizActive ? "Your Answer Options" : "Quick Actions"}
            </h3>
            {error && (
              <div className="error-message">
                <p>⚠️ {error}</p>
                <button onClick={resetQuiz} className="retry-button">
                  Try Again
                </button>
              </div>
            )}
            <div className="action-buttons">
              {(isQuizActive ? actionButtons : defaultActionButtons).map((button) => (
                <button
                  key={button.id}
                  className={`action-button ${isLoading ? 'loading' : ''} ${isQuizActive ? 'quiz-button' : ''}`}
                  onClick={() => handleButtonClick(button.action)}
                  disabled={isLoading}
                >
                  <span className="button-icon">{button.icon}</span>
                  <span className="button-label">{button.label}</span>
                  {isLoading && <span className="loading-spinner">⏳</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Div 3 - Main Area with Spline Background */}
        {!isChatExpanded && (
          <div className="explore-div div3">
          <div className="main-area">
            {/* Spline Background */}
            <div className={`spline-background ${showVideoTransition ? 'fade-out' : 'fade-in'}`}>
              <spline-viewer
                url={
                  isDarkMode
                    ? "https://prod.spline.design/jmhMBw1w7fytoypD/scene.splinecode"
                    : "https://prod.spline.design/jmhMBw1w7fytoypD/scene.splinecode"
                }
                key={isDarkMode ? "dark" : "light"}
              ></spline-viewer>
            </div>
            
            {/* Video Overlay */}
            {showVideoTransition && !videoLoadFailed && (
              <div className={`video-overlay ${isVideoPlaying ? 'fade-in' : 'fade-out'}`}>
                <video
                  ref={videoRef}
                  className="recommendation-video"
                  muted={false}
                  playsInline
                  onLoadedData={handleVideoLoadedData}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onEnded={handleVideoEnd}
                  onError={handleVideoError}
                  onLoadStart={() => console.log('🎬 Video load started')}
                  onCanPlay={() => console.log('🎬 Video can play')}
                  onPlaying={() => console.log('🎬 Video is playing')}
                  preload="auto"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 10
                  }}
                >
                  <source src={`${process.env.NODE_ENV === 'production' ? 'https://talkify-inproduction.up.railway.app' : 'http://localhost:8000'}/api/v1/vidmp4`} type="video/mp4" />
                  <source src={`${process.env.NODE_ENV === 'production' ? 'https://talkify-inproduction.up.railway.app' : 'http://localhost:8000'}/api/v1/vidwebm`} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
                
                <div className="video-loading">
                  <div className="loading-spinner">🎬</div>
                  <p>Loading personalized video...</p>
                  <small>If video doesn't load, we'll show your results directly</small>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Div 4 - User Name Display */}
        <div className="explore-div div4">
          <div className="user-display">
            <div className="user-profile">
              <div className="user-avatar">
                {(userData?.name || userName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {userData?.name || userName?.replace(/-/g, ' ') || 'User'}
                </span>
                <span className="user-stream">
                  {userData?.stream || 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Div 5 - Utility Buttons */}
        <div className="explore-div div5">
          <div className="utility-buttons">
            <button
              className={`utility-button ${voiceSettings.isTemporarilyDisabled ? 'rate-limited' : ''}`}
              onClick={() => handleUtilityAction('voice')}
              title={voiceSettings.isTemporarilyDisabled ? "Voice Settings (Rate Limited)" : "Voice Settings"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1c-1.66 0-3 1.34-3 3v8c0 1.66 1.34 3 3 3s3-1.34 3-3V4c0-1.66-1.34-3-3-3zm5.91 11.09c-.49 0-.9.4-.9.91 0 2.83-2.31 5.14-5.01 5.14s-5.01-2.31-5.01-5.14c0-.51-.4-.91-.9-.91s-.91.4-.91.91c0 3.53 2.54 6.49 5.91 6.92v2.08h-2c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1h-2v-2.08c3.37-.43 5.91-3.39 5.91-6.92 0-.51-.4-.91-.9-.91z"/>
              </svg>
              {voiceSettings.isTemporarilyDisabled && (
                <span className="rate-limit-indicator">⚠️</span>
              )}
            </button>
            <button
              className="utility-button"
              onClick={() => handleUtilityAction('reset')}
              title="Reset"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8zm6-2h4v4h-4v-4z"/>
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c1.95 0 3.73-.7 5.12-1.88l1.41 1.41C16.93 21.19 14.57 22 12 22 5.37 22 0 16.63 0 10S5.37-2 12-2c2.57 0 4.93.81 6.68 2.19l1.41-1.41-1.44-1.44L17.65 6.35z"/>
              </svg>
            </button>
            <button
              className="utility-button"
              onClick={() => handleUtilityAction('theme')}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              )}
            </button>
            <button
              className="utility-button exit-button"
              onClick={() => handleUtilityAction('exit')}
              title="Exit to Home"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Div 6 - Dynamic Info Panel */}
        <div className="explore-div div6">
          {(() => {
            // Both chat and career guidance active
            if (isChatExpanded && (isQuizActive || isQuizComplete)) {
              return (
                <div className="dual-mode-info">
                  <div className="mode-indicator">
                    <div className="mode-icon">🔄</div>
                    <span className="mode-text">Multi-Mode Active</span>
                  </div>
                  <div className="mode-stats">
                    <div className="mode-stat">
                      <span className="stat-value">CHAT</span>
                      <span className="stat-desc">{localChatMessages.length} msgs</span>
                    </div>
                    <div className="mode-stat">
                      <span className="stat-value">QUIZ</span>
                      <span className="stat-desc">Step {progress.currentStep}</span>
                    </div>
                  </div>
                  <div className="mode-actions">
                    <button 
                      className="mode-action-btn"
                      onClick={() => setShowVoiceSettings(true)}
                      title="Voice Settings"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1c-1.66 0-3 1.34-3 3v8c0 1.66 1.34 3 3 3s3-1.34 3-3V4c0-1.66-1.34-3-3-3z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            }
            
            // Only chat active
            if (isChatExpanded) {
              return (
                <div className="chat-info-strip">
                  <div className="chat-status-section">
                    <div className="status-indicator">
                      <span className="status-text">
                        {isChatLoading ? 'AI Thinking...' : 'Chat Active'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="chat-stats-section">
                    <div className="stat-item">
                      <span className="stat-number">{localChatMessages.length}</span>
                      <span className="stat-label">MESSAGES</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{chatSessionId ? '1' : '0'}</span>
                      <span className="stat-label">SESSION</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">
                        {voiceSettings.isTemporarilyDisabled 
                          ? 'RATE LIMITED' 
                          : voiceSettings.isVoiceEnabled ? 'ON' : 'OFF'
                        }
                      </span>
                      <span className="stat-label">VOICE</span>
                    </div>
                  </div>

                </div>
              );
            }
            
            // Only career guidance active
            if (isQuizActive || isQuizComplete) {
              return (
                <div className="step-indicator-container">
                  <div className="step-indicator">
                    {steps.map((step, index) => (
                      <React.Fragment key={step.id}>
                        <div className={`step ${step.status === 'active' ? 'active' : 'inactive'}`}>
                          <div 
                            className={`step-circle ${step.status}`}
                            title={step.label}
                            style={{ userSelect: 'none' }}
                          >
                            {step.status === 'completed' ? '✓' : step.id}
                          </div>
                          <span className={`step-label ${step.status}`}>
                            {step.label}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`step-connector ${
                            step.status === 'completed' ? 'completed' : 
                            step.status === 'active' ? 'active' : ''
                          }`}></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            }
            
            // Default welcome state (both inactive)
            return (
              <div className="welcome-info-container">
                <div className="welcome-content">
                  <div className="welcome-text">
                    <h4>Welcome to Talkify</h4>
                    <p>Choose an action to get started</p>
                  </div>
      
                </div>
              </div>
            );
          })()}
        </div>

        {/* Div 7 - Course Recommendation Showcase */}
        {(isQuizComplete && showcaseData && showShowcase && !isVideoPlaying && !showVideoTransition && (videoHasPlayed || videoLoadFailed)) && (
          <div className="explore-div div7-showcase">
            <div className="course-recommendation-card">
              {/* Header Section */}
              <div className="card-header">
                <div className="header-left">
                  <div className="recommendation-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="header-text">
                    <h3>Perfect Match Found!</h3>
                    <p>Based on your career assessment</p>
                  </div>
                </div>
                <div className="header-right">
                  <div className="confidence-score">
                    <div className="score-circle">
                      <span className="score-number">94%</span>
                      <span className="score-label">Match</span>
                    </div>
                  </div>
                  <button 
                    className="close-recommendation-btn"
                    onClick={() => {
                      handleUtilityAction('reset');
                      console.log('Triggering reset via close button');
                    }}
                    title="Reset session"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Course Preview Section */}
              <div className="course-preview">
                <div className="course-image-container">
                  {showcaseData.imageUrl ? (
                    <img 
                      src={showcaseData.imageUrl} 
                      alt={showcaseData.title}
                      className="course-image"
                    />
                  ) : (
                    <div className="course-placeholder">
                      <div className="placeholder-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                        </svg>
                      </div>
                      <span>Course Preview</span>
                    </div>
                  )}
                  <div className="badge-container">
                    <span className="recommendation-badge">{showcaseData.badge || "Recommended"}</span>
                  </div>
                </div>

                <div className="course-details">
                  <h4 className="course-title">{showcaseData.title}</h4>
                  {showcaseData.subtitle && (
                    <p className="course-subtitle">{showcaseData.subtitle}</p>
                  )}
                  
                  {/* Key Features */}
                  <div className="course-features">
                    <div className="feature-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span>Industry Standard</span>
                    </div>
                    <div className="feature-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H19V1h-2v1H7V1H5v1H4.5C3.12 2 2 3.12 2 4.5v14C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-14C22 3.12 20.88 2 19.5 2z"/>
                      </svg>
                      <span>Self-paced</span>
                    </div>
                    <div className="feature-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span>Certificate</span>
                    </div>
                  </div>

                  {/* Reasoning */}
                  {showcaseData.reasoning && (
                    <div className="recommendation-reasoning">
                      <div className="reasoning-header">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14 14 11.99 14 9.5 11.99 5 9.5 5z"/>
                        </svg>
                        <span>Why this course?</span>
                      </div>
                      <p className="reasoning-text">{showcaseData.reasoning}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {showcaseData.tags && (
                    <div className="skill-tags">
                      {showcaseData.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="skill-tag">
                          {tag}
                        </span>
                      ))}
                      {showcaseData.tags.length > 4 && (
                        <span className="more-tags">+{showcaseData.tags.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Section */}
              <div className="card-actions">
                <button 
                  className="primary-action-btn"
                  onClick={handleSourceClick}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                  <span>Start Learning</span>
                </button>
                <button className="secondary-action-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>Save</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Exit Warning Popup */}
      {showExitWarning && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-header">
              <h3>⚠️ Warning</h3>
            </div>
            <div className="popup-content">
              <p>Are you sure you want to exit?</p>
              <p className="warning-text">You will lose all your current progress and quiz answers.</p>
            </div>
            <div className="popup-actions">
              <button className="popup-button cancel" onClick={handleCancelExit}>
                Cancel
              </button>
              <button className="popup-button confirm" onClick={handleConfirmExit}>
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Settings Popup */}
      {showVoiceSettings && (
        <div className="popup-overlay">
          <div className={`popup-container voice-settings-modern ${voiceSettings.isTemporarilyDisabled ? 'rate-limited' : ''}`}>
            <div className="voice-settings-header">
              <div className="header-content">
                <div className="header-icon">
                  {voiceSettings.isTemporarilyDisabled ? '⚠️' : '🎤'}
                </div>
                <h3>
                  {voiceSettings.isTemporarilyDisabled ? 'Voice Service Issues' : 'Voice Settings'}
                </h3>
              </div>
              <button className="close-btn" onClick={handleCloseVoiceSettings}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
                </svg>
              </button>
            </div>
            
            <div className="voice-settings-content">
              {/* Rate Limit Warning */}
              {voiceSettings.isTemporarilyDisabled ? (
                <div className="settings-row rate-limit-warning">
                  <div className="warning-content">
                    <div className="warning-icon">⚠️</div>
                    <div className="warning-text">
                      <h4>Voice Service Temporarily Unavailable</h4>
                      <p>TTS service is temporarily disabled due to rate limits. The system has automatically switched to backup settings. Please wait a moment before retrying.</p>
                      <button 
                        className="retry-tts-btn"
                        onClick={retryTTS}
                      >
                        🔄 Retry Voice Service
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Voice Controls Row */}
                  <div className="settings-row voice-controls-row">
                    <div className="row-header">
                      <h4>Controls</h4>
                      <span className="row-subtitle">Voice functionality</span>
                    </div>
                    <div className="controls-group">
                      <div className="control-item">
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={voiceSettings.isVoiceEnabled}
                            onChange={toggleVoice}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                        <span className="control-label">Voice</span>
                      </div>
                      
                      <div className="control-item">
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={voiceSettings.autoSpeak}
                            onChange={toggleAutoSpeak}
                            disabled={!voiceSettings.isVoiceEnabled}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                        <span className="control-label">Auto-speak</span>
                      </div>
                      
                      {voiceChatService.isSpeaking() && (
                        <div className="control-item">
                          <button className="stop-btn" onClick={stopSpeaking}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 6h12v12H6z"/>
                            </svg>
                            Stop
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Model Selection Row */}
                  <div className="settings-row model-selection-row">
                    <div className="row-header">
                      <h4>Language Model</h4>
                      <span className="row-subtitle">TTS engine selection</span>
                    </div>
                    <div className="selection-group">
                      {Object.entries(availableModels).map(([modelId, modelInfo]) => (
                        <div 
                          key={modelId}
                          className={`model-option ${voiceSettings.tts.model === modelId ? 'selected' : ''}`}
                          onClick={() => handleModelChange(modelId)}
                        >
                          <div className="option-icon">
                            {modelId === 'playai-tts-arabic' ? '🌍' : '🇺🇸'}
                          </div>
                          <div className="option-content">
                            <span className="option-title">{modelInfo.name}</span>
                            <span className="option-subtitle">
                              {modelId === 'playai-tts-arabic' ? 'Multi-language support' : 'English optimized'}
                            </span>
                          </div>
                          <div className="option-indicator">
                            {voiceSettings.tts.model === modelId && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Voice Selection Row */}
                  <div className="settings-row voice-selection-row">
                    <div className="row-header">
                      <h4>Voice Character</h4>
                      <span className="row-subtitle">Select voice persona</span>
                    </div>
                    <div className="voice-grid">
                      {availableModels[voiceSettings.tts.model]?.voices.map((voice) => (
                        <div 
                          key={voice}
                          className={`voice-option ${voiceSettings.tts.voice === voice ? 'selected' : ''}`}
                          onClick={() => handleVoiceChange(voice)}
                        >
                          <div className="voice-avatar">
                            {voice.charAt(0)}
                          </div>
                          <span className="voice-name">{voice.replace('-PlayAI', '')}</span>
                          {voiceSettings.tts.voice === voice && (
                            <div className="selected-indicator">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
