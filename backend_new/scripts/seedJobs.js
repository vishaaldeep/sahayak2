require('dotenv').config({ path: './backend_new/.env' });
const mongoose = require('mongoose');
const Job = require('../Model/Job');
const Skill = require('../Model/Skill');
const connectDB = require('../config/db');
const { getCityFromCoordinates } = require('../services/geocodingService');

const jobTitles = [
  'Software Engineer',
  'Data Analyst',
  'Project Manager',
  'UX Designer',
  'DevOps Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Mobile App Developer',
  'QA Engineer',
  'Business Analyst',
  'Marketing Specialist',
  'Sales Manager',
  'HR Manager',
  'Financial Analyst',
  'Content Writer',
  'Graphic Designer',
  'Network Engineer',
  'System Administrator',
  'Cybersecurity Analyst',
];

const jobDescriptions = [
  'We are looking for a highly motivated individual to join our team.',
  'Exciting opportunity to work on cutting-edge technologies.',
  'Join a fast-paced and innovative environment.',
  'Contribute to the development of our next-generation products.',
  'Seeking a creative and passionate professional.',
];

const responsibilities = [
  'Develop and maintain web applications.',
  'Analyze data and generate insights.',
  'Manage project timelines and resources.',
  'Design user-friendly interfaces.',
  'Implement and manage CI/CD pipelines.',
];

const jobTypes = ['full_time', 'part_time', 'gig', 'contract'];
const wageTypes = ['daily', 'weekly', 'monthly', 'per_task'];

const cities = {
  Chandigarh: { lat: 30.7333, lon: 76.7794 },
  Hyderabad: { lat: 17.3850, lon: 78.4867 },
  Secunderabad: { lat: 17.4399, lon: 78.4983 },
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedJobs = async () => {
  await connectDB();

  try {
    console.log('Clearing existing jobs...');
    await Job.deleteMany({});
    console.log('Existing jobs cleared.');

    const skills = await Skill.find({});
    if (skills.length === 0) {
      console.log('No skills found. Please seed skills first.');
      return;
    }

    const jobsToCreate = [];

    for (const city in cities) {
      const { lat, lon } = cities[city];
      for (let i = 0; i < 500; i++) {
        const selectedSkills = Array.from({ length: getRandomNumber(1, 3) }, () =>
          getRandomElement(skills)._id
        );

        const jobCity = await getCityFromCoordinates(lat, lon); // Use the geocoding service

        jobsToCreate.push({
          employer_id: new mongoose.Types.ObjectId(), // Dummy employer ID
          title: getRandomElement(jobTitles),
          description: getRandomElement(jobDescriptions),
          responsibilities: getRandomElement(responsibilities),
          skills_required: selectedSkills,
          experience_required: getRandomNumber(0, 10),
          assessment_required: Math.random() > 0.5,
          number_of_openings: getRandomNumber(1, 5),
          job_type: getRandomElement(jobTypes),
          wage_type: getRandomElement(wageTypes),
          salary_min: getRandomNumber(20000, 50000),
          salary_max: getRandomNumber(50001, 100000),
          negotiable: Math.random() > 0.5,
          leaves_allowed: getRandomNumber(0, 20),
          location: `${city} - Area ${i + 1}`,
          city: jobCity, // Set the city from geocoding service
        });
      }
    }

    console.log(`Seeding ${jobsToCreate.length} jobs...`);
    await Job.insertMany(jobsToCreate);
    console.log('Jobs seeded successfully!');
  } catch (error) {
    console.error('Error seeding jobs:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedJobs();