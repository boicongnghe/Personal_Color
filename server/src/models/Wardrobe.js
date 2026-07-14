const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  color: String,
  category: { type: String, default: 'Áo' },
  imageUrl: String,
  addedAt: { type: Date, default: Date.now },
  seasons: [String],
  occasions: [String],
  compatibilityScore: { type: Number, min: 0, max: 100 },
  compatibilityLabel: String,
  compatibilityReason: String,
  clothingPhotoBuffer: Buffer,
  clothingPhotoMime:   String,
});

const wardrobeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [itemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Wardrobe', wardrobeSchema);
