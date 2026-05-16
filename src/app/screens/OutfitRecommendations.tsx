import { useNavigate } from "react-router";
import { ArrowLeft, Heart, ShoppingBag, Plus } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

/* ────────────────────────── Types ────────────────────────── */
interface Product {
  id: number;
  name: string;
  price: string;
  shop: "TikTok Shop" | "Shopee" | "Lazada";
  match: number;
  image: string;
  tags: string[];
}

/* ────────────────────────── Data ────────────────────────── */
const ALL_PRODUCTS: Product[] = [
  /* ── Thường ngày ── */
  {
    id: 1,
    name: "Set áo croptop + chân váy midi tông đất",
    price: "450.000",
    shop: "TikTok Shop",
    match: 95,
    image: "https://images.unsplash.com/photo-1673533981698-a3d4fd4e5d64?w=600",
    tags: ["Thường ngày"],
  },
  {
    id: 2,
    name: "Áo phông oversize hoa nhí pastel",
    price: "280.000",
    shop: "Shopee",
    match: 90,
    image: "https://images.unsplash.com/photo-1630540665871-e8ffac858c42?w=600",
    tags: ["Thường ngày"],
  },
  {
    id: 3,
    name: "Set linen trắng basic tối giản",
    price: "520.000",
    shop: "TikTok Shop",
    match: 88,
    image: "https://images.unsplash.com/photo-1746730921745-5f6afa4c56c3?w=600",
    tags: ["Thường ngày", "Kỳ nghỉ"],
  },
  {
    id: 4,
    name: "Áo len hồng pastel dáng rộng",
    price: "360.000",
    shop: "Shopee",
    match: 93,
    image: "https://images.unsplash.com/photo-1687275166296-7766371fd254?w=600",
    tags: ["Thường ngày", "Hẹn hò"],
  },
  {
    id: 5,
    name: "Áo croptop + quần jeans baggy",
    price: "490.000",
    shop: "Lazada",
    match: 87,
    image: "https://images.unsplash.com/photo-1608978405564-80d3936eb78d?w=600",
    tags: ["Thường ngày"],
  },
  {
    id: 6,
    name: "Váy hoa nhỏ dáng xoè nhẹ nhàng",
    price: "420.000",
    shop: "TikTok Shop",
    match: 96,
    image: "https://images.unsplash.com/photo-1763559008868-f5d0f308253b?w=600",
    tags: ["Thường ngày", "Hẹn hò"],
  },

  /* ── Công sở ── */
  {
    id: 7,
    name: "Blazer olive + quần tây ống suông",
    price: "890.000",
    shop: "Shopee",
    match: 98,
    image: "https://images.unsplash.com/photo-1641943632479-3798ef1e14c6?w=600",
    tags: ["Công sở"],
  },
  {
    id: 8,
    name: "Áo sơ mi lụa trắng thanh lịch",
    price: "650.000",
    shop: "TikTok Shop",
    match: 94,
    image: "https://images.unsplash.com/photo-1667562661336-c74208b145ab?w=600",
    tags: ["Công sở"],
  },
  {
    id: 9,
    name: "Set vest nữ kẻ caro hiện đại",
    price: "1.200.000",
    shop: "Lazada",
    match: 91,
    image: "https://images.unsplash.com/photo-1736939666660-d4c776e0532c?w=600",
    tags: ["Công sở", "Dự tiệc"],
  },
  {
    id: 10,
    name: "Áo blouse tay bồng + chân váy bút chì",
    price: "780.000",
    shop: "Shopee",
    match: 89,
    image: "https://images.unsplash.com/photo-1759992878512-ec8f958b13e7?w=600",
    tags: ["Công sở"],
  },
  {
    id: 11,
    name: "Áo len caramel tay dài công sở",
    price: "550.000",
    shop: "TikTok Shop",
    match: 92,
    image: "https://images.unsplash.com/photo-1731404617461-e0eeeeefcf7b?w=600",
    tags: ["Công sở", "Thường ngày"],
  },

  /* ── Dự tiệc ── */
  {
    id: 12,
    name: "Đầm maxi tông đất sang trọng",
    price: "1.250.000",
    shop: "Shopee",
    match: 97,
    image: "https://images.unsplash.com/photo-1764265148862-7ee72a4fb367?w=600",
    tags: ["Dự tiệc"],
  },
  {
    id: 13,
    name: "Set áo sequin ánh kim dạ tiệc",
    price: "1.890.000",
    shop: "TikTok Shop",
    match: 99,
    image: "https://images.unsplash.com/photo-1580078814010-e773e31d97ad?w=600",
    tags: ["Dự tiệc"],
  },
  {
    id: 14,
    name: "Đầm dạ hội midi đỏ gạch",
    price: "1.500.000",
    shop: "Lazada",
    match: 94,
    image: "https://images.unsplash.com/photo-1508829298730-713792c22189?w=600",
    tags: ["Dự tiệc", "Hẹn hò"],
  },
  {
    id: 15,
    name: "Áo tối màu vest thanh lịch buổi tối",
    price: "2.200.000",
    shop: "Shopee",
    match: 96,
    image: "https://images.unsplash.com/photo-1765229277058-177cd0dead2c?w=600",
    tags: ["Dự tiệc"],
  },
  {
    id: 16,
    name: "Chân váy xoè lấp lánh dự tiệc",
    price: "680.000",
    shop: "TikTok Shop",
    match: 91,
    image: "https://images.unsplash.com/photo-1568467020752-b08fbd48e878?w=600",
    tags: ["Dự tiệc"],
  },

  /* ── Kỳ nghỉ ── */
  {
    id: 17,
    name: "Set đầm bohemian đi biển",
    price: "680.000",
    shop: "TikTok Shop",
    match: 93,
    image: "https://images.unsplash.com/photo-1650426442671-691a325d82e0?w=600",
    tags: ["Kỳ nghỉ"],
  },
  {
    id: 18,
    name: "Đầm resort maxi thoáng mát",
    price: "850.000",
    shop: "Shopee",
    match: 95,
    image: "https://images.unsplash.com/photo-1691315720837-ba3509f28ed1?w=600",
    tags: ["Kỳ nghỉ"],
  },
  {
    id: 19,
    name: "Set áo linen + quần ống rộng du lịch",
    price: "620.000",
    shop: "Lazada",
    match: 90,
    image: "https://images.unsplash.com/photo-1559658565-c3d776872a20?w=600",
    tags: ["Kỳ nghỉ", "Thường ngày"],
  },
  {
    id: 20,
    name: "Áo khoác nhẹ + váy hoa mùa hè",
    price: "750.000",
    shop: "TikTok Shop",
    match: 88,
    image: "https://images.unsplash.com/photo-1582930177321-5e1fd7d6cbe2?w=600",
    tags: ["Kỳ nghỉ"],
  },

  /* ── Hẹn hò ── */
  {
    id: 21,
    name: "Đầm hoa nhí nhẹ nhàng buổi chiều",
    price: "920.000",
    shop: "Shopee",
    match: 96,
    image: "https://images.unsplash.com/photo-1745750003448-ba149f954428?w=600",
    tags: ["Hẹn hò"],
  },
  {
    id: 22,
    name: "Áo blouse trắng + quần ống suông thanh lịch",
    price: "750.000",
    shop: "TikTok Shop",
    match: 92,
    image: "https://images.unsplash.com/photo-1744135995007-f1dde493d241?w=600",
    tags: ["Hẹn hò", "Thường ngày"],
  },
  {
    id: 23,
    name: "Set áo coral + quần linen beige",
    price: "680.000",
    shop: "Lazada",
    match: 94,
    image: "https://images.unsplash.com/photo-1768077002909-a2ac2d71d650?w=600",
    tags: ["Hẹn hò"],
  },
  {
    id: 24,
    name: "Áo khoác camel + váy midi nâu",
    price: "1.350.000",
    shop: "Shopee",
    match: 97,
    image: "https://images.unsplash.com/photo-1705920821948-705ae2e61fc0?w=600",
    tags: ["Hẹn hò", "Công sở"],
  },
];

