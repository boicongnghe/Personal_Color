import { useNavigate } from "react-router";
import { useState } from "react";
import {
  Plus, Shirt, Filter, Trash2, Sparkles, Crown, Lock,
  Zap, Star, CheckCircle2, Palette, Wand2,
} from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

const CATEGORIES = ["Tất cả", "Áo", "Quần", "Váy", "Áo khoác"];

const CATEGORY_COLORS: Record<string, string> = {
  "Tất cả":   "bg-gradient-to-r from-purple-400 to-pink-400 text-white",
  "Áo":       "bg-gradient-to-r from-pink-400 to-rose-400 text-white",
  "Quần":     "bg-gradient-to-r from-blue-400 to-cyan-400 text-white",
  "Váy":      "bg-gradient-to-r from-fuchsia-400 to-purple-400 text-white",
  "Áo khoác": "bg-gradient-to-r from-amber-400 to-orange-400 text-white",
};

const BADGE_COLORS: Record<string, string> = {
  "Áo":       "bg-pink-100 text-pink-700",
  "Quần":     "bg-blue-100 text-blue-700",
  "Váy":      "bg-fuchsia-100 text-fuchsia-700",
  "Áo khoác": "bg-amber-100 text-amber-700",
};

const PREMIUM_FEATURES = [
  { icon: Wand2,   title: "AI Phối đồ tự động",  desc: "AI kết hợp trang phục từ tủ đồ của bạn cho từng dịp" },
  { icon: Palette, title: "Lọc theo bảng màu",   desc: "Chỉ hiển thị trang phục phù hợp tông màu da của bạn" },
  { icon: Star,    title: "Gợi ý xu hướng",       desc: "Cập nhật outfit trending mỗi tuần" },
  { icon: Sparkles,"title": "Tủ đồ không giới hạn", desc: "Thêm bao nhiêu món đồ tùy thích" },
];

