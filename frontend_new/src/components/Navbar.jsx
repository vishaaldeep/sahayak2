import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import HamburgerMenu from './HamburgerMenu';

export default function Navbar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user ? user.role : null;

  const navLinks = [
    { to: '/jobs', label: 'Jobs' },
    { to: '/profile', label: 'Profile' },
  ];

  if (userRole === 'seeker') {
    navLinks.unshift(
      { to: '/skills', label: 'Skills' },
      { to: '/wallet', label: 'Wallet' }
    );
  } else if (userRole === 'provider') {
    navLinks.unshift(
      { to: '/employer/dashboard', label: 'Dashboard' }
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
      <div className="flex-1"></div>
    </motion.nav>
  );
} 