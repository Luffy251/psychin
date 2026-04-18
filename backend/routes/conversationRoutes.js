const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createConversation,
  getConversations,
  getConversation,
  addMessage,
} = require("../controllers/conversationController");

// All routes are protected
router.use(authMiddleware);

router.post("/", createConversation);
router.get("/", getConversations);
router.get("/:id", getConversation);
router.post("/:id/message", addMessage);

module.exports = router;
