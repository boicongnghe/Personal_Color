import { useNavigate } from "react-router";
import {
  ArrowLeft, Sparkles, Check, X, Crown, Gem, Palette,
  Bookmark, Share2, ChevronRight, ShoppingBag, Shirt,
} from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { motion } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { COLOR_TYPES } from "../data/colorTypes";

// Season label style map
const SEASON_BADGE: Record<string, string> = {
  Autumn: "bg-amber-100 text-amber-700",
  Summer: "bg-sky-100 text-sky-700",
  Spring: "bg-green-100 text-green-700",
  Winter: "bg-indigo-100 text-indigo-700",
};

const SEASON_VI: Record<string, string> = {
  Autumn: "Mùa Thu",
  Summer: "Mùa Hè",
  Spring: "Mùa Xuân",
  Winter: "Mùa Đông",
};

export function AnalysisResult() {
  const navigate  = useNavigate();
  const { t, lastScanResultId, language, scanHistory, user } = useAppContext();

  const hasScan = lastScanResultId !== null || scanHistory.length > 0;

  // Resolve the result only when scan data exists
  const resolvedId = lastScanResultId ?? scanHistory[0]?.colorTypeId ?? null;
  const result = resolvedId ? (COLOR_TYPES.find(ct => ct.id === resolvedId) ?? null) : null;

  const isVi = language === "vi";
  const colorType   = result ? (isVi ? result.nameVi       : result.name)               : "";
  const undertone   = result ? (isVi ? result.undertoneVi  : result.undertone)           : "";
  const contrast    = result ? (isVi ? result.contrastVi   : result.contrast)            : "";
  const description = result ? (isVi ? result.descriptionVi : result.description)        : "";
  const detail      = result ? (isVi ? result.detailedAnalysisVi : result.detailedAnalysis) : "";

  return (
    <div className="min-h-screen bg-slate-50 pb-nav">
      {/* Header */}
      <div className="px-5 pt-10 pb-3">
        <button
          onClick={() => navigate("/home")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors mb-4"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{t("resultTitle")}</h1>
          <div className="flex gap-2">
            <button className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-purple-50 transition-colors">
              <Bookmark className="w-4 h-4 text-purple-500" />
            </button>
            <button className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-purple-50 transition-colors">
              <Share2 className="w-4 h-4 text-purple-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Empty state when no scan yet ── */}
      {!hasScan ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <Palette className="w-12 h-12 text-purple-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có kết quả phân tích</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
            Hãy quét khuôn mặt để AI khám phá bảng màu cá nhân của bạn
          </p>
          <button
            onClick={() => navigate("/scan")}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-bold shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Quét khuôn mặt ngay
          </button>
        </div>
      ) : result ? (
        <>
      {/* ── Main Result Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 mb-5 mt-2"
      >
        <div className={`relative overflow-hidden bg-gradient-to-br ${result.cardGradient} rounded-3xl p-6 text-white shadow-xl`}>
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/15 rounded-full blur-2xl" />

          <div className="relative z-10 space-y-4">
            {/* Season tag + name */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                    {SEASON_VI[result.season] ?? result.season}
                  </span>
                </div>
                <h2 className="text-3xl font-bold drop-shadow-md leading-tight">{colorType}</h2>
                <p className="text-white/80 text-sm mt-0.5">{result.name}</p>
              </div>
            </div>

            {/* Description */}
            <div className="text-white/95 leading-relaxed text-sm space-y-1">
              <p className="font-medium">{description}</p>
              <p className="opacity-85">{detail}</p>
            </div>

            {/* Confidence bar */}
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <span className="text-sm font-bold whitespace-nowrap">
                {result.confidence}% {t("confidence")}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Traits Grid ── */}
      <div className="px-6 mb-6 grid grid-cols-2 gap-3">
        {[
          { label: t("undertone"), value: undertone },
          { label: t("contrast"),  value: contrast  },
        ].map(({ label, value }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
          >
            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">{label}</p>
            <p className="text-gray-900 font-semibold text-sm">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Best Colors ── */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t("bestColors")}</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {result.bestColors.map((color, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div
                className="w-full aspect-square rounded-xl mb-2 shadow-inner ring-1 ring-black/8"
                style={{ backgroundColor: color.hex }}
              />
              <p className="text-xs font-semibold text-gray-800 text-center leading-tight">
                {isVi ? color.nameVi : color.name}
              </p>
              <p className="text-[10px] text-gray-400 text-center mt-0.5">{color.hex}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Avoid Colors ── */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-red-100 p-1.5 rounded-lg">
            <X className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{t("avoidColors")}</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {result.avoidColors.map((color, i) => (
            <div key={i} className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 opacity-80">
              <div
                className="w-full aspect-square rounded-lg mb-1.5 ring-1 ring-black/8"
                style={{ backgroundColor: color.hex }}
              />
              <p className="text-[10px] font-medium text-gray-600 text-center leading-tight truncate px-0.5">
                {isVi ? color.nameVi : color.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Color Combinations ── */}
      <div className="px-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{t("combinations")}</h3>
        <div className="space-y-3">
          {result.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
            >
              <div className="flex gap-2 flex-shrink-0">
                <div className="w-12 h-12 rounded-xl shadow-inner ring-1 ring-black/8" style={{ backgroundColor: rec.color1 }} />
                <div className="w-12 h-12 rounded-xl shadow-inner ring-1 ring-black/8" style={{ backgroundColor: rec.color2 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  {isVi ? rec.occasionVi : rec.occasion} {t("outfit")}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{t("perfectPair")}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Accessories ── */}
      <div className="px-6 mb-6 space-y-3">
        {/* Jewelry */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Gem className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-gray-900">{t("jewelry")}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(isVi ? result.jewelryVi : result.jewelry).map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-800 px-3 py-1.5 rounded-xl text-sm font-medium border border-yellow-200">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Makeup */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-gray-900">{t("makeup")}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(isVi ? result.makeupVi : result.makeup).map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-xl text-sm font-medium border border-pink-200">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Profile Summary Card ── */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl p-5 border border-purple-100">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-3">📋 Hồ sơ màu sắc của bạn</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Nhóm",       value: colorType },
              { label: "Mùa",        value: SEASON_VI[result.season] ?? result.season },
              { label: "Sắc độ da",  value: undertone },
              { label: "Độ tương phản", value: contrast },
            ].map(({ label, value }, i) => (
              <div key={i} className="bg-white rounded-xl px-3 py-2.5 shadow-sm">
                <p className="text-gray-400 text-[10px] uppercase font-bold">{label}</p>
                <p className="text-gray-900 font-semibold text-xs mt-0.5 leading-tight">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Premium Upsell ── */}
      {!user.isPremium && (
        <div className="px-6 mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-40 translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-white">
                <h3 className="font-bold mb-0.5">{t("premiumUpsellTitle")}</h3>
                <p className="text-yellow-50 text-xs">{t("premiumUpsellDesc")}</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/premium")}
              className="w-full mt-4 py-3 bg-white text-yellow-600 rounded-xl font-bold text-sm hover:bg-yellow-50 transition-colors shadow-sm"
            >
              {t("upgradeToPremium")} →
            </button>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="px-6 mb-8 space-y-3">
        <button
          onClick={() => navigate("/outfits")}
          className="w-full flex items-center justify-between gap-3 py-4 px-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-2xl shadow-xl active:scale-[0.98] transition-all"
          style={{ boxShadow: "0 8px 32px rgba(168,85,247,0.4)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold leading-tight">Xem trang phục phù hợp</p>
              <p className="text-white/75 text-xs">Gợi ý dựa trên tông màu của bạn</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-xl px-3 py-1.5 border border-white/30 flex-shrink-0">
            <Shirt className="w-4 h-4 text-white" />
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </button>
        <button
          onClick={() => navigate("/wardrobe")}
          className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
        >
          Xem tủ đồ phù hợp →
        </button>
        <button
          onClick={() => navigate("/scan-history")}
          className="w-full py-4 bg-white text-gray-700 rounded-2xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Xem lịch sử quét của tôi
        </button>
      </div>

        </>
      ) : null}

      <BottomNav active="home" />
    </div>
  );
}