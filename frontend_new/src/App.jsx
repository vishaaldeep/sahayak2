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
import MapScreen from './components/MapScreen';
import UserBankDetailsForm from './components/UserBankDetailsForm';
import SahaayakDashboard from './components/SahaayakDashboard';
import ToolDetailsPage from './components/ToolDetailsPage';
import ToolSharingDashboard from './components/ToolSharingDashboard';
import LoanSuggestionPage from './components/LoanSuggestionPage';
import InvestorProposalPage from './components/InvestorProposalPage';
import InvestorProfileSetup from './components/InvestorProfileSetup';
import LoanDisbursalManagement from './components/LoanDisbursalManagement';
import InvestorProposalReview from './components/InvestorProposalReview';
import MyLoanOffersPage from './components/MyLoanOffersPage';
import AdminDashboard from './components/AdminDashboard';
import InvestmentOpportunitiesPage from './components/InvestmentOpportunitiesPage';
import ReportAbusePage from './components/ReportAbusePage';
import AdminReportReview from './components/AdminReportReview';
import LoanDashboard from './components/LoanDashboard';
import AdminLoginPage from './components/AdminLoginPage';

function AppContent() {
  const navigate = useNavigate();
  console.log('Current path in AppContent:', window.location.pathname);

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/skills" element={<ProtectedRoute allowedRoles={['seeker']}><SkillsPage /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute allowedRoles={['seeker', 'provider']}><WalletPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/investment-analyzer" element={<InvestmentAnalyzer />} />
        <Route path="/employer/profile" element={<ProtectedRoute allowedRoles={['provider']}><EmployerProfilePage /></ProtectedRoute>} />
        <Route path="/employer/dashboard" element={<ProtectedRoute allowedRoles={['provider']}><EmployerDashboard /></ProtectedRoute>} />
        <Route path="/seeker-actions" element={<JobSeekerActions />} />
        <Route path="/provider-actions" element={<JobProviderActions />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/post-job" element={<PostJobPage />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="/sahayak-dashboard" element={<ProtectedRoute allowedRoles={['provider']}><SahaayakDashboard /></ProtectedRoute>} />

        {/* Tool Sharing Feature Routes (Seeker Only) */}
        <Route path="/tools" element={<ProtectedRoute allowedRoles={['seeker']}><ToolSharingDashboard /></ProtectedRoute>} />
        <Route path="/tools/:id" element={<ProtectedRoute allowedRoles={['seeker']}><ToolDetailsPage /></ProtectedRoute>} />

        {/* Business Loan & Investor Proposal Features */}
        <Route path="/loans" element={<ProtectedRoute allowedRoles={['seeker']}><LoanDashboard /></ProtectedRoute>} />
        <Route path="/investors/profile-setup" element={<ProtectedRoute allowedRoles={['investor']}><InvestorProfileSetup /></ProtectedRoute>} />
        <Route path="/investors/opportunities" element={<ProtectedRoute allowedRoles={['investor']}><InvestmentOpportunitiesPage /></ProtectedRoute>} />
        <Route path="/admin/loan-disbursal" element={<ProtectedRoute allowedRoles={['admin']}><LoanDisbursalManagement /></ProtectedRoute>} />
        <Route path="/admin/investor-review" element={<ProtectedRoute allowedRoles={['admin']}><InvestorProposalReview /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/report-abuse" element={<ProtectedRoute allowedRoles={['seeker', 'provider']}><ReportAbusePage /></ProtectedRoute>} />
        <Route path="/admin/report-review" element={<ProtectedRoute allowedRoles={['admin']}><AdminReportReview /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
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