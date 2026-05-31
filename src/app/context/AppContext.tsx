import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  getScanHistory as apiGetScanHistory,
  deleteScan as apiDeleteScan,
  getWardrobe as apiGetWardrobe,
  deleteWardrobeItem as apiDeleteWardrobeItem,
  saveBodyProfile as apiSaveBodyProfile,
  uploadAvatar as apiUploadAvatar,
  toggleFavoriteApi,
} from "../../api/api";
import { COLOR_TYPES } from "../data/colorTypes";

export type Language = "en" | "vi";
export type UserRole = "user" | "admin";

export type BodyProfile = {
  gender: 'female' | 'male';
  height?: number;
  weight?: number;
  bust?: number;
  waist?: number;
  hips?: number;
  bodyType?: string;
  age?: number;
  bodyShape?: string;
  budget?: string;
  updatedAt?: string;
};

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
  bodyProfile?: BodyProfile;
};

export type WardrobeItem = {
  id: number | string;
  name: string;
  category: string;
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
  refreshUser: () => Promise<void>;
  isLoggedIn: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role: UserRole | null; message: string }>;
  loginWithToken: (token: string) => Promise<{ success: boolean }>;
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
  loadScanHistory: () => Promise<void>;
  favoriteOutfitIds: Set<string>;
  toggleFavoriteOutfit: (id: string) => void;
  lastScanResultId: string | null;
  setLastScanResultId: (id: string | null) => void;
  saveBodyProfile: (data: { gender: 'female' | 'male'; height?: number; weight?: number; bust?: number; waist?: number; hips?: number; age?: string | number; bodyShape?: string; budget?: string }) => Promise<{ success: boolean; bodyType?: string; label?: string; emoji?: string; description?: string; characteristics?: string[]; tips?: string }>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; avatarUrl?: string }>;
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
    savedOutfits: "Favorites",
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
    savedOutfits: "Yêu thích",
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
  refreshUser: () => Promise.resolve(),
  isLoggedIn: false,
  authLoading: true,
  login: () => Promise.resolve({ success: false, role: null, message: "" }),
  loginWithToken: () => Promise.resolve({ success: false }),
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
  loadScanHistory: () => Promise.resolve(),
  favoriteOutfitIds: new Set<string>(),
  toggleFavoriteOutfit: () => {},
  lastScanResultId: null,
  setLastScanResultId: () => {},
  saveBodyProfile: () => Promise.resolve({ success: false }),
  uploadAvatar: () => Promise.resolve({ success: false }),
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

  const [wardrobeList, setWardrobeList] = useState<WardrobeItem[]>([]);

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
    apiDeleteScan(id).catch(() => {});
  };

  const [favoriteOutfitIds, setFavoriteOutfitIds] = useState<Set<string>>(new Set());

  const toggleFavoriteOutfit = (id: string) => {
    // Optimistic update
    setFavoriteOutfitIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // Persist to backend
    toggleFavoriteApi(id)
      .then((res) => {
        const ids: string[] = res.data.data?.favoriteProductIds ?? [];
        setFavoriteOutfitIds(new Set(ids));
      })
      .catch(() => {
        // Revert on failure
        setFavoriteOutfitIds((prev) => {
          const next = new Set(prev);
          next.has(id) ? next.delete(id) : next.add(id);
          return next;
        });
      });
  };

  const saveBodyProfile = async (data: { gender: 'female' | 'male'; height?: number; weight?: number; bust?: number; waist?: number; hips?: number; age?: string | number; bodyShape?: string; budget?: string }): Promise<{ success: boolean; bodyType?: string; label?: string; emoji?: string; description?: string; characteristics?: string[]; tips?: string }> => {
    try {
      const res = await apiSaveBodyProfile(data);
      const { bodyProfile, bodyType, label, emoji, description, characteristics, tips } = res.data.data;
      setUser((prev: User) => ({ ...prev, bodyProfile }));
      return { success: true, bodyType, label, emoji, description, characteristics, tips };
    } catch {
      return { success: false };
    }
  };

  const uploadAvatar = async (file: File): Promise<{ success: boolean; avatarUrl?: string }> => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiUploadAvatar(formData);
      const { avatarUrl } = res.data.data;
      const fullUrl = resolveImg(avatarUrl);
      setUser((prev: User) => ({ ...prev, avatar: fullUrl }));
      return { success: true, avatarUrl: fullUrl };
    } catch {
      return { success: false };
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Resolve any image URL to a browser-loadable URL:
  // - Cloudinary https://... → use as-is
  // - Old localhost http://localhost:PORT/... → rebase to API_BASE
  // - Relative /uploads/... → prepend API_BASE
  // - Empty → FALLBACK_IMAGE
  const resolveImg = (url?: string | null): string => {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith('https://')) return url;
    if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(url)) {
      const p = url.replace(/^https?:\/\/[^/]+/, '');
      return `${API_BASE}${p}`;
    }
    if (url.startsWith('/')) return `${API_BASE}${url}`;
    return url;
  };

  // Shared: apply full user data from getMe response and load related lists
  const applyGetMeData = (u: Record<string, any>) => {
    const avatar = u.avatarUrl ? resolveImg(u.avatarUrl) : null;
    setIsLoggedIn(true);
    setUser((prev: User) => ({
      ...prev,
      name: u.displayName || u.email,
      email: u.email,
      avatar,
      role: u.isAdmin ? "admin" as UserRole : "user" as UserRole,
      isPremium: u.subscriptionTier === "premium",
      bodyProfile: u.bodyProfile ?? prev.bodyProfile,
    }));
    // Load favorites
    const favIds: string[] = u.favoriteProductIds ?? [];
    setFavoriteOutfitIds(new Set(favIds));
    // Load wardrobe
    apiGetWardrobe()
      .then((r) => {
        const apiItems: Array<{ _id: string; name: string; category: string; seasons?: string[]; occasions?: string[]; imageUrl?: string }> =
          r.data.data?.items || [];
        setWardrobeList(apiItems.map((item) => ({
          id: item._id,
          name: item.name,
          category: CATEGORY_MAP[item.category] || item.category,
          occasions: Array.isArray(item.occasions) && item.occasions.length > 0
            ? item.occasions
            : ["Thường ngày"],
          image: resolveImg(item.imageUrl),
        })));
      })
      .catch(() => {});
    // Load scan history
    apiGetScanHistory()
      .then((r) => setScanHistory(buildScanItems(r.data.data?.scans || [])))
      .catch(() => {});
  };

  const buildScanItems = (apiScans: Array<{ _id: string; season: string; scanDate: string; photoUrl?: string }>): ScanHistoryItem[] =>
    apiScans.map((scan) => {
      const colorTypeId = scan.season.split("-").reverse().join("-");
      const ct = COLOR_TYPES.find((c) => c.id === colorTypeId) || COLOR_TYPES[0];
      return {
        id: scan._id,
        date: new Date(scan.scanDate).toLocaleDateString("vi-VN"),
        colorType: ct.nameVi,
        colorTypeId: ct.id,
        image: scan.photoUrl ? resolveImg(scan.photoUrl) : ct.sampleImage,
      };
    });

  const loadScanHistory = async (): Promise<void> => {
    try {
      const res = await apiGetScanHistory();
      const apiScans = res.data.data?.scans || [];
      setScanHistory(buildScanItems(apiScans));
    } catch {
      // silent — keep existing list
    }
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

  const refreshUser = async (): Promise<void> => {
    try {
      const res = await getMe();
      applyGetMeData(res.data.data);
    } catch {
      // silent — keep existing state if refresh fails
    }
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
      .then((res) => { applyGetMeData(res.data.data); })
      .catch(() => { localStorage.removeItem("clarity_token"); })
      .finally(() => { setAuthLoading(false); });
  }, []);

  const loginWithToken = async (token: string): Promise<{ success: boolean }> => {
    try {
      localStorage.setItem("clarity_token", token);
      const res = await getMe();
      applyGetMeData(res.data.data);
      return { success: true };
    } catch {
      localStorage.removeItem("clarity_token");
      return { success: false };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; role: UserRole | null; message: string }> => {
    try {
      const res = await apiLogin(email, password);
      const { token } = res.data.data;
      localStorage.setItem("clarity_token", token);
      const meRes = await getMe();
      const u = meRes.data.data;
      applyGetMeData(u);
      const role: UserRole = u.isAdmin ? "admin" : "user";
      return { success: true, role, message: "Đăng nhập thành công" };
    } catch (err: unknown) {
      localStorage.removeItem("clarity_token");
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
      const apiItems: Array<{ _id: string; name: string; category: string; seasons?: string[]; occasions?: string[]; imageUrl?: string }> =
        res.data.data?.items || [];
      const transformed: WardrobeItem[] = apiItems.map((item) => ({
        id: item._id,
        name: item.name,
        category: CATEGORY_MAP[item.category] || item.category,
        occasions: Array.isArray(item.occasions) && item.occasions.length > 0
          ? item.occasions
          : ["Thường ngày"],
        image: resolveImg(item.imageUrl),
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
    setFavoriteOutfitIds(new Set());
    setScanHistory([]);
  };

  return (
    <AppContext.Provider value={{
      user, updateUser, refreshUser, isLoggedIn, authLoading, login, loginWithToken, registerUser, loadWardrobe, logout,
      language, setLanguage, t, bankInfo, updateBankInfo,
      wardrobeList, addWardrobeItem, deleteWardrobeItem, scanHistory, addScanHistory, deleteScanHistory, loadScanHistory,
      favoriteOutfitIds, toggleFavoriteOutfit,
      lastScanResultId, setLastScanResultId,
      saveBodyProfile, uploadAvatar
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};