/* ────────────────────────── Filter config ────────────────────────── */
const FILTERS = [
  { key: "Tất cả",    emoji: "✨" },
  { key: "Thường ngày", emoji: "👟" },
  { key: "Công sở",  emoji: "💼" },
  { key: "Dự tiệc",  emoji: "🎉" },
  { key: "Kỳ nghỉ",  emoji: "🌴" },
  { key: "Hẹn hò",   emoji: "💕" },
];

const FILTER_ACTIVE: Record<string, string> = {
  "Tất cả":     "from-purple-400 to-pink-400",
  "Thường ngày":"from-sky-400 to-cyan-400",
  "Công sở":    "from-slate-500 to-gray-600",
  "Dự tiệc":    "from-fuchsia-500 to-purple-500",
  "Kỳ nghỉ":   "from-emerald-400 to-teal-400",
  "Hẹn hò":    "from-rose-400 to-pink-500",
};

const SHOP_COLORS: Record<string, string> = {
  "TikTok Shop": "bg-black text-white",
  "Shopee":      "bg-orange-500 text-white",
  "Lazada":      "bg-blue-600 text-white",
};

export function OutfitRecommendations() {
  const navigate = useNavigate();
  const { t } = useAppContext();
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  const filtered =
    activeFilter === "Tất cả"
      ? ALL_PRODUCTS
      : ALL_PRODUCTS.filter((p) => p.tags.includes(activeFilter));

  const toggleLike = (id: number) => {
    setLikedItems((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <button
          onClick={() => navigate("/home")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-purple-50 transition-colors mb-6"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{t("outfitTitle")}</h1>
        <p className="text-gray-500 text-sm">{t("outfitDesc")}</p>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {FILTERS.map(({ key, emoji }) => {
            const isActive = activeFilter === key;
            const count =
              key === "Tất cả"
                ? ALL_PRODUCTS.length
                : ALL_PRODUCTS.filter((p) => p.tags.includes(key)).length;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${FILTER_ACTIVE[key]} text-white shadow-md scale-105`
                    : "bg-white text-gray-600 border border-purple-100 shadow-sm hover:bg-purple-50"
                }`}
              >
                <span className="mr-1">{emoji}</span>
                {key}
                <span
                  className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/25 text-white" : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-6 pb-8">
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
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
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Match */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full shadow">
                    {product.match}% {t("matchLabel")}
                  </div>
                  {/* Like */}
                  <button
                    onClick={() => toggleLike(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedItems.has(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-purple-600 font-bold text-base mb-2">
                    ₫{product.price}
                  </p>
                  <div className="flex gap-2 items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${SHOP_COLORS[product.shop]}`}>
                      {product.shop}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => alert("Chuyển đến " + product.shop)}
                      className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 hover:shadow-md transition-shadow"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      {t("buyNow")}
                    </button>
                    <button
                      onClick={() => {
                        alert(t("addedToWardrobe"));
                        toggleLike(product.id);
                      }}
                      className="w-9 h-9 flex-shrink-0 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg">Không có bộ đồ nào</p>
          </div>
        )}
      </div>

      {/* Notice */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
          <p className="text-xs text-gray-400 text-center">
            <ShoppingBag className="w-4 h-4 inline mr-1 text-purple-400" />
            Mua hàng qua liên kết giúp ủng hộ Clarity 💜
          </p>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
