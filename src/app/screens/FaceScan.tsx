import { useNavigate } from "react-router";
import {
  ArrowLeft, Camera, ImageIcon, Sparkles, History,
  RefreshCw, CheckCircle2, Crown, Lock, Star, Gift,
  CameraOff, ScanFace, X,
} from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { COLOR_TYPES } from "../data/colorTypes";
import { useColorAnalysis } from "../../hooks/useColorAnalysis";

/** Trạng thái luồng camera */
type CameraMode = "idle" | "requesting" | "denied" | "live" | "captured";

export function FaceScan() {
  const navigate = useNavigate();
  const { t, addScanHistory, scanHistory, user, setLastScanResultId } = useAppContext();
  const { analyze } = useColorAnalysis();

  const [cameraMode, setCameraMode] = useState<CameraMode>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanning, setScanning]           = useState(false);
  const [flashActive, setFlashActive]     = useState(false);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const capturedFileRef = useRef<File | null>(null);

  /* ── Lock logic ─────────────────────────────────────────────────── */
  const isLocked    = !user.isPremium && scanHistory.length >= 1;
  const isFirstFree = !user.isPremium && scanHistory.length === 0;

  /* ── Pick non-repeating color type ─────────────────────────────── */
  const pickColorType = () => {
    const usedIds = new Set(scanHistory.map(s => s.colorTypeId));
    const unused  = COLOR_TYPES.filter(ct => !usedIds.has(ct.id));
    const pool    = unused.length > 0 ? unused : COLOR_TYPES;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  /* ── Stop stream helper ─────────────────────────────────────────── */
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  /* ── Open Camera ─────────────────────────────────────────────────── */
  const openCamera = async () => {
    if (isLocked) { navigate("/premium"); return; }
    setCameraMode("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraMode("live");
      // Attach stream after state update renders the <video>
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraMode("denied");
      } else {
        setCameraMode("denied");
      }
    }
  };

  /* ── Capture photo from live video ─────────────────────────────── */
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 250);

    // Mirror horizontally (same as -scale-x-100 on video)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    setCameraMode("captured");

    // Save as File for API upload
    canvas.toBlob((blob) => {
      if (blob) capturedFileRef.current = new File([blob], "photo.jpg", { type: "image/jpeg" });
    }, "image/jpeg", 0.92);

    stopStream();
  };

  /* ── Retake ─────────────────────────────────────────────────────── */
  const handleRetake = () => {
    setCapturedImage(null);
    stopStream();
    openCamera();
  };

  /* ── File upload ─────────────────────────────────────────────────── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    capturedFileRef.current = file;
    stopStream();
    setCapturedImage(URL.createObjectURL(file));
    setCameraMode("captured");
  };

  /* ── Guard & analyze ────────────────────────────────────────────── */
  const guardedAnalyze = () => {
    if (isLocked) { navigate("/premium"); return; }
    startAnalyze();
  };

  const startAnalyze = async () => {
    if (!capturedFileRef.current) {
      alert("Vui lòng chụp ảnh hoặc tải ảnh lên trước");
      return;
    }
    setScanning(true);
    try {
      const res = await analyze(capturedFileRef.current, null);
      const apiSeason = (res.data?.season || "") as string;
      // Backend: "autumn-warm" → frontend id: "warm-autumn"
      const colorTypeId = apiSeason.split("-").reverse().join("-");
      const colorType = COLOR_TYPES.find((ct) => ct.id === colorTypeId) || COLOR_TYPES[0];
      addScanHistory({
        date:        new Date().toLocaleDateString("vi-VN"),
        colorType:   colorType.nameVi,
        colorTypeId: colorType.id,
        image:       capturedImage ?? colorType.sampleImage,
      });
      setLastScanResultId(colorType.id);
      navigate("/analysis-result");
    } catch (err: unknown) {
      setScanning(false);
      const errMsg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "";
      if (errMsg.toLowerCase().includes("limit") || errMsg.includes("SCAN_LIMIT")) {
        navigate("/premium");
      } else {
        alert(errMsg || "Phân tích thất bại. Vui lòng thử lại.");
      }
    }
  };

  /* ═══════════════════════════════════════════════════════════════ */
  /* SCANNING OVERLAY                                                */
  /* ═══════════════════════════════════════════════════════════════ */
  if (scanning) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 via-pink-500 to-blue-500 flex flex-col items-center justify-center px-6">
        {/* Captured image as background blur */}
        {capturedImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${capturedImage})`, filter: "blur(20px)" }}
          />
        )}
        <div className="relative z-10 flex flex-col items-center">
          {/* Animated face */}
          <div className="relative w-40 h-40 mb-8">
            {capturedImage ? (
              <img src={capturedImage} alt="face" className="w-40 h-40 rounded-full object-cover border-4 border-white/50 shadow-2xl" />
            ) : (
              <div className="w-40 h-40 rounded-full bg-white/20 flex items-center justify-center">
                <ScanFace className="w-20 h-20 text-white/70" />
              </div>
            )}
            {/* Spinning scan ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white/40 shadow-xl"
            />
            {/* Pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-white/50"
            />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{t("analyzing")}</h2>
          <p className="text-white/80 text-center text-sm mb-8 max-w-xs">{t("analyzingDesc")}</p>

          {/* Progress bar */}
          <div className="w-72 h-2 bg-white/20 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3.2, ease: "easeInOut" }}
              className="h-full bg-white rounded-full"
            />
          </div>

          {/* Step labels */}
          {[
            "Phát hiện khuôn mặt...",
            "Phân tích tông màu da...",
            "Xác định nhóm màu seasonal...",
          ].map((step, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 1.0, duration: 0.4 }}
              className="text-white/60 text-xs mt-1"
            >
              ✦ {step}
            </motion.p>
          ))}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════ */
  /* MAIN SCREEN                                                     */
  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-24 flex flex-col">
      {/* Hidden elements */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Header ── */}
      <div className="px-5 pb-3 flex-shrink-0" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { stopStream(); navigate("/home"); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-purple-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">{t("scanTitle")}</h1>
          </div>
          <button
            onClick={() => navigate("/scan-history")}
            data-track="Xem lịch sử quét"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Status banner ── */}
      <div className="px-6 mb-4 flex-shrink-0">
        {isLocked ? (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-md">
            <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Đã hết lượt miễn phí</p>
              <p className="text-white/80 text-xs">Nâng cấp Premium để quét không giới hạn</p>
            </div>
            <button onClick={() => navigate("/premium")}
              data-track="Mở khoá Premium"
              className="bg-white text-amber-600 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-amber-50 transition-colors flex-shrink-0">
              Mở khoá
            </button>
          </motion.div>
        ) : isFirstFree ? (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-md">
            <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">🎁 1 lượt quét miễn phí!</p>
              <p className="text-white/80 text-xs">Phân tích từ 12 nhóm tông màu seasonal</p>
            </div>
            <span className="bg-white/25 text-white text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">Free</span>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-md">
            <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Premium · Không giới hạn</p>
              <p className="text-white/80 text-xs">Mỗi lần quét cho kết quả khác nhau</p>
            </div>
            <Star className="w-5 h-5 text-white/70 flex-shrink-0" />
          </motion.div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* CAMERA VIEWPORT                                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="px-6 flex-1">
        <div className="relative w-full aspect-[3/4] bg-gray-950 rounded-3xl overflow-hidden shadow-2xl">

          {/* ── IDLE state ── */}
          <AnimatePresence>
            {cameraMode === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-gray-900 to-gray-950"
              >
                {/* Decorative face outline */}
                <div className="relative w-44 h-52">
                  <svg viewBox="0 0 160 200" className="w-full h-full opacity-20">
                    <ellipse cx="80" cy="100" rx="64" ry="88" stroke="white" strokeWidth="2" fill="none" strokeDasharray="8 5" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                      <Camera className="w-10 h-10 text-white/50" />
                    </div>
                  </div>
                </div>

                <div className="text-center px-6">
                  <p className="text-white/80 text-sm font-medium mb-1">Nhấn để mở camera</p>
                  <p className="text-white/40 text-xs">Ứng dụng sẽ xin quyền truy cập camera của bạn</p>
                </div>

                {isLocked ? (
                  <button
                    onClick={() => navigate("/premium")}
                    data-track="Mở khoá Premium"
                    className="flex items-center gap-2 bg-yellow-400 text-gray-900 font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:bg-yellow-300 transition-colors"
                  >
                    <Lock className="w-5 h-5" />
                    Mở khoá để chụp
                  </button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={openCamera}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white font-bold px-8 py-3.5 rounded-2xl shadow-xl"
                  >
                    <Camera className="w-5 h-5" />
                    Mở Camera
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* ── REQUESTING permission ── */}
            {cameraMode === "requesting" && (
              <motion.div
                key="requesting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-950"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full"
                />
                <p className="text-white/70 text-sm font-medium">Đang xin quyền camera...</p>
                <p className="text-white/40 text-xs text-center px-8">Vui lòng chọn "Cho phép" khi trình duyệt hỏi</p>
              </motion.div>
            )}

            {/* ── DENIED permission ── */}
            {cameraMode === "denied" && (
              <motion.div
                key="denied"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-950 px-6"
              >
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center">
                  <CameraOff className="w-8 h-8 text-red-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold mb-1">Không thể truy cập camera</p>
                  <p className="text-white/50 text-xs leading-relaxed">
                    Bạn đã từ chối quyền camera. Hãy vào Cài đặt trình duyệt để cấp lại quyền, hoặc sử dụng tính năng tải ảnh lên.
                  </p>
                </div>
                <button
                  onClick={() => setCameraMode("idle")}
                  className="flex items-center gap-2 bg-white/10 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" /> Quay lại
                </button>
              </motion.div>
            )}

            {/* ── LIVE camera ── */}
            {cameraMode === "live" && (
              <motion.div
                key="live"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {/* Live video (mirrored) */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                />

                {/* Dark vignette edges */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

                {/* Face alignment guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative" style={{ width: "70%", aspectRatio: "3/4" }}>
                    <svg
                      viewBox="0 0 180 240"
                      fill="none"
                      className="w-full h-full drop-shadow-lg"
                    >
                      {/* Outer glow ellipse */}
                      <ellipse cx="90" cy="115" rx="76" ry="102" stroke="white" strokeWidth="1" opacity="0.2" />
                      {/* Main face oval */}
                      <ellipse cx="90" cy="115" rx="70" ry="95" stroke="white" strokeWidth="2.5" strokeDasharray="14 6" opacity="0.9" strokeLinecap="round" />
                      {/* Corner brackets (top-left) */}
                      <path d="M20 40 L20 20 L40 20" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
                      {/* Corner brackets (top-right) */}
                      <path d="M160 40 L160 20 L140 20" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
                      {/* Corner brackets (bottom-left) */}
                      <path d="M20 200 L20 220 L40 220" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
                      {/* Corner brackets (bottom-right) */}
                      <path d="M160 200 L160 220 L140 220" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
                      {/* Eye dots */}
                      <circle cx="62" cy="98" r="5" fill="white" opacity="0.4" />
                      <circle cx="118" cy="98" r="5" fill="white" opacity="0.4" />
                      {/* Nose tip */}
                      <circle cx="90" cy="130" r="3" fill="white" opacity="0.3" />
                      {/* Mouth guide */}
                      <path d="M72 152 Q90 162 108 152" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.35" />
                    </svg>

                    {/* Animated scan line */}
                    <motion.div
                      animate={{ top: ["15%", "85%", "15%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                      style={{ boxShadow: "0 0 8px 2px rgba(167,139,250,0.6)" }}
                    />
                  </div>
                </div>

                {/* Top label */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                    <span className="text-white text-xs font-semibold">Camera đang hoạt động</span>
                  </div>
                </div>

                {/* Instruction label */}
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <p className="text-white/90 text-xs font-medium drop-shadow-md">{t("alignFace")}</p>
                </div>

                {/* Bottom controls */}
                <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-8">
                  {/* Cancel */}
                  <button
                    onClick={() => { stopStream(); setCameraMode("idle"); }}
                    className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>

                  {/* Shutter button */}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={capturePhoto}
                    data-track="Chụp ảnh"
                    className="relative w-18 h-18"
                    style={{ width: 72, height: 72 }}
                  >
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/80" />
                    {/* Inner button */}
                    <div className="absolute inset-2 rounded-full bg-white shadow-lg" />
                    {/* Camera icon center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-800" />
                    </div>
                  </motion.button>

                  {/* Upload alternate */}
                  <button
                    onClick={() => { stopStream(); setCameraMode("idle"); fileInputRef.current?.click(); }}
                    data-track="Tải ảnh từ thư viện"
                    className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Flash overlay */}
                <AnimatePresence>
                  {flashActive && (
                    <motion.div
                      key="flash"
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 bg-white pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── CAPTURED photo ── */}
            {cameraMode === "captured" && capturedImage && (
              <motion.div
                key="captured"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <img src={capturedImage} alt="Ảnh đã chụp" className="w-full h-full object-cover" />

                {/* Dark overlay top */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
                {/* Dark overlay bottom */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Ready badge */}
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="absolute top-5 left-1/2 -translate-x-1/2"
                >
                  <div className="bg-white/95 backdrop-blur-sm px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-bold text-gray-900">Ảnh đã sẵn sàng phân tích!</span>
                  </div>
                </motion.div>

                {/* Bottom controls */}
                <div className="absolute bottom-5 inset-x-0 flex items-center justify-between px-6">
                  <button
                    onClick={handleRetake}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Chụp lại
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={guardedAnalyze}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white font-bold px-5 py-2.5 rounded-xl shadow-xl"
                  >
                    <Sparkles className="w-4 h-4" />
                    Phân tích ngay
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── LOCKED overlay ── */}
            {isLocked && cameraMode !== "idle" && (
              <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-bold text-lg">Tính năng bị khoá</p>
                <p className="text-white/70 text-sm text-center px-8">Nâng cấp Premium để tiếp tục</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom actions (only in idle/captured) ── */}
      <div className="px-6 mt-4 mb-4 flex-shrink-0 space-y-3">
        {cameraMode === "idle" && (
          <>
            {/* Instructions */}
            <div className="space-y-2">
              {[t("scanInst1"), t("scanInst2"), t("scanInst3")].map((inst, i) => (
                <div key={i} className={`flex items-start gap-3 bg-white rounded-2xl p-3 shadow-sm border border-purple-100 ${isLocked ? "opacity-50" : ""}`}>
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700">{inst}</p>
                </div>
              ))}
            </div>

            {/* Upload fallback */}
            {!isLocked && (
              <button
                onClick={() => fileInputRef.current?.click()}
                data-track="Tải ảnh từ thư viện"
                className="w-full py-3.5 bg-white text-purple-600 rounded-2xl font-semibold border-2 border-purple-200 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <ImageIcon className="w-5 h-5" />
                Tải ảnh từ thư viện
              </button>
            )}

            {isLocked && (
              <button
                onClick={() => navigate("/premium")}
                data-track="Mở khoá Premium"
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Nâng cấp Premium để tiếp tục
              </button>
            )}
          </>
        )}

        {cameraMode === "captured" && (
          <p className="text-center text-gray-400 text-xs">
            Nhấn "Phân tích ngay" hoặc "Chụp lại" để thử lại
          </p>
        )}
      </div>

      <BottomNav active="scan" />
    </div>
  );
}
