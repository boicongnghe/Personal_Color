const seasonalPalettes = require('../../../shared/seasonalPalettes');

const AFF_ID = process.env.SHOPEE_AFF_ID;

function getShopeeLinks(season, occasion) {
  const pal = seasonalPalettes[season];
  const keywords =
    pal?.outfitKeywords?.[occasion] ??
    pal?.outfitKeywords?.casual ??
    ['trang phục thanh lịch', 'phối đồ cơ bản', 'outfit đơn giản'];

  return keywords.map(kw => ({
    platform: 'shopee',
    name: kw,
    url: `https://shopee.vn/search?keyword=${encodeURIComponent(kw)}${AFF_ID ? `&aff_id=${AFF_ID}` : ''}`,
    category: 'outfit',
  }));
}

module.exports = { getShopeeLinks };
