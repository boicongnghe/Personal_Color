const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { requirePremium } = require('../middleware/freemium');
const { addItem, getWardrobe, deleteItem } = require('../controllers/wardrobeController');

router.get('/', authMiddleware, getWardrobe);
router.post('/', authMiddleware, requirePremium, addItem);
router.delete('/:itemId', authMiddleware, requirePremium, deleteItem);

module.exports = router;
