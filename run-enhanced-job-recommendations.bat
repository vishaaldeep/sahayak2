@echo off
echo ========================================
echo Running Enhanced Job Recommendation Service
echo ========================================

cd /d "%~dp0"
cd backend_new

echo 🎯 Starting Enhanced Job Recommendation Generation...
echo.
echo ✨ NEW FEATURES INCLUDED:
echo   - Employer Details (company info, verification status)
echo   - Report Abuse History (verified and pending reports)
echo   - Wages Offered Analysis (fairness scoring)
echo   - Employer Ratings (average ratings from seekers)
echo   - Enhanced Safety Scoring
echo.

echo 📊 ENHANCED SCORING FACTORS:
echo   - Skill Match: 30% (reduced from 40%)
echo   - Location Match: 15% (reduced from 20%)
echo   - Salary Match: 20% (same)
echo   - Experience Match: 10% (same)
echo   - Employer Quality: 20% (NEW - includes ratings, reports, verification)
echo   - Wage Fairness: 5% (NEW - compares with market and employer history)
echo.

echo 🛡️ SAFETY FEATURES:
echo   - Penalties for employers with verified abuse reports
echo   - Warnings for employers with multiple pending reports
echo   - Verification status consideration
echo   - Historical wage analysis
echo.

echo 🚀 Running enhanced recommendations for all active seekers...
echo.

node -e "
const enhancedService = require('./services/enhancedJobRecommendationService');
const User = require('./Model/User');
const mongoose = require('mongoose');

async function runEnhancedRecommendations() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak');
        console.log('✅ Connected to MongoDB');
        
        // Get active seekers (last 30 days activity)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeSeekers = await User.find({
            role: 'seeker',
            \$or: [
                { updatedAt: { \$gte: thirtyDaysAgo } },
                { createdAt: { \$gte: thirtyDaysAgo } }
            ]
        }).select('_id name email').limit(10); // Limit to 10 for testing
        
        console.log(\`📊 Found \${activeSeekers.length} active seekers for enhanced recommendations\`);
        
        if (activeSeekers.length === 0) {
            console.log('ℹ️  No active seekers found. Getting all seekers...');
            const allSeekers = await User.find({ role: 'seeker' }).select('_id name email').limit(5);
            activeSeekers.push(...allSeekers);
        }
        
        let successful = 0;
        let failed = 0;
        const results = [];
        
        for (const seeker of activeSeekers) {
            try {
                console.log(\`\n🎯 Generating enhanced recommendations for: \${seeker.name}\`);
                
                const startTime = new Date();
                const recommendations = await enhancedService.generateJobRecommendations(seeker._id);
                const endTime = new Date();
                const duration = (endTime - startTime) / 1000;
                
                if (recommendations.success) {
                    successful++;
                    console.log(\`✅ Success for \${seeker.name}: \${recommendations.recommendations.length} recommendations in \${duration}s\`);
                    
                    // Show top recommendation details
                    if (recommendations.recommendations.length > 0) {
                        const topRec = recommendations.recommendations[0];
                        console.log(\`   🏆 Top Match: \${topRec.title} at \${topRec.company}\`);
                        console.log(\`   📊 Match Score: \${topRec.matchScore}%\`);
                        console.log(\`   🏢 Employer Quality: \${topRec.employerQuality}%\`);
                        console.log(\`   💰 Wage Fairness: \${topRec.wageFairness}%\`);
                        console.log(\`   ⭐ Employer Rating: \${topRec.employerRating}/5\`);
                        console.log(\`   ✅ Verified: \${topRec.isVerifiedEmployer ? 'Yes' : 'No'}\`);
                        if (topRec.warnings && topRec.warnings.length > 0) {
                            console.log(\`   ⚠️  Warnings: \${topRec.warnings.join(', ')}\`);
                        }
                    }
                    
                    results.push({
                        seeker: seeker.name,
                        status: 'success',
                        count: recommendations.recommendations.length,
                        topScore: recommendations.recommendations[0]?.matchScore || 0,
                        duration: duration
                    });
                } else {
                    failed++;
                    console.log(\`❌ No recommendations for \${seeker.name}: \${recommendations.message}\`);
                    results.push({
                        seeker: seeker.name,
                        status: 'no_matches',
                        message: recommendations.message
                    });
                }
                
                // Add delay to prevent overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                failed++;
                console.error(\`❌ Error for \${seeker.name}:\`, error.message);
                results.push({
                    seeker: seeker.name,
                    status: 'error',
                    error: error.message
                });
            }
        }
        
        console.log(\`\n📊 ENHANCED RECOMMENDATION RESULTS:\`);
        console.log(\`   Total Seekers: \${activeSeekers.length}\`);
        console.log(\`   Successful: \${successful}\`);
        console.log(\`   Failed: \${failed}\`);
        console.log(\`   Success Rate: \${Math.round((successful / activeSeekers.length) * 100)}%\`);
        
        console.log(\`\n📋 DETAILED RESULTS:\`);
        results.forEach((result, index) => {
            console.log(\`\${index + 1}. \${result.seeker}: \${result.status}\`);
            if (result.count) console.log(\`   - Recommendations: \${result.count}\`);
            if (result.topScore) console.log(\`   - Top Score: \${result.topScore}%\`);
            if (result.duration) console.log(\`   - Duration: \${result.duration}s\`);
            if (result.error) console.log(\`   - Error: \${result.error}\`);
            if (result.message) console.log(\`   - Message: \${result.message}\`);
        });
        
        await mongoose.disconnect();
        console.log(\`\n✅ Enhanced job recommendation generation completed!\`);
        
    } catch (error) {
        console.error('❌ Error running enhanced recommendations:', error);
        process.exit(1);
    }
}

runEnhancedRecommendations();
"

echo.
echo ========================================
echo Enhanced Job Recommendation Features:
echo.
echo 🏢 EMPLOYER QUALITY ANALYSIS:
echo   - Average employer ratings from previous seekers
echo   - Verification status (email, phone, documents)
echo   - Company registration details (GSTIN, etc.)
echo   - Historical job posting patterns
echo.
echo 🛡️ SAFETY & ABUSE MONITORING:
echo   - Verified abuse reports against employers
echo   - Pending abuse reports under investigation
echo   - Automatic penalties for problematic employers
echo   - Safety warnings in recommendations
echo.
echo 💰 WAGE FAIRNESS EVALUATION:
echo   - Comparison with seeker's salary expectations
echo   - Analysis against employer's historical wages
echo   - Market rate comparison
echo   - Fair wage scoring and recommendations
echo.
echo ⭐ RATING INTEGRATION:
echo   - Employer ratings from completed jobs
echo   - Seeker ratings for better matching
echo   - Rating-based employer quality scoring
echo   - Trust and reliability indicators
echo.
echo 🎯 ENHANCED MATCHING:
echo   - Multi-factor scoring algorithm
echo   - Safety-first approach to recommendations
echo   - Quality over quantity focus
echo   - Detailed match explanations
echo ========================================

pause