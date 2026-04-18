const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");

dotenv.config();

connectDB();

const app = express();

// ✅ Allowed frontend origins
const allowedOrigins = [
  "https://psychin.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173", // Vite dev server (just in case)
];

// ✅ CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

// Apply CORS globally
app.use(cors(corsOptions));

// ✅ FIX: proper preflight handling (NO "*")
app.options(/.*/, cors(corsOptions));

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("Psycin backend is running");
});

// ❌ NO wildcard route like "*" here (Express v5 breaks it)
// If you want 404 handler, use this safely:
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});