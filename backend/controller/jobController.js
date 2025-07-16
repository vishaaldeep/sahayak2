
const Job = require('../Model/jobs');

// Create a new job
exports.createJob = async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).send(job);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.status(200).send(jobs);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send();
    }
    res.status(200).send(job);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Update job by ID
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) {
      return res.status(404).send();
    }
    res.status(200).send(job);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Delete job by ID
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).send();
    }
    res.status(200).send(job);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Search jobs
exports.searchJobs = async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Search query received:', query);
    const jobs = await Job.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ],
    });
    res.status(200).send(jobs);
  } catch (error) {
    console.error('Error during job search:', error);
    res.status(500).send(error);
  }
};

// Get jobs within map bounds (for heatmap)
exports.getJobsInBounds = async (req, res) => {
  try {
    const { sw, ne } = req.query; // sw: southwest, ne: northeast coordinates
    if (!sw || !ne) {
      return res.status(400).json({ error: 'Missing sw or ne query params' });
    }
    const [swLng, swLat] = sw.split(',').map(Number);
    const [neLng, neLat] = ne.split(',').map(Number);
    const jobs = await Job.find({
      location: {
        $geoWithin: {
          $box: [
            [swLng, swLat],
            [neLng, neLat]
          ]
        }
      }
    });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get jobs within a radius (in km) of a center point
exports.getJobsInRadius = async (req, res) => {
  try {
    const { center, radius } = req.query;
    if (!center || !radius) {
      return res.status(400).json({ error: 'Missing center or radius query params' });
    }
    const [lng, lat] = center.split(',').map(Number);
    const radiusInRadians = Number(radius) / 6371; // Earth's radius in km
    const jobs = await Job.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusInRadians]
        }
      }
    });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
