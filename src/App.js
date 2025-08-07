import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import Homepage from "./pages/Homepage";
import Help from "./pages/Help";
import Authors from "./pages/Authors";
import Contact from "./pages/Contact";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Component to handle route changes and loading
const AppContent = () => {
  const { isLoading, loadingText, showLoader, hideLoader } = useTheme();
  const location = useLocation();

  useEffect(() => {
    // Only show route loader if not already loading and not initial load
    if (!isLoading) {
      showLoader("Loading page...", "route-change");
      
      const timer = setTimeout(() => {
        hideLoader("route-change");
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Handle page refresh detection - only for actual refreshes
    let isRefreshing = false;
    
    const handleBeforeUnload = () => {
      isRefreshing = true;
      sessionStorage.setItem("isRefreshing", "true");
    };

    // Handle visibility change (tab switching) - less aggressive
    const handleVisibilityChange = () => {
      if (!document.hidden && !isRefreshing && !isLoading) {
        showLoader("Welcome back!", "visibility-change");
        setTimeout(() => {
          hideLoader("visibility-change");
        }, 500);
      }
    };

    // Handle online/offline status
    const handleOnline = () => {
      if (!isLoading) {
        showLoader("Connection restored!", "online-status");
        setTimeout(() => {
          hideLoader("online-status");
        }, 1000);
      }
    };

    const handleOffline = () => {
      if (!isLoading) {
        showLoader("Connection lost...", "offline-status");
        setTimeout(() => {
          hideLoader("offline-status");
        }, 1500);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showLoader, hideLoader, isLoading]);

  return (
    <div className="App">
      <Loader isVisible={isLoading} text={loadingText} />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/help" element={<Help />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router basename="/talkify">
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
