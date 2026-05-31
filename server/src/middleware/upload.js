const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ── Face analysis — memory storage (passed to AI service as buffer) ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/heic', 'image/heif'].includes(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error('Only jpg/png files are allowed'), { status: 400 }));
  },
});

// ── Wardrobe images — Cloudinary storage ──
const wardrobeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'clarity/wardrobe',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const uploadWardrobe = multer({
  storage: wardrobeStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Avatar images — Cloudinary storage ──
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'clarity/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' }],
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── IDM-VTON try-on — 2 fields: person + clothing, memory storage ──
const uploadTryOn = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error('Chỉ chấp nhận ảnh JPG, PNG, WEBP'), { status: 400 }));
  },
}).fields([
  { name: 'person',   maxCount: 1 },
  { name: 'clothing', maxCount: 1 },
]);

module.exports = { upload, uploadWardrobe, uploadAvatar, uploadTryOn };
