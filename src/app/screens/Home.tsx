import { useNavigate } from "react-router";
import { Sparkles, Camera, Palette, Shirt, Crown, TrendingUp } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { useAppContext } from "../context/AppContext";

export function Home() {
  const navigate = useNavigate();
  const { user, t } = useAppContext();

  const mainFeatures = [
    {
      icon: Camera,
      title: t("scanTitle"),
      description: t("scanFace"),
      gradient: "from-blue-500 to-blue-600",
      path: "/scan",
      track: "Quét khuôn mặt",
    },
    {
      icon: Shirt,
      title: t("viewOutfits"),
      description: t("premiumDesc").substring(0, 30) + "...",
      gradient: "from-purple-500 to-purple-600",
      path: "/outfits",
      track: "Xem gợi ý outfit",
    },
  ];

  const quickActions = [
    {
      icon: Palette,
      title: t("myColorAnalysis"),
      path: "/analysis-result",
      track: "Phân tích màu của tôi",
    },
    {
      icon: Shirt,
      title: t("myWardrobe"),
      path: "/wardrobe",
      track: "Tủ đồ của tôi",
    },
    {
      icon: Sparkles,
      title: t("smartAdvisor"),
      path: "/smart-advisor",
      premium: true,
      track: "Trợ lý thông minh",
    },
    {
      icon: TrendingUp,
      title: "Thử đồ AI",
      path: "/style-others",
      premium: true,
      track: "Thử đồ AI",
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-pink-50 via-purple-50 via-blue-50 to-yellow-50 pb-nav">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-0.5 truncate">{t("welcomeBack")}! 👋</h1>
            <p className="text-gray-600 text-sm truncate">{user.name}</p>
          </div>
          <button
            onClick={() => navigate("/premium")}
            data-track="Nâng cấp Premium"
            className="px-4 py-2 bg-gradient-to-r from-yellow-300 to-amber-400 text-white rounded-full font-semibold text-sm flex items-center gap-2 shadow-lg"
          >
            <Crown className="w-4 h-4" />
            {t("premium")}
          </button>
        </div>

        {/* Main Features */}
        <div className="space-y-3 mb-6">
          {mainFeatures.map((feature, index) => (
            <button
              key={index}
              onClick={() => navigate(feature.path)}
              data-track={feature.track}
              className={`w-full p-4 ${index === 0 ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400' : 'bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300'} rounded-2xl shadow-lg hover:shadow-xl transition-shadow`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-base font-bold text-white mb-0.5 truncate">
                    {feature.title}
                  </h3>
                  <p className="text-white/90 text-xs truncate">{feature.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t("quickActions")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                data-track={action.track}
                className="relative p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-purple-100 text-left"
              >
                {action.premium && (
                  <div className="absolute top-2.5 right-2.5">
                    <Crown className="w-3.5 h-3.5 text-yellow-500" />
                  </div>
                )}
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-2">
                  <action.icon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xs font-semibold text-gray-900 leading-snug">
                  {action.title}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                {t("proTip")}
              </h3>
              <p className="text-gray-700 text-xs leading-relaxed">
                {t("proTipDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}