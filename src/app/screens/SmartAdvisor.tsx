import { useNavigate } from "react-router";
import {
  ArrowLeft, Camera, FolderOpen, Send, Sparkles, Crown,
  X, RotateCcw, Lock, Zap, Clock, Plus, Trash2,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import {
  chatAssistant, listConversations, createConversation,
  getConversation, updateConversation, deleteConversation,
} from "../../api/api";
import { AssistantMessage, LoadingBubble } from "../components/AssistantMessage";
import { UserMessage } from "../components/UserMessage";

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
  colorNote?: string;
  followUp?: string;
}

interface GeminiAnalysis {
  score: number;
  label: string;
  occasion: string;
  summary: string;
  suggestions: string[];
  colorNote?: string;
  followUp?: string;
}

interface GeminiResponse {
  reply: string;
  analysis: GeminiAnalysis | null;
}

interface ConvSummary {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
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
      <div className="flex-shrink-0 px-4 pb-3 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
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
  const [pendingFile, setPendingFile]   = useState<File | null>(null);
  const [isTyping, setIsTyping]         = useState(false);
  const [isPremiumLocked]               = useState(!user.isPremium);

  const [showCamera, setShowCamera]   = useState(false);
  const [facingMode, setFacingMode]   = useState<"environment" | "user">("environment");

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const bottomRef      = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const historyRef     = useRef<{ role: "user" | "model"; text: string }[]>([]);
  const videoRef       = useRef<HTMLVideoElement>(null);
  const streamRef      = useRef<MediaStream | null>(null);

  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const [showHistory, setShowHistory]     = useState(false);
  const [convId, setConvId]               = useState<string | null>(null);
  const convIdRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [showCamera]);

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    listConversations().then(res => setConversations(res.data.data)).catch(() => {});
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return 'Hôm nay';
    if (diff === 1) return 'Hôm qua';
    if (diff < 7) return `${diff} ngày trước`;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const newChat = () => {
    setMessages([GREET]);
    setPending(null);
    setPendingImage(null);
    setPendingFile(null);
    historyRef.current = [];
    convIdRef.current = null;
    setConvId(null);
    setShowHistory(false);
  };

  const loadConv = async (id: string) => {
    try {
      const res = await getConversation(id);
      const dbConv = res.data.data;
      const msgs: Msg[] = [
        GREET,
        ...dbConv.messages.map((m: any, i: number) => ({
          id: i + 1,
          role: m.role as Role,
          text: m.text || undefined,
          analysis: m.analysis || undefined,
        })),
      ];
      setMessages(msgs);
      convIdRef.current = id;
      setConvId(id);
      historyRef.current = dbConv.messages
        .filter((m: any) => m.text)
        .map((m: any) => ({
          role: (m.role === 'ai' ? 'model' : 'user') as 'user' | 'model',
          text: m.text as string,
        }));
      setPending(null);
      setPendingImage(null);
      setPendingFile(null);
      setShowHistory(false);
    } catch { /* silent */ }
  };

  const handleDeleteConv = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (convIdRef.current === id) newChat();
    } catch { /* silent */ }
  };

  const addAI = useCallback((text: string, analysis?: Analysis, delay = 1200) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now(), role: "ai", text, analysis }]);
    }, delay);
  }, []);

  const sendMessage = useCallback(async (text?: string, image?: string, occasion?: string, file?: File) => {
    const msgText  = text  ?? inputText.trim();
    const msgImage = image ?? pendingImage ?? undefined;
    const msgFile  = file  ?? pendingFile  ?? undefined;
    if (!msgText && !msgImage) return;

    const userMsg: Msg = { id: Date.now(), role: "user", text: msgText || undefined, image: msgImage || undefined };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setPendingImage(null);
    setPendingFile(null);
    setIsTyping(true);

    const occ = occasion ?? pendingOccasion ?? "";

    if (msgText) {
      historyRef.current = [...historyRef.current, { role: "user" as const, text: msgText }];
    }

    try {
      const res = await chatAssistant(msgText || "", msgFile || null, historyRef.current.slice(-8), occ);
      const data = res.data.data as GeminiResponse;

      const rawScore = data.analysis?.score;
      const normScore = rawScore !== undefined && rawScore !== null ? Number(rawScore) : null;

      const analysis: Analysis | undefined = data.analysis && normScore !== null && !isNaN(normScore) ? {
        score:    normScore,
        suitable: data.analysis.label === "Rất phù hợp" || data.analysis.label === "Phù hợp",
        occasion: data.analysis.occasion  || "",
        feedback: data.analysis.summary   || "",
        tips:     Array.isArray(data.analysis.suggestions) ? data.analysis.suggestions : [],
        colorNote: data.analysis.colorNote || undefined,
        followUp:  data.analysis.followUp  || undefined,
      } : undefined;

      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now(), role: "ai", text: data.reply, analysis }]);

      if (data.reply) {
        historyRef.current = [...historyRef.current, { role: "model" as const, text: data.reply }];
      }

      // Persist messages to conversation history (fail silently)
      try {
        const userMsgDB = { role: 'user', text: msgText || '' };
        const aiMsgDB   = { role: 'ai',   text: data.reply || '', analysis: analysis ?? null };
        if (!convIdRef.current) {
          const title = (msgText || 'Cuộc trò chuyện mới').slice(0, 80);
          const cRes  = await createConversation(title);
          const newId = cRes.data.data._id;
          convIdRef.current = newId;
          setConvId(newId);
          await updateConversation(newId, { messages: [userMsgDB, aiMsgDB] });
        } else {
          await updateConversation(convIdRef.current, { messages: [userMsgDB, aiMsgDB] });
        }
        listConversations().then(res => setConversations(res.data.data)).catch(() => {});
      } catch { /* silent */ }

    } catch {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now(), role: "ai",
        text: "⚠️ Xin lỗi, mình không thể kết nối với AI lúc này. Vui lòng thử lại sau!",
      }]);
    }
  }, [inputText, pendingImage, pendingFile, pendingOccasion]);

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
    setPendingFile(file);
    e.target.value = "";
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setShowCamera(true);
    } catch {
      cameraInputRef.current?.click();
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      setPendingImage(URL.createObjectURL(file));
      setPendingFile(file);
      closeCamera();
    }, "image/jpeg", 0.92);
  };

  const flipCamera = async () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    streamRef.current?.getTracks().forEach(t => t.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: next } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch { /* ignore */ }
  };

  /* ── Paywall gate ── */
  if (isPremiumLocked) {
    return <SmartAdvisorPaywall onUpgrade={() => navigate("/premium")} onBack={() => navigate(-1)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* ─── Header ─── */}
      <div className="flex-shrink-0 px-4 pb-3 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
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
          <button onClick={newChat} title="Tạo mới"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => setShowHistory(true)} title="Lịch sử"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <Clock className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ─── Messages ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg) =>
          msg.role === "user"
            ? <UserMessage key={msg.id} message={msg} />
            : <AssistantMessage key={msg.id} message={msg} onFollowUp={(text) => sendMessage(text)} />
        )}

        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LoadingBubble />
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
            <button onClick={openCamera} className="w-10 h-10 bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-2xl flex items-center justify-center transition-colors">
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

      {/* ─── History Drawer ─── */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.45)" }}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              style={{
                position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 41,
                width: 280, background: "#fff", display: "flex", flexDirection: "column",
                boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
              }}
            >
              {/* Drawer header */}
              <div style={{ padding: "52px 16px 12px", borderBottom: "1px solid #f3e8ff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1f1535" }}>Lịch sử chat</span>
                <button onClick={() => setShowHistory(false)}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: 16, height: 16, color: "#6b7280" }} />
                </button>
              </div>

              {/* New chat button */}
              <div style={{ padding: "10px 12px 6px" }}>
                <button onClick={newChat}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 12,
                    background: "linear-gradient(135deg,#9333ea,#ec4899)",
                    color: "#fff", border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                  <Plus style={{ width: 15, height: 15 }} />
                  Tạo cuộc trò chuyện mới
                </button>
              </div>

              {/* Conversation list */}
              <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
                {conversations.length === 0 ? (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                    Chưa có cuộc trò chuyện nào
                  </div>
                ) : conversations.map(conv => (
                  <button
                    key={conv._id}
                    onClick={() => loadConv(conv._id)}
                    style={{
                      width: "100%", padding: "10px 14px",
                      background: convId === conv._id ? "#f5f3ff" : "transparent",
                      border: "none", cursor: "pointer", textAlign: "left",
                      display: "flex", alignItems: "flex-start", gap: 10,
                      borderBottom: "1px solid #f9fafb",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1f1535", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                        {conv.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        {formatDate(conv.updatedAt)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConv(conv._id, e)}
                      style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d1d5db"; }}
                    >
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Camera overlay ─── */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "#000", display: "flex", flexDirection: "column" }}
          >
            {/* Video feed */}
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>

            {/* Controls bar */}
            <div style={{
              flexShrink: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              paddingTop: 20,
              paddingBottom: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 40,
            }}>
              {/* Cancel */}
              <button
                onClick={closeCamera}
                style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X style={{ width: 24, height: 24, color: "#fff" }} />
              </button>

              {/* Capture */}
              <button
                onClick={capturePhoto}
                style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "#fff", border: "4px solid rgba(255,255,255,0.5)", boxShadow: "0 0 0 3px rgba(255,255,255,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                <Camera style={{ width: 28, height: 28, color: "#9333ea" }} />
              </button>

              {/* Flip */}
              <button
                onClick={flipCamera}
                style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <RotateCcw style={{ width: 24, height: 24, color: "#fff" }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

