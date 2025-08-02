const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // The user who should receive this notification
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for efficient lookup by recipient
  },
  // The type of notification (e.g., 'job_application', 'loan_approved', 'tool_request', 'report_resolved')
  type: {
    type: String,
    required: true
  },
  // A short, human-readable message for the notification
  message: {
    type: String,
    required: true
  },
  // Optional: Link to a specific entity related to the notification
  // This allows clicking on the notification to go to the relevant page
  entity_type: {
    type: String,
    enum: ['job', 'application', 'loan_offer', 'investor_proposal', 'tool', 'tool_loan', 'report', 'user', null],
    default: null
  },
  entity_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entity_type', // Dynamic reference based on entity_type
    default: null
  },
  // Optional: ID of the user who triggered the notification (e.g., employer for a job application)
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Status of the notification
  read: {
    type: Boolean,
    default: false
  },
  // Timestamp of when the notification was created
  created_at: {
    type: Date,
    default: Date.now,
    index: true // Index for sorting by recency
  },
  // Optional: Additional data relevant to the notification type
  // This can store JSON objects with specific details for the frontend to render
  metadata: {
    type: mongoose.Schema.Types.Mixed // Allows flexible data structure
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
