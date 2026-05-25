import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  Users, DollarSign, Sparkles, Crown,
  LogOut, Package, MessageCircle, TrendingUp,
  RefreshCw,
} from "lucide-react";
import logoUrl from "../../../assets/logo.png";
import { useAppContext } from "../../context/AppContext";
import { getAdminStats } from "../../../api/api";

/* ── Types ─────────────────────────────────────────────── */
interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  totalScans: number;
  growth: number;
  conversionRate: number;
  monthlyRevenue: { month: string; revenue: number; subscriptions: number }[];
  userGrowth: { month: string; users: number }[];
  colorDistribution: { season: string; count: number }[];
}

/* ── Season colour map ─────────────────────────────────── */
const SEASON_COLORS: Record<string, string> = {
  "spring": "#F59E0B", "summer": "#A78BFA", "autumn": "#F97316", "winter": "#3B82F6",
};
function seasonColor(s: string) {
  const key = Object.keys(SEASON_COLORS).find(k => s.toLowerCase().includes(k));
  return key ? SEASON_COLORS[key] : "#9CA3AF";
}

/* ── Custom SVG Line Chart ─────────────────────────────── */
function LineChart({
  data, valueKey, color, formatValue,
}: { data: Record<string, any>[]; valueKey: string; color: string; formatValue: (v: number) => string }) {
  const W = 400; const H = 150;
  const pad = { top: 12, right: 12, bottom: 24, left: 44 };
  const iW = W - pad.left - pad.right; const iH = H - pad.top - pad.bottom;
  const vals = data.map(d => d[valueKey]);
  const min = Math.min(...vals); const max = Math.max(...vals);
  const range = max - min || 1;
  const toX = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * iW;
  const toY = (v: number) => pad.top + iH - ((v - min) / range) * iH;
  const pts = data.map((d, i) => `${toX(i)},${toY(d[valueKey])}`).join(" ");
  const area = [`${toX(0)},${pad.top + iH}`, ...data.map((d, i) => `${toX(i)},${toY(d[valueKey])}`), `${toX(data.length - 1)},${pad.top + iH}`].join(" ");
  const [hov, setHov] = useState<number | null>(null);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 220 }}>
      {[0, 0.5, 1].map(t => {
        const y = pad.top + iH * (1 - t);
        return <g key={t}><line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#F3F4F6" strokeWidth={1} /><text x={pad.left - 4} y={y + 4} textAnchor="end" fontSize={8} fill="#9CA3AF">{formatValue(min + range * t)}</text></g>;
      })}
      <polygon points={area} fill={color} fillOpacity={0.08} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: "pointer" }}>
          <circle cx={toX(i)} cy={toY(d[valueKey])} r={hov === i ? 6 : 4} fill={color} stroke="white" strokeWidth={2} />
          {hov === i && <><rect x={toX(i) - 28} y={toY(d[valueKey]) - 22} width={56} height={16} rx={3} fill="#1F2937" /><text x={toX(i)} y={toY(d[valueKey]) - 10} textAnchor="middle" fontSize={8} fill="white">{formatValue(d[valueKey])}</text></>}
          <text x={toX(i)} y={H - 4} textAnchor="middle" fontSize={8} fill="#6B7280">{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── Custom CSS Bar Chart ──────────────────────────────── */
function BarChart({
  data, valueKey, color, formatValue,
}: { data: Record<string, any>[]; valueKey: string; color: string; formatValue: (v: number) => string }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const [hov, setHov] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-1.5 h-40 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div className="relative w-full flex justify-center">
            {hov === i && <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">{formatValue(d[valueKey])}</div>}
            <div className="w-full rounded-t-md transition-all cursor-pointer" style={{ height: `${(d[valueKey] / max) * 130}px`, backgroundColor: color, opacity: hov === i ? 1 : 0.75 }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
          </div>
          <span className="text-[10px] text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Donut Chart ───────────────────────────────────────── */
function DonutChart({ data }: { data: { name: string; value: number; fill: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 65; const cx = 80; const cy = 80; const sw = 24;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  const segs = data.map(d => { const dash = (d.value / total) * circ; const seg = { ...d, dash, gap: circ - dash, offset }; offset += dash; return seg; });
  const [hov, setHov] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-4">
      <svg width={160} height={160} viewBox="0 0 160 160" className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
        {segs.map(s => (
          <circle key={s.name} cx={cx} cy={cy} r={R} fill="none" stroke={s.fill}
            strokeWidth={hov === s.name ? sw + 4 : sw}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset + circ / 4}
            style={{ cursor: "pointer", transition: "stroke-width 0.15s" }}
            onMouseEnter={() => setHov(s.name)} onMouseLeave={() => setHov(null)} />
        ))}
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize={10} fill="#9CA3AF">Total</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={15} fill="#111827" fontWeight="bold">{total.toLocaleString()}</text>
      </svg>
      <div className="space-y-2 flex-1 min-w-0">
        {data.map(d => (
          <div key={d.name} className="flex items-center justify-between gap-2 cursor-pointer" onMouseEnter={() => setHov(d.name)} onMouseLeave={() => setHov(null)}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
              <span className={`text-xs truncate ${hov === d.name ? "font-semibold text-gray-900" : "text-gray-500"}`}>{d.name}</span>
            </div>
            <span className="text-xs font-bold text-gray-800 flex-shrink-0">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Skeleton loader ───────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className ?? ""}`} />;
}

/* ══════════════════════════════════════════════════════════
   AdminDashboard
══════════════════════════════════════════════════════════ */
export function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAppContext();

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

  const donutData = (stats?.colorDistribution ?? []).map(c => ({
    name: c.season,
    value: c.count,
    fill: seasonColor(c.season),
  }));

  const NAV_ITEMS = [
    { label: "Người dùng", icon: <Users className="w-4 h-4" />, path: "/admin/users", color: "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100" },
    { label: "Doanh thu",  icon: <DollarSign className="w-4 h-4" />, path: "/admin/revenue", color: "text-green-600 border-green-200 bg-green-50 hover:bg-green-100" },
    { label: "Sản phẩm",  icon: <Package className="w-4 h-4" />, path: "/admin/products", color: "text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100" },
    { label: "Hỗ trợ",    icon: <MessageCircle className="w-4 h-4" />, path: "/admin/support", color: "text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-5 py-3.5 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Clarity" className="h-8 w-auto" />
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto space-y-4">

        {/* ── Quick nav ──────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2">
          {NAV_ITEMS.map(n => (
            <button key={n.path} onClick={() => navigate(n.path)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-semibold transition-all ${n.color}`}>
              {n.icon}
              <span className="hidden sm:block">{n.label}</span>
            </button>
          ))}
        </div>

        {/* ── Error ──────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 font-bold">✕</button>
          </div>
        )}

        {/* ── Stats cards ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            [0,1,2,3].map(i => <Skeleton key={i} className="h-28" />)
          ) : [
            { icon: <Users className="w-5 h-5" />, bg: "from-blue-400 to-blue-600", label: "Tổng người dùng", value: stats!.totalUsers.toLocaleString(), sub: `${stats!.conversionRate}% conversion` },
            { icon: <Crown className="w-5 h-5" />, bg: "from-amber-400 to-orange-500", label: "Premium", value: stats!.premiumUsers.toLocaleString(), sub: `${stats!.conversionRate}% tỷ lệ` },
            { icon: <DollarSign className="w-5 h-5" />, bg: "from-green-400 to-emerald-600", label: "Doanh thu tháng", value: `₫${(stats!.thisMonthRevenue / 1000000).toFixed(1)}M`, sub: stats!.growth >= 0 ? `+${stats!.growth}% so tháng trước` : `${stats!.growth}% so tháng trước` },
            { icon: <Sparkles className="w-5 h-5" />, bg: "from-purple-400 to-pink-500", label: "Lượt quét AI", value: stats!.totalScans.toLocaleString(), sub: "Tổng tích lũy" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm overflow-hidden relative">
              <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${s.bg} opacity-10`} />
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.bg} flex items-center justify-center text-white mb-3`}>{s.icon}</div>
              <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Charts row ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue trend */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Xu hướng doanh thu</h2>
                <p className="text-xs text-gray-400">6 tháng gần nhất</p>
              </div>
              <button onClick={() => navigate("/admin/revenue")} className="text-xs text-blue-500 font-semibold hover:text-blue-600">Chi tiết →</button>
            </div>
            {loading ? <Skeleton className="h-36" /> : (
              <LineChart data={stats!.monthlyRevenue} valueKey="revenue" color="#3B82F6" formatValue={v => `₫${(v / 1000000).toFixed(0)}M`} />
            )}
          </div>

          {/* User growth */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Người dùng mới</h2>
                <p className="text-xs text-gray-400">Đăng ký theo tháng</p>
              </div>
              <button onClick={() => navigate("/admin/users")} className="text-xs text-blue-500 font-semibold hover:text-blue-600">Chi tiết →</button>
            </div>
            {loading ? <Skeleton className="h-36" /> : (
              <BarChart data={stats!.userGrowth} valueKey="users" color="#8B5CF6" formatValue={v => v.toLocaleString()} />
            )}
          </div>
        </div>

        {/* ── Color type distribution ─────────────────── */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Phân bố kiểu màu sắc</h2>
              <p className="text-xs text-gray-400">Từ kết quả scan AI</p>
            </div>
          </div>
          {loading ? <Skeleton className="h-40" /> :
            donutData.length === 0
              ? <p className="text-center text-gray-400 text-sm py-8">Chưa có dữ liệu scan</p>
              : <DonutChart data={donutData} />
          }
        </div>

        {/* ── Growth summary ──────────────────────────── */}
        {!loading && stats && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <TrendingUp className="w-4 h-4 text-green-500" />, label: "Tăng trưởng doanh thu", value: `${stats.growth >= 0 ? "+" : ""}${stats.growth}%`, color: stats.growth >= 0 ? "text-green-600" : "text-red-500" },
              { icon: <DollarSign className="w-4 h-4 text-blue-500" />, label: "Tổng doanh thu", value: `₫${(stats.totalRevenue / 1000000).toFixed(1)}M`, color: "text-blue-600" },
              { icon: <Crown className="w-4 h-4 text-amber-500" />, label: "TB / người dùng", value: `₫${(stats.avgPerUser / 1000).toFixed(0)}K`, color: "text-amber-600" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <div className="flex justify-center mb-2">{s.icon}</div>
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
