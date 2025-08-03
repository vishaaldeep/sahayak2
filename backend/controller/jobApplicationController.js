const JobApplication = require('../Model/jobApplications');
const Job = require('../Model/jobs');
const UserSkill = require('../Model/userSkills');

// Apply for a job
exports.applyForJob = async (req, res) => {
  try {
    const { job_id } = req.body;
    const applicant_id = req.user._id;

    // Check if job exists
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user already applied
    const existingApplication = await JobApplication.findOne({ job_id, applicant_id });
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Create application
    const application = new JobApplication({
      job_id,
      applicant_id
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get applications for a job (for job providers)
exports.getJobApplications = async (req, res) => {
  try {
    const { job_id } = req.params;
    
    // Verify the job belongs to the current user
    const job = await Job.findOne({ _id: job_id, posted_by: req.user._id });
    if (!job) {
      return res.status(404).json({ error: 'Job not found or not authorized' });
    }

    const applications = await JobApplication.find({ job_id })
      .populate('applicant_id', 'full_name email phone_number')
      .populate('job_id', 'title description');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's applications (for job seekers)
exports.getUserApplications = async (req, res) => {
  try {
    const applicant_id = req.user._id;
    
    const applications = await JobApplication.find({ applicant_id })
      .populate('job_id', 'title description wage_per_hour assessment_required')
      .sort({ applied_at: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hire an applicant
exports.hireApplicant = async (req, res) => {
  try {
    const { application_id } = req.params;
    
    const application = await JobApplication.findById(application_id)
      .populate('job_id')
      .populate('applicant_id');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify the job belongs to the current user
    if (application.job_id.posted_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update application status
    application.status = 'hired';
    application.hired_at = new Date();
    await application.save();

    // If job requires assessment, assign assessment to user's skills
    if (application.job_id.assessment_required) {
      await assignAssessmentToUser(application.applicant_id._id, application.job_id.skill);
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject an applicant
exports.rejectApplicant = async (req, res) => {
  try {
    const { application_id } = req.params;
    
    const application = await JobApplication.findById(application_id)
      .populate('job_id');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify the job belongs to the current user
    if (application.job_id.posted_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update application status
    application.status = 'rejected';
    application.rejected_at = new Date();
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to assign assessment to user's skills
async function assignAssessmentToUser(userId, requiredSkill) {
  try {
    console.log(`Assigning assessment for skill: ${requiredSkill} to user: ${userId}`);
    
    // Find user's skill that matches the job requirement
    let userSkill = await UserSkill.findOne({
      user_id: userId,
      skill_name: requiredSkill
    });

    if (userSkill) {
      // Set assessment status to pending if not already completed
      if (userSkill.assessment_status === 'not_required' || userSkill.assessment_status === 'pending') {
        userSkill.assessment_status = 'pending';
        await userSkill.save();
        console.log(`Updated existing skill assessment status to pending for user: ${userId}`);
      }
    } else {
      // Create a new skill entry for the user with pending assessment
      const newUserSkill = new UserSkill({
        user_id: userId,
        skill_name: requiredSkill,
        assessment_status: 'pending',
        experience_years: 0,
        category: 'Job Required'
      });
      await newUserSkill.save();
      console.log(`Created new skill with pending assessment for user: ${userId}`);
    }
  } catch (error) {
    console.error('Error assigning assessment:', error);
    throw error;
  }
}