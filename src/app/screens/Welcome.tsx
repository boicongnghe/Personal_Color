import { useNavigate } from "react-router";
import { Sparkles, Palette, Shirt } from "lucide-react";
import { motion } from "motion/react";

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 via-blue-50 to-yellow-50 flex flex-col items-center justify-between px-6 py-12">
      {/* Logo and Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mt-12"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Clarity</h1>
        <p className="text-gray-600 text-lg">Người hướng dẫn màu sắc cá nhân của bạn</p>
      </motion.div>

      {/* Features */}
      <div className="space-y-8 w-full max-w-md">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full max-w-md space-y-3 mb-8"
      >
        <button
          onClick={() => navigate("/signup")}
          className="w-full py-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          Bắt đầu ngay
        </button>
        <button
          onClick={() => navigate("/login")}
          className="w-full py-4 bg-white text-purple-600 rounded-2xl font-semibold text-lg border-2 border-purple-300 hover:bg-purple-50 transition-colors"
        >
          Tôi đã có tài khoản
        </button>
      </motion.div>
    </div>
  );
}