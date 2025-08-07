import { useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

// Custom hook for handling page loading states
export const usePageLoader = (pageName, delay = 800) => {
  const { showLoader, hideLoader } = useTheme();

  useEffect(() => {
    showLoader(`Loading ${pageName}...`);
    
    const timer = setTimeout(() => {
      hideLoader();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [showLoader, hideLoader, pageName, delay]);
};

// Custom hook for handling form submissions with loader
export const useFormLoader = () => {
  const { showLoader, hideLoader } = useTheme();

  const submitWithLoader = async (submitFunction, loadingText = "Processing...") => {
    showLoader(loadingText);
    
    try {
      await submitFunction();
    } finally {
      hideLoader();
    }
  };

  return { submitWithLoader };
};

// Custom hook for handling async operations with loader
export const useAsyncLoader = () => {
  const { showLoader, hideLoader } = useTheme();

  const executeWithLoader = async (asyncFunction, loadingText = "Loading...") => {
    showLoader(loadingText);
    
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      hideLoader();
    }
  };

  return { executeWithLoader };
};
