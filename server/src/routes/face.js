const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { checkScanLimit } = require('../middleware/freemium');
const { analyzeFace, getResult, saveScan, getScanHistory, deleteScan } = require('../controllers/faceController');

router.get('/', (_req, res) => res.json({ ok: true, route: 'face' }));

router.post('/analyze-face', authMiddleware, checkScanLimit, upload.single('photo'), analyzeFace);
router.get('/scans', authMiddleware, getScanHistory);
router.delete('/scans/:scanId', authMiddleware, deleteScan);
router.get('/result/:userId', authMiddleware, getResult);
router.post('/save-scan', authMiddleware, saveScan);

module.exports = router;
