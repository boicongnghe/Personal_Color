import { useNavigate } from "react-router";
import {
  ArrowLeft, Camera, FolderOpen, Send, Sparkles, Crown,
  ImageIcon, X, RotateCcw, Check, Lock, Zap,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";

/* ─────────────────────────── Types ─────────────────────────── */
type Role = "user" | "ai";
interface Msg {
  id: number;
  role: Role;
  text?: string;
  image?: string;
  analysis?: Analysis;
}
interface Analysis {
  score: number;
  suitable: boolean;
  occasion: string;
  feedback: string;
  tips: string[];
}

/* ─────────────────────── Quick prompts ─────────────────────── */
const QUICK_PROMPTS = [
  { emoji: "💼", label: "Đi làm",        context: "đi làm văn phòng" },
  { emoji: "🎉", label: "Dự tiệc",       context: "dự tiệc hoặc sự kiện" },
  { emoji: "💕", label: "Hẹn hò",        context: "hẹn hò buổi tối" },
  { emoji: "🌴", label: "Du lịch",       context: "đi du lịch nghỉ mát" },
  { emoji: "👟", label: "Dạo phố",       context: "dạo phố mua sắm cuối tuần" },
  { emoji: "🏫", label: "Đi học",        context: "đến trường / đại học" },
  { emoji: "🍽️", label: "Ăn tối",        context: "ăn tối nhà hàng lãng mạn" },
  { emoji: "💪", label: "Tập gym",       context: "tập thể dục, gym, yoga" },
  { emoji: "🎨", label: "Cafe",          context: "đi cafe hoặc triển lãm nghệ thuật" },
  { emoji: "🌸", label: "Chụp ảnh",     context: "chụp ảnh ngoài trời, sống ảo" },
];

/* ─────────────── Mock AI response engine ─────────────────── */
function buildAnalysis(occasion: string): Analysis {
  const occasions: Record<string, Partial<Analysis>> = {
    "đi làm văn phòng":           { suitable: true,  score: 90, occasion: "Công sở",             feedback: "Bộ trang phục khá chuyên nghiệp và gọn gàng, phù hợp cho môi trường công sở.",  tips: ["Thêm đồng hồ hoặc vòng tay mảnh để tăng vẻ chuyên nghiệp", "Túi tote da nhỏ màu đen hoặc nâu", "Giày bệt hoặc cao gót thấp"] },
    "dự tiệc hoặc sự kiện":       { suitable: true,  score: 94, occasion: "Dự tiệc · Sự kiện",   feedback: "Rất nổi bật và phù hợp! Bộ đồ có điểm nhấn tốt, sẽ giúp bạn tự tin trong mọi buổi tiệc.", tips: ["Clutch bag ánh kim sang trọng", "Khuyên tai vòng lớn hoặc statement jewelry", "High heel hoặc block heel"] },
    "hẹn hò buổi tối":            { suitable: true,  score: 97, occasion: "Hẹn hò · Lãng mạn",   feedback: "Tuyệt vời! Vừa gợi cảm tinh tế vừa nhẹ nhàng lãng mạn — đúng chuẩn cho buổi hẹn hò đáng nhớ!",  tips: ["Nước hoa nhẹ nhàng dạng floral", "Túi mini dây xích màu gold", "Son màu nude hoặc đỏ berry"] },
    "đi du lịch nghỉ mát":        { suitable: true,  score: 88, occasion: "Du lịch · Kỳ nghỉ",    feedback: "Thoải mái và năng động — rất phù hợp cho chuyến đi xa.",                         tips: ["Thêm cardigan đề phòng điều hòa", "Sneaker hoặc sandal êm chân", "Tote bag canvas lớn"] },
    "dạo phố mua sắm cuối tuần":  { suitable: true,  score: 92, occasion: "Thường ngày · Phố",    feedback: "Casual chic rất hợp trend! Thoải mái nhưng vẫn có điểm nhấn cá tính.",           tips: ["Cap hoặc mũ bucket trendy", "Mini bag crossbody tiện lợi", "Sneaker trắng hoặc loafer"] },
    "đến trường / đại học":        { suitable: true,  score: 86, occasion: "Đi học · Campus",      feedback: "Trẻ trung, năng động và phù hợp học đường.",                                   tips: ["Balo nhỏ hoặc tote bag", "Bomber jacket khi trời mát", "Sneaker màu pastel"] },
    "ăn tối nhà hàng lãng mạn":   { suitable: true,  score: 95, occasion: "Ăn tối · Fine Dining", feedback: "Tinh tế và sang trọng vừa đủ — hoàn hảo cho bữa tối nhà hàng.",              tips: ["Khăn lụa hoặc pearl earrings", "Ví cầm tay nhỏ màu nude", "Kitten heels sang trọng"] },
    "tập thể dục, gym, yoga":      { suitable: false, score: 62, occasion: "Thể thao · Gym",        feedback: "Chưa phù hợp lắm cho việc tập luyện — chất liệu có thể hạn chế vận động.",    tips: ["Set đồ Dry-fit hoặc Spandex thấm hút", "Giày chuyên dụng chống chấn thương", "Buộc tóc gọn gàng"] },
    "đi cafe hoặc triển lãm nghệ thuật": { suitable: true, score: 93, occasion: "Cafe · Nghệ thuật", feedback: "Aesthetic và cá tính! Rất hợp ở không gian sáng tạo, cafe thời thượng.",    tips: ["Kính mắt gọng mảnh cat-eye", "Tote bag canvas hoặc book bag", "Trench coat hoặc wide-shoulder jacket"] },
    "chụp ảnh ngoài trời, sống ảo": { suitable: true, score: 96, occasion: "Chụp ảnh · Outdoor",  feedback: "Camera-ready hoàn toàn! Màu sắc và kiểu dáng rất ăn ảnh.",                    tips: ["Thêm phụ kiện nhỏ để ảnh thêm layered", "Son tương phản nhẹ với trang phục", "Hat hoặc sunglasses nếu nắng"] },
  };
  const base = occasions[occasion] ?? { suitable: true, score: 88, occasion: "Đa dụng", feedback: "Bộ trang phục khá versatile!", tips: ["Phụ kiện đơn giản", "Giày tông trung tính", "Túi nhỏ gọn"] };
  const score = Math.min(99, (base.score ?? 88) + Math.floor(Math.random() * 5) - 2);
  return { ...(base as Analysis), score };
}

const GREET: Msg = {
  id: 0, role: "ai",
  text: "Xin chào! Mình là **Trợ lý Clarity AI** 💜\n\nHãy cho mình biết bạn cần tư vấn trang phục cho dịp gì, rồi gửi ảnh lên — mình sẽ phân tích ngay!",
};

/* ══════════════════════ PAYWALL ══════════════════════════════ */
function SmartAdvisorPaywall({ onUpgrade, onBack }: { onUpgrade: () => void; onBack: () => void }) {
  const PERKS = [
    "Tải ảnh trang phục và nhận phân tích AI tức thì",
    "Kiểm tra độ phù hợp với màu da và vóc dáng của bạn",
    "Gợi ý phối đồ chi tiết cho từng dịp",
    "Lưu lịch sử và tự động thêm vào tủ đồ",
    "Chat không giới hạn với Trợ lý Clarity AI",
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-12 pb-3 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-50 hover:bg-purple-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-gray-900">Trợ lý thông minh</h1>
              <Crown className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-400">Tính năng Premium</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center">
        {/* Lock icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 rounded-3xl flex items-center justify-center shadow-2xl mb-6 mt-4"
        >
          <Lock className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 mb-2 text-center"
        >
          Tính năng Premium
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-gray-500 text-sm text-center mb-6 max-w-xs"
        >
          Trợ lý thông minh chỉ dành cho thành viên Premium. Nâng cấp để mở khóa trải nghiệm AI đầy đủ!
        </motion.p>

        {/* Preview chat bubbles */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-white rounded-3xl p-4 mb-5 shadow-sm border border-purple-100 space-y-3"
        >
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-purple-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm max-w-[75%]">
              <p className="text-xs text-gray-700">Bộ trang phục này <strong>RẤT PHÙ HỢP</strong> cho dịp hẹn hò 💕 Điểm phù hợp: <strong>97%</strong></p>
            </div>
          </div>
          <div className="flex items-end gap-2 flex-row-reverse">
            <div className="bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm max-w-[65%] blur-[1.5px]">
              <p className="text-xs text-white">Đây có hợp với tông màu da của tôi không?</p>
            </div>
          </div>
          {/* Blur overlay on preview */}
          <div className="absolute inset-0 rounded-3xl bg-white/30 backdrop-blur-[1px] flex items-center justify-center pointer-events-none" />
        </motion.div>

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="w-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 mb-5 border border-purple-100"
        >
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-3">Trợ lý thông minh Premium bao gồm:</p>
          <div className="space-y-2.5">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700">{perk}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer CTA */}
      <div className="flex-shrink-0 px-5 pb-10 pt-3 bg-white border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onUpgrade}
          className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 mb-3"
        >
          <Zap className="w-5 h-5" />
          Nâng cấp Premium ngay
        </motion.button>
        <button onClick={onBack} className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors">
          Để sau
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════ MAIN COMPONENT ═══════════════════════ */
export function SmartAdvisor() {
  const navigate = useNavigate();
  const { t, user } = useAppContext();

  const [messages, setMessages]         = useState<Msg[]>([GREET]);
  const [inputText, setInputText]       = useState("");
  const [pendingOccasion, setPending]   = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isTyping, setIsTyping]         = useState(false);
  const [isPremiumLocked]               = useState(!user.isPremium);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const bottomRef      = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addAI = useCallback((text: string, analysis?: Analysis, delay = 1200) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now(), role: "ai", text, analysis }]);
    }, delay);
  }, []);

  const sendMessage = useCallback((text?: string, image?: string, occasion?: string) => {
    const msgText  = text  ?? inputText.trim();
    const msgImage = image ?? pendingImage ?? undefined;
    if (!msgText && !msgImage) return;
    const userMsg: Msg = { id: Date.now(), role: "user", text: msgText || undefined, image: msgImage || undefined };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setPendingImage(null);
    const occ = occasion ?? pendingOccasion ?? "";
    if (msgImage) {
      const analysis = buildAnalysis(occ);
      const replyText = analysis.suitable
        ? `✨ Phân tích xong! Bộ đồ này **RẤT PHÙ HỢP** cho dịp **${occ || "bạn chọn"}**.`
        : `🤔 Bộ đồ này **chưa lý tưởng** cho dịp **${occ || "bạn chọn"}** — mình có gợi ý phía dưới nhé!`;
      addAI(replyText, analysis, 1800);
    } else {
      const hasImg = [...messages, userMsg].some(m => m.role === "user" && m.image);
      if (!hasImg && occ) { addAI(`Tuyệt! Hãy gửi ảnh bộ đồ cho dịp **${occ}** nhé! 📸`, undefined, 800); }
      else if (!hasImg) { addAI("Bạn muốn mặc gì hôm nay? Chọn dịp bên dưới hoặc kể mình nghe bạn đi đâu! 😊", undefined, 800); }
    }
  }, [inputText, pendingImage, pendingOccasion, messages, addAI]);

  const handleQuickPrompt = (ctx: string, label: string) => {
    setPending(ctx);
    const userMsg: Msg = { id: Date.now(), role: "user", text: `${label} — ${ctx}` };
    setMessages((prev) => [...prev, userMsg]);
    addAI(`Tuyệt! Tư vấn trang phục cho dịp **${ctx}** ✨\n\nGửi ảnh bộ đồ lên, mình sẽ phân tích ngay!`, undefined, 700);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImage(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  /* ── Paywall gate ── */
  if (isPremiumLocked) {
    return <SmartAdvisorPaywall onUpgrade={() => navigate("/premium")} onBack={() => navigate(-1)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* ─── Header ─── */}
      <div className="flex-shrink-0 px-4 pt-12 pb-3 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-50 hover:bg-purple-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-gray-900">{t("smartAdvisor")}</h1>
              <Crown className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-gray-500">Clarity AI • Đang hoạt động</p>
            </div>
          </div>
          <button onClick={() => { setMessages([GREET]); setPending(null); setPendingImage(null); }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ─── Messages ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)}

        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-purple-100">
                <div className="flex gap-1 items-center">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                      className="w-2 h-2 rounded-full bg-purple-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.length <= 2 && !isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pb-1">
            <p className="text-xs text-gray-400 text-center mb-3">Chọn dịp để bắt đầu nhanh</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map((qp) => (
                <button key={qp.label} onClick={() => handleQuickPrompt(qp.context, qp.label)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-2xl text-sm font-semibold text-gray-700 border border-purple-100 shadow-sm hover:bg-purple-50 hover:border-purple-300 transition-all">
                  <span>{qp.emoji}</span> {qp.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ─── Pending image preview ─── */}
      <AnimatePresence>
        {pendingImage && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="flex-shrink-0 px-4 py-2 bg-white/90 border-t border-purple-100">
            <div className="relative inline-block">
              <img src={pendingImage} alt="preview" className="h-20 w-20 object-cover rounded-xl border-2 border-purple-300" />
              <button onClick={() => setPendingImage(null)} className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1 bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Ảnh</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Quick prompts strip ─── */}
      <div className="flex-shrink-0 bg-white/80 border-t border-purple-50 px-3 py-2">
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {QUICK_PROMPTS.map((qp) => (
            <button key={qp.label} onClick={() => handleQuickPrompt(qp.context, qp.label)}
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                pendingOccasion === qp.context
                  ? "bg-gradient-to-r from-purple-500 to-pink-400 text-white border-transparent shadow-md"
                  : "bg-white text-gray-600 border-purple-100 hover:bg-purple-50"
              }`}>
              <span>{qp.emoji}</span> {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Input bar ─── */}
      <div className="flex-shrink-0 px-3 pb-6 pt-2 bg-white border-t border-purple-100">
        <div className="flex items-end gap-2">
          <input ref={fileInputRef}   type="file" accept="image/*"              className="hidden" onChange={handleFile} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-2xl flex items-center justify-center transition-colors">
              <FolderOpen className="w-5 h-5" />
            </button>
            <button onClick={() => cameraInputRef.current?.click()} className="w-10 h-10 bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-2xl flex items-center justify-center transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 bg-gray-50 border-2 border-purple-100 rounded-2xl px-4 py-2.5 focus-within:border-purple-300 transition-colors">
            <textarea ref={textareaRef} value={inputText} onChange={handleInput}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={pendingOccasion ? `Hỏi về trang phục ${pendingOccasion}...` : "Nhập câu hỏi hoặc chọn dịp..."}
              rows={1} className="w-full bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400"
              style={{ maxHeight: 120 }} />
          </div>
          <button onClick={() => sendMessage()} disabled={!inputText.trim() && !pendingImage}
            className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════ ChatBubble ═══════════════════════════ */
function ChatBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[78%] space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {msg.image && (
          <div className={`rounded-2xl overflow-hidden shadow-md ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}>
            <img src={msg.image} alt="outfit" className="max-w-[220px] max-h-[280px] w-full object-cover" />
          </div>
        )}
        {msg.text && (
          <div className={`px-4 py-3 rounded-2xl shadow-sm ${isUser ? "bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 text-white rounded-br-sm" : "bg-white text-gray-800 border border-purple-100 rounded-bl-sm"}`}>
            <FormattedText text={msg.text} />
          </div>
        )}
        {msg.analysis && <AnalysisCard analysis={msg.analysis} />}
      </div>
    </motion.div>
  );
}

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) => part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>)}
    </p>
  );
}

function AnalysisCard({ analysis }: { analysis: Analysis }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
      className="w-full max-w-xs bg-white rounded-2xl shadow-md border border-purple-100 overflow-hidden">
      <div className={`px-4 py-3 flex items-center gap-3 ${analysis.suitable ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-orange-400 to-red-400"}`}>
        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0">
          {analysis.suitable ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">{analysis.suitable ? "Rất phù hợp! 🎉" : "Chưa lý tưởng 🤔"}</p>
          <p className="text-white/80 text-xs">{analysis.occasion}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white font-bold text-xl">{analysis.score}%</p>
          <p className="text-white/70 text-[10px]">phù hợp</p>
        </div>
      </div>
      <div className="px-4 py-2 bg-gray-50">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.score}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className={`h-full rounded-full ${analysis.suitable ? "bg-green-400" : "bg-orange-400"}`} />
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs text-gray-600 leading-relaxed">{analysis.feedback}</p>
      </div>
      <div className="px-4 pb-4 space-y-1.5">
        <p className="text-xs font-bold text-gray-700 flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5 text-purple-500" /> Gợi ý phối đồ</p>
        {analysis.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[9px] text-purple-600 font-bold">{i + 1}</span>
            </div>
            <p className="text-xs text-gray-600">{tip}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
