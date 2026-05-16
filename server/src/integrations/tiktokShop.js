const seasonalPalettes = require('../../../shared/seasonalPalettes');

const AFF_ID = process.env.TIKTOK_AFF_ID;

function getTikTokLinks(season, occasion) {
  const pal = seasonalPalettes[season];
  const keywords =
    pal?.outfitKeywords?.[occasion] ??
    pal?.outfitKeywords?.casual ??
    ['trang phục thanh lịch', 'phối đồ cơ bản', 'outfit đơn giản'];

  return keywords.map(kw => ({
    platform: 'tiktok',
    name: kw,
    url: `https://www.tiktok.com/search?q=${encodeURIComponent(kw)}${AFF_ID ? `&ttaf_id=${AFF_ID}` : ''}`,
    category: 'outfit',
  }));
}

module.exports = { getTikTokLinks };
