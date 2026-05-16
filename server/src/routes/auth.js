const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.get('/', (_req, res) => res.json({ ok: true, route: 'auth' }));

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ success: false, error: 'email, password, displayName required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, displayName });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, data: { token, user: { _id: user._id, email, displayName, subscriptionTier: user.subscriptionTier } } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { token, user: { _id: user._id, email: user.email, displayName: user.displayName, subscriptionTier: user.subscriptionTier } } });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
