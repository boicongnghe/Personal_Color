const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function extractJSON(text) {
  const clean = String(text || '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in Gemini response');
  }
  return JSON.parse(clean.slice(start, end + 1));
}

async function fetchImageAsInlineData(imageUrl) {
  if (!imageUrl) return null;
  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 15000,
    maxContentLength: 10 * 1024 * 1024,
  });
  const mimeType = response.headers['content-type']?.split(';')[0] || 'image/jpeg';
  return {
    inlineData: {
      mimeType,
      data: Buffer.from(response.data).toString('base64'),
    },
  };
}

function summarizeWardrobe(items) {
  return items.slice(0, 60).map((item) => ({
    name: item.name,
    category: item.category,
    color: item.color,
    occasions: Array.isArray(item.occasions) ? item.occasions : [],
    seasons: Array.isArray(item.seasons) ? item.seasons : [],
  }));
}

function fallbackCompatibility({ newItem, existingItems }) {
  if (!existingItems.length) {
    return {
      compatibilityScore: 100,
      compatibilityLabel: 'Món nền tảng',
      compatibilityReason: 'Đây là món đầu tiên trong tủ đồ nên có thể dùng làm điểm bắt đầu.',
    };
  }

  const sameOccasionCount = existingItems.filter((item) => {
    const occasions = Array.isArray(item.occasions) ? item.occasions : [];
    return occasions.some((occ) => newItem.occasions.includes(occ));
  }).length;
  const categoryDiversity = new Set(existingItems.map((item) => item.category).filter(Boolean)).size;
  const categoryExists = existingItems.some((item) => item.category === newItem.category);
  const occasionScore = Math.min(25, sameOccasionCount * 5);
  const categoryScore = categoryExists ? 18 : Math.min(18, categoryDiversity * 3);
  const score = Math.max(55, Math.min(92, 55 + occasionScore + categoryScore));

  return {
    compatibilityScore: score,
    compatibilityLabel: score >= 80 ? 'Dễ phối' : score >= 65 ? 'Khá hợp' : 'Cần cân nhắc',
    compatibilityReason: 'Điểm tạm tính từ danh mục và dịp mặc do AI chưa phản hồi.',
  };
}

async function analyzeWardrobeCompatibility({ newItem, imageUrl, existingItems = [] }) {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackCompatibility({ newItem, existingItems });
  }

  if (!existingItems.length) {
    return fallbackCompatibility({ newItem, existingItems });
  }

  try {
    const imagePart = await fetchImageAsInlineData(imageUrl);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_WARDROBE_MODEL || process.env.GEMINI_CHAT_MODEL || 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.35,
        maxOutputTokens: 700,
      },
    });

    const prompt = `Bạn là AI stylist của Clarity. Hãy chấm mức độ món đồ mới hợp với tủ đồ hiện tại của người dùng.

Món mới:
${JSON.stringify(newItem, null, 2)}

Tủ đồ hiện tại:
${JSON.stringify(summarizeWardrobe(existingItems), null, 2)}

Đánh giá dựa trên:
- Màu sắc, kiểu dáng và chất liệu nhìn được trong ảnh món mới
- Khả năng phối với các nhóm đồ hiện có
- Sự đa dụng theo dịp mặc
- Tính bổ sung cho tủ đồ, không chỉ giống các món cũ

Chỉ trả về JSON thuần:
{"compatibilityScore":0-100,"compatibilityLabel":"ngắn tối đa 4 từ","compatibilityReason":"một câu tiếng Việt ngắn"}`;

    const parts = [];
    if (imagePart) parts.push(imagePart);
    parts.push({ text: prompt });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
    });
    const parsed = extractJSON(result.response.text());
    const score = clampScore(parsed.compatibilityScore);
    if (score === null) throw new Error('Invalid compatibilityScore');

    return {
      compatibilityScore: score,
      compatibilityLabel: String(parsed.compatibilityLabel || (score >= 80 ? 'Rất hợp' : 'Khá hợp')).slice(0, 40),
      compatibilityReason: String(parsed.compatibilityReason || '').slice(0, 180),
    };
  } catch (err) {
    console.warn('[wardrobeCompatibility] Gemini failed:', err.message);
    return fallbackCompatibility({ newItem, existingItems });
  }
}

module.exports = { analyzeWardrobeCompatibility };
