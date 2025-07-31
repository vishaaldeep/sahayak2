
const { MongoClient } = require('mongodb');

// --- IMPORTANT ---
// Replace this with your MongoDB connection string and database name
const uri = 'mongodb+srv://vishaaldeepsingh6:Hl8YNecl7F9namov@cluster0.2z2jsqt.mongodb.net/';
const dbName = 'sahaayak';
// -----------------

const client = new MongoClient(uri);

async function assignRandomSkills() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');

    const db = client.db(dbName);
    const skillsCollection = db.collection('skills');
    const jobsCollection = db.collection('job');

    // 1. Fetch all skill IDs
    const skills = await skillsCollection.find({}, { projection: { _id: 1 } }).toArray();
    const skillIds = skills.map(skill => skill._id);

    if (skillIds.length === 0) {
      console.error('No skills found in the skills collection. Aborting.');
      return;
    }
    console.log(`Found ${skillIds.length} skills.`);

    // 2. Fetch all jobs
    const jobs = await jobsCollection.find({}, { projection: { _id: 1 } }).toArray();
    if (jobs.length === 0) {
      console.error('No jobs found in the jobs collection. Aborting.');
      return;
    }
    console.log(`Found ${jobs.length} jobs to update.`);

    // 3. Iterate and update each job with a random skill ID
    const updatePromises = jobs.map(job => {
      const randomSkillId = skillIds[Math.floor(Math.random() * skillIds.length)];
      return jobsCollection.updateOne(
        { _id: job._id },
        { $set: { skill_id: randomSkillId } }
      );
    });

    await Promise.all(updatePromises);

    console.log(`Successfully updated ${jobs.length} jobs with random skill IDs.`);

  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

assignRandomSkills();
