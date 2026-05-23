const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
  role:     { type: String, enum: ['user', 'ai'], required: true },
  text:     String,
  analysis: mongoose.Schema.Types.Mixed,
}, { _id: false });

const convSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:  { type: String, default: 'Cuộc trò chuyện mới', maxlength: 100 },
  messages: [msgSchema],
}, { timestamps: true });

module.exports = mongoose.model('Conversation', convSchema);
