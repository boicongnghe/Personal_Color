import { useNavigate } from "react-router";
import { ArrowLeft, ShieldCheck, Eye, Lock, Database, Share2, UserCheck } from "lucide-react";

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

export function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pb-10 overflow-x-hidden">
      <div className="px-5 pb-4 bg-white shadow-sm border-b border-gray-100" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Chính sách bảo mật</h1>
        </div>
      </div>

      <div className="px-6 py-8 space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-500 text-xs">Cập nhật lần cuối: tháng 5/2025</p>
          <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto">
            Clarity cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn.
          </p>
        </div>

        <Section icon={Database} color="bg-blue-500" title="1. Dữ liệu chúng tôi thu thập">
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800">Thông tin tài khoản:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Email, tên hiển thị, ảnh đại diện</li>
                <li>Mật khẩu (được mã hóa bcrypt, không lưu bản rõ)</li>
                <li>Thông tin đăng nhập mạng xã hội (Google/Facebook ID)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Dữ liệu phân tích:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Ảnh khuôn mặt (dùng để phân tích, không lưu vĩnh viễn)</li>
                <li>Số đo cơ thể: chiều cao, cân nặng, số đo 3 vòng, vóc dáng</li>
                <li>Kết quả phân tích: seasonal type, undertone, hình dạng khuôn mặt</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Dữ liệu sử dụng:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Lịch sử quét màu da, tủ đồ cá nhân</li>
                <li>Sản phẩm yêu thích, lịch sử click affiliate</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section icon={Eye} color="bg-indigo-500" title="2. Mục đích sử dụng dữ liệu">
          <ul className="list-disc list-inside space-y-1">
            <li>Cung cấp và cá nhân hóa dịch vụ phân tích màu sắc</li>
            <li>Gợi ý trang phục và sản phẩm phù hợp với bảng màu của bạn</li>
            <li>Quản lý tài khoản và xác thực danh tính</li>
            <li>Xử lý thanh toán gói Premium</li>
            <li>Cải thiện độ chính xác của thuật toán AI</li>
            <li>Gửi thông báo liên quan đến tài khoản (đặt lại mật khẩu, hết hạn gói)</li>
          </ul>
        </Section>

        <Section icon={Lock} color="bg-green-500" title="3. Bảo mật dữ liệu">
          <ul className="list-disc list-inside space-y-1">
            <li>Mật khẩu được mã hóa một chiều bằng <strong>bcrypt</strong></li>
            <li>Xác thực bằng <strong>JWT token</strong> có thời hạn 7 ngày</li>
            <li>Kết nối HTTPS mã hóa toàn bộ dữ liệu truyền tải</li>
            <li>Dữ liệu lưu trên <strong>MongoDB Atlas</strong> với kiểm soát truy cập nghiêm ngặt</li>
            <li>Ảnh khuôn mặt chỉ được xử lý để phân tích, không chia sẻ cho bên thứ ba</li>
          </ul>
        </Section>

        <Section icon={Share2} color="bg-orange-400" title="4. Chia sẻ dữ liệu">
          <p>Clarity <strong>không bán</strong> dữ liệu cá nhân của bạn. Dữ liệu chỉ được chia sẻ trong các trường hợp:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Shopee / TikTok Shop:</strong> link affiliate có mã tracking (không chứa thông tin cá nhân)</li>
            <li><strong>Google / Facebook:</strong> chỉ khi bạn chọn đăng nhập bằng mạng xã hội</li>
            <li><strong>Yêu cầu pháp lý:</strong> khi có lệnh từ cơ quan có thẩm quyền</li>
          </ul>
        </Section>

        <Section icon={UserCheck} color="bg-purple-500" title="5. Quyền của bạn">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Truy cập:</strong> xem toàn bộ dữ liệu trong phần Hồ sơ</li>
            <li><strong>Chỉnh sửa:</strong> cập nhật thông tin cá nhân bất kỳ lúc nào</li>
            <li><strong>Xóa:</strong> xóa tài khoản và toàn bộ dữ liệu trong Cài đặt</li>
            <li><strong>Rút quyền:</strong> huỷ liên kết Google/Facebook trong phần cài đặt tài khoản</li>
          </ul>
          <p className="mt-2 text-xs text-gray-400">
            Sau khi xóa tài khoản, dữ liệu sẽ được xóa vĩnh viễn trong vòng 30 ngày.
          </p>
        </Section>

        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <p className="text-sm font-semibold text-blue-800 mb-1">Liên hệ về quyền riêng tư</p>
          <p className="text-sm text-blue-700">
            Mọi yêu cầu liên quan đến dữ liệu cá nhân, vui lòng liên hệ:{" "}
            <span className="font-semibold">privacy@clarityapp.vn</span>
          </p>
        </div>
      </div>
    </div>
  );
}
