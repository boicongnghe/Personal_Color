const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const adminOnly      = require('../middleware/adminOnly');
const {
  getSubscription,
  getPlans,
  createUpgrade,
  handleSepayIPN,
  checkPaymentStatus,
  confirmPayment,
  getAdminStats,
} = require('../controllers/subscriptionController');

router.get('/plans',                              getPlans);
router.get('/admin/stats', authMiddleware, adminOnly, getAdminStats);
router.get('/',                authMiddleware, getSubscription);
router.post('/upgrade',        authMiddleware, createUpgrade);
router.get('/sepay-ipn', (_req, res) => res.json({ ok: true, path: '/api/subscription/sepay-ipn', ts: new Date().toISOString() }));
router.post('/sepay-ipn',                     handleSepayIPN);
router.get('/status/:orderInvoice', authMiddleware, checkPaymentStatus);
router.post('/confirm-payment', authMiddleware, confirmPayment);

module.exports = router;
