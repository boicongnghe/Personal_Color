const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  season: String,
  occasion: { type: String, enum: ['casual', 'office', 'party'] },
  title: String,
  description: String,
  colors: [String],
  shopLinks: [{
    platform: String,
    url: String,
    name: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Outfit', outfitSchema);
