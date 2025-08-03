
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import AddExperienceModal from './AddExperienceModal';
import HiredSeekersList from './HiredSeekersList';

const HamburgerMenu = ({ navLinks }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const [showHiredSeekersModal, setShowHiredSeekersModal] = useState(false);
  const [showArchivedSeekersModal, setShowArchivedSeekersModal] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAddExperienceClick = () => {
    setIsOpen(false); // Close hamburger menu
    setShowAddExperienceModal(true); // Open add experience modal
  };

  const handleShowHiredSeekers = () => {
    setIsOpen(false);
    console.log('Employer ID for Hired Seekers:', user._id);
    setShowHiredSeekersModal(true);
  };

  const handleShowArchivedSeekers = () => {
    setIsOpen(false);
    console.log('Employer ID for Archived Seekers:', user._id);
    setShowArchivedSeekersModal(true);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const allLinks = [
    ...navLinks,
    { to: '/map', label: 'Sahaayak Chowk' }
  ];

  const userRole = user ? user.role : null;

  return (
    <div className="relative">
      <button onClick={toggleMenu} className="text-primary focus:outline-none">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
          ></path>
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-0 right-0 mt-12 bg-white rounded-md shadow-lg">
          <ul className="p-2">
            {allLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`block px-4 py-2 text-lg font-semibold rounded transition-colors duration-200 ${location.pathname.startsWith(link.to) ? 'bg-primary text-white shadow' : 'text-primary hover:bg-blue-50'}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {userRole === 'seeker' && (
              <li>
                <button
                  onClick={handleAddExperienceClick}
                  className="block w-full text-left px-4 py-2 text-lg font-semibold rounded transition-colors duration-200 text-primary hover:bg-blue-50"
                >
                  Add Previous Experience
                </button>
              </li>
            )}
            {userRole === 'provider' && (
              <li>
                <Link
                  to="/sahaayak-dashboard"
                  className={`block px-4 py-2 text-lg font-semibold rounded transition-colors duration-200 ${location.pathname.startsWith('/sahaayak-dashboard') ? 'bg-primary text-white shadow' : 'text-primary hover:bg-blue-50'}`}
                  onClick={() => setIsOpen(false)} // Close hamburger menu on click
                >
                  Sahaayak
                </Link>
              </li>
            )}
            <li className="border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-lg font-semibold rounded transition-colors duration-200 text-red-600 hover:bg-red-50"
              >
                {t('navigation.logout') || 'Logout'}
              </button>
            </li>
          </ul>
        </div>
      )}

      {showAddExperienceModal && (
        <AddExperienceModal onClose={() => setShowAddExperienceModal(false)} />
      )}

      {showHiredSeekersModal && (
        <HiredSeekersList employerId={user._id} showArchived={false} onClose={() => setShowHiredSeekersModal(false)} />
      )}

      {showArchivedSeekersModal && (
        <HiredSeekersList employerId={user._id} showArchived={true} onClose={() => setShowArchivedSeekersModal(false)} />
      )}
    </div>
  );
};

export default HamburgerMenu;
