import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppContext } from "../context/AppContext";

export function AuthCallback() {
  const navigate = useNavigate();
  const { loginWithToken } = useAppContext();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const error  = params.get("error");

    if (error) {
      navigate("/login?error=" + error, { replace: true });
      return;
    }
    if (!token) {
      navigate("/login?error=no_token", { replace: true });
      return;
    }

    loginWithToken(token).then(({ success }) => {
      navigate(success ? "/home" : "/login?error=auth_failed", { replace: true });
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Đang đăng nhập...</p>
      </div>
    </div>
  );
}
