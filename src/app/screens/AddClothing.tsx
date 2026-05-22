import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Camera, FolderOpen, Sparkles, RefreshCw, CheckCircle2, Tag, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { addWardrobeItem as addWardrobeItemApi } from "../../api/api";

const CATEGORIES = ["Áo", "Quần", "Váy", "Áo khoác", "Phụ kiện", "Giày dép"];
const OCCASIONS  = ["Thường ngày", "Công sở", "Dự tiệc", "Kỳ nghỉ", "Hẹn hò", "Thể thao"];

export function AddClothing() {
  const navigate = useNavigate();
  const { t, loadWardrobe } = useAppContext();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile,  setSelectedFile]  = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [itemName, setItemName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  /* cleanup stream on unmount */
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  /* wire stream to video element once overlay is visible */
  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOpen]);

  /* ── File picker ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setSelectedImage(URL.createObjectURL(file));
  };

  /* ── Camera (getUserMedia) ── */
  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 1280 } },
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera trong trình duyệt.");
    }
  };

  const handleCloseCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const handleCapture = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(blob));
      handleCloseCamera();
    }, "image/jpeg", 0.92);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleOccasion = (occ: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  /* ── Add to wardrobe ── */
  const handleAdd = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('name', itemName || 'Trang phục mới');
      formData.append('category', selectedCategory || 'Áo');
      if (selectedFile) formData.append('photo', selectedFile);
      await addWardrobeItemApi(formData);
      await loadWardrobe();
      setAnalyzing(false);
      toast.success("Đã thêm vào tủ đồ!", { description: itemName || "Trang phục mới" });
      navigate("/wardrobe");
    } catch (err: unknown) {
      setAnalyzing(false);
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        toast.error("Yêu cầu Premium", { description: "Nâng cấp để sử dụng tính năng tủ đồ." });
      } else {
        toast.error("Thêm thất bại", { description: "Vui lòng thử lại." });
      }
    }
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
      {/* Hidden file input (gallery only) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Camera overlay ── */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-4 pt-10">
              <button onClick={handleCloseCamera} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
              <span className="text-white font-semibold text-sm">Chụp trang phục</span>
              <div className="w-10" />
            </div>

            {/* Video preview */}
            <div className="flex-1 relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/60 rounded-2xl" />
              </div>
            </div>

            {/* Capture button */}
            <div className="flex justify-center py-8">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCapture}
                className="w-20 h-20 rounded-full bg-white border-4 border-white/50 shadow-2xl flex items-center justify-center"
              >
                <Camera className="w-8 h-8 text-gray-800" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            onClick={handleOpenCamera}
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