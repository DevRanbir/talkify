import React from "react";
import Loader from "../components/Loader";

const LoaderPage = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: 9999 
    }}>
      <Loader 
        isVisible={true} 
        text="Loading Talkify..." 
        size="large" 
      />
    </div>
  );
};

export default LoaderPage;
