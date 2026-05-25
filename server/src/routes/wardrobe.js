const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { upload, uploadWardrobe, uploadTryOn } = require('../middleware/upload');
const { addItem, getWardrobe, deleteItem, updateItem } = require('../controllers/wardrobeController');
const { savePersonPhoto, hasPersonPhoto, getPersonPhoto, tryOnItem, tryOnReplicate } = require('../controllers/tryOnController');

router.get('/',           authMiddleware, getWardrobe);
router.post('/',          authMiddleware, uploadWardrobe.single('photo'), addItem);
router.patch('/:itemId',  authMiddleware, uploadWardrobe.single('photo'), updateItem);
router.delete('/:itemId', authMiddleware, deleteItem);

router.post('/try-on/save-photo',  authMiddleware, upload.single('photo'), savePersonPhoto);
router.get('/try-on/has-photo',    authMiddleware, hasPersonPhoto);
router.get('/try-on/person-photo', authMiddleware, getPersonPhoto);
router.post('/try-on',            authMiddleware, upload.single('photo'), tryOnItem);
router.post('/try-on/replicate',  authMiddleware, uploadTryOn, tryOnReplicate);

module.exports = router;
