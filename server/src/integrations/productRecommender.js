const { getShopeeLinks } = require('./shopeeAffiliate');
const { getTikTokLinks } = require('./tiktokShop');

const WARM_SEASONS = new Set([
  'autumn-warm', 'autumn-deep', 'autumn-rich', 'autumn-muted',
  'spring-warm', 'spring-light', 'spring-bright', 'spring-clear',
]);

function recommend({ season, occasion, tier }) {
  if (tier !== 'premium') {
    return getShopeeLinks(season, occasion).slice(0, 3).map(item => ({
      ...item,
      url: item.url.replace(/[&?]aff_id=[^&]*/g, ''),
    }));
  }

  const shopee = getShopeeLinks(season, occasion);
  const tiktok = getTikTokLinks(season, occasion);
  const isWarm = WARM_SEASONS.has(season);
  const shopeeAffId = process.env.SHOPEE_AFF_ID;
  const tiktokAffId = process.env.TIKTOK_AFF_ID;

  const extras = [
    {
      platform: 'shopee',
      name: `son môi ${isWarm ? 'đỏ gạch' : 'hồng đất'}`,
      url: `https://shopee.vn/search?keyword=son+moi${shopeeAffId ? `&aff_id=${shopeeAffId}` : ''}`,
      category: 'makeup',
    },
    {
      platform: 'shopee',
      name: `trang sức ${isWarm ? 'gold' : 'bạc'}`,
      url: `https://shopee.vn/search?keyword=trang+suc${shopeeAffId ? `&aff_id=${shopeeAffId}` : ''}`,
      category: 'accessory',
    },
    {
      platform: 'shopee',
      name: `túi xách ${occasion === 'party' ? 'dự tiệc' : 'hàng ngày'}`,
      url: `https://shopee.vn/search?keyword=tui+xach${shopeeAffId ? `&aff_id=${shopeeAffId}` : ''}`,
      category: 'accessory',
    },
    {
      platform: 'tiktok',
      name: `${season} makeup look`,
      url: `https://www.tiktok.com/search?q=${encodeURIComponent(`${season} makeup look`)}${tiktokAffId ? `&ttaf_id=${tiktokAffId}` : ''}`,
      category: 'makeup',
    },
    {
      platform: 'tiktok',
      name: `${season} ${occasion} outfit`,
      url: `https://www.tiktok.com/search?q=${encodeURIComponent(`${season} ${occasion} outfit`)}${tiktokAffId ? `&ttaf_id=${tiktokAffId}` : ''}`,
      category: 'outfit',
    },
    {
      platform: 'tiktok',
      name: `phụ kiện ${isWarm ? 'gold tone' : 'silver tone'}`,
      url: `https://www.tiktok.com/search?q=${encodeURIComponent(isWarm ? 'gold tone accessories' : 'silver tone accessories')}${tiktokAffId ? `&ttaf_id=${tiktokAffId}` : ''}`,
      category: 'accessory',
    },
  ];

  return [...shopee, ...tiktok, ...extras].slice(0, 12);
}

module.exports = { recommend };
