const SupportMessage = require('../models/SupportMessage');

// User: gửi tin nhắn mới
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Nội dung tin nhắn không được để trống' });
    }
    const doc = await SupportMessage.create({
      userId:    req.userId,
      userName:  req.user.displayName || req.user.email,
      userEmail: req.user.email,
      message:   message.trim(),
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// User: lấy danh sách tin nhắn của mình
const getMyMessages = async (req, res, next) => {
  try {
    const messages = await SupportMessage.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
};

// Admin: lấy tất cả tin nhắn
const getAllMessages = async (req, res, next) => {
  try {
    const messages = await SupportMessage.find().sort({ createdAt: -1 }).populate('userId', 'displayName email avatarUrl');
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
};

// Admin: reply tin nhắn
const replyMessage = async (req, res, next) => {
  try {
    const { reply } = req.body;
    if (!reply || !reply.trim()) {
      return res.status(400).json({ success: false, error: 'Nội dung phản hồi không được để trống' });
    }
    const doc = await SupportMessage.findByIdAndUpdate(
      req.params.id,
      { adminReply: reply.trim(), status: 'replied' },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, error: 'Không tìm thấy tin nhắn' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

module.exports = { sendMessage, getMyMessages, getAllMessages, replyMessage };
