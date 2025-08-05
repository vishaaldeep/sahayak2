const csvJobParserService = require('../services/csvJobParserService');
const Job = require('../Model/Job');
const User = require('../Model/User');

class AdminController {
    /**
     * Get CSV jobs data for preview
     */
    async getCSVJobs(req, res) {
        try {
            console.log('🎯 Admin requesting CSV jobs data');
            
            const jobs = await csvJobParserService.parseCSVFile();
            const stats = await csvJobParserService.getCSVStatistics();
            
            res.status(200).json({
                success: true,
                message: `Found ${jobs.length} jobs in CSV`,
                data: {
                    jobs: jobs,
                    statistics: stats,
                    totalJobs: jobs.length
                }
            });

        } catch (error) {
            console.error('Error getting CSV jobs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load CSV jobs',
                error: error.message
            });
        }
    }

    /**
     * Import selected CSV jobs to database
     */
    async importCSVJobs(req, res) {
        try {
            const { selectedJobs = [] } = req.body;
            
            console.log(`🎯 Admin importing ${selectedJobs.length} jobs from CSV`);
            
            const result = await csvJobParserService.importJobsToDatabase(selectedJobs);
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: {
                        imported: result.imported,
                        failed: result.failed,
                        errors: result.errors,
                        jobs: result.jobs
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    data: {
                        imported: result.imported,
                        failed: result.failed,
                        errors: result.errors
                    }
                });
            }

        } catch (error) {
            console.error('Error importing CSV jobs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to import CSV jobs',
                error: error.message
            });
        }
    }

    /**
     * Get imported jobs statistics
     */
    async getImportedJobsStats(req, res) {
        try {
            console.log('🎯 Admin requesting imported jobs statistics');
            
            // Get total jobs count
            const totalJobs = await Job.countDocuments();
            
            // Get CSV imported jobs count
            const csvJobs = await Job.countDocuments({ csv_import: true });
            
            // Get jobs by status
            const activeJobs = await Job.countDocuments({ is_archived: false });
            const archivedJobs = await Job.countDocuments({ is_archived: true });
            
            // Get recent jobs (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentJobs = await Job.countDocuments({ 
                createdAt: { $gte: thirtyDaysAgo } 
            });
            
            // Get jobs by type
            const jobsByType = await Job.aggregate([
                { $group: { _id: '$job_type', count: { $sum: 1 } } }
            ]);
            
            // Get jobs by wage type
            const jobsByWageType = await Job.aggregate([
                { $group: { _id: '$wage_type', count: { $sum: 1 } } }
            ]);
            
            // Get top cities
            const topCities = await Job.aggregate([
                { $group: { _id: '$city', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);
            
            // Get salary statistics
            const salaryStats = await Job.aggregate([
                {
                    $group: {
                        _id: null,
                        avgMinSalary: { $avg: '$salary_min' },
                        avgMaxSalary: { $avg: '$salary_max' },
                        minSalary: { $min: '$salary_min' },
                        maxSalary: { $max: '$salary_max' }
                    }
                }
            ]);

            const stats = {
                totalJobs,
                csvJobs,
                activeJobs,
                archivedJobs,
                recentJobs,
                jobsByType: jobsByType.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                jobsByWageType: jobsByWageType.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                topCities: topCities.map(city => ({
                    name: city._id,
                    count: city.count
                })),
                salaryStats: salaryStats[0] || {
                    avgMinSalary: 0,
                    avgMaxSalary: 0,
                    minSalary: 0,
                    maxSalary: 0
                }
            };

            res.status(200).json({
                success: true,
                message: 'Jobs statistics retrieved successfully',
                data: stats
            });

        } catch (error) {
            console.error('Error getting imported jobs stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get jobs statistics',
                error: error.message
            });
        }
    }

    /**
     * Get all imported jobs with pagination
     */
    async getImportedJobs(req, res) {
        try {
            const { 
                page = 1, 
                limit = 20, 
                search = '', 
                jobType = '', 
                wageType = '',
                city = '',
                csvOnly = false
            } = req.query;

            console.log(`🎯 Admin requesting imported jobs - Page: ${page}, Limit: ${limit}`);
            
            // Build filter
            const filter = {};
            
            if (csvOnly === 'true') {
                filter.csv_import = true;
            }
            
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { csv_company_name: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (jobType) filter.job_type = jobType;
            if (wageType) filter.wage_type = wageType;
            if (city) filter.city = { $regex: city, $options: 'i' };

            // Get jobs with pagination
            const jobs = await Job.find(filter)
                .populate('employer_id', 'name company_name email')
                .populate('skills_required', 'name category')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            // Get total count
            const totalJobs = await Job.countDocuments(filter);
            
            res.status(200).json({
                success: true,
                message: `Retrieved ${jobs.length} jobs`,
                data: {
                    jobs,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalJobs / limit),
                        totalJobs,
                        hasNext: page * limit < totalJobs,
                        hasPrev: page > 1
                    }
                }
            });

        } catch (error) {
            console.error('Error getting imported jobs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get imported jobs',
                error: error.message
            });
        }
    }

    /**
     * Delete imported jobs
     */
    async deleteImportedJobs(req, res) {
        try {
            const { jobIds = [] } = req.body;
            
            console.log(`🎯 Admin deleting ${jobIds.length} jobs`);
            
            if (jobIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No job IDs provided'
                });
            }

            const result = await Job.deleteMany({ 
                _id: { $in: jobIds } 
            });

            res.status(200).json({
                success: true,
                message: `Deleted ${result.deletedCount} jobs`,
                data: {
                    deletedCount: result.deletedCount
                }
            });

        } catch (error) {
            console.error('Error deleting imported jobs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete jobs',
                error: error.message
            });
        }
    }

    /**
     * Update job status (archive/unarchive)
     */
    async updateJobStatus(req, res) {
        try {
            const { jobId } = req.params;
            const { is_archived } = req.body;
            
            console.log(`🎯 Admin updating job ${jobId} status to archived: ${is_archived}`);
            
            const job = await Job.findByIdAndUpdate(
                jobId,
                { is_archived },
                { new: true }
            );

            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }

            res.status(200).json({
                success: true,
                message: `Job ${is_archived ? 'archived' : 'unarchived'} successfully`,
                data: job
            });

        } catch (error) {
            console.error('Error updating job status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update job status',
                error: error.message
            });
        }
    }
}

module.exports = new AdminController();