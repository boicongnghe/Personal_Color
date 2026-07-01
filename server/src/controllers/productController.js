const { fetchLinkPreview } = require('../utils/linkPreview');
const Product = require('../models/Product');
const Scan    = require('../models/Scan');

const previewLink = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'Thiếu URL' });
    try { new URL(url); } catch {
      return res.status(400).json({ success: false, error: 'URL không hợp lệ' });
    }
    const preview = await fetchLinkPreview(url);
    return res.json(preview);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      title, image, price, description, affiliateUrl, platform,
      seasons, bodyTypes, genders, occasions, category, tags,
    } = req.body;

    if (!title || !affiliateUrl) {
      return res.status(400).json({ success: false, error: 'Thiếu tên sản phẩm hoặc link affiliate' });
    }

    const product = await Product.create({
      addedBy:  req.user._id,
      title, image, price, description, affiliateUrl, platform,
      seasons:   seasons   ?? [],
      bodyTypes: bodyTypes ?? [],
      genders:   genders   ?? ['unisex'],
      occasions: occasions ?? ['all'],
      category:  category  ?? 'other',
      tags:      tags      ?? [],
    });

    return res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

const getProductsForUser = async (req, res, next) => {
  try {
    const userId  = req.user._id;
    const scan    = await Scan.findOne({ userId }).sort({ scanDate: -1 });

    const season   = scan?.season                         ?? null;
    const gender   = req.user.bodyProfile?.gender         ?? null;
    const bodyType = req.user.bodyProfile?.bodyType       ?? null;
    const occasion = req.query.occasion                   ?? 'all';

    const query     = { isActive: true };
    const andClauses = [];

    if (season) {
      andClauses.push({ $or: [{ seasons: season }, { seasons: { $size: 0 } }] });
    }
    if (gender) {
      const otherGender = gender === 'male' ? 'female' : 'male';
      andClauses.push({
        $or: [
          { genders: gender },                          // explicitly tagged for this gender
          { genders: { $size: 0 } },                    // empty = no restriction
          { $and: [                                     // unisex but NOT tagged for opposite gender
            { genders: 'unisex' },
            { genders: { $not: { $elemMatch: { $eq: otherGender } } } },
          ]},
        ],
      });
    }
    if (bodyType) {
      andClauses.push({ $or: [{ bodyTypes: bodyType }, { bodyTypes: { $size: 0 } }] });
    }
    if (occasion && occasion !== 'all') {
      andClauses.push({ $or: [{ occasions: occasion }, { occasions: 'all' }] });
    }
    if (andClauses.length > 0) query.$and = andClauses;

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.json({ success: true, data: { products, total: products.length } });
  } catch (err) {
    next(err);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: { products } });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true }
    );
    if (!product) return res.status(404).json({ success: false, error: 'Không tìm thấy' });
    return res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

const trackClick = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, error: 'Không tìm thấy' });
    return res.json({ success: true, data: { affiliateUrl: product.affiliateUrl } });
  } catch (err) {
    next(err);
  }
};

module.exports = { previewLink, createProduct, getProductsForUser, getAllProducts, updateProduct, deleteProduct, trackClick };
