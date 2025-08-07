import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Light mode by default
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [loadingText, setLoadingText] = useState("Loading...");
  const [loaderQueue, setLoaderQueue] = useState([]); // Queue to prevent overlapping loaders

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    }
    
    // Only show initial loading on fresh page load, not on refresh loops
    const hasShownInitialLoader = sessionStorage.getItem("initialLoaderShown");
    if (!hasShownInitialLoader) {
      sessionStorage.setItem("initialLoaderShown", "true");
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      // Skip initial loader if already shown in this session
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    // Prevent multiple theme toggles while one is in progress
    if (isLoading) return;
    
    setIsLoading(true);
    setLoadingText("Switching theme...");
    
    // Add a small delay to show the loader during theme change
    setTimeout(() => {
      setIsDarkMode((prev) => !prev);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingText("Loading...");
      }, 600);
    }, 200);
  };

  const showLoader = (text = "Loading...", id = "default") => {
    // Prevent duplicate loaders with same ID
    if (loaderQueue.includes(id)) return;
    
    setLoaderQueue(prev => [...prev, id]);
    setLoadingText(text);
    setIsLoading(true);
  };

  const hideLoader = (id = "default") => {
    setLoaderQueue(prev => {
      const updated = prev.filter(queueId => queueId !== id);
      // Only hide loader if no other loaders are queued
      if (updated.length === 0) {
        setIsLoading(false);
        setLoadingText("Loading...");
      }
      return updated;
    });
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      isLoading, 
      loadingText,
      showLoader,
      hideLoader 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
