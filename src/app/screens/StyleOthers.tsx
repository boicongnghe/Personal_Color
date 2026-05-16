import { useNavigate } from "react-router";
import { ArrowLeft, Camera, Upload, Users, Crown, Lock, Zap, Check } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { COLOR_TYPES } from "../data/colorTypes";

/* ══════════════════════ PAYWALL ══════════════════════════════ */
function StyleOthersPaywall({ onUpgrade, onBack }: { onUpgrade: () => void; onBack: () => void }) {
  const PERKS = [
    "Phân tích tông màu da của bất kỳ ai ngay lập tức",
    "Gợi ý trang phục cá nhân hóa cho họ",
    "Chia sẻ kết quả trực tiếp với bạn bè",
    "Hoàn hảo cho việc mua quà và tư vấn phong cách",
    "Lưu lịch sử phân tích người khác",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-4 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-xl font-bold text-gray-900">Phân tích cho người khác</h1>
            <Crown className="w-5 h-5 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 rounded-3xl flex items-center justify-center shadow-2xl mb-6 mt-4"
        >
          <Lock className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 mb-2 text-center"
        >
          Tính năng Premium
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-gray-500 text-sm text-center mb-6 max-w-xs"
        >
          Tính năng "Phân tích cho người khác" chỉ dành cho thành viên Premium. Nâng cấp để chia sẻ màu sắc với bạn bè và gia đình!
        </motion.p>

        {/* Preview card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="w-full relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-5 text-white shadow-xl mb-5 overflow-hidden"
        >
          <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold">Cool Summer</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: "91%" }} />
                  </div>
                  <span className="text-xs text-white/80">91%</span>
                </div>
              </div>
            </div>
            <p className="text-white/80 text-xs">Chiếc váy xanh nhạt rất phù hợp với họ!</p>
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-3xl">
            <div className="bg-white/90 rounded-2xl px-4 py-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-purple-700">Cần Premium</span>
            </div>
          </div>
        </motion.div>

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="w-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 mb-5 border border-purple-100"
        >
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

      {/* Footer CTA */}
      <div className="flex-shrink-0 px-5 pb-10 pt-3 bg-white border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onUpgrade}
          className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 mb-3"
        >
          <Zap className="w-5 h-5" />
          Nâng cấp Premium ngay
        </motion.button>
        <button onClick={onBack} className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors">
          Để sau
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════ MAIN COMPONENT ═══════════════════════ */
export function StyleOthers() {
  const navigate = useNavigate();
  const { t, user } = useAppContext();
  const [analyzing, setAnalyzing]   = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult]         = useState<null | {
    colorType: string; confidence: number;
    bestColors: { name: string; hex: string }[];
    outfitSuggestion: string;
  }>(null);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  /* ── Paywall gate ── */
  if (!user.isPremium) {
    return <StyleOthersPaywall onUpgrade={() => navigate("/premium")} onBack={() => navigate(-1)} />;
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(URL.createObjectURL(file));
    e.target.value = "";
    startAnalyze();
  };

  const startAnalyze = () => {
    setAnalyzing(true);
    // Pick a random color type from our data
    const pick = COLOR_TYPES[Math.floor(Math.random() * COLOR_TYPES.length)];
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        colorType: pick.nameVi + " · " + pick.nameEn,
        confidence: 87 + Math.floor(Math.random() * 10),
        bestColors: pick.bestColors.slice(0, 4).map(c => ({ name: c.name, hex: c.hex })),
        outfitSuggestion: `Người này thuộc nhóm "${pick.nameVi}" — ${pick.description}. Hãy thử các tông màu ${pick.bestColors.slice(0, 2).map(c => c.name).join(" và ")} để tôn lên nét đẹp tự nhiên của họ!`,
      });
    }, 2500);
  };

  /* ── Analyzing state ── */
  if (analyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 via-pink-500 to-blue-500 flex flex-col items-center justify-center px-6">
        {selectedImage && (
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${selectedImage})`, filter: "blur(20px)" }} />
        )}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-36 h-36 mb-8">
            {selectedImage ? (
              <img src={selectedImage} alt="person" className="w-36 h-36 rounded-full object-cover border-4 border-white/50 shadow-2xl" />
            ) : (
              <div className="w-36 h-36 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="w-16 h-16 text-white/60" />
              </div>
            )}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white/40" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t("analyzingPerson")}</h2>
          <p className="text-white/80 text-sm text-center mb-8 max-w-xs">{t("detectingSkinTone")}</p>
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.5 }}
              className="h-full bg-white rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Result state ── */
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-8">
        <div className="px-5 pt-12 pb-4">
          <button onClick={() => { setResult(null); setSelectedImage(null); }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors mb-5">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-6 h-6 text-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">{t("analysisComplete")}</h1>
          </div>
          <p className="text-gray-500 text-sm mb-6">Kết quả phân tích tông màu da</p>

          {/* Preview image */}
          {selectedImage && (
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto mb-5">
              <img src={selectedImage} alt="person" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Color type card */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl mb-5">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-1">{t("theirColorType")}</p>
            <h2 className="text-xl font-bold mb-3">{result.colorType}</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }} transition={{ duration: 0.8 }}
                  className="h-full bg-white rounded-full" />
              </div>
              <span className="text-sm font-bold">{result.confidence}%</span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">{result.outfitSuggestion}</p>
          </div>

          {/* Best colors */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">{t("recommendedColors")}</h3>
            <div className="grid grid-cols-4 gap-2.5">
              {result.bestColors.map((color) => (
                <div key={color.name} className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-2xl shadow-md border-2 border-white"
                    style={{ backgroundColor: color.hex }} />
                  <p className="text-xs text-gray-600 text-center font-medium leading-tight">{color.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              {t("shareResults")}
            </button>
            <button onClick={() => { setResult(null); setSelectedImage(null); }}
              className="w-full py-4 bg-white text-purple-600 rounded-2xl font-bold border-2 border-purple-200 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              {t("analyzeAnother")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Default/idle state ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-8">
      {/* Hidden file inputs */}
      <input ref={fileInputRef}   type="file" accept="image/*"              className="hidden" onChange={handleFile} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFile} />

      <div className="px-5 pt-12 pb-6">
        {/* Header */}
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors mb-5">
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>

        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold text-gray-900">{t("styleOthers")}</h1>
          <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center gap-1 shadow-sm">
            <Crown className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-bold text-white">Premium</span>
          </div>
        </div>
        <p className="text-gray-500 mb-6">{t("styleOthersDesc")}</p>

        {/* Hero */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-5 mb-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">{t("shareLove")}</h3>
            <p className="text-sm text-gray-600">{t("helpFriends")}</p>
          </div>
        </div>

        {/* Camera area */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl overflow-hidden mb-6 shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
              {/* Face guide */}
              <div className="relative w-52 h-64">
                <svg viewBox="0 0 160 200" fill="none" className="w-full h-full opacity-30">
                  <ellipse cx="80" cy="100" rx="64" ry="88" stroke="white" strokeWidth="2" strokeDasharray="8 5" />
                  <path d="M20 40 L20 20 L40 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M140 40 L140 20 L120 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M20 160 L20 180 L40 180" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M140 160 L140 180 L120 180" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                </svg>
              </div>
              <p className="text-white/60 text-sm text-center px-6">{t("positionFace")}</p>
            </div>
          </div>

          {/* Camera icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-14 h-14 text-white/20" />
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-5">
            <motion.button whileTap={{ scale: 0.92 }}
              onClick={() => cameraInputRef.current?.click()}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white/50">
              <Camera className="w-7 h-7 text-gray-800" />
            </motion.button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button onClick={() => cameraInputRef.current?.click()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />
            {t("takePhoto")}
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-white text-purple-600 rounded-2xl font-bold border-2 border-purple-200 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
            <Upload className="w-5 h-5" />
            {t("uploadPhoto")}
          </button>
        </div>
      </div>
    </div>
  );
}
