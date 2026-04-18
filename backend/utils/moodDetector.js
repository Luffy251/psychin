// Utility to detect basic mood from text
// Returns: "sad", "happy", "anxious", or "neutral"

const MOOD_KEYWORDS = {
  sad: ["sad", "depressed", "down", "lonely", "unhappy", "cry", "crying", "hopeless", "miserable"],
  happy: ["happy", "great", "good", "excited", "joy", "glad", "awesome", "perfect"],
  anxious: ["anxious", "worried", "nervous", "scared", "fear", "panic", "stress", "stressed", "overwhelmed"],
};

function detectMood(text) {
  if (!text || typeof text !== "string") return "neutral";
  
  const lowerText = text.toLowerCase();
  
  let detectedMood = "neutral";
  let maxMatches = 0;

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    let matchCount = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        matchCount++;
      }
    }
    
    if (matchCount > maxMatches) {
      maxMatches = matchCount;
      detectedMood = mood;
    }
  }

  return detectedMood;
}

module.exports = { detectMood };
