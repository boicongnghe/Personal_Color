import { useNavigate } from "react-router";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";

export function Login() {
  const navigate = useNavigate();
  const { t, login } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => {
    const e = new URLSearchParams(window.location.search).get("error");
    return e ? "Đăng nhập với mạng xã hội thất bại. Vui lòng thử lại." : "";
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    if (result.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-x-hidden">
      {/* Header */}
      <div className="px-6 pb-6" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors bg-white/70 shadow-sm"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("welcomeBackLogin")}</h1>
        <p className="text-gray-600 mb-6 text-sm">{t("signInContinue")}</p>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("emailLabel")}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder={t("emailPlaceholder")}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 shadow-sm"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder={t("passwordPlaceholder")}
                className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl border-2 border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {t("forgotPassword")}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all mt-6 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang đăng nhập...
              </>
            ) : t("signIn")}
          </button>
        </form>

        {/* Social Login */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-r from-pink-50 to-purple-50 text-gray-500">{t("orContinueWith")}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/google`; }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-purple-100 rounded-2xl hover:bg-purple-50 transition-colors shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{t("google")}</span>
            </button>

            <button
              onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/facebook`; }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-purple-100 rounded-2xl hover:bg-purple-50 transition-colors shadow-sm">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{t("facebook")}</span>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-8 text-gray-600">
          {t("dontHaveAccount")}{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-purple-600 font-semibold hover:text-purple-700"
          >
            {t("signUp")}
          </button>
        </p>
      </div>
    </div>
  );
}