const jwt = require('jsonwebtoken');
const UserEvent = require('../models/UserEvent');

const ALLOWED_EVENTS = ['page_view', 'click', 'scroll_depth', 'session_end'];

const trackEvent = async (req, res, next) => {
  try {
    const { sessionId, event, page, value, metadata } = req.body;

    if (!sessionId || !event || !page) {
      return res.status(400).json({ success: false, error: 'sessionId, event, page are required' });
    }
    if (!ALLOWED_EVENTS.includes(event)) {
      return res.status(400).json({ success: false, error: 'Invalid event type' });
    }

    // Extract userId from optional Bearer token — never reject if absent or invalid
    let userId = null;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
        userId = decoded.userId || null;
      } catch { /* anonymous — fine */ }
    }

    await UserEvent.create({
      userId,
      sessionId: String(sessionId).slice(0, 64),
      event,
      page:  String(page).slice(0, 200),
      value: typeof value === 'number' ? value : undefined,
      metadata: metadata && typeof metadata === 'object' ? metadata : undefined,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const pctChange = (curr, prev) =>
  prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null;

const getMetrics = async (req, res, next) => {
  try {
    const now   = new Date();
    const day7  = new Date(now - 7  * 24 * 60 * 60 * 1000);
    const day14 = new Date(now - 14 * 24 * 60 * 60 * 1000);
    const day30 = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      allPageCounts,
      allDurations,
      topPages,
      topClicks,
      scrollData,
      dau,
      curPageCounts,
      curDurations,
      prevPageCounts,
      prevDurations,
    ] = await Promise.all([
      // All-time: sessions × page_view count
      UserEvent.aggregate([
        { $match: { event: 'page_view' } },
        { $group: { _id: '$sessionId', pageViews: { $sum: 1 } } },
      ]),
      // All-time: avg session duration (ms)
      UserEvent.aggregate([
        { $match: { event: 'session_end', value: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$value' } } },
      ]),
      // Most visited pages (all time)
      UserEvent.aggregate([
        { $match: { event: 'page_view' } },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Top clicked elements (all time)
      UserEvent.aggregate([
        { $match: { event: 'click', 'metadata.element': { $exists: true, $ne: '' } } },
        { $group: { _id: '$metadata.element', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Avg scroll depth per page (all time)
      UserEvent.aggregate([
        { $match: { event: 'scroll_depth', value: { $gt: 0 } } },
        { $group: { _id: '$page', avgScroll: { $avg: '$value' } } },
        { $sort: { avgScroll: -1 } },
        { $limit: 15 },
      ]),
      // Daily active unique sessions — last 30 days
      UserEvent.aggregate([
        { $match: { event: 'page_view', createdAt: { $gte: day30 } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sessions: { $addToSet: '$sessionId' },
        }},
        { $project: { date: '$_id', dau: { $size: '$sessions' }, _id: 0 } },
        { $sort: { date: 1 } },
      ]),
      // Current 7 days: page_view sessions
      UserEvent.aggregate([
        { $match: { event: 'page_view', createdAt: { $gte: day7 } } },
        { $group: { _id: '$sessionId', pageViews: { $sum: 1 } } },
      ]),
      // Current 7 days: avg session duration
      UserEvent.aggregate([
        { $match: { event: 'session_end', value: { $gt: 0 }, createdAt: { $gte: day7 } } },
        { $group: { _id: null, avg: { $avg: '$value' } } },
      ]),
      // Previous 7 days: page_view sessions
      UserEvent.aggregate([
        { $match: { event: 'page_view', createdAt: { $gte: day14, $lt: day7 } } },
        { $group: { _id: '$sessionId', pageViews: { $sum: 1 } } },
      ]),
      // Previous 7 days: avg session duration
      UserEvent.aggregate([
        { $match: { event: 'session_end', value: { $gt: 0 }, createdAt: { $gte: day14, $lt: day7 } } },
        { $group: { _id: null, avg: { $avg: '$value' } } },
      ]),
    ]);

    // ── All-time metrics ──────────────────────────────────────────────
    const totalSessions   = allPageCounts.length;
    const bouncedSessions = allPageCounts.filter(s => s.pageViews === 1).length;
    const bounceRate      = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;
    const totalPageViews  = allPageCounts.reduce((sum, s) => sum + s.pageViews, 0);
    const pagesPerSession = totalSessions > 0 ? totalPageViews / totalSessions : 0;
    const avgSessionDuration = allDurations[0]?.avg ?? 0;

    // ── Current week metrics ──────────────────────────────────────────
    const curTotal       = curPageCounts.length;
    const curBounced     = curPageCounts.filter(s => s.pageViews === 1).length;
    const curBounceRate  = curTotal > 0 ? (curBounced / curTotal) * 100 : 0;
    const curPageViews   = curPageCounts.reduce((sum, s) => sum + s.pageViews, 0);
    const curPPS         = curTotal > 0 ? curPageViews / curTotal : 0;
    const curAvgDuration = curDurations[0]?.avg ?? 0;

    // ── Previous week metrics ─────────────────────────────────────────
    const prevTotal       = prevPageCounts.length;
    const prevBounced     = prevPageCounts.filter(s => s.pageViews === 1).length;
    const prevBounceRate  = prevTotal > 0 ? (prevBounced / prevTotal) * 100 : 0;
    const prevPageViews   = prevPageCounts.reduce((sum, s) => sum + s.pageViews, 0);
    const prevPPS         = prevTotal > 0 ? prevPageViews / prevTotal : 0;
    const prevAvgDuration = prevDurations[0]?.avg ?? 0;

    res.json({
      success: true,
      data: {
        bounceRate:          Math.round(bounceRate * 10) / 10,
        avgSessionDuration:  Math.round(avgSessionDuration),
        pagesPerSession:     Math.round(pagesPerSession * 10) / 10,
        totalSessions,
        topPages:    topPages.map(p => ({ page: p._id, count: p.count })),
        topClicks:   topClicks.map(c => ({ element: c._id, count: c.count })),
        scrollDepth: scrollData.map(s => ({ page: s._id, avgScroll: Math.round(s.avgScroll) })),
        dau,
        weeklyChange: {
          bounceRate:         pctChange(curBounceRate,  prevBounceRate),
          avgSessionDuration: pctChange(curAvgDuration, prevAvgDuration),
          pagesPerSession:    pctChange(curPPS,         prevPPS),
          sessions:           pctChange(curTotal,       prevTotal),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { trackEvent, getMetrics };
