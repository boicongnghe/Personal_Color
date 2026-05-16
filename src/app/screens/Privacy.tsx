import { useNavigate } from "react-router";
import { ArrowLeft, ShieldCheck, Lock, Eye } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export function Privacy() {
  const navigate = useNavigate();
  const { t } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t("privacyPolicy")}</h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-gray-500 text-sm">Last updated: October 2023</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Data Collection</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              We collect information you provide directly to us, such as when you create an account, scan your face for color analysis, or save outfits to your wardrobe. Face scan data is processed locally when possible and securely deleted after analysis.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Data Security</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              We implement appropriate technical and organizational measures to protect the security of your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
