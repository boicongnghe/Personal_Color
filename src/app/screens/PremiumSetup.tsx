import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export function PremiumSetup() {
  const navigate = useNavigate();
  const { t, user, updateUser } = useAppContext();
  
  const [formData, setFormData] = useState({
    height: user.preferences?.height || "",
    weight: user.preferences?.weight || "",
    age: user.preferences?.age || "",
    bodyShape: user.preferences?.bodyShape || "Hourglass",
    budget: user.preferences?.budget || "1,000,000",
  });

  const bodyShapes = ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"];
  const budgets = ["500,000", "1,000,000", "2,000,000", "5,000,000+"];

  const handleSave = () => {
    updateUser({
      ...user,
      preferences: formData
    });
    alert(t("saveSettings"));
    navigate("/home");
  };

  return (
    <div className="min-h-full bg-white pb-12">
      <div className="px-6 pt-8 pb-6 bg-gradient-to-b from-yellow-50 to-white">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("premiumSetupTitle")}
        </h1>
        <p className="text-gray-600">
          {t("premiumSetupDesc")}
        </p>
      </div>

      <div className="px-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("height")}</label>
            <input 
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({...formData, height: e.target.value})}
              placeholder="165"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("weight")}</label>
            <input 
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              placeholder="55"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("age")}</label>
          <input 
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            placeholder="25"
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("bodyShape")}</label>
          <div className="flex flex-wrap gap-2">
            {bodyShapes.map(shape => (
              <button
                key={shape}
                onClick={() => setFormData({...formData, bodyShape: shape})}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.bodyShape === shape 
                    ? "bg-yellow-500 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("budget")} (VNĐ)</label>
          <div className="flex flex-wrap gap-2">
            {budgets.map(budget => (
              <button
                key={budget}
                onClick={() => setFormData({...formData, budget})}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.budget === budget 
                    ? "bg-yellow-500 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {budget}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-4 mt-8 bg-yellow-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-6 h-6" />
          {t("savePreferences")}
        </button>
      </div>
    </div>
  );
}