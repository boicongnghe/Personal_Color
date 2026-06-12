import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, DollarSign, Users, Crown, RefreshCw } from "lucide-react";
import logoUrl from "../../../assets/logo.png";
import { getAdminStats } from "../../../api/api";

/* ── Types ─────────────────────────────────────────────── */
interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  growth: number;
  avgPerUser: number;
  conversionRate: number;
  monthlyRevenue: { month: string; revenue: number; subscriptions: number }[];
  weeklyRevenue: { day: string; revenue: number }[];
  recentTransactions: { user: string; avatarUrl?: string; amount: number; plan: string; date: string }[];
}

const PLAN_LABEL: Record<string, string> = { "1m": "1 tháng", "3m": "3 tháng", "6m": "6 tháng" };

/* ── Skeleton ──────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className ?? ""}`} />;
}

/* ── Area+Line Chart ───────────────────────────────────── */
function AreaLineChart({ data, areaKey, lineKey, formatArea, formatLine }: {
  data: Record<string, any>[];
  areaKey: string; lineKey: string;
  formatArea: (v: number) => string; formatLine: (v: number) => string;
}) {
  const W = 480; const H = 190;
  const pad = { top: 16, right: 12, bottom: 24, left: 50 };
  const iW = W - pad.left - pad.right; const iH = H - pad.top - pad.bottom;

  const aVals = data.map(d => d[areaKey]);
  const aMax = Math.max(...aVals, 1); const aMin = Math.min(...aVals) * 0.85; const aRange = aMax - aMin || 1;
  const lVals = data.map(d => d[lineKey]);
  const lMax = Math.max(...lVals, 1); const lMin = Math.min(...lVals) * 0.85; const lRange = lMax - lMin || 1;

  const toX = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * iW;
  const toYA = (v: number) => pad.top + iH - ((v - aMin) / aRange) * iH;
  const toYL = (v: number) => pad.top + iH - ((v - lMin) / lRange) * iH;

  const areaLine = data.map((d, i) => `${toX(i)},${toYA(d[areaKey])}`).join(" ");
  const areaFill = [`${toX(0)},${pad.top + iH}`, ...data.map((d, i) => `${toX(i)},${toYA(d[areaKey])}`), `${toX(data.length - 1)},${pad.top + iH}`].join(" ");
  const linePoints = data.map((d, i) => `${toX(i)},${toYL(d[lineKey])}`).join(" ");

  const [hov, setHov] = useState<number | null>(null);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        {[0, 0.5, 1].map(t => {
          const y = pad.top + iH * (1 - t);
          return <g key={t}><line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#F3F4F6" strokeWidth={1} />
            <text x={pad.left - 5} y={y + 4} textAnchor="end" fontSize={8} fill="#9CA3AF">{formatArea(aMin + aRange * t)}</text></g>;
        })}
        <polygon points={areaFill} fill="#3B82F6" fillOpacity={0.08} />
        <polyline points={areaLine} fill="none" stroke="#3B82F6" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={linePoints} fill="none" stroke="#10B981" strokeWidth={2} strokeDasharray="4 2" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: "pointer" }}>
            <circle cx={toX(i)} cy={toYA(d[areaKey])} r={hov === i ? 6 : 4} fill="#3B82F6" stroke="white" strokeWidth={2} />
            <circle cx={toX(i)} cy={toYL(d[lineKey])} r={hov === i ? 5 : 3} fill="#10B981" stroke="white" strokeWidth={1.5} />
            {hov === i && (
              <g>
                <rect x={toX(i) - 40} y={toYA(d[areaKey]) - 34} width={80} height={28} rx={4} fill="#1F2937" fillOpacity={0.92} />
                <text x={toX(i)} y={toYA(d[areaKey]) - 20} textAnchor="middle" fontSize={8} fill="#93C5FD">{formatArea(d[areaKey])}</text>
                <text x={toX(i)} y={toYA(d[areaKey]) - 10} textAnchor="middle" fontSize={8} fill="#6EE7B7">{formatLine(d[lineKey])} subs</text>
              </g>
            )}
            <text x={toX(i)} y={H - 3} textAnchor="middle" fontSize={8} fill="#6B7280">{d.month}</text>
          </g>
        ))}
        <g>
          <rect x={pad.left} y={4} width={8} height={8} fill="#3B82F6" rx={1} />
          <text x={pad.left + 11} y={11} fontSize={8} fill="#6B7280">Doanh thu</text>
          <line x1={pad.left + 60} y1={8} x2={pad.left + 72} y2={8} stroke="#10B981" strokeWidth={2} strokeDasharray="4 2" />
          <text x={pad.left + 75} y={11} fontSize={8} fill="#6B7280">Đăng ký</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Bar Chart ─────────────────────────────────────────── */
