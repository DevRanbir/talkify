import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
    
    // Always hide initial loader after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
      setLoaderQueue([]); // Clear any queued loaders
    }, 800);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    // Apply theme to document - separate effect to avoid circular updates
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]); // Only depend on isDarkMode

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

  const showLoader = useCallback((text = "Loading...", id = "default") => {
    // Prevent duplicate loaders with same ID
    setLoaderQueue(prev => {
      if (prev.includes(id)) return prev; // Don't add duplicate
      return [...prev, id];
    });
    setLoadingText(text);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback((id = "default") => {
    setLoaderQueue(prev => {
      const updated = prev.filter(queueId => queueId !== id);
      // Only hide loader if no other loaders are queued
      if (updated.length === 0) {
        setIsLoading(false);
        setLoadingText("Loading...");
      }
      return updated;
    });
  }, []);

  // Force clear all loaders function for emergency cleanup
  const clearAllLoaders = useCallback(() => {
    setIsLoading(false);
    setLoaderQueue([]);
    setLoadingText("Loading...");
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      isLoading, 
      loadingText,
      showLoader,
      hideLoader,
      clearAllLoaders
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
