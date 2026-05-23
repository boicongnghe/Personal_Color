const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { sendMessage, getMyMessages, getAllMessages, replyMessage } = require('../controllers/supportController');

router.post('/',           auth,             sendMessage);
router.get('/',            auth,             getMyMessages);
router.get('/admin/all',   auth, adminOnly,  getAllMessages);
router.patch('/:id/reply', auth, adminOnly,  replyMessage);

module.exports = router;
