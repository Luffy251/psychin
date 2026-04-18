const Conversation = require("../models/Conversation");
const { getGeminiReply } = require("../services/geminiService");
const { detectMood } = require("../utils/moodDetector");

// ── Config ─────────────────────────────────────────────────────
const MEMORY_WINDOW = 5; // number of recent messages sent as context to AI

const SYSTEM_PROMPTS = {
  therapist: "You are Psycin, an empathetic clinical mental health therapist. Be calm, professional, supportive, and non-judgmental. Guide the user through their emotions carefully.",
  friend: "You are Psycin, a close, casual, and caring friend. Use a relaxed tone, conversational language, and an occasional emoji. Be highly relatable and supportive.",
  motivator: "You are Psycin, an intense, high-energy life coach and motivator. Be direct, aggressively inspiring, action-oriented, and push the user to achieve their absolute best."
};

// ── Crisis keyword check ────────────────────────────────────────
const CRISIS_WORDS = ["suicide", "kill myself", "end my life", "die", "hopeless", "pointless to live", "worthless"];
const CRISIS_REPLY =
  "I'm really sorry you're feeling this way. You are not alone. " +
  "Please reach out to a trusted person or a mental health professional immediately.";

// ── Helper: format messages for Gemini ─────────────────────────
// Prepends the system prompt and maps role names to what Gemini expects
function buildGeminiContext(messages, mode = "therapist") {
  const context = messages.slice(-MEMORY_WINDOW);
  const prompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.therapist;
  
  return [
    {
      role: "user",
      content: prompt,
    },
    ...context.map((m) => ({
      role: m.role === "ai" ? "model" : "user",
      content: m.content,
    })),
  ];
}

// ── POST /api/conversations ─────────────────────────────────────
// Create a new, empty conversation for the logged-in user
exports.createConversation = async (req, res) => {
  console.log("➡️ POST /api/conversations - user:", req.user.id);
  try {
    const conversation = await Conversation.create({
      userId: req.user.id,
      title: req.body.title || "New Conversation",
      messages: [],
    });
    console.log("✅ Conversation created:", conversation._id);
    return res.status(201).json(conversation);
  } catch (error) {
    console.error("❌ createConversation error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/conversations ──────────────────────────────────────
// Return all conversations for the logged-in user (no messages)
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id })
      .select("-messages")
      .sort({ updatedAt: -1 });

    return res.json(conversations);
  } catch (error) {
    console.error("❌ getConversations error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/conversations/:id ──────────────────────────────────
// Return a single conversation with all its messages
exports.getConversation = async (req, res) => {
  console.log("➡️ GET /api/conversations/:id - id:", req.params.id);
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      console.log("⚠️ Conversation not found:", req.params.id);
      return res.status(404).json({ message: "Conversation not found" });
    }

    return res.json(conversation);
  } catch (error) {
    console.error("❌ getConversation error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/conversations/:id/message ────────────────────────
// Append a user message, call Gemini, append AI reply — all in one shot
exports.addMessage = async (req, res) => {
  console.log("➡️ POST /api/conversations/:id/message - id:", req.params.id);
  try {
    const { content, mood, mode } = req.body;

    if (!content || !content.trim()) {
      console.log("⚠️ Empty content received");
      return res.status(400).json({ message: "Message content required" });
    }

    let aiReply = "";
    let isCrisis = false;

    // ⚡ Performance: use $slice projection to load only the last MEMORY_WINDOW
    const conversation = await Conversation.findOne(
      { _id: req.params.id, userId: req.user.id },
      { title: 1, messages: { $slice: -MEMORY_WINDOW }, _id: 1 }
    );

    if (!conversation) {
      console.log("⚠️ Conversation not found for message:", req.params.id);
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Detect mood if not explicitly provided
    const detectedMood = mood || detectMood(content);

    // Append user message to temp array
    const userMsg = { role: "user", content, mood: detectedMood };

    // Crisis guard
    if (CRISIS_WORDS.some((w) => content.toLowerCase().includes(w))) {
      console.log("🚨 Crisis keyword detected:", req.params.id);
      aiReply = CRISIS_REPLY;
      isCrisis = true;
    } else {
      // Temporarily push to conversation.messages for context building
      conversation.messages.push(userMsg);
      // Build the last-5 context window and call Gemini
      const formattedMessages = buildGeminiContext(conversation.messages, mode);
      aiReply = await getGeminiReply(formattedMessages);
    }

    // Persist both new messages in a single atomic $push to avoid
    // re-saving the entire (potentially large) messages array
    const originalLength = isCrisis ? conversation.messages.length : conversation.messages.length - 1;
    const isFirstMessage = originalLength === 0;
    
    const newTitle =
      isFirstMessage
        ? content.length > 50
          ? content.substring(0, 47) + "\u2026"
          : content
        : null;

    const updateOp = {
      $push: {
        messages: {
          $each: [
            userMsg,
            { role: "ai", content: aiReply },
          ],
        },
      },
    };

    if (newTitle) updateOp.$set = { title: newTitle };

    await Conversation.updateOne(
      { _id: req.params.id },
      updateOp
    );

    return res.json({
      reply: aiReply,
      conversationId: conversation._id,
      title: newTitle || conversation.title,
      isCrisis
    });
  } catch (error) {
    console.error("❌ addMessage error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
