const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const freemiumMiddleware = require('../middleware/freemium');
const { addItem, getWardrobe, deleteItem } = require('../controllers/wardrobeController');

router.get('/', (_req, res) => res.json({ ok: true, route: 'wardrobe' }));

router.post('/', authMiddleware, freemiumMiddleware, addItem);
router.get('/:userId', authMiddleware, getWardrobe);
router.delete('/:itemId', authMiddleware, freemiumMiddleware, deleteItem);

module.exports = router;
