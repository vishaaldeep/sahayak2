import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { useDbTranslation, formatCurrency } from '../utils/translationHelpers';
import { getJobs, applyForJob, getApplicationsBySeeker, getJobsByEmployerId } from '../api';
import PostJobPage from './PostJobPage';
import ProviderApplicationsScreen from './ProviderApplicationsScreen';
import ApplicationStatusPage from './ApplicationStatusPage';
import EmployerProfileView from './EmployerProfileView';
import MyJobsList from './MyJobsList';
import PreviousJobsPage from './PreviousJobsPage';
import OffersPage from './OffersPage';

const JobsPage = () => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const { translateJobType, translateWageType, translateApplicationStatus, translateJobTitle, translateCityName, translateSkillName } = useDbTranslation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPostJobModal, setShowPostJobModal] = useState(false);
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [appliedJobStatuses, setAppliedJobStatuses] = useState(new Map());
    const [showApplicationStatus, setShowApplicationStatus] = useState(false);
    const [showEmployerProfileModal, setShowEmployerProfileModal] = useState(false);
    const [selectedEmployerUserId, setSelectedEmployerUserId] = useState(null);
    const [activeTab, setActiveTab] = useState('availableJobs'); // 'availableJobs' or 'myJobs' or 'previousJobs'

    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = user ? user.role : null;

    const fetchJobs = async () => {
        try {
            let response;
            
            if (userRole === 'provider') {
                // For employers, use the specific employer endpoint
                if (user && user._id) {
                    console.log(`Fetching jobs for employer: ${user._id}`);
                    response = await getJobsByEmployerId(user._id);
                    
                    // Filter by archived status if needed
                    let jobs = response.data;
                    if (activeTab === 'archivedJobs') {
                        jobs = jobs.filter(job => job.is_archived === true);
                    } else {
                        jobs = jobs.filter(job => job.is_archived === false);
                    }
                    setJobs(jobs);
                } else {
                    setJobs([]);
                }
            } else if (userRole === 'seeker') {
                // For seekers, use the general jobs endpoint with location filtering
                const params = {};
                
                if (activeTab === 'archivedJobs') {
                    params.showArchived = true;
                } else {
                    params.showArchived = false;
                }
                
                let latitude = null;
                let longitude = null;
                if (navigator.geolocation) {
                    await new Promise((resolve) => {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                latitude = position.coords.latitude;
                                longitude = position.coords.longitude;
                                resolve();
                            },
                            (err) => {
                                console.warn(`ERROR(${err.code}): ${err.message}`);
                                resolve();
                            }
                        );
                    });
                }
                if (latitude !== null && longitude !== null) {
                    params.latitude = latitude;
                    params.longitude = longitude;
                }
                console.log('Sending params to getJobs:', params);
                
                response = await getJobs(params);
                setJobs(response.data);
            } else {
                // No user role, show empty
                setJobs([]);
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAppliedJobs = async () => {
        if (userRole === 'seeker' && user && user._id) {
            try {
                const response = await getApplicationsBySeeker(user._id);
                const statuses = new Map();
                response.data.forEach(app => {
                    statuses.set(app.job_id._id, app.status);
                });
                setAppliedJobStatuses(statuses);
            } catch (error) {
                console.error('Error fetching applied jobs:', error);
            }
        }
    };

    useEffect(() => {
        fetchJobs();
        fetchAppliedJobs();
    }, [activeTab, userRole]); // Re-fetch jobs when activeTab or userRole changes

    const handleJobPosted = () => {
        setShowPostJobModal(false);
        fetchJobs();
    };

    const handleApply = async (jobId) => {
        try {
            const seekerId = user ? user._id : null;
            if (!seekerId) {
                alert(t('jobs.pleaseLoginAsSeeker') || 'Please log in as a seeker to apply for jobs.');
                return;
            }
            await applyForJob(seekerId, jobId);
            alert(t('jobs.applicationSubmitted') || 'Application submitted successfully!');
            fetchAppliedJobs();
            setSelectedJob(null);
        } catch (error) {
            console.error('Error applying for job:', error);
            alert(t('jobs.applicationFailed') || 'Failed to submit application. You might have already applied for this job.');
        }
    };

    const handleViewDetails = (job) => {
        setSelectedJob(job);
    };

    const handleCloseModal = () => {
        setSelectedJob(null);
    };

    const handleViewEmployerProfile = (employerUserId) => {
        setSelectedEmployerUserId(employerUserId);
        setShowEmployerProfileModal(true);
    };

    if (loading) return <div className="text-center p-8">{t('common.loading') || 'Loading jobs...'}</div>;
    if (error) return <div className="text-center p-8 text-red-500">{t('common.error') || 'Error loading jobs'}: {error.message}</div>;

    if (showApplicationStatus) {
        return <ApplicationStatusPage />;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{t('jobs.title') || 'Jobs'}</h2>
                {userRole === 'provider' && (
                    <button
                        onClick={() => setShowPostJobModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                        {t('jobs.createJob') || 'Add New Job'}
                    </button>
                )}
                 {userRole === 'seeker' && (
                    <button
                        onClick={() => setShowApplicationStatus(true)}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                        {t('jobs.viewMyApplications') || 'View My Applications'}
                    </button>
                )}
            </div>

            {userRole === 'seeker' && (
                <div className="flex border-b border-gray-200 mb-4">
                    <button
                        className={`py-2 px-4 text-lg font-medium ${activeTab === 'availableJobs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('availableJobs')}
                    >
                        {t('jobs.availableJobs') || 'Available Jobs'}
                    </button>
                    <button
                        className={`py-2 px-4 text-lg font-medium ${activeTab === 'myJobs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('myJobs')}
                    >
                        {t('jobs.myJobs') || 'My Jobs'}
                    </button>
                    <button
                        className={`py-2 px-4 text-lg font-medium ${activeTab === 'archivedJobs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('archivedJobs')}
                    >
                        {t('jobs.archivedJobs') || 'Archived Jobs'}
                    </button>
                    <button
                        className={`py-2 px-4 text-lg font-medium ${activeTab === 'previousJobs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('previousJobs')}
                    >
                        {t('jobs.previousJobs') || 'Previous Jobs'}
                    </button>
                    <button
                        className={`py-2 px-4 text-lg font-medium ${activeTab === 'offers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('offers')}
                    >
                        {t('offers.title') || 'Offers'}
                    </button>
                </div>
            )}

            {userRole === 'provider' && (
                <div className="flex border-b border-gray-200 mb-4">
                    <button
                        className={`py-2 px-4 text-lg font-medium ${activeTab === 'availableJobs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('availableJobs')}
                    >
                        {t('jobs.myPostedJobs') || 'My Posted Jobs'}
                    </button>
                    <button
                        className={`py-2 px-4 text-lg font-medium ${activeTab === 'archivedJobs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('archivedJobs')}
                    >
                        {t('jobs.archivedJobs') || 'Archived Jobs'}
                    </button>
                </div>
            )}

            {activeTab === 'availableJobs' && (
                jobs.length === 0 ? (
                    <p className="text-center text-gray-500">{t('jobs.noJobsFound') || 'No jobs available at the moment.'}</p>
                ) : (
                    <div className="overflow-x-auto shadow-lg rounded-lg">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="py-3 px-6 text-left">{t('common.title') || 'Title'}</th>
                                    <th className="py-3 px-6 text-left">{t('common.description') || 'Description'}</th>
                                    <th className="py-3 px-6 text-left">{t('common.type') || 'Type'}</th>
                                <th className="py-3 px-6 text-left">{t('jobs.openingsLeft') || 'Openings Left'}</th>
                                <th className="py-3 px-6 text-left">{t('common.city') || 'City'}</th>
                                    <th className="py-3 px-6 text-left">{t('jobs.actions') || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {jobs.map(job => (
                                    <tr key={job._id} className="border-b border-gray-200 hover:bg-gray-100 transition-transform transform hover:scale-102 duration-300">
                                        <td className="py-4 px-6">{translateJobTitle(job.title)}</td>
                                        <td className="py-4 px-6">{job.description}</td>
                                        <td className="py-4 px-6">
                                            <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full capitalize mr-2">
                                                {translateJobType(job.job_type)}
                                            </span>
                                            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full capitalize">
                                                {translateWageType(job.wage_type)}
                                            </span>
                                            {job.is_archived && (
                                                <span className="ml-2 bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    {t('jobs.archived') || 'Archived'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">{job.number_of_openings - job.openings_hired}</td>
                                        <td className="py-4 px-6">{translateCityName(job.city)}</td>
                                        <td className="py-4 px-6">
                                            {userRole === 'seeker' && (
                                                <>
                                                    {job.is_archived || (job.number_of_openings - job.openings_hired <= 0) ? (
                                                        <span className="text-red-500 font-semibold">{t('jobs.noOpenings') || 'No Openings'}</span>
                                                    ) : (
                                                        appliedJobStatuses.has(job._id) ? (
                                                            <button
                                                                onClick={() => handleViewDetails(job)}
                                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                                                            >
                                                                {t('common.view') || 'View Details'}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleApply(job._id)}
                                                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                                                            >
                                                                {t('jobs.apply') || 'Apply'}
                                                            </button>
                                                        )
                                                    )}
                                                </>
                                            )}
                                            {userRole === 'provider' && (
                                                <button
                                                    onClick={() => setShowApplicationsModal(true)}
                                                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                                                >
                                                    {t('jobs.seeApplications') || 'See Applications'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {activeTab === 'archivedJobs' && (
                jobs.length === 0 ? (
                    <p className="text-center text-gray-500">{t('jobs.noArchivedJobs') || 'No archived jobs available at the moment.'}</p>
                ) : (
                    <div className="overflow-x-auto shadow-lg rounded-lg">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="py-3 px-6 text-left">{t('common.title') || 'Title'}</th>
                                    <th className="py-3 px-6 text-left">{t('common.description') || 'Description'}</th>
                                    <th className="py-3 px-6 text-left">{t('common.type') || 'Type'}</th>
                                    <th className="py-3 px-6 text-left">{t('jobs.openingsLeft') || 'Openings Left'}</th>
                                    <th className="py-3 px-6 text-left">{t('common.city') || 'City'}</th>
                                    <th className="py-3 px-6 text-left">{t('common.status') || 'Status'}</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {jobs.map(job => (
                                    <tr key={job._id} className="border-b border-gray-200 hover:bg-gray-100 transition-transform transform hover:scale-102 duration-300">
                                        <td className="py-4 px-6">{translateJobTitle(job.title)}</td>
                                        <td className="py-4 px-6">{job.description}</td>
                                        <td className="py-4 px-6">
                                            <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full capitalize mr-2">
                                                {translateJobType(job.job_type)}
                                            </span>
                                            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full capitalize">
                                                {translateWageType(job.wage_type)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">{job.number_of_openings - job.openings_hired}</td>
                                        <td className="py-4 px-6">{translateCityName(job.city)}</td>
                                        <td className="py-4 px-6">
                                            <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                {t('jobs.archived') || 'Archived'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {activeTab === 'myJobs' && userRole === 'seeker' && (
                <MyJobsList seekerId={user._id} />
            )}

            {activeTab === 'previousJobs' && userRole === 'seeker' && (
                <PreviousJobsPage seekerId={user._id} />
            )}

            {activeTab === 'offers' && userRole === 'seeker' && (
                <OffersPage seekerId={user._id} />
            )}

            {showPostJobModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto relative">
                        <button
                            onClick={() => setShowPostJobModal(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                        >
                            &times;
                        </button>
                        <PostJobPage onClose={handleJobPosted} />
                    </div>
                </div>
            )}

            {showApplicationsModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto relative">
                        <button
                            onClick={() => setShowApplicationsModal(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                        >
                            &times;
                        </button>
                        <ProviderApplicationsScreen employerId={user._id} />
                    </div>
                </div>
            )}

            {selectedJob && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold"
                        >
                            &times;
                        </button>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 border-b pb-2">{translateJobTitle(selectedJob.title)}</h2>
                        
                        <>
                            <div className="space-y-4 text-lg text-gray-700">
                                <p><strong>{t('common.description') || 'Description'}:</strong> {selectedJob.description}</p>
                                {selectedJob.responsibilities && (
                                    <p><strong>{t('jobs.responsibilities') || 'Responsibilities'}:</strong> {selectedJob.responsibilities}</p>
                                )}
                                
                                {selectedJob.skills_required && selectedJob.skills_required.length > 0 && (
                                    <div>
                                        <strong>{t('jobs.skillsRequired') || 'Skills Required'}:</strong>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedJob.skills_required.map(skill => (
                                                <span key={skill._id} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                                                    {translateSkillName(skill.name)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <p><strong>{t('jobs.experienceRequired') || 'Experience Required'}:</strong> {selectedJob.experience_required} {t('jobs.years') || 'years'}</p>
                                <p><strong>{t('jobs.numberOfOpenings') || 'Number of Openings'}:</strong> {selectedJob.number_of_openings - selectedJob.openings_hired} ({t('jobs.outOf') || 'out of'} {selectedJob.number_of_openings})</p>
                                
                                <div>
                                    <strong>{t('jobs.jobType') || 'Job Type'}:</strong>
                                    <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm ml-2 capitalize">
                                        {translateJobType(selectedJob.job_type)}
                                    </span>
                                </div>
                                <div>
                                    <strong>{t('jobs.wageType') || 'Wage Type'}:</strong>
                                    <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm ml-2 capitalize">
                                        {translateWageType(selectedJob.wage_type)}
                                    </span>
                                </div>
                                <p><strong>{t('jobs.salaryRange') || 'Salary Range'}:</strong> {formatCurrency(selectedJob.salary_min, currentLanguage)} - {formatCurrency(selectedJob.salary_max, currentLanguage)} {selectedJob.negotiable ? `(${t('jobs.negotiable') || 'Negotiable'})` : `(${t('jobs.fixed') || 'Fixed'})`}</p>
                                {selectedJob.leaves_allowed && (
                                    <p><strong>{t('jobs.leavesAllowed') || 'Leaves Allowed'}:</strong> {selectedJob.leaves_allowed}</p>
                                )}
                                <p className="text-gray-600 mb-2"><strong>{t('common.city') || 'City'}:</strong> {translateCityName(selectedJob.city)}</p>
                            </div>

                            {selectedJob.employer_id && (
                                <div className="mt-6 p-4 border rounded-lg shadow-sm bg-gray-50">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-3">{t('jobs.employerDetails') || 'Employer Details'}</h3>
                                    <p><strong>{t('common.name') || 'Name'}:</strong> {selectedJob.employer_id.name}</p>
                                    <p><strong>{t('common.phone') || 'Phone'}:</strong> {selectedJob.employer_id.phone_number}</p>
                                    {selectedJob.employer_id.email && <p><strong>{t('common.email') || 'Email'}:</strong> {selectedJob.employer_id.email}</p>}
                                    {selectedJob.employer_id.false_accusation_count > 0 && (
                                        <p className="text-red-500 text-sm">{t('profile.falseAccusations') || 'False Accusations'}: {selectedJob.employer_id.false_accusation_count}</p>
                                    )}
                                    {selectedJob.employer_id.abuse_true_count > 0 && (
                                        <p className="text-red-500 text-sm">{t('profile.abuseConfirmed') || 'Abuse Confirmed'}: {selectedJob.employer_id.abuse_true_count}</p>
                                    )}
                                    {selectedJob.employer_id.employer_profile && (
                                        <div className="mt-3">
                                            <p><strong>{t('jobs.company') || 'Company'}:</strong> {selectedJob.employer_id.employer_profile.company_name}</p>
                                            <p><strong>{t('jobs.companyType') || 'Company Type'}:</strong> {selectedJob.employer_id.employer_profile.company_type}</p>
                                            <p><strong>{t('jobs.gstin') || 'GSTIN'}:</strong> {selectedJob.employer_id.employer_profile.gstin_number}</p>
                                            <p><strong>{t('jobs.verified') || 'Verified'}:</strong> {selectedJob.employer_id.employer_profile.is_verified ? (t('common.yes') || 'Yes') : (t('common.no') || 'No')}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t">
                                {userRole === 'seeker' && (
                                    selectedJob.is_archived || (selectedJob.number_of_openings - selectedJob.openings_hired <= 0) ? (
                                        <p className="text-xl font-semibold text-red-600">{t('jobs.jobArchivedNoOpenings') || 'Job Archived / No Openings Left'}</p>
                                    ) : (
                                        appliedJobStatuses.has(selectedJob._id) ? (
                                            <p className="text-xl font-semibold text-green-600">
                                                {t('jobs.applicationStatus') || 'Application Status'}: <span className="capitalize">{translateApplicationStatus(appliedJobStatuses.get(selectedJob._id))}</span>
                                            </p>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleApply(selectedJob._id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                                                >
                                                    {t('jobs.applyNow') || 'Apply Now'}
                                                </button>
                                                <button
                                                    onClick={() => handleViewEmployerProfile(selectedJob.employer_id._id)}
                                                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                                                >
                                                    {t('jobs.viewEmployerProfile') || 'View Employer Profile'}
                                                </button>
                                            </>
                                        )
                                    )
                                )}
                            </div>
                        </>
                    </div>
                </div>
            )}

            {showEmployerProfileModal && (
                <EmployerProfileView 
                    employerUserId={selectedEmployerUserId} 
                    onClose={() => setShowEmployerProfileModal(false)} 
                />
            )}
        </div>
    );
};

export default JobsPage;