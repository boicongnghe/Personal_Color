const { getOutfitRules } = require('../../../shared/colorRules');

const getOutfitSuggestions = async (req, res, next) => {
  try {
    const { season } = req.params;
    const { occasion = 'casual', faceShape = 'oval', bodyType = 'hourglass' } = req.query;
    const rules = getOutfitRules(season, occasion, faceShape, bodyType);
    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOutfitSuggestions };
