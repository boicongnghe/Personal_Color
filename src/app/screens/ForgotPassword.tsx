import { useNavigate } from "react-router";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { forgotPassword as apiForgotPassword } from "../../api/api";

export function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useAppContext();
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiForgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể gửi email. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {t("checkYourEmail")}
        </h1>
        <p className="text-gray-600 text-center mb-2 max-w-sm">
          {t("resetLinkSent")} <span className="font-semibold">{email}</span>
        </p>
        <p className="text-gray-400 text-sm text-center mb-8 max-w-sm">
          Link có hiệu lực trong 1 giờ. Kiểm tra cả thư mục Spam nếu không thấy.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full max-w-sm py-4 bg-gray-900 text-white rounded-2xl font-semibold text-base hover:bg-black transition-colors"
        >
          {t("backToLogin")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pb-6" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <button
          onClick={() => navigate("/login")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      <div className="px-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("forgotPasswordTitle")}</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          {t("forgotPasswordDesc")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("emailLabel")}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-2xl font-bold text-base shadow-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...</>
            ) : (
              t("sendResetLink")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
