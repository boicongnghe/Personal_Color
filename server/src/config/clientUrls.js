const DEFAULT_CLIENT_URL = 'https://claritycom.store';

const splitUrls = (value) =>
  (value || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

const getConfiguredClientUrls = () => {
  const urls = [
    process.env.CLIENT_URL,
    ...splitUrls(process.env.CLIENT_URLS),
    DEFAULT_CLIENT_URL,
    'https://www.claritycom.store',
    'https://clarity.io.vn',
    'https://www.clarity.io.vn',
    'http://localhost:5173',
  ].filter(Boolean);

  return [...new Set(urls)];
};

const getPrimaryClientUrl = () =>
  process.env.CLIENT_URL || splitUrls(process.env.CLIENT_URLS)[0] || DEFAULT_CLIENT_URL;

module.exports = {
  getConfiguredClientUrls,
  getPrimaryClientUrl,
};
