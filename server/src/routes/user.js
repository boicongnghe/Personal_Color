const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middleware/auth');
const adminOnly      = require('../middleware/adminOnly');
const { saveBodyProfile, getBodyProfile, getAllUsersAdmin, updateUserTierAdmin, banUserAdmin } = require('../controllers/userController');

router.post('/body-profile', authMiddleware, saveBodyProfile);
router.get('/body-profile',  authMiddleware, getBodyProfile);

// Admin-only
router.get('/admin/all',          authMiddleware, adminOnly, getAllUsersAdmin);
router.patch('/admin/:id/tier',   authMiddleware, adminOnly, updateUserTierAdmin);
router.patch('/admin/:id/ban',    authMiddleware, adminOnly, banUserAdmin);

module.exports = router;
