import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // ✅ FIXED PATH
import MessageBubble from "../components/MessageBubble";
import NeuralFace3D from "../components/NeuralFace3D";
import "./chat.css";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hi, I'm Psycin. You can drop your thoughts here — this is a safe, private space. 💙",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // ✅ USE CENTRAL API (NO localhost)
      const res = await api.post(
        "/api/chat",
        { content: userMessage.content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: res.data.reply },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Sorry, I lost my train of thought. Let's try that again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-root">
      {/* Background */}
      <div className="chat-bg-layer">
        <NeuralFace3D />
      </div>
      <div className="chat-bg-overlay" />

      {/* Chat container */}
      <div className="chat-container">

        {/* Header */}
        <div className="chat-header">
          <div className="chat-brand">
            <div className="chat-brand-icon">🧠</div>
            <div className="chat-brand-text">
              <h3 className="chat-title">Psycin</h3>
              <p className="chat-subtitle">AI Reflection Space</p>
            </div>
          </div>

          <div className="chat-header-right">
            <div className="chat-status">
              <span className="chat-status-dot" />
              Online
            </div>
            <button className="chat-logout" onClick={handleLogout}>
              End Session
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <MessageBubble
              key={index}
              role={msg.role}
              content={msg.content}
            />
          ))}

          {loading && (
            <div className="chat-typing">
              <div className="typing-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="chat-typing-label">
                Thinking softly...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What's floating in your mind?"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />

            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          <p className="chat-input-hint">
            Enter to send · Your conversations are private & encrypted
          </p>
        </div>

      </div>
    </div>
  );
}