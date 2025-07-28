const mongoose = require('mongoose');
const FDInterestRate = require('./Model/FDInterestRate');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedFDInterestRates = async () => {
  await connectDB();

  try {
    await FDInterestRate.deleteMany({});
    console.log('Existing FD interest rates cleared.');

    const rates = [
      { bankName: 'State Bank of India', minYears: 1, maxYears: 2, interestRate: 6.5 },
      { bankName: 'State Bank of India', minYears: 2, maxYears: 5, interestRate: 7.0 },
      { bankName: 'State Bank of India', minYears: 5, maxYears: 10, interestRate: 7.5 },
      { bankName: 'HDFC Bank', minYears: 1, maxYears: 2, interestRate: 6.8 },
      { bankName: 'HDFC Bank', minYears: 2, maxYears: 5, interestRate: 7.3 },
      { bankName: 'HDFC Bank', minYears: 5, maxYears: 10, interestRate: 7.8 },
      { bankName: 'ICICI Bank', minYears: 1, maxYears: 2, interestRate: 6.7 },
      { bankName: 'ICICI Bank', minYears: 2, maxYears: 5, interestRate: 7.2 },
      { bankName: 'ICICI Bank', minYears: 5, maxYears: 10, interestRate: 7.7 },
    ];

    await FDInterestRate.insertMany(rates);
    console.log('FD interest rates seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding FD interest rates:', error);
    process.exit(1);
  }
};

seedFDInterestRates();