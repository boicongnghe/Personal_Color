import { motion } from "motion/react";

interface Props {
  message: { text?: string; image?: string };
}

export function UserMessage({ message }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        maxWidth: "80%",
        alignSelf: "flex-end",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
      }}
    >
      {message.image && (
        <div style={{ borderRadius: 16, borderBottomRightRadius: 4, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
          <img
            src={message.image}
            alt="outfit"
            style={{ width: 160, height: 200, objectFit: "cover", display: "block" }}
          />
        </div>
      )}
      {message.text && (
        <div style={{
          background: "linear-gradient(135deg,#9333ea,#ec4899,#60a5fa)",
          borderRadius: 18,
          borderBottomRightRadius: 4,
          padding: "10px 14px",
          boxShadow: "0 2px 8px rgba(147,51,234,0.25)",
        }}>
          <p style={{ fontSize: 13, color: "white", margin: 0, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
            {message.text}
          </p>
        </div>
      )}
    </motion.div>
  );
}
