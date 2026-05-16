const shopee = require('./shopeeAffiliate');
const tiktok = require('./tiktokShop');

async function getRecommendations(keywords, isPremium) {
  const limit = isPremium ? keywords.length : Math.min(3, keywords.length);
  const slice = keywords.slice(0, limit);

  const [shopeeLinks, tiktokLinks] = await Promise.all([
    shopee.getAffiliateLinks(slice),
    isPremium ? tiktok.getAffiliateLinks(slice) : Promise.resolve([]),
  ]);

  return [...shopeeLinks, ...tiktokLinks];
}

module.exports = { getRecommendations };
