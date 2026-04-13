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
];

// ✅ CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// ✅ IMPORTANT: handle preflight requests
app.options("*", cors());

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("Psycin backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});