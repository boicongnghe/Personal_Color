const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const passport = require('../config/passport');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

const issueToken = (req, res) => {
  const token = jwt.sign({ userId: req.user._id, isAdmin: req.user.isAdmin ?? false }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
};

router.get('/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` }),
  issueToken
);

router.get('/facebook',
  passport.authenticate('facebook', { session: false, scope: ['email'] })
);
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=facebook_failed` }),
  issueToken
);

module.exports = router;
