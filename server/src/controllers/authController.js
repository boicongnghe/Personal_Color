const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) =>
  jwt.sign({ userId: user._id, isAdmin: user.isAdmin ?? false }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, displayName });
    const token = signToken(user);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          displayName: user.displayName,
          subscriptionTier: user.subscriptionTier,
          scanCount: user.scanCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email và mật khẩu là bắt buộc' });
    }
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Email hoặc mật khẩu không đúng' });
    }
    const token = signToken(user);
    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          displayName: user.displayName,
          subscriptionTier: user.subscriptionTier,
          scanCount: user.scanCount,
          isAdmin: user.isAdmin ?? false,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = (req, res) => {
  const u = req.user;
  const bp = u.bodyProfile;
  const bodyProfile = bp?.gender
    ? { gender: bp.gender, height: bp.height, weight: bp.weight, bust: bp.bust, waist: bp.waist, hips: bp.hips, bodyType: bp.bodyType, updatedAt: bp.updatedAt }
    : null;
  res.json({
    success: true,
    data: {
      _id: u._id, email: u.email, displayName: u.displayName,
      avatarUrl: u.avatarUrl, subscriptionTier: u.subscriptionTier,
      scanCount: u.scanCount, lastScanDate: u.lastScanDate,
      isAdmin: u.isAdmin ?? false, bodyProfile,
    },
  });
};

module.exports = { register, login, getMe };
