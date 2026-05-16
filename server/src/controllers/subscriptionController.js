const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { createPaymentUrl, verifyCallback } = require('../integrations/vnpay');

const getSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    if (!sub) return res.json({ success: true, data: { tier: 'free', daysRemaining: null } });

    const daysRemaining = sub.endDate
      ? Math.max(0, Math.ceil((sub.endDate - Date.now()) / 86400000))
      : null;

    res.json({
      success: true,
      data: { tier: sub.tier, startDate: sub.startDate, endDate: sub.endDate, daysRemaining, status: sub.status },
    });
  } catch (err) {
    next(err);
  }
};

const createUpgrade = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const ipAddr = (req.headers['x-forwarded-for'] || req.ip || '127.0.0.1').split(',')[0].trim();

    const { paymentUrl, txnRef } = createPaymentUrl({ userId: userId.toString(), ipAddr });

    await Subscription.create({ userId, tier: 'premium', status: 'pending', txnRef });

    res.json({ success: true, data: { paymentUrl } });
  } catch (err) {
    next(err);
  }
};

const handleCallback = async (req, res, next) => {
  try {
    const result = verifyCallback(req.query);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (result.success) {
      const sub = await Subscription.findOneAndUpdate(
        { txnRef: result.txnRef },
        { status: 'active', startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        { returnDocument: 'after' }
      );
      if (sub) await User.findByIdAndUpdate(sub.userId, { subscriptionTier: 'premium' });
      return res.redirect(`${clientUrl}/upgrade-success`);
    }

    const txnRef = result.txnRef || req.query.vnp_TxnRef;
    if (txnRef) await Subscription.findOneAndUpdate({ txnRef }, { status: 'failed' });
    res.redirect(`${clientUrl}/upgrade-failed`);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSubscription, createUpgrade, handleCallback };
