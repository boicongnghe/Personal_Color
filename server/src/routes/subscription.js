const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { getSubscription, createUpgradePayment, paymentCallback } = require('../controllers/subscriptionController');

router.get('/', (_req, res) => res.json({ ok: true, route: 'subscription' }));

router.get('/:userId', authMiddleware, getSubscription);
router.post('/upgrade', authMiddleware, createUpgradePayment);
router.get('/callback', paymentCallback);

module.exports = router;
