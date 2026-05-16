const axios = require('axios');
const User = require('../models/User');
const Scan = require('../models/Scan');

const analyzeFace = async (req, res, next) => {
  try {
    // TODO: forward image to AI service, save result
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    const result = { season: 'autumn-warm', undertone: 'warm', faceShape: 'oval', bodyType: 'hourglass', accuracy: 0 };
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getResult = async (req, res, next) => {
  try {
    const scan = await Scan.findOne({ userId: req.params.userId }).sort({ scanDate: -1 });
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
