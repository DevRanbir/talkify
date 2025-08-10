import { useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

// Custom hook for handling page loading states
export const usePageLoader = (pageName, delay = 800) => {
  const { showLoader, hideLoader } = useTheme();

  useEffect(() => {
    const loaderId = `page-${pageName}`;
    showLoader(`Loading ${pageName}...`, loaderId);
    
    const timer = setTimeout(() => {
      hideLoader(loaderId);
    }, delay);
    
    return () => {
      clearTimeout(timer);
      hideLoader(loaderId);
    };
  }, [pageName, delay]); // Remove showLoader and hideLoader from dependencies
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
