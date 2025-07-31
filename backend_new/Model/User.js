const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true }, // [lng, lat]
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone_number: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  address: { type: String }, // Added address field
  role: { type: String, enum: ['provider', 'seeker', 'investor'], required: true },
  password: { type: String, required: true },
  location: locationSchema,
  city: { type: String },
  language: { type: String, default: 'en' },
  notification_settings: { type: Object, default: {} },
}, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } });

userSchema.virtual('employer_profile', {
  ref: 'Employer',
  localField: '_id',
  foreignField: 'user_id',
  justOne: true
});

userSchema.virtual('experiences', {
  ref: 'UserExperience',
  localField: '_id',
  foreignField: 'seeker_id',
  justOne: false // A user can have multiple experiences
});

module.exports = mongoose.model('User', userSchema); 