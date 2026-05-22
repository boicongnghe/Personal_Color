import { useNavigate } from "react-router";
import { useState } from "react";
import {
  Users,
  DollarSign,
  Sparkles,
  Crown,
  Menu,
  Save,
  LogOut,
  Package,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";

// ── Custom CSS Bar Chart ────────────────────────────────────────────────────
function BarChartCustom({
  data,
  valueKey,
  color,
  formatValue,
}: {
  data: Record<string, any>[];
  valueKey: string;
  color: string;
  formatValue: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-2 h-48 w-full">
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="relative w-full flex justify-center">
              {hovered === i && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {formatValue(d[valueKey])}
                </div>
              )}
              <div
                className="w-full rounded-t-lg transition-opacity cursor-pointer"
                style={{ height: `${pct * 1.6}px`, backgroundColor: color, opacity: hovered === i ? 1 : 0.8 }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            </div>
            <span className="text-xs text-gray-500">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Custom SVG Line Chart ───────────────────────────────────────────────────
function LineChartCustom({
  data,
  valueKey,
  color,
  formatValue,
}: {
  data: Record<string, any>[];
  valueKey: string;
  color: string;
  formatValue: (v: number) => string;
}) {
  const W = 400;
  const H = 160;
  const pad = { top: 16, right: 16, bottom: 28, left: 48 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const values = data.map((d) => d[valueKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const toX = (i: number) => pad.left + (i / (data.length - 1)) * innerW;
  const toY = (v: number) => pad.top + innerH - ((v - min) / range) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d[valueKey])}`).join(" ");
  const areaPoints = [
    `${toX(0)},${pad.top + innerH}`,
    ...data.map((d, i) => `${toX(i)},${toY(d[valueKey])}`),
    `${toX(data.length - 1)},${pad.top + innerH}`,
  ].join(" ");

  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 240 }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad.top + innerH * (1 - t);
          const val = min + range * t;
          return (
            <g key={`grid-${t}`}>
              <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#E5E7EB" strokeWidth={1} />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#9CA3AF">
                {formatValue(val)}
              </text>
            </g>
          );
        })}
        {/* Area fill */}
        <polygon points={areaPoints} fill={color} fillOpacity={0.08} />
        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots + labels */}
        {data.map((d, i) => (
          <g key={`dot-${d.month}`}>
            <circle
              cx={toX(i)} cy={toY(d[valueKey])} r={hovered === i ? 6 : 4}
              fill={color} stroke="white" strokeWidth={2}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
            {hovered === i && (
              <g>
                <rect x={toX(i) - 30} y={toY(d[valueKey]) - 22} width={60} height={16} rx={4} fill="#1F2937" />
                <text x={toX(i)} y={toY(d[valueKey]) - 10} textAnchor="middle" fontSize={9} fill="white">
                  {formatValue(d[valueKey])}
                </text>
              </g>
            )}
            <text x={toX(i)} y={H - 4} textAnchor="middle" fontSize={9} fill="#6B7280">{d.month}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Custom SVG Donut Chart ──────────────────────────────────────────────────
function DonutChart({ data }: { data: { name: string; value: number; fill: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 70;
  const cx = 90;
  const cy = 90;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * R;

  let offset = 0;
  const segments = data.map((d) => {
    const pct = d.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const seg = { ...d, dash, gap, offset };
    offset += dash;
    return seg;
  });

  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-6">
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
        {segments.map((seg) => (
          <circle
            key={seg.name}
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={seg.fill}
            strokeWidth={hovered === seg.name ? strokeWidth + 4 : strokeWidth}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={-seg.offset + circumference / 4}
            style={{ cursor: "pointer", transition: "stroke-width 0.15s" }}
            onMouseEnter={() => setHovered(seg.name)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={11} fill="#6B7280">Total</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={14} fill="#111827" fontWeight="bold">
          {total.toLocaleString()}
        </text>
      </svg>
      <div className="space-y-3 flex-1">
        {data.map((d) => (
          <div
            key={d.name}
            className="flex items-center justify-between gap-3 cursor-pointer"
            onMouseEnter={() => setHovered(d.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
              <span className={`text-sm ${hovered === d.name ? "font-semibold text-gray-900" : "text-gray-600"}`}>{d.name}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main AdminDashboard ─────────────────────────────────────────────────────
export function AdminDashboard() {
  const navigate = useNavigate();
  const { bankInfo, updateBankInfo, t, logout } = useAppContext();
  const [localBankInfo, setLocalBankInfo] = useState(bankInfo);
  const [saved, setSaved] = useState(false);

  const stats = {
    totalUsers: 12845,
    premiumUsers: 2341,
    monthlyRevenue: 117050000,
    aiScans: 45632,
  };

  const revenueData = [
    { month: "Jan", revenue: 85000000 },
    { month: "Feb", revenue: 92000000 },
    { month: "Mar", revenue: 98000000 },
    { month: "Apr", revenue: 105000000 },
    { month: "May", revenue: 110000000 },
    { month: "Jun", revenue: 117050000 },
  ];

  const userGrowthData = [
    { month: "Jan", users: 8500 },
    { month: "Feb", users: 9200 },
    { month: "Mar", users: 10100 },
    { month: "Apr", users: 11000 },
    { month: "May", users: 11900 },
    { month: "Jun", users: 12845 },
  ];

  const colorTypeDistribution = [
    { name: "Warm Autumn", value: 3200, fill: "#D97642" },
    { name: "Cool Summer", value: 2800, fill: "#A2D2FF" },
    { name: "Warm Spring", value: 3400, fill: "#F4D35E" },
    { name: "Cool Winter", value: 3445, fill: "#7B68EE" },
  ];

  const handleSave = () => {
    updateBankInfo(localBankInfo);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden">
              <Menu className="w-6 h-6 text-gray-900" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Clarity Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/users")}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Users className="w-4 h-4" /> Người dùng
            </button>
            <button
              onClick={() => navigate("/admin/revenue")}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <DollarSign className="w-4 h-4" /> Doanh thu
            </button>
            <button
              onClick={() => navigate("/admin/products")}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors border border-purple-200"
            >
              <Package className="w-4 h-4" /> Sản phẩm
            </button>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Users className="w-6 h-6 text-blue-600" />, bg: "bg-blue-100", label: "Tổng người dùng", value: stats.totalUsers.toLocaleString(), badge: "+12%" },
            { icon: <Crown className="w-6 h-6 text-yellow-600" />, bg: "bg-yellow-100", label: "Người dùng Premium", value: stats.premiumUsers.toLocaleString(), badge: "+18%" },
            { icon: <DollarSign className="w-6 h-6 text-green-600" />, bg: "bg-green-100", label: "Doanh thu tháng", value: `₫${(stats.monthlyRevenue / 1000000).toFixed(1)}M`, badge: "+23%" },
            { icon: <Sparkles className="w-6 h-6 text-purple-600" />, bg: "bg-purple-100", label: "Lượt quét AI", value: stats.aiScans.toLocaleString(), badge: "+31%" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center`}>{s.icon}</div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{s.badge}</span>
              </div>
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Line Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Xu hướng doanh thu</h2>
              <button onClick={() => navigate("/admin/revenue")} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Chi tiết →
              </button>
            </div>
            <LineChartCustom
              data={revenueData}
              valueKey="revenue"
              color="#3B82F6"
              formatValue={(v) => `₫${(v / 1000000).toFixed(0)}M`}
            />
          </div>

          {/* User Growth Bar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Tăng trưởng người dùng</h2>
              <button onClick={() => navigate("/admin/users")} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Chi tiết →
              </button>
            </div>
            <BarChartCustom
              data={userGrowthData}
              valueKey="users"
              color="#8B5CF6"
              formatValue={(v) => v.toLocaleString()}
            />
          </div>
        </div>

        {/* Color Type Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-900 mb-5">Phân bố kiểu màu sắc</h2>
          <DonutChart data={colorTypeDistribution} />
        </div>

        {/* Bank Information Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            {t("updateBankInfo")}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                { label: "Tên ngân hàng", key: "bankName" as const },
                { label: t("accountHolder"), key: "accountName" as const },
                { label: t("bankAccount"), key: "accountNumber" as const },
                { label: t("qrCodeUrl"), key: "qrCodeUrl" as const },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={localBankInfo[field.key]}
                    onChange={(e) => setLocalBankInfo({ ...localBankInfo, [field.key]: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                  />
                </div>
              ))}

              <button
                onClick={handleSave}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-colors ${
                  saved ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Save className="w-4 h-4" />
                {saved ? "Đã lưu!" : t("saveSettings")}
              </button>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50">
              <p className="text-gray-500 text-sm mb-4 font-medium">Xem trước mã QR</p>
              {localBankInfo.qrCodeUrl ? (
                <img src={localBankInfo.qrCodeUrl} alt="QR Preview" className="w-48 h-48 object-cover rounded-xl shadow-sm" />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Chưa có ảnh</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
