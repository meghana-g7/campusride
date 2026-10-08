const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");
const DriverProfile = require("./models/DriverProfile");
const Ride = require("./models/Ride");
const Feedback = require("./models/Feedback");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusride";

async function seedDatabase() {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("[Seed] Connected. Clearing previous demo data...");

    await User.deleteMany({});
    await DriverProfile.deleteMany({});
    await Ride.deleteMany({});
    await Feedback.deleteMany({});

    const passwordHash = await bcrypt.hash("password123", 10);

    // 1. Create Users
    console.log("[Seed] Creating users...");
    const passengerUser = await User.create({
      name: "Meghana",
      phone: "9876543210",
      email: "passenger@campusride.demo",
      collegeEmail: "meghana.cs@sambhram.org",
      classDepartment: "6th Sem, CSE",
      usn: "1ST23CS001",
      passwordHash,
      role: "passenger",
      gender: "female",
      profileImage: ""
    });

    const driverAjay = await User.create({
      name: "Ajay Kumar",
      phone: "9876543211",
      email: "driver@campusride.demo",
      collegeEmail: "ajay.cs@sambhram.org",
      classDepartment: "8th Sem, CSE",
      usn: "1ST23CS042",
      passwordHash,
      role: "driver",
      gender: "male",
      profileImage: ""
    });

    const driverAnanya = await User.create({
      name: "Ananya",
      phone: "9876543212",
      email: "ananya@campusride.demo",
      collegeEmail: "ananya.aiml@sambhram.org",
      classDepartment: "6th Sem, AIML",
      usn: "1ST23AI018",
      passwordHash,
      role: "driver",
      gender: "female",
      profileImage: ""
    });

    const driverRahul = await User.create({
      name: "Rahul",
      phone: "9876543213",
      email: "rahul@campusride.demo",
      usn: "1ST23CS088",
      passwordHash,
      role: "driver",
      gender: "male",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
    });

    const driverSneha = await User.create({
      name: "Sneha",
      phone: "9876543214",
      email: "sneha@campusride.demo",
      usn: "1ST23IS033",
      passwordHash,
      role: "driver",
      gender: "female",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha"
    });

    const driverKiran = await User.create({
      name: "Kiran",
      phone: "9876543215",
      email: "kiran@campusride.demo",
      usn: "1ST23EC055",
      passwordHash,
      role: "driver",
      gender: "male",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kiran"
    });

    const driverArjun = await User.create({
      name: "Arjun",
      phone: "9876543217",
      email: "arjun@campusride.demo",
      usn: "1ST23CS012",
      passwordHash,
      role: "driver",
      gender: "male",
      profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun"
    });

    // 2. Create Driver Profiles
    console.log("[Seed] Creating driver profiles with vehicles and verification status...");
    const p1 = await DriverProfile.create({
      userId: driverAjay._id,
      name: driverAjay.name,
      phone: driverAjay.phone,
      email: driverAjay.email,
      usn: driverAjay.usn,
      gender: "male",
      vehicleType: "Bike",
      vehicleNumber: "KA02AB1234",
      vehicleModel: "TVS Jupiter",
      rcNumber: "RC-KA02-2022-9871",
      rcDocument: "verified_doc_mock",
      identityDocument: "verified_id_mock",
      faceVerificationStatus: "verified",
      verificationStatus: "verified",
      rating: 4.8,
      completedRides: 48,
      availability: "Available",
      latitude: 13.0760,
      longitude: 77.5580,
      currentLocationName: "MS Palya",
      pinkRideEligible: false,
      profileImage: driverAjay.profileImage
    });

    const p2 = await DriverProfile.create({
      userId: driverAnanya._id,
      name: driverAnanya.name,
      phone: driverAnanya.phone,
      email: driverAnanya.email,
      usn: driverAnanya.usn,
      gender: "female",
      vehicleType: "Bike",
      vehicleNumber: "KA04EN4567",
      vehicleModel: "Honda Activa 6G",
      rcNumber: "RC-KA04-2023-1123",
      rcDocument: "verified_doc_mock",
      identityDocument: "verified_id_mock",
      faceVerificationStatus: "verified",
      verificationStatus: "verified",
      rating: 4.9,
      completedRides: 64,
      availability: "Available",
      latitude: 13.0900,
      longitude: 77.5380,
      currentLocationName: "Lakshmipura Cross",
      pinkRideEligible: true,
      profileImage: driverAnanya.profileImage
    });

    const p3 = await DriverProfile.create({
      userId: driverRahul._id,
      name: driverRahul.name,
      phone: driverRahul.phone,
      email: driverRahul.email,
      usn: driverRahul.usn,
      gender: "male",
      vehicleType: "Bike",
      vehicleNumber: "KA02MN8899",
      vehicleModel: "Bajaj Pulsar 150",
      rcNumber: "RC-KA02-2021-4432",
      rcDocument: "verified_doc_mock",
      identityDocument: "verified_id_mock",
      faceVerificationStatus: "verified",
      verificationStatus: "verified",
      rating: 4.8,
      completedRides: 38,
      availability: "Available",
      latitude: 13.0765,
      longitude: 77.5570,
      currentLocationName: "MS Palya",
      pinkRideEligible: false,
      profileImage: driverRahul.profileImage
    });

    const p4 = await DriverProfile.create({
      userId: driverSneha._id,
      name: driverSneha.name,
      phone: driverSneha.phone,
      email: driverSneha.email,
      usn: driverSneha.usn,
      gender: "female",
      vehicleType: "Bike",
      vehicleNumber: "KA04EF9876",
      vehicleModel: "TVS Jupiter 125",
      rcNumber: "RC-KA04-2024-8891",
      rcDocument: "verified_doc_mock",
      identityDocument: "verified_id_mock",
      faceVerificationStatus: "verified",
      verificationStatus: "verified",
      rating: 4.7,
      completedRides: 29,
      availability: "Available",
      latitude: 13.0450,
      longitude: 77.5100,
      currentLocationName: "Eighth Mile",
      pinkRideEligible: true,
      profileImage: driverSneha.profileImage
    });

    const p5 = await DriverProfile.create({
      userId: driverKiran._id,
      name: driverKiran.name,
      phone: driverKiran.phone,
      email: driverKiran.email,
      usn: driverKiran.usn,
      gender: "male",
      vehicleType: "Car",
      vehicleNumber: "KA03XY5678",
      vehicleModel: "Maruti Suzuki Swift",
      rcNumber: "RC-KA03-2020-5678",
      rcDocument: "verified_doc_mock",
      identityDocument: "verified_id_mock",
      faceVerificationStatus: "verified",
      verificationStatus: "verified",
      rating: 4.6,
      completedRides: 52,
      availability: "Available",
      latitude: 13.0538,
      longitude: 77.5255,
      currentLocationName: "Jalahalli Cross",
      pinkRideEligible: false,
      profileImage: driverKiran.profileImage
    });

    const p6 = await DriverProfile.create({
      userId: driverArjun._id,
      name: driverArjun.name,
      phone: driverArjun.phone,
      email: driverArjun.email,
      usn: driverArjun.usn,
      gender: "male",
      vehicleType: "Car",
      vehicleNumber: "KA50MN7890",
      vehicleModel: "Honda City",
      rcNumber: "RC-KA50-2022-7890",
      rcDocument: "verified_doc_mock",
      identityDocument: "verified_id_mock",
      faceVerificationStatus: "verified",
      verificationStatus: "verified",
      rating: 4.5,
      completedRides: 22,
      availability: "Available",
      latitude: 13.0400,
      longitude: 77.5500,
      currentLocationName: "BEL Circle",
      pinkRideEligible: false,
      profileImage: driverArjun.profileImage
    });

    // 3. Create sample past ride history
    console.log("[Seed] Creating sample completed rides and feedback...");
    const pastRide = await Ride.create({
      passengerId: passengerUser._id,
      driverId: p2._id,
      pickup: "Sambhram Institute of Technology",
      destination: "MS Palya",
      pickupCoordinates: { lat: 13.0805, lng: 77.5458 },
      destinationCoordinates: { lat: 13.0760, lng: 77.5580 },
      distance: 2.0,
      vehicleType: "Bike",
      pinkRide: true,
      fare: 20,
      eta: 4,
      otp: "3060",
      status: "RIDE_COMPLETED",
      paymentStatus: "Paid",
      paymentMethod: "UPI",
      rating: 5,
      feedbackComment: "Very safe and comfortable ride with Ananya!",
      routePath: ["Sambhram Institute of Technology", "MS Palya"],
      createdAt: new Date("2026-10-12T09:15:00Z"),
      completedAt: new Date("2026-10-12T09:25:00Z"),
      driverDetails: {
        id: p2._id.toString(),
        name: p2.name,
        phone: p2.phone,
        usn: p2.usn,
        gender: p2.gender,
        vehicleType: p2.vehicleType,
        vehicleNumber: p2.vehicleNumber,
        vehicleModel: p2.vehicleModel,
        rating: p2.rating,
        profileImage: p2.profileImage
      }
    });

    await Feedback.create({
      rideId: pastRide._id,
      passengerId: passengerUser._id,
      driverId: p2._id,
      rating: 5,
      comment: "Very safe and comfortable ride with Ananya!"
    });

    console.log("====================================================");
    console.log("  CAMPUSRIDE DATABASE SEEDED SUCCESSFULLY! ✓");
    console.log("  Demo Credentials:");
    console.log("  - Passenger  : passenger@campusride.demo / password123");
    console.log("  - Driver (Bike): driver@campusride.demo / password123 (Ajay Kumar)");
    console.log("  - Driver (Pink): ananya@campusride.demo / password123 (Ananya - Female Rider)");
    console.log("  - Driver (Car) : kiran@campusride.demo / password123 (Kiran)");
    console.log("====================================================");

    process.exit(0);
  } catch (error) {
    console.error("[Seed] Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
