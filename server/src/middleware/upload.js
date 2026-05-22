const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ── Face analysis — memory storage (passed to AI service as buffer) ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error('Only jpg/png files are allowed'), { status: 400 }));
  },
});

// ── Wardrobe images — disk storage, served as static files ──
const WARDROBE_DIR = path.join(__dirname, '..', '..', 'uploads', 'wardrobe');
if (!fs.existsSync(WARDROBE_DIR)) fs.mkdirSync(WARDROBE_DIR, { recursive: true });

const wardrobeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, WARDROBE_DIR),
  filename:    (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const uploadWardrobe = multer({
  storage: wardrobeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error('Only jpg/png/webp files are allowed'), { status: 400 }));
  },
});

module.exports = { upload, uploadWardrobe };
