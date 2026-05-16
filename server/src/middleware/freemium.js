const requirePremium = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (user.subscriptionTier !== 'premium') {
      return res.status(403).json({ success: false, error: 'PREMIUM_REQUIRED', upgradeUrl: '/upgrade' });
    }
    next();
  } catch {
    return res.status(500).json({ success: false, error: 'Subscription check failed' });
  }
};

const checkScanLimit = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (user.subscriptionTier !== 'free') return next();

    const now = new Date();
    if (user.scanCount >= 1 && user.lastScanDate) {
      const last = new Date(user.lastScanDate);
      if (last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear()) {
        return res.status(403).json({ success: false, error: 'SCAN_LIMIT_REACHED', upgradeUrl: '/upgrade' });
      }
    }
    next();
  } catch {
    return res.status(500).json({ success: false, error: 'Scan limit check failed' });
  }
};

module.exports = { requirePremium, checkScanLimit };
