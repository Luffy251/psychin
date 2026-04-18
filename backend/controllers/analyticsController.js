const Conversation = require("../models/Conversation");

exports.getMoodAnalytics = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id });
    
    // Aggregating mood counts
    const moodCounts = {
      happy: 0,
      sad: 0,
      anxious: 0,
      neutral: 0
    };

    let totalMessagesAnalyzed = 0;

    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.role === "user" && msg.mood) {
          if (moodCounts[msg.mood] !== undefined) {
            moodCounts[msg.mood]++;
            totalMessagesAnalyzed++;
          }
        }
      });
    });

    // Formatting for Recharts
    const distribution = Object.entries(moodCounts)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      .filter(item => item.value > 0);

    return res.json({
      distribution,
      totalMessagesAnalyzed,
      rawCounts: moodCounts
    });

  } catch (error) {
    console.error("❌ getMoodAnalytics error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
