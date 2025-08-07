import React from "react";
import "./Loader.css";
import { useTheme } from "../contexts/ThemeContext";

const Loader = ({ isVisible = true, text = "Loading...", size = "medium" }) => {
  const { isDarkMode } = useTheme();

  if (!isVisible) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className={`loader-content ${size}`}>
          {/* Main rotating loader */}
          <div className="loader-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            
            {/* Center logo */}
            <div className="loader-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Loading text */}
          <div className="loader-text">
            <span className="loading-text">{text}</span>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {/* Animated particles */}
          <div className="loader-particles">
            {[...Array(6)].map((_, index) => (
              <div key={index} className={`particle particle-${index + 1}`}></div>
            ))}
          </div>
        </div>

        {/* Progress bar (optional) */}
        <div className="loader-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
