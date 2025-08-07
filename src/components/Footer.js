import React, { useEffect } from "react";
import "./Footer.css";
import { useTheme } from "../contexts/ThemeContext";

const Footer = () => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Load the Spline viewer script if not already loaded
    if (!document.querySelector('script[src*="splinetool"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://unpkg.com/@splinetool/viewer@1.10.42/build/spline-viewer.js";
      document.head.appendChild(script);
    }
  }, []);

  return (
    <footer className="footer">
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
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Talkify</h3>
            <p>Empowering communication through innovative technology.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#" aria-label="Twitter">
                Twitter
              </a>
              <a href="#" aria-label="LinkedIn">
                LinkedIn
              </a>
              <a href="#" aria-label="GitHub">
                GitHub
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Talkify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
