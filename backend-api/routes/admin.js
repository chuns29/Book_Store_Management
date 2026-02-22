const path = require('path');
const express = require('express');
const multer = require('multer');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth'); // Import middleware

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Bảo vệ tất cả các route admin bằng isAuth
router.post('/add-product', isAuth, adminController.postAddProduct);
router.get('/products', isAuth, adminController.getProducts);
router.post('/edit-product', isAuth, adminController.postEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);
router.get('/products/:productId', isAuth, adminController.getEditProduct);
router.post('/import-products', isAuth, upload.single('file'), adminController.postImportProducts);
router.get('/stats', isAuth, adminController.getStats);

module.exports = router;