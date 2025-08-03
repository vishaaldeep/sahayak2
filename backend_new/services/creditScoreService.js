const User = require('../Model/User');
const CreditScore = require('../Model/creditScore');
const Wallet = require('../Model/Wallet');
const UserExperience = require('../Model/UserExperience');
const RecurringPayment = require('../Model/RecurringPayment');
const NotificationService = require('./notificationService');

class CreditScoreService {
    constructor() {
        this.baseScore = 30; // Starting credit score (30/100)
        this.maxScore = 100; // Maximum credit score
        this.minScore = 10; // Minimum credit score
    }

    /**
     * Calculate credit score for a seeker based on various factors
     * @param {String} userId - User ID
     * @returns {Object} - Credit score calculation details
     */
    async calculateCreditScore(userId) {
        try {
            // Only calculate for seekers
            const user = await User.findById(userId);
            if (!user || user.role !== 'seeker') {
                return { error: 'Credit score calculation only available for seekers' };
            }

            // Get user's wallet and savings goal
            const wallet = await Wallet.findOne({ user_id: userId });
            
            // Get user's job experiences
            const experiences = await UserExperience.find({ 
                seeker_id: userId,
                end_date: null // Current jobs only
            });

            // Get recurring payments (salary) for this user
            const recurringPayments = await RecurringPayment.find({
                seeker_id: userId,
                status: 'active'
            });

            // Calculate score components
            const scoreComponents = {
                base: this.baseScore,
                savingsGoal: this.calculateSavingsGoalScore(wallet),
                jobCount: this.calculateJobCountScore(experiences.length),
                salaryScore: this.calculateSalaryScore(recurringPayments),
                savingsBalance: this.calculateSavingsBalanceScore(wallet),
                jobStability: this.calculateJobStabilityScore(experiences)
            };

            // Calculate total score
            const totalScore = Math.min(
                this.maxScore,
                Math.max(
                    this.minScore,
                    scoreComponents.base +
                    scoreComponents.savingsGoal +
                    scoreComponents.jobCount +
                    scoreComponents.salaryScore +
                    scoreComponents.savingsBalance +
                    scoreComponents.jobStability
                )
            );

            return {
                userId,
                totalScore,
                components: scoreComponents,
                factors: this.generateFactorsExplanation(scoreComponents),
                recommendations: this.generateRecommendations(scoreComponents, wallet, experiences)
            };

        } catch (error) {
            console.error('Error calculating credit score:', error);
            throw error;
        }
    }

    /**
     * Calculate score based on savings goal
     * @param {Object} wallet - User's wallet
     * @returns {Number} - Score points
     */
    calculateSavingsGoalScore(wallet) {
        if (!wallet || !wallet.monthly_savings_goal || wallet.monthly_savings_goal <= 0) {
            return 0; // No savings goal = no points
        }

        // Base points for having a savings goal
        let score = 5;

        // Additional points based on goal amount
        if (wallet.monthly_savings_goal >= 1000) score += 2;
        if (wallet.monthly_savings_goal >= 5000) score += 3;
        if (wallet.monthly_savings_goal >= 10000) score += 5;

        return score;
    }

    /**
     * Calculate score based on number of jobs
     * @param {Number} jobCount - Number of current jobs
     * @returns {Number} - Score points
     */
    calculateJobCountScore(jobCount) {
        if (jobCount === 0) return 0;
        if (jobCount === 1) return 8; // Single job
        if (jobCount === 2) return 12; // Two jobs - significant boost
        if (jobCount >= 3) return 15; // Multiple jobs - maximum boost

        return 0;
    }

    /**
     * Calculate score based on salary/recurring payments
     * @param {Array} recurringPayments - Active recurring payments
     * @returns {Number} - Score points
     */
    calculateSalaryScore(recurringPayments) {
        if (!recurringPayments || recurringPayments.length === 0) {
            return 0;
        }

        // Calculate total monthly income
        const totalMonthlyIncome = recurringPayments.reduce((total, payment) => {
            let monthlyAmount = payment.amount;
            
            // Convert to monthly equivalent
            switch (payment.frequency) {
                case 'daily':
                    monthlyAmount = payment.amount * 30;
                    break;
                case 'weekly':
                    monthlyAmount = payment.amount * 4;
                    break;
                case 'bi-weekly':
                    monthlyAmount = payment.amount * 2;
                    break;
                case 'monthly':
                default:
                    monthlyAmount = payment.amount;
                    break;
            }
            
            return total + monthlyAmount;
        }, 0);

        // Score based on income level
        let score = 3; // Base score for having income

        if (totalMonthlyIncome >= 10000) score += 3;
        if (totalMonthlyIncome >= 25000) score += 5;
        if (totalMonthlyIncome >= 50000) score += 8;
        if (totalMonthlyIncome >= 100000) score += 10;

        return score;
    }

    /**
     * Calculate score based on actual savings balance vs goal
     * @param {Object} wallet - User's wallet
     * @returns {Number} - Score points
     */
    calculateSavingsBalanceScore(wallet) {
        if (!wallet || !wallet.monthly_savings_goal || wallet.monthly_savings_goal <= 0) {
            return 0;
        }

        const savingsRatio = wallet.balance / wallet.monthly_savings_goal;
        
        if (savingsRatio >= 1.0) return 5; // Met or exceeded goal
        if (savingsRatio >= 0.75) return 4; // 75% of goal
        if (savingsRatio >= 0.5) return 2; // 50% of goal
        if (savingsRatio >= 0.25) return 1; // 25% of goal

        return 0;
    }

