
import React, { useState, useEffect } from 'react';
import './AssistantResponse.css';

const AssistantResponse = ({ message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className={`assistant-response-overlay ${visible ? 'visible' : ''}`}>
      <p>{message}</p>
    </div>
  );
};

export default AssistantResponse;
