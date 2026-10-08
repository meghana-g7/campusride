const express = require("express");
const router = express.Router();
const {
  createRide,
  getRideById,
  updateRideStatus,
  submitFeedback,
  getRideHistory
} = require("../controllers/rideController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, createRide);
router.get("/history", authMiddleware, getRideHistory);
router.get("/:id", authMiddleware, getRideById);
router.patch("/:id/status", authMiddleware, updateRideStatus);
router.post("/:id/feedback", authMiddleware, submitFeedback);

module.exports = router;
