const router = require('express').Router();
const { getOutfitSuggestions } = require('../controllers/outfitController');

router.get('/', (_req, res) => res.json({ ok: true, route: 'outfit' }));
router.get('/:season', getOutfitSuggestions);

module.exports = router;
