import React from 'react';
import {
  IndianRupee,
  TrendingUp,
  Wallet,
  Shield,
  Download,
  Eye,
} from 'lucide-react';

export default function WalletScreen() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="pt-5 pb-8">
          <div className="text-2xl font-bold">Wage & Wallet</div>
        </div>

        {/* Earnings Summary */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">Earnings Summary</div>
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-800 rounded-xl p-4 flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-2 text-center">Total Earnings</div>
              <div className="text-xl font-bold">₹ 12,500</div>
            </div>
            <div className="flex-1 bg-gray-800 rounded-xl p-4 flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-2 text-center">Pending Payments</div>
              <div className="text-xl font-bold">₹ 2,500</div>
            </div>
            <div className="flex-1 bg-gray-800 rounded-xl p-4 flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-2 text-center">Withdrawn</div>
              <div className="text-xl font-bold">₹ 10,000</div>
            </div>
          </div>
        </div>

        {/* Wage Comparison */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">Wage Comparison</div>
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="text-sm text-gray-400 leading-5 mb-5">
              Compare your wages with market standards and negotiate better pay.
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-white rounded-xl py-3 font-semibold text-gray-900 hover:bg-gray-200 transition">
              <TrendingUp size={20} color="#1F2937" />
              <span>Compare Wages</span>
            </button>
          </div>
        </div>

        {/* Instant Payouts */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">Instant Payouts</div>
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="text-sm text-gray-400 leading-5 mb-5">
              Get paid instantly via UPI for completed gigs.
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-white rounded-xl py-3 font-semibold text-gray-900 hover:bg-gray-200 transition">
              <Download size={20} color="#1F2937" />
              <span>Withdraw Earnings</span>
            </button>
          </div>
        </div>

        {/* Smart Wallet */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">Smart Wallet</div>
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="text-sm text-gray-400 leading-5 mb-5">
              Track your earnings, set savings goals, and monitor your credit score.
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-white rounded-xl py-3 font-semibold text-gray-900 hover:bg-gray-200 transition">
              <Wallet size={20} color="#1F2937" />
              <span>View Wallet</span>
            </button>
          </div>
        </div>

        {/* Micro-Insurance & Benefits */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">Micro-Insurance & Benefits</div>
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="text-sm text-gray-400 leading-5 mb-5">
              Access affordable insurance and benefits tailored for gig workers.
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-white rounded-xl py-3 font-semibold text-gray-900 hover:bg-gray-200 transition">
              <Shield size={20} color="#1F2937" />
              <span>Explore Benefits</span>
            </button>
          </div>
        </div>

        {/* Financial Insights */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">Financial Insights</div>
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <IndianRupee size={20} color="#10B981" />
                <span className="font-semibold text-sm">Monthly Growth</span>
              </div>
              <div className="text-2xl font-bold mb-1">+15%</div>
              <div className="text-xs text-gray-400">Compared to last month</div>
            </div>
            <div className="flex-1 bg-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={20} color="#3B82F6" />
                <span className="font-semibold text-sm">Credit Score</span>
              </div>
              <div className="text-2xl font-bold mb-1">720</div>
              <div className="text-xs text-gray-400">Excellent rating</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">Quick Actions</div>
          <div className="flex flex-wrap gap-4">
            <button className="w-[47%] bg-gray-800 rounded-xl p-5 flex flex-col items-center gap-3">
              <Eye size={24} color="#3B82F6" />
              <span className="text-sm font-semibold text-center">View Transactions</span>
            </button>
            <button className="w-[47%] bg-gray-800 rounded-xl p-5 flex flex-col items-center gap-3">
              <Shield size={24} color="#10B981" />
              <span className="text-sm font-semibold text-center">Insurance Status</span>
            </button>
            <button className="w-[47%] bg-gray-800 rounded-xl p-5 flex flex-col items-center gap-3">
              <TrendingUp size={24} color="#F59E0B" />
              <span className="text-sm font-semibold text-center">Credit Report</span>
            </button>
            <button className="w-[47%] bg-gray-800 rounded-xl p-5 flex flex-col items-center gap-3">
              <Wallet size={24} color="#EF4444" />
              <span className="text-sm font-semibold text-center">Savings Goals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
