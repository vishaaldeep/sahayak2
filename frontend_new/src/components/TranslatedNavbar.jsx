import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

const TranslatedNavbar = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold">Sahayak</h1>
          
          <div className="hidden md:flex space-x-4">
            <a href="/dashboard" className="hover:text-blue-200">
              {t('navigation.dashboard')}
            </a>
            <a href="/jobs" className="hover:text-blue-200">
              {t('navigation.jobs')}
            </a>
            <a href="/wallet" className="hover:text-blue-200">
              {t('navigation.wallet')}
            </a>
            <a href="/offers" className="hover:text-blue-200">
              {t('navigation.offers')}
            </a>
            <a href="/agreements" className="hover:text-blue-200">
              {t('navigation.agreements')}
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-48">
            <LanguageSelector 
              variant="select" 
              showLabel={false}
              className="text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <a href="/profile" className="hover:text-blue-200">
              {t('common.profile')}
            </a>
            <button className="hover:text-blue-200">
              {t('common.logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TranslatedNavbar;