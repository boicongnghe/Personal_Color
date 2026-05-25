const Replicate = require('replicate');
const axios     = require('axios');

const MODEL = 'cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985';

let _client = null;
function getClient() {
  if (!_client) {
    _client = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  }
  return _client;
}

/**
 * Run IDM-VTON virtual try-on via Replicate.
 * @param {{ personImageBase64: string, clothingImageBase64: string, personMime?: string, clothingMime?: string }} opts
 * @returns {{ resultUrl: string, resultBase64: string, resultMime: string }}
 */
async function runTryOn({ personImageBase64, clothingImageBase64, personMime, clothingMime }) {
  const humanImg   = `data:${personMime   ?? 'image/jpeg'};base64,${personImageBase64}`;
  const garmentImg = `data:${clothingMime ?? 'image/jpeg'};base64,${clothingImageBase64}`;

  const REPLICATE_TIMEOUT_MS = 90000;

  let output;
  try {
    const replicatePromise = getClient().run(MODEL, {
      input: {
        human_img:       humanImg,
        garm_img:        garmentImg,
        garment_des:     'clothing item',
        is_checked:      false,   // skip human-parsing step (avoids "list index out of range")
        is_checked_crop: true,    // auto-crop person before try-on
        denoise_steps:   30,
        seed:            42,
      },
    });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Replicate timeout: model took too long to respond')), REPLICATE_TIMEOUT_MS)
    );
    output = await Promise.race([replicatePromise, timeoutPromise]);
  } catch (err) {
    const msg = err?.message ?? String(err);
    if (msg.includes('list index out of range')) {
      throw new Error(
        'Model không nhận diện được người trong ảnh. Vui lòng dùng ảnh toàn thân, đứng thẳng, nền sáng.'
      );
    }
    throw err;
  }

  const resultUrl = Array.isArray(output) ? output[0] : output;
  if (!resultUrl) {
    throw new Error('Model không trả về ảnh kết quả. Vui lòng thử lại với ảnh rõ hơn.');
  }

  const response = await axios.get(resultUrl.toString(), { responseType: 'arraybuffer', timeout: 60000 });
  const buffer   = Buffer.from(response.data);
  const base64   = buffer.toString('base64');
  const mime     = response.headers['content-type'] ?? 'image/png';

  return { resultUrl: resultUrl.toString(), resultBase64: base64, resultMime: mime };
}

module.exports = { runTryOn };
