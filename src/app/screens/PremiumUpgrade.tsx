import { useNavigate } from "react-router";
import { ArrowLeft, Crown, Check, Sparkles, Camera, Palette, TrendingUp, Zap, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { createUpgradePayment, checkPaymentStatus } from "../../api/api";

const PLANS = [
  {
    id: "1m",
    label: "1 Tháng",
    price: 50000,
    priceDisplay: "50.000",
    perMonth: "50.000",
    months: 1,
    badge: null,
    saving: null,
    gradient: "from-purple-400 to-pink-400",
    bg: "bg-white",
    border: "border-2 border-purple-200",
  },
  {
    id: "3m",
    label: "3 Tháng",
    price: 135000,
    priceDisplay: "135.000",
    perMonth: "45.000",
    months: 3,
    badge: "Phổ biến",
    saving: "Tiết kiệm 10%",
    gradient: "from-purple-500 via-pink-400 to-blue-400",
    bg: "bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400",
    border: "border-0",
  },
  {
    id: "6m",
    label: "6 Tháng",
    price: 240000,
    priceDisplay: "240.000",
    perMonth: "40.000",
    months: 6,
    badge: "Tiết kiệm nhất",
    saving: "Tiết kiệm 20%",
    gradient: "from-amber-400 to-yellow-400",
    bg: "bg-white",
    border: "border-2 border-amber-200",
  },
];

const FEATURES = [
  { icon: Sparkles, title: "Phân tích AI chuyên sâu", description: "Nhận phân tích chi tiết về vóc dáng và sở thích phong cách" },
  { icon: Camera, title: "Trợ lý trang phục thông minh", description: "Tải ảnh quần áo lên và nhận gợi ý phối đồ từ AI" },
  { icon: Palette, title: "Quản lý tủ đồ cá nhân", description: "Tự động kết hợp trang phục từ tủ đồ hiện tại của bạn" },
  { icon: TrendingUp, title: "Tư vấn cho người khác", description: "Giúp bạn bè và người thân tìm ra phong cách hoàn hảo" },
];

const BENEFITS = [
  "Không giới hạn số lần phân tích màu sắc",
  "Kết hợp trang phục thông minh",
  "Gợi ý tủ đồ từ AI",
  "Tư vấn phong cách cho người khác",
  "Hỗ trợ khách hàng ưu tiên",
  "Mẹo thời trang độc quyền",
];

type QRData = {
  qrUrl: string;
  plan: string;
  amount: number;
  duration: number;
  label: string;
  bankName?: string;
  accountNumber?: string;
  accountOwner?: string;
  transferNote?: string;
  orderId?: string;
  // SePay fields
  orderInvoice?: string;
  checkoutURL?: string;
  fields?: Record<string, string>;
  expiresAt?: string;
};

type PayStatus = 'idle' | 'pending' | 'success' | 'expired';

export function PremiumUpgrade() {
  const navigate = useNavigate();
  const { t, updateUser, refreshUser } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState("3m");
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);

  // SePay auto-polling state
  const [orderData, setOrderData] = useState<QRData | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [payStatus, setPayStatus] = useState<PayStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current)  clearInterval(pollRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const startCountdown = (expiresAt?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const target = expiresAt ? new Date(expiresAt).getTime() : Date.now() + 600_000;
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((target - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        // Do NOT stop polling here — IPN can arrive after the UI countdown ends.
        // Polling continues for up to 5 more minutes (handled inside startPolling).
        setPayStatus('expired');
      }
    }, 1000);
  };

  const startPolling = (orderInvoice: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    // Poll for up to 15 minutes total regardless of UI countdown
    const pollDeadline = Date.now() + 15 * 60 * 1000;
    pollRef.current = setInterval(async () => {
      try {
        const res = await checkPaymentStatus(orderInvoice);
        const { status } = res.data?.data ?? {};

        if (status === 'active') {
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          setPayStatus('success');
          // Sync premium status from server (not just local state)
          await refreshUser().catch(() => updateUser({ isPremium: true }));
          setTimeout(() => {
            setShowQR(false);
            navigate("/home", { replace: true });
          }, 800);
          return;
        }

        // Stop polling only after 15-minute hard deadline
        if (Date.now() > pollDeadline) {
          clearInterval(pollRef.current!);
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 3000);
  };

  const activePlan = PLANS.find((p) => p.id === selectedPlan)!;

  const handleUpgradeClick = async () => {
    try {
      const res = await createUpgradePayment(selectedPlan);
      const data = res.data?.data as QRData;
      setOrderData(data);
      setQrData(data);
      setPayStatus('pending');
      setSecondsLeft(600);
      setShowQR(true);
      startCountdown(data.expiresAt);
      const invoice = data.orderInvoice ?? data.orderId ?? '';
      if (invoice) startPolling(invoice);
    } catch {
      setShowQR(true);
    }
  };


  return (
    <div className="min-h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-12">
      {/* Header */}
      <div className="px-6 pt-10 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-purple-50 transition-colors mb-6"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("premiumTitle")}</h1>
          <p className="text-gray-500">{t("premiumDesc")}</p>
        </motion.div>
      </div>

      {/* Pricing Plans */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Chọn gói phù hợp với bạn</h2>

        <div className="space-y-3">
          {PLANS.map((plan, idx) => {
            const isSelected = selectedPlan === plan.id;
            const isHighlight = plan.id === "3m";

            return (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full relative rounded-2xl overflow-hidden transition-all duration-200 ${
                  isHighlight
                    ? isSelected
                      ? "shadow-2xl scale-[1.02]"
                      : "shadow-md opacity-90"
                    : isSelected
                    ? "shadow-lg scale-[1.01]"
                    : "shadow-sm opacity-80"
                }`}
              >
                {/* Card background */}
                {isHighlight ? (
                  <div className="bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 p-[2px] rounded-2xl">
                    <div className={`rounded-[14px] p-4 ${isSelected ? "bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400" : "bg-white"}`}>
                      <PlanCardContent plan={plan} isSelected={isSelected} isHighlight={isHighlight} />
                    </div>
                  </div>
                ) : (
                  <div className={`${plan.border} rounded-2xl p-4 bg-white ${isSelected ? "bg-gradient-to-br from-purple-50 to-pink-50" : ""}`}>
                    <PlanCardContent plan={plan} isSelected={isSelected} isHighlight={false} />
                  </div>
                )}

                {/* Selected ring */}
                {isSelected && !isHighlight && (
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-purple-400 pointer-events-none" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-6 mb-8">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleUpgradeClick}
          className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          Nâng cấp ngay — {activePlan.priceDisplay}đ
        </motion.button>
        <p className="text-center text-xs text-gray-400 mt-2">
          Hủy bất kỳ lúc nào • Không ràng buộc
        </p>
      </div>

      {/* Features */}
      <div className="px-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tính năng Premium</h2>
        <div className="space-y-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 flex items-start gap-4"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-0.5">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="px-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tất cả quyền lợi Premium</h2>
          <div className="space-y-3">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-sm text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="px-6 mb-8">
        <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 rounded-3xl p-6 border border-purple-100">
          <div className="flex gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-800 italic text-sm mb-3">
            "Gói Premium đã hoàn toàn thay đổi cách tôi mua sắm! AI hiểu chính xác những gì phù hợp với tôi và tôi đã tiết kiệm được rất nhiều tiền."
          </p>
          <p className="text-xs text-gray-500 font-semibold">— Linh N., Người dùng Premium</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="px-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Câu hỏi thường gặp</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
            <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Tôi có thể hủy bất cứ lúc nào không?</h3>
            <p className="text-xs text-gray-500">Có! Bạn có thể hủy đăng ký bất cứ lúc nào mà không bị phạt.</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
            <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Bạn chấp nhận phương thức thanh toán nào?</h3>
            <p className="text-xs text-gray-500">Chúng tôi chấp nhận chuyển khoản ngân hàng qua mã QR tiện lợi.</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
            <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Gói 3 và 6 tháng có ưu đãi gì?</h3>
            <p className="text-xs text-gray-500">Gói 3 tháng tiết kiệm 10% (45k/tháng), gói 6 tháng tiết kiệm 20% (40k/tháng) so với gói tháng.</p>
          </div>
        </div>
      </div>

      {/* QR Payment Dialog */}
      <Dialog open={showQR} onOpenChange={(open) => { if (!open && payStatus !== 'success') setShowQR(false); }}>
        <DialogContent className="sm:max-w-md mx-4 rounded-3xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">{t("paymentTitle")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2 relative">
            {/* Success overlay */}
            {payStatus === 'success' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 rounded-2xl gap-3">
                <div className="text-5xl">✅</div>
                <p className="text-lg font-bold text-green-600 text-center">Thanh toán thành công!<br />Đang nâng cấp...</p>
              </div>
            )}

            {/* Expired overlay — still polling in background */}
            {payStatus === 'expired' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 rounded-2xl gap-3 px-4">
                <div className="text-5xl">⏳</div>
                <p className="text-base font-semibold text-orange-500 text-center">Đã chuyển tiền rồi?</p>
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Hệ thống vẫn đang chờ xác nhận từ SePay.<br />
                  Nếu bạn đã thanh toán, vui lòng đợi thêm vài phút — trang sẽ tự cập nhật.
                </p>
                <button
                  onClick={() => { setShowQR(false); setPayStatus('idle'); setOrderData(null); setQrData(null); }}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm mt-1"
                >
                  Đóng & tạo đơn mới
                </button>
              </div>
            )}

            {/* Plan summary */}
            <div className="w-full bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Gói đã chọn</p>
                <p className="font-bold text-gray-900">{activePlan.label}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Tổng tiền</p>
                <p className="font-bold text-purple-600 text-lg">{activePlan.priceDisplay}đ</p>
              </div>
            </div>

            {/* Countdown timer */}
            {payStatus === 'pending' && (
              <div className="w-full flex items-center justify-center gap-2">
                <span className="text-xs text-gray-500">Hết hạn sau:</span>
                <span className={`font-mono font-bold text-sm ${secondsLeft <= 60 ? 'text-red-500' : 'text-purple-600'}`}>
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-xs text-gray-400 animate-pulse">• Đang chờ thanh toán...</span>
              </div>
            )}

            <p className="text-gray-500 text-sm text-center">{t("paymentDesc")}</p>

            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
              <img
                src={orderData?.qrUrl ?? qrData?.qrUrl}
                alt="QR Code"
                className="w-48 h-48 object-cover rounded-xl"
              />
            </div>

            <div className="w-full bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ngân hàng:</span>
                <span className="font-bold text-gray-900">{qrData?.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("accountHolder")}:</span>
                <span className="font-bold text-gray-900">{qrData?.accountOwner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("bankAccount")}:</span>
                <span className="font-bold text-gray-900">{qrData?.accountNumber}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
                <span className="text-gray-500">Nội dung CK:</span>
                <span className="font-bold text-purple-600">
                  {qrData?.transferNote ?? orderData?.orderInvoice ?? qrData?.orderInvoice}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số tiền:</span>
                <span className="font-bold text-yellow-600">{activePlan.priceDisplay} VNĐ</span>
              </div>
            </div>

          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Sub-component for plan card content ─── */
interface PlanCardContentProps {
  plan: typeof PLANS[number];
  isSelected: boolean;
  isHighlight: boolean;
}

function PlanCardContent({ plan, isSelected, isHighlight }: PlanCardContentProps) {
  const textColor = isHighlight && isSelected ? "text-white" : "text-gray-900";
  const subColor  = isHighlight && isSelected ? "text-white/80" : "text-gray-500";

  return (
    <div className="flex items-center gap-3">
      {/* Radio dot */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          isSelected
            ? isHighlight
              ? "border-white bg-white"
              : "border-purple-500 bg-purple-500"
            : isHighlight
            ? "border-white/60 bg-transparent"
            : "border-gray-300 bg-transparent"
        }`}
      >
        {isSelected && (
          <div className={`w-2 h-2 rounded-full ${isHighlight ? "bg-purple-500" : "bg-white"}`} />
        )}
      </div>

      {/* Plan info */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`font-bold ${textColor}`}>{plan.label}</span>
          {plan.badge && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isHighlight && isSelected
                  ? "bg-white/20 text-white"
                  : plan.id === "3m"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {plan.badge}
            </span>
          )}
        </div>
        {plan.saving && (
          <p className={`text-xs font-medium ${isHighlight && isSelected ? "text-white/70" : "text-green-600"}`}>
            {plan.saving}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="text-right">
        <p className={`font-bold text-lg leading-tight ${textColor}`}>{plan.priceDisplay}đ</p>
        <p className={`text-xs ${subColor}`}>{plan.perMonth}đ/tháng</p>
      </div>
    </div>
  );
}
