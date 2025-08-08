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
import Explore from "./pages/Explore";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Component to handle route changes and loading
const AppContent = () => {
  const { isLoading, loadingText, showLoader, hideLoader } = useTheme();
  const location = useLocation();

  useEffect(() => {
    // Simple route change loader - only for navigation between pages
    if (!location.pathname.includes("/explore")) {
      showLoader("Loading page...", "route-change");
      
      const timer = setTimeout(() => {
        hideLoader("route-change");
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, showLoader, hideLoader]);

  useEffect(() => {
    // Simple cleanup on component mount
    return () => {
      // Cleanup any remaining loaders on unmount
      hideLoader("route-change");
    };
  }, [hideLoader]);

  return (
    <div className="App">
      <Loader isVisible={isLoading} text={loadingText} />
      <Routes>
        {/* Explore page routes - full screen without navbar/footer */}
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/:userName" element={<Explore />} />
        
        {/* Regular pages with navbar/footer */}
        <Route path="/" element={
          <>
            <Navbar />
            <main>
              <Homepage />
            </main>
            <Footer />
          </>
        } />
        <Route path="/help" element={
          <>
            <Navbar />
            <main>
              <Help />
            </main>
            <Footer />
          </>
        } />
        <Route path="/authors" element={
          <>
            <Navbar />
            <main>
              <Authors />
            </main>
            <Footer />
          </>
        } />
        <Route path="/contact" element={
          <>
            <Navbar />
            <main>
              <Contact />
            </main>
            <Footer />
          </>
        } />
      </Routes>
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
