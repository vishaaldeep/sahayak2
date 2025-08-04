import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceNavigationService from '../services/VoiceNavigationService';

/**
 * Custom hook for voice navigation functionality
 */
const useVoiceNavigation = (retellClient) => {
  const navigate = useNavigate();
  const voiceServiceRef = useRef(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);

  useEffect(() => {
    if (retellClient) {
      // Initialize voice navigation service
      voiceServiceRef.current = new VoiceNavigationService(navigate, retellClient);
      
      // Set up event listeners
      const handleTranscript = (transcript) => {
        setLastCommand(transcript.text);
        setCommandHistory(prev => [...prev.slice(-9), {
          text: transcript.text,
          timestamp: new Date(),
          processed: true
        }]);
      };

      const handleConversationStart = () => {
        setIsVoiceActive(true);
      };

      const handleConversationEnd = () => {
        setIsVoiceActive(false);
      };

      // Attach listeners
      retellClient.on('transcript', handleTranscript);
      retellClient.on('conversationStarted', handleConversationStart);
      retellClient.on('conversationEnded', handleConversationEnd);

      // Cleanup
      return () => {
        if (retellClient) {
          retellClient.off('transcript', handleTranscript);
          retellClient.off('conversationStarted', handleConversationStart);
          retellClient.off('conversationEnded', handleConversationEnd);
        }
      };
    }
  }, [retellClient, navigate]);

  // Manual voice command processing
  const processVoiceCommand = (command) => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.handleVoiceInput(command);
    }
  };

  // Get available commands
  const getAvailableCommands = () => {
    if (voiceServiceRef.current) {
      return voiceServiceRef.current.getAllCommands();
    }
    return {};
  };

  // Set current user context
  const setUserContext = (user) => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.setCurrentUser(user);
    }
  };

  // Manual control
  const startListening = () => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.startListening();
      setIsVoiceActive(true);
    }
  };

  const stopListening = () => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stopListening();
      setIsVoiceActive(false);
    }
  };

  return {
    isVoiceActive,
    lastCommand,
    commandHistory,
    processVoiceCommand,
    getAvailableCommands,
    setUserContext,
    startListening,
    stopListening,
    voiceService: voiceServiceRef.current
  };
};

export default useVoiceNavigation;