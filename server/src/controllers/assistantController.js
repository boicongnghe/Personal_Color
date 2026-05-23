const fashionAssistant = require('../integrations/fashionAssistant');

async function chat(req, res) {
  try {
    if (req.user.subscriptionTier !== 'premium') {
      return res.status(403).json({ success: false, error: 'Tính năng này chỉ dành cho thành viên Premium' });
    }

    const message = req.body.message || '';
    const occasion = req.body.occasion || '';

    let history = [];
    try { history = JSON.parse(req.body.history || '[]'); } catch { history = []; }

    const imageBuffer   = req.file?.buffer   || null;
    const imageMimeType = req.file?.mimetype  || null;

    const result = await fashionAssistant.chat({ message, imageBuffer, imageMimeType, history, occasion });

    console.log('=== ASSISTANT RESPONSE ===');
    console.log('score:', result.analysis?.score, '| label:', result.analysis?.label);
    console.log('reply prefix:', (result.reply || '').slice(0, 80));
    console.log('==========================');

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Assistant chat error:', err.message);
    res.status(500).json({ success: false, error: 'Không thể kết nối với AI. Vui lòng thử lại.' });
  }
}

module.exports = { chat };
