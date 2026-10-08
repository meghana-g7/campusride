const express = require("express");
const router = express.Router();
const {
  testHaversine,
  testKNN,
  testGreedy,
  testDijkstra,
  testAStar,
  testKalman,
  testWeightedAverage,
  testSha256,
  testACID
} = require("../controllers/algorithmController");

router.post("/haversine", testHaversine);
router.post("/knn", testKNN);
router.post("/greedy", testGreedy);
router.post("/dijkstra", testDijkstra);
router.post("/astar", testAStar);
router.post("/kalman", testKalman);
router.post("/weighted-average", testWeightedAverage);
router.post("/sha256", testSha256);
router.post("/acid", testACID);

module.exports = router;
