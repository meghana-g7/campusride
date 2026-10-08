const bcrypt = require("bcryptjs");

// In-Memory store for guaranteed demo execution even if MongoDB is offline
class MockStore {
  constructor() {
    this.users = [];
    this.drivers = [];
    this.rides = [];
    this.feedbacks = [];
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    const defaultPasswordHash = await bcrypt.hash("password123", 10);

    // Initial Users
    this.users = [
      {
        _id: "u_passenger_1",
        id: "u_passenger_1",
        name: "Meghana",
        phone: "9876543210",
        email: "passenger@campusride.demo",
        collegeEmail: "meghana.cs@sambhram.org",
        classDepartment: "6th Sem, CSE",
        usn: "1ST23CS001",
        passwordHash: defaultPasswordHash,
        role: "passenger",
        gender: "female",
        createdAt: new Date("2026-10-01")
      },
      {
        _id: "u_driver_1",
        id: "u_driver_1",
        name: "Ajay Kumar",
        phone: "9876543211",
        email: "driver@campusride.demo",
        collegeEmail: "ajay.cs@sambhram.org",
        classDepartment: "8th Sem, CSE",
        usn: "1ST23CS042",
        passwordHash: defaultPasswordHash,
        role: "driver",
        gender: "male",
        createdAt: new Date("2026-10-01")
      },
      {
        _id: "u_driver_2",
        id: "u_driver_2",
        name: "Ananya",
        phone: "9876543212",
        email: "ananya@campusride.demo",
        collegeEmail: "ananya.aiml@sambhram.org",
        classDepartment: "6th Sem, AIML",
        usn: "1ST23AI018",
        passwordHash: defaultPasswordHash,
        role: "driver",
        gender: "female",
        createdAt: new Date("2026-10-01")
      },
      {
        _id: "u_driver_3",
        id: "u_driver_3",
        name: "Rahul",
        phone: "9876543213",
        email: "rahul@campusride.demo",
        collegeEmail: "rahul.cs@sambhram.org",
        classDepartment: "6th Sem, CSE",
        usn: "1ST23CS088",
        passwordHash: defaultPasswordHash,
        role: "driver",
        gender: "male",
        createdAt: new Date("2026-10-01")
      },
      {
        _id: "u_driver_4",
        id: "u_driver_4",
        name: "Sneha",
        phone: "9876543214",
        email: "sneha@campusride.demo",
        collegeEmail: "sneha.ise@sambhram.org",
        classDepartment: "7th Sem, ISE",
        usn: "1ST23IS033",
        passwordHash: defaultPasswordHash,
        role: "driver",
        gender: "female",
        createdAt: new Date("2026-10-01")
      },
      {
        _id: "u_driver_5",
        id: "u_driver_5",
        name: "Kiran",
        phone: "9876543215",
        email: "kiran@campusride.demo",
        collegeEmail: "kiran.ece@sambhram.org",
        classDepartment: "7th Sem, ECE",
        usn: "1ST23EC055",
        passwordHash: defaultPasswordHash,
        role: "driver",
        gender: "male",
        createdAt: new Date("2026-10-01")
      },
      {
        _id: "u_driver_6",
        id: "u_driver_6",
        name: "Arjun",
        phone: "9876543217",
        email: "arjun@campusride.demo",
        usn: "1ST23CS012",
        passwordHash: defaultPasswordHash,
        role: "driver",
        gender: "male",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun",
        createdAt: new Date("2026-10-01")
      }
    ];

    // Initial Drivers
    this.drivers = [
      {
        _id: "d_1",
        id: "d_1",
        userId: "u_driver_1",
        name: "Ajay Kumar",
        phone: "9876543211",
        email: "driver@campusride.demo",
        usn: "1ST23CS042",
        gender: "male",
        vehicleType: "Bike",
        vehicleNumber: "KA02AB1234",
        vehicleModel: "TVS Jupiter",
        rcNumber: "RC-KA02-2022-9871",
        rating: 4.8,
        completedRides: 48,
        availability: "Available",
        latitude: 13.0760,
        longitude: 77.5580,
        currentLocationName: "MS Palya",
        distanceKm: 0.8,
        etaMinutes: 3,
        pinkRideEligible: false,
        verificationStatus: "verified",
        faceVerificationStatus: "verified",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ajay"
      },
      {
        _id: "d_2",
        id: "d_2",
        userId: "u_driver_2",
        name: "Ananya",
        phone: "9876543212",
        email: "ananya@campusride.demo",
        usn: "1ST23AI018",
        gender: "female",
        vehicleType: "Bike",
        vehicleNumber: "KA04EN4567",
        vehicleModel: "Honda Activa 6G",
        rcNumber: "RC-KA04-2023-1123",
        rating: 4.9,
        completedRides: 64,
        availability: "Available",
        latitude: 13.0900,
        longitude: 77.5380,
        currentLocationName: "Lakshmipura Cross",
        distanceKm: 1.1,
        etaMinutes: 4,
        pinkRideEligible: true,
        verificationStatus: "verified",
        faceVerificationStatus: "verified",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"
      },
      {
        _id: "d_3",
        id: "d_3",
        userId: "u_driver_3",
        name: "Rahul",
        phone: "9876543213",
        email: "rahul@campusride.demo",
        usn: "1ST23CS088",
        gender: "male",
        vehicleType: "Bike",
        vehicleNumber: "KA02MN8899",
        vehicleModel: "Bajaj Pulsar 150",
        rcNumber: "RC-KA02-2021-4432",
        rating: 4.8,
        completedRides: 38,
        availability: "Available",
        latitude: 13.0765,
        longitude: 77.5570,
        currentLocationName: "MS Palya",
        distanceKm: 1.2,
        etaMinutes: 4,
        pinkRideEligible: false,
        verificationStatus: "verified",
        faceVerificationStatus: "verified",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
      },
      {
        _id: "d_4",
        id: "d_4",
        userId: "u_driver_4",
        name: "Sneha",
        phone: "9876543214",
        email: "sneha@campusride.demo",
        usn: "1ST23IS033",
        gender: "female",
        vehicleType: "Bike",
        vehicleNumber: "KA04EF9876",
        vehicleModel: "TVS Jupiter 125",
        rcNumber: "RC-KA04-2024-8891",
        rating: 4.7,
        completedRides: 29,
        availability: "Available",
        latitude: 13.0450,
        longitude: 77.5100,
        currentLocationName: "Eighth Mile",
        distanceKm: 2.0,
        etaMinutes: 6,
        pinkRideEligible: true,
        verificationStatus: "verified",
        faceVerificationStatus: "verified",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha"
      },
      {
        _id: "d_5",
        id: "d_5",
        userId: "u_driver_5",
        name: "Kiran",
        phone: "9876543215",
        email: "kiran@campusride.demo",
        usn: "1ST23EC055",
        gender: "male",
        vehicleType: "Car",
        vehicleNumber: "KA03XY5678",
        vehicleModel: "Maruti Suzuki Swift",
        rcNumber: "RC-KA03-2020-5678",
        rating: 4.6,
        completedRides: 52,
        availability: "Available",
        latitude: 13.0538,
        longitude: 77.5255,
        currentLocationName: "Jalahalli Cross",
        distanceKm: 1.6,
        etaMinutes: 5,
        pinkRideEligible: false,
        verificationStatus: "verified",
        faceVerificationStatus: "verified",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kiran"
      },
      {
        _id: "d_6",
        id: "d_6",
        userId: "u_driver_6",
        name: "Arjun",
        phone: "9876543217",
        email: "arjun@campusride.demo",
        usn: "1ST23CS012",
        gender: "male",
        vehicleType: "Car",
        vehicleNumber: "KA50MN7890",
        vehicleModel: "Honda City",
        rcNumber: "RC-KA50-2022-7890",
        rating: 4.5,
        completedRides: 22,
        availability: "Available",
        latitude: 13.0400,
        longitude: 77.5500,
        currentLocationName: "BEL Circle",
        distanceKm: 2.7,
        etaMinutes: 8,
        pinkRideEligible: false,
        verificationStatus: "verified",
        faceVerificationStatus: "verified",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun"
      }
    ];

    // Seed historical completed ride for demo history
    this.rides = [
      {
        _id: "r_sample_1",
        id: "r_sample_1",
        passengerId: "u_passenger_1",
        driverId: "d_2",
        pickup: "Sambhram Institute of Technology",
        destination: "MS Palya",
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
          name: "Ananya",
          vehicleType: "Bike",
          vehicleModel: "Honda Activa 6G",
          vehicleNumber: "KA04EN4567",
          phone: "9876543212"
        }
      }
    ];

