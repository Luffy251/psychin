const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

let genAI;
let model;

// Updated list of models based on available models in the user's project
const MODELS = [
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-1.5-flash",
    "gemini-pro",
    "gemini-1.0-pro"
];

function initializeGemini() {
    if (!genAI) {
        if (!process.env.GEMINI_API_KEY) {
            console.error("❌ GEMINI_API_KEY is missing from environment variables.");
            throw new Error("GEMINI_API_KEY missing");
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
}

async function generateWithFallback(messages) {
    initializeGemini();

    // Prepare history and last message once
    const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "ai" || msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.content }],
    }));
    const lastMessage = messages[messages.length - 1].content;

    let lastError;

    for (const modelName of MODELS) {
        try {
            // console.log(`Attempting model: ${modelName}`); 
            const currentModel = genAI.getGenerativeModel({ model: modelName });

            const chat = currentModel.startChat({
                history: history,
                generationConfig: { maxOutputTokens: 1000 },
            });

            const result = await chat.sendMessage(lastMessage);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.warn(`⚠️ Model ${modelName} failed: ${error.message}`);
            lastError = error;
        }
    }

    throw lastError || new Error("All models failed");
}

async function getGeminiReply(messages) {
    try {
        if (!messages || messages.length === 0) {
            throw new Error("No messages provided");
        }

        return await generateWithFallback(messages);

    } catch (error) {
        console.error("❌ Gemini API error:", error);
        throw error;
    }
}

module.exports = { getGeminiReply };
