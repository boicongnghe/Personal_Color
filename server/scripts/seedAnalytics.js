'use strict';

/**
 * Seed realistic UserEvent analytics data for Clarity app demo.
 *
 * Period  : 25/05/2026 → 14/06/2026
 * Users   : 75 total, ~90% premium
 * Context : FPT university class demo — peak traffic 08–13/06
 *
 * Run: node server/scripts/seedAnalytics.js --force
 */

const path = require('path');
// Try several common .env locations (Railway env vars are injected at runtime)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const mongoose = require('mongoose');
const UserEvent = require('../src/models/UserEvent');

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Pick a random item by weight. Items must have { w, v } shape. */
function wpick(items) {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const item of items) { r -= item.w; if (r <= 0) return item.v; }
  return items[items.length - 1].v;
}

const addMs = (d, ms) => new Date(d.getTime() + ms);

// ─── Page scroll-depth targets (%) ───────────────────────────────────────────

const PAGE_SCROLL = {
  '/home':            55,
  '/scan':            68,
  '/analysis-result': 78,
  '/outfits':         71,
  '/wardrobe':        60,
  '/premium-upgrade': 82,
  '/profile':         48,
  '/smart-advisor':   65,
  '/settings':        40,
};

// ─── Per-page weighted click elements ────────────────────────────────────────

const PAGE_CLICKS = {
  '/home': [
    { w: 9, v: 'Bắt đầu phân tích' },
    { w: 7, v: 'Quét khuôn mặt' },
    { w: 5, v: 'Xem gợi ý outfit' },
    { w: 4, v: 'Tủ đồ của tôi' },
    { w: 3, v: 'Nâng cấp Premium' },
    { w: 2, v: 'Trợ lý thông minh' },
  ],
  '/scan': [
    { w: 8, v: 'Tải ảnh lên' },
    { w: 6, v: 'Chụp ảnh' },
  ],
  '/analysis-result': [
    { w: 9, v: 'Xem gợi ý outfit' },
    { w: 5, v: 'Lưu kết quả' },
    { w: 3, v: 'Bắt đầu phân tích' },
  ],
  '/outfits': [
    { w: 8, v: 'Thêm vào tủ đồ' },
    { w: 5, v: 'Xem thêm' },
    { w: 4, v: 'Nâng cấp Premium' },
  ],
  '/wardrobe': [
    { w: 7, v: 'Thử đồ AI' },
    { w: 6, v: 'Thêm trang phục' },
    { w: 4, v: 'Tải ảnh từ Thư viện' },
  ],
  '/premium-upgrade': [
    { w: 9, v: 'Nâng cấp Premium' },
    { w: 7, v: 'Mua ngay' },
    { w: 4, v: 'Xem chi tiết gói' },
  ],
  '/profile': [
    { w: 6, v: 'Chỉnh sửa' },
    { w: 5, v: 'Lưu thay đổi' },
    { w: 3, v: 'Đổi ảnh đại diện' },
  ],
  '/smart-advisor': [
    { w: 8, v: 'Kiểm tra bộ đồ này' },
    { w: 7, v: 'Tải ảnh trang phục' },
    { w: 5, v: 'Gửi' },
  ],
  '/settings': [
    { w: 5, v: 'Lưu cài đặt' },
    { w: 3, v: 'Đăng xuất' },
  ],
};

// ─── Non-bounce session flows ─────────────────────────────────────────────────
//
// Math check (weighted avg pages per non-bounce session):
// Sum(w × pages) / 100 = 601 / 100 = 6.01 pages
// Overall pages/session = 0.30×1 + 0.70×6.01 ≈ 4.5  ✓
//
const FLOWS = [
  // w=18 → 6 pages: full analysis journey (most common for premium)
  { w: 18, v: ['/home', '/scan', '/analysis-result', '/outfits', '/wardrobe', '/profile'] },
  // w=14 → 6 pages: adds SmartAdvisor after wardrobe
  { w: 14, v: ['/home', '/scan', '/analysis-result', '/outfits', '/wardrobe', '/smart-advisor'] },
  // w=10 → 6 pages: sees upgrade page during journey
  { w: 10, v: ['/home', '/scan', '/analysis-result', '/premium-upgrade', '/outfits', '/wardrobe'] },
  // w=9  → 5 pages: return user who already has results
  { w: 9,  v: ['/home', '/outfits', '/wardrobe', '/smart-advisor', '/profile'] },
  // w=8  → 6 pages: full journey ending in profile + settings
  { w: 8,  v: ['/home', '/analysis-result', '/outfits', '/wardrobe', '/profile', '/settings'] },
  // w=7  → 6 pages: profile management session
  { w: 7,  v: ['/home', '/profile', '/settings', '/wardrobe', '/outfits', '/smart-advisor'] },
  // w=7  → 6 pages: SmartAdvisor-first session
  { w: 7,  v: ['/home', '/smart-advisor', '/wardrobe', '/outfits', '/analysis-result', '/profile'] },
  // w=6  → 6 pages: upgrade intent from home
  { w: 6,  v: ['/home', '/premium-upgrade', '/scan', '/analysis-result', '/outfits', '/wardrobe'] },
  // w=6  → 6 pages: wardrobe-first return user
  { w: 6,  v: ['/home', '/wardrobe', '/smart-advisor', '/profile', '/outfits', '/analysis-result'] },
  // w=5  → 6 pages: deep exploration (no home, direct to result)
  { w: 5,  v: ['/analysis-result', '/outfits', '/wardrobe', '/smart-advisor', '/profile', '/settings'] },
  // w=5  → 6 pages: profile + wardrobe session
  { w: 5,  v: ['/home', '/profile', '/wardrobe', '/outfits', '/settings', '/scan'] },
  // w=5  → 8 pages: power-user-style full exploration
  { w: 5,  v: ['/home', '/scan', '/analysis-result', '/outfits', '/wardrobe', '/premium-upgrade', '/profile', '/smart-advisor'] },
];

