/**
 * CampusRide
 * Dijkstra's Shortest Path Algorithm - Algorithm 4
 *
 * Purpose:
 * Finds the minimum-distance route between two locations on the campus road graph.
 *
 * Input:
 *   graph       - weighted adjacency list
 *   start       - pickup node
 *   destination - drop node
 *
 * Output:
 *   { success: boolean, path: string[], distance: number }
 */

// Precise Google Maps road network distances around Sambhram Institute of Technology (SAIT)
const campusGraph = {
  "Sambhram Institute of Technology": [
    { node: "MS Palya Circle", distance: 2.0 },
    { node: "Lakshmipura Cross", distance: 2.4 },
    { node: "Jalahalli Cross Road", distance: 4.1 }
  ],
  "MS Palya Circle": [
    { node: "Sambhram Institute of Technology", distance: 2.0 },
    { node: "Jalahalli Cross Road", distance: 2.1 },
    { node: "BEL Circle", distance: 3.5 }
  ],
  "Lakshmipura Cross": [
    { node: "Sambhram Institute of Technology", distance: 2.4 },
    { node: "8th Mile", distance: 2.8 },
    { node: "Nelamangala", distance: 15.1 }
  ],
  "Jalahalli Cross Road": [
    { node: "MS Palya Circle", distance: 2.1 },
    { node: "8th Mile", distance: 1.8 },
    { node: "BEL Circle", distance: 2.8 },
    { node: "Sambhram Institute of Technology", distance: 4.1 }
  ],
  "8th Mile": [
    { node: "Lakshmipura Cross", distance: 2.8 },
    { node: "Jalahalli Cross Road", distance: 1.8 },
    { node: "BEL Circle", distance: 3.2 },
    { node: "Nelamangala", distance: 12.3 }
  ],
  "BEL Circle": [
    { node: "Jalahalli Cross Road", distance: 2.8 },
    { node: "8th Mile", distance: 3.2 },
    { node: "MS Palya Circle", distance: 3.5 }
  ],
  "Nelamangala": [
    { node: "8th Mile", distance: 12.3 },
    { node: "Lakshmipura Cross", distance: 15.1 }
  ]
};

function dijkstra(graph = campusGraph, start, destination) {
  if (!graph[start] || !graph[destination]) {
    // If not in standard graph, return fallback direct distance
    return {
      success: false,
      message: "Location not found in road network graph. Using direct route.",
      path: [start, destination],
      distance: null
    };
  }

  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(graph));

  // Initialize distances
  for (const node of unvisited) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[start] = 0;

  while (unvisited.size > 0) {
    let currentNode = null;
    let smallestDistance = Infinity;

    // Find nearest unvisited node
    for (const node of unvisited) {
      if (distances[node] < smallestDistance) {
        smallestDistance = distances[node];
        currentNode = node;
      }
    }

    // No reachable nodes remain
    if (currentNode === null) {
      break;
    }

    // Destination reached
    if (currentNode === destination) {
      break;
    }

    unvisited.delete(currentNode);

    // Examine neighboring nodes
    for (const edge of graph[currentNode] || []) {
      const newDistance = distances[currentNode] + edge.distance;
      if (newDistance < distances[edge.node]) {
        distances[edge.node] = newDistance;
        previous[edge.node] = currentNode;
      }
    }
  }

  // Destination cannot be reached
  if (distances[destination] === Infinity) {
    return {
      success: false,
      path: [start, destination],
      distance: Infinity
    };
  }

  // Reconstruct path
  const path = [];
  let current = destination;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return {
    success: true,
    path,
    distance: Math.round(distances[destination] * 10) / 10
  };
}

module.exports = {
  dijkstra,
  campusGraph
};
