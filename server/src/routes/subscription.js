const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { getSubscription, createUpgrade, handleCallback } = require('../controllers/subscriptionController');

router.get('/callback', handleCallback);
router.get('/', authMiddleware, getSubscription);
router.post('/upgrade', authMiddleware, createUpgrade);

module.exports = router;
