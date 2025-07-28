import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
} 