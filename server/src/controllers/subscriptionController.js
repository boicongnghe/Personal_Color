const User                = require('../models/User');
const Subscription        = require('../models/Subscription');
const Scan                = require('../models/Scan');
const { createCheckout, verifyIPN, PLANS: SEPAY_PLANS } = require('../integrations/sepay');
const { PLANS: QR_PLANS } = require('../integrations/bankQR');
const expireSubscriptions = require('../utils/expireSubscriptions');

// Merge plan metadata — SePay amounts are authoritative, QR_PLANS is fallback
const PLANS = SEPAY_PLANS;

const VALID_PLANS = ['1m', '3m', '6m'];

/* ─────────────────────────────────────────
   GET /api/subscription
   Returns the user's current active sub.
───────────────────────────────────────── */
const getSubscription = async (req, res, next) => {
  try {
    await expireSubscriptions(req.user._id);

    const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    if (!sub) {
      await User.findByIdAndUpdate(req.user._id, { subscriptionTier: 'free' });
      return res.json({ success: true, data: { tier: 'free', daysRemaining: null } });
    }

    const daysRemaining = sub.endDate
      ? Math.max(0, Math.ceil((sub.endDate - Date.now()) / 86400000))
      : null;

    res.json({
      success: true,
      data: {
        tier: sub.tier,
        plan: sub.plan,
        startDate: sub.startDate,
        endDate: sub.endDate,
        daysRemaining,
        status: sub.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   GET /api/subscription/plans
   Returns pricing info for all plans.
───────────────────────────────────────── */
const getPlans = (_req, res) => {
  res.json({
    success: true,
    data: {
      plans: [
        { id: '1m', label: '1 tháng',  amount: PLANS['1m'].amount, duration: 30,  perMonth: PLANS['1m'].amount,                        saving: 0 },
        { id: '3m', label: '3 tháng',  amount: PLANS['3m'].amount, duration: 90,  perMonth: Math.round(PLANS['3m'].amount / 3),  saving: PLANS['1m'].amount * 3 - PLANS['3m'].amount },
        { id: '6m', label: '6 tháng',  amount: PLANS['6m'].amount, duration: 180, perMonth: Math.round(PLANS['6m'].amount / 6), saving: PLANS['1m'].amount * 6 - PLANS['6m'].amount },
      ],
    },
  });
};

/* ─────────────────────────────────────────
   POST /api/subscription/upgrade
   Creates (or returns an existing) pending SePay order.
───────────────────────────────────────── */
const createUpgrade = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const plan   = VALID_PLANS.includes(req.body.plan) ? req.body.plan : '1m';

    // Re-use an existing pending order that hasn't expired yet
    const existing = await Subscription.findOne({
      userId,
      status: 'pending',
      plan,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (existing && existing.checkoutURL) {
      return res.json({
        success: true,
        data: {
          orderInvoice:  existing.orderId,
          checkoutURL:   existing.checkoutURL,
          qrUrl:         existing.qrUrl,
          plan:          existing.plan,
          amount:        existing.amount,
          label:         PLANS[existing.plan]?.label ?? existing.plan,
          expiresAt:     existing.expiresAt,
          bankName:      process.env.BANK_NAME ?? '',
          accountNumber: process.env.BANK_ACCOUNT ?? '',
          accountOwner:  process.env.BANK_OWNER ?? '',
          transferNote:  existing.orderId,
          reused:        true,
        },
      });
    }

    // Build a new SePay checkout
    const checkout = createCheckout({ userId: userId.toString(), plan });

    // Pending order expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Subscription.create({
      userId,
      tier:        'premium',
      status:      'pending',
      plan,
      orderId:     checkout.orderInvoice,
      txnRef:      checkout.orderInvoice,   // keep txnRef for backwards compat
      checkoutURL: checkout.checkoutURL,
      qrUrl:       checkout.qrUrl,
      amount:      checkout.amount,
      duration:    checkout.duration,
      expiresAt,
    });

    res.json({
      success: true,
      data: {
        orderInvoice:  checkout.orderInvoice,
        checkoutURL:   checkout.checkoutURL,
        fields:        checkout.fields,
        qrUrl:         checkout.qrUrl,
        plan:          checkout.plan,
        amount:        checkout.amount,
        label:         checkout.label,
        expiresAt,
        bankName:      checkout.bankName,
        accountNumber: checkout.accountNumber,
        accountOwner:  checkout.accountOwner,
        transferNote:  checkout.transferNote,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   POST /api/subscription/sepay-ipn
   Webhook called by SePay when a payment succeeds.
   Handles both SePay PG format and bank-monitoring webhook format.
   NO auth middleware — SePay calls this directly.
───────────────────────────────────────── */
const handleSepayIPN = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    console.log('[SePay IPN] Received:', JSON.stringify(body));

    const signature = req.headers['x-sepay-signature'] ?? '';

    // Verify signature only when a secret key is configured
    if (process.env.SEPAY_SECRET_KEY && signature && !verifyIPN(body, signature)) {
      console.error('[SePay IPN] Invalid signature — rejecting');
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // ── Normalize field names ──────────────────────────────────────
    // SePay PG format:          transaction_status, order_invoice_number, transaction_amount
    // SePay bank-monitor format: (no status field), code, amount_in
    const isPGFormat    = 'transaction_status' in body || 'order_invoice_number' in body;
    const isBankFormat  = 'amount_in' in body || 'code' in body;

    let orderInvoice, paidAmount, isSuccess;

    // ── Extract orderInvoice + paidAmount from any SePay format ──────
    // SePay PG format:           order_invoice_number, transaction_amount, transaction_content
    // SePay bank-monitor format: code (may be null), transferAmount, content, description
    const rawCode = body.order_invoice_number ?? body.code;  // null in bank-monitor

    // Bank-monitor sends the order ID inside `content` and `description`
    const contentStr = body.transaction_content   // SePay PG
                    ?? body.content               // SePay bank-monitor (primary)
                    ?? body.description           // SePay bank-monitor (fallback)
                    ?? '';
    const contentMatch = contentStr.match(/CLARITY\w+/)?.[0];

    orderInvoice = rawCode ?? contentMatch;

    // Bank-monitor uses `transferAmount`; PG uses `transaction_amount` or `amount_in`
    paidAmount = Number(body.transaction_amount ?? body.amount_in ?? body.transferAmount) || 0;

    // Bank-monitor: success = incoming transfer with positive amount (no status field)
    // PG: success = transaction_status === 'success'
    const pgStatus = body.transaction_status;
    isSuccess = pgStatus
      ? pgStatus === 'success'
      : paidAmount > 0 && body.transferType !== 'out';

    if (!isSuccess) {
      console.log('[SePay IPN] Not a successful payment — ignoring');
      return res.json({ success: true, message: 'ignored' });
    }

    if (!orderInvoice) {
      console.error('[SePay IPN] Could not extract order invoice from payload');
      return res.status(400).json({ success: false, error: 'Missing order invoice' });
    }

    // Find subscription — accept pending OR expired (IPN can arrive after the 10-min UI window)
    const sub = await Subscription.findOne({
      $or: [{ orderId: orderInvoice }, { txnRef: orderInvoice }],
      status: { $in: ['pending', 'expired'] },
    }).sort({ createdAt: -1 });

    // Idempotency: already activated by a previous IPN retry
    if (!sub) {
      const already = await Subscription.findOne({
        $or: [{ orderId: orderInvoice }, { txnRef: orderInvoice }],
        status: 'active',
      });
      if (already) {
        console.log(`[SePay IPN] Order ${orderInvoice} already active — idempotent OK`);
        return res.json({ success: true });
      }
      console.error(`[SePay IPN] No subscription found for order ${orderInvoice}`);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Verify paid amount is sufficient (allow 1% tolerance for rounding)
    if (paidAmount > 0 && paidAmount < sub.amount * 0.99) {
      console.error(`[SePay IPN] Underpayment: expected ${sub.amount}, got ${paidAmount}`);
      return res.status(400).json({ success: false, error: 'Insufficient amount' });
    }

    const startDate = new Date();
    const endDate   = new Date(Date.now() + (sub.duration ?? 30) * 24 * 60 * 60 * 1000);

    await sub.updateOne({
      status:     'active',
      startDate,
      endDate,
      paidAt:     startDate,
      paidAmount,
    });

    await User.findByIdAndUpdate(sub.userId, {
      subscriptionTier: 'premium',
      subscriptionMeta: { plan: sub.plan, startDate, endDate },
    });

    console.log(`[SePay IPN] Upgraded user ${sub.userId} to premium (plan: ${sub.plan})`);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   GET /api/subscription/status/:orderInvoice
   Lets the client poll for payment confirmation.
───────────────────────────────────────── */
const checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderInvoice } = req.params;
    const userId = req.user._id;

    const sub = await Subscription.findOne({ orderId: orderInvoice, userId });
    if (!sub) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const now        = Date.now();
    const expired    = sub.expiresAt ? sub.expiresAt < new Date() : false;
    const secondsLeft = sub.expiresAt
      ? Math.max(0, Math.round((sub.expiresAt - now) / 1000))
      : null;

    res.json({
      success: true,
      data: {
        status:      sub.status,
        expired,
        expiresAt:   sub.expiresAt,
        secondsLeft,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   POST /api/subscription/confirm-payment
   Legacy manual-confirm endpoint (kept for backwards compat).
───────────────────────────────────────── */
const confirmPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, error: 'orderId is required' });

    const pending = await Subscription.findOne({
      $or: [{ txnRef: orderId }, { orderId }],
      userId: req.user._id,
    });
    if (!pending) return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng' });

    const planDuration = (PLANS[pending.plan] ?? PLANS['1m']).duration;
    const startDate    = new Date();
    const endDate      = new Date(Date.now() + planDuration * 24 * 60 * 60 * 1000);
    const confirmedAmount = pending.amount || (PLANS[pending.plan] ?? PLANS['1m']).amount;

    await pending.updateOne({
      status:     'active',
      startDate,
      endDate,
      paidAt:     startDate,
      paidAmount: confirmedAmount,
    });
    await User.findByIdAndUpdate(req.user._id, { subscriptionTier: 'premium' });

    res.json({
      success: true,
      data: { tier: 'premium', plan: pending.plan, endDate, daysRemaining: planDuration },
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   GET /api/subscription/admin/stats
   Admin-only aggregated dashboard statistics.
───────────────────────────────────────── */
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();

    // ── Basic counts ──────────────────────────────
    const [totalUsers, premiumUsers, totalScans] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ subscriptionTier: 'premium' }),
      Scan.countDocuments(),
    ]);

    // ── Build last-6-month buckets ────────────────
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: MONTH_LABELS[d.getMonth()] });
    }
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // ── Monthly revenue ───────────────────────────
    const revenueAgg = await Subscription.aggregate([
      { $match: { status: 'active', paidAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } }, revenue: { $sum: '$paidAmount' }, subs: { $sum: 1 } } },
    ]);
    const revenueMap = {};
    revenueAgg.forEach(r => { revenueMap[`${r._id.year}-${r._id.month}`] = r; });
    const monthlyRevenue = months.map(m => ({
      month: m.label,
      revenue: revenueMap[`${m.year}-${m.month}`]?.revenue || 0,
      subscriptions: revenueMap[`${m.year}-${m.month}`]?.subs || 0,
    }));

    // ── Monthly new users ─────────────────────────
    const userAgg = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    ]);
    const userMap = {};
    userAgg.forEach(u => { userMap[`${u._id.year}-${u._id.month}`] = u.count; });
    const userGrowth = months.map(m => ({ month: m.label, users: userMap[`${m.year}-${m.month}`] || 0 }));

    // ── This month vs last month ──────────────────
    const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [thisMonthAgg, lastMonthAgg, totalRevenueAgg] = await Promise.all([
      Subscription.aggregate([
        { $match: { status: 'active', paidAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' }, count: { $sum: 1 } } },
      ]),
      Subscription.aggregate([
        { $match: { status: 'active', paidAt: { $gte: startOfLastMonth, $lt: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
      Subscription.aggregate([
        { $match: { status: 'active', paidAmount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
    ]);
    const thisMonthRevenue = thisMonthAgg[0]?.total || 0;
    const lastMonthRevenue = lastMonthAgg[0]?.total || 0;
    const totalRevenue     = totalRevenueAgg[0]?.total || 0;
    const growth = lastMonthRevenue ? parseFloat(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)) : 0;

    // ── Weekly revenue (last 7 days by day-of-week) ─
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyAgg = await Subscription.aggregate([
      { $match: { status: 'active', paidAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dayOfWeek: '$paidAt' }, revenue: { $sum: '$paidAmount' } } },
    ]);
    const weekMap = {};
    weeklyAgg.forEach(d => { weekMap[d._id] = d.revenue; });
    const DAY_LABELS = ['CN','T2','T3','T4','T5','T6','T7'];
    const weeklyRevenue = [1,2,3,4,5,6,7].map(d => ({ day: DAY_LABELS[d-1], revenue: weekMap[d] || 0 }));

    // ── Recent transactions ───────────────────────
    const recentTxns = await Subscription.find({ status: 'active', paidAmount: { $gt: 0 } })
      .sort({ paidAt: -1 }).limit(10)
      .populate('userId', 'displayName email avatarUrl');

    // ── Color distribution from Scans ─────────────
    const colorAgg = await Scan.aggregate([
      { $group: { _id: '$season', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        premiumUsers,
        totalRevenue,
        thisMonthRevenue,
        totalScans,
        growth,
        avgPerUser: premiumUsers ? Math.round(totalRevenue / premiumUsers) : 0,
        conversionRate: totalUsers ? parseFloat((premiumUsers / totalUsers * 100).toFixed(1)) : 0,
        monthlyRevenue,
        userGrowth,
        weeklyRevenue,
        recentTransactions: recentTxns.map(s => ({
          user:      s.userId?.displayName || s.userId?.email || 'Unknown',
          avatarUrl: s.userId?.avatarUrl || null,
          amount:    s.paidAmount || s.amount || 0,
          plan:      s.plan,
          date:      s.paidAt || s.createdAt,
        })),
        colorDistribution: colorAgg.map(c => ({ season: c._id || 'Unknown', count: c.count })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSubscription, getPlans, createUpgrade, handleSepayIPN, checkPaymentStatus, confirmPayment, getAdminStats };
