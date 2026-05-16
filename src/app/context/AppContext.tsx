import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  getWardrobe as apiGetWardrobe,
  deleteWardrobeItem as apiDeleteWardrobeItem,
} from "../../api/api";

export type Language = "en" | "vi";
export type UserRole = "user" | "admin";

export type User = {
  name: string;
  email: string;
  avatar: string | null;
  colorType: string;
  isPremium: boolean;
  savedOutfits: number;
  wardrobeItems: number;
  role: UserRole;
  preferences?: {
    height: string;
    weight: string;
    age: string;
    bodyShape: string;
    budget: string;
  };
};

export type WardrobeItem = {
  id: number | string;
  name: string;
  category: string;
  match: number;
  occasions: string[];
  image: string;
};

export type ScanHistoryItem = {
  id: string;
  date: string;
  colorType: string;
  colorTypeId: string;
  image: string;
};

export type BankInfo = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrCodeUrl: string;
};

type AppContextType = {
  user: User;
  updateUser: (data: Partial<User>) => void;
  isLoggedIn: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role: UserRole | null; message: string }>;
  registerUser: (email: string, password: string, displayName: string) => Promise<{ success: boolean; message: string }>;
  loadWardrobe: () => Promise<void>;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  bankInfo: BankInfo;
  updateBankInfo: (data: Partial<BankInfo>) => void;
  wardrobeList: WardrobeItem[];
  addWardrobeItem: (item: Omit<WardrobeItem, "id">) => void;
  deleteWardrobeItem: (id: number | string) => void;
  scanHistory: ScanHistoryItem[];
  addScanHistory: (scan: Omit<ScanHistoryItem, "id">) => void;
  deleteScanHistory: (id: string) => void;
  lastScanResultId: string | null;
  setLastScanResultId: (id: string | null) => void;
};

