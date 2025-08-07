import React, { useEffect } from "react";
import "./Help.css";
import { useTheme } from "../contexts/ThemeContext";

const Help = () => {
  const { isDarkMode, showLoader, hideLoader } = useTheme();

  useEffect(() => {
    // Only show loader if not already loading globally
    if (!document.querySelector('.loader-overlay')) {
      showLoader("Loading Help Page...", "help-page");
      
      const timer = setTimeout(() => {
        hideLoader("help-page");
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="help-page">
      <div className="help-container">
        <div className="help-header">
          <h1 className="help-title">How Talkify Works</h1>
          <p className="help-subtitle">
            Discover the step-by-step process of how our AI-powered platform guides you through your academic journey
          </p>
        </div>

        <div className="help-content">
          <div className="video-section">
            <div className="video-container">
              <div className="video-decorations">
                <div className="video-deco video-deco-1"></div>
                <div className="video-deco video-deco-2"></div>
                <div className="video-deco video-deco-3"></div>
              </div>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="How Talkify Works - Complete Guide"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          
          <div className="process-section">
            <h2 className="process-title">Step-by-Step Process</h2>
            <div className="process-flow">
              <div className="process-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>User enters name</h3>
                  <p>You'll be greeted with a personalized 3D animation that welcomes you to the platform and creates an engaging first impression.</p>
                </div>
              </div>
              
              <div className="process-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>LLM asks personalized questions</h3>
                  <p>Our advanced AI system conducts a personalized inquiry, asking relevant questions about your interests, goals, and academic background.</p>
                </div>
              </div>
              
              <div className="process-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>User answers</h3>
                  <p>As you provide answers, a tree-like career flow opens up, dynamically adapting to your responses and showing potential career paths.</p>
                </div>
              </div>
              
              <div className="process-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Talkify suggests CU programs</h3>
                  <p>Based on your input and preferences, our system provides intelligent program recommendations specifically tailored to Chandigarh University offerings.</p>
                </div>
              </div>
              
              <div className="process-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3>Display course details, labs, career outcomes</h3>
                  <p>Get comprehensive information including course curriculum, laboratory facilities, career prospects, and direct links to the official CU website for detailed information.</p>
                </div>
              </div>
              
              <div className="process-step">
                <div className="step-number">6</div>
                <div className="step-content">
                  <h3>Voice feedback and optional summary PDF</h3>
                  <p>Receive voice-enabled feedback on your choices and get an optional downloadable PDF summary of your personalized recommendations and career guidance.</p>
                </div>
              </div>
            </div>

            <div className="additional-info">
              <div className="info-card">
                <div className="info-icon">🌳</div>
                <h4>Tree-Structured Navigation</h4>
                <p>Our intuitive flow system organizes information hierarchically, making complex decisions simple and easy to navigate.</p>
              </div>
              
              <div className="info-card">
                <div className="info-icon">🎓</div>
                <h4>CU Integration</h4>
                <p>Seamlessly connected with Chandigarh University's official resources, programs, and admission processes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