function BarChart({ data, labelKey, valueKey, color, formatValue }: {
  data: Record<string, any>[]; labelKey: string; valueKey: string; color: string; formatValue: (v: number) => string;
}) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const [hov, setHov] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-1.5 h-40 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div className="relative w-full flex justify-center">
            {hov === i && <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">{formatValue(d[valueKey])}</div>}
            <div className="w-full rounded-t-md transition-all cursor-pointer"
              style={{ height: `${(d[valueKey] / max) * 130}px`, backgroundColor: color, opacity: hov === i ? 1 : 0.72 }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
          </div>
          <span className="text-[10px] text-gray-500">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AdminRevenue
══════════════════════════════════════════════════════════ */
export function AdminRevenue() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getAdminStats();
      setStats(res.data.data);
    } catch (e: any) {
      setError(e.response?.data?.error || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-5 xl:px-8 py-3.5 sticky top-0 z-10">
        <div className="flex items-center gap-3 w-full">
          <button onClick={() => navigate("/admin")}
            className="xl:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src={logoUrl} alt="Clarity" className="xl:hidden h-7 w-auto flex-shrink-0" />
            <span className="xl:hidden text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Doanh thu</span>
            <h1 className="hidden xl:block text-xl font-bold text-gray-900">Doanh thu</h1>
          </div>
          <button onClick={load} disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40">
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

        {/* ── Stats ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? [0,1,2,3].map(i => <Skeleton key={i} className="h-28" />) : [
            { icon: <DollarSign className="w-5 h-5" />, bg: "from-green-400 to-emerald-600", label: "Doanh thu tháng này", value: `₫${(stats!.thisMonthRevenue / 1000000).toFixed(2)}M`, sub: stats!.growth >= 0 ? `+${stats!.growth}% tháng trước` : `${stats!.growth}% tháng trước`, subColor: stats!.growth >= 0 ? "text-green-500" : "text-red-500" },
            { icon: <TrendingUp className="w-5 h-5" />, bg: "from-blue-400 to-blue-600", label: "Tổng doanh thu", value: `₫${(stats!.totalRevenue / 1000000).toFixed(1)}M`, sub: "Tích lũy toàn thời gian", subColor: "text-gray-400" },
            { icon: <Crown className="w-5 h-5" />, bg: "from-amber-400 to-orange-500", label: "Trung bình / người", value: `₫${(stats!.avgPerUser / 1000).toFixed(0)}K`, sub: `${stats!.premiumUsers} người Premium`, subColor: "text-gray-400" },
            { icon: <Users className="w-5 h-5" />, bg: "from-purple-400 to-pink-500", label: "Tỷ lệ chuyển đổi", value: `${stats!.conversionRate}%`, sub: `${stats!.premiumUsers}/${stats!.totalUsers} người dùng`, subColor: "text-gray-400" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${s.bg} opacity-10`} />
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.bg} flex items-center justify-center text-white mb-3`}>{s.icon}</div>
              <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
              <p className={`text-[10px] mt-0.5 font-medium ${s.subColor}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Monthly chart ──────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 text-sm mb-1">Doanh thu & Đăng ký theo tháng</h2>
          <p className="text-xs text-gray-400 mb-4">6 tháng gần nhất</p>
          {loading ? <Skeleton className="h-44" /> : (
            <AreaLineChart
              data={stats!.monthlyRevenue}
              areaKey="revenue" lineKey="subscriptions"
              formatArea={v => `₫${(v / 1000000).toFixed(0)}M`}
              formatLine={v => v.toLocaleString()}
            />
          )}
        </div>

        {/* ── Weekly + Source ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 text-sm mb-1">Doanh thu 7 ngày qua</h2>
            <p className="text-xs text-gray-400 mb-4">Theo ngày trong tuần</p>
            {loading ? <Skeleton className="h-40" /> : (
              <BarChart data={stats!.weeklyRevenue} labelKey="day" valueKey="revenue" color="#3B82F6" formatValue={v => `₫${(v/1000000).toFixed(1)}M`} />
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Tổng quan gói cước</h2>
            {loading ? <Skeleton className="h-40" /> : (
              <div className="space-y-4">
                {[
                  { label: "Gói 1 tháng",  key: "1m", color: "#3B82F6" },
                  { label: "Gói 3 tháng",  key: "3m", color: "#8B5CF6" },
                  { label: "Gói 6 tháng",  key: "6m", color: "#10B981" },
                ].map(p => {
                  const count = (stats!.recentTransactions ?? []).filter(t => t.plan === p.key).length;
                  const total = Math.max((stats!.recentTransactions ?? []).length, 1);
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={p.key}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{p.label}</span>
                        <span className="text-sm font-bold text-gray-900">{count} giao dịch</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{pct}% giao dịch gần đây</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Recent transactions ────────────────────── */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Giao dịch gần đây</h2>
          {loading ? (
            <div className="space-y-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : !stats?.recentTransactions?.length ? (
            <p className="text-center text-gray-400 text-sm py-8">Chưa có giao dịch nào</p>
          ) : (
            <div className="space-y-2">
              {stats.recentTransactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      {tx.avatarUrl
                        ? <img src={tx.avatarUrl} className="w-full h-full object-cover" alt="" />
                        : tx.user.charAt(0).toUpperCase()
                      }
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tx.user}</p>
                      <p className="text-xs text-gray-400">
                        {PLAN_LABEL[tx.plan] ?? tx.plan} · {new Date(tx.date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-green-600">+₫{(tx.amount || 0).toLocaleString()}</p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-md font-semibold">Premium</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
