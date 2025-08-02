const mongoose = require('mongoose');

const userBankDetailsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user has one bank details entry
  },
  account_number: {
    type: String,
    required: true,
    trim: true,
  },
  ifsc_code: {
    type: String,
    required: true,
    trim: true,
  },
  bank_name: {
    type: String,
    required: true,
    trim: true,
  },
  account_holder_name: {
    type: String,
    required: true,
    trim: true,
  },
  upi_vpa: {
    type: String,
    trim: true,
    sparse: true, // Allows null values to not violate unique constraint if not provided
  },
  // Add any other relevant bank details here
}, { timestamps: true });

module.exports = mongoose.model('UserBankDetails', userBankDetailsSchema, 'user_bank_details');