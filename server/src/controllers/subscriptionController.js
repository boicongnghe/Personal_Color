const User = require('../models/User');
const Subscription = require('../models/Subscription');

const getSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.params.userId, status: 'active' });
    const user = await User.findById(req.params.userId).select('subscriptionTier');
    let daysRemaining = 0;
    if (sub?.endDate) {
      daysRemaining = Math.max(0, Math.ceil((sub.endDate - Date.now()) / 86400000));
    }
    res.json({ success: true, data: { tier: user?.subscriptionTier || 'free', daysRemaining } });
  } catch (err) {
    next(err);
  }
};

const createUpgradePayment = async (req, res, next) => {
  try {
    // TODO: build VNPay URL via vnpay.js integration
    res.json({ success: true, data: { paymentUrl: '' } });
  } catch (err) {
    next(err);
  }
};

const paymentCallback = async (req, res, next) => {
  try {
    // TODO: verify VNPay signature, upgrade user
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSubscription, createUpgradePayment, paymentCallback };
