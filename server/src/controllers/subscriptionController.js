const User               = require('../models/User');
const Subscription       = require('../models/Subscription');
const { createQRPayment, PLANS } = require('../integrations/bankQR');
const expireSubscriptions = require('../utils/expireSubscriptions');

const VALID_PLANS = ['1m', '3m', '6m'];

const getSubscription = async (req, res, next) => {
  try {
    // Lazy expiry: downgrade this user if their sub has ended
    await expireSubscriptions(req.user._id);

    const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    if (!sub) {
      // Ensure User.subscriptionTier is in sync
      await User.findByIdAndUpdate(req.user._id, { subscriptionTier: 'free' });
      return res.json({ success: true, data: { tier: 'free', daysRemaining: null } });
    }

    const daysRemaining = sub.endDate
      ? Math.max(0, Math.ceil((sub.endDate - Date.now()) / 86400000))
      : null;

    res.json({
      success: true,
      data: { tier: sub.tier, plan: sub.plan, startDate: sub.startDate, endDate: sub.endDate, daysRemaining, status: sub.status },
    });
  } catch (err) {
    next(err);
  }
};

const getPlans = (_req, res) => {
  res.json({
    success: true,
    data: {
      plans: [
        { id: '1m', label: '1 tháng',  amount: PLANS['1m'].amount, duration: 30,  perMonth: PLANS['1m'].amount,            saving: 0 },
        { id: '3m', label: '3 tháng',  amount: PLANS['3m'].amount, duration: 90,  perMonth: Math.round(PLANS['3m'].amount / 3),  saving: PLANS['1m'].amount * 3 - PLANS['3m'].amount },
        { id: '6m', label: '6 tháng',  amount: PLANS['6m'].amount, duration: 180, perMonth: Math.round(PLANS['6m'].amount / 6), saving: PLANS['1m'].amount * 6 - PLANS['6m'].amount },
      ],
    },
  });
};

const createUpgrade = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const plan = VALID_PLANS.includes(req.body.plan) ? req.body.plan : '1m';
    const payment = createQRPayment({ userId: userId.toString(), plan });

    await Subscription.create({
      userId,
      tier: 'premium',
      status: 'pending',
      plan,
      txnRef: payment.orderId,
      amount: payment.amount,
    });

    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, error: 'orderId is required' });

    const pending = await Subscription.findOne({ txnRef: orderId, userId: req.user._id });
    if (!pending) return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng' });

    const planDuration = (PLANS[pending.plan] ?? PLANS['1m']).duration;
    const startDate = new Date();
    const endDate   = new Date(Date.now() + planDuration * 24 * 60 * 60 * 1000);

    await pending.updateOne({ status: 'active', startDate, endDate });
    await User.findByIdAndUpdate(req.user._id, { subscriptionTier: 'premium' });

    res.json({
      success: true,
      data: { tier: 'premium', plan: pending.plan, endDate, daysRemaining: planDuration },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSubscription, getPlans, createUpgrade, confirmPayment };
