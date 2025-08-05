const mongoose = require('mongoose');
require('dotenv').config();

const enhancedService = require('./backend_new/services/enhancedJobRecommendationService');
const User = require('./backend_new/Model/User');
const Job = require('./backend_new/Model/Job');
const UserRating = require('./backend_new/Model/UserRating');
const Report = require('./backend_new/Model/Report');

async function testEnhancedRecommendations() {
    try {
        console.log('🎯 Testing Enhanced Job Recommendation Service');
        console.log('=' .repeat(60));
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak');
        console.log('✅ Connected to MongoDB');
        
        // Get database statistics
        const [seekerCount, jobCount, ratingCount, reportCount] = await Promise.all([
            User.countDocuments({ role: 'seeker' }),
            Job.countDocuments({ status: 'active' }),
            UserRating.countDocuments(),
            Report.countDocuments()
        ]);
        
        console.log('\n📊 Database Statistics:');
        console.log(`   Seekers: ${seekerCount}`);
        console.log(`   Active Jobs: ${jobCount}`);
        console.log(`   Ratings: ${ratingCount}`);
        console.log(`   Reports: ${reportCount}`);
        
        if (seekerCount === 0) {
            console.log('\n❌ No seekers found in database. Please add some test data first.');
            return;
        }
        
        if (jobCount === 0) {
            console.log('\n❌ No active jobs found in database. Please add some test jobs first.');
            return;
        }
        
        // Get a test seeker
        const testSeeker = await User.findOne({ role: 'seeker' });
        if (!testSeeker) {
            console.log('\n❌ No seeker found for testing');
            return;
        }
        
        console.log(`\n🧪 Testing with seeker: ${testSeeker.name} (${testSeeker._id})`);
        
        // Run enhanced recommendations
        console.log('\n🎯 Generating enhanced recommendations...');
        const startTime = new Date();
        
        const result = await enhancedService.generateJobRecommendations(testSeeker._id);
        
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        
        console.log(`\n⏱️  Generation completed in ${duration} seconds`);
        
        if (result.success) {
            console.log('\n✅ RECOMMENDATION RESULTS:');
            console.log(`   Total Recommendations: ${result.recommendations.length}`);
            console.log(`   Success: ${result.success}`);
            console.log(`   Message: ${result.message}`);
            
            // Display seeker profile summary
            if (result.seekerProfile) {
                console.log('\n👤 SEEKER PROFILE:');
                console.log(`   Total Jobs: ${result.seekerProfile.totalJobs}`);
                console.log(`   Credit Score: ${result.seekerProfile.creditScore}`);
                console.log(`   Total Skills: ${result.seekerProfile.totalSkills}`);
                console.log(`   Avg Monthly Income: ₹${result.seekerProfile.avgMonthlyIncome?.toLocaleString() || 0}`);
                console.log(`   Experience: ${result.seekerProfile.experienceMonths} months`);
            }
            
            // Display top recommendations with enhanced details
            if (result.recommendations.length > 0) {
                console.log('\n🏆 TOP RECOMMENDATIONS:');
                result.recommendations.slice(0, 3).forEach((rec, index) => {
                    console.log(`\n${index + 1}. ${rec.title} at ${rec.company}`);
                    console.log(`   💰 Salary: ₹${rec.salary?.toLocaleString() || 'Not specified'}`);
                    console.log(`   📍 Location: ${rec.location || 'Not specified'}`);
                    console.log(`   📊 Match Score: ${rec.matchScore}%`);
                    console.log(`   🏢 Employer Quality: ${rec.employerQuality}%`);
                    console.log(`   💵 Wage Fairness: ${rec.wageFairness}%`);
                    console.log(`   ⭐ Employer Rating: ${rec.employerRating}/5`);
                    console.log(`   ✅ Verified: ${rec.isVerifiedEmployer ? 'Yes' : 'No'}`);
                    
                    if (rec.matchReasons && rec.matchReasons.length > 0) {
                        console.log(`   ✨ Reasons: ${rec.matchReasons.join(', ')}`);
                    }
                    
                    if (rec.warnings && rec.warnings.length > 0) {
                        console.log(`   ⚠️  Warnings: ${rec.warnings.join(', ')}`);
                    }
                });
            }
            
            // Display AI analysis insights
            if (result.aiAnalysis) {
                console.log('\n🤖 AI ANALYSIS INSIGHTS:');
                console.log(`   Analysis Date: ${result.aiAnalysis.analysisDate}`);
                console.log(`   Top Match Score: ${result.aiAnalysis.topMatchScore}%`);
                console.log(`   Average Match Score: ${result.aiAnalysis.averageMatchScore}%`);
                
                if (result.aiAnalysis.keyInsights) {
                    const insights = result.aiAnalysis.keyInsights;
                    console.log('\n📈 KEY INSIGHTS:');
                    console.log(`   Average Recommended Salary: ₹${insights.averageRecommendedSalary?.toLocaleString() || 0}`);
                    console.log(`   High Match Jobs: ${insights.highMatchJobs}`);
                    console.log(`   Verified Employers: ${insights.verifiedEmployers}`);
                    console.log(`   Safe Employers: ${insights.safeEmployers}`);
                    console.log(`   Employers with Warnings: ${insights.employersWithWarnings}`);
                    console.log(`   Average Employer Rating: ${insights.avgEmployerRating}/5`);
                }
                
                if (result.aiAnalysis.employerQualityInsights) {
                    const quality = result.aiAnalysis.employerQualityInsights;
                    console.log('\n🏢 EMPLOYER QUALITY BREAKDOWN:');
                    console.log(`   Excellent Quality: ${quality.qualityDistribution.excellent}`);
                    console.log(`   Good Quality: ${quality.qualityDistribution.good}`);
                    console.log(`   Average Quality: ${quality.qualityDistribution.average}`);
                    console.log(`   Poor Quality: ${quality.qualityDistribution.poor}`);
                    console.log(`   Employers with Reports: ${quality.employersWithReports}`);
                }
            }
            
        } else {
            console.log('\n❌ RECOMMENDATION FAILED:');
            console.log(`   Message: ${result.message}`);
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Test completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run the test
console.log('🚀 Starting Enhanced Job Recommendation Test...\n');
testEnhancedRecommendations();