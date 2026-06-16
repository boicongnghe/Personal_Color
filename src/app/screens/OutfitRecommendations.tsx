import { useNavigate } from "react-router";
import { ArrowLeft, Heart, ShoppingBag, Package } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useState, useEffect, useMemo } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { getProducts, trackProductClick } from "../../api/api";

/* ────────────────────────── Types ────────────────────────── */
interface ApiProduct {
  _id: string;
  title: string;
  image?: string;
  price?: number;
  platform: string;
  occasions: string[];
  seasons: string[];
  genders: string[];
  bodyTypes: string[];
  category: string;
  affiliateUrl: string;
  isActive: boolean;
  clickCount: number;
}

/* ────────────────────────── Occasion helpers ────────────────────────── */
const VI_OCCASION: Record<string, string> = {
  casual: "Thường ngày",
  office: "Công sở",
  party:  "Dự tiệc",
  all:    "Tất cả",
};
const displayOccasion = (o: string) => VI_OCCASION[o] ?? o;

const OCCASION_EMOJI: Record<string, string> = {
  casual: "👟",
  office: "💼",
  party:  "🎉",
};
const emojiFor = (o: string) => OCCASION_EMOJI[o] ?? "🏷️";

const OCCASION_GRADIENT: Record<string, string> = {
  casual: "from-sky-400 to-cyan-400",
  office: "from-slate-500 to-gray-600",
  party:  "from-fuchsia-500 to-purple-500",
};
const gradientFor = (o: string) => OCCASION_GRADIENT[o] ?? "from-violet-400 to-purple-500";

/* ────────────────────────── Platform helpers ────────────────────────── */
const PLATFORM_BADGE: Record<string, string> = {
  shopee: "bg-orange-500 text-white",
  tiktok: "bg-neutral-900 text-white",
  lazada: "bg-blue-600 text-white",
  tiki:   "bg-sky-400 text-white",
  other:  "bg-gray-500 text-white",
};
const PLATFORM_LABEL: Record<string, string> = {
  shopee: "Shopee",
  tiktok: "TikTok Shop",
  lazada: "Lazada",
  tiki:   "Tiki",
  other:  "Shop",
};

/* ══════════════════════════════════════════
   Main component
══════════════════════════════════════════ */
export function OutfitRecommendations() {
  const navigate = useNavigate();
  const { t, user, favoriteOutfitIds, toggleFavoriteOutfit } = useAppContext();

  const [products, setProducts]             = useState<ApiProduct[]>([]);
  const [loading, setLoading]               = useState(true);
  const [activeOccasion, setActiveOccasion] = useState<string>("all");

  /* Load all products once */
  useEffect(() => {
    setLoading(true);
    getProducts("all")
      .then((res) => setProducts(res.data.data?.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  /* Unique occasions present in DB (excluding the "all" sentinel) */
  const occasions = useMemo(() => {
    const seen = new Set<string>();
    products.forEach((p) =>
      (p.occasions ?? []).forEach((o) => { if (o !== "all") seen.add(o); })
    );
    return Array.from(seen);
  }, [products]);

  /* Client-side filter */
  const filtered = useMemo(() => {
    if (activeOccasion === "all") return products;
    return products.filter(
      (p) =>
        (p.occasions ?? []).includes(activeOccasion) ||
        (p.occasions ?? []).includes("all")
    );
  }, [products, activeOccasion]);

  /* Count helper for a given occasion tab */
  const countFor = (occ: string) =>
    occ === "all"
      ? products.length
      : products.filter(
          (p) =>
            (p.occasions ?? []).includes(occ) ||
            (p.occasions ?? []).includes("all")
        ).length;

  const toggleFav = (id: string) => toggleFavoriteOutfit(id);

  const handleClick = async (p: ApiProduct) => {
    try { await trackProductClick(p._id); } catch { /* non-critical */ }
    window.open(p.affiliateUrl, "_blank");
  };

  /* ── Tab button ── */
  const TabBtn = ({ occ }: { occ: string }) => {
    const isActive = activeOccasion === occ;
    const count    = countFor(occ);
    const label    = occ === "all" ? "Tất cả" : displayOccasion(occ);
    const emoji    = occ === "all" ? "✨" : emojiFor(occ);
    return (
      <button
        onClick={() => setActiveOccasion(occ)}
        className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
          isActive
            ? `bg-gradient-to-r ${occ === "all" ? "from-purple-400 to-pink-400" : gradientFor(occ)} text-white shadow-md scale-105`
            : "bg-white text-gray-600 border border-purple-100 shadow-sm hover:bg-purple-50"
        }`}
      >
        <span className="mr-1">{emoji}</span>
        {label}
        <span className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
          isActive ? "bg-white/25 text-white" : "bg-purple-100 text-purple-600"
        }`}>
          {count}
        </span>
      </button>
    );
  };

  /* ══ Render ══ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-nav overflow-x-hidden">

      {/* Header */}
      <div className="px-5 pt-10 pb-3">
        <button
          onClick={() => navigate("/home")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-purple-50 transition-colors mb-4"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-0.5">{t("outfitTitle")}</h1>
        <p className="text-gray-500 text-sm">{t("outfitDesc")}</p>
      </div>

      {/* Filter tabs — only show when there are products */}
      {!loading && products.length > 0 && (
        <div className="px-5 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <TabBtn occ="all" />
            {occasions.map((occ) => <TabBtn key={occ} occ={occ} />)}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-5 pb-4">
        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Đang tải sản phẩm...</p>
          </div>

        ) : products.length === 0 ? (
          <div className="py-24 text-center text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-gray-500 text-base">Chưa có sản phẩm nào</p>
            <p className="text-sm mt-1">Admin chưa thêm sản phẩm affiliate</p>
          </div>

        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((p) => (
                  <motion.div
                    key={p._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl shadow-md overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] bg-gray-100">
                      <ImageWithFallback
                        src={p.image ?? ""}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => toggleFav(p._id)}
                        data-track="Yêu thích outfit"
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favoriteOutfitIds.has(p._id) ? "fill-red-500 text-red-500" : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2 leading-tight">
                        {p.title}
                      </h3>
                      {p.price ? (
                        <p className="text-purple-600 font-bold text-base mb-2">
                          {p.price.toLocaleString("vi-VN")}đ
                        </p>
                      ) : (
                        <p className="text-gray-300 text-sm mb-2">---</p>
                      )}
                      <div className="mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${PLATFORM_BADGE[p.platform] ?? PLATFORM_BADGE.other}`}>
                          {PLATFORM_LABEL[p.platform] ?? p.platform}
                        </span>
                      </div>
                      <button
                        onClick={() => handleClick(p)}
                        data-track="Mua ngay"
                        className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 hover:shadow-md transition-shadow"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        {t("buyNow")}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <p>Không có sản phẩm nào cho mục này</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Affiliate notice */}
      {!loading && products.length > 0 && (
        <div className="px-6 pb-8">
          <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
            <p className="text-xs text-gray-400 text-center">
              <ShoppingBag className="w-4 h-4 inline mr-1 text-purple-400" />
              Mua hàng qua liên kết giúp ủng hộ Clarity 💜
            </p>
          </div>
        </div>
      )}

      <BottomNav active="home" />
    </div>
  );
}
