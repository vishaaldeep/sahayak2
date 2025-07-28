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
  language: { type: String, default: 'en' },
  notification_settings: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 