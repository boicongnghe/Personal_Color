const AFF_ID = process.env.SHOPEE_AFF_ID;

async function getAffiliateLinks(keywords) {
  // TODO: call Shopee Affiliate API with keywords
  return keywords.map((kw) => ({
    platform: 'shopee',
    name: kw,
    url: `https://shopee.vn/search?keyword=${encodeURIComponent(kw)}&af_id=${AFF_ID}`,
  }));
}

module.exports = { getAffiliateLinks };
