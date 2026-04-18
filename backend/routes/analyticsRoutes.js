const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getMoodAnalytics } = require("../controllers/analyticsController");

router.use(authMiddleware);

router.get("/mood", getMoodAnalytics);

module.exports = router;
