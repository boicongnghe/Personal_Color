import { Outlet, useNavigate } from "react-router";
import { Sparkles, ArrowRight, User, Ruler, ChevronRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export function RequireProfile() {
  const { user, authLoading } = useAppContext();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user has set gender, personalization is done → allow through
  if (user.bodyProfile?.gender) {
    return <Outlet />;
  }

  /* ── Gate UI ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center px-6">

      {/* Icon */}
      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-400 rounded-3xl flex items-center justify-center shadow-xl mb-6">
        <Sparkles className="w-12 h-12 text-white" />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-black text-gray-900 text-center mb-2">
        Cá nhân hóa AI trước nhé!
      </h1>
      <p className="text-gray-500 text-sm text-center mb-8 max-w-xs leading-relaxed">
        Để AI gợi ý trang phục <strong>đúng với bạn</strong>, chúng tôi cần biết thêm một chút về cơ thể bạn.
      </p>

      {/* Why fields */}
      <div className="w-full max-w-xs space-y-3 mb-8">
        <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm border border-gray-100">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Giới tính</p>
            <p className="text-xs text-gray-400">Lọc đúng trang phục nam / nữ</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
        </div>

        <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm border border-gray-100">
          <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Ruler className="w-4.5 h-4.5 text-pink-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Số đo cơ thể</p>
            <p className="text-xs text-gray-400">Gợi ý phong cách phù hợp vóc dáng</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate("/profile?openBodyPanel=1&returnTo=/scan")}
        className="w-full max-w-xs py-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white font-bold text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        Cá nhân hóa ngay
        <ArrowRight className="w-5 h-5" />
      </button>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Chỉ mất khoảng 30 giây · Có thể chỉnh sửa sau
      </p>
    </div>
  );
}
