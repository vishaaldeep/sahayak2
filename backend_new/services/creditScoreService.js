const CreditScore = require('../Model/CreditScore');
const UserExperience = require('../Model/UserExperience');
const Offer = require('../Model/Offer');
// Assuming User model is needed to fetch user-specific data like saving goals
const User = require('../Model/User'); 

const calculateCreditScore = async (userId) => {
  let score = 500; // Basic initial score
  const factors = {};

  try {
    // Fetch user experiences
    const experiences = await UserExperience.find({ seeker_id: userId });
    let experienceScore = 0;
    if (experiences.length > 0) {
      // Example logic: more experience, higher score
      experienceScore = Math.min(experiences.length * 20, 200); // Max 200 points for experience
      factors.experience = experienceScore;
    }
    score += experienceScore;

    // Fetch wage offers (accepted offers indicate employability and market value)
    const acceptedOffers = await Offer.find({ seeker_id: userId, status: 'accepted' });
    let wageOfferScore = 0;
    if (acceptedOffers.length > 0) {
      // Example logic: higher average wage, higher score
      const totalWage = acceptedOffers.reduce((sum, offer) => sum + offer.offered_wage, 0);
      const averageWage = totalWage / acceptedOffers.length;
      wageOfferScore = Math.min(Math.floor(averageWage / 1000) * 10, 300); // Max 300 points for wage offers
      factors.wageOffers = wageOfferScore;
    }
    score += wageOfferScore;

    // Fetch user saving goals (assuming a 'saving_goal' field in User model or similar)
    const user = await User.findById(userId);
    let savingGoalScore = 0;
    if (user && user.saving_goal) { // Placeholder: assuming user has a saving_goal field
      // Example logic: having a saving goal adds points
      savingGoalScore = 50; 
      factors.savingGoal = savingGoalScore;
    }
    score += savingGoalScore;

    // Job payments (assuming this is tracked in UserExperience or a separate payment model)
    // For now, let's assume longer tenure in jobs contributes positively
    let jobPaymentScore = 0;
    if (experiences.length > 0) {
        const totalMonthsWorked = experiences.reduce((sum, exp) => {
            const joined = new Date(exp.date_joined);
            const left = exp.date_left ? new Date(exp.date_left) : new Date();
            return sum + (left.getFullYear() - joined.getFullYear()) * 12 + (left.getMonth() - joined.getMonth());
        }, 0);
        jobPaymentScore = Math.min(Math.floor(totalMonthsWorked / 6) * 10, 250); // Max 250 points for job payments/tenure
        factors.jobPayments = jobPaymentScore;
    }
    score += jobPaymentScore;

    // Ensure score is within 100-1000 range
    score = Math.max(100, Math.min(1000, score));

    // Update or create CreditScore record
    const creditScoreDoc = await CreditScore.findOneAndUpdate(
      { user_id: userId },
      { score, factors: JSON.stringify(factors), last_calculated: new Date() },
      { upsert: true, new: true }
    );

    // Update the User model with the new credit_score ObjectId
    await User.findByIdAndUpdate(userId, { credit_score: creditScoreDoc._id });

    return score;
  } catch (error) {
    console.error(`Error calculating credit score for user ${userId}:`, error);
    return 500; // Return a default score in case of error
  }
};

module.exports = { calculateCreditScore };