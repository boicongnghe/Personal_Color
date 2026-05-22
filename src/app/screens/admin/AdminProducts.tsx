import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Trash2, Edit2, ExternalLink, Package, Search, Link2, Tag, LayoutGrid } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  previewProduct, createProduct, getAllProducts,
  updateProduct, deleteProduct,
} from "../../../api/api";

/* ── Constants ── */
const ALL_SEASONS    = [
  "autumn-warm","autumn-deep","autumn-rich","autumn-muted",
  "winter-cool","winter-dark","winter-bright","winter-clear",
  "spring-warm","spring-light","spring-bright","spring-clear",
  "summer-cool","summer-light","summer-soft","summer-muted",
];
const ALL_BODY_TYPES = ["hourglass","pear","rectangle","inverted-triangle","apple"];
const ALL_CATEGORIES = ["top","bottom","shoes","accessory","makeup","other"];
const ALL_OCCASIONS  = ["casual","office","party","all"];
const ALL_GENDERS    = ["female","male","unisex"];

const VI: Record<string, string> = {
  top:"Áo trên", bottom:"Quần / Váy", shoes:"Giày dép",
  accessory:"Phụ kiện", makeup:"Trang điểm", other:"Khác",
  casual:"Hàng ngày", office:"Đi làm", party:"Tiệc / Sự kiện", all:"Tất cả",
  female:"Nữ", male:"Nam", unisex:"Unisex",
  hourglass:"Đồng hồ cát", pear:"Quả lê", rectangle:"Chữ nhật",
  "inverted-triangle":"Tam giác ngược", apple:"Quả táo",
  "autumn-warm":"Thu · Ấm", "autumn-deep":"Thu · Đậm",
  "autumn-rich":"Thu · Phong phú", "autumn-muted":"Thu · Trầm",
  "winter-cool":"Đông · Mát", "winter-dark":"Đông · Tối",
  "winter-bright":"Đông · Sáng", "winter-clear":"Đông · Trong",
  "spring-warm":"Xuân · Ấm", "spring-light":"Xuân · Nhạt",
  "spring-bright":"Xuân · Tươi", "spring-clear":"Xuân · Trong",
  "summer-cool":"Hè · Mát", "summer-light":"Hè · Nhạt",
  "summer-soft":"Hè · Mềm", "summer-muted":"Hè · Trầm",
};
const vn = (k: string) => VI[k] ?? k;

const PLATFORM_BADGE: Record<string,string> = {
  shopee:"bg-orange-500 text-white", tiktok:"bg-neutral-900 text-white",
  lazada:"bg-blue-600 text-white", tiki:"bg-sky-400 text-white",
  other:"bg-gray-400 text-white",
};
const PLATFORM_LABEL: Record<string,string> = {
  shopee:"Shopee", tiktok:"TikTok Shop", lazada:"Lazada", tiki:"Tiki", other:"Khác",
};
const PLATFORM_EMOJI: Record<string,string> = {
  shopee:"🛍", tiktok:"🎵", lazada:"📦", tiki:"📘",
};

/* ── Types ── */
interface ApiProduct {
  _id:string; title:string; image?:string; price?:number; description?:string;
  platform:string; occasions:string[]; seasons:string[]; genders:string[];
  bodyTypes:string[]; category:string; tags:string[];
  affiliateUrl:string; isActive:boolean; clickCount:number;
}
type Step = "list"|"add"|"edit";

const EMPTY_FORM = {
  title:"", image:"", price:"", description:"", affiliateUrl:"", platform:"other",
  seasons:[] as string[], bodyTypes:[] as string[],
  genders:["unisex"] as string[], occasions:["all"] as string[],
  category:"other", tags:"",
};

/* ── Helpers ── */
function detectPlatform(url:string):string {
  if (url.includes("shopee.vn")||url.includes("shope.ee")) return "shopee";
  if (url.includes("tiktok.com")||url.includes("s.tiktok")) return "tiktok";
  if (url.includes("lazada.vn")) return "lazada";
  if (url.includes("tiki.vn"))   return "tiki";
  return "other";
}

/* ── Section header ── */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 -mx-5 px-5 py-2.5 bg-gray-50 border-t border-b border-gray-100">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{title}</span>
    </div>
  );
}

