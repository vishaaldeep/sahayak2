import { useTranslation } from 'react-i18next';

// Hook for translating database values
export const useDbTranslation = () => {
  const { t } = useTranslation();

  const translateJobType = (jobType) => {
    const jobTypeMap = {
      'full_time': t('jobTypes.fullTime') || 'Full Time',
      'part_time': t('jobTypes.partTime') || 'Part Time',
      'contract': t('jobTypes.contract') || 'Contract',
      'freelance': t('jobTypes.freelance') || 'Freelance',
      'temporary': t('jobTypes.temporary') || 'Temporary',
      'internship': t('jobTypes.internship') || 'Internship',
    };
    return jobTypeMap[jobType] || jobType;
  };

  const translateWageType = (wageType) => {
    const wageTypeMap = {
      'hourly': t('wageTypes.hourly') || 'Hourly',
      'daily': t('wageTypes.daily') || 'Daily',
      'weekly': t('wageTypes.weekly') || 'Weekly',
      'monthly': t('wageTypes.monthly') || 'Monthly',
      'yearly': t('wageTypes.yearly') || 'Yearly',
      'per_project': t('wageTypes.perProject') || 'Per Project',
    };
    return wageTypeMap[wageType] || wageType;
  };

  const translateApplicationStatus = (status) => {
    const statusMap = {
      'pending': t('applicationStatus.pending') || 'Pending',
      'accepted': t('applicationStatus.accepted') || 'Accepted',
      'rejected': t('applicationStatus.rejected') || 'Rejected',
      'under_review': t('applicationStatus.underReview') || 'Under Review',
      'shortlisted': t('applicationStatus.shortlisted') || 'Shortlisted',
      'interviewed': t('applicationStatus.interviewed') || 'Interviewed',
    };
    return statusMap[status] || status;
  };

  const translateOfferStatus = (status) => {
    const statusMap = {
      'pending': t('offerStatus.pending') || 'Pending',
      'accepted': t('offerStatus.accepted') || 'Accepted',
      'rejected': t('offerStatus.rejected') || 'Rejected',
      'countered': t('offerStatus.countered') || 'Countered',
      'expired': t('offerStatus.expired') || 'Expired',
      'withdrawn': t('offerStatus.withdrawn') || 'Withdrawn',
    };
    return statusMap[status] || status;
  };

  const translateAgreementStatus = (status) => {
    const statusMap = {
      'pending_signing': t('agreementStatus.pendingSigning') || 'Pending Signing',
      'signed_by_employer': t('agreementStatus.signedByEmployer') || 'Signed by Employer',
      'signed_by_seeker': t('agreementStatus.signedBySeeker') || 'Signed by Employee',
      'fully_signed': t('agreementStatus.fullySigned') || 'Fully Signed',
      'cancelled': t('agreementStatus.cancelled') || 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const translateLoanStatus = (status) => {
    const statusMap = {
      'pending': t('loanStatus.pending') || 'Pending',
      'approved': t('loanStatus.approved') || 'Approved',
      'rejected': t('loanStatus.rejected') || 'Rejected',
      'under_review': t('loanStatus.underReview') || 'Under Review',
      'disbursed': t('loanStatus.disbursed') || 'Disbursed',
      'repaid': t('loanStatus.repaid') || 'Repaid',
      'defaulted': t('loanStatus.defaulted') || 'Defaulted',
    };
    return statusMap[status] || status;
  };

  const translateTransactionType = (type) => {
    const typeMap = {
      'credit': t('transactionTypes.credit') || 'Credit',
      'debit': t('transactionTypes.debit') || 'Debit',
      'transfer': t('transactionTypes.transfer') || 'Transfer',
      'payment': t('transactionTypes.payment') || 'Payment',
      'refund': t('transactionTypes.refund') || 'Refund',
      'fee': t('transactionTypes.fee') || 'Fee',
    };
    return typeMap[type] || type;
  };

  const translateTransactionStatus = (status) => {
    const statusMap = {
      'pending': t('transactionStatus.pending') || 'Pending',
      'completed': t('transactionStatus.completed') || 'Completed',
      'failed': t('transactionStatus.failed') || 'Failed',
      'cancelled': t('transactionStatus.cancelled') || 'Cancelled',
      'processing': t('transactionStatus.processing') || 'Processing',
    };
    return statusMap[status] || status;
  };

  const translateUserRole = (role) => {
    const roleMap = {
      'seeker': t('userRoles.seeker') || 'Job Seeker',
      'provider': t('userRoles.provider') || 'Job Provider',
      'investor': t('userRoles.investor') || 'Investor',
      'admin': t('userRoles.admin') || 'Admin',
    };
    return roleMap[role] || role;
  };

  const translateCompanyType = (type) => {
    const typeMap = {
      'individual': t('companyTypes.individual') || 'Individual',
      'business': t('companyTypes.business') || 'Business',
      'enterprise': t('companyTypes.enterprise') || 'Enterprise',
      'startup': t('companyTypes.startup') || 'Startup',
      'ngo': t('companyTypes.ngo') || 'NGO',
      'government': t('companyTypes.government') || 'Government',
    };
    return typeMap[type] || type;
  };

  const translatePriority = (priority) => {
    const priorityMap = {
      'low': t('priority.low') || 'Low',
      'medium': t('priority.medium') || 'Medium',
      'high': t('priority.high') || 'High',
      'urgent': t('priority.urgent') || 'Urgent',
    };
    return priorityMap[priority] || priority;
  };

  return {
    translateJobType,
    translateWageType,
    translateApplicationStatus,
    translateOfferStatus,
    translateAgreementStatus,
    translateLoanStatus,
    translateTransactionType,
    translateTransactionStatus,
    translateUserRole,
    translateCompanyType,
    translatePriority,
  };
};

// Utility function for formatting dates in user's locale
export const formatDate = (date, locale = 'en') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const localeMap = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'pa': 'pa-IN',
    'mr': 'mr-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'ml': 'ml-IN',
    'kn': 'kn-IN',
    'bn': 'bn-IN',
    'gu': 'gu-IN',
  };
  
  return dateObj.toLocaleDateString(localeMap[locale] || 'en-US');
};

// Utility function for formatting currency
export const formatCurrency = (amount, locale = 'en') => {
  if (!amount && amount !== 0) return '';
  
  const localeMap = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'pa': 'pa-IN',
    'mr': 'mr-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'ml': 'ml-IN',
    'kn': 'kn-IN',
    'bn': 'bn-IN',
    'gu': 'gu-IN',
  };
  
  return new Intl.NumberFormat(localeMap[locale] || 'en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};