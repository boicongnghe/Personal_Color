import { useNavigate } from "react-router";
import {
  ArrowLeft, Camera, Upload, Sparkles, Crown, Lock, Zap,
  RefreshCw, ImageIcon, X, SwitchCamera,
} from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import useTryOnReplicate from "../../hooks/useTryOnReplicate";

/* ══════════════════════ PAYWALL ══════════════════════════════ */
function TryOnPaywall({ onUpgrade, onBack }: { onUpgrade: () => void; onBack: () => void }) {
  const PERKS = [
    "Thử quần áo lên ảnh của bạn bằng AI",
    "Chụp ảnh hoặc upload từ thư viện",
    "Kết quả thực tế trong ~30 giây",
    "Không cần phòng thay đồ, thử mọi lúc mọi nơi",
    "Tương thích với mọi loại trang phục",
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col">
      <div className="flex-shrink-0 px-5 pb-4 bg-white/80 backdrop-blur-md border-b border-purple-100" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-xl font-bold text-gray-900">Thử đồ AI</h1>
            <Crown className="w-5 h-5 text-yellow-500" />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 rounded-3xl flex items-center justify-center shadow-2xl mb-6 mt-4">
          <Lock className="w-12 h-12 text-white" />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 mb-2 text-center">Tính năng Premium</motion.h2>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-gray-500 text-sm text-center mb-6 max-w-xs">
          Tính năng "Thử đồ AI" chỉ dành cho thành viên Premium. Nâng cấp để thử quần áo ảo ngay lập tức!
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="w-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 mb-5 border border-purple-100">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-3">Tính năng Premium bao gồm:</p>
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
        </motion.div>
      </div>
      <div className="flex-shrink-0 px-5 pb-10 pt-3 bg-white border-t border-gray-100">
        <motion.button whileTap={{ scale: 0.97 }} onClick={onUpgrade}
          className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 mb-3">
          <Zap className="w-5 h-5" /> Nâng cấp Premium ngay
        </motion.button>
        <button onClick={onBack} className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors">Để sau</button>
      </div>
    </div>
  );
}

/* ══════════════════════ CAMERA MODAL ═════════════════════════ */
interface CameraModalProps {
  title: string;
  facingMode?: "user" | "environment";
  onCapture: (file: File) => void;
  onClose: () => void;
}