const translations = {
  en: {
    profile: "Profile",
    editProfile: "Edit Profile",
    save: "Save Changes",
    cancel: "Cancel",
    language: "Language",
    english: "English",
    vietnamese: "Tiếng Việt",
    name: "Full Name",
    email: "Email Address",
    premium: "Premium",
    freePlan: "Free Plan",
    colorType: "Your Color Type",
    savedOutfits: "Saved Outfits",
    wardrobeItems: "Wardrobe Items",
    upgradePremium: "Upgrade to Premium",
    myColorAnalysis: "My Color Analysis",
    settings: "Settings",
    helpSupport: "Help & Support",
    privacyPolicy: "Privacy Policy",
    logout: "Log Out",
    unlockFeatures: "Unlock advanced AI features",
    scanTitle: "AI Face Scan",
    scanDesc: "Let's analyze your skin tone to find your perfect color palette",
    alignFace: "Align your face within the guide",
    scanInst1: "Position your face in natural daylight for best results",
    scanInst2: "Remove makeup and accessories for accurate analysis",
    scanInst3: "Keep your face within the guide outline",
    takePhoto: "Take Photo",
    uploadPhoto: "Upload Photo",
    analyzing: "Analyzing Your Colors...",
    analyzingDesc: "AI is processing your skin tone using advanced algorithms",
    cameraError: "Unable to access camera. Please check permissions.",
    resultTitle: "Analysis Result",
    confidence: "Match",
    bestColors: "Your Best Colors",
    avoidColors: "Colors to Avoid",
    combinations: "Recommended Combinations",
    jewelry: "Best Jewelry",
    makeup: "Makeup Suggestions",
    outfit: "Outfit",
    perfectPair: "Perfect color pairing",
    seeOutfits: "See Outfit Recommendations",
    undertone: "Undertone",
    contrast: "Contrast",
    description: "Your skin features a rich golden undertone that resonates perfectly with earthy, autumnal shades.",
    detailedAnalysis: "High contrast between your hair and skin allows you to wear deep, saturated colors without being washed out.",
    warmCoral: "Warm Coral",
    oliveGreen: "Olive Green",
    burntOrange: "Burnt Orange",
    goldenYellow: "Golden Yellow",
    caramelBrown: "Caramel Brown",
    rustRed: "Rust Red",
    coolPink: "Cool Pink",
    icyBlue: "Icy Blue",
    brightWhite: "Bright White",
    coolPurple: "Cool Purple",
    casual: "Casual",
    work: "Work",
    evening: "Evening",
    gold: "Gold",
    roseGold: "Rose Gold",
    bronze: "Bronze",
    peachBlush: "Peach Blush",
    warmBrownEyeshadow: "Warm Brown Eyeshadow",
    brickRedLipstick: "Brick Red Lipstick",
    warmGolden: "Warm / Golden",
    mediumHigh: "Medium-High",
    premiumUpsellTitle: "Unlock Premium Features",
    premiumUpsellDesc: "Get advanced AI styling, wardrobe analysis, and personalized outfit suggestions",
    upgradeToPremium: "Upgrade to Premium",
    pricePremium: "50,000 VND/month",
    welcomeBack: "Welcome back",
    scanFace: "Scan Face",
    viewOutfits: "View Outfits",
    myWardrobe: "My Wardrobe",
    smartAdvisor: "Smart Advisor",
    premiumTitle: "Clarity Premium",
    premiumDesc: "Unlock all advanced features and AI styling capabilities",
    buyNow: "Buy Now",
    addToWardrobe: "Add to Wardrobe",
    addedToWardrobe: "Added to Wardrobe!",
    paymentTitle: "Scan QR to Pay",
    paymentDesc: "Open your banking app and scan the QR code to upgrade instantly.",
    confirmPayment: "I have completed the payment",
    paymentSuccess: "Payment successful! You are now Premium.",
    bankAccount: "Bank Account",
    accountHolder: "Account Holder",
    adminSettings: "Admin Settings",
    updateBankInfo: "Update Bank Information",
    qrCodeUrl: "QR Code URL",
    saveSettings: "Save Settings",
    outfitTitle: "Perfect Matches for You",
    outfitDesc: "Curated outfits that complement your Warm Autumn palette",
    all: "All",
    party: "Party",
    holiday: "Holiday",
    matchLabel: "Match",
    navHome: "Home",
    navScan: "Scan",
    navWardrobe: "Wardrobe",
    navProfile: "Profile",
    scanHistory: "Scan History",
    chatbotPrompt: "Ask anything (e.g. Is this suitable for dating?)...",
    send: "Send",
    height: "Height (cm)",
    weight: "Weight (kg)",
    age: "Age",
    bodyShape: "Body Shape",
    budget: "Shopping Budget (Monthly)",
    savePreferences: "Save Preferences",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this?",
    premiumSetupTitle: "Personalize Your AI",
    premiumSetupDesc: "Tell us more so we can give you the best recommendations.",
    occasions: "Occasions",
    uploadClothes: "Upload Clothes",
    date: "Date",
    study: "Study",
    styleOthers: "Style Others",
    styleOthersDesc: "Help friends and family discover their perfect colors",
    shareLove: "Share the Gift of Style",
    helpFriends: "Upload a photo of anyone and get instant AI color analysis and outfit recommendations.",
    analysisComplete: "Analysis Complete",
    theirColorType: "Their Color Type",
    recommendedColors: "Recommended Colors",
    shareResults: "Share Results",
    analyzeAnother: "Analyze Another Person",
    analyzingPerson: "Analyzing...",
    detectingSkinTone: "Detecting skin tone and determining color type",
    positionFace: "Position their face within the guide",
    premiumFeature: "Premium Feature",
    analyzeAnyone: "Analyze anyone's color type instantly",
    personalizedSuggestions: "Get personalized outfit suggestions for them",
    shareDirectly: "Share results directly with friends",
    perfectForGifts: "Perfect for gift shopping and styling help",
    welcomeBackLogin: "Welcome Back",
    signInContinue: "Sign in to continue your style journey",
    emailLabel: "Email",
    emailPlaceholder: "your.email@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot Password?",
    signIn: "Sign In",
    orContinueWith: "Or continue with",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign Up",
    google: "Google",
    facebook: "Facebook",
    uploadOutfitPhoto: "Upload Outfit Photo",
    checkOutfit: "Check This Outfit",
    outfitAnalysis: "Outfit Analysis",
    autoSaved: "Auto-saved to wardrobe",
    // Signup
    createAccount: "Create Account",
    joinClarity: "Join Clarity and discover your colors",
    fullName: "Full Name",
    fullNamePlaceholder: "John Doe",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    alreadyHaveAccount: "Already have an account?",
    // Home
    quickActions: "Quick Actions",
    proTip: "Pro Tip",
    proTipDesc: "For accurate color analysis, take your photo in natural daylight without makeup",
    // Wardrobe
    addClothing: "Add Clothing",
    emptyWardrobe: "Your wardrobe is empty",
    emptyWardrobeDesc: "Start adding clothes to get AI style suggestions",
    addFirstItem: "Add First Item",
    premiumTip: "💡 Premium Tip",
    premiumTipDesc: "Unlock AI auto-outfit matching and combination features from your wardrobe",
    learnMore: "Learn more →",
    wardrobeMatchDesc: "items matching your palette",
    // AddClothing
    addClothingTitle: "Add Clothing",
    addClothingDesc: "Take a photo or upload clothes to add to your digital wardrobe.",
    flatOnLight: "Please lay the clothing flat on a bright background and photograph clearly",
    openCamera: "Open Camera",
    uploadFromLibrary: "Upload from Library",
    processingImage: "Processing image...",
    processingImageDesc: "AI is extracting your clothing information",
    // SmartAdvisor
    smartOutfitCheck: "Smart Outfit Check",
    smartOutfitCheckDesc: "Upload an outfit photo and let AI check if it suits your skin tone, body shape and occasion. It will auto-save to your wardrobe!",
    suitableLabel: "Great fit!",
    needsWorkLabel: "Needs improvement",
    matchScore: "Match score",
    suitableOccasion: "Suitable occasions",
    outfitStylingTips: "Styling tips",
    viewWardrobe: "View Wardrobe",
    // ScanHistory
    noScanHistory: "No scan history yet",
    noScanHistoryDesc: "Scan your face to start analyzing your skin tone",
    scanCount: "scans",
    confirmDeleteHistory: "Are you sure you want to delete this scan?",
    // ForgotPassword
    forgotPasswordTitle: "Forgot Password?",
    forgotPasswordDesc: "Enter your email address and we'll send you a link to reset your password",
    sendResetLink: "Send Reset Link",
    checkYourEmail: "Check Your Email",
    resetLinkSent: "We've sent a password reset link to",
    backToLogin: "Back to Login",
  },
  vi: {
    profile: "Hồ sơ",
    editProfile: "Chỉnh sửa",
    save: "Lưu thay đổi",
    cancel: "Hủy",
    language: "Ngôn ngữ",
    english: "English",
    vietnamese: "Tiếng Việt",
    name: "Họ và tên",
    email: "Địa chỉ Email",
    premium: "Cao cấp",
    freePlan: "Gói cơ bản",
    colorType: "Kiểu màu của bạn",
    savedOutfits: "Trang phục đã lưu",
    wardrobeItems: "Món đồ tủ đồ",
    upgradePremium: "Nâng cấp Premium",
    myColorAnalysis: "Phân tích màu sắc",
    settings: "Cài đặt",
    helpSupport: "Trợ giúp & Hỗ trợ",
    privacyPolicy: "Chính sách bảo mật",
    logout: "Đăng xuất",
    unlockFeatures: "Mở khóa tính năng AI nâng cao",
    scanTitle: "Quét khuôn mặt AI",
    scanDesc: "Hãy để AI phân tích màu da để tìm ra bảng màu hoàn hảo cho bạn",
    alignFace: "Căn chỉnh khuôn mặt vào khung",
    scanInst1: "Đứng ở nơi có ánh sáng tự nhiên để có kết quả tốt nhất",
    scanInst2: "Tẩy trang và tháo phụ kiện để phân tích chính xác",
    scanInst3: "Giữ khuôn mặt trong đường viền hướng dẫn",
    takePhoto: "Chụp ảnh",
    uploadPhoto: "Tải ảnh lên",
    analyzing: "Đang phân tích màu sắc...",
    analyzingDesc: "AI đang xử lý màu da của bạn bằng thuật toán nâng cao",
    cameraError: "Không thể truy cập camera. Vui lòng kiểm tra quyền.",
    resultTitle: "Kết quả phân tích",
    confidence: "Độ chính xác",
    bestColors: "Màu sắc phù hợp nhất",
    avoidColors: "Màu sắc nên tránh",
    combinations: "Gợi ý phối màu",
    jewelry: "Trang sức phù hợp",
    makeup: "Gợi ý trang điểm",
    outfit: "Trang phục",
    perfectPair: "Cặp màu hoàn hảo",
    seeOutfits: "Xem Gợi ý Trang phục",
    undertone: "Sắc độ da",
    contrast: "Độ tương phản",
    description: "Làn da của bạn có sắc độ vàng ấm áp, tỏa sáng rực rỡ với các sắc thái mộc mạc của mùa thu.",
    detailedAnalysis: "Độ tương phản cao giữa tóc và da cho phép bạn mặc những gam màu trầm, đậm mà không bị mờ nhạt.",
    warmCoral: "San hô ấm",
    oliveGreen: "Xanh Olive",
    burntOrange: "Cam cháy",
    goldenYellow: "Vàng kim",
    caramelBrown: "Nâu Caramel",
    rustRed: "Đỏ rỉ sét",
    coolPink: "Hồng lạnh",
    icyBlue: "Xanh băng",
    brightWhite: "Trắng sáng",
    coolPurple: "Tím lạnh",
    casual: "Thường ngày",
    work: "Công sở",
    evening: "Dự tiệc",
    gold: "Vàng",
    roseGold: "Vàng hồng",
    bronze: "Đồng",
    peachBlush: "Phấn má hồng đào",
    warmBrownEyeshadow: "Phấn mắt nâu ấm",
    brickRedLipstick: "Son đỏ gạch",
    warmGolden: "Ấm / Vàng",
    mediumHigh: "Trung bình - Cao",
    premiumUpsellTitle: "Mở khóa Tính năng Premium",
    premiumUpsellDesc: "Nhận các gợi ý phong cách AI nâng cao, phân tích tủ đồ và đề xuất trang phục cá nhân hóa",
    upgradeToPremium: "Nâng cấp lên Premium",
    pricePremium: "50.000 VNĐ/tháng",
    welcomeBack: "Chào mừng trở lại",
    scanFace: "Quét khuôn mặt",
    viewOutfits: "Xem trang phục",
    myWardrobe: "Tủ đồ của tôi",
    smartAdvisor: "Trợ lý thông minh",
    premiumTitle: "Clarity Premium",
    premiumDesc: "Mở khóa tất cả tính năng nâng cao và khả năng tư vấn AI",
    buyNow: "Mua ngay",
    addToWardrobe: "Thêm vào tủ đồ",
    addedToWardrobe: "Đã thêm vào tủ đồ!",
    paymentTitle: "Quét mã QR để thanh toán",
    paymentDesc: "Mở ứng dụng ngân hàng của bạn và quét mã QR để nâng cấp ngay.",
    confirmPayment: "Tôi đã hoàn tất thanh toán",
    paymentSuccess: "Thanh toán thành công! Bạn đã là thành viên Premium.",
    bankAccount: "Số tài khoản",
    accountHolder: "Chủ tài khoản",
    adminSettings: "Cài đặt quản trị",
    updateBankInfo: "Cập nhật thông tin ngân hàng",
    qrCodeUrl: "Đường dẫn ảnh mã QR",
    saveSettings: "Lưu cài đặt",
    outfitTitle: "Trang phục hoàn hảo cho bạn",
    outfitDesc: "Các bộ trang phục được chọn lọc phù hợp với bảng màu của bạn",
    all: "Tất cả",
    party: "Dự tiệc",
    holiday: "Kỳ nghỉ",
    matchLabel: "Độ hợp",
    navHome: "Trang chủ",
    navScan: "Quét",
    navWardrobe: "Tủ đồ",
    navProfile: "Hồ sơ",
    scanHistory: "Lịch sử quét",
    chatbotPrompt: "Hỏi trợ lý (VD: Bộ này đi hẹn hò được không?)...",
    send: "Gửi",
    height: "Chiều cao (cm)",
    weight: "Cân nặng (kg)",
    age: "Tuổi",
    bodyShape: "Vóc dáng",
    budget: "Ngân sách mua sắm (Tháng)",
    savePreferences: "Lưu thông tin",
    delete: "Xóa",
    confirmDelete: "Bạn có chắc muốn xóa không?",
    premiumSetupTitle: "Cá nhân hóa AI của bạn",
    premiumSetupDesc: "Cung cấp thêm thông tin để AI gợi �� chuẩn xác nhất.",
    occasions: "Hoàn cảnh",
    uploadClothes: "Tải ảnh quần áo lên",
    date: "Hẹn hò",
    study: "Đi học",
    styleOthers: "Phân tích cho người khác",
    styleOthersDesc: "Giúp bạn bè và gia đình khám phá màu sắc hoàn hảo của họ",
    shareLove: "Chia sẻ món quà phong cách",
    helpFriends: "Tải lên ảnh của bất kỳ ai và nhận ngay phân tích màu da AI cùng gợi ý trang phục.",
    analysisComplete: "Hoàn tất phân tích",
    theirColorType: "Kiểu màu của họ",
    recommendedColors: "Màu sắc được đề xuất",
    shareResults: "Chia sẻ kết quả",
    analyzeAnother: "Phân tích người khác",
    analyzingPerson: "Đang phân tích...",
    detectingSkinTone: "Đang phát hiện màu da và xác định kiểu màu",
    positionFace: "Đặt khuôn mặt của họ vào trong khung",
    premiumFeature: "Tính năng Premium",
    analyzeAnyone: "Phân tích kiểu màu của bất kỳ ai ngay lập tức",
    personalizedSuggestions: "Nhận gợi ý trang phục cá nhân hóa cho họ",
    shareDirectly: "Chia sẻ kết quả trực tiếp với bạn bè",
    perfectForGifts: "Hoàn hảo cho việc mua quà và tư vấn phong cách",
    welcomeBackLogin: "Chào mừng trở lại",
    signInContinue: "Đăng nhập để tiếp tục hành trình phong cách của bạn",
    emailLabel: "Email",
    emailPlaceholder: "email.cua.ban@example.com",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu của bạn",
    forgotPassword: "Quên mật khẩu?",
    signIn: "Đăng nhập",
    orContinueWith: "Hoặc tiếp tục với",
    dontHaveAccount: "Chưa có tài khoản?",
    signUp: "Đăng ký",
    google: "Google",
    facebook: "Facebook",
    uploadOutfitPhoto: "Tải ảnh trang phục",
    checkOutfit: "Kiểm tra bộ đồ này",
    outfitAnalysis: "Phân tích trang phục",
    autoSaved: "Đã tự động lưu vào tủ đồ",
    // Signup
    createAccount: "Tạo tài khoản",
    joinClarity: "Tham gia Clarity và khám phá màu sắc của bạn",
    fullName: "Họ và tên đầy đủ",
    fullNamePlaceholder: "Nguyễn Văn A",
    confirmPasswordLabel: "Xác nhận mật khẩu",
    confirmPasswordPlaceholder: "Nhập lại mật khẩu",
    alreadyHaveAccount: "Đã có tài khoản?",
    // Home
    quickActions: "Thao tác nhanh",
    proTip: "Mẹo hay",
    proTipDesc: "Để phân tích màu chính xác, chụp ảnh ở ánh sáng tự nhiên, không trang điểm",
    // Wardrobe
    addClothing: "Thêm trang phục",
    emptyWardrobe: "Tủ đồ của bạn đang trống",
    emptyWardrobeDesc: "Bắt đầu thêm quần áo để nhận gợi ý phong cách từ AI",
    addFirstItem: "Thêm món đồ đầu tiên",
    premiumTip: "💡 Mẹo Premium",
    premiumTipDesc: "Mở khóa tính năng AI tự động phối đồ và kết hợp trang phục từ tủ đồ của bạn",
    learnMore: "Tìm hiểu thêm →",
    wardrobeMatchDesc: "món đồ phù hợp với bảng màu của bạn",
    // AddClothing
    addClothingTitle: "Thêm trang phục",
    addClothingDesc: "Chụp ảnh hoặc tải lên quần áo để thêm vào tủ đồ điện tử của bạn.",
    flatOnLight: "Vui lòng trải phẳng quần áo trên nền sáng và chụp rõ nét",
    openCamera: "Mở Camera chụp ảnh",
    uploadFromLibrary: "Tải ảnh từ Thư viện",
    processingImage: "Đang xử lý ảnh...",
    processingImageDesc: "AI đang trích xuất thông tin trang phục của bạn",
    // SmartAdvisor
    smartOutfitCheck: "Kiểm tra trang phục thông minh",
    smartOutfitCheckDesc: "Tải lên ảnh trang phục và để AI kiểm tra xem có phù hợp với màu da, vóc dáng và hoàn cảnh của bạn không. Trang phục sẽ tự động được lưu vào tủ đồ!",
    suitableLabel: "Rất phù hợp!",
    needsWorkLabel: "Cần cải thiện",
    matchScore: "Độ phù hợp",
    suitableOccasion: "Hoàn cảnh phù hợp",
    outfitStylingTips: "Gợi ý phối đồ",
    viewWardrobe: "Xem tủ đồ",
    // ScanHistory
    noScanHistory: "Chưa có lịch sử quét",
    noScanHistoryDesc: "Quét khuôn mặt để bắt đầu phân tích màu da của bạn",
    scanCount: "lần quét",
    confirmDeleteHistory: "Bạn có chắc muốn xóa lịch sử này không?",
    // ForgotPassword
    forgotPasswordTitle: "Quên mật khẩu?",
    forgotPasswordDesc: "Nhập địa chỉ email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu",
    sendResetLink: "Gửi liên kết đặt lại",
    checkYourEmail: "Kiểm tra Email của bạn",
    resetLinkSent: "Chúng tôi đã gửi liên kết đặt lại mật khẩu đến",
    backToLogin: "Quay lại đăng nhập",
  },
};

