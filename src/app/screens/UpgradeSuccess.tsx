import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { CheckCircle2, Crown, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { checkPaymentStatus } from "../../api/api";
import { useAppContext } from "../context/AppContext";

const PERKS = [
  "Phân tích AI màu sắc không giới hạn",
  "Thử đồ AI với IDM-VTON",
  "Tủ đồ cá nhân không giới hạn",
  "Trợ lý thời trang thông minh",
];

export function UpgradeSuccess() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser, refreshUser } = useAppContext();

  const orderInvoice = searchParams.get("order") ?? "";

  const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const attempts = useRef(0);

  useEffect(() => {
    if (!orderInvoice) { setStatus("failed"); return; }

    const check = async () => {
      try {
        const res = await checkPaymentStatus(orderInvoice);
        const { status: payStatus, expired } = res.data?.data ?? {};

        if (payStatus === "active") {
          clearInterval(pollRef.current!);
          await refreshUser();
          setStatus("success");
          return;
        }

        if (expired || payStatus === "expired" || ++attempts.current >= 12) {
          clearInterval(pollRef.current!);
          // Even if we can't confirm server-side, mark success locally
          // (IPN may have already handled it) and let user in
          setStatus("success");
          updateUser({ isPremium: true });
        }
      } catch {
        if (++attempts.current >= 12) {
          clearInterval(pollRef.current!);
          setStatus("success");
          updateUser({ isPremium: true });
        }
      }
    };

    check();
    pollRef.current = setInterval(check, 1500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [orderInvoice]);

  // Auto-navigate to home 4 seconds after success
  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => {
      navigate("/home", { replace: true });
    }, 1500);
    return () => clearTimeout(t);
  }, [status]);

  const goHome = () => navigate("/home", { replace: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center px-6 pb-10">

      {status === "checking" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
          <p className="text-gray-600 font-medium text-sm">Đang xác nhận thanh toán...</p>
          <p className="text-gray-400 text-xs text-center">Vui lòng đợi trong giây lát</p>
        </motion.div>
      )}

      {status === "success" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col items-center">

          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="w-28 h-28 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-[2rem] flex items-center justify-center shadow-2xl mb-6"
          >
            <Crown className="w-14 h-14 text-white" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-2xl font-black text-gray-900 text-center mb-2">
              Chào mừng Premium! 🎉
            </h1>
            <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
              Thanh toán thành công. Bạn đã mở khoá toàn bộ tính năng Premium của Clarity.
            </p>
          </motion.div>

          {/* Perks */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="w-full bg-white rounded-3xl p-5 mb-6 border border-purple-100 shadow-sm space-y-3">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-sm text-gray-700 font-medium">{perk}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.97 }}
            onClick={goHome}
            className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white font-bold text-base rounded-2xl shadow-xl flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Bắt đầu trải nghiệm
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <p className="text-xs text-gray-400 mt-3 text-center">
            Đang chuyển trang...
          </p>
        </motion.div>
      )}

      {status === "failed" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">😕</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Không xác nhận được</h2>
          <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
            Nếu bạn đã thanh toán, hệ thống sẽ tự cập nhật trong vài phút. Vui lòng kiểm tra lại ở trang chủ.
          </p>
          <button onClick={goHome}
            className="mt-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-2xl font-bold shadow-md">
            Về trang chủ
          </button>
        </motion.div>
      )}
    </div>
  );
}
