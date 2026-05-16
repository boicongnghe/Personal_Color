import { Navigate, Outlet } from "react-router";
import { useAppContext } from "../context/AppContext";

export function RequireAuth() {
  const { isLoggedIn, authLoading } = useAppContext();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
