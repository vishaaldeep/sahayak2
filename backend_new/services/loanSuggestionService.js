
const LoanSuggestion = require('../Model/LoanSuggestion');
const User = require('../Model/User');
const CreditScore = require('../Model/creditScore');
const axios = require('axios');
const fluent = require('fluent-logger');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

const fetchBusinessFromMaps = async (userLocation) => {
  console.log('Attempting to fetch business from Google Maps...');
  
  try {
    console.log('GOOGLE_PLACES_API_KEY:', GOOGLE_PLACES_API_KEY);
    if (!GOOGLE_PLACES_API_KEY) {
      console.error('GOOGLE_PLACES_API_KEY is not set in environment variables.');
      
      return { name: 'Generic Local Business', purpose: 'General business expansion' };
    }

    if (!userLocation || !userLocation.coordinates || userLocation.coordinates.length < 2) {
      console.warn('User location coordinates are missing or invalid. Using a generic business.');
      
      return { name: 'Generic Local Business', purpose: 'General business expansion' };
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        key: GOOGLE_PLACES_API_KEY,
        location: `${userLocation.coordinates[1]},${userLocation.coordinates[0]}`, // lat,lng
        radius: 5000,
        type: 'point_of_interest',
        types: 'electronics_store|restaurant|bakery|car_wash|car_repair|gas_station',
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const businesses = response.data.results;
      const selectedBusiness = businesses[0];
      const businessPurpose = `Start or expand a business related to ${selectedBusiness.name || 'a local establishment'}.`;

      console.log('Successfully fetched business from Google Maps:', selectedBusiness.name);
      

      return {
        name: selectedBusiness.name,
        purpose: businessPurpose,
      };
    } else {
      console.log('No businesses found near the user location. Using a generic business.');
      
      return { name: 'Generic Local Business', purpose: 'General business expansion' };
    }
  } catch (error) {
    console.error('Error fetching business from Google Maps API:', error.message);
    
    return { name: 'Generic Local Business', purpose: 'General business expansion' };
  }
};

const generateLoanSuggestion = async (userId) => {
  console.log(`Generating loan suggestion for user ${userId}...`);
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User with ID ${userId} not found.`);
      
      return null;
    }

    const creditScoreDoc = await CreditScore.findOne({ userId });
    const creditScore = creditScoreDoc ? creditScoreDoc.creditScore : 0;
    const monthlySavings = user.monthlySavings || 0;

    console.log(`User ${userId} details: Credit Score = ${creditScore}, Monthly Savings = ${monthlySavings}`);
    

    console.log('============================================');
    console.log(`User ${userId} location:`, user.location);
    console.log('============================================');
    const business = await fetchBusinessFromMaps(user.location);

    const loanTermYears = 5;
    const baseInterestRate = 0.10;

    let suggestedAmount = 0;

    if (creditScore >= 80) {
      suggestedAmount += 500000;
    } else if (creditScore >= 60) {
      suggestedAmount += 200000;
    } else {
      suggestedAmount += 50000;
    }

    suggestedAmount += monthlySavings * 12 * loanTermYears;


    const newLoanSuggestion = new LoanSuggestion({
      userId,
      businessName: business.name,
      businessPurpose: business.purpose,
      suggestedAmount: Math.round(suggestedAmount / 1000) * 1000,
      loanTermYears,
      interestRate: baseInterestRate,
      creditScoreAtSuggestion: creditScore,
      monthlySavingsAtSuggestion: monthlySavings,
    });

    console.log(`Attempting to save loan suggestion for user ${userId}:`, newLoanSuggestion);
    await newLoanSuggestion.save();
    console.log(`Loan suggestion saved successfully for user ${userId}:`, newLoanSuggestion);
    
    return newLoanSuggestion;
  } catch (error) {
    console.error(`Error generating loan suggestion for user ${userId}:`, error.message);
    
    return null;
  }
};

module.exports = { generateLoanSuggestion };
