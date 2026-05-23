import { motion } from "motion/react";

interface Analysis {
  score: number;
  suitable: boolean;
  occasion: string;
  feedback: string;
  tips: string[];
  colorNote?: string;
  followUp?: string;
}

interface Props {
  message: { text?: string; analysis?: Analysis };
  onFollowUp?: (text: string) => void;
}

function getLabel(score: number) {
  if (score >= 80) return "Rất phù hợp";
  if (score >= 60) return "Phù hợp";
  if (score >= 40) return "Tạm ổn";
  return "Chưa phù hợp";
}
function getScoreColor(score: number) {
  if (score >= 80) return "#16A34A";
  if (score >= 60) return "#CA8A04";
  return "#DC2626";
}
function getScoreBg(score: number) {
  if (score >= 80) return "#F0FDF4";
  if (score >= 60) return "#FEFCE8";
  return "#FEF2F2";
}
function getScoreBorder(score: number) {
  if (score >= 80) return "#BBF7D0";
  if (score >= 60) return "#FDE68A";
  return "#FECACA";
}
function getLabelEmoji(score: number) {
  if (score >= 80) return "✅";
  if (score >= 60) return "👍";
  return "⚠️";
}

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p style={{ fontSize: 13, lineHeight: 1.65, color: "#2A1F14", margin: 0, whiteSpace: "pre-wrap" }}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </p>
  );
}

export function AssistantMessage({ message, onFollowUp }: Props) {
  const { text, analysis } = message;
  const rawScore = analysis?.score;
  const score    = rawScore !== undefined && rawScore !== null ? Number(rawScore) : null;
  const hasScore = score !== null && !isNaN(score);

  const color  = hasScore ? getScoreColor(score!)  : "#9333ea";
  const bg     = hasScore ? getScoreBg(score!)     : "#faf5ff";
  const border = hasScore ? getScoreBorder(score!) : "#e9d5ff";
  const emoji  = hasScore ? getLabelEmoji(score!)  : "💬";
  const label  = hasScore ? getLabel(score!)       : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ maxWidth: "88%", alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 8 }}
    >
      {/* Avatar row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 10,
          background: "linear-gradient(135deg,#9333ea,#ec4899)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 13 }}>✨</span>
        </div>
        <span style={{ fontSize: 11, color: "#9333ea", fontWeight: 600 }}>Clarity AI</span>
      </div>

      {/* Score card */}
      {hasScore && analysis && score !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: "12px 14px" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 17 }}>{emoji}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color }}>{label}</div>
                {analysis.occasion && (
                  <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{analysis.occasion}</div>
                )}
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{score}%</div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, background: "rgba(0,0,0,0.08)", borderRadius: 99, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              style={{ height: "100%", background: color, borderRadius: 99 }}
            />
          </div>
        </motion.div>
      )}

      {/* Text bubble */}
      {text && (
        <div style={{
          background: "#FFFCF8",
          border: "0.5px solid #E8D5A3",
          borderRadius: 16,
          borderTopLeftRadius: 4,
          padding: "12px 14px",
        }}>
          <FormattedText text={text} />
        </div>
      )}

      {/* Suggestions */}
      {analysis?.tips && analysis.tips.length > 0 && (
        <div style={{
          background: "#FFFCF8",
          border: "0.5px solid #E8D5A3",
          borderRadius: 16,
          borderTopLeftRadius: 4,
          padding: "12px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 13 }}>✨</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#C4963A", letterSpacing: "0.6px", textTransform: "uppercase" as const }}>
              Gợi ý phối đồ
            </span>
          </div>
          {analysis.tips.map((tip, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              marginBottom: i < analysis.tips.length - 1 ? 9 : 0,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "#9333ea", color: "white",
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 13, color: "#4A3520", lineHeight: 1.55 }}>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* Color note */}
      {analysis?.colorNote && (
        <div style={{
          background: "linear-gradient(135deg,#FFF8F0,#FFF3E0)",
          border: "0.5px solid #FFD580",
          borderRadius: 12,
          padding: "10px 14px",
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>🎨</span>
          <span style={{ fontSize: 12, color: "#7A4F00", lineHeight: 1.55 }}>{analysis.colorNote}</span>
        </div>
      )}

      {/* Follow-up chip */}
      {analysis?.followUp && onFollowUp && (
        <button
          onClick={() => onFollowUp(analysis.followUp!)}
          style={{
            alignSelf: "flex-start",
            background: "transparent",
            border: "1px solid #9333ea",
            borderRadius: 20,
            padding: "6px 14px",
            fontSize: 12,
            color: "#9333ea",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#9333ea"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9333ea"; }}
        >
          <span>💬</span>
          <span>{analysis.followUp}</span>
        </button>
      )}
    </motion.div>
  );
}

export function LoadingBubble() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 4 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 10,
        background: "linear-gradient(135deg,#9333ea,#ec4899)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13 }}>✨</span>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "12px 16px",
        background: "#FFFCF8",
        border: "0.5px solid #E8D5A3",
        borderRadius: 16, borderBottomLeftRadius: 4,
      }}>
        {[0, 0.18, 0.36].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay, ease: "easeInOut" }}
            style={{ width: 7, height: 7, borderRadius: "50%", background: "#C4963A" }}
          />
        ))}
      </div>
    </div>
  );
}
