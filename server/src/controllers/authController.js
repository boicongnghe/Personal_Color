const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResetPasswordEmail } = require('../utils/mailer');

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
    ? {
        gender: bp.gender, height: bp.height, weight: bp.weight,
        bust: bp.bust, waist: bp.waist, hips: bp.hips, bodyType: bp.bodyType,
        age: bp.age, bodyShape: bp.bodyShape, budget: bp.budget,
        updatedAt: bp.updatedAt,
      }
    : null;
  res.json({
    success: true,
    data: {
      _id: u._id, email: u.email, displayName: u.displayName,
      avatarUrl: u.avatarUrl, subscriptionTier: u.subscriptionTier,
      scanCount: u.scanCount, lastScanDate: u.lastScanDate,
      isAdmin: u.isAdmin ?? false, bodyProfile,
      favoriteProductIds: (u.favoriteProductIds ?? []).map(id => id.toString()),
    },
  });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email là bắt buộc' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always respond success to avoid email enumeration
    if (!user) return res.json({ success: true, data: { message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu.' } });

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed   = crypto.createHash('sha256').update(rawToken).digest('hex');

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken:   hashed,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendResetPasswordEmail(user.email, user.displayName, resetUrl);

    return res.json({ success: true, data: { message: 'Email đặt lại mật khẩu đã được gửi.' } });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Token và mật khẩu mới là bắt buộc' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken:   hashed,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ success: false, error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
    }

    user.passwordHash          = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken    = undefined;
    user.resetPasswordExpires  = undefined;
    await user.save();

    return res.json({ success: true, data: { message: 'Mật khẩu đã được đặt lại thành công.' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
