import React, { useState, useEffect } from 'react';
import { Chrome as Home, Search, Award, Wallet, User, Briefcase, Map as MapIcon } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function TabLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isJobProvider, setIsJobProvider] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.user.roleType === 'job provider') {
      setIsJobProvider(true);
    } else {
      setIsJobProvider(false);
    }
  }, []);

  const jobProviderTabs = [
    { to: '/welcome/post-job', icon: <Briefcase size={24} />, label: 'Post Job' },
    { to: '/welcome/profile', icon: <User size={24} />, label: 'Profile' },
  ];

  const regularUserTabs = [
    { to: '/welcome', icon: <Home size={24} />, label: 'Home', exact: true },
    { to: '/welcome/jobs', icon: <Search size={24} />, label: 'Jobs' },
    { to: '/welcome/skills', icon: <Award size={24} />, label: 'Skills' },
    { to: '/welcome/chowk', icon: <MapIcon size={24} />, label: 'Sahayak Chowk' },
    { to: '/welcome/wallet', icon: <Wallet size={24} />, label: 'Wallet' },
    { to: '/welcome/profile', icon: <User size={24} />, label: 'Profile' },
  ];

  const tabs = isJobProvider ? jobProviderTabs : regularUserTabs;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <div className="flex-1">
        <Outlet />
      </div>
      <nav
        className="
          tab-bar
          flex justify-around items-center
          bg-gray-900 border-t border-gray-700
          h-[70px] px-2
          fixed bottom-0 left-0 right-0 z-50
        "
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.to}
            end={tab.exact}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 py-2 
              transition-colors
              ${
                isActive
                  ? 'text-blue-500 font-semibold'
                  : 'text-gray-400 hover:text-blue-400'
              }`
            }
          >
            {tab.icon}
            <span className="text-xs font-semibold mt-1">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}


