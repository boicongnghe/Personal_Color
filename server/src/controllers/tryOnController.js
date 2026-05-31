const axios        = require('axios');
const { runTryOn } = require('../integrations/idmVton');
const User     = require('../models/User');
const Wardrobe = require('../models/Wardrobe');

/**
 * Map wardrobe category (Vietnamese or English) to IDM-VTON garment category.
 * DB values from AddClothing: "Áo", "Quần", "Váy", "Áo khoác", "Phụ kiện", "Giày dép"
 * plus any free-text custom categories the user may have typed.
 */
function mapCategory(category = '') {
  const c = category.trim().toLowerCase();
  // lower_body: pants, shorts, jeans, trousers
  if (['quần', 'quần jeans', 'quần shorts', 'quần short', 'shorts', 'jeans', 'pants', 'trousers', 'bottom'].some(k => c.includes(k))) {
    return 'lower_body';
  }
  // dresses: skirts and full dresses (váy covers both in Vietnamese)
  if (['váy', 'dress', 'skirt', 'dresses', 'skirts'].some(k => c.includes(k))) {
    return 'dresses';
  }
  // default: upper_body (Áo, Áo khoác, Phụ kiện, Giày dép, shirts, jackets, etc.)
  return 'upper_body';
}

// POST /api/wardrobe/try-on/save-photo
const savePersonPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Vui lòng chọn ảnh toàn thân' });
    }
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'bodyProfile.personPhotoBuffer':  req.file.buffer,
        'bodyProfile.personPhotoMime':    req.file.mimetype,
        'bodyProfile.personPhotoUpdated': new Date(),
      },
    });
    return res.json({ success: true, data: { saved: true } });
  } catch (err) {
    next(err);
  }
};

// GET /api/wardrobe/try-on/has-photo
const hasPersonPhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('bodyProfile.personPhotoUpdated');
    const has  = !!(user?.bodyProfile?.personPhotoUpdated);
    return res.json({ success: true, data: { hasPhoto: has } });
  } catch (err) {
    next(err);
  }
};

// GET /api/wardrobe/try-on/person-photo
const getPersonPhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('bodyProfile.personPhotoBuffer bodyProfile.personPhotoMime bodyProfile.personPhotoUpdated');
    const buf = user?.bodyProfile?.personPhotoBuffer;
    if (!buf || buf.length === 0) {
      return res.json({ success: true, data: { photo: null } });
    }
    const mime  = user.bodyProfile.personPhotoMime || 'image/jpeg';
    const photo = `data:${mime};base64,${Buffer.from(buf).toString('base64')}`;
    return res.json({
      success: true,
      data: { photo, updatedAt: user.bodyProfile.personPhotoUpdated },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/wardrobe/try-on
const tryOnItem = async (req, res, next) => {
  try {
    const { itemId } = req.body;
    const userId     = req.user._id;

    if (!itemId) {
      return res.status(400).json({ success: false, error: 'itemId là bắt buộc' });
    }

    // 1. Get person photo
    const user = await User.findById(userId);
    const personBuffer = req.file?.buffer ?? user?.bodyProfile?.personPhotoBuffer;
    const personMime   = req.file?.mimetype ?? user?.bodyProfile?.personPhotoMime ?? 'image/jpeg';

    if (!personBuffer || personBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'NO_PERSON_PHOTO',
        message: 'Bạn chưa tải ảnh mẫu. Vui lòng chụp hoặc chọn ảnh toàn thân trước.',
      });
    }

    // 2. Get wardrobe item
    const wardrobe = await Wardrobe.findOne({ userId });
    const item     = wardrobe?.items?.find(i => i._id.toString() === itemId);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy món đồ trong tủ đồ' });
    }

    // 3. Get clothing image (buffer + mime)
    let clothingBuffer;
    let clothingMime = 'image/jpeg';

    if (item.clothingPhotoBuffer && item.clothingPhotoBuffer.length > 0) {
      clothingBuffer = item.clothingPhotoBuffer;
      clothingMime   = item.clothingPhotoMime || 'image/jpeg';
    } else if (item.imageUrl) {
      const response = await axios.get(item.imageUrl, {
        responseType: 'arraybuffer',
        timeout: 8000,
      });
      clothingBuffer = Buffer.from(response.data);
      clothingMime   = response.headers['content-type'] || 'image/jpeg';
    } else {
      clothingBuffer = createColorImage(item.color);
      clothingMime   = 'image/bmp';
    }

    // 4. Call IDM-VTON with correct garment category
    const result = await runTryOn({
      personImageBase64:   Buffer.from(personBuffer).toString('base64'),
      clothingImageBase64: clothingBuffer.toString('base64'),
      personMime,
      clothingMime,
      category: mapCategory(item.category),
    });

    return res.json({
      success: true,
      data: {
        resultImage: `data:${result.resultMime};base64,${result.resultBase64}`,
        resultUrl:   result.resultUrl,
        item: { name: item.name, color: item.color, category: item.category },
      },
    });
  } catch (err) {
    console.error('TryOn error:', err.message);
    next(err);
  }
};

// Solid-color fallback image (raw 24-bit BMP, 200×200)
function createColorImage(hex = '#CCCCCC') {
  const r = parseInt((hex || '#CCCCCC').slice(1, 3), 16) || 128;
  const g = parseInt((hex || '#CCCCCC').slice(3, 5), 16) || 128;
  const b = parseInt((hex || '#CCCCCC').slice(5, 7), 16) || 128;
  const size     = 200;
  const rowSize  = size * 3;
  const fileSize = 54 + rowSize * size;
  const buf      = Buffer.alloc(fileSize);
  buf.write('BM', 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(54, 10);
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(size, 18);
  buf.writeInt32LE(-size, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  for (let i = 0; i < size * size; i++) {
    const offset = 54 + i * 3;
    buf[offset]     = b;
    buf[offset + 1] = g;
    buf[offset + 2] = r;
  }
  return buf;
}

// POST /api/wardrobe/try-on/replicate
const tryOnReplicate = async (req, res, next) => {
  try {
    if (!req.files?.person?.[0] || !req.files?.clothing?.[0]) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp ảnh người và ảnh quần áo',
      });
    }

    const personBuffer   = req.files.person[0].buffer;
    const clothingBuffer = req.files.clothing[0].buffer;
    const personMime     = req.files.person[0].mimetype;
    const clothingMime   = req.files.clothing[0].mimetype;

    console.log('🔄 Running IDM-VTON try-on...');

    const result = await runTryOn({
      personImageBase64:   personBuffer.toString('base64'),
      clothingImageBase64: clothingBuffer.toString('base64'),
      personMime,
      clothingMime,
      category: mapCategory(req.body.category),
    });

    console.log('✅ Try-on complete:', result.resultUrl);

    return res.json({
      success: true,
      data: {
        resultImage: `data:${result.resultMime};base64,${result.resultBase64}`,
        resultUrl:   result.resultUrl,
      },
    });
  } catch (err) {
    console.error('IDM-VTON error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Thử đồ thất bại: ' + err.message,
    });
  }
};

module.exports = { savePersonPhoto, hasPersonPhoto, getPersonPhoto, tryOnItem, tryOnReplicate };
