const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DriverProfile"
  },
  pickup: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  pickupCoordinates: {
    lat: { type: Number, default: 13.0805 },
    lng: { type: Number, default: 77.5458 }
  },
  destinationCoordinates: {
    lat: { type: Number, default: 13.0760 },
    lng: { type: Number, default: 77.5580 }
  },
  distance: {
    type: Number,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ["Bike", "Car"],
    default: "Bike"
  },
  pinkRide: {
    type: Boolean,
    default: false
  },
  fare: {
    type: Number,
    required: true
  },
  eta: {
    type: Number,
    default: 5
  },
  otp: {
    type: String,
    default: "3060"
  },
  otpHash: {
    type: String
  },
  status: {
    type: String,
    enum: [
      "REQUESTED",
      "DRIVER_ASSIGNED",
      "DRIVER_ARRIVING",
      "RIDE_STARTED",
      "RIDE_COMPLETED",
      "CANCELLED"
    ],
    default: "REQUESTED"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending"
  },
  paymentMethod: {
    type: String,
    enum: ["UPI", "Cash"],
    default: "UPI"
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedbackComment: {
    type: String
  },
  routePath: [
    { type: String }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.models.Ride || mongoose.model("Ride", rideSchema);
