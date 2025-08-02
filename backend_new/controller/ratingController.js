const UserRating = require('../Model/UserRating');
const User = require('../Model/User'); // Import User model

exports.createOrUpdateRating = async (req, res) => {
  try {
    const { giver_user_id, receiver_user_id, rating, comments, job_id, role_of_giver } = req.body;

    if (!giver_user_id || !receiver_user_id || !rating || !job_id || !role_of_giver) {
      return res.status(400).json({ message: 'Missing required rating fields.' });
    }

    let userRating = await UserRating.findOne({
      giver_user_id,
      receiver_user_id,
      job_id,
    });

    if (userRating) {
      // Check if already updated once
      if (userRating.updated_at.getTime() !== userRating.created_at.getTime()) {
        return res.status(403).json({ message: 'Rating can only be edited once.' });
      }
      // Update existing rating
      userRating.rating = rating;
      userRating.comments = comments;
      userRating.updated_at = new Date(); // Mark as updated
      await userRating.save();
      res.status(200).json({ message: 'Rating updated successfully.', userRating });
    } else {
      // Create new rating
      const newRating = new UserRating({
        giver_user_id,
        receiver_user_id,
        rating,
        comments,
        job_id,
        role_of_giver,
        role_of_receiver: req.user.role === 'seeker' ? 'provider' : 'seeker', // Determine receiver role based on giver
      });
      userRating = await newRating.save();
      res.status(201).json({ message: 'Rating created successfully.', userRating });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating or updating rating.', error: error.message });
  }
};

exports.getRating = async (req, res) => {
  try {
    const { jobId, giverId, receiverId } = req.params;
    const userRating = await UserRating.findOne({
      job_id: jobId,
      giver_user_id: giverId,
      receiver_user_id: receiverId,
    });
    if (!userRating) {
      return res.status(404).json({ message: 'Rating not found.' });
    }
    res.status(200).json(userRating);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rating.', error: error.message });
  }
};
