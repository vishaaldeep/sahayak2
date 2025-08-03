import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Star, ChevronLeft, ChevronRight, Filter, Briefcase, CheckCircle } from 'lucide-react';
import { searchJobs, applyForJob } from '../api'; // Import the searchJobs API call

export default function JobsScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    skill: false,
    payRate: false,
    distance: false,
    jobType: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applyingJobs, setApplyingJobs] = useState(new Set());

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data } = await searchJobs(searchQuery);
        setJobs(data);
        setTotalPages(1); // Assuming for now, search results don't have pagination
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchJobs();
    }, 500); // Debounce search to avoid too many API calls

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]); // Trigger search when searchQuery changes

  const filters = [
    { key: 'skill', label: 'Skill' },
    { key: 'payRate', label: 'Pay Rate' },
    { key: 'distance', label: 'Distance' },
    { key: 'jobType', label: 'Job Type' },
  ];

  const toggleFilter = (filterKey) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const handleApplyForJob = async (jobId) => {
    if (appliedJobs.has(jobId) || applyingJobs.has(jobId)) return;
    
    setApplyingJobs(prev => new Set([...prev, jobId]));
    try {
      await applyForJob(jobId);
      setAppliedJobs(prev => new Set([...prev, jobId]));
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to apply for job. Please try again.');
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto py-6 px-6">
        {/* Header */}
        <div className="pt-5 pb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-2xl font-bold">{t('job_discovery')}</div>
            <button className="p-2 bg-transparent border-none outline-none">
              <Filter size={20} color="#9CA3AF" />
            </button>
          </div>
          <div className="text-gray-400 text-sm">{t('find_opportunities_near_you')}</div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-gray-800 rounded-xl px-4 py-3 mb-4 gap-3">
          <Search size={20} color="#9CA3AF" />
          <input
            type="text"
            className="bg-transparent border-none text-white flex-1 outline-none text-base"
            placeholder={t('search_for_jobs')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Location Search */}
        <div className="flex items-center bg-gray-800 rounded-xl px-4 py-3 mb-6 gap-3">
          <MapPin size={20} color="#9CA3AF" />
          <input
            type="text"
            className="bg-transparent border-none text-white flex-1 outline-none text-base"
            placeholder={t('enter_location_or_job_title')}
          />
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
          <button className="flex-1 py-2 rounded-md bg-white text-gray-900 font-semibold">{t('map_view')}</button>
          <button className="flex-1 py-2 rounded-md text-white font-semibold">{t('list_view')}</button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="text-base font-semibold text-white mb-3">{t('filters')}</div>
          <div className="flex gap-3 flex-wrap">
            {filters.map(filter => (
              <button
                key={filter.key}
                className={`px-5 py-2 rounded-full font-medium transition ${
                  selectedFilters[filter.key]
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300'
                }`}
                onClick={() => toggleFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gray-800 rounded-xl p-5 mb-8 flex items-center gap-4">
          <Star size={20} color="#F59E0B" />
          <div>
            <div className="font-semibold text-base text-white mb-1">{t('ai_recommendations')}</div>
            <div className="text-yellow-400 text-sm font-medium mb-1">{t('recommended_jobs')}</div>
            <div className="text-xs text-gray-400">{t('matches_skills_preferences')}</div>
          </div>
        </div>

        {/* Nearby Jobs */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">Search Results</div>
          {loading ? (
            <div className="text-gray-400 text-center py-6">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-gray-400 text-center py-6">No jobs found.</div>
          ) : (
            jobs.map(job => (
              <div key={job._id} className="bg-gray-800 rounded-xl mb-4 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-lg font-bold text-white">{job.title}</div>
                    {job.assessment_required && (
                      <span className="bg-yellow-600 text-yellow-100 px-2 py-1 rounded text-xs font-medium">
                        Assessment Required
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm mb-2">{job.description}</div>
                  {job.skill && (
                    <div className="flex items-center gap-1 mb-3">
                      <Briefcase size={12} color="#9CA3AF" />
                      <span className="text-blue-400 text-sm font-medium">{job.skill}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <MapPin size={12} color="#9CA3AF" />
                      {typeof job.location === 'string' ? job.location : 'Location not specified'}
                    </span>
                    <span className="text-green-400 font-bold">₹{job.wage_per_hour}/hr</span>
                  </div>
                  <button
                    onClick={() => handleApplyForJob(job._id)}
                    disabled={appliedJobs.has(job._id) || applyingJobs.has(job._id)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                      appliedJobs.has(job._id)
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : applyingJobs.has(job._id)
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {appliedJobs.has(job._id) ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle size={16} />
                        Applied
                      </span>
                    ) : applyingJobs.has(job._id) ? (
                      'Applying...'
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination - Removed for now as search doesn't support it */}
        {/* <div className="flex justify-center items-center gap-2 pb-8">
          <button
            className="p-2 rounded-lg bg-gray-800 disabled:opacity-50"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} color="#9CA3AF" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="p-2 rounded-lg bg-gray-800 disabled:opacity-50"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={20} color="#9CA3AF" />
          </button>
        </div> */}
      </div>
    </div>
  );
}
