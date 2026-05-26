import { useNavigate } from "react-router";
import { ArrowLeft, ChevronDown, ChevronUp, Mail, Camera, CreditCard, Shirt, User, Scan, MessageCircle } from "lucide-react";
import { useState } from "react";

type FaqItem = { q: string; a: string };
type FaqSection = { icon: any; color: string; title: string; items: FaqItem[] };

const faqSections: FaqSection[] = [
  {
    icon: Camera,
    color: "bg-purple-500",
    title: "Quét màu da & Phân tích",
    items: [
      {
        q: "Quét màu da hoạt động như thế nào?",
        a: "AI của Clarity sử dụng MediaPipe và OpenCV để phân tích tông màu da, hình dạng khuôn mặt từ ảnh bạn chụp hoặc tải lên. Kết quả phân loại theo 12 seasonal color types (Autumn, Winter, Spring, Summer).",
      },
      {
        q: "Gói miễn phí được quét mấy lần?",
        a: "Gói miễn phí được quét 1 lần/tháng. Gói Premium không giới hạn số lần quét.",
      },
      {
        q: "Làm sao để có kết quả chính xác nhất?",
        a: "Chụp ảnh ở ánh sáng tự nhiên ban ngày, không trang điểm, không đội mũ hoặc đeo kính. Đặt khuôn mặt đúng trong khung hướng dẫn.",
      },
      {
        q: "Ảnh khuôn mặt có được lưu lại không?",
        a: "Ảnh được gửi lên server để xử lý và sẽ bị xóa sau khi phân tích xong. Chúng tôi không lưu ảnh khuôn mặt vĩnh viễn.",
      },
    ],
  },
  {
    icon: Shirt,
    color: "bg-pink-500",
    title: "Tủ đồ & Gợi ý trang phục",
    items: [
      {
        q: "Làm sao thêm trang phục vào tủ đồ?",
        a: "Vào mục 'Tủ đồ' → nhấn nút '+' ở góc phải → chụp ảnh hoặc tải ảnh từ thư viện. AI sẽ tự động nhận diện loại trang phục và màu sắc.",
      },
      {
        q: "Gợi ý trang phục dựa trên gì?",
        a: "Gợi ý được tính dựa trên kết quả seasonal color type của bạn, vóc dáng, ngân sách và dịp mặc (thường ngày, công sở, dự tiệc). Bạn cần hoàn thành phân tích màu da trước.",
      },
      {
        q: "Tính năng Thử đồ ảo (Try-on) là gì?",
        a: "Tính năng Premium cho phép bạn upload ảnh bản thân và thử trang phục lên ảnh ảo để xem trước khi mua. Vào Hồ sơ → Cài đặt cơ thể để lưu ảnh người.",
      },
      {
        q: "Link mua sắm Shopee/TikTok Shop là gì?",
        a: "Clarity liên kết với Shopee và TikTok Shop để gợi ý sản phẩm phù hợp bảng màu của bạn. Giá sản phẩm không thay đổi khi mua qua link này.",
      },
    ],
  },
  {
    icon: CreditCard,
    color: "bg-amber-500",
    title: "Gói Premium & Thanh toán",
    items: [
      {
        q: "Gói Premium có những tính năng gì?",
        a: "Quét màu không giới hạn · Gợi ý trang phục đầy đủ · Thử đồ ảo · Trợ lý AI thông minh · Phân tích màu cho người khác · Lịch sử quét không giới hạn.",
      },
      {
        q: "Làm sao để nâng cấp Premium?",
        a: "Vào Trang chủ → nhấn 'Premium' → chọn gói → chuyển khoản theo thông tin hiển thị → nhấn 'Tôi đã thanh toán' và chờ xác nhận (thường dưới 5 phút).",
      },
      {
        q: "Thanh toán nhưng chưa được kích hoạt?",
        a: "Xác nhận thường xảy ra tự động trong vòng 5 phút. Nếu sau 30 phút vẫn chưa được kích hoạt, hãy liên hệ support kèm ảnh chụp màn hình biên lai chuyển khoản.",
      },
      {
        q: "Có hoàn tiền khi hủy Premium không?",
        a: "Gói Premium không hoàn tiền sau khi đã kích hoạt. Gói vẫn hoạt động đến hết thời hạn đã mua.",
      },
    ],
  },
  {
    icon: User,
    color: "bg-blue-500",
    title: "Tài khoản & Hồ sơ",
    items: [
      {
        q: "Quên mật khẩu phải làm sao?",
        a: "Tại màn hình đăng nhập → nhấn 'Quên mật khẩu?' → nhập email → kiểm tra hộp thư (cả thư mục Spam) và nhấn link đặt lại mật khẩu trong vòng 1 giờ.",
      },
      {
        q: "Đăng nhập bằng Google/Facebook không được?",
        a: "Đảm bảo trình duyệt cho phép popup. Nếu vẫn lỗi, thử đăng nhập bằng email/mật khẩu hoặc tạo tài khoản mới bằng email.",
      },
      {
        q: "Cập nhật thông tin cơ thể ở đâu?",
        a: "Vào Hồ sơ → nhấn nút chỉnh sửa (bút chì) → kéo xuống phần 'Thông tin cơ thể' → điền chiều cao, cân nặng, số đo 3 vòng, vóc dáng và ngân sách.",
      },
      {
        q: "Xóa tài khoản có mất dữ liệu không?",
        a: "Có — xóa tài khoản sẽ xóa vĩnh viễn toàn bộ dữ liệu bao gồm lịch sử quét, tủ đồ và hồ sơ. Dữ liệu không thể khôi phục sau khi xóa.",
      },
    ],
  },
  {
    icon: Scan,
    color: "bg-green-500",
    title: "Trợ lý AI & Tính năng khác",
    items: [
      {
        q: "Trợ lý thông minh (Smart Advisor) làm gì?",
        a: "Tải lên ảnh một bộ trang phục, AI sẽ phân tích xem bộ đồ có phù hợp với màu da, vóc dáng và dịp mặc của bạn không, kèm điểm số và gợi ý cải thiện.",
      },
      {
        q: "Phân tích cho người khác (Style Others) là gì?",
        a: "Tính năng Premium cho phép bạn tải ảnh của bất kỳ người nào để phân tích seasonal color type và nhận gợi ý trang phục phù hợp cho họ.",
      },
    ],
  },
];

function FaqCard({ section }: { section: FaqSection }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
        <div className={`w-9 h-9 ${section.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <section.icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-sm font-bold text-gray-900">{section.title}</h2>
      </div>
      {section.items.map((item, i) => (
        <div key={i} className={i !== section.items.length - 1 ? "border-b border-gray-50" : ""}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors gap-3"
          >
            <span className="text-sm font-medium text-gray-800 flex-1">{item.q}</span>
            {openIndex === i
              ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
              : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4">
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function HelpSupport() {
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trợ giúp & Hỗ trợ</h1>
            <p className="text-gray-500 text-xs mt-0.5">Câu hỏi thường gặp về Clarity</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {faqSections.map((section, i) => (
          <FaqCard key={i} section={section} />
        ))}

        {/* Contact */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-base">Vẫn cần hỗ trợ?</p>
              <p className="text-white/80 text-xs">Đội ngũ phản hồi trong 24 giờ</p>
            </div>
          </div>
          <a
            href="mailto:support@clarityapp.vn"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-3 mt-2"
          >
            <Mail className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">support@clarityapp.vn</span>
          </a>
        </div>
      </div>
    </div>
  );
}
