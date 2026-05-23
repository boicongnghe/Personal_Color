const Conversation = require('../models/Conversation');

async function list(req, res) {
  try {
    const convs = await Conversation.find({ userId: req.user._id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, data: convs });
  } catch (err) {
    console.error('Conversation list:', err.message);
    res.status(500).json({ success: false, error: 'Không thể tải lịch sử' });
  }
}

async function create(req, res) {
  try {
    const conv = await Conversation.create({
      userId: req.user._id,
      title: (req.body.title || 'Cuộc trò chuyện mới').slice(0, 100),
    });
    res.json({ success: true, data: { _id: conv._id, title: conv.title } });
  } catch (err) {
    console.error('Conversation create:', err.message);
    res.status(500).json({ success: false, error: 'Không thể tạo' });
  }
}

async function get(req, res) {
  try {
    const conv = await Conversation.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!conv) return res.status(404).json({ success: false, error: 'Không tìm thấy' });
    res.json({ success: true, data: conv });
  } catch (err) {
    console.error('Conversation get:', err.message);
    res.status(500).json({ success: false, error: 'Không thể tải' });
  }
}

async function update(req, res) {
  try {
    const { messages, title } = req.body;
    const updateOp = {};
    if (Array.isArray(messages) && messages.length > 0) {
      updateOp.$push = { messages: { $each: messages } };
    }
    if (title) {
      updateOp.$set = { title: title.slice(0, 100) };
    }
    if (Object.keys(updateOp).length === 0) {
      return res.json({ success: true });
    }
    const conv = await Conversation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateOp,
    );
    if (!conv) return res.status(404).json({ success: false, error: 'Không tìm thấy' });
    res.json({ success: true });
  } catch (err) {
    console.error('Conversation update:', err.message);
    res.status(500).json({ success: false, error: 'Không thể cập nhật' });
  }
}

async function remove(req, res) {
  try {
    await Conversation.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    console.error('Conversation delete:', err.message);
    res.status(500).json({ success: false, error: 'Không thể xóa' });
  }
}

module.exports = { list, create, get, update, remove };
