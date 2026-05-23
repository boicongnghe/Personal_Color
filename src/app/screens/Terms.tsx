import { useNavigate } from "react-router";
import { ArrowLeft, FileText, CreditCard, AlertCircle, ShoppingBag, UserX } from "lucide-react";

const Section = ({ icon: Icon, color, title, children }: {
  icon: any; color: string; title: string; children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
    <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

export function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="px-6 pt-12 pb-6 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Điều khoản dịch vụ</h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-500 text-xs">Cập nhật lần cuối: tháng 5/2025</p>
          <p className="text-gray-500 text-xs mt-1">
            Bằng cách đăng ký tài khoản, bạn đồng ý với các điều khoản dưới đây.
          </p>
        </div>

        <Section icon={FileText} color="bg-purple-500" title="1. Dịch vụ cung cấp">
          <p>
            Clarity là ứng dụng phân tích màu sắc cá nhân (personal color analysis) dựa trên AI, cung cấp:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Phân tích tông màu da, hình dạng khuôn mặt, vóc dáng</li>
            <li>Gợi ý trang phục theo seasonal color theory</li>
            <li>Quản lý tủ đồ cá nhân</li>
            <li>Tư vấn phong cách thông minh bằng AI</li>
          </ul>
          <p className="mt-2 text-xs text-gray-400">
            Kết quả phân tích mang tính chất tham khảo, không phải tư vấn y tế hay chuyên môn thời trang chuyên nghiệp.
          </p>
        </Section>

        <Section icon={CreditCard} color="bg-pink-500" title="2. Gói dịch vụ & Thanh toán">
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800">Gói Miễn phí:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>1 lần quét màu da/tháng</li>
                <li>Xem kết quả season cơ bản</li>
                <li>3 gợi ý trang phục</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Gói Premium:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>50.000đ/tháng · 135.000đ/3 tháng · 240.000đ/6 tháng</li>
                <li>Quét không giới hạn, đầy đủ tính năng</li>
                <li>Gợi ý cá nhân hóa đầy đủ + affiliate links</li>
              </ul>
            </div>
            <p className="text-xs text-gray-400">
              Thanh toán qua chuyển khoản ngân hàng (MBBank). Gói được kích hoạt sau khi xác nhận thanh toán. Không hoàn tiền sau khi đã kích hoạt.
            </p>
          </div>
        </Section>

        <Section icon={ShoppingBag} color="bg-orange-400" title="3. Liên kết Affiliate">
          <p>
            Clarity tích hợp liên kết affiliate từ <strong>Shopee</strong> và <strong>TikTok Shop</strong>. Khi bạn mua sản phẩm qua các liên kết này, Clarity có thể nhận hoa hồng từ sàn thương mại điện tử.
          </p>
          <p className="mt-2">
            Giá sản phẩm <strong>không thay đổi</strong> khi bạn mua qua liên kết affiliate. Chúng tôi chỉ gợi ý sản phẩm phù hợp với bảng màu của bạn, không chịu trách nhiệm về chất lượng sản phẩm từ bên thứ ba.
          </p>
        </Section>

        <Section icon={AlertCircle} color="bg-yellow-500" title="4. Trách nhiệm người dùng">
          <ul className="list-disc list-inside space-y-1">
            <li>Cung cấp thông tin chính xác khi đăng ký</li>
            <li>Bảo mật thông tin tài khoản, không chia sẻ mật khẩu</li>
            <li>Không sử dụng dịch vụ cho mục đích vi phạm pháp luật</li>
            <li>Không cố tình gian lận hệ thống thanh toán hoặc quét màu</li>
            <li>Chỉ upload ảnh của chính bạn hoặc có quyền sử dụng</li>
          </ul>
        </Section>

        <Section icon={UserX} color="bg-red-400" title="5. Chấm dứt & Xóa tài khoản">
          <p>
            Bạn có thể xóa tài khoản bất kỳ lúc nào trong mục Cài đặt. Khi xóa tài khoản:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Toàn bộ dữ liệu cá nhân sẽ bị xóa vĩnh viễn</li>
            <li>Gói Premium (nếu còn hạn) sẽ không được hoàn tiền</li>
            <li>Lịch sử quét và tủ đồ sẽ không thể khôi phục</li>
          </ul>
          <p className="mt-2">
            Clarity có quyền tạm khóa tài khoản vi phạm điều khoản mà không cần thông báo trước.
          </p>
        </Section>

        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
          <p className="text-sm font-semibold text-purple-800 mb-1">Liên hệ hỗ trợ</p>
          <p className="text-sm text-purple-700">
            Nếu có thắc mắc về điều khoản, vui lòng liên hệ:{" "}
            <span className="font-semibold">support@clarityapp.vn</span>
          </p>
        </div>
      </div>
    </div>
  );
}
