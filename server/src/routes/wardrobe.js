const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { upload, uploadWardrobe } = require('../middleware/upload');
const { addItem, getWardrobe, deleteItem } = require('../controllers/wardrobeController');
const { savePersonPhoto, hasPersonPhoto, tryOnItem } = require('../controllers/tryOnController');

router.get('/',           authMiddleware, getWardrobe);
router.post('/',          authMiddleware, uploadWardrobe.single('photo'), addItem);
router.delete('/:itemId', authMiddleware, deleteItem);

router.post('/try-on/save-photo', authMiddleware, upload.single('photo'), savePersonPhoto);
router.get('/try-on/has-photo',   authMiddleware, hasPersonPhoto);
router.post('/try-on',            authMiddleware, upload.single('photo'), tryOnItem);

module.exports = router;
