import { useNavigate, useSearchParams } from "react-router";
import { useState, useRef, useEffect } from "react";
import {
  Crown, Palette, Settings, LogOut, ChevronRight,
  Edit2, Camera, User as UserIcon, Ruler, Weight,
  Sparkles, Check, X, Wallet, CalendarDays, Dumbbell,
  ScanFace, Bot, Users, HelpCircle,
} from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import MannequinSVG from "../components/MannequinSVG";

/* ── Body shape data ──────────────────────────────────────────── */
const FEMALE_BODY_SHAPES = [
  { id: "Hourglass",          labelVi: "Đồng hồ cát",     labelEn: "Hourglass",           emoji: "⏳", desc: "Vai & hông cân đối, eo thon" },
  { id: "Pear",               labelVi: "Quả lê",           labelEn: "Pear",                emoji: "🍐", desc: "Hông rộng hơn vai" },
  { id: "Apple",              labelVi: "Quả táo",          labelEn: "Apple",               emoji: "🍎", desc: "Vòng bụng đầy đặn" },
  { id: "Rectangle",          labelVi: "Chữ nhật",         labelEn: "Rectangle",           emoji: "▬",  desc: "Vai, eo, hông gần bằng nhau" },
  { id: "Inverted Triangle",  labelVi: "Tam giác ngược",   labelEn: "Inverted Triangle",   emoji: "🔻", desc: "Vai rộng hơn hông" },
];

const MALE_BODY_SHAPES = [
  { id: "Hourglass",          labelVi: "Hình thang ngược", labelEn: "Inverted Trapezoid",  emoji: "⏳", desc: "Vai rộng, hông cân đối" },
  { id: "Pear",               labelVi: "Quả lê",           labelEn: "Pear",                emoji: "🍐", desc: "Hông rộng hơn vai" },
  { id: "Apple",              labelVi: "Quả táo",          labelEn: "Apple",               emoji: "🍎", desc: "Vòng bụng đầy đặn" },
  { id: "Rectangle",          labelVi: "Chữ nhật",         labelEn: "Rectangle",           emoji: "▬",  desc: "Vai, eo, hông gần bằng nhau" },
  { id: "Inverted Triangle",  labelVi: "Tam giác ngược",   labelEn: "Inverted Triangle",   emoji: "🔻", desc: "Vai rộng hơn hông" },
];

const BODY_SHAPES = FEMALE_BODY_SHAPES;

const BODY_TYPE_IMAGES: Record<string, Record<string, string>> = {
  female: {
    "Hourglass":          "/body-types/donghocat.png",
    "Pear":               "/body-types/quale.png",
    "Apple":              "/body-types/quatao.png",
    "Rectangle":          "/body-types/hinhchunhat.png",
    "Inverted Triangle":  "/body-types/tamgianguoc.png",
  },
  male: {
    "Hourglass":          "/body-types/hinhthangnguocnam.png",
    "Pear":               "/body-types/qualenam.png",
    "Apple":              "/body-types/quataonam.png",
    "Rectangle":          "/body-types/hinhchunhatnam.png",
    "Inverted Triangle":  "/body-types/tamgiacnguocnam.png",
  },
};

const BUDGETS = [
  { value: "500,000",    label: "< 500k" },
  { value: "1,000,000",  label: "1 triệu" },
  { value: "2,000,000",  label: "2 triệu" },
  { value: "5,000,000+", label: "5 triệu+" },
];

function calcBMI(h: string, w: string) {
  const hm = parseFloat(h) / 100;
  const wk = parseFloat(w);
  if (!hm || !wk) return null;
  const bmi = wk / (hm * hm);
  let label = bmi < 18.5 ? "Gầy" : bmi < 23 ? "Bình thường" : bmi < 27.5 ? "Thừa cân" : "Béo phì";
  return { value: bmi.toFixed(1), label };
}

