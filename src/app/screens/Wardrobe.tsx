import { useNavigate } from "react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Shirt, Filter, Trash2, Sparkles, Crown, Lock,
  Zap, Star, CheckCircle2, Palette, Wand2, X, Pencil, Tag, Check,
  Camera, ImageIcon, Clock, Download, User, ChevronRight,
  SwitchCamera, RefreshCw,
} from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAppContext, WardrobeItem } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import useTryOn, { TryOnHistoryEntry, ItemMeta } from "../hooks/useTryOn";
import { updateWardrobeItem as updateWardrobeItemApi } from "../../api/api";

const STANDARD_CATEGORIES = ["Áo", "Quần", "Váy", "Áo khoác", "Phụ kiện", "Giày dép"];
const EDIT_CATEGORIES     = STANDARD_CATEGORIES;
const EDIT_OCCASIONS      = ["Thường ngày", "Công sở", "Dự tiệc", "Kỳ nghỉ", "Hẹn hò", "Thể thao"];

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
  const { wardrobeList, deleteWardrobeItem, t, user, loadWardrobe } = useAppContext();
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [showPaywall, setShowPaywall] = useState(false);
  const [tryingItemId, setTryingItemId] = useState<string | null>(null);
  const [editItem,          setEditItem]          = useState<WardrobeItem | null>(null);
  const [showPhotoModal,    setShowPhotoModal]    = useState(false);
  const [showCameraModal,   setShowCameraModal]   = useState(false);
  const [pendingItem,       setPendingItem]       = useState<{ id: string; meta: ItemMeta } | null>(null);
  const [viewHistoryEntry,  setViewHistoryEntry]  = useState<TryOnHistoryEntry | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const {
    loading, result, error, progress,
    hasPersonPhoto, personPhotoUrl, photoLoading,
    history, loadPersonPhoto, uploadPersonPhoto, tryOn, reset, clearHistory, deleteHistoryEntry,
  } = useTryOn(user.id ?? user._id ?? '');

  const isPremium = user.isPremium;

  const handlePersonPhoto = async (file: File) => {
    const { success } = await uploadPersonPhoto(file);
    if (success && pendingItem) {
      await tryOn(pendingItem.id, pendingItem.meta);
      setPendingItem(null);
    }
  };

  const onPersonPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    await handlePersonPhoto(file);
  };

  const handleCameraCapture = async (file: File) => {
    setShowCameraModal(false);
    await handlePersonPhoto(file);
  };

  const onTryOn = async (item: WardrobeItem) => {
    setTryingItemId(item.id);
    const meta: ItemMeta = { name: item.name, category: item.category, image: item.image ?? null };
    if (!hasPersonPhoto) {
      setPendingItem({ id: item.id, meta });
      setShowPhotoModal(true);
      return;
    }
    const res = await tryOn(item.id, meta);
    if (res?.needsPhoto) {
      setPendingItem({ id: item.id, meta });
      setShowPhotoModal(true);
    }
  };

  useEffect(() => {
    loadWardrobe();
    if (isPremium) loadPersonPhoto();
  }, []);

  const filtered = activeCategory === "Tất cả"
    ? wardrobeList
    : wardrobeList.filter(item => item.category === activeCategory);

  const countOf = (cat: string) =>
    cat === "Tất cả"
      ? wardrobeList.length
      : wardrobeList.filter((i) => i.category === cat).length;

  // Dynamic category tabs: standard first, then custom
  const allUsedCats = Array.from(new Set(wardrobeList.map(i => i.category)));
  const dynamicCategories = [
    "Tất cả",
    ...STANDARD_CATEGORIES.filter(c => allUsedCats.includes(c)),
    ...allUsedCats.filter(c => !STANDARD_CATEGORIES.includes(c)),
  ];


  const saveEdit = async (id: string | number, name: string, category: string, occasions: string[], imageFile?: File | null) => {
    if (imageFile) {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('category', category);
      fd.append('occasions', JSON.stringify(occasions));
      fd.append('photo', imageFile);
      await updateWardrobeItemApi(id as string, fd);
    } else {
      await updateWardrobeItemApi(id as string, { name, category, occasions });
    }
    await loadWardrobe();
    setEditItem(null);
  };

  /* ── Premium required action guard ── */
  const requirePremium = (cb: () => void) => {
    if (!isPremium) { setShowPaywall(true); return; }
    cb();
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-nav overflow-x-hidden">

      {/* ── Paywall Sheet ── */}
      <AnimatePresence>
        {showPaywall && (
          <WardrobePaywall
            onUpgrade={() => { setShowPaywall(false); navigate("/premium"); }}
            onClose={() => setShowPaywall(false)}
          />
        )}
      </AnimatePresence>

      {/* Hidden gallery input */}
      <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={onPersonPhotoChange} />

      {/* ── Camera Modal (real camera) ── */}
      <AnimatePresence>
        {showCameraModal && (
          <WardrobeCameraModal
            onCapture={handleCameraCapture}
            onClose={() => setShowCameraModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Person Photo Modal ── */}
      <AnimatePresence>
        {showPhotoModal && (
          <PersonPhotoModal
            isEdit={!pendingItem}
            onCamera={() => { setShowPhotoModal(false); setShowCameraModal(true); }}
            onGallery={() => { setShowPhotoModal(false); setTimeout(() => galleryInputRef.current?.click(), 50); }}
            onClose={() => { setShowPhotoModal(false); setPendingItem(null); setTryingItemId(null); }}
          />
        )}
      </AnimatePresence>

      {/* ── History Viewer ── */}
      <AnimatePresence>
        {viewHistoryEntry && (
          <HistoryViewer entry={viewHistoryEntry} onClose={() => setViewHistoryEntry(null)} />
        )}
      </AnimatePresence>

      {/* ── Edit Sheet ── */}
      <AnimatePresence>
        {editItem && (
          <EditSheet
            item={editItem}
            onSave={saveEdit}
            onClose={() => setEditItem(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pb-3" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t("myWardrobe")}</h1>
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
          {/* ── Model Photo Card ── */}
          <div className="px-6 mb-5">
            <div className="bg-white rounded-3xl shadow-sm border border-purple-100 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {/* Portrait thumbnail */}
                <div className="relative w-14 h-[72px] rounded-2xl overflow-hidden bg-gray-100 border-2 border-purple-100 flex-shrink-0">
                  {photoLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : personPhotoUrl ? (
                    <img src={personPhotoUrl} alt="Ảnh mẫu" className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50">
                      <User className="w-6 h-6 text-purple-300" />
                    </div>
                  )}
                  {personPhotoUrl && (
                    <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-black/30 to-transparent" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">Ảnh mẫu AI</p>
                  <p className="text-xs mt-0.5 leading-snug">
                    {personPhotoUrl
                      ? <span className="text-green-600 font-medium">✓ Đã có ảnh — sẵn sàng thử đồ</span>
                      : <span className="text-amber-600">Chưa có ảnh · Thêm để dùng AI thử đồ</span>
                    }
                  </p>
                </div>

                {/* Action button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setPendingItem(null); setShowPhotoModal(true); }}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors ${
                    personPhotoUrl
                      ? "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                      : "bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-md"
                  }`}
                >
                  {personPhotoUrl ? "Đổi ảnh" : "Thêm ảnh"}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="px-6 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {dynamicCategories.map((cat) => {
                const isActive = activeCategory === cat;
                const activeColor = CATEGORY_COLORS[cat] ?? "bg-gradient-to-r from-purple-400 to-indigo-400 text-white";
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative flex-shrink-0 px-4 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all duration-200 shadow-sm ${
                      isActive
                        ? `${activeColor} shadow-md scale-105`
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

          {/* IDM-VTON try-on result panel */}
          <AnimatePresence>
            {(loading || result || error) && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mx-6 mb-4 bg-white rounded-2xl shadow-md border border-purple-100 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <div>
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Thử đồ AI</p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {wardrobeList.find(i => i.id === tryingItemId)?.name ?? ''}
                    </p>
                  </div>
                  <button
                    onClick={() => { reset(); setTryingItemId(null); }}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="px-4 pb-4 pt-2">
                  {loading && (
                    <div className="text-center py-6">
                      <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-purple-600 font-medium">{progress || 'Đang xử lý...'}</p>
                    </div>
                  )}
                  {error && !loading && (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-500 mb-3">{error}</p>
                      <button
                        onClick={() => { reset(); setTryingItemId(null); }}
                        className="text-xs text-purple-600 font-semibold underline"
                      >
                        Đóng
                      </button>
                    </div>
                  )}
                  {result && !loading && (
                    <div className="space-y-3">
                      <img
                        src={result.resultImage}
                        alt="Kết quả thử đồ"
                        className="w-full rounded-xl object-contain max-h-72"
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-xs text-green-700 font-semibold">IDM-VTON thử đồ thành công!</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { reset(); setTryingItemId(null); }}
                          className="flex-1 py-2 text-xs font-bold text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                        >
                          Đóng
                        </button>
                        <a
                          href={result.resultImage}
                          download="try-on.jpg"
                          className="flex-1 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl flex items-center justify-center"
                        >
                          Lưu ảnh
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Try-on History */}
          {history.length > 0 && (
            <div className="px-6 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <h3 className="font-bold text-gray-900 text-sm">Lịch sử thử đồ</h3>
                  <span className="text-xs text-gray-400">({history.length})</span>
                </div>
                <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
                  Xóa tất cả
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {history.map(entry => (
                  <div key={entry.id} className="flex-shrink-0 w-[72px] relative group">
                    {/* Delete button */}
                    <button
                      onClick={e => { e.stopPropagation(); deleteHistoryEntry(entry.id); }}
                      className="absolute top-1.5 right-1.5 z-10 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {/* Thumbnail */}
                    <button onClick={() => setViewHistoryEntry(entry)}
                      className="w-full text-left active:scale-95 transition-transform">
                      <div className="w-[72px] h-24 rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                        <img src={entry.resultImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[11px] font-semibold text-gray-800 mt-1.5 line-clamp-1">{entry.itemName}</p>
                      <p className="text-[10px] text-gray-400">{formatRelativeDate(entry.date)}</p>
                    </button>
                  </div>
                ))}
                <button onClick={() => setViewHistoryEntry(history[0])}
                  className="flex-shrink-0 w-[72px] flex flex-col items-center justify-center gap-1 opacity-0 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Wardrobe Grid */}
          {filtered.length > 0 ? (
            <div className="px-6 pb-8">
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-2 gap-4">
                  {filtered.map((item) => {
                    const isThisLoading = loading && tryingItemId === item.id;
                    return (
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
                          <div className={`absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${BADGE_COLORS[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                            {item.category}
                          </div>
                          <div className="absolute top-3 right-3 flex gap-1.5">
                            <button
                              onClick={() => setEditItem(item)}
                              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-purple-50 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-purple-400" />
                            </button>
                            <button
                              onClick={() => { if (window.confirm(t("confirmDelete"))) deleteWardrobeItem(item.id); }}
                              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{item.name}</h3>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.occasions.map((occ) => (
                              <span key={occ} className="text-[10px] font-medium bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                                {occ}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => onTryOn(item)}
                            disabled={isThisLoading}
                            className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                              isThisLoading
                                ? "bg-purple-100 text-purple-500 cursor-wait"
                                : "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 hover:from-purple-100 hover:to-pink-100 border border-purple-100"
                            }`}
                          >
                            {isThisLoading
                              ? "Đang xử lý..."
                              : <><Sparkles className="w-3 h-3" /> Thử đồ AI</>
                            }
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
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

/* ═══════════ Helpers ═══════════ */
function formatRelativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${Math.max(1, mins)} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

/* ═══════════ Camera Modal ═══════════ */
function WardrobeCameraModal({
  onCapture, onClose,
}: { onCapture: (file: File) => void; onClose: () => void }) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode,    setMode]    = useState<"starting" | "live" | "captured" | "denied">("starting");
  const [preview, setPreview] = useState<string | null>(null);
  const [facing,  setFacing]  = useState<"user" | "environment">("user");
  const [flash,   setFlash]   = useState(false);

  const startCamera = useCallback(async (face: "user" | "environment") => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setMode("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: face, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setMode("live");
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
      }, 50);
    } catch { setMode("denied"); }
  }, []);

  useState(() => { startCamera("user"); });

  const stopStream = () => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    setFlash(true); setTimeout(() => setFlash(false), 200);
    if (facing === "user") {
      ctx.save(); ctx.translate(c.width, 0); ctx.scale(-1, 1);
      ctx.drawImage(v, 0, 0, c.width, c.height); ctx.restore();
    } else {
      ctx.drawImage(v, 0, 0, c.width, c.height);
    }
    setPreview(c.toDataURL("image/jpeg", 0.92));
    setMode("captured"); stopStream();
  };

  const handleRetake = () => { setPreview(null); startCamera(facing); };

  const handleUse = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(blob => {
      if (blob) { stopStream(); onCapture(new File([blob], "person.jpg", { type: "image/jpeg" })); }
    }, "image/jpeg", 0.92);
  };

  const handleFlip = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next); startCamera(next);
  };

  const handleClose = () => { stopStream(); onClose(); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black flex flex-col">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pb-3" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <button onClick={handleClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
          <X className="w-5 h-5 text-white" />
        </button>
        <p className="text-white font-bold text-sm">Chụp ảnh toàn thân</p>
        <button onClick={handleFlip} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
          <SwitchCamera className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative overflow-hidden">
        {mode === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full" />
          </div>
        )}
        {mode === "denied" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8">
            <Camera className="w-16 h-16 text-white/30" />
            <p className="text-white font-bold text-center">Không thể truy cập camera</p>
            <p className="text-white/50 text-sm text-center">Kiểm tra quyền camera trong cài đặt trình duyệt</p>
          </div>
        )}
        {(mode === "live" || mode === "starting") && (
          <video ref={videoRef} autoPlay playsInline muted
            className={`absolute inset-0 w-full h-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`} />
        )}
        {mode === "captured" && preview && (
          <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Guide overlay */}
        {mode === "live" && (
          <>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "33% 33%" }} />
            <div className="absolute inset-x-0 bottom-32 flex justify-center pointer-events-none">
              <p className="text-white/60 text-xs bg-black/30 px-3 py-1 rounded-full">Đứng thẳng · Toàn thân · Nền sáng</p>
            </div>
          </>
        )}

        <AnimatePresence>
          {flash && (
            <motion.div key="flash" initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-white pointer-events-none" />
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 pb-10 pt-4 px-8">
        {mode === "captured" ? (
          <div className="flex items-center justify-center gap-6">
            <button onClick={handleRetake} className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center border border-white/20">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <span className="text-white/70 text-xs">Chụp lại</span>
            </button>
            <motion.button whileTap={{ scale: 0.94 }} onClick={handleUse} className="flex flex-col items-center gap-1.5">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <span className="text-white font-bold text-sm">Dùng ảnh này</span>
            </motion.button>
            <div className="w-14 h-14" />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <motion.button whileTap={{ scale: 0.88 }} onClick={handleCapture}
              disabled={mode !== "live"} style={{ width: 76, height: 76 }} className="relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/80" />
              <div className="absolute inset-2 rounded-full bg-white shadow-xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-7 h-7 text-gray-800" />
              </div>
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════ Person Photo Modal ═══════════ */
function PersonPhotoModal({
  onCamera, onGallery, onClose, isEdit = false,
}: { onCamera: () => void; onGallery: () => void; onClose: () => void; isEdit?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center">
      <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl px-6 pt-5 pb-10 shadow-2xl"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
          {isEdit ? "Thay đổi ảnh mẫu" : "Thêm ảnh mẫu"}
        </h2>
        <p className="text-gray-500 text-sm text-center mb-5 leading-relaxed">
          {isEdit
            ? "Chọn ảnh mới để thay thế. AI dùng ảnh này cho tất cả lần thử đồ."
            : "AI cần ảnh toàn thân của bạn để thử đồ."}
        </p>

        <div className="bg-purple-50 rounded-2xl p-4 mb-5 border border-purple-100 space-y-2">
          {[
            "Đứng thẳng, nhìn thẳng vào máy",
            "Ảnh toàn thân — thấy đủ từ đầu đến chân",
            "Nền sáng, quần áo không quá rối",
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-700 text-[10px] font-bold">{i + 1}</span>
              </div>
              <p className="text-xs text-purple-700 font-medium">{tip}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onCamera}
            className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">
            <Camera className="w-5 h-5" /> Chụp ảnh
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onGallery}
            className="flex-1 py-4 border-2 border-purple-200 text-purple-600 rounded-2xl font-bold flex items-center justify-center gap-2 bg-white">
            <ImageIcon className="w-5 h-5" /> Thư viện
          </motion.button>
        </div>

        <button onClick={onClose} className="w-full mt-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Để sau
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════ History Viewer ═══════════ */
function HistoryViewer({ entry, onClose }: { entry: TryOnHistoryEntry; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pb-3" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <button onClick={onClose}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="text-center">
          <p className="text-white font-bold text-sm">{entry.itemName}</p>
          <p className="text-white/50 text-xs">{formatRelativeDate(entry.date)}</p>
        </div>
        <a href={entry.resultImage} download="try-on.jpg"
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
          <Download className="w-5 h-5 text-white" />
        </a>
      </div>

      {/* Result image */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <img src={entry.resultImage} alt="Kết quả thử đồ"
          className="max-w-full max-h-full rounded-3xl object-contain shadow-2xl" />
      </div>

      {/* Footer info */}
      <div className="flex-shrink-0 px-6 pb-10 pt-3">
        <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
          {entry.clothingImage && (
            <img src={entry.clothingImage} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
          )}
          <div>
            <p className="text-white font-semibold text-sm">{entry.itemName}</p>
            <p className="text-white/50 text-xs">{entry.itemCategory} · {formatRelativeDate(entry.date)}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════ Edit Sheet ═══════════ */
function EditSheet({
  item,
  onSave,
  onClose,
}: {
  item: WardrobeItem;
  onSave: (id: string | number, name: string, category: string, occasions: string[], imageFile?: File | null) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName]           = useState(item.name);
  const [category, setCategory]   = useState(item.category);
  const [occasions, setOccasions] = useState<string[]>(item.occasions);
  const [customCats, setCustomCats] = useState<string[]>(
    EDIT_CATEGORIES.includes(item.category) ? [] : [item.category]
  );
  const [customOccs, setCustomOccs] = useState<string[]>(
    item.occasions.filter(o => !EDIT_OCCASIONS.includes(o))
  );
  const [showCatInput,  setShowCatInput]  = useState(false);
  const [showOccInput,  setShowOccInput]  = useState(false);
  const [catText,       setCatText]       = useState("");
  const [occText,       setOccText]       = useState("");
  const [saving,        setSaving]        = useState(false);
  const [imagePreview,  setImagePreview]  = useState<string | null>(item.image ?? null);
  const [newImageFile,  setNewImageFile]  = useState<File | null>(null);
  const [showEditCam,   setShowEditCam]   = useState(false);
  const editGalleryRef = useRef<HTMLInputElement>(null);

  const addCustomCat = () => {
    const val = catText.trim();
    if (val && ![...EDIT_CATEGORIES, ...customCats].includes(val)) setCustomCats(p => [...p, val]);
    if (val) setCategory(val);
    setCatText(""); setShowCatInput(false);
  };

  const addCustomOcc = () => {
    const val = occText.trim();
    if (val && ![...EDIT_OCCASIONS, ...customOccs].includes(val)) {
      setCustomOccs(p => [...p, val]);
      setOccasions(p => [...p, val]);
    } else if (val && !occasions.includes(val)) {
      setOccasions(p => [...p, val]);
    }
    setOccText(""); setShowOccInput(false);
  };

  const toggleOcc = (occ: string) =>
    setOccasions(p => p.includes(occ) ? p.filter(o => o !== occ) : [...p, occ]);

  const handlePickImage = (file: File) => {
    setNewImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setShowEditCam(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(item.id, name, category, occasions, newImageFile); } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end justify-center">
      <motion.div className="absolute inset-0 bg-black/50" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl px-6 pt-5 pb-10 max-h-[88vh] overflow-y-auto shadow-2xl"
      >
        {/* Camera modal for edit sheet */}
        <AnimatePresence>
          {showEditCam && (
            <WardrobeCameraModal onCapture={handlePickImage} onClose={() => setShowEditCam(false)} />
          )}
        </AnimatePresence>

        {/* Hidden gallery input */}
        <input ref={editGalleryRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handlePickImage(f); e.target.value = ''; }} />

        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa trang phục</h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Image */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Hình ảnh trang phục</label>
          <div className="relative w-full h-44 bg-gray-100 rounded-2xl overflow-hidden">
            {imagePreview ? (
              <img src={imagePreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="w-10 h-10 text-gray-300" />
                <p className="text-xs text-gray-400">Chưa có ảnh</p>
              </div>
            )}
            <div className="absolute bottom-2 inset-x-2 flex gap-2">
              <button onClick={() => setShowEditCam(true)}
                className="flex-1 py-2 bg-black/55 backdrop-blur-sm rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                <Camera className="w-3.5 h-3.5" /> Chụp ảnh
              </button>
              <button onClick={() => editGalleryRef.current?.click()}
                className="flex-1 py-2 bg-black/55 backdrop-blur-sm rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                <ImageIcon className="w-3.5 h-3.5" /> Thư viện
              </button>
            </div>
          </div>
          {newImageFile && (
            <p className="text-xs text-green-600 font-medium mt-1.5 ml-1">✓ Đã chọn ảnh mới</p>
          )}
        </div>

        {/* Name */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tên trang phục</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
          />
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Tag className="w-4 h-4 text-purple-500" /> Danh mục
          </label>
          <div className="flex flex-wrap gap-2">
            {[...EDIT_CATEGORIES, ...customCats].map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  category === cat ? "bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-md scale-105" : "bg-gray-100 text-gray-600 hover:bg-purple-50"
                }`}
              >{cat}</button>
            ))}
            {showCatInput ? (
              <div className="flex items-center gap-1">
                <input autoFocus type="text" value={catText} onChange={e => setCatText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addCustomCat(); if (e.key === "Escape") { setShowCatInput(false); setCatText(""); } }}
                  placeholder="Nhập danh mục..." className="w-32 px-3 py-1.5 text-sm rounded-full border-2 border-purple-300 focus:outline-none focus:border-purple-500"
                />
                <button onClick={addCustomCat} className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setShowCatInput(false); setCatText(""); }} className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowCatInput(true)} className="w-8 h-8 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center hover:bg-purple-200 border border-dashed border-purple-300">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Occasions */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Dịp mặc (chọn nhiều)</label>
          <div className="flex flex-wrap gap-2">
            {[...EDIT_OCCASIONS, ...customOccs].map(occ => (
              <button key={occ} onClick={() => toggleOcc(occ)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  occasions.includes(occ) ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-md scale-105" : "bg-gray-100 text-gray-600 hover:bg-purple-50"
                }`}
              >{occ}</button>
            ))}
            {showOccInput ? (
              <div className="flex items-center gap-1">
                <input autoFocus type="text" value={occText} onChange={e => setOccText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addCustomOcc(); if (e.key === "Escape") { setShowOccInput(false); setOccText(""); } }}
                  placeholder="Nhập dịp mặc..." className="w-32 px-3 py-1.5 text-sm rounded-full border-2 border-blue-300 focus:outline-none focus:border-blue-500"
                />
                <button onClick={addCustomOcc} className="w-7 h-7 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setShowOccInput(false); setOccText(""); }} className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowOccInput(true)} className="w-8 h-8 rounded-full bg-blue-100 text-blue-400 flex items-center justify-center hover:bg-blue-200 border border-dashed border-blue-300">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-bold text-lg shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </motion.button>
      </motion.div>
    </motion.div>
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
