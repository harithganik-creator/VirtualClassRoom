const express = require('express');
const router = express.Router();
const { getMaterials, uploadMaterial, deleteMaterial } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMaterial: uploadMiddleware } = require('../config/cloudinary');

router.use(protect);
router.get('/', getMaterials);
router.post('/', authorize('teacher'), uploadMiddleware.single('file'), uploadMaterial);
router.delete('/:id', authorize('teacher', 'admin'), deleteMaterial);

module.exports = router;