    this.isInitialized = true;
  }

  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserByIdentifier(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    const cleanUpper = identifier.trim().toUpperCase();
    return this.users.find(
      u =>
        u.email.toLowerCase() === clean ||
        (u.collegeEmail && u.collegeEmail.toLowerCase() === clean) ||
        u.usn.toUpperCase() === cleanUpper ||
        u.phone === clean
    );
  }

  findUserById(id) {
    return this.users.find(u => u._id === id || u.id === id);
  }

  findUserByUSN(usn) {
    return this.users.find(u => u.usn.toUpperCase() === usn.toUpperCase());
  }

  addUser(userData) {
    const newUser = {
      _id: "u_" + Date.now(),
      id: "u_" + Date.now(),
      ...userData,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  getDrivers() {
    return [...this.drivers];
  }

  getDriverById(id) {
    return this.drivers.find(d => d._id === id || d.id === id);
  }

  getDriverByUserId(userId) {
    return this.drivers.find(d => d.userId === userId);
  }

  upsertDriverProfile(profileData) {
    const index = this.drivers.findIndex(d => d.userId === profileData.userId);
    if (index >= 0) {
      this.drivers[index] = { ...this.drivers[index], ...profileData };
      return this.drivers[index];
    } else {
      const newDriver = {
        _id: "d_" + Date.now(),
        id: "d_" + Date.now(),
        ...profileData,
        rating: 4.8,
        completedRides: 0,
        availability: "Available",
        verificationStatus: "verified",
        faceVerificationStatus: "verified"
      };
      this.drivers.push(newDriver);
      return newDriver;
    }
  }

  updateDriverAvailability(driverId, availability) {
    const driver = this.getDriverById(driverId);
    if (driver) {
      driver.availability = availability;
      return driver;
    }
    return null;
  }

  createRide(rideData) {
    const newRide = {
      _id: "r_" + Date.now(),
      id: "r_" + Date.now(),
      ...rideData,
      status: rideData.status || "REQUESTED",
      paymentStatus: "Pending",
      createdAt: new Date()
    };
    this.rides.unshift(newRide);
    return newRide;
  }

  getRideById(id) {
    return this.rides.find(r => r._id === id || r.id === id);
  }

  getRidesByUserId(userId) {
    return this.rides.filter(
      r => r.passengerId === userId || (r.driverDetails && r.driverDetails.userId === userId)
    );
  }

  updateRide(id, updates) {
    const ride = this.getRideById(id);
    if (ride) {
      Object.assign(ride, updates);
      return ride;
    }
    return null;
  }

  addFeedback(feedbackData) {
    const feedback = {
      _id: "fb_" + Date.now(),
      id: "fb_" + Date.now(),
      ...feedbackData,
      createdAt: new Date()
    };
    this.feedbacks.push(feedback);
    return feedback;
  }
}

const mockStore = new MockStore();
module.exports = mockStore;
