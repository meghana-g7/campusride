const mongoose = require("mongoose");

const driverProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  usn: {
    type: String
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "male"
  },
  profileImage: {
    type: String,
    default: "https://api.dicebear.com/7.x/avataaars/svg?seed=Driver"
  },
  vehicleType: {
    type: String,
    enum: ["Bike", "Car"],
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true
  },
  vehicleModel: {
    type: String,
    default: "TVS Jupiter"
  },
  rcNumber: {
    type: String
  },
  rcDocument: {
    type: String
  },
  identityDocument: {
    type: String
  },
  faceVerificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "verified"
  },
  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "verified"
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5
  },
  completedRides: {
    type: Number,
    default: 15
  },
  availability: {
    type: String,
    enum: ["Available", "On Ride", "Offline"],
    default: "Available"
  },
  latitude: {
    type: Number,
    default: 13.0805
  },
  longitude: {
    type: Number,
    default: 77.5458
  },
  currentLocationName: {
    type: String,
    default: "MS Palya"
  },
  pinkRideEligible: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.DriverProfile || mongoose.model("DriverProfile", driverProfileSchema);
