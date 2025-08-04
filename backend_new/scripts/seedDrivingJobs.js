
require('dotenv').config();
const mongoose = require('mongoose');

const Job = require('../Model/Job');
const Skill = require('../Model/Skill');
const User = require('../Model/User');

const CHANDIGARH_COORDINATES = [76.7794, 30.7333];
const NUM_JOBS = 50;

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://vishaaldeepsingh6:Hl8YNecl7F9namov@cluster0.2z2jsqt.mongodb.net/sahaayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedDrivingJobs() {
  await connectDB();

  try {
    // 1. Find the employer user
    const employer = await User.findOne({ email: 'provider@example.com' });
    if (!employer) {
      console.error('Employer with email "provider@example.com" not found.');
      return;
    }

    // 2. Find the "Driving" skill
    const drivingSkill = await Skill.findOne({ name: 'driving' });
    if (!drivingSkill) {
      console.error('Skill "Driving" not found.');
      return;
    }

    // 3. Create 50 driving jobs in Chandigarh
    const jobs = [];
    for (let i = 0; i < NUM_JOBS; i++) {
      jobs.push({
        employer_id: employer._id,
        title: `Driving Job ${i + 1}`,
        description: `This is a driving job in Chandigarh.`,
        responsibilities: 'Safely operate a vehicle to transport goods or people.',
        skills_required: [drivingSkill._id],
        experience_required: 2, // 2 years of experience
        number_of_openings: 1,
        job_type: 'full_time',
        wage_type: 'monthly',
        salary_min: 15000,
        salary_max: 25000,
        city: 'Chandigarh',
        location: {
          type: 'Point',
          coordinates: CHANDIGARH_COORDINATES,
        },
      });
    }

    await Job.insertMany(jobs);
    console.log(`Successfully seeded ${NUM_JOBS} driving jobs in Chandigarh.`);
  } catch (error) {
    console.error('Error seeding driving jobs:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedDrivingJobs();
