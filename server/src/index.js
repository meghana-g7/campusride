const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const { connectDB, getDBStatus } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const driverRoutes = require("./routes/driverRoutes");
const rideRoutes = require("./routes/rideRoutes");
const algorithmRoutes = require("./routes/algorithmRoutes");
const { smoothGPS } = require("./algorithms");

const app = express();
const server = http.createServer(app);

// Socket.io for real-time 2-device passenger-driver live synchronization
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT"]
  }
});

// Attach socket instance to Express app
app.set("io", io);

// Express Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io connection events
io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on("join_user_room", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined user_${userId}`);
    }
  });

  socket.on("driver_location_ping", (data) => {
    // Smooth incoming coordinates with Kalman filter before broadcasting
    if (data && data.latitude && data.longitude) {
      const smoothed = smoothGPS([{ latitude: data.latitude, longitude: data.longitude }]);
      const finalCoords = smoothed[0] || data;
      io.emit("driver_location_broadcast", {
        driverId: data.driverId,
        coords: finalCoords
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/algorithms", algorithmRoutes);

// Health check & System Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "CampusRide Backend API",
    institution: "Sambhram Institute of Technology",
    timestamp: new Date().toISOString(),
    database: getDBStatus()
  });
});

// Serve frontend static files if built
const fs = require("fs");
const clientDistPath = path.join(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

// Connect Database and Start Server
connectDB().then(() => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(`  CAMPUSRIDE SERVER STARTED SUCCESSFULLY`);
    console.log(`  Institution: Sambhram Institute of Technology`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
});

module.exports = { app, server };
