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
    },
    {
      icon: Shirt,
      title: t("viewOutfits"),
      description: t("premiumDesc").substring(0, 30) + "...",
      gradient: "from-purple-500 to-purple-600",
      path: "/outfits",
    },
  ];

  const quickActions = [
    {
      icon: Palette,
      title: t("myColorAnalysis"),
      path: "/analysis-result",
    },
    {
      icon: Shirt,
      title: t("myWardrobe"),
      path: "/wardrobe",
    },
    {
      icon: Sparkles,
      title: t("smartAdvisor"),
      path: "/smart-advisor",
      premium: true,
    },
    {
      icon: TrendingUp,
      title: t("styleOthers"),
      path: "/style-others",
      premium: true,
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-pink-50 via-purple-50 via-blue-50 to-yellow-50 pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{t("welcomeBack")}! 👋</h1>
            <p className="text-gray-600">{user.name}</p>
          </div>
          <button
            onClick={() => navigate("/premium")}
            className="px-4 py-2 bg-gradient-to-r from-yellow-300 to-amber-400 text-white rounded-full font-semibold text-sm flex items-center gap-2 shadow-lg"
          >
            <Crown className="w-4 h-4" />
            {t("premium")}
          </button>
        </div>

        {/* Main Features */}
        <div className="space-y-4 mb-8">
          {mainFeatures.map((feature, index) => (
            <button
              key={index}
              onClick={() => navigate(feature.path)}
              className={`w-full p-6 ${index === 0 ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400' : 'bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300'} rounded-3xl shadow-lg hover:shadow-xl transition-shadow`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-white/90 text-sm">{feature.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t("quickActions")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="relative p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-purple-100"
              >
                {action.premium && (
                  <div className="absolute top-3 right-3">
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>
                )}
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-3">
                  <action.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {action.title}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {t("proTip")}
              </h3>
              <p className="text-gray-700 text-sm">
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