const crypto = require('crypto');
const querystring = require('querystring');

const VNPAY_URL = process.env.VNPAY_URL;
const TMN_CODE = process.env.VNPAY_TMN_CODE;
const HASH_SECRET = process.env.VNPAY_HASH_SECRET;
const RETURN_URL = process.env.VNPAY_RETURN_URL;

function createPaymentUrl(orderId, amount, ipAddr) {
  const date = new Date();
  const createDate = date.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: TMN_CODE,
    vnp_Amount: amount * 100,
    vnp_CreateDate: createDate,
    vnp_CurrCode: 'VND',
    vnp_IpAddr: ipAddr,
    vnp_Locale: 'vn',
    vnp_OrderInfo: `Clarity Premium - ${orderId}`,
    vnp_OrderType: 'other',
    vnp_ReturnUrl: RETURN_URL,
    vnp_TxnRef: orderId,
  };

  const sorted = Object.keys(params).sort().reduce((acc, k) => ({ ...acc, [k]: params[k] }), {});
  const signData = querystring.stringify(sorted);
  const hmac = crypto.createHmac('sha512', HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return `${VNPAY_URL}?${signData}&vnp_SecureHash=${signed}`;
}

function verifyReturn(query) {
  const { vnp_SecureHash, ...rest } = query;
  const sorted = Object.keys(rest).sort().reduce((acc, k) => ({ ...acc, [k]: rest[k] }), {});
  const signData = querystring.stringify(sorted);
  const hmac = crypto.createHmac('sha512', HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  return signed === vnp_SecureHash;
}

module.exports = { createPaymentUrl, verifyReturn };
