import api from "./api";

// Create a new empty conversation
export const createConversation = (title) =>
  api.post("/api/conversations", { title });

// Get all conversations for the user (no messages)
export const getConversations = () => api.get("/api/conversations");

// Get a single conversation with all messages
export const getConversation = (id) => api.get(`/api/conversations/${id}`);

// Add a user message to a conversation, returns AI reply
export const addMessage = (id, content, mood = null, mode = "therapist") =>
  api.post(`/api/conversations/${id}/message`, { content, mood, mode });
