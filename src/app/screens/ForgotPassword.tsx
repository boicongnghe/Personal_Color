import { useNavigate } from "react-router";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";

export function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useAppContext();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
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
        <p className="text-gray-600 text-center mb-8 max-w-sm">
          {t("resetLinkSent")} <span className="font-semibold">{email}</span>
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full max-w-sm py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          {t("backToLogin")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <button
          onClick={() => navigate("/login")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("forgotPasswordTitle")}</h1>
        <p className="text-gray-600 mb-8">
          {t("forgotPasswordDesc")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            {t("sendResetLink")}
          </button>
        </form>
      </div>
    </div>
  );
}