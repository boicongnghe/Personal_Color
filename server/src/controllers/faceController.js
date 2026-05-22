const axios = require('axios');
const FormData = require('form-data');
const fs   = require('fs');
const path = require('path');
const User = require('../models/User');
const Scan = require('../models/Scan');

const SCANS_DIR = path.join(__dirname, '..', '..', 'uploads', 'scans');
if (!fs.existsSync(SCANS_DIR)) fs.mkdirSync(SCANS_DIR, { recursive: true });

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

    const ext = req.file.mimetype === 'image/png' ? '.png' : '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    fs.writeFileSync(path.join(SCANS_DIR, filename), req.file.buffer);
    const photoUrl = `/uploads/scans/${filename}`;

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

    if (scan.photoUrl) {
      const filePath = path.join(__dirname, '..', '..', scan.photoUrl.replace(/^\//, '').replace(/\//g, path.sep));
      fs.unlink(filePath, () => {});
    }

    await scan.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { analyzeFace, getResult, saveScan, getScanHistory, deleteScan };
