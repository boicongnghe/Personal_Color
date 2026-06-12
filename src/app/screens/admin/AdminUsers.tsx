import { useNavigate } from "react-router";
import { ArrowLeft, Search, Crown, Users, Shield, Ban } from "lucide-react";
import logoUrl from "../../../assets/logo.png";
import { useState, useEffect, useMemo } from "react";
import { getAllUsersAdmin, updateUserTierAdmin, banUserAdmin } from "../../../api/api";

/* ── Types ── */
interface AdminUser {
  _id: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  subscriptionTier: "free" | "premium";
  scanCount: number;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
}

/* ── Helpers ── */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function initials(name?: string, email?: string) {
  return (name || email || "?").charAt(0).toUpperCase();
}

type TabFilter = "all" | "premium" | "free" | "banned";

/* ══════════════════════════════════════════
   Main component
══════════════════════════════════════════ */
export function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [tabFilter, setTabFilter]   = useState<TabFilter>("all");
  const [tierBusyId, setTierBusyId] = useState<string | null>(null);
  const [banBusyId, setBanBusyId]   = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getAllUsersAdmin();
      setUsers(res.data.data?.users ?? []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggleTier = async (u: AdminUser) => {
    const newTier = u.subscriptionTier === "premium" ? "free" : "premium";
    setTierBusyId(u._id);
    try {
      await updateUserTierAdmin(u._id, newTier);
      setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, subscriptionTier: newTier } : x));
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi cập nhật gói");
    } finally {
      setTierBusyId(null);
    }
  };

  const handleToggleBan = async (u: AdminUser) => {
    const newBanned = !u.isBanned;
    const label = newBanned ? "khóa" : "mở khóa";
    if (!confirm(`Xác nhận ${label} tài khoản ${u.displayName || u.email}?`)) return;
    setBanBusyId(u._id);
    try {
      await banUserAdmin(u._id, newBanned);
      setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, isBanned: newBanned } : x));
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi cập nhật trạng thái");
    } finally {
      setBanBusyId(null);
    }
  };

  /* Stats */
  const premiumCount = users.filter((u) => u.subscriptionTier === "premium").length;
  const freeCount    = users.filter((u) => u.subscriptionTier === "free" && !u.isBanned).length;
  const bannedCount  = users.filter((u) => u.isBanned).length;

  /* Filtered list */
  const filtered = useMemo(() => {
    let list = users;
    if (tabFilter === "premium") list = list.filter((u) => u.subscriptionTier === "premium");
    else if (tabFilter === "free") list = list.filter((u) => u.subscriptionTier === "free" && !u.isBanned);
    else if (tabFilter === "banned") list = list.filter((u) => u.isBanned);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          (u.displayName ?? "").toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, tabFilter, search]);

  /* ── Tab button ── */
  const Tab = ({ value, label, count, color }: { value: TabFilter; label: string; count: number; color?: string }) => (
    <button
      onClick={() => setTabFilter(value)}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
        tabFilter === value
          ? `${color ?? "bg-purple-600"} text-white shadow-sm`
          : "bg-white text-gray-500 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
      }`}
    >
      {label}
      <span className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
        tabFilter === value ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
      }`}>
        {count}
      </span>
    </button>
  );

  /* ── Spinner ── */
  const Spin = () => (
    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
  );

  /* ══ Render ══ */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 lg:px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <button onClick={() => navigate("/admin")}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src={logoUrl} alt="Clarity" className="lg:hidden h-7 w-auto flex-shrink-0" />
            <div className="min-w-0">
              <span className="lg:hidden text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Người dùng</span>
              <h1 className="hidden lg:block text-xl font-bold text-gray-900">Quản lý người dùng</h1>
              {!loading && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {users.length} tài khoản · {premiumCount} Premium · {bannedCount} Đã khóa
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0 font-medium">✕</button>
        </div>
      )}

      <div className="p-5 lg:p-6 max-w-7xl mx-auto space-y-4">

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-center">
              <Users className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{users.length}</p>
              <p className="text-[10px] text-gray-400">Tổng</p>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-amber-100 shadow-sm text-center">
              <Crown className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-amber-600">{premiumCount}</p>
              <p className="text-[10px] text-gray-400">Premium</p>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-center">
              <Shield className="w-4 h-4 text-gray-300 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-600">{freeCount}</p>
              <p className="text-[10px] text-gray-400">Free</p>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-red-100 shadow-sm text-center">
              <Ban className="w-4 h-4 text-red-300 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-500">{bannedCount}</p>
              <p className="text-[10px] text-gray-400">Đã khóa</p>
            </div>
          </div>
        )}

        {/* Search + filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Tab value="all"     label="Tất cả"   count={users.length} />
            <Tab value="premium" label="Premium"  count={premiumCount} color="bg-amber-500" />
            <Tab value="free"    label="Free"     count={freeCount} />
            <Tab value="banned"  label="Đã khóa"  count={bannedCount} color="bg-red-500" />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Đang tải...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Users className="w-14 h-14 mx-auto mb-3 opacity-20" />
            <p className="font-medium">{search ? "Không tìm thấy người dùng nào" : "Không có người dùng nào"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((u) => {
              const isPrem   = u.subscriptionTier === "premium";
              const tierBusy = tierBusyId === u._id;
              const banBusy  = banBusyId  === u._id;
              return (
                <div key={u._id}
                  className={`bg-white rounded-2xl border shadow-sm px-4 py-3.5 flex items-center gap-3 transition-opacity ${
                    u.isBanned ? "border-red-100 opacity-70" : "border-gray-100"
                  }`}>

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold overflow-hidden ${
                    u.isBanned ? "bg-red-100 text-red-400" : isPrem ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-600"
                  }`}>
                    {u.avatarUrl
                      ? <img src={u.avatarUrl} className="w-full h-full object-cover" alt="" />
                      : initials(u.displayName, u.email)
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className={`text-sm font-semibold truncate ${u.isBanned ? "text-gray-400 line-through" : "text-gray-900"}`}>
                        {u.displayName || u.email || "Không tên"}
                      </p>
                      {u.isAdmin && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-md font-bold flex-shrink-0">Admin</span>
                      )}
                      {u.isBanned && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-500 rounded-md font-bold flex-shrink-0">Đã khóa</span>
                      )}
                      {!u.isBanned && isPrem && (
                        <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    {u.displayName && u.email && (
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-gray-400">{u.scanCount ?? 0} lần scan</span>
                      <span className="text-[10px] text-gray-300">·</span>
                      <span className="text-[10px] text-gray-300">Tham gia {fmtDate(u.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {/* Toggle tier */}
                    {!u.isBanned && (
                      <button
                        onClick={() => handleToggleTier(u)}
                        disabled={tierBusy || banBusy}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all disabled:opacity-50 ${
                          isPrem
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                        }`}
                      >
                        {tierBusy ? <Spin /> : isPrem ? "Hạ Free" : <><Crown className="w-3 h-3" />Premium</>}
                      </button>
                    )}

                    {/* Ban / Unban */}
                    <button
                      onClick={() => handleToggleBan(u)}
                      disabled={tierBusy || banBusy || u.isAdmin}
                      title={u.isAdmin ? "Không thể khóa Admin" : undefined}
                      className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        u.isBanned
                          ? "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                          : "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
                      }`}
                    >
                      {banBusy ? <Spin /> : u.isBanned ? "Mở khóa" : <><Ban className="w-3 h-3" />Khóa</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
