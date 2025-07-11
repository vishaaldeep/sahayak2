import React, { useState, useEffect } from 'react';
import { Bell, Search, Award, IndianRupee, Heart, Briefcase } from 'lucide-react';

const schemes = [
  {
    id: 'eshram',
    name: 'e-Shram',
    image: 'https://www.uxdt.nic.in/wp-content/uploads/2024/07/e-shram-e-shram-01.jpg?x86456',
    applyUrl: 'https://eshram.gov.in/',
  },
  {
    id: 'pmjay',
    name: 'PM Jan Arogya Yojana',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM14i34pZNJ6lGEyd34mVLqMlE2j73Xrhgeg&s',
    applyUrl: 'https://pmjay.gov.in/',
  },
  {
    id: 'pmsym',
    name: 'Maan-dhan (PM-SYM)',
    image: 'https://media.umangapp.in/app/ico/service/maandhan.png',
    applyUrl: 'https://maandhan.in/',
  },
];

export default function HomeScreen() {
  const [jobMatches, setJobMatches] = useState([]);
  const [earnings, setEarnings] = useState({ total: 0, withdrawal: 0 });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setJobMatches([
        {
          id: 1,
          title: 'Construction Helper',
          location: 'Construction site in Mumbai',
          image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        {
          id: 2,
          title: 'Delivery Partner',
          location: 'Delivery in Bangalore',
          image: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
        {
          id: 3,
          title: 'Retail Associate',
          location: 'Retail store in Delhi',
          image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400',
        },
      ]);
      setEarnings({ total: 15000, withdrawal: 5000 });
      setNotifications([
        {
          id: 1,
          icon: <Briefcase size={20} color="#fff" />,
          title: 'Construction Helper',
          description: 'New job opportunity in your area',
          color: '#3B82F6',
        },
        {
          id: 2,
          icon: <IndianRupee size={20} color="#fff" />,
          title: 'Payment Received',
          description: 'Your payment of ₹ 2,500 has been processed',
          color: '#10B981',
        },
        {
          id: 3,
          icon: <Heart size={20} color="#fff" />,
          title: 'Benefit Update',
          description: 'Your health insurance is now active',
          color: '#EF4444',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto py-6">
        {/* Header */}
        <div className="flex justify-between items-start px-6 pt-5 pb-8">
          <div>
            <div className="text-2xl font-bold mb-2">Welcome back, Priya!</div>
            <div className="text-gray-400 text-sm leading-5">
              Here's your personalized overview of WorkerBuild.
            </div>
          </div>
          <button className="relative p-2 bg-transparent border-none outline-none">
            <Bell size={24} color="#9CA3AF" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Job Matches */}
        <div className="px-6 mb-8">
          <div className="text-lg font-bold mb-4">Job Matches</div>
          <div className="flex overflow-x-auto gap-4 pb-2">
            {jobMatches.map((job) => (
              <div key={job.id} className="relative w-52 h-32 rounded-xl overflow-hidden flex-shrink-0">
                <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3">
                  <div className="text-white font-semibold text-base">{job.title}</div>
                  <div className="text-gray-300 text-xs">{job.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="px-6 mb-8">
          <div className="text-lg font-bold mb-4">Earnings Summary</div>
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-800 rounded-xl p-5">
              <div className="text-gray-400 text-sm mb-2">Total Earnings</div>
              <div className="text-2xl font-bold">₹ {earnings.total.toLocaleString()}</div>
            </div>
            <div className="flex-1 bg-gray-800 rounded-xl p-5">
              <div className="text-gray-400 text-sm mb-2">Withdrawal Balance</div>
              <div className="text-2xl font-bold">₹ {earnings.withdrawal.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 mb-8">
          <div className="text-lg font-bold mb-4">Quick Actions</div>
          <div className="flex gap-4">
            <button className="flex-1 flex flex-col items-center gap-2 bg-gray-800 rounded-xl p-5 font-semibold">
              <Search size={24} color="#fff" />
              <span>Find Jobs</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-2 bg-gray-800 rounded-xl p-5 font-semibold">
              <Award size={24} color="#fff" />
              <span>Verify Skills</span>
            </button>
          </div>
        </div>

        {/* Benefits Status */}
        <div className="px-6 mb-8">
          <div className="text-lg font-bold mb-4">Benefits Status</div>
          <div className="mb-5">
            <div className="font-semibold text-base mb-3">Health Insurance</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-800 rounded">
                <div className="h-full bg-white rounded" style={{ width: '75%' }} />
              </div>
              <div className="text-xs text-gray-400 font-medium">75% Complete</div>
            </div>
          </div>
          <div>
            <div className="font-semibold text-base mb-3">Retirement Fund</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-800 rounded">
                <div className="h-full bg-white rounded" style={{ width: '50%' }} />
              </div>
              <div className="text-xs text-gray-400 font-medium">50% Complete</div>
            </div>
          </div>
        </div>

        {/* Government Schemes */}
        <div className="px-6 mb-8">
          <div className="text-lg font-bold mb-4">Government Schemes</div>
          {schemes.map((scheme) => (
            <div key={scheme.id} className="flex items-center bg-gray-800 rounded-xl p-4 mb-4 gap-4">
              <img src={scheme.image} alt={scheme.name} className="w-16 h-16 rounded-lg bg-white object-cover" />
              <div className="flex-1 flex justify-between items-center">
                <div className="font-semibold text-base">{scheme.name}</div>
                <button
                  className="bg-green-500 rounded px-5 py-2 font-bold text-white"
                  onClick={() => window.open(scheme.applyUrl, '_blank')}
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="px-6 mb-8">
          <div className="text-lg font-bold mb-4">Notifications</div>
          {loading && <div className="text-gray-400 text-center py-5">Loading notifications...</div>}
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-center bg-gray-800 rounded-xl p-4 mb-3 gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: notification.color }}
              >
                {notification.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base mb-1">{notification.title}</div>
                <div className="text-gray-400 text-sm">{notification.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