/* ── Field label ── */
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all placeholder:text-gray-300";

/* ── SingleCheck ── */
function SingleCheck({ label, options, value, onChange }:{
  label:string; options:string[]; value:string; onChange:(v:string)=>void;
}) {
  const [adding,setAdding] = useState(false);
  const [newVal,setNewVal] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const all = [...options,...(value&&!options.includes(value)?[value]:[])];
  const commit = () => { const v=newVal.trim(); setAdding(false); setNewVal(""); if(v) onChange(v); };
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Label>{label}</Label>
        <button type="button" onClick={()=>{setAdding(true);setTimeout(()=>ref.current?.focus(),40);}}
          className="w-4 h-4 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 text-[11px] font-bold transition-colors" title="Thêm tuỳ chọn">+</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {all.map(o=>(
          <button key={o} type="button" onClick={()=>onChange(o)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${value===o ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-600"}`}>
            {vn(o)}
          </button>
        ))}
        {adding && <input ref={ref} value={newVal} onChange={e=>setNewVal(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();commit();}if(e.key==="Escape"){setAdding(false);setNewVal("");}}}
          onBlur={commit} placeholder="Nhập thêm..."
          className="px-3 py-1 rounded-lg text-xs border border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300 w-28" />}
      </div>
    </div>
  );
}

