import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MessageBubble from "../components/MessageBubble";
import NeuralFace3D from "../components/NeuralFace3D";
import ConversationSidebar from "../components/ConversationSidebar";
import {
  createConversation,
  getConversation,
  addMessage,
} from "../services/conversationService";
import "./chat.css";

const WELCOME_MSG = {
  role: "ai",
  content: "Hi, I'm Psycin. You can drop your thoughts here — this is a safe, private space. 💙",
};

export default function Chat() {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Conversation state
  const [conversationId, setConversationId] = useState(null);
  const [sidebarRefresh, setSidebarRefresh] = useState(0); // bump to re-fetch sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiMode, setAiMode] = useState("therapist");
  const [crisisAlert, setCrisisAlert] = useState(false);

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Load a conversation by id ─────────────────────────────────
  const loadConversation = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await getConversation(id);
      const conv = res.data;
      setConversationId(conv._id);

      const loaded = conv.messages.length > 0
        ? conv.messages.map((m) => ({ role: m.role, content: m.content }))
        : [WELCOME_MSG];

      setMessages(loaded);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Start a fresh chat ────────────────────────────────────────
  const handleNewChat = () => {
    setConversationId(null);
    setMessages([WELCOME_MSG]);
    setInput("");
  };

  // ── Select existing from sidebar ──────────────────────────────
  const handleSelectConversation = (id) => {
    if (id === conversationId) return;
    loadConversation(id);
  };

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ── Send message ──────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let activeId = conversationId;

      // First message in a new chat → create conversation
      if (!activeId) {
        const res = await createConversation("New Conversation");
        activeId = res.data._id;
        setConversationId(activeId);
      }

      // Send message and get AI reply, passing the mode
      const res = await addMessage(activeId, userMessage.content, null, aiMode);

      if (res.data.isCrisis) {
        setCrisisAlert(true);
      }

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: res.data.reply },
      ]);

      // Refresh sidebar (new conv title may have been set)
      setSidebarRefresh((n) => n + 1);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Sorry, I lost my train of thought. Let's try that again.",
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

      {/* Sidebar toggle (mobile / collapse) */}
      <button
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label="Toggle sidebar"
        id="sidebar-toggle-btn"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Crisis Alert Modal */}
      {crisisAlert && (
        <div className="crisis-modal-overlay">
          <div className="crisis-modal">
            <div className="crisis-icon">🚨</div>
            <h3>You are not alone.</h3>
            <p>
              It sounds like you're going through an incredibly difficult time right now. 
              Please remember that there is support available. Your life is valuable.
            </p>
            <div className="crisis-resources">
              <strong>National Suicide Prevention Lifeline:</strong> <span>988</span> or <span>1-800-273-8255</span><br/>
              <strong>Emergency:</strong> <span>911</span>
            </div>
            <button className="crisis-close-btn" onClick={() => setCrisisAlert(false)}>
              I understand
            </button>
          </div>
        </div>
      )}

      {/* Main layout: sidebar + chat panel */}
      <div className="chat-layout">

        {/* Sidebar */}
        <ConversationSidebar
          activeId={conversationId}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          refreshTrigger={sidebarRefresh}
          collapsed={!sidebarOpen}
        />

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
              <select 
                className="chat-mode-select" 
                value={aiMode} 
                onChange={(e) => setAiMode(e.target.value)}
                disabled={loading}
              >
                <option value="therapist">Therapist</option>
                <option value="friend">Friend</option>
                <option value="motivator">Motivator</option>
              </select>

              <div className="chat-status">
                <span className="chat-status-dot" />
                Online
              </div>
              <button className="chat-logout" onClick={() => navigate("/dashboard")} style={{ marginLeft: "8px" }}>
                Analytics
              </button>
              <button className="chat-logout" onClick={handleLogout} style={{ marginLeft: "8px" }}>
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
                <span className="chat-typing-label">Thinking softly...</span>
              </div>
            )}

            <div ref={messagesEndRef} id="chat-messages-end" />
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
                id="chat-input"
              />

              <button
                className="chat-send-btn"
                onClick={sendMessage}
                disabled={loading}
                id="chat-send-btn"
              >
                <svg viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>

            <p className="chat-input-hint">
              Enter to send · Your conversations are private &amp; encrypted
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}