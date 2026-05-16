const { getOutfitRules } = require('../../../shared/colorRules');
const { recommend } = require('../integrations/productRecommender');
const seasonalPalettes = require('../../../shared/seasonalPalettes');

const getOutfitSuggestions = async (req, res, next) => {
  try {
    const { season } = req.params;
    const { occasion = 'casual', faceShape, bodyType } = req.query;

    if (!seasonalPalettes[season]) {
      return res.status(400).json({ success: false, error: `Unknown season: ${season}` });
    }

    const tier = req.user ? req.user.subscriptionTier : 'free';
    const outfitRules = getOutfitRules(season, occasion, faceShape, bodyType);
    const products = recommend({ season, occasion, tier });

    res.json({ success: true, data: { outfitRules, products } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOutfitSuggestions };
