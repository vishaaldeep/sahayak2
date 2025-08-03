import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import HamburgerMenu from './HamburgerMenu';
import LanguageSelector from './LanguageSelector';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userRole = user ? user.role : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/jobs', label: t('navigation.jobs') || 'Jobs' },
    { to: '/profile', label: t('navigation.profile') || 'Profile' },
  ];

  if (userRole === 'seeker') {
    navLinks.unshift(
      { to: '/skills', label: t('navigation.skills') || 'Skills' },
      { to: '/wallet', label: t('navigation.wallet') || 'Wallet' },
      { to: '/tool-sharing', label: t('navigation.tools') || 'Tool Sharing' },
      { to: '/loan-suggestions', label: t('navigation.loans') || 'Loans' }
    );
  } else if (userRole === 'provider') {
    navLinks.unshift(
      { to: '/employer-dashboard', label: t('navigation.dashboard') || 'Dashboard' },
      { to: '/employer-agreements', label: t('navigation.agreements') || 'Agreements' },
      { to: '/wallet', label: t('navigation.wallet') || 'Wallet' }
    );
  } else if (userRole === 'investor') {
    navLinks.unshift(
      { to: '/investor-setup', label: t('navigation.investorProfile') || 'Investor Profile' },
      { to: '/investment-opportunities', label: t('navigation.investments') || 'Investment Opportunities' }
    );
  } else if (userRole === 'admin') {
    navLinks.unshift(
      { to: '/admin/dashboard', label: t('navigation.adminDashboard') || 'Admin Dashboard' },
      { to: '/admin/report-review', label: t('navigation.reviewReports') || 'Review Reports' }
    );
  }

  return (
    <motion.nav
      className="w-full bg-white shadow flex items-center justify-between py-3 px-4 md:px-8 sticky top-0 z-40"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex-1">
        <HamburgerMenu navLinks={navLinks} />
      </div>
      <div className="flex-1 flex justify-center gap-8">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-lg font-semibold px-3 py-1 rounded transition-colors duration-200 ${location.pathname.startsWith(link.to) ? 'bg-primary text-white shadow' : 'text-primary hover:bg-blue-50'}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex-1 flex justify-end items-center gap-4 pr-4">
        <LanguageSelector 
          variant="compact" 
          showLabel={false} 
          size="small"
          className="min-w-[120px]"
        />
        <NotificationBell />
        {user && (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm"
          >
            {t('navigation.logout') || 'Logout'}
          </button>
        )}
      </div>
    </motion.nav>
  );
} 