const axios = require('axios');
const FormData = require('form-data');
const User = require('../models/User');
const Scan = require('../models/Scan');
const cloudinary = require('../config/cloudinary');

// Upload a buffer to Cloudinary and return the secure URL
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'clarity/scans', resource_type: 'image', ...options },
      (error, result) => (error ? reject(error) : resolve(result))
    ).end(buffer);
  });
}

const analyzeFace = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Photo is required' });
    }

    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';

    const form = new FormData();
    form.append('photo', req.file.buffer, {
      filename: req.file.originalname || 'photo.jpg',
      contentType: req.file.mimetype,
    });

    const { bust, waist, hips } = req.body;
    if (bust)  form.append('bust',  String(bust));
    if (waist) form.append('waist', String(waist));
    if (hips)  form.append('hips',  String(hips));

    let aiData;
    try {
      const { data } = await axios.post(`${aiUrl}/analyze`, form, {
        headers: form.getHeaders(),
        timeout: 30000,
      });
      aiData = data;
    } catch (aiErr) {
      console.error('AI Service Error:', aiErr.message, aiErr.code, aiErr.response?.status, aiErr.response?.data);
      return res.status(503).json({ success: false, error: 'Dịch vụ phân tích đang bận, thử lại sau' });
    }

    if (!aiData.success) {
      return res.status(400).json({ success: false, error: aiData.error });
    }

    const { season, undertone, faceShape, bodyType, accuracy, rawMetrics } = aiData.data;

    // Upload scan photo to Cloudinary CDN
    let photoUrl;
    try {
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
      photoUrl = uploaded.secure_url;
    } catch (upErr) {
      console.error('Cloudinary scan upload error:', upErr.message);
      // Non-fatal — proceed without photo
    }

    const scan = await Scan.create({
      userId: req.userId,
      season,
      undertone,
      faceShape,
      bodyType,
      accuracy,
      rawMetrics,
      photoUrl,
    });

    await User.findByIdAndUpdate(req.userId, {
      $inc: { scanCount: 1 },
      lastScanDate: new Date(),
    });

    res.json({ success: true, data: scan });
  } catch (err) {
    next(err);
  }
};

const getResult = async (req, res, next) => {
  try {
    const scan = await Scan.findOne({ userId: req.params.userId })
      .sort({ scanDate: -1 })
      .limit(1);
    res.json({ success: true, data: scan });
  } catch (err) {
    next(err);
  }
};

const saveScan = async (req, res, next) => {
  try {
    const scan = await Scan.create({ userId: req.userId, ...req.body });
    res.json({ success: true, data: scan });
  } catch (err) {
    next(err);
  }
};

const getScanHistory = async (req, res, next) => {
  try {
    const scans = await Scan.find({ userId: req.userId }).sort({ scanDate: -1 }).limit(50);
    res.json({ success: true, data: { scans } });
  } catch (err) {
    next(err);
  }
};

const deleteScan = async (req, res, next) => {
  try {
    const scan = await Scan.findById(req.params.scanId);
    if (!scan) return res.status(404).json({ success: false, error: 'Scan not found' });
    if (scan.userId.toString() !== req.userId.toString()) return res.status(403).json({ success: false, error: 'Forbidden' });

    if (scan.photoUrl && scan.photoUrl.includes('cloudinary.com')) {
      // Extract public_id from Cloudinary URL (path between /upload/ and the extension)
      const match = scan.photoUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
      if (match) cloudinary.uploader.destroy(match[1]).catch(() => {});
    }

    await scan.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { analyzeFace, getResult, saveScan, getScanHistory, deleteScan };
