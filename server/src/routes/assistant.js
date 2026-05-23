const router = require('express').Router();
const auth   = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { chat }   = require('../controllers/assistantController');

router.post('/chat', auth, upload.single('image'), chat);

module.exports = router;
