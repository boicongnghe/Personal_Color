import { useNavigate } from "react-router";
import { ArrowLeft, Trash2, ScanFace, ChevronRight, Sparkles } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { COLOR_TYPES } from "../data/colorTypes";
import { motion, AnimatePresence } from "motion/react";

const SEASON_VI: Record<string, string> = {
  Autumn: "Mùa Thu",
  Summer: "Mùa Hè",
  Spring: "Mùa Xuân",
  Winter: "Mùa Đông",
};

const SEASON_GRADIENT: Record<string, string> = {
  Autumn: "from-amber-400 to-orange-500",
  Summer: "from-sky-400 to-blue-500",
  Spring: "from-green-400 to-emerald-500",
  Winter: "from-indigo-500 to-purple-600",
};

export function ScanHistory() {
  const navigate = useNavigate();
  const { t, scanHistory, deleteScanHistory, setLastScanResultId, language } = useAppContext();

  const handleView = (colorTypeId: string) => {
    setLastScanResultId(colorTypeId);
    navigate("/analysis-result");
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-10 overflow-x-hidden">
      {/* Header */}
      <div className="px-5 pb-4" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors bg-white shadow-sm mb-4"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{t("scanHistory")}</h1>
        <p className="text-gray-500 mt-1">
          {scanHistory.length} {t("scanCount")} · {COLOR_TYPES.length} nhóm màu có thể nhận
        </p>
      </div>

      {/* Color type collection chips */}
      {scanHistory.length > 0 && (
        <div className="px-6 mb-5">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Các tông màu đã nhận ({scanHistory.length}/{COLOR_TYPES.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {scanHistory.map((scan) => {
                const ct = COLOR_TYPES.find(c => c.id === scan.colorTypeId);
                if (!ct) return null;
                return (
                  <div
                    key={scan.id}
                    className={`flex items-center gap-1.5 bg-gradient-to-r ${SEASON_GRADIENT[ct.season] ?? "from-purple-400 to-pink-400"} text-white text-xs font-bold px-3 py-1.5 rounded-full`}
                  >
                    <Sparkles className="w-3 h-3" />
                    {language === "vi" ? ct.nameVi : ct.name}
                  </div>
                );
              })}
              {/* Remaining unlocked slots */}
              {(() => {
                const usedIds = new Set(scanHistory.map(s => s.colorTypeId));
                const remaining = COLOR_TYPES.filter(ct => !usedIds.has(ct.id));
                return remaining.slice(0, 3).map(ct => (
                  <div
                    key={ct.id}
                    className="flex items-center gap-1.5 bg-gray-100 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-full"
                  >
                    <span className="w-3 h-3 rounded-full border-2 border-gray-300 border-dashed" />
                    {language === "vi" ? ct.nameVi : ct.name}
                  </div>
                ));
              })()}
              {(() => {
                const usedIds = new Set(scanHistory.map(s => s.colorTypeId));
                const remaining = COLOR_TYPES.filter(ct => !usedIds.has(ct.id));
                if (remaining.length > 3) return (
                  <div className="bg-gray-100 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-full">
                    +{remaining.length - 3} chưa khám phá
                  </div>
                );
                return null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* History list */}
      <div className="px-6 space-y-4">
        {scanHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScanFace className="w-10 h-10 text-purple-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("noScanHistory")}</h3>
            <p className="text-gray-500 text-sm">{t("noScanHistoryDesc")}</p>
            <button
              onClick={() => navigate("/scan")}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-2xl font-semibold shadow-md"
            >
              {t("scanFace")}
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {scanHistory.map((scan, index) => {
              const ct = COLOR_TYPES.find(c => c.id === scan.colorTypeId);
              const gradient = ct ? SEASON_GRADIENT[ct.season] : "from-purple-400 to-pink-400";

              return (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-purple-100 shadow-sm rounded-2xl overflow-hidden"
                >
                  <div
                    className="flex gap-4 items-center p-4 cursor-pointer hover:bg-purple-50/50 transition-colors"
                    onClick={() => handleView(scan.colorTypeId)}
                  >
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={scan.image}
                        alt={scan.colorType}
                        className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                      />
                      {/* Season gradient stripe */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient} rounded-b-xl`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          #{scanHistory.length - index}
                        </span>
                        {ct && (
                          <span className={`text-[10px] font-bold text-white bg-gradient-to-r ${gradient} px-2 py-0.5 rounded-full`}>
                            {SEASON_VI[ct.season] ?? ct.season}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm leading-tight mb-0.5">
                        {language === "vi" ? (ct?.nameVi ?? scan.colorType) : (ct?.name ?? scan.colorType)}
                      </h3>
                      {ct && (
                        <p className="text-xs text-gray-500 mb-1">
                          {language === "vi" ? ct.undertoneVi : ct.undertone} · {language === "vi" ? ct.contrastVi : ct.contrast}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">{scan.date}</p>

                      {/* Best colors mini strip */}
                      {ct && (
                        <div className="flex gap-1 mt-2">
                          {ct.bestColors.slice(0, 5).map((c, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full ring-1 ring-white ring-offset-1 shadow-sm"
                              style={{ backgroundColor: c.hex }}
                              title={c.nameVi}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>

                  {/* Delete button */}
                  <div className="border-t border-gray-50 px-4 py-2 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(t("confirmDeleteHistory"))) deleteScanHistory(scan.id);
                      }}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors py-1 px-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Scan more CTA */}
      {scanHistory.length > 0 && (
        <div className="px-6 mt-6">
          <button
            onClick={() => navigate("/scan")}
            className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
          >
            <ScanFace className="w-5 h-5" />
            Quét thêm để khám phá tông màu mới
          </button>
        </div>
      )}
    </div>
  );
}
