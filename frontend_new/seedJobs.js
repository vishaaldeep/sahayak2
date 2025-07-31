
const { MongoClient, ObjectId } = require('mongodb');

// --- IMPORTANT ---
// Replace this with your MongoDB connection string and database name
const uri = 'mongodb+srv://vishaaldeepsingh6:Hl8YNecl7F9namov@cluster0.2z2jsqt.mongodb.net/';
const dbName = 'sahaayak';
// -----------------

const client = new MongoClient(uri);

const locations = [
  { city: 'Chandigarh', pincode: '160017', coordinates: { lat: 30.7333, lon: 76.7794 } },
  { city: 'Ambala', pincode: '134003', coordinates: { lat: 30.3782, lon: 76.7767 } },
  { city: 'Pinjore', pincode: '134102', coordinates: { lat: 30.7947, lon: 76.9143 } },
  { city: 'Hyderabad', pincode: '500001', coordinates: { lat: 17.3850, lon: 78.4867 } }
];

const jobPrefixes = ['Urgent Requirement for', 'Hiring', 'Looking for', 'Opening for', 'Immediate Need for'];
const jobSuffixes = ['Expert', 'Developer', 'Specialist', 'Professional', 'Consultant'];

async function seedJobs() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');

    const db = client.db(dbName);
    const skillsCollection = db.collection('skills');
    const jobsCollection = db.collection('job');

    // 1. Delete all existing jobs
    const deleteResult = await jobsCollection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing jobs.`);

    // 2. Fetch all skills
    const skills = await skillsCollection.find({}).toArray();
    if (skills.length === 0) {
      console.error('No skills found in the skills collection. Aborting job creation.');
      return;
    }
    console.log(`Found ${skills.length} skills to use for job creation.`);

    // 3. Generate 1500 new jobs
    const newJobs = [];
    for (let i = 0; i < 1500; i++) {
      const randomSkill = skills[Math.floor(Math.random() * skills.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const randomPrefix = jobPrefixes[Math.floor(Math.random() * jobPrefixes.length)];
      const randomSuffix = jobSuffixes[Math.floor(Math.random() * jobSuffixes.length)];

      const job = {
        title: `${randomPrefix} ${randomSkill.name} ${randomSuffix}`,
        description: `We are looking for a skilled ${randomSkill.name} ${randomSuffix} to join our team in ${randomLocation.city}. The ideal candidate will have a strong background in ${randomSkill.name} and be passionate about their work.`,
        location: randomLocation.city,
        pincode: randomLocation.pincode,
        coordinates: randomLocation.coordinates,
        skill_id: randomSkill._id, // Assigning the skill's ObjectId
        postedAt: new Date(),
        status: 'open',
      };
      newJobs.push(job);
    }

    // 4. Insert new jobs into the database
    if (newJobs.length > 0) {
      const insertResult = await jobsCollection.insertMany(newJobs);
      console.log(`Successfully created ${insertResult.insertedCount} new jobs.`);
    }

  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

seedJobs();
