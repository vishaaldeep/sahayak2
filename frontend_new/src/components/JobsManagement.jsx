import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  getCSVJobs, 
  importCSVJobs, 
  getImportedJobsStats, 
  getImportedJobs, 
  deleteImportedJobs, 
  updateJobStatus 
} from '../api';

export default function JobsManagement() {
  const [activeTab, setActiveTab] = useState('csv-preview'); // 'csv-preview', 'imported-jobs', 'statistics'
  const [csvJobs, setCsvJobs] = useState([]);
  const [csvStats, setCsvStats] = useState(null);
  const [importedJobs, setImportedJobs] = useState([]);
  const [jobsStats, setJobsStats] = useState(null);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    wageType: '',
    city: '',
    csvOnly: false
  });

  useEffect(() => {
    if (activeTab === 'csv-preview') {
      loadCSVJobs();
    } else if (activeTab === 'imported-jobs') {
      loadImportedJobs();
    } else if (activeTab === 'statistics') {
      loadJobsStats();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'imported-jobs') {
      loadImportedJobs();
    }
  }, [filters, pagination.currentPage]);

  const loadCSVJobs = async () => {
    try {
      setLoading(true);
      const response = await getCSVJobs();
      if (response.data.success) {
        setCsvJobs(response.data.data.jobs);
        setCsvStats(response.data.data.statistics);
      }
    } catch (error) {
      console.error('Error loading CSV jobs:', error);
      alert('Failed to load CSV jobs: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadImportedJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 20,
        ...filters
      };
      const response = await getImportedJobs(params);
      if (response.data.success) {
        setImportedJobs(response.data.data.jobs);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error loading imported jobs:', error);
      alert('Failed to load imported jobs: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadJobsStats = async () => {
    try {
      setLoading(true);
      const response = await getImportedJobsStats();
      if (response.data.success) {
        setJobsStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading jobs stats:', error);
      alert('Failed to load jobs statistics: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = (index) => {
    setSelectedJobs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === csvJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(csvJobs.map((_, index) => index));
    }
  };

  const handleImportJobs = async () => {
    if (selectedJobs.length === 0) {
      alert('Please select at least one job to import');
      return;
    }

    try {
      setImporting(true);
      const response = await importCSVJobs(selectedJobs);
      setImportResult(response.data);
      
      if (response.data.success) {
        alert(`Successfully imported ${response.data.data.imported} jobs!`);
        setSelectedJobs([]);
      } else {
        alert(`Import failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error importing jobs:', error);
      alert('Failed to import jobs: ' + (error.response?.data?.message || error.message));
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteJobs = async (jobIds) => {
    if (!window.confirm(`Are you sure you want to delete ${jobIds.length} jobs?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteImportedJobs(jobIds);
      if (response.data.success) {
        alert(`Deleted ${response.data.data.deletedCount} jobs`);
        loadImportedJobs();
      }
    } catch (error) {
      console.error('Error deleting jobs:', error);
      alert('Failed to delete jobs: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    try {
      const response = await updateJobStatus(jobId, !currentStatus);
      if (response.data.success) {
        loadImportedJobs();
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status: ' + (error.response?.data?.message || error.message));
    }
  };

  const renderCSVPreview = () => (
    <div className="space-y-6">
      {/* CSV Statistics */}
      {csvStats && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">CSV Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{csvStats.totalJobs}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{csvStats.companies}</div>
              <div className="text-sm text-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{csvStats.cities}</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">₹{csvStats.avgSalaryMin?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Avg Min Salary</div>
            </div>
          </div>
        </div>
      )}

      {/* Import Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {selectedJobs.length === csvJobs.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-sm text-gray-600">
            {selectedJobs.length} of {csvJobs.length} jobs selected
          </span>
        </div>
        <button
          onClick={handleImportJobs}
          disabled={selectedJobs.length === 0 || importing}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {importing ? 'Importing...' : `Import Selected (${selectedJobs.length})`}
        </button>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className={`p-4 rounded-lg ${
          importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h4 className="font-semibold mb-2">
            {importResult.success ? '✅ Import Successful' : '❌ Import Failed'}
          </h4>
          <p className="text-sm mb-2">{importResult.message}</p>
          {importResult.data && (
            <div className="text-sm">
              <p>Imported: {importResult.data.imported}</p>
              <p>Failed: {importResult.data.failed}</p>
              {importResult.data.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Errors:</p>
                  <ul className="list-disc list-inside">
                    {importResult.data.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CSV Jobs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-b text-left">
                <input
                  type="checkbox"
                  checked={selectedJobs.length === csvJobs.length && csvJobs.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-2 border-b text-left">Company</th>
              <th className="px-4 py-2 border-b text-left">Job Title</th>
              <th className="px-4 py-2 border-b text-left">Location</th>
              <th className="px-4 py-2 border-b text-left">Salary</th>
              <th className="px-4 py-2 border-b text-left">Experience</th>
              <th className="px-4 py-2 border-b text-left">Openings</th>
            </tr>
          </thead>
          <tbody>
            {csvJobs.map((job, index) => (
              <tr key={index} className={`hover:bg-gray-50 ${
                selectedJobs.includes(index) ? 'bg-blue-50' : ''
              }`}>
                <td className="px-4 py-2 border-b">
                  <input
                    type="checkbox"
                    checked={selectedJobs.includes(index)}
                    onChange={() => handleSelectJob(index)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="font-medium">{job.parsedData.companyName}</div>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="font-medium">{job.parsedData.title}</div>
                  <div className="text-sm text-gray-600 truncate max-w-xs">
                    {job.parsedData.description.substring(0, 100)}...
                  </div>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="text-sm">{job.parsedData.city}</div>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="text-sm">
                    ₹{job.parsedData.salary_min?.toLocaleString()} - ₹{job.parsedData.salary_max?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">{job.parsedData.wage_type}</div>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="text-sm">{job.parsedData.experience_required} years</div>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="text-sm">{job.parsedData.number_of_openings}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderImportedJobs = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <select
            value={filters.jobType}
            onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Job Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="gig">Gig</option>
          </select>
          <select
            value={filters.wageType}
            onChange={(e) => setFilters(prev => ({ ...prev, wageType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Wage Types</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="per_task">Per Task</option>
          </select>
          <input
            type="text"
            placeholder="City..."
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.csvOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, csvOnly: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">CSV Only</span>
          </label>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-b text-left">Job Title</th>
              <th className="px-4 py-2 border-b text-left">Company</th>
              <th className="px-4 py-2 border-b text-left">Location</th>
              <th className="px-4 py-2 border-b text-left">Salary</th>
              <th className="px-4 py-2 border-b text-left">Type</th>
              <th className="px-4 py-2 border-b text-left">Status</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {importedJobs.map((job) => (
              <tr key={job._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  <div className="font-medium">{job.title}</div>
                  <div className="text-sm text-gray-600">
                    {job.csv_import && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">CSV</span>}
                  </div>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="text-sm">
                    {job.csv_company_name || job.employer_id?.company_name || job.employer_id?.name}
                  </div>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="text-sm">{job.city}</div>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="text-sm">
                    ₹{job.salary_min?.toLocaleString()} - ₹{job.salary_max?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">{job.wage_type}</div>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="text-sm">{job.job_type}</div>
                </td>
                <td className="px-4 py-2 border-b">
                  <span className={`px-2 py-1 rounded text-xs ${
                    job.is_archived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {job.is_archived ? 'Archived' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleJobStatus(job._id, job.is_archived)}
                      className={`px-3 py-1 rounded text-xs ${
                        job.is_archived 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-yellow-500 text-white hover:bg-yellow-600'
                      }`}
                    >
                      {job.is_archived ? 'Activate' : 'Archive'}
                    </button>
                    <button
                      onClick={() => handleDeleteJobs([job._id])}
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={!pagination.hasPrev}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={!pagination.hasNext}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  const renderStatistics = () => (
    <div className="space-y-6">
      {jobsStats && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{jobsStats.totalJobs}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{jobsStats.activeJobs}</div>
              <div className="text-sm text-gray-600">Active Jobs</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{jobsStats.csvJobs}</div>
              <div className="text-sm text-gray-600">CSV Imported</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{jobsStats.recentJobs}</div>
              <div className="text-sm text-gray-600">Recent (30 days)</div>
            </div>
          </div>

          {/* Job Types Distribution */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Job Types Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(jobsStats.jobsByType).map(([type, count]) => (
                <div key={type} className="text-center">
                  <div className="text-xl font-bold">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Cities */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Top Cities</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {jobsStats.topCities.slice(0, 10).map((city) => (
                <div key={city.name} className="text-center">
                  <div className="text-lg font-bold">{city.count}</div>
                  <div className="text-sm text-gray-600">{city.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Statistics */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Salary Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">₹{Math.round(jobsStats.salaryStats.avgMinSalary)?.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Avg Min Salary</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">₹{Math.round(jobsStats.salaryStats.avgMaxSalary)?.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Avg Max Salary</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">₹{jobsStats.salaryStats.minSalary?.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Lowest Salary</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">₹{jobsStats.salaryStats.maxSalary?.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Highest Salary</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Jobs Management</h2>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('csv-preview')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'csv-preview'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          CSV Preview & Import
        </button>
        <button
          onClick={() => setActiveTab('imported-jobs')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'imported-jobs'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Imported Jobs
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'statistics'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Statistics
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        )}
        
        {!loading && (
          <>
            {activeTab === 'csv-preview' && renderCSVPreview()}
            {activeTab === 'imported-jobs' && renderImportedJobs()}
            {activeTab === 'statistics' && renderStatistics()}
          </>
        )}
      </div>
    </div>
  );
}