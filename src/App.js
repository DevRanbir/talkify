import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import Homepage from "./pages/Homepage";
import Help from "./pages/Help";
import Authors from "./pages/Authors";
import Contact from "./pages/Contact";
import Explore from "./pages/Explore";
import LoaderPage from "./pages/LoaderPage";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Component to handle route changes and loading
const AppContent = () => {
  const { isLoading, loadingText } = useTheme();

  return (
    <div className="App">
      <Loader isVisible={isLoading} text={loadingText} />
      <Routes>
        {/* Loader page - full screen */}
        <Route path="/loader" element={<LoaderPage />} />
        
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
        {/* Catch-all route - redirect to homepage */}
        <Route path="*" element={
          <>
            <Navbar />
            <main>
              <Homepage />
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
};

function App() {
  // Use basename for both development and production
  const basename = '/talkify';
  
  return (
    <ThemeProvider>
      <Router basename={basename}>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
