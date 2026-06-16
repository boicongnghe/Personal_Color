import { useState, useEffect } from "react";
import { Activity, RefreshCw, MousePointer, Eye, Clock, LayoutGrid, Sparkles } from "lucide-react";
import { getAnalyticsMetrics } from "../../../api/api";

/* ── Types ─────────────────────────────────────────────── */
interface BehaviorMetrics {
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  totalSessions: number;
  ctr: number;
  totalClicks: number;
  totalPageViews: number;
  topPages: { page: string; count: number }[];
  topClicks: { element: string; count: number }[];
  scrollDepth: { page: string; avgScroll: number }[];
  dau: { date: string; dau: number }[];
  weeklyChange: {
    bounceRate: number | null;
    avgSessionDuration: number | null;
    pagesPerSession: number | null;
    sessions: number | null;
  };
}

/* ── Helpers ────────────────────────────────────────────── */
function fmtDuration(ms: number): string {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function fmtPage(page: string): string {
  if (!page || page === "/") return "Trang chủ (/)";
  return page;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/* ── Trend Badge ────────────────────────────────────────── */
function TrendBadge({
  value, inverse = false,
}: { value: number | null; inverse?: boolean }) {
  if (value === null) return <span className="text-[10px] text-gray-400">vs. tuần trước</span>;
  const isGood = inverse ? value < 0 : value > 0;
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`text-[10px] font-semibold ${isGood ? "text-green-500" : "text-red-400"}`}>
      {value > 0 ? "▲" : "▼"} {sign}{value}% vs tuần trước
    </span>
  );
}

