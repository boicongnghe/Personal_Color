const mongoose = require('mongoose');

const userEventSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId: { type: String, required: true, index: true },
  event:     { type: String, enum: ['page_view', 'click', 'scroll_depth', 'session_end'], required: true },
  page:      { type: String, required: true },
  value:     { type: Number },
  metadata:  { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('UserEvent', userEventSchema);
