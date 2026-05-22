const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { getSubscription, getPlans, createUpgrade, confirmPayment } = require('../controllers/subscriptionController');

router.get('/plans', getPlans);
router.get('/', authMiddleware, getSubscription);
router.post('/upgrade', authMiddleware, createUpgrade);
router.post('/confirm-payment', authMiddleware, confirmPayment);

module.exports = router;
