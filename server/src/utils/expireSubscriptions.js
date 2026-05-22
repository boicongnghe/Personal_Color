const Subscription = require('../models/Subscription');
const User         = require('../models/User');

/**
 * Expire overdue subscriptions and downgrade affected users to free.
 * Pass userId to check a single user (lazy check), omit to sweep all users.
 */
async function expireSubscriptions(userId = null) {
  try {
    const query = { status: 'active', endDate: { $lt: new Date() } };
    if (userId) query.userId = userId;

    const expired = await Subscription.find(query).select('userId');
    if (expired.length === 0) return;

    const expiredIds = expired.map(s => s._id);
    const userIds    = [...new Set(expired.map(s => s.userId.toString()))];

    await Subscription.updateMany({ _id: { $in: expiredIds } }, { $set: { status: 'expired' } });

    for (const uid of userIds) {
      const stillActive = await Subscription.exists({
        userId: uid,
        status: 'active',
        endDate: { $gt: new Date() },
      });
      if (!stillActive) {
        await User.findByIdAndUpdate(uid, { subscriptionTier: 'free' });
      }
    }

    console.log(`[subscription] Expired ${expired.length} subscription(s), downgraded ${userIds.length} user(s)`);
  } catch (err) {
    console.error('[subscription] expireSubscriptions error:', err.message);
  }
}

module.exports = expireSubscriptions;
