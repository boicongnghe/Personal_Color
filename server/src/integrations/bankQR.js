const PLANS = {
  '1m': { amount: Number(process.env.BANK_AMOUNT_1M) || 50000,  duration: 30,  label: '1 tháng' },
  '3m': { amount: Number(process.env.BANK_AMOUNT_3M) || 135000, duration: 90,  label: '3 tháng' },
  '6m': { amount: Number(process.env.BANK_AMOUNT_6M) || 240000, duration: 180, label: '6 tháng' },
};

function createQRPayment({ userId, plan = '1m' }) {
  const selectedPlan = PLANS[plan] ?? PLANS['1m'];
  const bin     = process.env.BANK_BIN;
  const account = process.env.BANK_ACCOUNT;
  const desc    = `CLARITY ${userId.toString().slice(-6).toUpperCase()}`;

  const qrUrl = `https://img.vietqr.io/image/${bin}-${account}-qr_only.png` +
    `?amount=${selectedPlan.amount}` +
    `&addInfo=${encodeURIComponent(desc)}` +
    `&accountName=${encodeURIComponent(process.env.BANK_OWNER || '')}`;

  return {
    qrUrl,
    plan,
    amount:        selectedPlan.amount,
    duration:      selectedPlan.duration,
    label:         selectedPlan.label,
    bankName:      process.env.BANK_NAME || '',
    accountNumber: account || '',
    accountOwner:  process.env.BANK_OWNER || '',
    transferNote:  desc,
    orderId:       desc,
  };
}

module.exports = { createQRPayment, PLANS };
