import { useNavigate } from "react-router";
import { ArrowLeft, Camera, FolderOpen, Sparkles, RefreshCw, CheckCircle2, Tag } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";

const CATEGORIES = ["Áo", "Quần", "Váy", "Áo khoác", "Phụ kiện", "Giày dép"];
const OCCASIONS  = ["Thường ngày", "Công sở", "Dự tiệc", "Kỳ nghỉ", "Hẹn hò", "Thể thao"];

export function AddClothing() {
  const navigate = useNavigate();
  const { t, addWardrobeItem } = useAppContext();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [itemName, setItemName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── File picker ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleReset = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleOccasion = (occ: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  /* ── Add to wardrobe ── */
  const handleAdd = () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      addWardrobeItem({
        name: itemName || "Trang phục mới",
        category: selectedCategory || "Áo",
        match: Math.floor(Math.random() * 10) + 88,
        occasions: selectedOccasions.length > 0 ? selectedOccasions : ["Thường ngày"],
        image: selectedImage,
      });
      alert(t("addedToWardrobe"));
      navigate("/wardrobe");
    }, 2200);
  };

  /* ── Analyzing overlay ── */
  if (analyzing) {
    return (
      <div className="min-h-full bg-gradient-to-b from-purple-500 via-pink-400 to-blue-400 flex flex-col items-center justify-center px-6">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 mb-8"
        >
          <Sparkles className="w-20 h-20 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-3">{t("processingImage")}</h2>
        <p className="text-white/90 text-center">{t("processingImageDesc")}</p>
        <div className="mt-8 w-64 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.2 }}
            className="h-full bg-white rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-12">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="px-6 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-purple-50 transition-colors mb-6"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{t("addClothingTitle")}</h1>
        <p className="text-gray-500 text-sm mb-6">{t("addClothingDesc")}</p>

        {/* ── Image preview / placeholder ── */}
        <div className="relative aspect-square bg-white rounded-3xl overflow-hidden mb-5 border-2 border-dashed border-purple-200 shadow-sm">
          <AnimatePresence mode="wait">
            {selectedImage ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <img
                  src={selectedImage}
                  alt="Ảnh trang phục"
                  className="w-full h-full object-cover"
                />
                {/* Success badge */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-800">Ảnh đã chọn</span>
                </div>
                {/* Reset */}
                <button
                  onClick={handleReset}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">{t("flatOnLight")}</p>
                  <p className="text-gray-400 text-xs mt-1">Ảnh sáng, nền trắng cho kết quả tốt nhất</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Pick image buttons ── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-3.5 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
          >
            <FolderOpen className="w-5 h-5" />
            Chọn từ máy
          </button>
          <button
            onClick={() => {
              // Simulate camera: use file picker with camera capture on mobile
              if (fileInputRef.current) {
                fileInputRef.current.setAttribute("capture", "environment");
                fileInputRef.current.click();
              }
            }}
            className="py-3.5 bg-white text-purple-600 rounded-2xl font-semibold border-2 border-purple-300 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            {t("openCamera")}
          </button>
        </div>

        {/* ── Metadata (shown after image selected) ── */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-5"
            >
              {/* Name input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên trang phục (tuỳ chọn)
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="VD: Áo blazer olive yêu thích..."
                  className="w-full px-4 py-3 bg-white rounded-2xl border-2 border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Tag className="w-4 h-4 text-purple-500" />
                  Danh mục
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                        selectedCategory === cat
                          ? "bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-md scale-105"
                          : "bg-white text-gray-600 border border-purple-200 hover:bg-purple-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dịp mặc (chọn nhiều)
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((occ) => {
                    const active = selectedOccasions.includes(occ);
                    return (
                      <button
                        key={occ}
                        onClick={() => toggleOccasion(occ)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                          active
                            ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-md scale-105"
                            : "bg-white text-gray-600 border border-purple-200 hover:bg-purple-50"
                        }`}
                      >
                        {occ}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Analyze & Add button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-5 h-5" />
                Phân tích & Thêm vào tủ đồ
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}