function CameraModal({ title, facingMode = "environment", onCapture, onClose }: CameraModalProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode,    setMode]    = useState<"starting" | "live" | "captured" | "denied">("starting");
  const [preview, setPreview] = useState<string | null>(null);
  const [facing,  setFacing]  = useState<"user" | "environment">(facingMode);
  const [flash,   setFlash]   = useState(false);

  // Start camera on mount
  const startCamera = useCallback(async (face: "user" | "environment") => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setMode("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: face, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setMode("live");
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch {
      setMode("denied");
    }
  }, []);

  // Auto-start on mount
  useState(() => { startCamera(facing); });

  const stopStream = () => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width  = v.videoWidth  || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    if (facing === "user") {
      ctx.save(); ctx.translate(c.width, 0); ctx.scale(-1, 1);
      ctx.drawImage(v, 0, 0, c.width, c.height);
      ctx.restore();
    } else {
      ctx.drawImage(v, 0, 0, c.width, c.height);
    }
    setPreview(c.toDataURL("image/jpeg", 0.92));
    setMode("captured");
    stopStream();
  };

  const handleRetake = () => {
    setPreview(null);
    startCamera(facing);
  };

  const handleUse = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(blob => {
      if (blob) {
        stopStream();
        onCapture(new File([blob], "camera.jpg", { type: "image/jpeg" }));
      }
    }, "image/jpeg", 0.92);
  };

  const handleFlip = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    startCamera(next);
  };

  const handleClose = () => { stopStream(); onClose(); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pb-3" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <button onClick={handleClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
          <X className="w-5 h-5 text-white" />
        </button>
        <p className="text-white font-bold text-sm">{title}</p>
        <button onClick={handleFlip} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
          <SwitchCamera className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative overflow-hidden">
        {/* Starting spinner */}
        {mode === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full" />
          </div>
        )}

        {/* Denied */}
        {mode === "denied" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8">
            <Camera className="w-16 h-16 text-white/30" />
            <p className="text-white font-bold text-center">Không thể truy cập camera</p>
            <p className="text-white/50 text-sm text-center">Kiểm tra quyền camera trong cài đặt trình duyệt</p>
          </div>
        )}

        {/* Live video */}
        {(mode === "live" || mode === "starting") && (
          <video ref={videoRef} autoPlay playsInline muted
            className={`absolute inset-0 w-full h-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`} />
        )}

        {/* Captured preview */}
        {mode === "captured" && preview && (
          <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Flash */}
        <AnimatePresence>
          {flash && (
            <motion.div key="flash" initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-white pointer-events-none" />
          )}
        </AnimatePresence>

        {/* Grid guide overlay (live only) */}
        {mode === "live" && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)", backgroundSize: "33% 33%" }} />
        )}
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 pb-10 pt-4 px-8">
        {mode === "captured" ? (
          <div className="flex items-center justify-center gap-6">
            <button onClick={handleRetake}
              className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center border border-white/20">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <span className="text-white/70 text-xs">Chụp lại</span>
            </button>
            <motion.button whileTap={{ scale: 0.94 }} onClick={handleUse}
              className="flex flex-col items-center gap-1.5">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <span className="text-white font-bold text-sm">Dùng ảnh này</span>
            </motion.button>
            <div className="w-14 h-14" /> {/* spacer */}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <motion.button whileTap={{ scale: 0.88 }} onClick={handleCapture}
              disabled={mode !== "live"}
              style={{ width: 76, height: 76 }} className="relative">
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

/* ══════════════════════ UPLOAD ZONE ══════════════════════════ */
interface UploadZoneProps {
  label: string;
  sublabel: string;
  preview: string | null;
  accent?: string;
  onGallery: () => void;
  onCamera: () => void;
}

function UploadZone({ label, sublabel, preview, accent = "from-purple-500 to-pink-500", onGallery, onCamera }: UploadZoneProps) {
  return (
    <div className="relative w-full h-72 bg-gray-950 rounded-3xl overflow-hidden shadow-xl border-2 border-white/5">
      {preview ? (
        <>
          <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          {/* Label top-left */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs font-bold">{label}</span>
          </div>
          {/* Overlay buttons */}
          <div className="absolute bottom-3 inset-x-3 flex gap-2.5">
            <button onClick={onCamera}
              className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl py-2.5 flex items-center justify-center gap-1.5">
              <Camera className="w-4 h-4 text-purple-700" />
              <span className="text-sm font-bold text-purple-700">Chụp lại</span>
            </button>
            <button onClick={onGallery}
              className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl py-2.5 flex items-center justify-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-700" />
              <span className="text-sm font-bold text-purple-700">Thay ảnh</span>
            </button>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5">
          {/* Icon */}
          <div className={`w-16 h-16 bg-gradient-to-br ${accent} rounded-3xl flex items-center justify-center shadow-xl`}>
            <Camera className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-base leading-tight">{label}</p>
            <p className="text-white/50 text-sm mt-1 leading-snug">{sublabel}</p>
          </div>
          {/* Two action buttons */}
          <div className="flex gap-3 w-full">
            <motion.button whileTap={{ scale: 0.95 }} onClick={onCamera}
              className={`flex-1 py-3 bg-gradient-to-r ${accent} rounded-2xl flex items-center justify-center gap-2 shadow-lg`}>
              <Camera className="w-4.5 h-4.5 text-white" />
              <span className="text-white text-sm font-bold">Chụp ảnh</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onGallery}
              className="flex-1 py-3 border border-white/30 rounded-2xl flex items-center justify-center gap-2">
              <ImageIcon className="w-4.5 h-4.5 text-white/70" />
              <span className="text-white/70 text-sm font-bold">Thư viện</span>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════ MAIN COMPONENT ═══════════════════════ */
export function StyleOthers() {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const {
    loading, result, error, progress,
    personFile, clothingFile,
    personPreview, clothingPreview,
    selectPerson, selectClothing,
    runTryOn, reset,
  } = useTryOnReplicate();

  // Gallery file inputs
  const personInputRef   = useRef<HTMLInputElement>(null);
  const clothingInputRef = useRef<HTMLInputElement>(null);

  // Camera modal state: null = closed, "person" | "clothing" = open for that zone
  const [cameraTarget, setCameraTarget] = useState<"person" | "clothing" | null>(null);

  const handleCameraCapture = (file: File) => {
    if (cameraTarget === "person")   selectPerson(file);
    if (cameraTarget === "clothing") selectClothing(file);
    setCameraTarget(null);
  };

  if (!user.isPremium) {
    return <TryOnPaywall onUpgrade={() => navigate("/premium")} onBack={() => navigate(-1)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-8">
      {/* Hidden gallery inputs */}
      <input ref={personInputRef}   type="file" accept="image/*" className="hidden"
        onChange={e => { if (e.target.files?.[0]) selectPerson(e.target.files[0]);   e.target.value = ""; }} />
      <input ref={clothingInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { if (e.target.files?.[0]) selectClothing(e.target.files[0]); e.target.value = ""; }} />

      {/* Camera modal */}
      <AnimatePresence>
        {cameraTarget && (
          <CameraModal
            key={cameraTarget}
            title={cameraTarget === "person" ? "Chụp ảnh người" : "Chụp ảnh trang phục"}
            facingMode={cameraTarget === "person" ? "user" : "environment"}
            onCapture={handleCameraCapture}
            onClose={() => setCameraTarget(null)}
          />
        )}
      </AnimatePresence>

      <div className="px-5 pb-5" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-bold text-gray-900">Thử đồ AI</h1>
              <div className="px-2.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full">
                <span className="text-[10px] font-bold text-white">IDM-VTON</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">Chụp ảnh hoặc upload, AI thử đồ ngay</p>
          </div>
        </div>

        {/* Result view */}
        {result ? (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-purple-100">
              <img src={result} alt="Kết quả thử đồ" className="w-full object-cover" />
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-green-800 text-sm">Thử đồ thành công!</p>
                <p className="text-green-600 text-xs">AI đã ghép trang phục lên ảnh của bạn</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={reset}
                className="py-3.5 bg-white text-purple-600 rounded-2xl font-bold border-2 border-purple-200 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Thử lại
              </button>
              <a href={result} download="try-on-result.jpg"
                className="py-3.5 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">
                <Upload className="w-4 h-4" /> Lưu ảnh
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Upload / camera zones — stacked vertically */}
            <div className="flex flex-col gap-4 mb-4">
              <UploadZone
                label="Ảnh người"
                sublabel="Đứng thẳng, toàn thân, nền sáng"
                preview={personPreview}
                accent="from-purple-500 to-indigo-500"
                onCamera={() => setCameraTarget("person")}
                onGallery={() => personInputRef.current?.click()}
              />
              <UploadZone
                label="Ảnh trang phục"
                sublabel="Flat lay hoặc ảnh trên người mẫu"
                preview={clothingPreview}
                accent="from-pink-500 to-rose-500"
                onCamera={() => setCameraTarget("clothing")}
                onGallery={() => clothingInputRef.current?.click()}
              />
            </div>

            {/* Tips */}
            {!loading && (
              <div className="bg-white/70 rounded-2xl p-3.5 mb-4 border border-purple-100 space-y-1.5">
                {[
                  "📸 Ảnh người: đứng thẳng, toàn thân, nền sáng",
                  "👕 Ảnh quần áo: flat lay hoặc ảnh trên người mẫu",
                  "⏱ AI cần ~30-60 giây để xử lý",
                ].map((tip, i) => (
                  <p key={i} className="text-xs text-gray-600">{tip}</p>
                ))}
              </div>
            )}

            {/* Progress */}
            {loading && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-4 border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-t-transparent rounded-full flex-shrink-0"
                    style={{ borderWidth: 3, borderStyle: "solid", borderColor: "rgb(168 85 247)" }} />
                  <div>
                    <p className="font-bold text-purple-800 text-sm">Đang xử lý...</p>
                    <p className="text-purple-600 text-xs">{progress}</p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-purple-200 rounded-full overflow-hidden">
                  <motion.div animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full w-1/2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 rounded-2xl p-3.5 mb-4 border border-red-100">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* CTA */}
            <motion.button whileTap={{ scale: 0.97 }} onClick={runTryOn}
              disabled={!personFile || !clothingFile || loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {!personFile || !clothingFile ? "Chọn 2 ảnh để bắt đầu" : "Thử đồ ngay"}
                </>
              )}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