const defaultContextValue: AppContextType = {
  user: {
    name: "",
    email: "",
    avatar: null,
    colorType: "",
    isPremium: false,
    savedOutfits: 0,
    wardrobeItems: 0,
    role: "user",
  },
  updateUser: () => {},
  isLoggedIn: false,
  authLoading: true,
  login: () => Promise.resolve({ success: false, role: null, message: "" }),
  registerUser: () => Promise.resolve({ success: false, message: "" }),
  loadWardrobe: () => Promise.resolve(),
  logout: () => {},
  language: "vi",
  setLanguage: () => {},
  t: (key: string) => key,
  bankInfo: {
    bankName: "",
    accountName: "",
    accountNumber: "",
    qrCodeUrl: "",
  },
  updateBankInfo: () => {},
  wardrobeList: [],
  addWardrobeItem: () => {},
  deleteWardrobeItem: () => {},
  scanHistory: [],
  addScanHistory: () => {},
  deleteScanHistory: () => {},
  lastScanResultId: null,
  setLastScanResultId: () => {},
};

const AppContext = createContext<AppContextType>(defaultContextValue);

const CATEGORY_MAP: Record<string, string> = {
  top: "Áo",
  bottom: "Quần",
  shoes: "Giày dép",
  accessory: "Phụ kiện",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("vi");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User>({
    name: "Nguyễn Văn A",
    email: "nguyen.vana@example.com",
    avatar: null,
    colorType: "Warm Autumn",
    isPremium: false,
    savedOutfits: 12,
    wardrobeItems: 34,
    role: "user",
  });

  const [wardrobeList, setWardrobeList] = useState<WardrobeItem[]>([
    {
      id: 1,
      name: "Áo blazer olive",
      category: "Áo",
      match: 95,
      occasions: ["Công sở", "Dự tiệc"],
      image: "https://images.unsplash.com/photo-1641943632479-3798ef1e14c6?w=400",
    },
    {
      id: 2,
      name: "Váy tông màu đất",
      category: "Váy",
      match: 98,
      occasions: ["Dự tiệc", "Kỳ nghỉ"],
      image: "https://images.unsplash.com/photo-1764265148862-7ee72a4fb367?w=400",
    },
    {
      id: 3,
      name: "Áo len caramel",
      category: "Áo",
      match: 92,
      occasions: ["Thường ngày", "Đi học"],
      image: "https://images.unsplash.com/photo-1731404617461-e0eeeeefcf7b?w=400",
    },
    {
      id: 4,
      name: "Áo sơ mi beige",
      category: "Áo",
      match: 90,
      occasions: ["Thường ngày", "Công sở"],
      image: "https://images.unsplash.com/photo-1744135995007-f1dde493d241?w=400",
    },
    {
      id: 5,
      name: "Áo croptop coral",
      category: "Áo",
      match: 93,
      occasions: ["Hẹn hò", "Dự tiệc"],
      image: "https://images.unsplash.com/photo-1768077002909-a2ac2d71d650?w=400",
    },
    {
      id: 6,
      name: "Blouse terracotta",
      category: "Áo",
      match: 96,
      occasions: ["Thường ngày", "Hẹn hò"],
      image: "https://images.unsplash.com/photo-1759992878512-ec8f958b13e7?w=400",
    },
    {
      id: 7,
      name: "Quần wide-leg trắng sữa",
      category: "Quần",
      match: 88,
      occasions: ["Công sở", "Thường ngày"],
      image: "https://images.unsplash.com/photo-1559658565-c3d776872a20?w=400",
    },
    {
      id: 8,
      name: "Quần jeans đen skinny",
      category: "Quần",
      match: 85,
      occasions: ["Thường ngày", "Hẹn hò"],
      image: "https://images.unsplash.com/photo-1562121594-70a275d4b5e1?w=400",
    },
    {
      id: 9,
      name: "Quần culottes nâu",
      category: "Quần",
      match: 91,
      occasions: ["Công sở", "Dự tiệc"],
      image: "https://images.unsplash.com/photo-1666513241353-14a198830381?w=400",
    },
    {
      id: 10,
      name: "Váy midi đỏ gạch",
      category: "Váy",
      match: 94,
      occasions: ["Dự tiệc", "Hẹn hò"],
      image: "https://images.unsplash.com/photo-1508829298730-713792c22189?w=400",
    },
    {
      id: 11,
      name: "Chân váy olive xòe",
      category: "Váy",
      match: 97,
      occasions: ["Thường ngày", "Hẹn hò"],
      image: "https://images.unsplash.com/photo-1568467020752-b08fbd48e878?w=400",
    },
    {
      id: 12,
      name: "Áo khoác vàng mustard",
      category: "Áo khoác",
      match: 89,
      occasions: ["Thường ngày", "Kỳ nghỉ"],
      image: "https://images.unsplash.com/photo-1582930177321-5e1fd7d6cbe2?w=400",
    },
    {
      id: 13,
      name: "Áo khoác camel dài",
      category: "Áo khoác",
      match: 96,
      occasions: ["Công sở", "Kỳ nghỉ"],
      image: "https://images.unsplash.com/photo-1705920821948-705ae2e61fc0?w=400",
    },
  ]);

  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  const deleteWardrobeItem = (id: number | string) => {
    setWardrobeList((prev: WardrobeItem[]) => prev.filter((item: WardrobeItem) => item.id !== id));
    setUser((prev: User) => ({ ...prev, wardrobeItems: prev.wardrobeItems - 1 }));
    apiDeleteWardrobeItem(String(id)).catch(() => {});
  };

  const addWardrobeItem = (item: Omit<WardrobeItem, "id">) => {
    const newId = Date.now();
    setWardrobeList((prev: WardrobeItem[]) => [{ id: newId, ...item }, ...prev]);
    setUser((prev: User) => ({ ...prev, wardrobeItems: prev.wardrobeItems + 1 }));
  };

  const addScanHistory = (scan: Omit<ScanHistoryItem, "id">) => {
    setScanHistory((prev: ScanHistoryItem[]) => [{ id: Math.random().toString(), ...scan }, ...prev]);
  };

  const deleteScanHistory = (id: string) => {
    setScanHistory((prev: ScanHistoryItem[]) => prev.filter((item: ScanHistoryItem) => item.id !== id));
  };

  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "Vietcombank",
    accountName: "CLARITY APP",
    accountNumber: "1234567890",
    qrCodeUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&q=80",
  });

  const updateUser = (data: Partial<User>) => {
    setUser((prev: User) => ({ ...prev, ...data }));
  };

  const updateBankInfo = (data: Partial<BankInfo>) => {
    setBankInfo((prev: BankInfo) => ({ ...prev, ...data }));
  };

  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations];
    return (langTranslations as Record<string, string>)[key] || key;
  };

  const [lastScanResultId, setLastScanResultId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("clarity_token");
    if (!token) { setAuthLoading(false); return; }
    getMe()
      .then((res: { data: { data: { displayName?: string; email: string; subscriptionTier?: string } } }) => {
        const u = res.data.data;
        setIsLoggedIn(true);
        setUser((prev: User) => ({
          ...prev,
          name: u.displayName || u.email,
          email: u.email,
          role: "user" as UserRole,
          isPremium: u.subscriptionTier === "premium",
        }));
      })
      .catch(() => {
        localStorage.removeItem("clarity_token");
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role: UserRole | null; message: string }> => {
    try {
      const res = await apiLogin(email, password);
      const { token, user: u } = res.data.data;
      localStorage.setItem("clarity_token", token);
      setIsLoggedIn(true);
      setUser((prev: User) => ({
        ...prev,
        name: u.displayName || u.email,
        email: u.email,
        role: "user" as UserRole,
        isPremium: u.subscriptionTier === "premium",
      }));
      return { success: true, role: "user" as UserRole, message: "Đăng nhập thành công" };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Email hoặc mật khẩu không đúng";
      return { success: false, role: null, message };
    }
  };

  const registerUser = async (email: string, password: string, displayName: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiRegister(email, password, displayName);
      const { token, user: u } = res.data.data;
      localStorage.setItem("clarity_token", token);
      setIsLoggedIn(true);
      setUser((prev: User) => ({
        ...prev,
        name: u.displayName || displayName,
        email: u.email,
        role: "user" as UserRole,
        isPremium: false,
      }));
      return { success: true, message: "Đăng ký thành công" };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Đăng ký thất bại";
      return { success: false, message };
    }
  };

  const loadWardrobe = async (): Promise<void> => {
    try {
      const res = await apiGetWardrobe();
      const apiItems: Array<{ _id: string; name: string; category: string; seasons?: string[]; imageUrl?: string }> =
        res.data.data?.items || [];
      const transformed: WardrobeItem[] = apiItems.map((item) => ({
        id: item._id,
        name: item.name,
        category: CATEGORY_MAP[item.category] || item.category,
        match: 90,
        occasions: item.seasons && item.seasons.length > 0
          ? [item.seasons[0].split("-")[0] === "spring" || item.seasons[0].split("-")[0] === "summer"
              ? "Thường ngày"
              : "Công sở"]
          : ["Thường ngày"],
        image: item.imageUrl || FALLBACK_IMAGE,
      }));
      setWardrobeList(transformed);
    } catch {
      // silent — keep existing list
    }
  };

  const logout = () => {
    localStorage.removeItem("clarity_token");
    setIsLoggedIn(false);
    setUser({
      name: "",
      email: "",
      avatar: null,
      colorType: "",
      isPremium: false,
      savedOutfits: 0,
      wardrobeItems: 0,
      role: "user",
    });
    setWardrobeList([]);
  };

  return (
    <AppContext.Provider value={{
      user, updateUser, isLoggedIn, authLoading, login, registerUser, loadWardrobe, logout,
      language, setLanguage, t, bankInfo, updateBankInfo,
      wardrobeList, addWardrobeItem, deleteWardrobeItem, scanHistory, addScanHistory, deleteScanHistory,
      lastScanResultId, setLastScanResultId
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};