// ─── Daily session count by growth curve ────────────────────────────────────

function getDailyCount(date) {
  const m = date.getUTCMonth(); // 4=May, 5=Jun
  const d = date.getUTCDate();
  if (m === 4 && d <= 27) return randInt(3, 5);    // 25-27 May: early adopters
  if (m === 4)             return randInt(5, 10);   // 28-31 May: growing
  if (m === 5 && d <= 7)   return randInt(5, 10);   // 01-07 Jun: growing
  if (m === 5 && d <= 13)  return randInt(15, 25);  // 08-13 Jun: FPT demo peak
  return randInt(8, 12);                             // 14 Jun: today
}

// ─── Peak-hour timestamps (Vietnam UTC+7) ────────────────────────────────────

const VN_OFFSET = 7 * 3_600_000;

function sessionStart(date) {
  const r = Math.random();
  const h = r < 0.40 ? randInt(8, 11) : r < 0.75 ? randInt(19, 22) : randInt(13, 17);
  const utcMs =
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) +
    h * 3_600_000 + randInt(0, 59) * 60_000 + randInt(0, 59) * 1_000 - VN_OFFSET;
  return new Date(utcMs);
}

// ─── Which scroll thresholds did this user reach? ────────────────────────────

function reachedThresholds(target, isBounce) {
  // Gaussian-ish spread ±20% around target; bounces scroll much less
  const actual = isBounce
    ? Math.random() * 30
    : Math.min(100, Math.max(5, target + (Math.random() - 0.5) * 40));
  return [25, 50, 75, 100].filter((t) => actual >= t);
}

// ─── Build one session's events ───────────────────────────────────────────────

