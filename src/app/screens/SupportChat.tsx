import { useNavigate } from "react-router";
import { ArrowLeft, Send, Loader2, MessageCircle, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import logoUrl from "../../assets/logo.png";
import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { sendSupportMessage, getMySupportMessages } from "../../api/api";

interface SupportMsg {
  _id: string;
  message: string;
  adminReply: string | null;
  status: "pending" | "replied";
  createdAt: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function SupportChat() {
  const navigate  = useNavigate();
  const { user }  = useAppContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages]   = useState<SupportMsg[]>([]);
  const [input, setInput]         = useState("");
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await getMySupportMessages();
      setMessages((res.data.data as SupportMsg[]).reverse());
    } catch {
      setError("Không thể tải tin nhắn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await sendSupportMessage(text);
      setMessages((prev) => [...prev, res.data.data as SupportMsg]);
      setInput("");
    } catch {
      setError("Gửi thất bại. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-100">
        <div className="px-5 pt-12 pb-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex-1" />
          <button onClick={() => { setLoading(true); load(); }}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        {/* Brand strip */}
        <div className="flex flex-col items-center pb-4 px-5">
          <img src={logoUrl} alt="Clarity" className="w-14 h-14 rounded-2xl shadow-md object-cover mb-2" />
          <p className="text-base font-bold text-gray-900">Clarity Support</p>
          <p className="text-xs text-gray-400">Đội ngũ phản hồi trong vòng 24 giờ</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">Chưa có tin nhắn nào</p>
            <p className="text-gray-400 text-sm max-w-xs">
              Gửi câu hỏi hoặc vấn đề bạn gặp phải — đội ngũ sẽ phản hồi sớm nhất có thể.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="space-y-2">
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="max-w-[80%]">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-400 text-white px-4 py-3 rounded-2xl rounded-tr-md shadow-sm">
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 text-right">{fmtDate(msg.createdAt)}</p>
                </div>
              </div>

              {/* Admin reply */}
              {msg.adminReply ? (
                <div className="flex justify-start gap-2">
                  <img src={logoUrl} alt="Clarity" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 shadow-sm" />
                  <div className="max-w-[80%]">
                    <p className="text-[10px] font-bold text-purple-600 mb-1">Clarity Support</p>
                    <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-md">
                      <p className="text-sm text-gray-800 leading-relaxed">{msg.adminReply}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <p className="text-[10px] text-gray-400">Đã phản hồi</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pl-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <p className="text-[10px] text-gray-400">Đang chờ phản hồi...</p>
                </div>
              )}
            </div>
          ))
        )}

        {error && (
          <p className="text-center text-sm text-red-500 bg-red-50 rounded-xl py-2 px-4">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-4 pb-8">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Nhập câu hỏi hoặc vấn đề của bạn..."
            rows={2}
            className="flex-1 resize-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder:text-gray-400"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 text-white rounded-2xl flex items-center justify-center shadow-md disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            {sending
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Enter để gửi · Shift+Enter xuống dòng
        </p>
      </div>
    </div>
  );
}
