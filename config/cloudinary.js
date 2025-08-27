const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// File Storage (pdf, zip, docs, etc.)
const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'myapp_files', // Cloudinary me folder name
    resource_type: 'auto', // auto detect (image, video, raw)
    format: async (req, file) => {
      const ext = file.originalname.split(".").pop();
      return ext; 
    },
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0],
  },
});

const uploadFile = multer({ storage: fileStorage });

// Profile Picture Storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'myapp_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0],
  },
});

const uploadImage = multer({ storage: imageStorage });

module.exports = { uploadFile, uploadImage, cloudinary };
