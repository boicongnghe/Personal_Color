import { useNavigate } from "react-router";
import { ArrowLeft, MessageCircle, Clock, CheckCircle2, Send, Loader2, RefreshCw } from "lucide-react";
import logoUrl from "../../../assets/logo.png";
import { useState, useEffect } from "react";
import { getAllSupportMessages, replyToSupportMessage } from "../../../api/api";

interface SupportMsg {
  _id: string;
  userId: { displayName?: string; email?: string } | null;
  userName: string;
  userEmail: string;
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

function initials(name?: string, email?: string) {
  return (name || email || "?").charAt(0).toUpperCase();
}

export function AdminSupport() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<SupportMsg[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"all" | "pending" | "replied">("all");
  const [selected, setSelected] = useState<SupportMsg | null>(null);
  const [reply, setReply]       = useState("");
  const [sending, setSending]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllSupportMessages();
      setMessages(res.data.data as SupportMsg[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReply = async () => {
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    try {
      const res = await replyToSupportMessage(selected._id, reply.trim());
      const updated = res.data.data as SupportMsg;
      setMessages((prev) => prev.map((m) => m._id === updated._id ? { ...m, ...updated } : m));
      setSelected((prev) => prev ? { ...prev, ...updated } : null);
      setReply("");
    } finally {
      setSending(false);
    }
  };

  const filtered = messages.filter((m) => filter === "all" || m.status === filter);
  const pendingCount = messages.filter((m) => m.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="px-6 pt-5 lg:pt-4 pb-5 lg:px-8 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <button onClick={() => navigate("/admin")}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src={logoUrl} alt="Clarity" className="lg:hidden h-7 w-auto flex-shrink-0" />
            <div className="min-w-0">
              <span className="lg:hidden text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Hỗ trợ</span>
              <h1 className="hidden lg:block text-xl font-bold text-gray-900">Hỗ trợ người dùng</h1>
              {pendingCount > 0 && (
                <p className="text-xs text-amber-600 font-semibold mt-0.5">
                  {pendingCount} tin nhắn chờ phản hồi
                </p>
              )}
            </div>
          </div>
          <button onClick={load} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-4 max-w-7xl mx-auto">
          {([["all", "Tất cả"], ["pending", "Chờ phản hồi"], ["replied", "Đã phản hồi"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === val
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {label}
              {val === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-400 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 lg:px-8 py-5 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">Không có tin nhắn nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((msg) => (
              <button key={msg._id} onClick={() => { setSelected(msg); setReply(""); }}
                className={`w-full text-left bg-white rounded-2xl border shadow-sm p-4 transition-all ${
                  selected?._id === msg._id ? "border-purple-400 ring-2 ring-purple-100" : "border-gray-100 hover:border-purple-200"
                }`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    {initials(msg.userName, msg.userEmail)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-bold text-sm text-gray-900 truncate">{msg.userName || msg.userEmail}</p>
                      <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        msg.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {msg.status === "pending" ? "Chờ" : "Đã rep"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">{msg.userEmail}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{msg.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{fmtDate(msg.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reply sheet */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-4 pb-0">
          <div className="bg-white rounded-t-3xl w-full max-w-md shadow-2xl flex flex-col" style={{ maxHeight: "85vh" }}>
            {/* Sheet header */}
            <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{selected.userName || selected.userEmail}</p>
                  <p className="text-xs text-gray-400">{selected.userEmail} · {fmtDate(selected.createdAt)}</p>
                </div>
                <button onClick={() => setSelected(null)}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1.5 bg-gray-100 rounded-full">
                  Đóng
                </button>
              </div>
            </div>

            {/* Message content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-gradient-to-br from-purple-500 to-pink-400 text-white px-4 py-3 rounded-2xl rounded-tr-md shadow-sm">
                  <p className="text-sm leading-relaxed">{selected.message}</p>
                </div>
              </div>

              {/* Existing admin reply */}
              {selected.adminReply && (
                <div className="flex justify-start gap-2">
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div className="max-w-[85%]">
                    <p className="text-[10px] font-bold text-gray-500 mb-1">Admin (bạn)</p>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-md">
                      <p className="text-sm text-gray-800 leading-relaxed">{selected.adminReply}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <p className="text-[10px] text-gray-400">Đã gửi</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reply input */}
            <div className="flex-shrink-0 px-5 py-4 pb-8 border-t border-gray-100">
              {selected.status === "replied" && (
                <p className="text-xs text-green-600 font-semibold text-center mb-3">
                  ✓ Đã phản hồi — bạn có thể gửi thêm tin nhắn
                </p>
              )}
              <div className="flex gap-3 items-end">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  placeholder="Nhập phản hồi cho người dùng..."
                  rows={2}
                  className="flex-1 resize-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400"
                  disabled={sending}
                />
                <button onClick={handleReply} disabled={!reply.trim() || sending}
                  className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md disabled:opacity-40 flex-shrink-0">
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
