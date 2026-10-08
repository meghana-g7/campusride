const express = require("express");
const router = express.Router();
const {
  getNearbyDrivers,
  getDriverProfile,
  registerDriverProfile,
  updateAvailability
} = require("../controllers/driverController");
const authMiddleware = require("../middleware/auth");

router.get("/nearby", getNearbyDrivers);
router.get("/profile", authMiddleware, getDriverProfile);
router.post("/profile", authMiddleware, registerDriverProfile);
router.patch("/availability", authMiddleware, updateAvailability);

module.exports = router;
