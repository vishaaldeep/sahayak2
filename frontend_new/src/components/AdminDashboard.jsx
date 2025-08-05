import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoanDisbursalManagement from './LoanDisbursalManagement';
import InvestorProposalReview from './InvestorProposalReview';
import JobsManagement from './JobsManagement';

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('jobs-management'); // 'loan-disbursal', 'investor-review', 'report-abuse', 'jobs-management'

  return (
    <motion.div className="min-h-screen bg-background text-gray-800">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>

        <div className="flex justify-center mb-6 overflow-x-auto">
          <button
            className={`py-2 px-6 rounded-t-lg font-semibold whitespace-nowrap ${selectedTab === 'jobs-management' ? 'bg-white text-primary shadow' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setSelectedTab('jobs-management')}
          >
            Jobs Management
          </button>
          <button
            className={`py-2 px-6 rounded-t-lg font-semibold whitespace-nowrap ${selectedTab === 'loan-disbursal' ? 'bg-white text-primary shadow' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setSelectedTab('loan-disbursal')}
          >
            Loan Disbursal
          </button>
          <button
            className={`py-2 px-6 rounded-t-lg font-semibold whitespace-nowrap ${selectedTab === 'investor-review' ? 'bg-white text-primary shadow' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setSelectedTab('investor-review')}
          >
            Investor Proposals
          </button>
          <button
            className={`py-2 px-6 rounded-t-lg font-semibold whitespace-nowrap ${selectedTab === 'report-abuse' ? 'bg-white text-primary shadow' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setSelectedTab('report-abuse')}
          >
            Report Abuse
          </button>
        </div>

        <div className="bg-white rounded-b-lg shadow-xl p-6">
          {selectedTab === 'jobs-management' && <JobsManagement />}
          {selectedTab === 'loan-disbursal' && <LoanDisbursalManagement />}
          {selectedTab === 'investor-review' && <InvestorProposalReview />}
          {selectedTab === 'report-abuse' && <p>Report Abuse Management (Coming Soon)</p>}
        </div>
      </div>
    </motion.div>
  );
}
