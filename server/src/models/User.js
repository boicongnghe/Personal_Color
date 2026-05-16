const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  displayName: String,
  avatarUrl: String,
  subscriptionTier: { type: String, enum: ['free', 'premium'], default: 'free' },
  scanCount: { type: Number, default: 0 },
  lastScanDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