function buildSession(pages, t0, isPower) {
  const sessionId = uuidv4();
  const events    = [];
  const isBounce  = pages.length === 1;
  let t = new Date(t0);

  for (const page of pages) {
    // ── page_view ──────────────────────────────────────────────────────
    events.push({ sessionId, userId: null, event: 'page_view', page, createdAt: new Date(t) });
    t = addMs(t, randInt(4000, 10000)); // page load + focus

    // ── scroll_depth ────────────────────────────────────────────────────
    const thresholds = reachedThresholds(PAGE_SCROLL[page] ?? 50, isBounce);
    for (const threshold of thresholds) {
      events.push({ sessionId, userId: null, event: 'scroll_depth', page, value: threshold, createdAt: new Date(t) });
      t = addMs(t, randInt(3000, 8000));
    }

    // ── clicks (fewer for bounce, more for power users) ─────────────────
    const numClicks = isBounce ? randInt(0, 1) : isPower ? randInt(2, 4) : randInt(1, 3);
    const pool      = PAGE_CLICKS[page] ?? PAGE_CLICKS['/home'];
    for (let i = 0; i < numClicks; i++) {
      events.push({
        sessionId,
        userId:   null,
        event:    'click',
        page,
        metadata: { element: wpick(pool) },
        createdAt: new Date(t),
      });
      t = addMs(t, randInt(5000, 20000));
    }

    // ── time reading / interacting on the page ───────────────────────────
    //   Targets: bounce ~30s total, regular ~4-5 min total, power ~14 min total
    const readMs = isBounce
      ? randInt(8_000,  30_000)   // 8–30s (bounce)
      : isPower
        ? randInt(80_000, 200_000) // 1.3–3.3 min/page (power)
        : randInt(12_000,  40_000); // 12–40s/page (regular) → 6 pages ≈ 3–4 min
    t = addMs(t, readMs);
  }

  // ── session_end ─────────────────────────────────────────────────────────
  events.push({
    sessionId,
    userId:    null,
    event:     'session_end',
    page:      pages[pages.length - 1],
    value:     t.getTime() - t0.getTime(), // duration in ms
    createdAt: new Date(t),
  });

  return events;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const force = process.argv.includes('--force');

  if (!process.env.MONGODB_URI) {
    console.error('❌  MONGODB_URI not found.');
    console.error('    Create server/.env with:  MONGODB_URI=mongodb+srv://...');
    console.error('    Or run:  MONGODB_URI=<uri> node server/scripts/seedAnalytics.js --force');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  if (!force) {
    console.log('\n⚠️  This will DELETE all existing UserEvent data and regenerate it.');
    console.log('    Re-run with --force to confirm:\n');
    console.log('    node server/scripts/seedAnalytics.js --force\n');
    await mongoose.disconnect();
    return;
  }

  // ── Clear existing data ─────────────────────────────────────────────────
  const { deletedCount } = await UserEvent.deleteMany({});
  console.log(`✓ Cleared ${deletedCount} existing UserEvent documents\n`);

  // ── Build date range: 25 May → 14 Jun 2026 (UTC) ───────────────────────
  const START = new Date('2026-05-25T00:00:00.000Z');
  const END   = new Date('2026-06-14T23:59:59.000Z');
  const dates = [];
  let cur = new Date(START);
  while (cur <= END) { dates.push(new Date(cur)); cur = addMs(cur, 86_400_000); }

  // ── Generate sessions ───────────────────────────────────────────────────
  const allEvents = [];
  let totalSessions = 0;
  let bounceSessions = 0;
  // ~40 power-user sessions total, weighted toward the peak period (08–13 Jun)
  let powerLeft = 40;

  for (let di = 0; di < dates.length; di++) {
    const date = dates[di];
    const n    = getDailyCount(date);

    // Peak period: higher chance of a power-user session
    const isPeakDay = date.getUTCMonth() === 5 && date.getUTCDate() >= 8 && date.getUTCDate() <= 13;

    for (let s = 0; s < n; s++) {
      const isBounce = Math.random() < 0.30;
      const isPower  = !isBounce && powerLeft > 0 && Math.random() < (isPeakDay ? 0.22 : 0.08);
      if (isPower) powerLeft--;

      const pages = isBounce ? ['/home'] : wpick(FLOWS);
      const t0    = sessionStart(date);

      allEvents.push(...buildSession(pages, t0, isPower));
      totalSessions++;
      if (isBounce) bounceSessions++;
    }

    process.stdout.write(`\rGenerating sessions... day ${di + 1}/${dates.length}  (${totalSessions} sessions so far)`);
  }
  console.log('\n');

  // ── Batch insert in chunks of 500 ──────────────────────────────────────
  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < allEvents.length; i += CHUNK) {
    await UserEvent.insertMany(allEvents.slice(i, i + CHUNK), { ordered: false });
    inserted += Math.min(CHUNK, allEvents.length - i);
    process.stdout.write(`\rInserting events...  ${inserted}/${allEvents.length}`);
  }
  console.log('\n');

  // ── Summary ─────────────────────────────────────────────────────────────
  const bounceRate = ((bounceSessions / totalSessions) * 100).toFixed(1);

  const sessionEnds = allEvents.filter((e) => e.event === 'session_end');
  const avgDurationMs = sessionEnds.reduce((s, e) => s + (e.value || 0), 0) / (sessionEnds.length || 1);
  const avgDurationMin = (avgDurationMs / 60_000).toFixed(1);

  const pvCount = allEvents.filter((e) => e.event === 'page_view').length;
  const pps = (pvCount / totalSessions).toFixed(1);

  const clickCount  = allEvents.filter((e) => e.event === 'click').length;
  const scrollCount = allEvents.filter((e) => e.event === 'scroll_depth').length;

  const line = '━'.repeat(48);
  console.log(line);
  console.log('  Analytics Seed — Summary');
  console.log(line);
  console.log(`  Total events         : ${allEvents.length.toLocaleString()}`);
  console.log(`    ↳ page_view        : ${pvCount.toLocaleString()}`);
  console.log(`    ↳ scroll_depth     : ${scrollCount.toLocaleString()}`);
  console.log(`    ↳ click            : ${clickCount.toLocaleString()}`);
  console.log(`    ↳ session_end      : ${sessionEnds.length.toLocaleString()}`);
  console.log(`  Total sessions       : ${totalSessions}`);
  console.log(`  Bounce sessions      : ${bounceSessions}  (${bounceRate}%)`);
  console.log(`  Avg session duration : ${avgDurationMin} min`);
  console.log(`  Avg pages / session  : ${pps}`);
  console.log(`  Date range           : 25/05/2026 → 14/06/2026`);
  console.log(line);

  await mongoose.disconnect();
  console.log('\n✓ Done. Open /admin/behavior to see the metrics.');
}

main().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
