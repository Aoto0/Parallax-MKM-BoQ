import React from 'react';
import './ProgressIndicator.css';

const ProgressIndicator = ({ message = 'Processing PDF with AI...' }) => {
  return (
    <div className="progress-container">
      <div className="progress-content">
        <div className="spinner"></div>
        <h3>{message}</h3>
        <p>This may take a few moments...</p>
      </div>
    </div>
  );
};

export default ProgressIndicator;
