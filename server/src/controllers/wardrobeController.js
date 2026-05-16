const Wardrobe = require('../models/Wardrobe');
const seasonalPalettes = require('../../../shared/seasonalPalettes');

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const VALID_CATEGORIES = ['top', 'bottom', 'shoes', 'accessory'];

function hexToLab(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const rl = lin(r), gl = lin(g), bl = lin(b);
  const X = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const Y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750;
  const Z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041;
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const fx = f(X / 0.95047), fy = f(Y), fz = f(Z / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE(lab1, lab2) {
  return Math.sqrt((lab1[0] - lab2[0]) ** 2 + (lab1[1] - lab2[1]) ** 2 + (lab1[2] - lab2[2]) ** 2);
}

function tagSeasons(colorHex) {
  const itemLab = hexToLab(colorHex);
  return Object.entries(seasonalPalettes)
    .filter(([, pal]) => pal.palette.some(hex => deltaE(itemLab, hexToLab(hex)) < 25))
    .map(([season]) => season);
}

const getWardrobe = async (req, res, next) => {
  try {
    const wardrobe = await Wardrobe.findOne({ userId: req.user._id });
    const items = wardrobe
      ? [...wardrobe.items].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      : [];
    res.json({ success: true, data: { items, total: items.length } });
  } catch (err) {
    next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { name, color, category, imageUrl } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'name là bắt buộc' });
    if (!color || !HEX_RE.test(color))
      return res.status(400).json({ success: false, error: 'color phải là mã hex hợp lệ (#xxxxxx)' });
    if (!VALID_CATEGORIES.includes(category))
      return res.status(400).json({ success: false, error: `category phải là một trong: ${VALID_CATEGORIES.join(', ')}` });

    const seasons = tagSeasons(color);
    const newItem = { name, color, category, seasons, ...(imageUrl ? { imageUrl } : {}) };

    const wardrobe = await Wardrobe.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { items: newItem } },
      { returnDocument: 'after', upsert: true }
    );
    const added = wardrobe.items[wardrobe.items.length - 1];
    res.json({ success: true, data: { item: added } });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const wardrobe = await Wardrobe.findOne({ userId: req.user._id });
    if (!wardrobe || !wardrobe.items.id(req.params.itemId))
      return res.status(404).json({ success: false, error: 'Không tìm thấy món đồ' });

    await Wardrobe.updateOne(
      { userId: req.user._id },
      { $pull: { items: { _id: req.params.itemId } } }
    );
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = { addItem, getWardrobe, deleteItem };
