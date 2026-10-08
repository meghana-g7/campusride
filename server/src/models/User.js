const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  collegeEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: ""
  },
  classDepartment: {
    type: String,
    trim: true,
    default: "6th Sem, CSE"
  },
  usn: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["passenger", "driver", "both"],
    default: "passenger"
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "female"
  },
  profileImage: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