export function Wardrobe() {
  const navigate = useNavigate();
  const { wardrobeList, deleteWardrobeItem, t, user } = useAppContext();
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [showPaywall, setShowPaywall] = useState(false);

  const isPremium = user.isPremium;

  const filtered = activeCategory === "Tất cả"
    ? wardrobeList
    : wardrobeList.filter((item) => item.category === activeCategory);

  const countOf = (cat: string) =>
    cat === "Tất cả"
      ? wardrobeList.length
      : wardrobeList.filter((i) => i.category === cat).length;

  /* ── Premium required action guard ── */
  const requirePremium = (cb: () => void) => {
    if (!isPremium) { setShowPaywall(true); return; }
    cb();
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-24">

      {/* ── Paywall Sheet ── */}
      <AnimatePresence>
        {showPaywall && (
          <WardrobePaywall
            onUpgrade={() => { setShowPaywall(false); navigate("/premium"); }}
            onClose={() => setShowPaywall(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("myWardrobe")}</h1>
            <p className="text-gray-500 mt-1">
              {wardrobeList.length} {t("wardrobeMatchDesc")}
            </p>
          </div>
          {isPremium ? (
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-md">
              <Crown className="w-6 h-6 text-white" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
          )}
        </div>
      </div>

      {/* ── FREE USER: Lock Gate ── */}
      {!isPremium && (
        <div className="px-6 mb-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-md"
          >
            <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Tủ đồ là tính năng Premium</p>
              <p className="text-white/80 text-xs">Nâng cấp để dùng tủ đồ AI đầy đủ</p>
            </div>
            <button
              onClick={() => setShowPaywall(true)}
              className="bg-white text-amber-600 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-amber-50 transition-colors flex-shrink-0"
            >
              Mở khoá
            </button>
          </motion.div>
        </div>
      )}

      {/* Add + Filter Buttons */}
      <div className="px-6 mb-5">
        <div className="flex gap-3">
          <button
            onClick={() => requirePremium(() => navigate("/add-clothing"))}
            className={`flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all ${
              isPremium
                ? "bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-pointer"
            }`}
          >
            {isPremium ? <Plus className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
            {t("addClothing")}
          </button>
          <button
            onClick={() => requirePremium(() => {})}
            className={`px-4 py-3 rounded-2xl transition-colors shadow-sm border ${
              isPremium
                ? "bg-white hover:bg-purple-50 border-purple-100"
                : "bg-gray-100 border-gray-200 cursor-pointer"
            }`}
          >
            <Filter className={`w-5 h-5 ${isPremium ? "text-purple-500" : "text-gray-400"}`} />
          </button>
        </div>
      </div>

      {/* ── FREE USER: Full lock overlay section ── */}
      {!isPremium ? (
        <div className="px-6">
          {/* Blurred preview of wardrobe items */}
          <div className="relative mb-6">
            {/* Blurred grid preview */}
            <div className="grid grid-cols-2 gap-4 filter blur-sm pointer-events-none select-none opacity-60">
              {wardrobeList.slice(0, 4).map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="relative aspect-[3/4] bg-gray-100">
                    <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full">
                      {item.match}%
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 backdrop-blur-[2px] rounded-3xl">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl mb-4"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tính năng Premium</h3>
              <p className="text-gray-500 text-sm text-center px-8 mb-5">
                Nâng cấp để mở khoá tủ đồ AI, phối đồ tự động và quản lý trang phục không giới hạn
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPaywall(true)}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Mở khoá Premium
              </motion.button>
              <button
                onClick={() => navigate("/premium")}
                className="mt-3 text-purple-600 text-sm font-semibold hover:underline"
              >
                Xem chi tiết gói Premium →
              </button>
            </div>
          </div>

          {/* Premium features teaser */}
          <div className="mb-6">
            <p className="text-gray-500 text-sm font-semibold mb-3 text-center">
              Tính năng Tủ đồ Premium bao gồm:
            </p>
            <div className="space-y-2.5">
              {PREMIUM_FEATURES.map((feat, i) => (
                <div key={i} className="bg-white rounded-2xl p-3.5 shadow-sm border border-purple-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feat.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{feat.title}</p>
                    <p className="text-xs text-gray-500">{feat.desc}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── PREMIUM USER: Full wardrobe ── */
        <>
          {/* Category Filters */}
          <div className="px-6 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative flex-shrink-0 px-4 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all duration-200 shadow-sm ${
                      isActive
                        ? `${CATEGORY_COLORS[cat]} shadow-md scale-105`
                        : "bg-white text-gray-600 hover:bg-purple-50 border border-purple-100"
                    }`}
                  >
                    {cat}
                    <span className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/30 text-white" : "bg-purple-100 text-purple-600"
                    }`}>
                      {countOf(cat)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wardrobe Grid */}
          {filtered.length > 0 ? (
            <div className="px-6 pb-8">
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-2 gap-4">
                  {filtered.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-2xl shadow-md overflow-hidden"
                    >
                      <div className="relative aspect-[3/4] bg-gray-100">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
                          {item.match}%
                        </div>
                        <div className={`absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${BADGE_COLORS[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                          {item.category}
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(t("confirmDelete"))) deleteWardrobeItem(item.id);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{item.name}</h3>
                        <div className="flex flex-wrap gap-1">
                          {item.occasions.map((occ) => (
                            <span key={occ} className="text-[10px] font-medium bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                              {occ}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shirt className="w-10 h-10 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("emptyWardrobe")}</h3>
              <p className="text-gray-500 mb-6">{t("emptyWardrobeDesc")}</p>
              <button
                onClick={() => navigate("/add-clothing")}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-2xl font-semibold shadow-md"
              >
                {t("addFirstItem")}
              </button>
            </div>
          )}
        </>
      )}

      <BottomNav active="wardrobe" />
    </div>
  );
}

/* ═══════════ Wardrobe Paywall Sheet ═══════════ */
function WardrobePaywall({ onUpgrade, onClose }: { onUpgrade: () => void; onClose: () => void }) {
  const PERKS = [
    "Tủ đồ AI không giới hạn món đồ",
    "Phối đồ tự động theo tông màu da",
    "Lọc & gợi ý theo từng dịp",
    "Quét khuôn mặt không giới hạn",
    "Trợ lý thông minh AI cao cấp",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full bg-white rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl max-w-md mx-auto"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="text-center mb-5">
          <motion.div
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-18 h-18 w-[72px] h-[72px] bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-xl"
          >
            <Crown className="w-9 h-9 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Tủ đồ Premium</h2>
          <p className="text-gray-500 text-sm">
            Tính năng <span className="font-bold text-purple-600">Quản lý Tủ đồ</span> chỉ dành cho <span className="font-bold text-amber-600">thành viên Premium</span>.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 mb-5 border border-purple-100">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-3">Gói Premium bao gồm:</p>
          <div className="space-y-2.5">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700">{perk}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {[
            { label: "1 tháng", price: "50k" },
            { label: "3 tháng", price: "135k", hot: true },
            { label: "6 tháng", price: "240k" },
          ].map((plan) => (
            <div
              key={plan.label}
              className={`flex-1 rounded-2xl p-3 text-center border-2 ${
                plan.hot ? "border-purple-400 bg-gradient-to-b from-purple-50 to-pink-50" : "border-gray-200 bg-white"
              }`}
            >
              {plan.hot && <p className="text-[10px] font-bold text-purple-600 mb-0.5">PHỔ BIẾN</p>}
              <p className="font-bold text-gray-900 text-sm">{plan.price}</p>
              <p className="text-xs text-gray-500">{plan.label}</p>
            </div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onUpgrade}
          className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 mb-3"
        >
          <Zap className="w-5 h-5" />
          Nâng cấp Premium ngay
        </motion.button>
        <button onClick={onClose} className="w-full py-3 text-gray-400 text-sm hover:text-gray-600">
          Để sau
        </button>
      </motion.div>
    </motion.div>
  );
}
