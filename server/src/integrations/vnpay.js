const crypto = require('crypto');
const querystring = require('querystring');

function sortObject(obj) {
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {});
}

function createPaymentUrl({ userId, ipAddr }) {
  const tmnCode   = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl    = process.env.VNPAY_URL;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  if (!tmnCode || !secretKey) {
    throw Object.assign(new Error('VNPay credentials not configured'), { status: 503 });
  }
  const amount    = 79000;
  const txnRef    = `CLARITY_${userId}_${Date.now()}`;

  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const createDate = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

  const params = sortObject({
    vnp_Version:    '2.1.0',
    vnp_Command:    'pay',
    vnp_TmnCode:    tmnCode,
    vnp_Amount:     amount * 100,
    vnp_CreateDate: createDate,
    vnp_CurrCode:   'VND',
    vnp_IpAddr:     ipAddr || '127.0.0.1',
    vnp_Locale:     'vn',
    vnp_OrderInfo:  `Clarity Premium - ${userId}`,
    vnp_OrderType:  'other',
    vnp_ReturnUrl:  returnUrl,
    vnp_TxnRef:     txnRef,
  });

  const signData = querystring.stringify(params);
  const hmac = crypto.createHmac('sha512', secretKey);
  const secured = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const paymentUrl = `${vnpUrl}?${querystring.stringify({ ...params, vnp_SecureHash: secured })}`;
  return { paymentUrl, txnRef };
}

function verifyCallback(vnpParams) {
  const secureHash = vnpParams.vnp_SecureHash;
  const params = { ...vnpParams };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sorted = sortObject(params);
  const signData = querystring.stringify(sorted);
  const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
  const checkHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (checkHash !== secureHash) return { success: false, reason: 'Invalid signature' };
  if (vnpParams.vnp_ResponseCode !== '00') return { success: false, reason: `Payment failed: ${vnpParams.vnp_ResponseCode}` };
  return { success: true, txnRef: vnpParams.vnp_TxnRef };
}

module.exports = { createPaymentUrl, verifyCallback };
