const fetch   = require('node-fetch');
const cheerio = require('cheerio');

async function fetchLinkPreview(url) {
  try {
    const response = await fetch(url, {
      timeout: 8000,
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control':   'no-cache',
        'Pragma':          'no-cache',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Trang chặn tự động lấy thông tin (có thể do CAPTCHA). Vui lòng điền thủ công.',
        data: { url, platform: detectPlatform(url) },
      };
    }

    const html = await response.text();
    const $    = cheerio.load(html);

    const getMeta = (property) =>
      $(`meta[property="${property}"]`).attr('content') ||
      $(`meta[name="${property}"]`).attr('content') || null;

    const platform = detectPlatform(url);

    let title = getMeta('og:title') || getMeta('twitter:title') || $('title').text() || null;
    let image = getMeta('og:image') || getMeta('twitter:image') || null;
    let price = getMeta('product:price:amount') || getMeta('og:price:amount') || null;
    let description = getMeta('og:description') || getMeta('description') || null;

    if (title) {
      title = title
        .replace(/\s*[|\-]\s*(Shopee|TikTok Shop|Lazada|Tiki).*$/i, '')
        .trim();
    }

    if (!price && description) {
      const priceMatch = description.match(/(\d{1,3}(?:\.\d{3})*)\s*[đ₫]/);
      if (priceMatch) price = priceMatch[1].replace(/\./g, '');
    }

    return {
      success: true,
      data: {
        title:       title?.slice(0, 200) ?? null,
        image:       image ?? null,
        price:       price ? Number(price) : null,
        description: description?.slice(0, 300) ?? null,
        platform,
        url,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: 'Không kết nối được. Vui lòng điền thủ công.',
      data: { url, platform: detectPlatform(url) },
    };
  }
}

function detectPlatform(url) {
  if (url.includes('shopee.vn') || url.includes('shope.ee')) return 'shopee';
  if (url.includes('tiktok.com') || url.includes('s.tiktok'))  return 'tiktok';
  if (url.includes('lazada.vn'))  return 'lazada';
  if (url.includes('tiki.vn'))    return 'tiki';
  return 'other';
}

module.exports = { fetchLinkPreview };
