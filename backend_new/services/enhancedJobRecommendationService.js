const User = require('../Model/User');
const Job = require('../Model/Job');
const UserExperience = require('../Model/UserExperience');
const CreditScore = require('../Model/creditScore');
const Wallet = require('../Model/Wallet');
const UserSkill = require('../Model/UserSkill');
const RecurringPayment = require('../Model/RecurringPayment');
const UserApplication = require('../Model/UserApplication');
const UserRating = require('../Model/UserRating');
const Report = require('../Model/Report');
const Employer = require('../Model/Employer');
const NotificationService = require('./notificationService');
const OpenAI = require('openai');

class EnhancedJobRecommendationService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    /**
     * Generate enhanced job recommendations for a seeker
     * @param {String} seekerId - User ID of the seeker
     * @returns {Object} - Recommendation results
     */
    async generateJobRecommendations(seekerId) {
        try {
            console.log(`🎯 Starting enhanced job recommendation for seeker: ${seekerId}`);

            // Get seeker profile and related data
            const seekerData = await this.getSeekerProfile(seekerId);
            if (!seekerData.user || seekerData.user.role !== 'seeker') {
                throw new Error('Invalid seeker or user not found');
            }

            // Calculate seeker score and preferences
            const seekerAnalysis = await this.analyzeSeekerProfile(seekerData);
            
            // Find suitable jobs with enhanced filtering
            const candidateJobs = await this.findCandidateJobsEnhanced(seekerData, seekerAnalysis);
            
            if (candidateJobs.length === 0) {
                console.log('❌ No suitable jobs found for seeker');
                return {
                    success: false,
                    message: 'No suitable jobs found at this time',
                    recommendations: []
                };
            }

            // Score and rank jobs with enhanced factors
            const scoredJobs = await this.scoreJobsEnhanced(candidateJobs, seekerData, seekerAnalysis);
            
            // Get top recommendations
            const topRecommendations = scoredJobs.slice(0, 5);
            
            // Generate AI analysis for top recommendations
            const aiAnalysis = await this.generateEnhancedAIAnalysis(seekerData, topRecommendations);
            
            // Save recommendations
            const savedRecommendations = await this.saveRecommendations(seekerId, topRecommendations, aiAnalysis);
            
            // Send notifications
            await this.sendRecommendationNotifications(seekerId, topRecommendations);
            
            console.log(`✅ Generated ${topRecommendations.length} enhanced job recommendations for seeker`);
            
            return {
                success: true,
                message: `Generated ${topRecommendations.length} enhanced job recommendations`,
                recommendations: savedRecommendations,
                aiAnalysis: aiAnalysis,
                seekerProfile: {
                    totalJobs: seekerData.experiences.length,
                    creditScore: seekerData.creditScore?.score || 0,
                    totalSkills: seekerData.skills.length,
                    avgMonthlyIncome: seekerAnalysis.avgMonthlyIncome,
                    experienceMonths: seekerAnalysis.totalExperienceMonths
                }
            };

        } catch (error) {
            console.error('❌ Error generating enhanced job recommendations:', error);
            throw error;
        }
    }

    /**
     * Get comprehensive seeker profile data
     * @param {String} seekerId - User ID
     * @returns {Object} - Seeker profile data
     */
    async getSeekerProfile(seekerId) {
        const [user, experiences, creditScore, wallet, skills, recurringPayments, applications, receivedRatings] = await Promise.all([
            User.findById(seekerId),
            UserExperience.find({ seeker_id: seekerId }).populate('job_id'),
            CreditScore.findOne({ user_id: seekerId }),
            Wallet.findOne({ user_id: seekerId }),
            UserSkill.find({ user_id: seekerId }).populate('skill_id'),
            RecurringPayment.find({ seeker_id: seekerId, status: 'active' }),
            UserApplication.find({ seeker_id: seekerId }).populate('job_id'),
            UserRating.find({ receiver_user_id: seekerId })
        ]);

        return {
            user,
            experiences: experiences || [],
            creditScore,
            wallet,
            skills: skills || [],
            recurringPayments: recurringPayments || [],
            applications: applications || [],
            receivedRatings: receivedRatings || []
        };
    }

    /**
     * Find candidate jobs with enhanced filtering including employer quality
     * @param {Object} seekerData - Seeker profile data
     * @param {Object} seekerAnalysis - Seeker analysis
     * @returns {Array} - Candidate jobs with employer data
     */
    async findCandidateJobsEnhanced(seekerData, seekerAnalysis) {
        const { user, applications } = seekerData;
        const appliedJobIds = applications.map(app => app.job_id?._id?.toString()).filter(Boolean);

        // Build query filters
        const filters = {
            status: 'active',
            _id: { $nin: appliedJobIds } // Exclude already applied jobs
        };

        // Location filter (prefer same city, but include nearby)
        if (user.city) {
            filters.$or = [
                { 'location.city': user.city },
                { 'location.city': { $regex: user.city, $options: 'i' } }
            ];
        }

        // Skill-based filtering
        if (seekerAnalysis.skillSet.length > 0) {
            filters.$or = filters.$or || [];
            filters.$or.push({
                $or: [
                    { required_skills: { $in: seekerAnalysis.skillSet } },
                    { preferred_skills: { $in: seekerAnalysis.skillSet } },
                    { title: { $regex: seekerAnalysis.skillSet.join('|'), $options: 'i' } }
                ]
            });
        }

        // Category filter
        if (seekerAnalysis.preferredCategories.length > 0) {
            filters.$or = filters.$or || [];
            filters.$or.push({
                category: { $in: seekerAnalysis.preferredCategories }
            });
        }

        // Salary filter (not too low compared to expectations)
        if (seekerAnalysis.minExpectedSalary > 0) {
            filters.salary = { $gte: seekerAnalysis.minExpectedSalary * 0.7 };
        }

        // Get jobs with enhanced employer data (including CSV imported jobs)
        const jobs = await Job.find(filters)
            .populate({
                path: 'employer_id',
                select: 'name company_name email phone_number city verified',
                populate: {
                    path: 'employer_profile',
                    model: 'Employer',
                    select: 'company_name company_type gstin_number verified_documents'
                }
            })
            .populate('skills_required') // Updated field name to match Job model
            .limit(50)
            .sort({ createdAt: -1 }); // Updated field name to match Job model

        // Enhance jobs with additional employer data
        const enhancedJobs = await Promise.all(jobs.map(async (job) => {
            const employerId = job.employer_id._id;
            
            // Get employer ratings
            const employerRatings = await UserRating.find({ 
                receiver_user_id: employerId 
            });
            
            // Get abuse reports against employer
            const abuseReports = await Report.find({ 
                reported_user_id: employerId,
                status: { $in: ['pending', 'under_review'] }
            });

            // Get verified abuse reports
            const verifiedAbuseReports = await Report.find({ 
                reported_user_id: employerId,
                status: 'resolved',
                resolution: 'action_taken'
            });

            // Calculate employer metrics
            const avgRating = employerRatings.length > 0 
                ? employerRatings.reduce((sum, rating) => sum + rating.rating, 0) / employerRatings.length 
                : 0;

            const totalRatings = employerRatings.length;
            const pendingReports = abuseReports.length;
            const verifiedReports = verifiedAbuseReports.length;

            // Get employer's job posting history for wage analysis
            const employerJobs = await Job.find({ 
                employer_id: employerId,
                $or: [
                    { is_archived: false }, // Active jobs
                    { is_archived: true }    // Completed/archived jobs
                ]
            }).select('salary_min salary_max createdAt');

            const avgWageOffered = employerJobs.length > 0
                ? employerJobs.reduce((sum, j) => sum + ((j.salary_min + j.salary_max) / 2 || 0), 0) / employerJobs.length
                : 0;

            return {
                ...job.toObject(),
                employerMetrics: {
                    avgRating,
                    totalRatings,
                    pendingReports,
                    verifiedReports,
                    avgWageOffered,
                    totalJobsPosted: employerJobs.length,
                    isVerified: job.employer_id.verified || false,
                    hasGSTIN: job.employer_id.employer_profile?.gstin_number ? true : false,
                    companyType: job.employer_id.employer_profile?.company_type || 'Unknown'
                }
            };
        }));

        return enhancedJobs;
    }

    /**
     * Score jobs with enhanced factors including employer quality
     * @param {Array} jobs - Candidate jobs with employer data
     * @param {Object} seekerData - Seeker profile data
     * @param {Object} seekerAnalysis - Seeker analysis
     * @returns {Array} - Scored and sorted jobs
     */
    async scoreJobsEnhanced(jobs, seekerData, seekerAnalysis) {
        const scoredJobs = jobs.map(job => {
            let score = 0;
            const reasons = [];
            const warnings = [];

            // Skill match score (30% weight - reduced to accommodate new factors)
            const skillMatch = this.calculateSkillMatch(job, seekerAnalysis.skillSet);
            score += skillMatch * 30;
            if (skillMatch > 0.7) reasons.push(`Strong skill match (${Math.round(skillMatch * 100)}%)`);
            else if (skillMatch > 0.4) reasons.push(`Good skill match (${Math.round(skillMatch * 100)}%)`);

            // Location score (15% weight)
            const locationScore = this.calculateLocationScore(job, seekerData.user);
            score += locationScore * 15;
            if (locationScore > 0.8) reasons.push('Excellent location match');
            else if (locationScore > 0.5) reasons.push('Good location match');

            // Salary score (20% weight)
            const salaryScore = this.calculateSalaryScore(job, seekerAnalysis);
            score += salaryScore * 20;
            if (salaryScore > 0.8) reasons.push('Excellent salary offer');
            else if (salaryScore > 0.6) reasons.push('Good salary offer');

            // Experience match (10% weight)
            const experienceScore = this.calculateExperienceMatch(job, seekerAnalysis);
            score += experienceScore * 10;
            if (experienceScore > 0.8) reasons.push('Perfect experience level');

            // Enhanced Employer Quality Score (20% weight - NEW)
            const employerScore = this.calculateEmployerQualityScore(job.employerMetrics);
            score += employerScore * 20;
            if (employerScore > 0.8) reasons.push('Excellent employer reputation');
            else if (employerScore > 0.6) reasons.push('Good employer reputation');
            else if (employerScore < 0.4) warnings.push('Employer has quality concerns');

            // Wage Fairness Score (5% weight - NEW)
            const wageFairnessScore = this.calculateWageFairnessScore(job, seekerAnalysis);
            score += wageFairnessScore * 5;
            if (wageFairnessScore > 0.8) reasons.push('Competitive wage offering');
            else if (wageFairnessScore < 0.4) warnings.push('Below market wage');

            // Safety penalties for problematic employers
            if (job.employerMetrics.verifiedReports > 2) {
                score *= 0.7; // 30% penalty for multiple verified reports
                warnings.push('Employer has multiple verified abuse reports');
            } else if (job.employerMetrics.verifiedReports > 0) {
                score *= 0.85; // 15% penalty for any verified reports
                warnings.push('Employer has verified abuse reports');
            }

            if (job.employerMetrics.pendingReports > 3) {
                score *= 0.9; // 10% penalty for many pending reports
                warnings.push('Employer has multiple pending reports');
            }

            return {
                ...job,
                recommendationScore: Math.round(score),
                matchReasons: reasons,
                warnings: warnings,
                skillMatch: Math.round(skillMatch * 100),
                locationMatch: Math.round(locationScore * 100),
                salaryMatch: Math.round(salaryScore * 100),
                experienceMatch: Math.round(experienceScore * 100),
                employerQuality: Math.round(employerScore * 100),
                wageFairness: Math.round(wageFairnessScore * 100)
            };
        });

        return scoredJobs.sort((a, b) => b.recommendationScore - a.recommendationScore);
    }

    /**
     * Calculate employer quality score based on ratings, reports, and verification
     * @param {Object} employerMetrics - Employer metrics
     * @returns {Number} - Quality score (0-1)
     */
    calculateEmployerQualityScore(metrics) {
        let score = 0.5; // Base score

        // Rating factor (40% of employer score)
        if (metrics.totalRatings > 0) {
            const ratingScore = Math.min(metrics.avgRating / 5, 1);
            score += ratingScore * 0.4;
            
            // Bonus for having many ratings (reliability)
            if (metrics.totalRatings >= 10) score += 0.1;
            else if (metrics.totalRatings >= 5) score += 0.05;
        }

        // Verification factor (30% of employer score)
        if (metrics.isVerified) score += 0.15;
        if (metrics.hasGSTIN) score += 0.15;

        // Report penalty factor (30% of employer score)
        if (metrics.verifiedReports === 0 && metrics.pendingReports === 0) {
            score += 0.3; // Clean record bonus
        } else {
            // Penalty based on reports
            const reportPenalty = (metrics.verifiedReports * 0.1) + (metrics.pendingReports * 0.02);
            score -= Math.min(reportPenalty, 0.3);
        }

        // Job posting history factor
        if (metrics.totalJobsPosted >= 5) score += 0.05; // Experienced employer

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calculate wage fairness score
     * @param {Object} job - Job object
     * @param {Object} seekerAnalysis - Seeker analysis
     * @returns {Number} - Wage fairness score (0-1)
     */
    calculateWageFairnessScore(job, seekerAnalysis) {
        const jobSalary = (job.salary_min + job.salary_max) / 2; // Use average of min and max
        if (!jobSalary || jobSalary <= 0) return 0.3;
        const employerAvgWage = job.employerMetrics.avgWageOffered;
        const seekerExpectedSalary = seekerAnalysis.minExpectedSalary || 10000;

        let score = 0.5;

        // Compare with seeker expectations
        const expectationRatio = jobSalary / seekerExpectedSalary;
        if (expectationRatio >= 1.2) score += 0.3;
        else if (expectationRatio >= 1.0) score += 0.2;
        else if (expectationRatio >= 0.8) score += 0.1;
        else score -= 0.1;

        // Compare with employer's historical wages
        if (employerAvgWage > 0) {
            const employerRatio = jobSalary / employerAvgWage;
            if (employerRatio >= 1.1) score += 0.2; // Above employer's average
            else if (employerRatio >= 0.9) score += 0.1; // Around employer's average
            else score -= 0.1; // Below employer's average
        }

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calculate skill match percentage
     * @param {Object} job - Job object
     * @param {Array} userSkills - User skills array
     * @returns {Number} - Match percentage (0-1)
     */
    calculateSkillMatch(job, userSkills) {
        const requiredSkills = job.skills_required || []; // Updated field name
        const preferredSkills = job.preferred_skills || [];
        const allJobSkills = [...requiredSkills, ...preferredSkills];

        if (allJobSkills.length === 0) return 0.5;

        const matchedSkills = userSkills.filter(skill => 
            allJobSkills.some(jobSkill => 
                jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(jobSkill.toLowerCase())
            )
        );

        const requiredMatches = userSkills.filter(skill =>
            requiredSkills.some(reqSkill =>
                reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(reqSkill.toLowerCase())
            )
        );

        const requiredWeight = 0.7;
        const preferredWeight = 0.3;

        const requiredScore = requiredSkills.length > 0 ? requiredMatches.length / requiredSkills.length : 1;
        const overallScore = allJobSkills.length > 0 ? matchedSkills.length / allJobSkills.length : 0.5;

        return (requiredScore * requiredWeight) + (overallScore * preferredWeight);
    }

    /**
     * Calculate location compatibility score
     * @param {Object} job - Job object
     * @param {Object} user - User object
     * @returns {Number} - Location score (0-1)
     */
    calculateLocationScore(job, user) {
        if (!job.location || !user.city) return 0.5;

        const jobCity = job.location.city?.toLowerCase();
        const userCity = user.city?.toLowerCase();

        if (jobCity === userCity) return 1.0;
        if (jobCity?.includes(userCity) || userCity?.includes(jobCity)) return 0.8;
        
        const commonWords = jobCity?.split(' ').filter(word => userCity?.includes(word));
        if (commonWords && commonWords.length > 0) return 0.6;

        return 0.3;
    }

    /**
     * Calculate salary compatibility score
     * @param {Object} job - Job object
     * @param {Object} seekerAnalysis - Seeker analysis
     * @returns {Number} - Salary score (0-1)
     */
    calculateSalaryScore(job, seekerAnalysis) {
        const jobSalary = (job.salary_min + job.salary_max) / 2; // Use average of min and max
        if (!jobSalary || jobSalary <= 0) return 0.5;

        const expectedSalary = seekerAnalysis.minExpectedSalary || 10000;
        const ratio = jobSalary / expectedSalary;

        if (ratio >= 1.5) return 1.0;
        if (ratio >= 1.2) return 0.9;
        if (ratio >= 1.0) return 0.8;
        if (ratio >= 0.8) return 0.6;
        if (ratio >= 0.6) return 0.4;
        return 0.2;
    }

    /**
     * Calculate experience level match
     * @param {Object} job - Job object
     * @param {Object} seekerAnalysis - Seeker analysis
     * @returns {Number} - Experience score (0-1)
     */
    calculateExperienceMatch(job, seekerAnalysis) {
        const requiredExp = job.experience_required || 0;
        const userExp = seekerAnalysis.totalExperienceMonths;

        if (requiredExp === 0) return 0.8;

        const ratio = userExp / requiredExp;

        if (ratio >= 1.5) return 0.9;
        if (ratio >= 1.0) return 1.0;
        if (ratio >= 0.8) return 0.8;
        if (ratio >= 0.6) return 0.6;
        return 0.3;
    }

    /**
     * Analyze seeker profile to determine preferences and capabilities
     * @param {Object} seekerData - Seeker profile data
     * @returns {Object} - Analysis results
     */
    async analyzeSeekerProfile(seekerData) {
        const { experiences, creditScore, wallet, skills, recurringPayments, receivedRatings } = seekerData;

        // Calculate experience metrics
        const totalExperienceMonths = experiences.reduce((total, exp) => {
            const startDate = new Date(exp.start_date);
            const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
            const months = (endDate - startDate) / (1000 * 60 * 60 * 24 * 30);
            return total + Math.max(0, months);
        }, 0);

        // Calculate average monthly income
        const totalMonthlyIncome = recurringPayments.reduce((total, payment) => {
            let monthlyAmount = payment.amount;
            switch (payment.frequency) {
                case 'daily': monthlyAmount = payment.amount * 30; break;
                case 'weekly': monthlyAmount = payment.amount * 4; break;
                case 'bi-weekly': monthlyAmount = payment.amount * 2; break;
                default: monthlyAmount = payment.amount; break;
            }
            return total + monthlyAmount;
        }, 0);

        const avgMonthlyIncome = recurringPayments.length > 0 ? totalMonthlyIncome / recurringPayments.length : 0;

        // Calculate seeker's average rating
        const avgSeekerRating = receivedRatings.length > 0 
            ? receivedRatings.reduce((sum, rating) => sum + rating.rating, 0) / receivedRatings.length 
            : 0;

        // Determine preferred job categories
        const jobCategories = experiences.map(exp => exp.job_id?.category).filter(Boolean);
        const preferredCategories = [...new Set(jobCategories)];

        // Determine skill categories
        const skillCategories = skills.map(skill => skill.skill_id?.category).filter(Boolean);
        const skillSet = skills.map(skill => skill.skill_id?.name).filter(Boolean);

        // Calculate location preferences
        const workLocations = experiences.map(exp => exp.job_id?.location?.city).filter(Boolean);
        const preferredLocations = [...new Set(workLocations)];

        // Determine salary expectations based on history
        const salaryHistory = experiences.map(exp => exp.job_id?.salary).filter(Boolean);
        const avgSalary = salaryHistory.length > 0 ? salaryHistory.reduce((a, b) => a + b, 0) / salaryHistory.length : 0;
        const minExpectedSalary = Math.max(avgSalary * 0.8, avgMonthlyIncome * 0.9);

        return {
            totalExperienceMonths,
            avgMonthlyIncome,
            creditScore: creditScore?.score || 0,
            savingsBalance: wallet?.balance || 0,
            savingsGoal: wallet?.monthly_savings_goal || 0,
            preferredCategories,
            skillCategories,
            skillSet,
            preferredLocations,
            minExpectedSalary,
            totalJobs: experiences.length,
            activeJobs: experiences.filter(exp => !exp.end_date).length,
            skillCount: skills.length,
            avgSeekerRating,
            totalRatings: receivedRatings.length,
            riskProfile: this.calculateRiskProfile(creditScore?.score || 0, totalExperienceMonths, avgMonthlyIncome)
        };
    }

    /**
     * Calculate risk profile for job recommendations
     * @param {Number} creditScore - Credit score
     * @param {Number} experienceMonths - Total experience in months
     * @param {Number} avgIncome - Average monthly income
     * @returns {String} - Risk profile (low, medium, high)
     */
    calculateRiskProfile(creditScore, experienceMonths, avgIncome) {
        let score = 0;
        
        if (creditScore >= 80) score += 3;
        else if (creditScore >= 60) score += 2;
        else if (creditScore >= 40) score += 1;

        if (experienceMonths >= 24) score += 3;
        else if (experienceMonths >= 12) score += 2;
        else if (experienceMonths >= 6) score += 1;

        if (avgIncome >= 50000) score += 3;
        else if (avgIncome >= 25000) score += 2;
        else if (avgIncome >= 10000) score += 1;

        if (score >= 7) return 'low';
        if (score >= 4) return 'medium';
        return 'high';
    }

    /**
     * Generate enhanced AI analysis including employer quality insights
     * @param {Object} seekerData - Seeker profile data
     * @param {Array} recommendations - Top job recommendations
     * @returns {Object} - AI analysis
     */
    async generateEnhancedAIAnalysis(seekerData, recommendations) {
        try {
            const { user, experiences, skills } = seekerData;
            
            const prompt = `
            Analyze enhanced job recommendations for a seeker with the following profile:
            
            Seeker Profile:
            - Name: ${user.name}
            - Location: ${user.city || 'Not specified'}
            - Total Experience: ${experiences.length} jobs
            - Skills: ${skills.map(s => s.skill_id?.name).filter(Boolean).join(', ') || 'None specified'}
            - Previous Job Categories: ${experiences.map(e => e.job_id?.category).filter(Boolean).join(', ') || 'None'}
            
            Top Job Recommendations with Employer Analysis:
            ${recommendations.slice(0, 3).map((job, index) => `
            ${index + 1}. ${job.title} at ${job.employer_id?.company_name || 'Company'}
               - Salary: ₹${job.salary?.toLocaleString() || 'Not specified'}
               - Location: ${job.location?.city || 'Not specified'}
               - Match Score: ${job.recommendationScore}%
               - Employer Rating: ${job.employerMetrics.avgRating.toFixed(1)}/5 (${job.employerMetrics.totalRatings} reviews)
               - Employer Quality: ${job.employerQuality}%
               - Wage Fairness: ${job.wageFairness}%
               - Verified: ${job.employerMetrics.isVerified ? 'Yes' : 'No'}
               - Reports: ${job.employerMetrics.verifiedReports} verified, ${job.employerMetrics.pendingReports} pending
               - Warnings: ${job.warnings.join(', ') || 'None'}
            `).join('')}
            
            Provide a comprehensive analysis including:
            1. Overall career trajectory assessment
            2. Employer quality analysis and safety recommendations
            3. Wage fairness evaluation
            4. Skill gap analysis and recommendations
            5. Career growth opportunities with quality employers
            6. Red flags to watch for in job applications
            7. Action items for the seeker
            
            Format the response as a professional career counselor would, emphasizing both opportunities and safety.
            `;

            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert career counselor specializing in job market analysis and workplace safety. Provide detailed, actionable career advice that considers both opportunities and employer quality."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7
            });

            const analysis = response.choices[0]?.message?.content || 'Analysis not available';

            return {
                aiAnalysis: analysis,
                analysisDate: new Date(),
                recommendationCount: recommendations.length,
                topMatchScore: recommendations[0]?.recommendationScore || 0,
                averageMatchScore: Math.round(
                    recommendations.reduce((sum, job) => sum + job.recommendationScore, 0) / recommendations.length
                ),
                keyInsights: this.extractEnhancedKeyInsights(recommendations, seekerData),
                employerQualityInsights: this.extractEmployerQualityInsights(recommendations)
            };

        } catch (error) {
            console.error('Error generating enhanced AI analysis:', error);
            return {
                aiAnalysis: 'AI analysis temporarily unavailable. Please check back later.',
                analysisDate: new Date(),
                error: error.message
            };
        }
    }

    /**
     * Extract enhanced key insights including employer quality
     * @param {Array} recommendations - Job recommendations
     * @param {Object} seekerData - Seeker data
     * @returns {Object} - Enhanced key insights
     */
    extractEnhancedKeyInsights(recommendations, seekerData) {
        const avgSalary = recommendations.reduce((sum, job) => sum + (job.salary || 0), 0) / recommendations.length;
        const topCategories = [...new Set(recommendations.map(job => job.category))].slice(0, 3);
        const skillGaps = this.identifySkillGaps(recommendations, seekerData.skills);
        
        const avgEmployerRating = recommendations.reduce((sum, job) => sum + job.employerMetrics.avgRating, 0) / recommendations.length;
        const verifiedEmployers = recommendations.filter(job => job.employerMetrics.isVerified).length;
        const safeEmployers = recommendations.filter(job => job.employerMetrics.verifiedReports === 0).length;

        return {
            averageRecommendedSalary: Math.round(avgSalary),
            topJobCategories: topCategories,
            skillGaps: skillGaps,
            locationDiversity: [...new Set(recommendations.map(job => job.location?.city))].length,
            highMatchJobs: recommendations.filter(job => job.recommendationScore >= 80).length,
            avgEmployerRating: Math.round(avgEmployerRating * 10) / 10,
            verifiedEmployers,
            safeEmployers,
            employersWithWarnings: recommendations.filter(job => job.warnings.length > 0).length
        };
    }

    /**
     * Extract employer quality insights
     * @param {Array} recommendations - Job recommendations
     * @returns {Object} - Employer quality insights
     */
    extractEmployerQualityInsights(recommendations) {
        const totalRecommendations = recommendations.length;
        const highQualityEmployers = recommendations.filter(job => job.employerQuality >= 80).length;
        const lowQualityEmployers = recommendations.filter(job => job.employerQuality < 50).length;
        const employersWithReports = recommendations.filter(job => 
            job.employerMetrics.verifiedReports > 0 || job.employerMetrics.pendingReports > 0
        ).length;

        return {
            totalRecommendations,
            highQualityEmployers,
            lowQualityEmployers,
            employersWithReports,
            qualityDistribution: {
                excellent: recommendations.filter(job => job.employerQuality >= 90).length,
                good: recommendations.filter(job => job.employerQuality >= 70 && job.employerQuality < 90).length,
                average: recommendations.filter(job => job.employerQuality >= 50 && job.employerQuality < 70).length,
                poor: recommendations.filter(job => job.employerQuality < 50).length
            }
        };
    }

    /**
     * Identify skill gaps from job recommendations
     * @param {Array} recommendations - Job recommendations
     * @param {Array} userSkills - User skills
     * @returns {Array} - Missing skills
     */
    identifySkillGaps(recommendations, userSkills) {
        const userSkillNames = userSkills.map(s => s.skill_id?.name?.toLowerCase()).filter(Boolean);
        const allRequiredSkills = recommendations.flatMap(job => job.required_skills || []);
        const skillFrequency = {};

        allRequiredSkills.forEach(skill => {
            const skillLower = skill.toLowerCase();
            if (!userSkillNames.includes(skillLower)) {
                skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
            }
        });

        return Object.entries(skillFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([skill, count]) => ({ skill, demandCount: count }));
    }

    /**
     * Save recommendations to database
     * @param {String} seekerId - Seeker ID
     * @param {Array} recommendations - Job recommendations
     * @param {Object} aiAnalysis - AI analysis
     * @returns {Array} - Saved recommendations
     */
    async saveRecommendations(seekerId, recommendations, aiAnalysis) {
        return recommendations.map(job => ({
            jobId: job._id,
            title: job.title,
            company: job.csv_company_name || job.employer_id?.company_name, // Support CSV imported jobs
            salary: (job.salary_min + job.salary_max) / 2, // Use average salary
            salaryRange: `₹${job.salary_min?.toLocaleString()} - ₹${job.salary_max?.toLocaleString()}`,
            location: job.city || job.location?.city,
            matchScore: job.recommendationScore,
            matchReasons: job.matchReasons,
            warnings: job.warnings,
            employerQuality: job.employerQuality,
            wageFairness: job.wageFairness,
            employerRating: job.employerMetrics.avgRating,
            isVerifiedEmployer: job.employerMetrics.isVerified,
            isCSVImport: job.csv_import || false,
            recommendedAt: new Date(),
            aiAnalysis: aiAnalysis.aiAnalysis
        }));
    }

    /**
     * Send recommendation notifications to seeker
     * @param {String} seekerId - Seeker ID
     * @param {Array} recommendations - Job recommendations
     */
    async sendRecommendationNotifications(seekerId, recommendations) {
        try {
            const topJob = recommendations[0];
            if (!topJob) return;

            const qualityNote = topJob.employerQuality >= 80 ? ' from a high-quality employer' : '';
            const warningNote = topJob.warnings.length > 0 ? ' (Please review warnings)' : '';

            const notificationData = {
                user_id: seekerId,
                type: 'job_recommendation',
                title: 'Enhanced Job Recommendations Available!',
                message: `We found ${recommendations.length} job matches for you! Top match: ${topJob.title} at ${topJob.employer_id?.company_name}${qualityNote} with ${topJob.recommendationScore}% compatibility${warningNote}.`,
                data: {
                    recommendationCount: recommendations.length,
                    topJobId: topJob._id,
                    topJobTitle: topJob.title,
                    topJobCompany: topJob.employer_id?.company_name,
                    matchScore: topJob.recommendationScore,
                    employerQuality: topJob.employerQuality,
                    hasWarnings: topJob.warnings.length > 0
                }
            };

            await NotificationService.createNotification(notificationData);
            console.log(`📧 Sent enhanced job recommendation notification to seeker ${seekerId}`);

        } catch (error) {
            console.error('Error sending recommendation notification:', error);
        }
    }

    /**
     * Get job recommendations for a seeker (for API endpoint)
     * @param {String} seekerId - Seeker ID
     * @returns {Object} - Recommendations with analysis
     */
    async getJobRecommendations(seekerId) {
        try {
            return await this.generateJobRecommendations(seekerId);
        } catch (error) {
            console.error('Error getting job recommendations:', error);
            throw error;
        }
    }
}

module.exports = new EnhancedJobRecommendationService();