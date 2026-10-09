const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const DriverProfile = require("../models/DriverProfile");
const mockStore = require("../store/mockStore");
const { isMongoConnected } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "campusride_secure_jwt_secret_key_2026";

const generateToken = (userId, email, role) => {
  return jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: "30d" });
};

// Register User
const register = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      collegeEmail,
      classDepartment,
      usn,
      password,
      confirmPassword,
      role,
      gender,
      idCardImage,
      faceImage,
      isFaceVerified
    } = req.body;

    if (!name || !phone || !email || !usn || !password) {
      return res.status(400).json({ success: false, message: "Name, Phone, Email, USN, and Password are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    // Normalization
    const cleanUsn = usn.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCollegeEmail = collegeEmail ? collegeEmail.trim().toLowerCase() : `${cleanUsn.toLowerCase()}@sambhram.org`;
    const cleanClassDept = classDepartment ? classDepartment.trim() : "6th Sem, CSE";
    const cleanPhone = phone.trim();

    // Check unique email, USN, phone in Mongo or MockStore
    if (isMongoConnected()) {
      const existingUser = await User.findOne({
        $or: [
          { email: cleanEmail },
          { collegeEmail: cleanCollegeEmail },
          { usn: cleanUsn },
          { phone: cleanPhone }
        ]
      });

      if (existingUser) {
        if (existingUser.email === cleanEmail) {
          return res.status(400).json({ success: false, message: "Email is already registered." });
        }
        if (existingUser.usn === cleanUsn) {
          return res.status(400).json({ success: false, message: "College USN is already registered." });
        }
        if (existingUser.phone === cleanPhone) {
          return res.status(400).json({ success: false, message: "Phone number is already registered." });
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        phone: cleanPhone,
        email: cleanEmail,
        collegeEmail: cleanCollegeEmail,
        classDepartment: cleanClassDept,
        usn: cleanUsn,
        passwordHash,
        role: role || "passenger",
        gender: gender || "female",
        profileImage: faceImage || "",
        idCardImage: idCardImage || "",
        faceImage: faceImage || "",
        isFaceVerified: !!isFaceVerified
      });

      // Also mirror to mock store for fast retrieval
      mockStore.addUser({
        _id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        collegeEmail: user.collegeEmail,
        classDepartment: user.classDepartment,
        usn: user.usn,
        passwordHash: user.passwordHash,
        role: user.role,
        gender: user.gender,
        idCardImage: user.idCardImage,
        faceImage: user.faceImage,
        isFaceVerified: user.isFaceVerified
      });

      const token = generateToken(user._id, user.email, user.role);

      return res.status(201).json({
        success: true,
        message: "Registration successful.",
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          collegeEmail: user.collegeEmail,
          classDepartment: user.classDepartment,
          usn: user.usn,
          role: user.role,
          gender: user.gender,
          idCardImage: user.idCardImage,
          faceImage: user.faceImage,
          isFaceVerified: user.isFaceVerified
        }
      });
    } else {
      // MockStore fallback
      if (mockStore.findUserByIdentifier(cleanEmail)) {
        return res.status(400).json({ success: false, message: "Email is already registered." });
      }
      if (mockStore.findUserByIdentifier(cleanUsn)) {
        return res.status(400).json({ success: false, message: "College USN is already registered." });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = mockStore.addUser({
        name,
        phone: cleanPhone,
        email: cleanEmail,
        collegeEmail: cleanCollegeEmail,
        classDepartment: cleanClassDept,
        usn: cleanUsn,
        passwordHash,
        role: role || "passenger",
        gender: gender || "female",
        idCardImage: idCardImage || "",
        faceImage: faceImage || "",
        isFaceVerified: !!isFaceVerified
      });

      const token = generateToken(newUser._id, newUser.email, newUser.role);

      return res.status(201).json({
        success: true,
        message: "Registration successful (Demo Mode).",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
          collegeEmail: newUser.collegeEmail,
          classDepartment: newUser.classDepartment,
          usn: newUser.usn,
          role: newUser.role,
          gender: newUser.gender,
          idCardImage: newUser.idCardImage,
          faceImage: newUser.faceImage,
          isFaceVerified: newUser.isFaceVerified
        }
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Server error during registration." });
  }
};

// Login User (Supports Email, College Email, USN, or Phone Number)
const login = async (req, res) => {
  try {
    const { email, password, usn, phone, identifier: rawIdentifier } = req.body;
    const identifier = (rawIdentifier || email || usn || phone || "").trim();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Identifier (Email, College Email, USN, or Phone) and password are required." });
    }

    const cleanIdentifier = identifier.toLowerCase();
    const cleanUpper = identifier.toUpperCase();
    let user = null;
    let driverProfile = null;

    if (isMongoConnected()) {
      user = await User.findOne({
        $or: [
          { email: cleanIdentifier },
          { collegeEmail: cleanIdentifier },
          { usn: cleanUpper },
          { phone: identifier }
        ]
      });
    }

    // Fallback to mock store if Mongo didn't find or is off
    if (!user) {
      user = mockStore.findUserByIdentifier(identifier);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials. User not found with provided Email, College Email, or USN." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password." });
    }

    const userIdStr = user._id ? user._id.toString() : user.id;

    // Check driver profile if applicable
    if (isMongoConnected()) {
      driverProfile = await DriverProfile.findOne({ userId: user._id });
    }
    if (!driverProfile) {
      driverProfile = mockStore.getDriverByUserId(userIdStr);
    }

    const token = generateToken(userIdStr, user.email, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: userIdStr,
        name: user.name,
        phone: user.phone,
        email: user.email,
        collegeEmail: user.collegeEmail || `${user.usn.toLowerCase()}@sambhram.org`,
        classDepartment: user.classDepartment || "6th Sem, CSE",
        usn: user.usn,
        role: user.role,
        gender: user.gender,
        idCardImage: user.idCardImage || "",
        faceImage: user.faceImage || "",
        isFaceVerified: !!user.isFaceVerified
      },
      driverProfile: driverProfile || null
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    let user = null;
    let driverProfile = null;

    if (isMongoConnected()) {
      user = await User.findById(userId).select("-passwordHash");
      driverProfile = await DriverProfile.findOne({ userId });
    }

    if (!user) {
      user = mockStore.findUserById(userId);
    }
    if (!driverProfile) {
      driverProfile = mockStore.getDriverByUserId(userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        collegeEmail: user.collegeEmail || `${user.usn.toLowerCase()}@sambhram.org`,
        classDepartment: user.classDepartment || "6th Sem, CSE",
        usn: user.usn,
        role: user.role,
        gender: user.gender
      },
      driverProfile: driverProfile || null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve user profile." });
  }
};

// Switch user role (e.g. Passenger <-> Driver)
const switchRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.id;

    if (!role || !["passenger", "driver"].includes(role)) {
      return res.status(400).json({ success: false, message: "Valid role is required." });
    }

    if (isMongoConnected()) {
      await User.findByIdAndUpdate(userId, { role });
    }

    const mockUser = mockStore.findUserById(userId);
    if (mockUser) {
      mockUser.role = role;
    }

    return res.json({ success: true, message: `Switched mode to ${role}.`, role });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to switch role." });
  }
};

module.exports = {
  register,
  login,
  getMe,
  switchRole
};
