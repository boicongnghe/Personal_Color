const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tier: { type: String, enum: ['free', 'premium'], default: 'free' },
  startDate: Date,
  endDate: Date,
  plan: { type: String, enum: ['1m', '3m', '6m'], default: '1m' },
  txnRef: String,
  paymentRef: String,
  amount: Number,
  status: { type: String, enum: ['pending', 'active', 'expired', 'cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
