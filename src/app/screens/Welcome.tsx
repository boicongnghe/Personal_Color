import { useNavigate } from "react-router";
import { Sparkles, Palette, Shirt } from "lucide-react";
import { motion } from "motion/react";
import logoUrl from "../../assets/logo.png";

export function Welcome() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "Phân tích màu AI",
      description: "Khám phá bảng màu hoàn hảo của bạn với công nghệ AI tiên tiến",
    },
    {
      icon: Palette,
      title: "Kết quả cá nhân hóa",
      description: "Nhận gợi ý màu sắc tối ưu phù hợp với làn da người Việt",
    },
    {
      icon: Shirt,
      title: "Tư vấn phong cách thông minh",
      description: "Tìm trang phục hoàn hảo phù hợp với bảng màu riêng của bạn",
    },
  ];

  return (
    <div
      className="bg-gradient-to-br from-pink-50 via-purple-50 via-blue-50 to-yellow-50 flex flex-col items-center px-5 overflow-y-auto"
      style={{
        minHeight: '100dvh',
        paddingTop: 'max(3rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Logo + Features — grouped at top */}
      <div className="w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center w-full mt-4 mb-8"
        >
          <div className="w-24 h-24 rounded-2xl mx-auto mb-4 shadow-lg overflow-hidden">
            <img src={logoUrl} alt="Clarity" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clarity</h1>
          <p className="text-gray-600 text-base">Người hướng dẫn màu sắc cá nhân của bạn</p>
        </motion.div>

        <div className="space-y-5 w-full max-w-sm">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Buttons — mt-auto ghim xuống đáy, khoảng cách tối thiểu 32px */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full max-w-sm space-y-3 mt-auto pt-8"
      >
        <button
          onClick={() => navigate("/signup")}
          className="w-full py-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-shadow"
        >
          Bắt đầu ngay
        </button>
        <button
          onClick={() => navigate("/login")}
          className="w-full py-4 bg-white text-purple-600 rounded-2xl font-bold text-base border-2 border-purple-300 hover:bg-purple-50 transition-colors"
        >
          Tôi đã có tài khoản
        </button>
      </motion.div>
    </div>
  );
}