import { Navigate, Outlet } from "react-router";
import { useAppContext } from "../context/AppContext";

/**
 * AdminGuard — bảo vệ tất cả các route /admin/*
 * Nếu chưa đăng nhập hoặc không phải admin → chuyển về /login
 */
export function AdminGuard() {
  const { isLoggedIn, user } = useAppContext();

  if (!isLoggedIn || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