export function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser, language, setLanguage, t, wardrobeList, favoriteOutfitIds, saveBodyProfile, uploadAvatar, logout } = useAppContext();
  const isVi = language === "vi";

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showBodyPanel,   setShowBodyPanel]   = useState(false);
  const [editName,  setEditName]  = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bodyForm, setBodyForm] = useState({
    gender:    (user.bodyProfile?.gender ?? "female") as "female" | "male",
    height:    user.bodyProfile?.height?.toString()  ?? "",
    weight:    user.bodyProfile?.weight?.toString()  ?? "",
    bust:      user.bodyProfile?.bust?.toString()    ?? "",
    waist:     user.bodyProfile?.waist?.toString()   ?? "",
    hips:      user.bodyProfile?.hips?.toString()    ?? "",
    age:       user.bodyProfile?.age?.toString()     ?? "",
    bodyShape: user.bodyProfile?.bodyShape           ?? "Hourglass",
    budget:    user.bodyProfile?.budget              ?? "1,000,000",
  });

  const [bodyResult, setBodyResult] = useState<{
    bodyType: string; label: string; emoji: string; description: string; characteristics: string[]; tips: string;
  } | null>(user.bodyProfile?.bodyType ? {
    bodyType: user.bodyProfile.bodyType,
    label: user.bodyProfile.bodyType,
    emoji: '',
    description: '',
    characteristics: [],
    tips: '',
  } : null);
  const [bodyLoading, setBodyLoading] = useState(false);

  const bmi      = calcBMI(bodyForm.height, bodyForm.weight);
  const savedBMI = calcBMI(user.bodyProfile?.height?.toString() ?? "", user.bodyProfile?.weight?.toString() ?? "");
  const currentBodyShapes = (user.bodyProfile?.gender ?? "female") === "male" ? MALE_BODY_SHAPES : FEMALE_BODY_SHAPES;
  const currentShape = currentBodyShapes.find(b => b.id === user.bodyProfile?.bodyShape);

  const hasBodyData = !!(user.bodyProfile?.bodyType || user.bodyProfile?.height || user.bodyProfile?.bodyShape);

  const handleSaveProfile = () => { updateUser({ name: editName, email: editEmail }); setShowProfileEdit(false); };
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately — don't wait for server round-trip
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) updateUser({ avatar: ev.target.result as string });
    };
    reader.readAsDataURL(file);

    setAvatarUploading(true);
    await uploadAvatar(file); // updates user.avatar to server URL once done
    setAvatarUploading(false);
  };

  const [bodyFormError, setBodyFormError] = useState<string | null>(null);

  const handleSaveBody = async () => {
    const { gender, height, weight, bust, waist, hips, age, bodyShape, budget } = bodyForm;

    // Validate — bust/waist/hips are optional
    const missing: string[] = [];
    if (!height)    missing.push("Chiều cao");
    if (!weight)    missing.push("Cân nặng");
    if (!age)       missing.push("Tuổi");
    if (!bodyShape) missing.push("Vóc dáng");
    if (!budget)    missing.push("Ngân sách");

    if (missing.length > 0) {
      setBodyFormError(`Vui lòng điền đủ: ${missing.join(", ")}`);
      return;
    }
    setBodyFormError(null);
    setBodyLoading(true);

    const payload: Parameters<typeof saveBodyProfile>[0] = {
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      age,
      bodyShape,
      budget,
      ...(bust  && { bust:  parseFloat(bust)  }),
      ...(waist && { waist: parseFloat(waist) }),
      ...(hips  && { hips:  parseFloat(hips)  }),
    };

    const result = await saveBodyProfile(payload);
    setBodyLoading(false);

    if (result.success && result.bodyType) {
      setBodyResult({
        bodyType:        result.bodyType,
        label:           result.label        ?? result.bodyType,
        emoji:           result.emoji        ?? '',
        description:     result.description  ?? '',
        characteristics: result.characteristics ?? [],
        tips:            result.tips         ?? '',
      });
      return; // stay in panel to show result card, then user clicks "Xong"
    }
    // Saved without body-type classification — close and optionally return
    setShowBodyPanel(false);
    const returnTo = searchParams.get('returnTo');
    if (returnTo) navigate(returnTo);
  };

  const handleBodyPanelDone = () => {
    setShowBodyPanel(false);
    const returnTo = searchParams.get('returnTo');
    if (returnTo) navigate(returnTo);
  };

  const openBodyPanel = () => {
    setBodyForm({
      gender:    user.bodyProfile?.gender              ?? "female",
      height:    user.bodyProfile?.height?.toString()  ?? "",
      weight:    user.bodyProfile?.weight?.toString()  ?? "",
      bust:      user.bodyProfile?.bust?.toString()    ?? "",
      waist:     user.bodyProfile?.waist?.toString()   ?? "",
      hips:      user.bodyProfile?.hips?.toString()    ?? "",
      age:       user.bodyProfile?.age?.toString()     ?? "",
      bodyShape: user.bodyProfile?.bodyShape           ?? "Hourglass",
      budget:    user.bodyProfile?.budget              ?? "1,000,000",
    });
    setBodyResult(user.bodyProfile?.bodyType ? {
      bodyType: user.bodyProfile.bodyType, label: user.bodyProfile.bodyType,
      emoji: '', description: '', characteristics: [], tips: '',
    } : null);
    setShowBodyPanel(true);
  };

  // Auto-open body panel when navigated here with ?openBodyPanel=1
  useEffect(() => {
    if (searchParams.get('openBodyPanel') === '1') {
      openBodyPanel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Menu item type supports both path + action ── */
  type MenuItem = {
    icon: React.ElementType;
    label: string;
    description?: string;
    path?: string;
    action?: () => void;
    highlight?: boolean;
    badge?: string;
    isPremiumLocked?: boolean;
  };

  const topMenu: MenuItem[] = [
    {
      icon: Crown,
      label: t("upgradePremium"),
      description: t("unlockFeatures"),
      path: "/premium",
      highlight: true,
    },
  ];

  const featureMenu: MenuItem[] = [
    {
      icon: Sparkles,
      label: "Cá nhân hóa AI",
      description: hasBodyData
        ? user.bodyProfile?.bodyType
          ? `${user.bodyProfile.height} cm · ${user.bodyProfile.weight} kg · ${user.bodyProfile.bodyType}`
          : `${user.bodyProfile?.height ?? "—"} cm · ${user.bodyProfile?.weight ?? "—"} kg · ${currentShape ? (isVi ? currentShape.labelVi : currentShape.labelEn) : "—"}`
        : "Thêm thông tin cơ thể để gợi ý chuẩn hơn",
      action: openBodyPanel,
      badge: hasBodyData ? "✓ Đã cập nhật" : "+ Thêm",
    },
    { icon: Palette,  label: t("myColorAnalysis"),    path: "/analysis-result" },
    { icon: ScanFace, label: t("scanHistory"),         path: "/scan-history" },
    { icon: Bot,      label: t("smartAdvisor"),        path: "/smart-advisor",  isPremiumLocked: !user.isPremium },
    { icon: Users,    label: t("styleOthers"),         path: "/style-others",   isPremiumLocked: !user.isPremium },
  ];

  const settingsMenu: MenuItem[] = [
    { icon: Settings,    label: t("settings"),                  path: "/settings" },
    { icon: HelpCircle,  label: "Trung tâm hỗ trợ", description: "Gửi tin nhắn — đội ngũ phản hồi 24h", path: "/support" },
  ];

  const renderMenu = (items: MenuItem[]) =>
    items.map((item, i) => (
      <button
        key={i}
        onClick={() => {
          if (item.isPremiumLocked) { navigate("/premium"); return; }
          if (item.action) { item.action(); return; }
          if (item.path) navigate(item.path);
        }}
        className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98] ${
          item.highlight
            ? "bg-gray-900 text-white shadow-md hover:bg-black"
            : "bg-white hover:bg-gray-50 border border-gray-100 shadow-sm"
        }`}
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.highlight ? "bg-white/10" : item.isPremiumLocked ? "bg-yellow-50" : "bg-gray-50"}`}>
          {item.isPremiumLocked
            ? <Crown className="w-5 h-5 text-yellow-500" />
            : <item.icon className={`w-5 h-5 ${item.highlight ? "text-yellow-400" : "text-gray-700"}`} />
          }
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className={`font-bold truncate ${item.highlight ? "text-white" : item.isPremiumLocked ? "text-gray-400" : "text-gray-900"}`}>
            {item.label}
          </h3>
          {item.description && (
            <p className={`text-xs mt-0.5 truncate ${item.highlight ? "text-gray-300" : "text-gray-500"}`}>
              {item.isPremiumLocked ? "Chỉ dành cho thành viên Premium" : item.description}
            </p>
          )}
        </div>
        {item.badge && !item.isPremiumLocked ? (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${hasBodyData ? "bg-green-100 text-green-700" : "bg-gradient-to-r from-purple-500 to-pink-400 text-white"}`}>
            {item.badge}
          </span>
        ) : item.isPremiumLocked ? (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 bg-yellow-100 text-yellow-700">
            Premium
          </span>
        ) : (
          <ChevronRight className={`w-5 h-5 flex-shrink-0 ${item.highlight ? "text-gray-400" : "text-gray-300"}`} />
        )}
      </button>
    ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-nav overflow-x-hidden">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

      <div className="px-4 pb-4" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">{t("profile")}</h1>
          <div className="bg-white rounded-full p-1 shadow-sm border border-gray-100 flex text-sm font-medium">
            {(["en", "vi"] as const).map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 rounded-full transition-colors ${language === lang ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ── User card ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-purple-100 via-pink-50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-4 border-white shadow-md">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <span>{user.name.charAt(0).toUpperCase() || "U"}</span>
                }
              </div>
              <button onClick={() => !avatarUploading && fileInputRef.current?.click()}
                data-track="Đổi ảnh đại diện"
                className="absolute bottom-0 right-0 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                {avatarUploading
                  ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera className="w-3.5 h-3.5" />}
              </button>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">{user.name || "Chưa đặt tên"}</h2>
              <p className="text-gray-500 text-sm truncate">{user.email || "Chưa có email"}</p>
              {user.isPremium ? (
                <div className="inline-flex items-center gap-1 mt-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{t("premium")}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 mt-1.5 px-3 py-1 bg-gray-100 rounded-full">
                  <span className="text-xs font-semibold text-gray-600">{t("freePlan")}</span>
                </div>
              )}
            </div>
            {/* Edit */}
            <button onClick={() => { setEditName(user.name); setEditEmail(user.email); setShowProfileEdit(true); }}
              data-track="Chỉnh sửa hồ sơ"
              className="absolute top-4 right-4 p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {/* Color type */}
          {user.colorType && (
            <div className="mt-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl px-4 py-2.5 border border-orange-100 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-red-400 shadow-sm flex-shrink-0" />
              <div>
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">{t("colorType")}</p>
                <p className="font-bold text-gray-900 text-sm">{user.colorType}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-black text-gray-900 mb-0.5">{favoriteOutfitIds.size}</p>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{t("savedOutfits")}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-black text-gray-900 mb-0.5">{wardrobeList.length}</p>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{t("wardrobeItems")}</p>
          </div>
        </div>

        {/* ── Top menu (Premium CTA) ── */}
        {!user.isPremium && (
          <div className="mb-3">
            {renderMenu(topMenu)}
          </div>
        )}

        {/* ── Feature menu ── */}
        <div className="mb-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">Tính năng</p>
          <div className="space-y-2">
            {renderMenu(featureMenu)}
          </div>
        </div>

        {/* ── Settings menu ── */}
        <div className="mb-8 mt-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">Cài đặt</p>
          <div className="space-y-2">
            {renderMenu(settingsMenu)}
          </div>
        </div>

        {/* Logout */}
        <button onClick={() => { logout(); navigate("/"); }}
          className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
          <LogOut className="w-5 h-5" />
          {t("logout")}
        </button>

        <p className="text-center text-gray-400 text-xs font-medium mt-8 mb-4">Clarity v1.0.0</p>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* EDIT PROFILE SHEET                           */}
      {/* ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showProfileEdit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowProfileEdit(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="relative w-full bg-white rounded-t-3xl px-6 pt-5 pb-10 shadow-2xl max-w-md mx-auto"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">{t("editProfile")}</h2>
                <button onClick={() => setShowProfileEdit(false)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                    {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-gray-400" />}
                  </div>
                  <button onClick={() => !avatarUploading && fileInputRef.current?.click()} data-track="Đổi ảnh đại diện" className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                    {avatarUploading
                      ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Camera className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Nhấn để đổi ảnh đại diện</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("name")}</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Nhập tên của bạn" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("email")}</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="email@example.com" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowProfileEdit(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors">{t("cancel")}</button>
                <button onClick={handleSaveProfile} className="flex-1 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors">{t("save")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════ */}
      {/* AI PERSONALIZATION SHEET                     */}
      {/* ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showBodyPanel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBodyPanel(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="relative w-full bg-white rounded-t-3xl shadow-2xl max-w-md mx-auto flex flex-col"
              style={{ maxHeight: "92vh" }}
            >
              {/* Header */}
              <div className="flex-shrink-0 pt-4 pb-3 px-6 border-b border-gray-100">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Cá nhân hóa AI</h2>
                      <p className="text-gray-500 text-xs">Giúp AI gợi ý trang phục chính xác hơn</p>
                    </div>
                  </div>
                  <button onClick={() => setShowBodyPanel(false)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

                {/* Body type result — shown after successful classification */}
                <AnimatePresence>
                  {bodyResult && bodyResult.bodyType && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {BODY_TYPE_IMAGES[bodyForm.gender]?.[bodyResult.bodyType] ? (
                          <img
                            src={BODY_TYPE_IMAGES[bodyForm.gender][bodyResult.bodyType]}
                            alt={bodyResult.label}
                            className="w-16 h-20 object-contain flex-shrink-0"
                          />
                        ) : (
                          <MannequinSVG
                            gender={bodyForm.gender}
                            bodyType={bodyResult.bodyType}
                            season={undefined}
                            size={80}
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-0.5">Vóc dáng của bạn</p>
                          <p className="text-lg font-black text-gray-900">{bodyResult.emoji} {bodyResult.label || bodyResult.bodyType}</p>
                          {bodyResult.tips && (
                            <p className="text-xs text-gray-500 mt-1">{bodyResult.tips}</p>
                          )}
                        </div>
                      </div>
                      {bodyResult.characteristics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {bodyResult.characteristics.map((c, i) => (
                            <span key={i} className="text-[10px] font-semibold bg-white text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full">{c}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Gender toggle */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Giới tính</p>
                  <div className="flex gap-2">
                    {([['female', '👩 Nữ'], ['male', '👨 Nam']] as const).map(([val, lbl]) => (
                      <button
                        key={val}
                        onClick={() => setBodyForm(f => ({ ...f, gender: val }))}
                        className={`flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                          bodyForm.gender === val
                            ? "border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-sm"
                            : "border-gray-100 bg-white text-gray-700 hover:border-gray-200"
                        }`}
                      >
                        {bodyForm.gender === val && <Check className="w-3.5 h-3.5 inline mr-1 text-purple-600" />}
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Số đo cơ bản */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Số đo cơ thể</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "height", icon: <Ruler className="w-3.5 h-3.5 text-blue-500" />, label: "Cao (cm)", placeholder: "165" },
                      { key: "weight", icon: <Weight className="w-3.5 h-3.5 text-pink-500" />, label: "Nặng (kg)", placeholder: "55" },
                      { key: "age",    icon: <CalendarDays className="w-3.5 h-3.5 text-amber-500" />, label: "Tuổi", placeholder: "22" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1.5">
                          {f.icon} {f.label}
                        </label>
                        <input
                          type="number"
                          value={(bodyForm as Record<string, string>)[f.key]}
                          onChange={e => setBodyForm({ ...bodyForm, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full px-2 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Live BMI */}
                  <AnimatePresence>
                    {bmi && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-black text-green-700">BMI</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {bmi.value} <span className="text-green-600 font-medium">· {bmi.label}</span>
                          </p>
                          <p className="text-xs text-gray-400">Chỉ số khối cơ thể của bạn</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3 vòng đo để phân loại vóc dáng tự động */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5" /> 3 vòng đo (tùy chọn)
                  </p>
                  <p className="text-[10px] text-gray-400 mb-3">Không bắt buộc · Nếu có, AI sẽ tự phân loại vóc dáng cho bạn</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "bust",  label: "Vòng 1 (cm)", placeholder: "88" },
                      { key: "waist", label: "Vòng 2 (cm)", placeholder: "66" },
                      { key: "hips",  label: "Vòng 3 (cm)", placeholder: "92" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">{f.label}</label>
                        <input
                          type="number"
                          value={(bodyForm as Record<string, string>)[f.key]}
                          onChange={e => setBodyForm({ ...bodyForm, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full px-2 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vóc dáng thủ công (nếu chưa có 3 vòng) */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    Hoặc chọn vóc dáng thủ công
                  </p>
                  <div className="space-y-2">
                    {(bodyForm.gender === "male" ? MALE_BODY_SHAPES : FEMALE_BODY_SHAPES).map(shape => {
                      const isActive = bodyForm.bodyShape === shape.id;
                      return (
                        <motion.button key={shape.id} whileTap={{ scale: 0.98 }}
                          onClick={() => setBodyForm({ ...bodyForm, bodyShape: shape.id })}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                            isActive ? "border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm" : "border-gray-100 bg-white hover:border-gray-200"
                          }`}
                        >
                          <div className={`w-12 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${isActive ? "bg-white shadow-sm" : "bg-gray-50"}`}>
                            {BODY_TYPE_IMAGES[bodyForm.gender]?.[shape.id] ? (
                              <img
                                src={BODY_TYPE_IMAGES[bodyForm.gender][shape.id]}
                                alt={shape.labelVi}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-xl">{shape.emoji}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-bold text-sm ${isActive ? "text-purple-700" : "text-gray-900"}`}>
                              {isVi ? shape.labelVi : shape.labelEn}
                              <span className="ml-1.5 text-gray-400 font-normal text-xs">{isVi ? shape.labelEn : shape.labelVi}</span>
                            </p>
                            <p className="text-xs text-gray-400">{shape.desc}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isActive ? "border-purple-500 bg-purple-500" : "border-gray-300"}`}>
                            {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Ngân sách */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" /> Ngân sách mua sắm / tháng (VNĐ)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {BUDGETS.map(b => {
                      const isActive = bodyForm.budget === b.value;
                      return (
                        <button key={b.value} onClick={() => setBodyForm({ ...bodyForm, budget: b.value })}
                          className={`py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                            isActive ? "border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-sm" : "border-gray-100 bg-white text-gray-700 hover:border-gray-200"
                          }`}
                        >
                          {isActive && <Check className="w-3.5 h-3.5 inline mr-1 text-purple-600" />}
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-6 pb-10 pt-3 border-t border-gray-100">
                {bodyResult ? (
                  <div className="flex gap-3">
                    <button onClick={() => setBodyResult(null)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold">Sửa lại</button>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleBodyPanelDone}
                      className="flex-1 py-3.5 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Xong
                    </motion.button>
                  </div>
                ) : (
                  <>
                    {bodyFormError && (
                      <div className="mb-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl">
                        <p className="text-sm text-red-600 font-medium">{bodyFormError}</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => setShowBodyPanel(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-bold">{t("cancel")}</button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveBody} disabled={bodyLoading}
                        data-track="Lưu thông tin"
                        className="flex-1 py-3.5 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2">
                        {bodyLoading ? <span className="text-sm">Đang phân tích...</span> : <><Check className="w-4 h-4" /> Lưu thông tin</>}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav active="profile" />
    </div>
  );
}