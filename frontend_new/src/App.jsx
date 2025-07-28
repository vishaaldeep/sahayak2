import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import SkillsPage from './components/SkillsPage';
import WalletPage from './components/WalletPage';
import ProfilePage from './components/ProfilePage';
import Navbar from './components/Navbar';
import InvestmentAnalyzer from './components/InvestmentAnalyzer';
import EmployerProfilePage from './components/EmployerProfilePage';
import EmployerDashboard from './components/EmployerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import JobSeekerActions from './components/JobSeekerActions';
import JobProviderActions from './components/JobProviderActions';
import JobsPage from './components/JobsPage';
import PostJobPage from './components/PostJobPage';
import VoiceAssistant from './components/VoiceAssistant';
import AssistantResponse from './components/AssistantResponse';

function AppContent() {
  const navigate = useNavigate();
  const [assistantResponse, setAssistantResponse] = useState('');

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
    setAssistantResponse(text);
  };

  const handleCommand = async (command) => {
    console.log('Command received:', command);

    try {
      const response = await fetch('http://localhost:5000/api/voice/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();

      if (data.action === 'navigate') {
        navigate(data.path);
      }

      speak(data.message);
    } catch (error) {
      console.error('Error sending command to backend:', error);
      speak("I'm sorry, something went wrong.");
    }
  };

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/skills" element={<ProtectedRoute allowedRoles={['seeker']}><SkillsPage /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute allowedRoles={['seeker']}><WalletPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/investment-analyzer" element={<InvestmentAnalyzer />} />
        <Route path="/employer/profile" element={<ProtectedRoute allowedRoles={['provider']}><EmployerProfilePage /></ProtectedRoute>} />
        <Route path="/employer/dashboard" element={<ProtectedRoute allowedRoles={['provider']}><EmployerDashboard /></ProtectedRoute>} />
        <Route path="/seeker-actions" element={<JobSeekerActions />} />
        <Route path="/provider-actions" element={<JobProviderActions />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <VoiceAssistant onCommand={handleCommand} />
      <AssistantResponse message={assistantResponse} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
} 