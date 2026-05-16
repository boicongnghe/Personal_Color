const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { analyzeFace, getResult, saveScan } = require('../controllers/faceController');

router.get('/', (_req, res) => res.json({ ok: true, route: 'face' }));

router.post('/analyze-face', authMiddleware, upload.single('image'), analyzeFace);
router.get('/result/:userId', authMiddleware, getResult);
router.post('/save-scan', authMiddleware, saveScan);

module.exports = router;
