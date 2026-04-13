/* eslint-disable react/prop-types */
export default function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        width: "100%",
        animation: "bubbleFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards",
      }}
    >
      {/* AI avatar dot */}
      {!isUser && (
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(129,140,248,0.4), rgba(0,229,255,0.3))",
            border: "1px solid rgba(129,140,248,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            flexShrink: 0,
            marginRight: "10px",
            marginTop: "4px",
            boxShadow: "0 0 12px rgba(129,140,248,0.2)",
          }}
        >
          🧠
        </div>
      )}

      <div
        style={{
          padding: "13px 18px",
          borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
          maxWidth: "72%",
          background: isUser
            ? "linear-gradient(135deg, rgba(129,140,248,0.22), rgba(0,229,255,0.12))"
            : "rgba(255, 255, 255, 0.055)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: isUser
            ? "1px solid rgba(129,140,248,0.25)"
            : "1px solid rgba(255, 255, 255, 0.07)",
          boxShadow: isUser
            ? "0 4px 20px rgba(129,140,248,0.12)"
            : "0 4px 20px rgba(0,0,0,0.25)",
          fontSize: "15px",
          lineHeight: "1.65",
          color: "#f1f5f9",
        }}
      >
        {content}
      </div>

      <style>{`
        @keyframes bubbleFadeUp {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
