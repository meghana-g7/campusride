/**
 * CampusRide
 * A* (A-Star) Search Algorithm - Algorithm 5
 *
 * Purpose:
 * Finds an optimized shortest route between pickup and destination using
 * g(n) actual cost from start + h(n) admissible heuristic distance to destination.
 *
 * Input:
 *   graph       - adjacency list
 *   start       - pickup node name
 *   destination - dropoff node name
 *   heuristic   - estimation function h(node, destination)
 */

const { campusGraph } = require("./dijkstra");

// Predefined Google Maps GPS coordinates for Sambhram Institute of Technology (SAIT) & surroundings
const locationCoordinates = {
  "Sambhram Institute of Technology": { lat: 13.0805, lng: 77.5458 },
  "MS Palya Circle": { lat: 13.0760, lng: 77.5580 },
  "Lakshmipura Cross": { lat: 13.0900, lng: 77.5380 },
  "Jalahalli Cross Road": { lat: 13.0538, lng: 77.5255 },
  "8th Mile": { lat: 13.0450, lng: 77.5100 },
  "BEL Circle": { lat: 13.0400, lng: 77.5500 },
  "Nelamangala": { lat: 13.0980, lng: 77.3910 }
};

// Euclidean straight-line distance heuristic (admissible)
function defaultHeuristic(nodeA, nodeB) {
  const coordA = locationCoordinates[nodeA];
  const coordB = locationCoordinates[nodeB];
  if (!coordA || !coordB) return 0;

  // Approx km per degree in Bangalore (~111 km)
  const dLat = (coordA.lat - coordB.lat) * 111;
  const dLng = (coordA.lng - coordB.lng) * 111 * Math.cos((coordA.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function aStar(graph = campusGraph, start, destination, heuristic = defaultHeuristic) {
  if (!graph[start] || !graph[destination]) {
    return {
      success: false,
      message: "Start or destination node not in network graph.",
      path: [start, destination],
      distance: null
    };
  }

  const openList = new Set([start]);
  const closedList = new Set();
  const gScore = {};
  const fScore = {};
  const previous = {};

  for (const node of Object.keys(graph)) {
    gScore[node] = Infinity;
    fScore[node] = Infinity;
    previous[node] = null;
  }

  gScore[start] = 0;
  fScore[start] = heuristic(start, destination);

  while (openList.size > 0) {
    let current = null;
    let lowestScore = Infinity;

    // Select node with lowest f-score
    for (const node of openList) {
      if (fScore[node] < lowestScore) {
        lowestScore = fScore[node];
        current = node;
      }
    }

    if (current === destination) {
      const path = [];
      let node = current;
      while (node !== null) {
        path.unshift(node);
        node = previous[node];
      }
      return {
        success: true,
        path,
        distance: Math.round(gScore[destination] * 10) / 10
      };
    }

    openList.delete(current);
    closedList.add(current);

    for (const neighbor of graph[current] || []) {
      if (closedList.has(neighbor.node)) {
        continue;
      }

      const tentativeG = gScore[current] + neighbor.distance;

      if (tentativeG < gScore[neighbor.node]) {
        previous[neighbor.node] = current;
        gScore[neighbor.node] = tentativeG;
        fScore[neighbor.node] = tentativeG + heuristic(neighbor.node, destination);
        openList.add(neighbor.node);
      }
    }
  }

  return {
    success: false,
    path: [],
    distance: Infinity
  };
}

module.exports = {
  aStar,
  locationCoordinates,
  defaultHeuristic
};
