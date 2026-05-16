import { useNavigate } from "react-router";
import { ArrowLeft, Bell, Shield, Key, Eye, HelpCircle, FileText, Smartphone } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export function Settings() {
  const navigate = useNavigate();
  const { t } = useAppContext();

  const settingsGroups = [
    {
      title: "Tài khoản",
      items: [
        { icon: Shield, label: "Bảo mật & Quyền riêng tư" },
        { icon: Key, label: "Mật khẩu" },
        { icon: Bell, label: "Thông báo" },
      ]
    },
    {
      title: "Tùy chọn",
      items: [
        { icon: Eye, label: "Giao diện" },
        { icon: Smartphone, label: "Cài đặt ứng dụng" },
      ]
    },
    {
      title: "Hỗ trợ",
      items: [
        { icon: HelpCircle, label: "Trung tâm hỗ trợ" },
        { icon: FileText, label: "Điều khoản dịch vụ", path: "/privacy" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-12">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white shadow-sm border-b border-purple-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-purple-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t("settings")}</h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="px-6 py-6 space-y-8">
        {settingsGroups.map((group, index) => (
          <div key={index}>
            <h3 className="text-sm font-bold text-purple-500 uppercase tracking-wider mb-3 px-2">
              {group.title}
            </h3>
            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
              {group.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full flex items-center gap-4 p-4 text-left hover:bg-purple-50 transition-colors ${
                    i !== group.items.length - 1 ? 'border-b border-purple-50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-purple-500">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">{item.label}</span>
                  <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 text-purple-300 rotate-180" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-6">
          <button className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-colors border border-red-100">
            Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}