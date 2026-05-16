const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scanDate: { type: Date, default: Date.now },
  season: { type: String, required: true },
  undertone: { type: String, enum: ['warm', 'cool', 'neutral'] },
  faceShape: { type: String, enum: ['oval', 'round', 'square', 'heart', 'oblong', 'diamond'] },
  bodyType: { type: String, enum: ['hourglass', 'pear', 'rectangle', 'inverted-triangle', 'apple'] },
  accuracy: Number,
  rawMetrics: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);