/* ── Skeleton ───────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className ?? ""}`} />;
}

/* ── DAU Bar Chart (SVG) ─────────────────────────────────── */
function DauChart({ data }: { data: { date: string; dau: number }[] }) {
  const W = 500; const H = 140;
  const pad = { top: 12, right: 8, bottom: 24, left: 32 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const max = Math.max(...data.map(d => d.dau), 1);
  const [hov, setHov] = useState<number | null>(null);

  const barW = Math.max(2, iW / data.length - 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 260 }}>
      {[0, 0.5, 1].map(t => {
        const y = pad.top + iH * (1 - t);
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#F3F4F6" strokeWidth={1} />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fontSize={8} fill="#9CA3AF">
              {Math.round(max * t)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = pad.left + (i / data.length) * iW + 1;
        const barH = (d.dau / max) * iH;
        const y = pad.top + iH - barH;
        const isHov = hov === i;
        return (
          <g key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{ cursor: "pointer" }}>
            <rect x={x} y={y} width={barW} height={barH}
              rx={2} fill="#8B5CF6" opacity={isHov ? 1 : 0.65}
              style={{ transition: "opacity 0.1s" }} />
            {isHov && (
              <>
                <rect x={x + barW / 2 - 18} y={y - 18} width={36} height={14} rx={3} fill="#1F2937" />
                <text x={x + barW / 2} y={y - 7} textAnchor="middle" fontSize={8} fill="white">
                  {d.dau} users
                </text>
              </>
            )}
            {/* Show date label only every ~5 bars to avoid overlap */}
            {i % Math.max(1, Math.floor(data.length / 10)) === 0 && (
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize={7} fill="#9CA3AF">
                {fmtDate(d.date)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Horizontal Bar (for top pages) ─────────────────────── */
function HBarItem({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 group">
      <span className="text-xs text-gray-500 truncate w-40 flex-shrink-0" title={label}>
        {label}
      </span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-10 text-right flex-shrink-0">{count}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AdminBehavior
══════════════════════════════════════════════════════════ */
export function AdminBehavior() {
  const [metrics, setMetrics] = useState<BehaviorMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsMetrics();
      setMetrics(res.data.data);
    } catch (e: any) {
      setError(e.response?.data?.error || "Lỗi tải dữ liệu hành vi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const topPageMax  = metrics?.topPages[0]?.count  ?? 1;
  const topClickMax = metrics?.topClicks[0]?.count ?? 1;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-5 xl:px-8 py-3.5 sticky top-0 z-10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Activity className="xl:hidden w-5 h-5 text-purple-500" />
            <h1 className="text-base xl:text-xl font-bold text-gray-900">Hành vi người dùng</h1>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="p-4 w-full space-y-4">

        {/* ── Error ──────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 font-bold">✕</button>
          </div>
        )}

        {/* ── AI-generated overview ─────────────────────── */}
        {!loading && metrics && (
          <div className="bg-gray-900 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-white">Thông tin tổng quan do AI tạo</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              Công thức tính <span className="text-violet-400 font-semibold">CTR (Tỷ lệ nhấp)</span> chuẩn áp dụng cho Google Analytics và Google Ads là:
            </p>
            <div className="bg-gray-800/60 rounded-xl py-4 px-4 flex items-center justify-center mb-4">
              <div className="text-white text-sm font-mono flex items-center gap-2">
                <span>CTR =</span>
                <span className="inline-flex flex-col items-center text-xs">
                  <span className="pb-1 border-b border-gray-400">Tổng số lượt nhấp (Clicks)</span>
                  <span className="pt-1">Tổng số lần hiển thị (Impressions)</span>
                </span>
                <span>× 100%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Áp dụng vào dữ liệu thực tế: CTR = ({metrics.totalClicks.toLocaleString()} clicks ÷{" "}
              {metrics.totalPageViews.toLocaleString()} lượt xem trang) × 100% ={" "}
              <span className="text-violet-400 font-bold">{metrics.ctr}%</span>.{" "}
              {metrics.ctr >= 50
                ? "Tỷ lệ tương tác cao — người dùng chủ động bấm vào các nút gợi ý."
                : "Tỷ lệ tương tác ở mức trung bình — có thể cải thiện thêm vị trí/CTA của các nút bấm."}
            </p>
          </div>
        )}

        {/* ── Metric Cards ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            [0, 1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)
          ) : [
            {
              icon: <Activity className="w-5 h-5" />,
              bg: "from-red-400 to-rose-500",
              label: "Bounce Rate",
              value: `${metrics!.bounceRate}%`,
              trend: <TrendBadge value={metrics!.weeklyChange.bounceRate} inverse />,
            },
            {
              icon: <Clock className="w-5 h-5" />,
              bg: "from-blue-400 to-indigo-500",
              label: "Thời gian TB/phiên",
              value: fmtDuration(metrics!.avgSessionDuration),
              trend: <TrendBadge value={metrics!.weeklyChange.avgSessionDuration} />,
            },
            {
              icon: <LayoutGrid className="w-5 h-5" />,
              bg: "from-green-400 to-emerald-500",
              label: "Trang/phiên",
              value: metrics!.pagesPerSession.toFixed(1),
              trend: <TrendBadge value={metrics!.weeklyChange.pagesPerSession} />,
            },
            {
              icon: <Eye className="w-5 h-5" />,
              bg: "from-purple-400 to-violet-500",
              label: "Tổng phiên",
              value: metrics!.totalSessions.toLocaleString(),
              trend: <TrendBadge value={metrics!.weeklyChange.sessions} />,
            },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm overflow-hidden relative">
              <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${s.bg} opacity-10`} />
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.bg} flex items-center justify-center text-white mb-3`}>
                {s.icon}
              </div>
              <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
              <div className="mt-0.5">{s.trend}</div>
            </div>
          ))}
        </div>

        {/* ── DAU Chart ───────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Người dùng hoạt động hàng ngày</h2>
              <p className="text-xs text-gray-400">30 ngày gần nhất</p>
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-36" />
          ) : !metrics?.dau.length ? (
            <p className="text-center text-gray-400 text-sm py-8">Chưa có dữ liệu</p>
          ) : (
            <DauChart data={metrics.dau} />
          )}
        </div>

        {/* ── Top Pages + Top Clicks ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top Pages */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <Eye className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Trang được xem nhiều nhất</h2>
                <p className="text-xs text-gray-400">Toàn thời gian</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">{[0,1,2,3,4].map(i => <Skeleton key={i} className="h-5" />)}</div>
            ) : !metrics?.topPages.length ? (
              <p className="text-center text-gray-400 text-sm py-6">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {metrics.topPages.slice(0, 8).map((p, i) => (
                  <HBarItem
                    key={i}
                    label={fmtPage(p.page)}
                    count={p.count}
                    max={topPageMax}
                    color="#3B82F6"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Top Clicks */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <MousePointer className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Phần tử được nhấn nhiều nhất</h2>
                <p className="text-xs text-gray-400">Toàn thời gian</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">{[0,1,2,3,4].map(i => <Skeleton key={i} className="h-5" />)}</div>
            ) : !metrics?.topClicks.length ? (
              <p className="text-center text-gray-400 text-sm py-6">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {metrics.topClicks.slice(0, 8).map((c, i) => (
                  <HBarItem
                    key={i}
                    label={c.element}
                    count={c.count}
                    max={topClickMax}
                    color="#F59E0B"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Scroll Depth Table ──────────────────────── */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Độ cuộn trang trung bình</h2>
              <p className="text-xs text-gray-400">% người dùng cuộn được trên mỗi trang</p>
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-40" />
          ) : !metrics?.scrollDepth.length ? (
            <p className="text-center text-gray-400 text-sm py-6">Chưa có dữ liệu</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-400 font-semibold">Trang</th>
                    <th className="text-right py-2 text-gray-400 font-semibold w-24">TB scroll</th>
                    <th className="py-2 w-32"></th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.scrollDepth.slice(0, 12).map((s, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2 text-gray-600 truncate max-w-[180px]" title={s.page}>
                        {fmtPage(s.page)}
                      </td>
                      <td className="py-2 text-right font-bold text-gray-800">{s.avgScroll}%</td>
                      <td className="py-2 pl-3">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-400 to-teal-500 transition-all"
                            style={{ width: `${s.avgScroll}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
