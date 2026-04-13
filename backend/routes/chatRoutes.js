const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const { getGeminiReply } = require("../services/geminiService");

// 🔹 POST chat message
router.post("/", authMiddleware, async (req, res) => {
  console.log("✅ Chat route hit");

  try {
    console.log("📩 Request body:", req.body);

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    // 🔐 Crisis keyword check
    const crisisWords = ["suicide", "kill myself", "end my life"];
    if (crisisWords.some(word => content.toLowerCase().includes(word))) {
      return res.json({
        reply:
          "I'm really sorry you're feeling this way. You are not alone. Please reach out to a trusted person or a mental health professional immediately.",
      });
    }

    // Save user message
    await Message.create({
      user: req.user.id,
      role: "user",
      content,
    });

    console.log("💾 User message saved");

    // Fetch last 15 messages
    const history = await Message.find({ user: req.user.id })
      .sort({ createdAt: 1 })
      .limit(15);

    console.log("📜 History length:", history.length);

    // Format messages for Gemini (IMPORTANT)
    const formattedMessages = [
      {
        role: "user",
        content:
          "You are Psycin, an empathetic mental health support chatbot. Be calm, supportive, and non-judgmental.",
      },
      ...history.map((msg) => ({
        role: msg.role === "ai" ? "model" : "user",
        content: msg.content,
      })),
    ];

    console.log("🚀 Calling Gemini with messages:", formattedMessages.length);

    // Call Gemini
    const aiReply = await getGeminiReply(formattedMessages);

    console.log("✅ Gemini responded");

    // Save AI reply
    await Message.create({
      user: req.user.id,
      role: "ai",
      content: aiReply,
    });

    console.log("💾 AI reply saved");

    return res.json({ reply: aiReply });

  } catch (error) {
    console.error("❌ Chat error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
