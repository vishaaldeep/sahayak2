const UserJob = require('../Model/UserJob');
const Job = require('../Model/Job');
const User = require('../Model/User');

// Seeker actions
exports.applyForJob = async (req, res) => {
    try {
        const { user_id, job_id } = req.body;
        const newApplication = new UserJob({
            user_id,
            job_id,
            status: 'applied',
            date_applied: new Date()
        });
        await newApplication.save();
        res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
    } catch (error) {
        res.status(500).json({ message: 'Error applying for job', error: error.message });
    }
};

exports.negotiateOffer = async (req, res) => {
    try {
        const { userJob_id, new_terms } = req.body;
        // Logic for negotiation (e.g., update UserJob status, add negotiation details)
        // This is a placeholder. Actual negotiation might involve more complex state management.
        const userJob = await UserJob.findById(userJob_id);
        if (!userJob) {
            return res.status(404).json({ message: 'UserJob entry not found' });
        }
        // Example: update feedback or a custom negotiation field
        userJob.feedback = `Negotiation initiated with terms: ${JSON.stringify(new_terms)}`;
        await userJob.save();
        res.status(200).json({ message: 'Negotiation initiated', userJob });
    } catch (error) {
        res.status(500).json({ message: 'Error negotiating offer', error: error.message });
    }
};

exports.recommendJob = async (req, res) => {
    try {
        const { job_id, peer_phone_number } = req.body;
        // Logic to recommend job to a peer (e.g., send SMS, email, or internal notification)
        // This would typically involve an external service or a notification system.
        res.status(200).json({ message: `Job ${job_id} recommended to ${peer_phone_number}` });
    } catch (error) {
        res.status(500).json({ message: 'Error recommending job', error: error.message });
    }
};

// Provider actions
exports.viewApplications = async (req, res) => {
    try {
        const { job_id } = req.params; // Assuming job_id is passed as a URL parameter
        const applications = await UserJob.find({ job_id }).populate('user_id', 'name email'); // Populate user details
        res.status(200).json({ applications });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
};

exports.hireSeeker = async (req, res) => {
    try {
        const { userJob_id } = req.body;
        const userJob = await UserJob.findById(userJob_id);
        if (!userJob) {
            return res.status(404).json({ message: 'UserJob entry not found' });
        }
        userJob.status = 'hired';
        userJob.date_of_joining = new Date(); // Set date of joining upon hiring
        await userJob.save();
        res.status(200).json({ message: 'Seeker hired successfully', userJob });
    } catch (error) {
        res.status(500).json({ message: 'Error hiring seeker', error: error.message });
    }
};
