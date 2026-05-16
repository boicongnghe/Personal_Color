import { useNavigate } from "react-router";
import { useState } from "react";
import { ArrowLeft, TrendingUp, DollarSign, Calendar } from "lucide-react";

// ── Custom SVG Area+Line Chart ──────────────────────────────────────────────
function AreaLineChart({
  data,
  areaKey,
  lineKey,
  formatArea,
  formatLine,
}: {
  data: Record<string, any>[];
  areaKey: string;
  lineKey: string;
  formatArea: (v: number) => string;
  formatLine: (v: number) => string;
}) {
  const W = 480;
  const H = 200;
  const pad = { top: 20, right: 16, bottom: 28, left: 52 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const areaVals = data.map((d) => d[areaKey]);
  const aMax = Math.max(...areaVals);
  const aMin = Math.min(...areaVals) * 0.9;
  const aRange = aMax - aMin || 1;

  const lineVals = data.map((d) => d[lineKey]);
  const lMax = Math.max(...lineVals);
  const lMin = Math.min(...lineVals) * 0.9;
  const lRange = lMax - lMin || 1;

  const toX = (i: number) => pad.left + (i / (data.length - 1)) * innerW;
  const toYA = (v: number) => pad.top + innerH - ((v - aMin) / aRange) * innerH;
  const toYL = (v: number) => pad.top + innerH - ((v - lMin) / lRange) * innerH;

  const areaPoints = data.map((d, i) => `${toX(i)},${toYA(d[areaKey])}`).join(" ");
  const areaFill = [
    `${toX(0)},${pad.top + innerH}`,
    ...data.map((d, i) => `${toX(i)},${toYA(d[areaKey])}`),
    `${toX(data.length - 1)},${pad.top + innerH}`,
  ].join(" ");
  const linePoints = data.map((d, i) => `${toX(i)},${toYL(d[lineKey])}`).join(" ");

  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        {/* Y-axis labels */}
        {[0, 0.5, 1].map((t) => {
          const y = pad.top + innerH * (1 - t);
          return (
            <g key={`ya-${t}`}>
              <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#F3F4F6" strokeWidth={1} />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={8} fill="#9CA3AF">
                {formatArea(aMin + aRange * t)}
              </text>
            </g>
          );
        })}
        {/* Area */}
        <polygon points={areaFill} fill="#3B82F6" fillOpacity={0.1} />
        {/* Area line */}
        <polyline points={areaPoints} fill="none" stroke="#3B82F6" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {/* Line (subscriptions) */}
        <polyline points={linePoints} fill="none" stroke="#10B981" strokeWidth={2} strokeDasharray="4 2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots + tooltips */}
        {data.map((d, i) => (
          <g key={`pt-${d.month ?? i}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer" }}
          >
            <circle cx={toX(i)} cy={toYA(d[areaKey])} r={hovered === i ? 6 : 4} fill="#3B82F6" stroke="white" strokeWidth={2} />
            <circle cx={toX(i)} cy={toYL(d[lineKey])} r={hovered === i ? 5 : 3} fill="#10B981" stroke="white" strokeWidth={1.5} />
            {hovered === i && (
              <g>
                <rect x={toX(i) - 42} y={toYA(d[areaKey]) - 32} width={84} height={28} rx={4} fill="#1F2937" fillOpacity={0.92} />
                <text x={toX(i)} y={toYA(d[areaKey]) - 18} textAnchor="middle" fontSize={8} fill="#93C5FD">{formatArea(d[areaKey])}</text>
                <text x={toX(i)} y={toYA(d[areaKey]) - 8} textAnchor="middle" fontSize={8} fill="#6EE7B7">{formatLine(d[lineKey])} subs</text>
              </g>
            )}
            <text x={toX(i)} y={H - 4} textAnchor="middle" fontSize={9} fill="#6B7280">{d.month}</text>
          </g>
        ))}
        {/* Legend */}
        <g>
          <rect x={pad.left} y={4} width={8} height={8} fill="#3B82F6" />
          <text x={pad.left + 11} y={11} fontSize={8} fill="#6B7280">Revenue</text>
          <line x1={pad.left + 52} y1={8} x2={pad.left + 62} y2={8} stroke="#10B981" strokeWidth={2} strokeDasharray="4 2" />
          <text x={pad.left + 65} y={11} fontSize={8} fill="#6B7280">Subscriptions</text>
        </g>
      </svg>
    </div>
  );
}

// ── Custom CSS Bar Chart ────────────────────────────────────────────────────
function BarChartCustom({
  data,
  labelKey,
  valueKey,
  color,
  formatValue,
}: {
  data: Record<string, any>[];
  labelKey: string;
  valueKey: string;
  color: string;
  formatValue: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-2 h-44 w-full">
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100;
        return (
          <div key={d[labelKey]} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="relative w-full flex justify-center">
              {hovered === i && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {formatValue(d[valueKey])}
                </div>
              )}
              <div
                className="w-full rounded-t-lg transition-all cursor-pointer"
                style={{ height: `${pct * 1.44}px`, backgroundColor: color, opacity: hovered === i ? 1 : 0.75 }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            </div>
            <span className="text-xs text-gray-500">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── AdminRevenue ────────────────────────────────────────────────────────────
export function AdminRevenue() {
  const navigate = useNavigate();

  const monthlyRevenue = [
    { month: "Jan", revenue: 85000000, subscriptions: 1850 },
    { month: "Feb", revenue: 92000000, subscriptions: 2020 },
    { month: "Mar", revenue: 98000000, subscriptions: 2150 },
    { month: "Apr", revenue: 105000000, subscriptions: 2280 },
    { month: "May", revenue: 110000000, subscriptions: 2310 },
    { month: "Jun", revenue: 117050000, subscriptions: 2341 },
  ];

  const dailyRevenue = [
    { day: "T2", revenue: 3500000 },
    { day: "T3", revenue: 4200000 },
    { day: "T4", revenue: 3800000 },
    { day: "T5", revenue: 4500000 },
    { day: "T6", revenue: 5200000 },
    { day: "T7", revenue: 6100000 },
    { day: "CN", revenue: 5800000 },
  ];

  const revenueBySource = [
    { source: "Premium Subscriptions", amount: 117050000, percentage: 82, color: "#3B82F6" },
    { source: "Affiliate Sales", amount: 22400000, percentage: 16, color: "#8B5CF6" },
    { source: "Other", amount: 2850000, percentage: 2, color: "#10B981" },
  ];

  const stats = {
    totalRevenue: 117050000,
    growth: 23.4,
    avgPerUser: 50000,
    conversionRate: 18.2,
  };

  const transactions = [
    { user: "Nguyễn Văn A", amount: 50000, type: "Premium", date: "2026-03-07" },
    { user: "Trần Thị B",   amount: 50000, type: "Premium", date: "2026-03-07" },
    { user: "Lê Văn C",     amount: 125000, type: "Affiliate", date: "2026-03-06" },
    { user: "Phạm Thị D",   amount: 50000, type: "Premium", date: "2026-03-06" },
    { user: "Hoàng Văn E",  amount: 50000, type: "Premium", date: "2026-03-05" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
            <p className="text-sm text-gray-500">Tổng quan doanh thu</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <DollarSign className="w-6 h-6 text-green-600" />, bg: "bg-green-100", label: "Tổng doanh thu", value: `₫${(stats.totalRevenue / 1000000).toFixed(1)}M`, badge: `+${stats.growth}%` },
            { icon: <TrendingUp className="w-6 h-6 text-blue-600" />,  bg: "bg-blue-100",  label: "Tăng trưởng",    value: `${stats.growth}%`,                                  badge: null },
            { icon: <DollarSign className="w-6 h-6 text-purple-600" />, bg: "bg-purple-100", label: "Trung bình/người", value: `₫${(stats.avgPerUser / 1000).toFixed(0)}K`,   badge: null },
            { icon: <Calendar className="w-6 h-6 text-yellow-600" />,  bg: "bg-yellow-100", label: "Tỷ lệ chuyển đổi", value: `${stats.conversionRate}%`,                     badge: null },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center`}>{s.icon}</div>
                {s.badge && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{s.badge}</span>}
              </div>
              <p className="text-gray-500 text-xs mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Monthly Area+Line Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Doanh thu & Số đăng ký theo tháng</h2>
          <AreaLineChart
            data={monthlyRevenue}
            areaKey="revenue"
            lineKey="subscriptions"
            formatArea={(v) => `₫${(v / 1000000).toFixed(0)}M`}
            formatLine={(v) => v.toLocaleString()}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Doanh thu trong tuần</h2>
            <BarChartCustom
              data={dailyRevenue}
              labelKey="day"
              valueKey="revenue"
              color="#3B82F6"
              formatValue={(v) => `₫${(v / 1000000).toFixed(1)}M`}
            />
          </div>

          {/* Revenue by Source */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Nguồn doanh thu</h2>
            <div className="space-y-5">
              {revenueBySource.map((s) => (
                <div key={s.source}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-800">{s.source}</span>
                    <span className="text-sm font-bold text-gray-900">₫{(s.amount / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{s.percentage}% tổng doanh thu</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Giao dịch gần đây</h2>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={`${tx.user}-${tx.date}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {tx.user.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{tx.user}</p>
                    <p className="text-xs text-gray-500">{tx.type} · {tx.date}</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+₫{tx.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
