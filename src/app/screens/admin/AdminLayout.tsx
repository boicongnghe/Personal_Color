import { Outlet, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Users, DollarSign, Package, MessageCircle, LogOut } from "lucide-react";
import logoUrl from "../../../assets/logo.png";
import { useAppContext } from "../../context/AppContext";

const NAV_ITEMS = [
  { path: "/admin",          label: "Dashboard",   icon: LayoutDashboard },
  { path: "/admin/users",    label: "Người dùng",  icon: Users },
  { path: "/admin/revenue",  label: "Doanh thu",   icon: DollarSign },
  { path: "/admin/products", label: "Sản phẩm",    icon: Package },
  { path: "/admin/support",  label: "Hỗ trợ",      icon: MessageCircle },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { logout } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50 xl:flex">

      {/* ── Desktop sidebar (sticky, trong flow) ─────────── */}
      <aside className="hidden xl:flex flex-col w-60 flex-shrink-0 sticky top-0 h-screen bg-white border-r border-gray-200 z-20 overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Clarity" className="h-8 w-auto" />
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  active
                    ? "bg-purple-50 text-purple-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content (flex-1 min-w-0 để chiếm đúng phần còn lại) ── */}
      <main className="flex-1 min-w-0">
        <div className="pb-16 xl:pb-0 min-h-screen">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile bottom nav ─────────────────────────────── */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                active ? "text-purple-600" : "text-gray-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
