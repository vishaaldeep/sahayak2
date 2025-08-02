const UserApplication = require('../Model/UserApplication');
const UserExperience = require('../Model/UserExperience');
const Job = require('../Model/Job');
const UserJob = require('../Model/UserJob'); // Import UserJob model

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
