
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          "welcome_message": "Welcome back, Priya!",
          "personalized_overview": "Here's your personalized overview of WorkerBuild.",
          "job_matches": "Job Matches",
          "earnings_summary": "Earnings Summary",
          "total_earnings": "Total Earnings",
          "withdrawal_balance": "Withdrawal Balance",
          "quick_actions": "Quick Actions",
          "find_jobs": "Find Jobs",
          "verify_skills": "Verify Skills",
          "benefits_status": "Benefits Status",
          "health_insurance": "Health Insurance",
          "retirement_fund": "Retirement Fund",
          "government_schemes": "Government Schemes",
          "notifications": "Notifications",
          "loading_notifications": "Loading notifications...",
          "apply": "Apply",
          "toggle_language": "Toggle Language",
          "home": "Home",
          "jobs": "Jobs",
          "skills": "Skills",
          "wallet": "Wallet",
          "profile": "Profile",
          "post_a_job": "Post a Job",
          "post_a_new_job": "Post a New Job",
          "post_job": "Post Job",
        }
      },
      hi: {
        translation: {
          "welcome_message": "वापस स्वागत है, प्रिया!",
          "post_a_new_job": "एक नई नौकरी पोस्ट करें",
          "post_job": "नौकरी पोस्ट करें",
          "personalized_overview": "यहां वर्करबिल्ड का आपका व्यक्तिगत अवलोकन है।",
          "job_matches": "नौकरी के मिलान",
          "earnings_summary": "आय का सारांश",
          "total_earnings": "कुल कमाई",
          "withdrawal_balance": "निकासी शेष",
          "quick_actions": "त्वरित कार्य",
          "find_jobs": "नौकरियां ढूंढें",
          "verify_skills": "कौशल सत्यापित करें",
          "benefits_status": "लाभ की स्थिति",
          "health_insurance": "स्वास्थ्य बीमा",
          "retirement_fund": "सेवानिवृत्ति निधि",
          "government_schemes": "सरकारी योजनाएं",
          "notifications": "सूचनाएं",
          "loading_notifications": "सूचनाएं लोड हो रही हैं...",
          "apply": "आवेदन करें",
          "toggle_language": "भाषा बदलें",
          "home": "होम",
          "jobs": "नौकरियां",
          "skills": "कौशल",
          "wallet": "वॉलेट",
          "profile": "प्रोफ़ाइल",
          "post_a_job": "एक नौकरी पोस्ट करें",
        }
      }
    }
  });

export default i18n;
