const UserApplication = require('../Model/UserApplication');
const UserExperience = require('../Model/UserExperience');
const Job = require('../Model/Job');
const UserJob = require('../Model/UserJob'); // Import UserJob model
const UserSkill = require('../Model/UserSkill');
const Skill = require('../Model/Skill');
const Assessment = require('../Model/Assessment');
const AssessmentQuestion = require('../Model/AssessmentQuestion');

exports.createApplication = async (req, res) => {
  try {
    const { seeker_id, job_id } = req.body;

    // Check if application already exists
    const existingApplication = await UserApplication.findOne({ seeker_id, job_id });
    if (existingApplication) {
      return res.status(400).json({ message: 'User already applied for this job.' });
    }

    const newApplication = new UserApplication({ seeker_id, job_id });
    await newApplication.save();
    res.status(201).json({ message: 'Application created successfully', application: newApplication });
  } catch (error) {
    res.status(500).json({ message: 'Error creating application', error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await UserApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const oldStatus = application.status;
    application.status = status;

    if (status === 'hired' && oldStatus !== 'hired') {
      application.date_hired = new Date();

      // Increment openings_hired instead of decrementing number_of_openings
      const job = await Job.findById(application.job_id);
      if (job) {
        job.openings_hired += 1;
        if (job.openings_hired >= job.number_of_openings) {
          job.is_archived = true;
        }
        await job.save();
      }

      // Create UserExperience entry
      const newExperience = new UserExperience({
        seeker_id: application.seeker_id,
        job_id: application.job_id,
        date_joined: application.date_hired,
        job_description: job ? job.description : '', // Assuming job description from Job model
        location: job ? job.location.coordinates.toString() : '', // Assuming location from Job model
      });
      await newExperience.save();

      // If job requires assessment, assign assessment to user's skills
      if (job && job.assessment_required) {
        await assignAssessmentToUser(application.seeker_id, job.skills_required, job._id, job.employer_id);
      }

    } else if (status === 'discussion' && oldStatus !== 'discussion') {
      application.date_discussion = new Date();
    } else if (status === 'negotiation' && oldStatus !== 'negotiation') {
      application.date_negotiation = new Date();
    } else if (status === 'rejected' && oldStatus !== 'rejected') {
      application.date_rejected = new Date();
    } else if (status === 'left' && oldStatus !== 'left') {
      application.date_left = new Date();
      // Update UserExperience entry with date_left
      const experience = await UserExperience.findOne({ seeker_id: application.seeker_id, job_id: application.job_id });
      console.log('updateApplicationStatus (left): Found experience:', experience);
      if (experience) {
        experience.date_left = new Date();
        await experience.save();
        console.log('updateApplicationStatus (left): Experience after saving date_left:', experience);
      }
    } else if (status === 'fired' && oldStatus !== 'fired') {
      application.date_fired = new Date();
      // Update UserExperience entry with date_left (assuming fired also means leaving the job)
      const experience = await UserExperience.findOne({ seeker_id: application.seeker_id, job_id: application.job_id });
      console.log('updateApplicationStatus (fired): Found experience:', experience);
      if (experience) {
        experience.date_left = new Date(); // Set date_left for fired status as well
        await experience.save();
        console.log('updateApplicationStatus (fired): Experience after saving date_left:', experience);
      }
    }

    await application.save();
    res.status(200).json({ message: 'Application status updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
};

exports.getApplicationsByEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;
    const jobs = await Job.find({ employer_id: employerId });
    const jobIds = jobs.map(job => job._id);
    let applications = await UserApplication.find({ job_id: { $in: jobIds } })
      .populate({
        path: 'seeker_id',
        select: 'name email phone_number false_accusation_count abuse_true_count',
        populate: {
          path: 'experiences',
          model: 'UserExperience'
        }
      })
      .populate('job_id', 'title');

    // Fetch UserJob details for each application
    applications = await Promise.all(applications.map(async (app) => {
      const userJob = await UserJob.findOne({ seeker_id: app.seeker_id._id, job_id: app.job_id._id });
      return { ...app.toObject(), userJob };
    }));

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications for employer', error: error.message });
  }
};

exports.getApplicationsBySeeker = async (req, res) => {
  try {
    const { seekerId } = req.params;
    const applications = await UserApplication.find({ seeker_id: seekerId })
      .populate('job_id') // Populate all job details
      .populate({ 
        path: 'job_id',
        populate: { 
          path: 'employer_id',
          select: 'name email phone_number false_accusation_count abuse_true_count',
          populate: {
            path: 'employer_profile',
            model: 'Employer',
            select: 'company_name'
          }
        }
      });
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications for seeker:', error);
    res.status(500).json({ message: 'Error fetching applications for seeker', error: error.message });
  }
};

// Helper function to assign assessment to user's skills
async function assignAssessmentToUser(userId, requiredSkillIds, jobId, assignedBy) {
  try {
    console.log(`Assigning assessment for skills to user: ${userId}`);
    
    if (!requiredSkillIds || requiredSkillIds.length === 0) {
      console.log('No required skills specified for this job');
      return;
    }

    for (const skillId of requiredSkillIds) {
      // Find user's skill that matches the job requirement
      let userSkill = await UserSkill.findOne({
        user_id: userId,
        skill_id: skillId
      });

      if (userSkill) {
        // Set assessment status to pending if not already completed
        if (userSkill.assessment_status === 'not_required' || userSkill.assessment_status === 'pending') {
          userSkill.assessment_status = 'pending';
          await userSkill.save();
          console.log(`Updated existing skill assessment status to pending for user: ${userId}, skill: ${skillId}`);
        }
      } else {
        // Create a new skill entry for the user with pending assessment
        const newUserSkill = new UserSkill({
          user_id: userId,
          skill_id: skillId,
          assessment_status: 'pending',
          experience_years: 0,
          category: ['Job Required']
        });
        await newUserSkill.save();
        console.log(`Created new skill with pending assessment for user: ${userId}, skill: ${skillId}`);
      }

      // Create Assessment record for the AssessmentModal to find
      await createAssessmentRecord(userId, skillId, jobId, assignedBy);
    }
  } catch (error) {
    console.error('Error assigning assessment:', error);
    throw error;
  }
}

// Helper function to create Assessment record
async function createAssessmentRecord(userId, skillId, jobId, assignedBy) {
  try {
    // Check if assessment already exists
    const existingAssessment = await Assessment.findOne({
      user_id: userId,
      skill_id: skillId,
      job_id: jobId,
      status: { $in: ['assigned', 'in_progress'] }
    });

    if (existingAssessment) {
      console.log(`Assessment already exists for user: ${userId}, skill: ${skillId}, job: ${jobId}`);
      return;
    }

    // Get unique random questions for the skill
    const allQuestions = await AssessmentQuestion.find({ skill_id: skillId });
    
    if (allQuestions.length === 0) {
      console.log(`No questions available for skill: ${skillId}`);
      return;
    }

    // Use available questions (even if less than 50) but ensure uniqueness
    const questionCount = Math.min(allQuestions.length, 50);
    const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, questionCount);

    // Create assessment
    const assessment = new Assessment({
      user_id: userId,
      skill_id: skillId,
      job_id: jobId,
      assigned_by: assignedBy,
      total_questions: questionCount,
      questions: selectedQuestions.map(q => ({
        question_id: q._id,
        selected_option: null,
        is_correct: null
      }))
    });

    await assessment.save();
    console.log(`Created assessment record for user: ${userId}, skill: ${skillId}, job: ${jobId}`);
  } catch (error) {
    console.error('Error creating assessment record:', error);
    // Don't throw error here to avoid breaking the hiring process
  }
}
