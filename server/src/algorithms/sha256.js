/**
 * CampusRide
 * SHA-256 Secure Hash Algorithm - Algorithm 8
 *
 * Purpose:
 * Computes cryptographic one-way hashes for:
 * 1. 4-digit Ride Start PIN/OTP generation and verification
 * 2. Rider identity document verification checksums
 * 3. Secure verification tokens
 *
 * (Note: Passwords in CampusRide are hashed using bcrypt with salt rounds)
 */

const crypto = require("crypto");

function sha256(data) {
  if (data === undefined || data === null) {
    throw new Error("Data to hash cannot be empty.");
  }
  return crypto
    .createHash("sha256")
    .update(String(data), "utf8")
    .digest("hex");
}

// Generate a random 4-digit Ride Start PIN
function generateRidePIN() {
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const hash = sha256(pin);
  return {
    pin,
    pinHash: hash
  };
}

// Verify entered PIN against stored SHA-256 hash
function verifyRidePIN(enteredPin, storedHash) {
  if (!enteredPin || !storedHash) return false;
  const hashOfEntered = sha256(String(enteredPin).trim());
  return hashOfEntered === storedHash;
}

module.exports = {
  sha256,
  generateRidePIN,
  verifyRidePIN
};
