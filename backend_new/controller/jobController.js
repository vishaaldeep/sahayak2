const Job = require('../Model/Job');
const { getCityFromCoordinates } = require('../services/geocodingService');
const userSkillService = require('../services/userSkillService');
const NotificationService = require('../services/notificationService');

exports.getAllJobs = async (req, res) => {
    try {
        const { latitude, longitude, userId, showArchived } = req.query;
        let query = {};

        if (showArchived === 'true') {
            // If showArchived is true, fetch only archived jobs
            query.is_archived = true;
        } else {
            // By default, only fetch non-archived jobs
            query.is_archived = false;
        }

        // Temporarily commenting out location and skill filters for debugging
        /*
        // Filter by skills if userId is provided
        if (userId) {
            const userSkills = await userSkillService.getUserSkills(userId);
            const userSkillIds = userSkills.map(us => us.skill_id._id);
            if (userSkillIds.length > 0) {
                query.skills_required = { $in: userSkillIds };
            }
        }
        console.log('==================================');
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
        console.log('==================================');
        // Filter by location if latitude and longitude are provided
        if (latitude && longitude) {
            const maxDistance = 55000; // Default to 25 km radius
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: maxDistance
                }
            };
            console.log('==================================');
            console.log('Query:', query.location);
            console.log('==================================');
        }
        */

        const jobs = await Job.find(query).populate('employer_id', 'name email phone_number false_accusation_count abuse_true_count');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
};

exports.createJob = async (req, res) => {
    try {
        const { city, location, ...jobData } = req.body;

        if (!location || !location.type || !location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({ message: 'Location (type and coordinates) is required for job creation.' });
        }

        jobData.location = location;
        
        if (city) {
            jobData.city = city;
        } else {
            // Fallback to derive city from coordinates if not provided directly
            jobData.city = await getCityFromCoordinates(location.coordinates[1], location.coordinates[0]);
        }

        const newJob = new Job(jobData);
        await newJob.save();
        
        // Populate skills_required for notification
        await newJob.populate('skills_required', 'name');
        
        // Send notifications to matching seekers
        try {
            await NotificationService.notifyJobMatch(newJob);
        } catch (notificationError) {
            console.error('Error sending job match notifications:', notificationError);
            // Don't fail job creation if notification fails
        }
        
        res.status(201).json({ message: 'Job created successfully', job: newJob });
    } catch (error) {
        res.status(500).json({ message: 'Error creating job', error: error.message });
    }
};

exports.getJobsInRadius = async (req, res) => {
    try {
        const { center, radius } = req.query;
        const [longitude, latitude] = center.split(',').map(parseFloat);
        const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters

        const jobs = await Job.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: radiusInMeters,
                },
            },
        }).populate({
            path: 'employer_id',
            select: 'name email phone_number false_accusation_count abuse_true_count',
            populate: {
                path: 'employer_profile',
                model: 'Employer',
                select: 'company_name company_type gstin_number is_verified'
            }
        });

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs in radius', error: error.message });
    }
};