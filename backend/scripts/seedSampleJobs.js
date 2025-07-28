require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Job = require('../Model/jobs');
const Skill = require('../Model/skillSchema');
const User = require('../Model/users');
const UserSkill = require('../Model/userSkills');

// Bounding box for India (approximate)
const INDIA_BOUNDS = {
  minLng: 68.0,
  maxLng: 97.5,
  minLat: 7.5,
  maxLat: 35.5
};

const NUM_JOBS = 500;
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

const CHANDIGARH_LNG = 76.798698;
const CHANDIGARH_LAT = 30.690418;
const CHANDIGARH_RADIUS_KM = 80;
const NUM_CHANDIGARH_JOBS = 100;

function randomIndiaLocation() {
  const lng = INDIA_BOUNDS.minLng + Math.random() * (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng);
  const lat = INDIA_BOUNDS.minLat + Math.random() * (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat);
  return { lng, lat };
}

function randomChandigarhLocation() {
  // ~1 deg lat ~111km, 1 deg lng ~111km * cos(lat)
  const r = Math.random() * CHANDIGARH_RADIUS_KM / 111; // max offset in degrees
  const theta = Math.random() * 2 * Math.PI;
  const dx = r * Math.cos(theta);
  const dy = r * Math.sin(theta);
  return { lng: CHANDIGARH_LNG + dx, lat: CHANDIGARH_LAT + dy };
}

async function seed() {
  await connectDB();

  // 1. Ensure skills exist
  let skills = [];
  for (const skillData of SKILL_LIST) {
    let skill = await Skill.findOne({ name: skillData.name });
    if (!skill) {
      skill = await Skill.create(skillData);
    }
    skills.push(skill);
  }

  // 2. Ensure provider user exists
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

  // 3. Ensure seeker user exists
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

  // 4. Assign random skills to seeker if not already present
  const seekerSkills = skills.sort(() => 0.5 - Math.random()).slice(0, 3);
  for (const skill of seekerSkills) {
    const existing = await UserSkill.findOne({ user_id: seeker._id, skill_id: skill._id });
    if (!existing) {
      await UserSkill.create({
        user_id: seeker._id,
        skill_id: skill._id,
        verified: true,
        verification_method: 'seed script',
        assessment_score: Math.floor(Math.random() * 100),
        verified_at: new Date(),
      });
    }
  }

  // 5. Create 500 jobs with random skills and locations across India
  const jobs = [];
  for (let i = 0; i < NUM_JOBS; i++) {
    const skill = skills[Math.floor(Math.random() * skills.length)];
    const { lng, lat } = randomIndiaLocation();
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
  // Add 100 jobs near Chandigarh
  for (let i = 0; i < NUM_CHANDIGARH_JOBS; i++) {
    const skill = skills[Math.floor(Math.random() * skills.length)];
    const { lng, lat } = randomChandigarhLocation();
    jobs.push({
      title: `${skill.name} Chandigarh Job #${i + 1}`,
      description: `Sample job for ${skill.name} near Chandigarh`,
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

  console.log('Added 500 jobs across India, 100 near Chandigarh, ensured users and skills exist.');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); }); 