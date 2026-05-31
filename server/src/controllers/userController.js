const User = require('../models/User');
const Scan = require('../models/Scan');
const { BODY_TYPES, classifyBodyType } = require('../utils/bodyClassifier');

const saveBodyProfile = async (req, res, next) => {
  try {
    const { gender, height, weight, bust, waist, hips, age, bodyShape, budget } = req.body;

    if (!['female', 'male'].includes(gender)) {
      return res.status(400).json({ success: false, error: 'gender phải là female hoặc male' });
    }

    // Build $set using dot-notation so unrelated bodyProfile fields (e.g. personPhotoBuffer) are preserved
    const setFields = {
      'bodyProfile.gender':    gender,
      'bodyProfile.updatedAt': new Date(),
    };

    if (age != null && age !== '') setFields['bodyProfile.age']       = parseFloat(age) || undefined;
    if (bodyShape)                 setFields['bodyProfile.bodyShape'] = bodyShape;
    if (budget)                    setFields['bodyProfile.budget']    = budget;

    let bodyType = null;
    let typeInfo = null;

    // Classify body type only when all 5 measurements are provided
    const hasMeasurements = height && weight && bust && waist && hips;
    if (hasMeasurements) {
      const nums = {
        height: parseFloat(height),
        weight: parseFloat(weight),
        bust:   parseFloat(bust),
        waist:  parseFloat(waist),
        hips:   parseFloat(hips),
      };
      for (const [k, v] of Object.entries(nums)) {
        if (!v || v <= 0) {
          return res.status(400).json({ success: false, error: `${k} phải lớn hơn 0` });
        }
      }
      bodyType = classifyBodyType(gender, nums.bust, nums.waist, nums.hips, nums.height, nums.weight);
      Object.assign(setFields, {
        'bodyProfile.height':   nums.height,
        'bodyProfile.weight':   nums.weight,
        'bodyProfile.bust':     nums.bust,
        'bodyProfile.waist':    nums.waist,
        'bodyProfile.hips':     nums.hips,
        'bodyProfile.bodyType': bodyType,
      });
      typeInfo = BODY_TYPES[gender]?.[bodyType];
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: setFields },
      { new: true }
    );

    res.json({
      success: true,
      data: {
        bodyProfile: user.bodyProfile,
        bodyType,
        label:           typeInfo?.label           || bodyType || null,
        emoji:           typeInfo?.emoji           || '',
        description:     typeInfo?.description     || '',
        characteristics: typeInfo?.characteristics || [],
        tips:            typeInfo?.tips            || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

const getBodyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('bodyProfile');
    res.json({ success: true, data: { bodyProfile: user?.bodyProfile || null } });
  } catch (err) {
    next(err);
  }
};

const getAllUsersAdmin = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-passwordHash -bodyProfile.personPhotoBuffer -bodyProfile.personPhotoMime -bodyProfile.personPhotoUpdated')
      .sort({ createdAt: -1 });

    const userIds = users.map(u => u._id);
    const latestScans = await Scan.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $sort: { scanDate: -1 } },
      { $group: { _id: '$userId', season: { $first: '$season' } } },
    ]);

    const scanMap = {};
    latestScans.forEach(s => { scanMap[s._id.toString()] = s.season; });

    const result = users.map(u => ({
      _id:              u._id,
      displayName:      u.displayName,
      email:            u.email,
      avatarUrl:        u.avatarUrl,
      subscriptionTier: u.subscriptionTier,
      scanCount:        u.scanCount,
      isAdmin:          u.isAdmin,
      isBanned:         u.isBanned ?? false,
      createdAt:        u.createdAt,
    }));

    return res.json({ success: true, data: { users: result, total: result.length } });
  } catch (err) {
    next(err);
  }
};

const banUserAdmin = async (req, res, next) => {
  try {
    const { isBanned } = req.body;
    if (typeof isBanned !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isBanned phải là boolean' });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'Không thể tự khóa tài khoản mình' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBanned } },
      { new: true }
    ).select('-passwordHash -bodyProfile');
    if (!user) return res.status(404).json({ success: false, error: 'Không tìm thấy user' });
    return res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

const updateUserTierAdmin = async (req, res, next) => {
  try {
    const { tier } = req.body;
    if (!['free', 'premium'].includes(tier)) {
      return res.status(400).json({ success: false, error: 'tier phải là free hoặc premium' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { subscriptionTier: tier } },
      { new: true }
    ).select('-passwordHash -bodyProfile');
    if (!user) return res.status(404).json({ success: false, error: 'Không tìm thấy user' });
    return res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.userId).select('favoriteProductIds');
    const isFav = user.favoriteProductIds.some(id => id.toString() === productId);
    const update = isFav
      ? { $pull: { favoriteProductIds: productId } }
      : { $addToSet: { favoriteProductIds: productId } };
    const updated = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('favoriteProductIds');
    res.json({
      success: true,
      data: { favoriteProductIds: updated.favoriteProductIds.map(id => id.toString()) },
    });
  } catch (err) {
    next(err);
  }
};

const uploadAvatarController = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Không có file ảnh' });
    // Cloudinary returns the full CDN URL in req.file.path
    const avatarUrl = req.file.path || req.file.secure_url || `/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.userId, { $set: { avatarUrl } });
    res.json({ success: true, data: { avatarUrl } });
  } catch (err) {
    next(err);
  }
};

module.exports = { saveBodyProfile, getBodyProfile, getAllUsersAdmin, updateUserTierAdmin, banUserAdmin, uploadAvatarController, toggleFavorite };
