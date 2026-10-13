const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for learning materials
const materialStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'virtual-classroom/materials',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg'],
    resource_type: 'auto',
  },
});

// Storage for assignment submissions
const submissionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'virtual-classroom/submissions',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'zip'],
    resource_type: 'auto',
  },
});

// Storage for profile images
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'virtual-classroom/profiles',
    allowed_formats: ['png', 'jpg', 'jpeg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  },
});

const uploadMaterial = multer({
  storage: materialStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const uploadSubmission = multer({
  storage: submissionStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { cloudinary, uploadMaterial, uploadSubmission, uploadProfile };
