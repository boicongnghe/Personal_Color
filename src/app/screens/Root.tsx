import { Outlet, useLocation } from "react-router";
import { useAnalytics } from "../../hooks/useAnalytics";

export function Root() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useAnalytics(!isAdmin);

  if (isAdmin) {
    return <Outlet />;
  }

  return (
    <div
      className="bg-gray-50 flex items-center justify-center font-sans w-full"
      style={{ minHeight: "100dvh" }}
    >
      <div
        className="w-full sm:max-w-[480px] bg-white relative shadow-2xl overflow-hidden [&>div]:h-full [&>div]:overflow-y-auto [&>div]:overflow-x-hidden"
        style={{ height: "100dvh" }}
      >
        <Outlet />
      </div>
    </div>
  );
}