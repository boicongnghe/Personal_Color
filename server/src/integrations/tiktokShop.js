const AFF_ID = process.env.TIKTOK_AFF_ID;

async function getAffiliateLinks(keywords) {
  // TODO: call TikTok Shop Affiliate API with keywords
  return keywords.map((kw) => ({
    platform: 'tiktok',
    name: kw,
    url: `https://www.tiktok.com/search?q=${encodeURIComponent(kw)}&aff_id=${AFF_ID}`,
  }));
}

module.exports = { getAffiliateLinks };
