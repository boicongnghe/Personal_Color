import { useNavigate } from "react-router";
import {
  ArrowLeft, Key, Shield, Globe, Crown, FileText,
  LogOut, ChevronRight, Check, User, Trash2,
} from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { BottomNav } from "../components/BottomNav";

export function Settings() {
  const navigate = useNavigate();
  const { user, language, setLanguage, logout, t } = useAppContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SectionTitle = ({ label }: { label: string }) => (
    <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2 px-1">{label}</p>
  );

  const Row = ({
    icon: Icon,
    iconBg,
    label,
    sub,
    right,
    onClick,
    danger,
  }: {
    icon: any; iconBg: string; label: string; sub?: string;
    right?: React.ReactNode; onClick?: () => void; danger?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors ${danger ? "hover:bg-red-50" : "hover:bg-purple-50"}`}
    >
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${danger ? "text-red-500" : "text-white"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? "text-red-500" : "text-gray-900"}`}>{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
      {right ?? <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
    </button>
  );

  const Divider = () => <div className="h-px bg-gray-50 mx-4" />;

  return (
    <div className="min-h-screen bg-slate-50 pb-nav overflow-x-hidden">
      {/* Header */}
      <div className="px-5 pb-4 bg-white shadow-sm border-b border-purple-50" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t("settings")}</h1>
        </div>
      </div>

      <div className="px-5 py-6 space-y-5">

        {/* Tài khoản */}
        <div>
          <SectionTitle label="Tài khoản" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Row
              icon={User}
              iconBg="bg-gradient-to-br from-purple-400 to-pink-400"
              label={user.name || "Chưa đặt tên"}
              sub={user.email}
              onClick={() => navigate("/profile")}
            />
            <Divider />
            <Row
              icon={Key}
              iconBg="bg-blue-500"
              label="Đổi mật khẩu"
              sub="Gửi link đặt lại qua email"
              onClick={() => navigate("/forgot-password")}
            />
            <Divider />
            <Row
              icon={Shield}
              iconBg="bg-green-500"
              label="Bảo mật tài khoản"
              sub="JWT · Mã hóa bcrypt"
              onClick={() => navigate("/privacy")}
            />
          </div>
        </div>

        {/* Gói dịch vụ */}
        <div>
          <SectionTitle label="Gói dịch vụ" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Row
              icon={Crown}
              iconBg={user.isPremium ? "bg-gradient-to-br from-yellow-400 to-amber-500" : "bg-gray-200"}
              label={user.isPremium ? "Đang dùng gói Premium" : "Gói Miễn phí"}
              sub={user.isPremium
                ? "Toàn bộ tính năng đã mở khóa"
                : "1 lần quét/tháng · 3 gợi ý trang phục"}
              right={
                user.isPremium ? (
                  <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">ACTIVE</span>
                ) : (
                  <span className="text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-400 px-3 py-1 rounded-full">
                    Nâng cấp
                  </span>
                )
              }
              onClick={() => !user.isPremium && navigate("/premium")}
            />
          </div>
        </div>

        {/* Ngôn ngữ */}
        <div>
          <SectionTitle label="Tuỳ chọn" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{t("language")}</p>
                <p className="text-xs text-gray-400 mt-0.5">Ngôn ngữ hiển thị trong ứng dụng</p>
              </div>
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setLanguage("vi")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    language === "vi"
                      ? "bg-white shadow text-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  {language === "vi" && <Check className="w-3 h-3" />}
                  VI
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    language === "en"
                      ? "bg-white shadow text-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  {language === "en" && <Check className="w-3 h-3" />}
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pháp lý */}
        <div>
          <SectionTitle label="Pháp lý" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Row
              icon={FileText}
              iconBg="bg-purple-500"
              label="Điều khoản dịch vụ"
              onClick={() => navigate("/terms")}
            />
            <Divider />
            <Row
              icon={Shield}
              iconBg="bg-blue-500"
              label="Chính sách bảo mật"
              onClick={() => navigate("/privacy")}
            />
          </div>
        </div>

        {/* Đăng xuất & Xóa tài khoản */}
        <div>
          <SectionTitle label="Khác" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Row
              icon={LogOut}
              iconBg="bg-red-50"
              label="Đăng xuất"
              onClick={() => setShowLogoutConfirm(true)}
              danger
            />
            <Divider />
            <Row
              icon={Trash2}
              iconBg="bg-red-50"
              label="Xóa tài khoản"
              sub="Xóa vĩnh viễn tất cả dữ liệu"
              onClick={() => setShowDeleteConfirm(true)}
              danger
            />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pt-2">
          Clarity App · Phiên bản 1.0.0
        </p>
      </div>

      {/* Logout confirm dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-4 pb-8">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Đăng xuất?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng Clarity.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors"
              >
                Đăng xuất
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account confirm dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-4 pb-8">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Xóa tài khoản?</h3>
            <p className="text-gray-500 text-sm text-center mb-1">
              Toàn bộ dữ liệu sẽ bị xóa vĩnh viễn:
            </p>
            <ul className="text-sm text-red-500 text-center mb-6 space-y-1">
              <li>Lịch sử quét màu da</li>
              <li>Tủ đồ & trang phục đã lưu</li>
              <li>Hồ sơ & thông tin cá nhân</li>
            </ul>
            <div className="space-y-3">
              <a
                href="mailto:support@clarityapp.vn?subject=Yêu cầu xóa tài khoản"
                className="block w-full py-3.5 bg-red-500 text-white rounded-2xl font-bold text-center hover:bg-red-600 transition-colors"
              >
                Gửi yêu cầu xóa tài khoản
              </a>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="profile" />
    </div>
  );
}
