const { SePayPgClient } = require('sepay-pg-node');
const crypto = require('crypto');
const { getPrimaryClientUrl } = require('../config/clientUrls');

// Lazy-init: the SDK validates credentials at construction time,
// so we create the client only when it is first needed.
let _client = null;
function getClient() {
  if (!_client) {
    _client = new SePayPgClient({
      env:         process.env.SEPAY_ENV ?? 'sandbox',
      merchant_id: process.env.SEPAY_MERCHANT_ID,
      secret_key:  process.env.SEPAY_SECRET_KEY,
    });
  }
  return _client;
}

const PLANS = {
  '1m': { amount: 50000,  duration: 30,  label: '1 tháng' },
  '3m': { amount: 135000, duration: 90,  label: '3 tháng' },
  '6m': { amount: 240000, duration: 180, label: '6 tháng' },
};

/**
 * Build a SePay checkout session.
 * Returns checkoutURL, form fields (with HMAC signature), VietQR url,
 * and order metadata needed to persist a pending Subscription.
 *
 * @param {{ userId: string|import('mongoose').Types.ObjectId, plan?: '1m'|'3m'|'6m' }} opts
 */
function createCheckout({ userId, plan = '1m' }) {
  const client         = getClient();
  const selectedPlan   = PLANS[plan] ?? PLANS['1m'];
  const orderInvoice = `CLARITY${userId.toString().slice(-6).toUpperCase()}${Date.now()}`;
  const checkoutURL    = client.checkout.initCheckoutUrl();
  const clientUrl      = getPrimaryClientUrl();
  const fields         = client.checkout.initOneTimePaymentFields({
    payment_method:       'BANK_TRANSFER',
    order_invoice_number: orderInvoice,
    order_amount:         selectedPlan.amount,
    currency:             'VND',
    order_description:    `Clarity Premium ${selectedPlan.label} - ${userId}`,
    success_url: `${clientUrl}/upgrade-success?order=${orderInvoice}`,
    error_url:   `${clientUrl}/upgrade-failed`,
    cancel_url:  `${clientUrl}/upgrade`,
  });

  const bin     = process.env.BANK_BIN;
  const account = process.env.BANK_ACCOUNT;
  const owner   = process.env.BANK_OWNER ?? '';

  const qrUrl = `https://img.vietqr.io/image/${bin}-${account}-qr_only.png` +
    `?amount=${selectedPlan.amount}` +
    `&addInfo=${encodeURIComponent(orderInvoice)}` +
    `&accountName=${encodeURIComponent(owner)}`;

  return {
    checkoutURL,
    fields,
    orderInvoice,
    plan,
    amount:        selectedPlan.amount,
    duration:      selectedPlan.duration,
    label:         selectedPlan.label,
    qrUrl,
    bankName:      process.env.BANK_NAME ?? '',
    accountNumber: process.env.BANK_ACCOUNT ?? '',
    accountOwner:  process.env.BANK_OWNER ?? '',
    transferNote:  orderInvoice,
  };
}

/**
 * Verify an IPN request from SePay using HMAC-SHA256.
 * SePay sends the raw request body as JSON and puts the hex digest
 * in the `x-sepay-signature` header.
 *
 * @param {object} body       - parsed JSON body from the IPN request
 * @param {string} signature  - value of req.headers['x-sepay-signature']
 * @returns {boolean}
 */
function verifyIPN(body, signature) {
  const secret   = process.env.SEPAY_SECRET_KEY;
  if (!secret) return false;
  const data     = JSON.stringify(body);
  const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return expected === signature;
}

module.exports = { createCheckout, verifyIPN, PLANS };
