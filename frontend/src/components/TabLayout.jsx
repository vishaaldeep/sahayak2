import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chrome as Home, Search, Award, Wallet, User } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

export default function TabLayout() {
  const { t } = useTranslation();
  // All tab routes are now under /welcome
  const tabs = [
    { to: '/welcome', icon: <Home size={24} />, label: t('home'), exact: true },
    { to: '/welcome/jobs', icon: <Search size={24} />, label: t('jobs') },
    { to: '/welcome/skills', icon: <Award size={24} />, label: t('skills') },
    { to: '/welcome/wallet', icon: <Wallet size={24} />, label: t('wallet') },
    { to: '/welcome/profile', icon: <User size={24} />, label: t('profile') },
  ];

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
