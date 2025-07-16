require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Job = require('../Model/jobs');
const Skill = require('../Model/skillSchema');
const User = require('../Model/users');
const UserSkill = require('../Model/userSkills');

const BASE_LNG = 76.798698;
const BASE_LAT = 30.690418;
const RADIUS_KM = 200; // Jobs within 20km of base point
const NUM_JOBS = 50;
const SKILL_LIST = [
  { name: 'JavaScript', description: 'JS development' },
  { name: 'Python', description: 'Python programming' },
  { name: 'Java', description: 'Java development' },
  { name: 'Plumbing', description: 'Plumbing work' },
  { name: 'Electrician', description: 'Electrical work' },
  { name: 'Carpentry', description: 'Woodwork and carpentry' },
  { name: 'Cooking', description: 'Cooking and kitchen work' },
  { name: 'Driving', description: 'Driving vehicles' },
  { name: 'Gardening', description: 'Gardening and landscaping' },
  { name: 'Painting', description: 'Painting walls and surfaces' },
];

function randomOffset() {
  // ~1 deg lat ~111km, 1 deg lng ~111km * cos(lat)
  const r = Math.random() * RADIUS_KM / 111; // max offset in degrees
  const theta = Math.random() * 2 * Math.PI;
  const dx = r * Math.cos(theta);
  const dy = r * Math.sin(theta);
  return { lng: BASE_LNG + dx, lat: BASE_LAT + dy };
}

async function seed() {
  await connectDB();

  // Clean up all previous data
  await Job.deleteMany({});
  await User.deleteMany({});
  await Skill.deleteMany({});

  // 1. Create skills if not present
  let skills = await Skill.find({});
  if (skills.length < SKILL_LIST.length) {
    await Skill.deleteMany({});
    skills = await Skill.insertMany(SKILL_LIST);
  }

  // 2. Create a job provider user
  let provider = await User.findOne({ email: 'provider@example.com' });
  if (!provider) {
    provider = await User.create({
      full_name: 'Provider User',
      phone_number: '9999999999',
      email: 'provider@example.com',
      password: 'password123',
      roleType: 'job provider',
    });
  }

  // 3. Create a job seeker user
  let seeker = await User.findOne({ email: 'seeker@example.com' });
  if (!seeker) {
    seeker = await User.create({
      full_name: 'Seeker User',
      phone_number: '8888888888',
      email: 'seeker@example.com',
      password: 'password123',
      roleType: 'job seeker',
    });
  }

  // 4. Assign random skills to seeker
  await UserSkill.deleteMany({ user_id: seeker._id });
  const seekerSkills = skills.sort(() => 0.5 - Math.random()).slice(0, 3);
  await Promise.all(seekerSkills.map(skill =>
    UserSkill.create({
      user_id: seeker._id,
      skill_id: skill._id,
      verified: true,
      verification_method: 'seed script',
      assessment_score: Math.floor(Math.random() * 100),
      verified_at: new Date(),
    })
  ));

  // 5. Create 50 jobs with random skills and locations
  await Job.deleteMany({ posted_by: provider._id });
  const jobs = [];
  for (let i = 0; i < NUM_JOBS; i++) {
    const skill = skills[Math.floor(Math.random() * skills.length)];
    const { lng, lat } = randomOffset();
    jobs.push({
      title: `${skill.name} Job #${i + 1}`,
      description: `Sample job for ${skill.name}`,
      location: { type: 'Point', coordinates: [lng, lat] },
      skill: skill.name,
      posted_by: provider._id,
      required_skills: [skill._id],
      wage_per_hour: 100 + Math.floor(Math.random() * 200),
      is_active: true,
      created_at: new Date(),
    });
  }
  await Job.insertMany(jobs);

  console.log('Seeded 50 jobs, 2 users, skills, and user skills.');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); }); 