    /**
     * Calculate score based on job stability (tenure)
     * @param {Array} experiences - User's job experiences
     * @returns {Number} - Score points
     */
    calculateJobStabilityScore(experiences) {
        if (!experiences || experiences.length === 0) {
            return 0;
        }

        let stabilityScore = 0;
        const now = new Date();

        experiences.forEach(exp => {
            const startDate = new Date(exp.start_date);
            const monthsWorked = (now - startDate) / (1000 * 60 * 60 * 24 * 30);

            if (monthsWorked >= 12) stabilityScore += 3; // 1+ year
            else if (monthsWorked >= 6) stabilityScore += 2; // 6+ months
            else if (monthsWorked >= 3) stabilityScore += 1; // 3+ months
            else if (monthsWorked >= 1) stabilityScore += 0.5; // 1+ month
        });

        return Math.min(stabilityScore, 10); // Cap at 10 points
    }

    /**
     * Generate human-readable explanation of score factors
     * @param {Object} components - Score components
     * @returns {Object} - Factors explanation
     */
    generateFactorsExplanation(components) {
        const factors = {};

        if (components.savingsGoal > 0) {
            factors.savings_goal = `+${components.savingsGoal} points for having a savings goal`;
        } else {
            factors.no_savings_goal = 'Set a monthly savings goal to improve your score';
        }

        if (components.jobCount > 0) {
            factors.employment = `+${components.jobCount} points for employment status`;
        } else {
            factors.no_employment = 'Get a job to significantly improve your score';
        }

        if (components.salaryScore > 0) {
            factors.income = `+${components.salaryScore} points for regular income`;
        }

        if (components.savingsBalance > 0) {
            factors.savings_progress = `+${components.savingsBalance} points for savings progress`;
        }

        if (components.jobStability > 0) {
            factors.job_stability = `+${components.jobStability} points for job stability`;
        }

        return factors;
    }

    /**
     * Generate recommendations for improving credit score
     * @param {Object} components - Score components
     * @param {Object} wallet - User's wallet
     * @param {Array} experiences - User's experiences
     * @returns {Array} - Recommendations
     */
    generateRecommendations(components, wallet, experiences) {
        const recommendations = [];

        if (components.savingsGoal === 0) {
            recommendations.push({
                priority: 'high',
                action: 'Set a monthly savings goal',
                impact: '+5-15 points',
                description: 'Setting a savings goal shows financial planning and can significantly boost your score'
            });
        }

        if (components.jobCount === 0) {
            recommendations.push({
                priority: 'high',
                action: 'Find employment',
                impact: '+8-15 points',
                description: 'Having a job is the biggest factor in improving your credit score'
            });
        } else if (components.jobCount < 12) {
            recommendations.push({
                priority: 'medium',
                action: 'Consider a second job or side gig',
                impact: '+5-8 points',
                description: 'Multiple income sources improve financial stability'
            });
        }

        if (wallet && wallet.monthly_savings_goal > 0 && components.savingsBalance < 5) {
            recommendations.push({
                priority: 'medium',
                action: 'Increase your savings',
                impact: '+1-5 points',
                description: 'Work towards meeting your monthly savings goal'
            });
        }

        if (experiences && experiences.length > 0 && components.jobStability < 5) {
            recommendations.push({
                priority: 'low',
                action: 'Maintain job stability',
                impact: '+1-3 points',
                description: 'Longer job tenure improves your credit profile'
            });
        }

        return recommendations;
    }

    /**
     * Update credit score for a user
     * @param {String} userId - User ID
     * @returns {Object} - Updated credit score
     */
    async updateCreditScore(userId) {
        try {
            const calculation = await this.calculateCreditScore(userId);
            
            if (calculation.error) {
                return calculation;
            }

            // Get old score for comparison
            const existingCreditScore = await CreditScore.findOne({ user_id: userId });
            const oldScore = existingCreditScore ? existingCreditScore.score : this.baseScore;
            
            // Update or create credit score record
            const creditScore = await CreditScore.findOneAndUpdate(
                { user_id: userId },
                {
                    score: calculation.totalScore,
                    factors: calculation.factors,
                    last_calculated: new Date()
                },
                { 
                    upsert: true, 
                    new: true 
                }
            );

            // Send notification if score changed significantly (more than 2 points)
            if (Math.abs(calculation.totalScore - oldScore) >= 2) {
                try {
                    await NotificationService.notifyCreditScoreUpdate(userId, oldScore, calculation.totalScore);
                } catch (notificationError) {
                    console.error('Error sending credit score update notification:', notificationError);
                }
            }

            return {
                ...calculation,
                creditScore,
                updated: true,
                oldScore
            };

        } catch (error) {
            console.error('Error updating credit score:', error);
            throw error;
        }
    }

    /**
     * Bulk update credit scores for all seekers
     * @returns {Object} - Update summary
     */
    async updateAllSeekerCreditScores() {
        try {
            const seekers = await User.find({ role: 'seeker' });
            
            let updated = 0;
            let errors = 0;
            const results = [];

            for (const seeker of seekers) {
                try {
                    const result = await this.updateCreditScore(seeker._id);
                    if (!result.error) {
                        updated++;
                        results.push({
                            userId: seeker._id,
                            email: seeker.email || seeker.phone_number,
                            oldScore: result.creditScore.score,
                            newScore: result.totalScore,
                            improvement: result.totalScore - (result.creditScore.score || this.baseScore)
                        });
                    }
                } catch (error) {
                    errors++;
                    console.error(`Error updating credit score for user ${seeker._id}:`, error.message);
                }
            }

            return {
                totalSeekers: seekers.length,
                updated,
                errors,
                results: results.slice(0, 10) // Return first 10 results
            };

        } catch (error) {
            console.error('Error in bulk credit score update:', error);
            throw error;
        }
    }
}

module.exports = new CreditScoreService();