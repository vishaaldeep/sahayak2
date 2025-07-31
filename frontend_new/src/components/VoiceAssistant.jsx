
import React, { useState } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';

const VoiceAssistant = () => {
  const [isCalling, setIsCalling] = useState(false);
  const retell = new RetellWebClient();

  const toggleConversation = async () => {
    if (isCalling) {
      retell.stopCall();
      setIsCalling(false);
    } else {
      try {
        const response = await fetch('http://localhost:5000/api/retell/auth', {
          method: 'POST',
        });
        const data = await response.json();
        retell.startCall({ accessToken: data.access_token });
        setIsCalling(true);
      } catch (error) {
        console.error('Failed to start Retell call:', error);
      }
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <button onClick={toggleConversation} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={isCalling ? 'red' : 'currentColor'} className="bi bi-mic-fill" viewBox="0 0 16 16">
          <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
          <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
        </svg>
      </button>
    </div>
  );
};

export default VoiceAssistant;
