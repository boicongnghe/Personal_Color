const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { getOutfitSuggestions } = require('../controllers/outfitController');

router.get('/:season', authMiddleware, getOutfitSuggestions);

module.exports = router;
