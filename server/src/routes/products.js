const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const adminOnly      = require('../middleware/adminOnly');
const {
  previewLink, createProduct, getProductsForUser, getAllProducts,
  updateProduct, deleteProduct, trackClick,
} = require('../controllers/productController');

// Any authenticated user
router.post('/preview',   authMiddleware, previewLink);
router.get('/',           authMiddleware, getProductsForUser);
router.post('/:id/click', authMiddleware, trackClick);

// Admin-only
router.post('/',      authMiddleware, adminOnly, createProduct);
router.get('/all',    authMiddleware, adminOnly, getAllProducts);
router.patch('/:id',  authMiddleware, adminOnly, updateProduct);
router.delete('/:id', authMiddleware, adminOnly, deleteProduct);

module.exports = router;
