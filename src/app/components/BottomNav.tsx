import { useNavigate } from "react-router";
import { Home, Camera, Shirt, User, Settings } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface BottomNavProps {
  active: "home" | "scan" | "wardrobe" | "profile";
}

export function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate();
  const { t, user } = useAppContext();

  const navItems = [
    { id: "home",     icon: Home,   label: t("navHome"),     path: "/home" },
    { id: "scan",     icon: Camera, label: t("navScan"),     path: "/scan" },
    { id: "wardrobe", icon: Shirt,  label: t("navWardrobe"), path: "/wardrobe" },
    { id: "profile",  icon: User,   label: t("navProfile"),  path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-purple-100 px-6 py-3 z-50 w-full sm:absolute pb-safe shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 min-w-[60px]"
            >
              <div
                className={`p-2.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-br from-purple-100 to-pink-100 shadow-sm scale-110"
                    : "bg-transparent"
                }`}
              >
                <item.icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-purple-600" : "text-gray-400"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-semibold transition-colors ${
                  isActive ? "text-purple-600" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
        {user.role === "admin" && (
          <button
            onClick={() => navigate("/admin")}
            className="flex flex-col items-center gap-1 min-w-[60px]"
          >
            <div className="p-2.5 rounded-2xl transition-all duration-200 bg-transparent">
              <Settings className="w-6 h-6 transition-colors text-purple-500" />
            </div>
            <span className="text-xs font-semibold transition-colors text-purple-500">
              Admin
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
