const Wardrobe = require('../models/Wardrobe');

const addItem = async (req, res, next) => {
  try {
    const wardrobe = await Wardrobe.findOneAndUpdate(
      { userId: req.userId },
      { $push: { items: req.body } },
      { new: true, upsert: true }
    );
    const added = wardrobe.items[wardrobe.items.length - 1];
    res.json({ success: true, data: added });
  } catch (err) {
    next(err);
  }
};

const getWardrobe = async (req, res, next) => {
  try {
    const wardrobe = await Wardrobe.findOne({ userId: req.params.userId });
    res.json({ success: true, data: wardrobe });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await Wardrobe.updateOne(
      { userId: req.userId },
      { $pull: { items: { _id: req.params.itemId } } }
    );
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

module.exports = { addItem, getWardrobe, deleteItem };
