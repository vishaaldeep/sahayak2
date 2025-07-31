const UserExperience = require('../Model/UserExperience');

exports.addExperience = async (req, res) => {
  try {
    const { seeker_id, job_description, description, date_joined, date_left, location } = req.body;

    const newExperience = new UserExperience({
      seeker_id,
      job_description,
      description,
      date_joined,
      date_left,
      location,
      job_id: null, // Manually added experience has null job_id
    });

    await newExperience.save();
    res.status(201).json({ message: 'Experience added successfully', experience: newExperience });
  } catch (error) {
    res.status(500).json({ message: 'Error adding experience', error: error.message });
  }
};

exports.getCurrentJobs = async (req, res) => {
  try {
    const { seekerId } = req.params;
    const currentJobs = await UserExperience.find({ seeker_id: seekerId, date_left: null }).populate('job_id');
    res.status(200).json(currentJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current jobs', error: error.message });
  }
};

exports.leaveJob = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const experience = await UserExperience.findById(experienceId);

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found.' });
    }

    if (experience.date_left) {
      return res.status(400).json({ message: 'Job already left.' });
    }

    experience.date_left = new Date();
    await experience.save();

    // Optionally, update the corresponding UserApplication status to 'left' if it exists
    if (experience.job_id) {
      const UserApplication = require('../Model/UserApplication'); // Import here to avoid circular dependency
      await UserApplication.findOneAndUpdate(
        { seeker_id: experience.seeker_id, job_id: experience.job_id },
        { status: 'left', date_left: new Date() }
      );
    }

    res.status(200).json({ message: 'Job left successfully', experience });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving job', error: error.message });
  }
};

exports.raiseIssue = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const { issueDescription } = req.body;
    // In a real application, you would save this issue to a database,
    // notify an admin, etc.
    console.log(`Issue raised for experience ${experienceId}: ${issueDescription}`);
    res.status(200).json({ message: 'Issue raised successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error raising issue', error: error.message });
  }
};