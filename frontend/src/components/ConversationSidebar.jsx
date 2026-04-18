import { useEffect, useState } from "react";
import { getConversations } from "../services/conversationService";
import "./ConversationSidebar.css";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ConversationSidebar({
  activeId,
  onSelect,
  onNew,
  refreshTrigger,
  collapsed,
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConvs = async () => {
      try {
        setLoading(true);
        const res = await getConversations();
        setConversations(res.data);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConvs();
  }, [refreshTrigger]);

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <p className="sidebar-title">History</p>
        </div>

        <button className="sidebar-new-btn" onClick={onNew} id="new-conversation-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Chat
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="sidebar-shimmer">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="sidebar-shimmer-item" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="sidebar-empty">
          <span className="sidebar-empty-icon">💬</span>
          <p className="sidebar-empty-text">No conversations yet.<br />Start a new chat!</p>
        </div>
      ) : (
        <ul className="sidebar-list">
          {conversations.map((conv) => (
            <li
              key={conv._id}
              className={`sidebar-item${conv._id === activeId ? " active" : ""}`}
              onClick={() => onSelect(conv._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(conv._id)}
              id={`conv-${conv._id}`}
            >
              <span className="sidebar-item-icon">🧠</span>
              <div className="sidebar-item-text">
                <p className="sidebar-item-title">{conv.title}</p>
                <p className="sidebar-item-date">{timeAgo(conv.updatedAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        Your sessions are private &amp; encrypted
      </div>
    </aside>
  );
}
