import React, { useEffect, useState } from "react";
import "./Homepage.css";
import { useTheme } from "../contexts/ThemeContext";

const Homepage = () => {
  const { isDarkMode, showLoader, hideLoader } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    stream: "",
  });

  useEffect(() => {
    // Only show loader if not already loading globally
    if (!document.querySelector('.loader-overlay')) {
      showLoader("Loading Homepage...", "homepage");
      
      const timer = setTimeout(() => {
        hideLoader("homepage");
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const streamOptions = ["Non-Medical", "Medical", "Commerce", "Arts", "Other"];

  const handleGetStarted = () => {
    setShowForm(true);
  };

  const handleStreamSelect = (stream) => {
    setFormData((prev) => ({ ...prev, stream }));
  };

  const handleNameChange = (e) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.stream) {
      showLoader("Processing your request...", "form-submit");
      
      // Simulate processing
      setTimeout(() => {
        console.log("Form submitted:", formData);
        hideLoader("form-submit");
        // Handle form submission here
      }, 2000);
    }
  };
  useEffect(() => {
    // Load the Spline viewer script
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@splinetool/viewer@1.10.42/build/spline-viewer.js";
    document.head.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="homepage">
      <div className="spline-background">
        <spline-viewer
          url={
            isDarkMode
              ? "https://prod.spline.design/BfDN0DG0oaVJZnRC/scene.splinecode"
              : "https://prod.spline.design/0er9GEy-bkyRDq3X/scene.splinecode"
          }
          key={isDarkMode ? "dark" : "light"} // Force re-render when theme changes
        ></spline-viewer>
      </div>

      <div className="homepage-content">
        <div className="hero-section">
          <h1 className="hero-title">Talkify</h1>
          <p className="hero-subtitle">
            Experience the future of communication with our innovative platform
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>

        {!showForm ? (
          <div className="features-section">
            <div className="feature-card" title="Program Integration">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Program Integration</h3>
              <div className="feature-description">
                <p>Seamlessly integrated with Chandigarh University programs, providing comprehensive access to academic resources, course materials, and university services all in one platform.</p>
              </div>
            </div>
            <div className="feature-card" title="Smart Voice Assistance">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1C14.5 1 16.5 3 16.5 5.5V11.5C16.5 14 14.5 16 12 16C9.5 16 7.5 14 7.5 11.5V5.5C7.5 3 9.5 1 12 1Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19 10V11.5C19 16 15.5 19.5 11 19.9V23H13C13.6 23 14 23.4 14 24C14 24.6 13.6 25 13 25H11C10.4 25 10 24.6 10 24C10 23.4 10.4 23 11 23H13V19.9C6.5 19.5 3 16 3 11.5V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Smart Voice Assistance</h3>
              <div className="feature-description">
                <p>Advanced AI-powered voice assistance with natural language processing, enabling hands-free interaction and intelligent voice chat capabilities for enhanced user experience.</p>
              </div>
            </div>
            <div className="feature-card" title="Tree-Structured Flow">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 6H14M22 18H14M11 6H2M11 18H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="11" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="11" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M11 9C13 10 13 14 11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Tree-Structured Flow</h3>
              <div className="feature-description">
                <p>Intuitive tree-structured navigation system that organizes information hierarchically, making it easy to find what you need and explore related topics efficiently.</p>
              </div>
            </div>
            <div className="feature-card" title="Course Comparison">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 10V6C22 5.45 21.55 5 21 5H3C2.45 5 2 5.45 2 6V10M22 10L18 14L16 12L12 16L8 12L6 14L2 10M22 10V18C22 18.55 21.55 19 21 19H3C2.45 19 2 18.55 2 18V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 8H8M10 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Course Comparison</h3>
              <div className="feature-description">
                <p>Comprehensive course comparison tools with detailed personalized recommendations based on your interests, and data-driven insights to help you make academic decisions.</p>
              </div>
            </div>
            <div className="feature-card" title="CU Branding">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>CU Branding</h3>
              <div className="feature-description">
                <p>Perfectly aligned with Chandigarh University's brand identity, supporting lead generation efforts and maintaining consistent visual and communication standards across all platforms.</p>
              </div>
            </div>
            <div className="feature-card" title="Smart Features">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V8M12 16V18M6 12H8M16 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Smart Features</h3>
              <div className="feature-description">
                <p>Cutting-edge intelligent automation features that enhance communication efficiency, streamline workflows, and provide predictive assistance for an optimized user experience.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="form-section">
            <div className="form-container">
              <h2>Let's Get Started!</h2>
              <p>Please provide your details to personalize your experience</p>

              <form onSubmit={handleSubmit} className="user-form">
                <div className="input-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Previous Stream</label>
                  <div className="stream-buttons">
                    {streamOptions.map((stream) => (
                      <button
                        key={stream}
                        type="button"
                        className={`stream-btn ${
                          formData.stream === stream ? "active" : ""
                        }`}
                        onClick={() => handleStreamSelect(stream)}
                      >
                        {stream}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!formData.name || !formData.stream}
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
