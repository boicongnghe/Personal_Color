const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.subscriptionTier !== 'premium') {
      return res.status(403).json({ success: false, error: 'Premium subscription required' });
    }
    next();
  } catch {
    return res.status(500).json({ success: false, error: 'Subscription check failed' });
  }
};
