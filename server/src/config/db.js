const mongoose = require("mongoose");
const mockStore = require("../store/mockStore");

let isMongoConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusride";

  try {
    // Attempt connection with short timeout so server boots instantly even if Mongo is down
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected successfully to: ${mongoUri}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB connection warning: ${error.message}`);
    console.log(`[Database] Running in High-Reliability DEMO IN-MEMORY MODE (MockStore active).`);
  }

  // Always initialize mockStore with seed data so demo fallbacks and quick tests work seamlessly
  await mockStore.init();
};

const getDBStatus = () => ({
  isMongoConnected,
  mode: isMongoConnected ? "MongoDB" : "In-Memory Demo Mode"
});

module.exports = {
  connectDB,
  getDBStatus,
  isMongoConnected: () => isMongoConnected
};
