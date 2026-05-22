const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  addedBy:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true },
  image:        { type: String },
  price:        { type: Number },
  description:  { type: String },
  affiliateUrl: { type: String, required: true },
  platform:     { type: String, enum: ['shopee', 'tiktok', 'lazada', 'tiki', 'other'] },

  seasons:   [{ type: String }],
  bodyTypes: [{ type: String }],
  genders:   [{ type: String }],
  occasions: [{ type: String }],
  category:  { type: String },
  tags:      [String],

  isActive:   { type: Boolean, default: true },
  clickCount: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
