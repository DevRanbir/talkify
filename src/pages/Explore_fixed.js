import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Explore.css";
import { useTheme } from "../contexts/ThemeContext";
import { useQuizManager } from "../hooks/useQuizManager";

const Explore = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, showLoader, hideLoader, toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  
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
    { id: 5, label: "Analysis", status: "pending" },
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

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [userName]);

  // Update steps based on quiz progress
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
    }
  }, [progress, isQuizActive, isQuizComplete]);

  const handleActionClick = async (action) => {
    console.log('🎬 Action clicked:', action, 'Loading state:', isLoading);
    if (isLoading) return;

    if (action === "career") {
      // Start the AI-powered career guidance quiz
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
      showLoader("Starting guided chat session...", "chat");
      setTimeout(() => {
        console.log("Chat and Get Guided feature is coming soon!");
        // Note: We'll implement the chat guidance feature here
        hideLoader("chat");
      }, 1500);
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

  const handleStepClick = (stepId) => {
    // Only allow clicking previous steps or current step
    if (stepId <= progress.currentStep) {
      // Update step status when clicked
      setSteps(prevSteps => 
        prevSteps.map(step => {
          if (step.id === stepId) {
            return { ...step, status: "active" };
          } else if (step.id < stepId) {
            return { ...step, status: "completed" };
          } else {
            return { ...step, status: "pending" };
          }
        })
      );
      
      showLoader(`Loading step ${stepId}...`, `step-${stepId}`);
      setTimeout(() => {
        hideLoader(`step-${stepId}`);
      }, 1000);
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

  return (
    <div className="explore-page">
      <div className="explore-container">
        {/* Div 1 - Chat Box */}
        <div className="explore-div div1">
          <div className="chat-container">
            <div className="chat-header">
              <h3>Chat Assistant</h3>
            </div>
            <div className="chat-messages">
              {chatMessages.length > 0 ? (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                  >
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="chat-welcome">
                  <div className="welcome-icon">🤖</div>
                  <h4>Welcome to Talkify!</h4>
                  <p>Choose an action from Quick Actions to get started with your learning journey.</p>
                  <div className="welcome-suggestions">
                    <span>Try:</span>
                    <ul>
                      <li>🎯 Career Guidance MAX</li>
                      <li>💬 Chat and Get Guided</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Div 2 - Action Buttons */}
        <div className="explore-div div2">
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

        {/* Div 3 - Main Area with Spline Background */}
        <div className="explore-div div3">
          <div className="main-area">
            <div className="spline-background">
              <spline-viewer
                url={
                  isDarkMode
                    ? "https://prod.spline.design/BfDN0DG0oaVJZnRC/scene.splinecode"
                    : "https://prod.spline.design/0er9GEy-bkyRDq3X/scene.splinecode"
                }
                key={isDarkMode ? "dark" : "light"}
              ></spline-viewer>
            </div>
          </div>
        </div>

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
            <div className="user-status">
              <span className="status-indicator">●</span>
              <span className="status-text">Active</span>
            </div>
          </div>
        </div>

        {/* Div 5 - Utility Buttons */}
        <div className="explore-div div5">
          <div className="utility-buttons">
            <button
              className="utility-button"
              onClick={() => handleUtilityAction('voice')}
              title="Voice Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1c-1.66 0-3 1.34-3 3v8c0 1.66 1.34 3 3 3s3-1.34 3-3V4c0-1.66-1.34-3-3-3zm5.91 11.09c-.49 0-.9.4-.9.91 0 2.83-2.31 5.14-5.01 5.14s-5.01-2.31-5.01-5.14c0-.51-.4-.91-.9-.91s-.91.4-.91.91c0 3.53 2.54 6.49 5.91 6.92v2.08h-2c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1h-2v-2.08c3.37-.43 5.91-3.39 5.91-6.92 0-.51-.4-.91-.9-.91z"/>
              </svg>
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

        {/* Div 6 - Step Indicator */}
        <div className="explore-div div6">
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
        </div>

        {/* Div 7 - Source Showcase */}
        {(isQuizComplete && showcaseData) && (
          <div className="explore-div div7">
            <div className="source-showcase-container">
              <div 
                className="source-showcase"
                style={{
                  backgroundImage: showcaseData.imageUrl ? `url(${showcaseData.imageUrl})` : 'none'
                }}
                onClick={handleSourceClick}
              >
                <div className="source-showcase-overlay"></div>
                
                <div className="source-showcase-content">
                  {!showcaseData.imageUrl && (
                    <div className="source-placeholder-icon">🎓</div>
                  )}
                  <div className="showcase-badge">{showcaseData.badge}</div>
                  <h3 className="source-showcase-title">
                    {showcaseData.title}
                  </h3>
                  {showcaseData.subtitle && (
                    <p className="source-showcase-subtitle">
                      {showcaseData.subtitle}
                    </p>
                  )}
                  {showcaseData.reasoning && (
                    <p className="source-showcase-reasoning">
                      {showcaseData.reasoning}
                    </p>
                  )}
                  {showcaseData.tags && (
                    <div className="showcase-tags">
                      {showcaseData.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="showcase-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="showcase-action">
                    <span>Click to view course →</span>
                  </div>
                </div>
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
          <div className="popup-container voice-settings">
            <div className="popup-header">
              <h3>🎤 Voice Settings</h3>
              <button className="close-button" onClick={handleCloseVoiceSettings}>
                ✕
              </button>
            </div>
            <div className="popup-content">
              <div className="voice-option">
                <label>Voice Type:</label>
                <select className="voice-select">
                  <option value="default">Default Voice</option>
                  <option value="male">Male Voice</option>
                  <option value="female">Female Voice</option>
                  <option value="child">Child Voice</option>
                </select>
              </div>
              <div className="voice-option">
                <label>Speaking Speed:</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  defaultValue="1"
                  className="speed-slider"
                />
                <span className="speed-value">Normal</span>
              </div>
              <div className="voice-option">
                <label>Pitch:</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  defaultValue="1"
                  className="pitch-slider"
                />
                <span className="pitch-value">Normal</span>
              </div>
              <div className="voice-preview">
                <button className="preview-button">
                  🔊 Test Voice
                </button>
              </div>
            </div>
            <div className="popup-actions">
              <button className="popup-button cancel" onClick={handleCloseVoiceSettings}>
                Cancel
              </button>
              <button className="popup-button confirm" onClick={handleCloseVoiceSettings}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
