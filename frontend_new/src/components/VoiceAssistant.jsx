
import React, { useState, useEffect } from 'react';
import './VoiceAssistant.css';

const VoiceAssistant = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-IN';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onCommand(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }, [onCommand]);

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <button onClick={toggleListening} className={`voice-assistant-button ${isListening ? 'listening' : ''}`}>
      <svg viewBox="0 0 24 24">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.1-9.1c0-.61.49-1.1 1.1-1.1s1.1.49 1.1 1.1v6.2c0 .61-.49 1.1-1.1 1.1s-1.1-.49-1.1-1.1V4.9zm6.2 5.1c-.55 0-1 .45-1 1s.45 1 1 1c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-.55-.45-1-1-1s-1 .45-1 1c0 2.76 2.24 5 5 5s5-2.24 5-5-2.24-5-5-5z"/>
      </svg>
    </button>
  );
};

export default VoiceAssistant;
