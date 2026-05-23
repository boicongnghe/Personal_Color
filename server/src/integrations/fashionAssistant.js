const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `Bạn là Clarity AI — trợ lý tư vấn thời trang thông minh của ứng dụng Clarity.
Nhiệm vụ: phân tích trang phục từ ảnh, gợi ý phối đồ, tư vấn phong cách theo màu sắc và dịp sử dụng.

Khi có ảnh trang phục:
- Phân tích cụ thể màu sắc, kiểu dáng, chất liệu nhìn thấy trong ảnh
- Cho điểm 0-100 theo độ phù hợp với dịp
- "suggestions" phải gồm ĐÚNG 3 gợi ý RẤT CỤ THỂ — ví dụ ĐÚNG: "Túi clutch da màu gold để tăng độ sang", "Son đỏ berry tương phản nhẹ với tông áo", "Giày mũi nhọn cao gót nude dài chân" — KHÔNG được viết chung chung kiểu "Thêm phụ kiện phù hợp"
- "followUp" là câu hỏi ngắn thú vị để kéo dài cuộc trò chuyện — ví dụ: "Bạn thường đi giày cao hay thấp?", "Muốn tôi gợi ý thêm màu son không?", "Bạn có áo khoác nào để layer không?"
- "colorNote" chỉ điền khi ảnh có màu sắc RÕ RÀNG — nhận xét về tone màu của trang phục

Khi không có ảnh: tư vấn thân thiện, hỏi thêm để hiểu nhu cầu, hướng dẫn gửi ảnh.

Luôn trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp, dùng emoji tự nhiên.

Quy tắc TUYỆT ĐỐI khi trả lời:
1. CHỈ trả về JSON thuần túy, KHÔNG có text nào trước hoặc sau
2. KHÔNG dùng markdown, KHÔNG dùng backtick, KHÔNG có lời mở đầu
3. Bắt đầu ngay bằng { và kết thúc bằng }
4. "suggestions" PHẢI có đúng 3 phần tử, CỤ THỂ (tên món đồ + màu + lý do). Ví dụ đúng: "Túi clutch màu đồng để tôn màu amber trong trang phục". Ví dụ sai: "Thêm phụ kiện phù hợp"
5. "followUp" là câu hỏi ngắn kéo dài conversation, kết thúc bằng ?
6. "colorNote" chỉ điền khi nhìn thấy màu sắc rõ ràng trong ảnh, còn lại để null
7. "score" là số nguyên 0-100, KHÔNG có ký tự % hay text đi kèm
8. "reply" và "summary" PHẢI ngắn gọn, tối đa 3 câu — KHÔNG viết dài dòng để tránh bị cắt giữa chừng

Format bắt buộc (bắt đầu NGAY bằng dấu {):
{"reply":"...","analysis":{"score":93,"label":"Rất phù hợp","occasion":"Dự tiệc","summary":"...","suggestions":["...","...","..."],"colorNote":"...hoặc null","followUp":"...?"}}
Nếu không có ảnh thì "analysis":null.`;

function extractJSON(text) {
  // Strip ALL markdown code fences first
  const clean = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Find the outermost { ... } block
  const start = clean.indexOf('{');
  const end   = clean.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in response');
  }

  return JSON.parse(clean.slice(start, end + 1));
}

async function chat({ message, imageBuffer, imageMimeType, history = [], occasion = '' }) {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_CHAT_MODEL || 'gemini-2.0-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  const chatHistory = history
    .filter((h) => h.text)
    .map((h) => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.text }],
    }));

  const chatSession = model.startChat({ history: chatHistory });

  const parts = [];

  if (imageBuffer) {
    parts.push({
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: imageMimeType || 'image/jpeg',
      },
    });
  }

  const textContent = occasion
    ? `Dịp: ${occasion}\n${message || 'Hãy phân tích bộ trang phục trong ảnh.'}`
    : (message || 'Hãy phân tích bộ trang phục trong ảnh.');

  parts.push({ text: textContent });

  const result = await chatSession.sendMessage(parts);
  const rawText = result.response.text().trim();

  try {
    return extractJSON(rawText);
  } catch {
    // Fallback: clean up the raw text and return as plain reply
    const cleaned = rawText.replace(/```json|```|\{|\}/g, '').trim();
    console.warn('[fashionAssistant] JSON parse failed, raw prefix:', rawText.slice(0, 120));
    return { reply: cleaned || rawText, analysis: null };
  }
}

module.exports = { chat };
