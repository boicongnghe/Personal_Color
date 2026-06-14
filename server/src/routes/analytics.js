const express    = require('express');
const rateLimit  = require('express-rate-limit');
const router     = express.Router();
const authMiddleware = require('../middleware/auth');
const adminOnly      = require('../middleware/adminOnly');
const { trackEvent, getMetrics } = require('../controllers/analyticsController');

const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many analytics events, slow down' },
});

// Public — no auth required so anonymous users can be tracked too
router.post('/event', analyticsLimiter, trackEvent);

// Admin only
router.get('/metrics', authMiddleware, adminOnly, getMetrics);

module.exports = router;
