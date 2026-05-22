const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const CATEGORY_LABELS = {
  top:       'áo — chỉ thay phần thân trên',
  bottom:    'quần/váy — chỉ thay phần thân dưới',
  shoes:     'giày dép — chỉ thay phần chân',
  accessory: 'phụ kiện — thêm vào tự nhiên',
};

async function virtualTryOn({ personImageBuffer, personMime, clothingImageBuffer, clothingMime, clothingInfo }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const personBase64   = personImageBuffer.toString('base64');
  const clothingBase64 = clothingImageBuffer.toString('base64');

  const categoryLabel = CATEGORY_LABELS[clothingInfo.category] ?? clothingInfo.category;

  const prompt = `You are a fashion AI for Clarity app — a personal color analysis app in Vietnam.

I am providing two images:
IMAGE 1: Full body photo of a person (their model reference)
IMAGE 2: A clothing item

Task: Generate a photorealistic image of the person wearing the clothing item.

Clothing details:
- Name: ${clothingInfo.name}
- Color: ${clothingInfo.color}
- Type: ${categoryLabel}
${clothingInfo.season ? `- Person's color season: ${clothingInfo.season}` : ''}

Strict rules for image generation:
1. Keep the person's face IDENTICAL — same features, expression, skin tone
2. Keep hair, body shape, and proportions EXACTLY the same
3. Only change the clothing in the specified area (${clothingInfo.category})
4. Keep all other clothing layers unchanged
5. Maintain realistic lighting, shadows, and fabric texture
6. Result must look like a real photograph, not an illustration or cartoon
7. Same background and pose as original photo

After the image, write 2-3 sentences in Vietnamese assessing:
- Whether this clothing color suits their color season
- Whether the style suits their body shape
- One specific styling tip`;

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: personMime || 'image/jpeg',   data: personBase64   } },
          { inlineData: { mimeType: clothingMime || 'image/jpeg', data: clothingBase64 } },
          { text: prompt },
        ],
      },
    ],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  });

  const parts = result.response.candidates[0].content.parts;

  let resultImageBase64 = null;
  let resultMime        = 'image/jpeg';
  let assessment        = null;

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      resultImageBase64 = part.inlineData.data;
      resultMime        = part.inlineData.mimeType;
    }
    if (part.text) {
      assessment = part.text.trim();
    }
  }

  return { resultImageBase64, resultMime, assessment };
}

module.exports = { virtualTryOn };
