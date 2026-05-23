const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:   { type: String },
  userEmail:  { type: String },
  message:    { type: String, required: true, trim: true },
  adminReply: { type: String, default: null },
  status:     { type: String, enum: ['pending', 'replied'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