/* ── MultiCheck ── */
function MultiCheck({ label, options, selected, onChange, hint }:{
  label:string; options:string[]; selected:string[]; onChange:(v:string[])=>void; hint?:string;
}) {
  const [adding,setAdding] = useState(false);
  const [newVal,setNewVal] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const all = [...options,...selected.filter(s=>!options.includes(s))];
  const toggle = (val:string) => onChange(selected.includes(val)?selected.filter(s=>s!==val):[...selected,val]);
  const commit = () => { const v=newVal.trim(); setAdding(false); setNewVal(""); if(v&&!selected.includes(v)) onChange([...selected,v]); };
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Label>{label}</Label>
        <button type="button" onClick={()=>{setAdding(true);setTimeout(()=>ref.current?.focus(),40);}}
          className="w-4 h-4 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 text-[11px] font-bold transition-colors" title="Thêm tuỳ chọn">+</button>
        {hint && <span className="text-[10px] text-gray-400 ml-auto">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {all.map(o=>(
          <button key={o} type="button" onClick={()=>toggle(o)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${selected.includes(o) ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-600"}`}>
            {vn(o)}
          </button>
        ))}
        {adding && <input ref={ref} value={newVal} onChange={e=>setNewVal(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();commit();}if(e.key==="Escape"){setAdding(false);setNewVal("");}}}
          onBlur={commit} placeholder="Nhập thêm..."
          className="px-3 py-1 rounded-lg text-xs border border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300 w-28" />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main component
══════════════════════════════════════════ */
export function AdminProducts() {
  const navigate = useNavigate();
  const [step,setStep]                         = useState<Step>("list");
  const [form,setForm]                         = useState<Record<string,any>>(EMPTY_FORM);
  const [products,setProducts]                 = useState<ApiProduct[]>([]);
  const [saving,setSaving]                     = useState(false);
  const [fetching,setFetching]                 = useState(false);
  const [fetchMsg,setFetchMsg]                 = useState<{ok:boolean;text:string}|null>(null);
  const [listLoading,setListLoading]           = useState(false);
  const [error,setError]                       = useState<string|null>(null);
  const [editingId,setEditingId]               = useState<string|null>(null);
  const [search,setSearch]                     = useState("");
  const [clipboardPasted,setClipboardPasted]   = useState(false);

  useEffect(()=>{ loadProducts(); },[]);

  const loadProducts = async () => {
    setListLoading(true);
    try { const res=await getAllProducts(); setProducts(res.data.data.products??[]); }
    catch { setError("Lỗi tải danh sách sản phẩm"); }
    finally { setListLoading(false); }
  };

  const setField = (k:string,v:any) => setForm(p=>({...p,[k]:v}));

  const handleUrlChange = (value:string) => {
    const d=detectPlatform(value);
    setForm(p=>({...p, affiliateUrl:value, platform:d!=="other"?d:p.platform}));
  };

  const handleUrlFocus = async () => {
    try {
      const text=await navigator.clipboard.readText();
      if(text.startsWith("http")&&!form.affiliateUrl){
        handleUrlChange(text); setClipboardPasted(true);
        setTimeout(()=>setClipboardPasted(false),3000);
      }
    } catch {}
  };

  const handleAutoFill = async () => {
    if(!form.affiliateUrl?.trim()) return;
    setFetching(true); setFetchMsg(null);
    try {
      const res=await previewProduct(form.affiliateUrl.trim());
      if(!res.data.success){ setFetchMsg({ok:false,text:res.data.error||"Không lấy được — điền thủ công nhé"}); return; }
      const d=res.data.data;
      setForm(p=>({...p, title:d.title||p.title, image:d.image||p.image, price:d.price!=null?d.price:p.price, platform:d.platform||p.platform}));
      setFetchMsg({ok:true,text:"Đã điền thông tin tự động ✓"});
      setTimeout(()=>setFetchMsg(null),4000);
    } catch(err:any) { setFetchMsg({ok:false,text:err.response?.data?.error||"Lỗi kết nối — điền thủ công nhé"}); }
    finally { setFetching(false); }
  };

  const reset = () => { setError(null); setClipboardPasted(false); setFetchMsg(null); };

  const goBack   = () => { if(step==="list") navigate("/admin"); else { setStep("list"); reset(); } };
  const openAdd  = () => { setEditingId(null); setForm(EMPTY_FORM); reset(); setStep("add"); };

  const handleSave = async () => {
    if(!form.title||!form.affiliateUrl){ setError("Vui lòng điền tên sản phẩm và link affiliate"); return; }
    setSaving(true); setError(null);
    try {
      const payload={...form, price:form.price!==""?Number(form.price):undefined,
        tags:typeof form.tags==="string"?form.tags.split(",").map((t:string)=>t.trim()).filter(Boolean):form.tags};
      if(editingId) await updateProduct(editingId,payload); else await createProduct(payload);
      setEditingId(null); setForm(EMPTY_FORM); setStep("list"); await loadProducts();
    } catch(err:any) { setError(err.response?.data?.error||"Lỗi lưu sản phẩm"); }
    finally { setSaving(false); }
  };

  const handleEdit = (p:ApiProduct) => {
    setEditingId(p._id);
    setForm({ title:p.title, image:p.image??"", price:p.price??"", description:p.description??"",
      affiliateUrl:p.affiliateUrl, platform:p.platform??"other",
      seasons:p.seasons??[], bodyTypes:p.bodyTypes??[], genders:p.genders??["unisex"],
      occasions:p.occasions??["all"], category:p.category??"other", tags:(p.tags??[]).join(", ") });
    reset(); setStep("edit");
  };

  const handleDelete = async (id:string) => {
    if(!confirm("Xác nhận xóa sản phẩm này?")) return;
    try { await deleteProduct(id); await loadProducts(); }
    catch(err:any) { setError(err.response?.data?.error||"Lỗi xóa sản phẩm"); }
  };

  const handleToggleActive = async (p:ApiProduct) => {
    try { await updateProduct(p._id,{isActive:!p.isActive}); await loadProducts(); }
    catch(err:any) { setError(err.response?.data?.error||"Lỗi cập nhật"); }
  };

  const filtered = products.filter(p=>p.title.toLowerCase().includes(search.toLowerCase()));
  const isFormStep = step==="add"||step==="edit";

  /* ══ Render ══ */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">
              {step==="list"?"Sản phẩm Affiliate":step==="add"?"Thêm sản phẩm mới":"Chỉnh sửa sản phẩm"}
            </h1>
            {step==="list" && <p className="text-xs text-gray-400">{products.length} sản phẩm</p>}
          </div>
          {step==="list" && (
            <button onClick={openAdd} className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors flex-shrink-0">
              <Plus className="w-3.5 h-3.5" /> Thêm mới
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <span className="flex-1">{error}</span>
          <button onClick={()=>setError(null)} className="text-red-400 hover:text-red-600 font-medium text-xs flex-shrink-0">✕ Đóng</button>
        </div>
      )}

      {/* ══ FORM ══ */}
      {isFormStep && (
        <div className="px-5 py-5 max-w-lg mx-auto space-y-3">

          {/* Card 1: Liên kết */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-purple-50 border-b border-purple-100">
              <Link2 className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">Liên kết affiliate</span>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <Label required>Link sản phẩm (có mã aff)</Label>
                <div className="relative">
                  <input type="url" value={form.affiliateUrl??""} onChange={e=>handleUrlChange(e.target.value)}
                    onFocus={step==="add"?handleUrlFocus:undefined}
                    placeholder="https://shope.ee/...  hoặc  https://vt.tiktok.com/..."
                    className={`${inputCls} pr-28`} />
                  {form.platform && form.platform!=="other" && (
                    <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none ${PLATFORM_BADGE[form.platform]}`}>
                      {PLATFORM_EMOJI[form.platform]} {PLATFORM_LABEL[form.platform]}
                    </span>
                  )}
                </div>
                {clipboardPasted && <p className="text-[11px] text-green-600 mt-1.5">✓ Đã dán link từ clipboard</p>}
              </div>
              {step==="add" && (
                <button type="button" onClick={handleAutoFill}
                  disabled={fetching||!form.affiliateUrl?.trim()}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-purple-200 text-purple-600 text-sm font-semibold hover:bg-purple-50 hover:border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  {fetching ? (<><span className="w-3.5 h-3.5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"/>Đang lấy thông tin...</>) : "✨  Lấy thông tin tự động"}
                </button>
              )}
              {fetchMsg && (
                <p className={`text-xs font-medium px-3 py-2 rounded-lg ${fetchMsg.ok?"bg-green-50 text-green-700":"bg-orange-50 text-orange-700"}`}>{fetchMsg.text}</p>
              )}
            </div>
          </div>

          {/* Card 2: Thông tin sản phẩm */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-blue-50 border-b border-blue-100">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Thông tin sản phẩm</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <Label required>Tên sản phẩm</Label>
                <input value={form.title??""} onChange={e=>setField("title",e.target.value)}
                  placeholder="VD: Áo len cổ lọ màu caramel" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Giá (VNĐ)</Label>
                  <input type="number" value={form.price??""} onChange={e=>setField("price",e.target.value)}
                    placeholder="79000" className={inputCls} />
                </div>
                <div>
                  <Label>Nền tảng</Label>
                  <select value={form.platform??"other"} onChange={e=>setField("platform",e.target.value)} className={inputCls}>
                    <option value="shopee">🛍 Shopee</option>
                    <option value="tiktok">🎵 TikTok Shop</option>
                    <option value="lazada">📦 Lazada</option>
                    <option value="tiki">📘 Tiki</option>
                    <option value="other">🔗 Khác</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Link ảnh sản phẩm</Label>
                <input value={form.image??""} onChange={e=>setField("image",e.target.value)}
                  placeholder="https://..." className={inputCls} />
                <p className="text-[11px] text-gray-400 mt-1.5">Mẹo: Mở Shopee → giữ ảnh → Copy → Paste vào đây</p>
                {form.image && (
                  <img src={form.image} alt="" className="mt-2 w-16 h-16 object-cover rounded-xl border border-gray-100"
                    onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Phân loại */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-b border-amber-100">
              <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Phân loại & nhắm mục tiêu</span>
            </div>
            <div className="p-5 space-y-5">
              <SingleCheck label="Danh mục" options={ALL_CATEGORIES} value={form.category??"other"} onChange={v=>setField("category",v)} />
              <div className="border-t border-gray-50 pt-5">
                <MultiCheck label="Hoàn cảnh" options={ALL_OCCASIONS} selected={form.occasions??[]} onChange={v=>setField("occasions",v)} />
              </div>
              <MultiCheck label="Giới tính" options={ALL_GENDERS} selected={form.genders??[]} onChange={v=>setField("genders",v)} />
              <MultiCheck label="Loại cơ thể" options={ALL_BODY_TYPES} selected={form.bodyTypes??[]} onChange={v=>setField("bodyTypes",v)} hint="để trống = tất cả" />
              <MultiCheck label="Season" options={ALL_SEASONS} selected={form.seasons??[]} onChange={v=>setField("seasons",v)} hint="để trống = tất cả" />
              <div>
                <Label>Tags</Label>
                <input value={form.tags??""} onChange={e=>setField("tags",e.target.value)}
                  placeholder="áo len, thu đông, vintage, ..."
                  className={inputCls} />
                <p className="text-[11px] text-gray-400 mt-1">Phân cách bằng dấu phẩy</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-6">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 bg-purple-600 text-white text-sm font-bold rounded-2xl hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm">
              {saving?"Đang lưu...":editingId?"Cập nhật sản phẩm":"Lưu sản phẩm"}
            </button>
            <button onClick={()=>{setStep("list");reset();}}
              className="px-5 py-3 border border-gray-200 text-gray-500 text-sm font-semibold rounded-2xl hover:bg-gray-50 transition-colors">
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* ══ LIST ══ */}
      {step==="list" && (
        <div className="p-5">
          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm sản phẩm..."
              className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent" />
          </div>

          {listLoading ? (
            <div className="py-20 text-center text-gray-400">
              <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Đang tải...</p>
            </div>
          ) : filtered.length===0 ? (
            <div className="py-20 text-center text-gray-400">
              <Package className="w-14 h-14 mx-auto mb-3 opacity-20" />
              <p className="font-medium">{search?"Không tìm thấy sản phẩm nào":"Chưa có sản phẩm nào"}</p>
              {!search && <button onClick={openAdd} className="mt-4 px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-2xl hover:bg-purple-700 transition-colors">Thêm sản phẩm đầu tiên</button>}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(p => {
                const seasonCount = (p.seasons??[]).length;
                const shownSeasons = (p.seasons??[]).slice(0,2);
                return (
                  <div key={p._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${p.isActive?"border-gray-100":"border-gray-200 opacity-60"}`}>

                    {/* Ảnh */}
                    <div className="relative h-44 bg-gray-50 flex-shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover"
                          onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-200" />
                        </div>
                      )}
                      {/* Platform badge */}
                      <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${PLATFORM_BADGE[p.platform]??PLATFORM_BADGE.other}`}>
                        {PLATFORM_EMOJI[p.platform]??"🔗"} {PLATFORM_LABEL[p.platform]??p.platform}
                      </span>
                      {/* Status badge */}
                      <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${p.isActive?"bg-green-500 text-white":"bg-gray-400 text-white"}`}>
                        {p.isActive?"Hiện":"Ẩn"}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-3.5 flex flex-col gap-2.5 flex-1">
                      {/* Tên */}
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{p.title}</h3>

                      {/* Giá + danh mục */}
                      <div className="flex items-center gap-2">
                        {p.price ? (
                          <span className="text-purple-600 font-bold text-sm">{p.price.toLocaleString("vi-VN")}đ</span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                        {p.category && (
                          <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-semibold border border-blue-100">{vn(p.category)}</span>
                        )}
                      </div>

                      {/* Occasions + Genders */}
                      {((p.occasions??[]).length>0 || (p.genders??[]).length>0) && (
                        <div className="flex flex-wrap gap-1">
                          {(p.occasions??[]).map(o=>(
                            <span key={o} className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-md border border-purple-100 font-medium">{vn(o)}</span>
                          ))}
                          {(p.genders??[]).map(g=>(
                            <span key={g} className="text-[10px] px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded-md border border-pink-100 font-medium">{vn(g)}</span>
                          ))}
                        </div>
                      )}

                      {/* Seasons */}
                      {seasonCount>0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {shownSeasons.map(s=>(
                            <span key={s} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-100 font-medium">{vn(s)}</span>
                          ))}
                          {seasonCount>2 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md font-medium">+{seasonCount-2} season</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-300">Tất cả season</p>
                      )}

                      {/* Footer */}
                      <div className="mt-auto pt-2.5 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">{p.clickCount??0} lượt click</span>
                        <div className="flex items-center gap-1">
                          <button onClick={()=>handleEdit(p)}
                            className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                            <Edit2 className="w-3 h-3"/> Sửa
                          </button>
                          <button onClick={()=>handleToggleActive(p)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors border ${p.isActive?"bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100":"bg-green-50 text-green-600 border-green-100 hover:bg-green-100"}`}>
                            {p.isActive?"Ẩn đi":"Hiện lên"}
                          </button>
                          <a href={p.affiliateUrl} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Mở link">
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400"/>
                          </a>
                          <button onClick={()=>handleDelete(p._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
