const axios = require('axios');
const FormData = require('form-data');
const User = require('../models/User');
const Scan = require('../models/Scan');

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
        timeout: 10000,
      });
      aiData = data;
    } catch {
      return res.status(503).json({ success: false, error: 'Dịch vụ phân tích đang bận, thử lại sau' });
    }

    if (!aiData.success) {
      return res.status(400).json({ success: false, error: aiData.error });
    }

    const { season, undertone, faceShape, bodyType, accuracy, rawMetrics } = aiData.data;

    const scan = await Scan.create({
      userId: req.userId,
      season,
      undertone,
      faceShape,
      bodyType,
      accuracy,
      rawMetrics,
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

module.exports = { analyzeFace, getResult, saveScan };
