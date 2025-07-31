
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AddExperienceModal from './AddExperienceModal';

const HamburgerMenu = ({ navLinks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAddExperienceClick = () => {
    setIsOpen(false); // Close hamburger menu
    setShowAddExperienceModal(true); // Open add experience modal
  };

  const allLinks = [
    ...navLinks,
    { to: '/map', label: 'Sahaayak Chowk' }
  ];

  const user = JSON.parse(localStorage.getItem('user'));
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
          </ul>
        </div>
      )}

      {showAddExperienceModal && (
        <AddExperienceModal onClose={() => setShowAddExperienceModal(false)} />
      )}
    </div>
  );
};

export default HamburgerMenu;
