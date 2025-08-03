const mongoose = require('mongoose');
require('dotenv').config();
const { seedAssessmentQuestions } = require('../seeders/assessmentQuestions');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const runSeeder = async () => {
  try {
    await connectDB();
    console.log('Starting assessment questions seeding...');
    await seedAssessmentQuestions();
    console.log('Assessment questions seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeder:', error);
    process.exit(1);
  }
};

runSeeder();