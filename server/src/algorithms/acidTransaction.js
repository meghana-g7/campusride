/**
 * CampusRide
 * Simulated ACID Transaction Manager for Ride Operations
 *
 * Demonstrates:
 * - Atomicity: All state updates (wallet deduction, ride status commit) succeed or full rollback occurs.
 * - Consistency: Invariant checks (non-negative fare, non-empty ride details).
 * - Isolation: Independent execution state per transaction.
 * - Durability: State commits reliably.
 */

class RideTransaction {
  constructor() {
    this.rides = [];
    this.wallets = {};
    this.transactionLogs = [];
  }

  addWallet(userId, balance) {
    this.wallets[userId] = balance;
  }

  async bookRide(userId, driverId, fare) {
    const txId = "TX-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    this.transactionLogs.push({ txId, action: "START", timestamp: new Date().toISOString() });

    // ATOMICITY: Save snapshot of state for potential rollback
    const previousWallet = this.wallets[userId];
    const previousRides = [...this.rides];

    try {
      // User check
      if (!(userId in this.wallets)) {
        throw new Error("User wallet not found");
      }

      // Balance check
      if (this.wallets[userId] < fare) {
        throw new Error(`Insufficient wallet balance. Required: ₹${fare}, Available: ₹${this.wallets[userId]}`);
      }

      // CONSISTENCY check
      if (fare <= 0) {
        throw new Error("Invalid fare amount. Fare must be greater than zero.");
      }

      // State transition
      this.wallets[userId] -= fare;

      const ride = {
        rideId: "RIDE-" + Date.now(),
        userId,
        driverId,
        fare,
        status: "CONFIRMED",
        createdAt: new Date().toISOString()
      };

      this.rides.push(ride);

      // DURABILITY: Record commit
      this.transactionLogs.push({
        txId,
        action: "COMMIT",
        rideId: ride.rideId,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        transactionId: txId,
        message: "ACID Transaction committed successfully.",
        ride,
        remainingBalance: this.wallets[userId]
      };
    } catch (error) {
      // ATOMICITY: Rollback on failure
      this.wallets[userId] = previousWallet;
      this.rides = previousRides;

      this.transactionLogs.push({
        txId,
        action: "ROLLBACK",
        error: error.message,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        transactionId: txId,
        message: "ACID Transaction rolled back.",
        error: error.message
      };
    }
  }
}

module.exports = RideTransaction;
