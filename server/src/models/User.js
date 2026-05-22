const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:        { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  googleId:     { type: String, unique: true, sparse: true },
  facebookId:   { type: String, unique: true, sparse: true },
  displayName:  String,
  avatarUrl:    String,
  subscriptionTier: { type: String, enum: ['free', 'premium'], default: 'free' },
  scanCount:        { type: Number, default: 0 },
  lastScanDate:     Date,
  bodyProfile: {
    gender:    { type: String, enum: ['female', 'male'], default: null },
    height:    Number,
    weight:    Number,
    bust:      Number,
    waist:     Number,
    hips:      Number,
    bodyType:  String,
    age:       Number,
    bodyShape: String,
    budget:    String,
    updatedAt: Date,
    personPhotoBuffer:  Buffer,
    personPhotoMime:    String,
    personPhotoUpdated: Date,
  },
  isAdmin:  { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
