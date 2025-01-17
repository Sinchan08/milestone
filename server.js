const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Data Structures
let ordersQueue = []; // Queue for orders
const graph = {}; // Adjacency list for locations

// Helper Functions
function addEdge(from, to, weight) {
  if (!graph[from]) graph[from] = [];
  graph[from].push({ to, weight });
}

function dijkstra(start, end) {
  const distances = {};
  const visited = new Set();
  const priorityQueue = [];

  // Initialize distances
  for (let node in graph) {
    distances[node] = Infinity;
  }
  distances[start] = 0;

  priorityQueue.push({ node: start, distance: 0 });

  while (priorityQueue.length) {
    priorityQueue.sort((a, b) => a.distance - b.distance);
    const { node: currentNode, distance } = priorityQueue.shift();

    if (visited.has(currentNode)) continue;
    visited.add(currentNode);

    if (currentNode === end) break;

    for (let neighbor of graph[currentNode] || []) {
      const { to, weight } = neighbor;
      const newDist = distance + weight;

      if (newDist < distances[to]) {
        distances[to] = newDist;
        priorityQueue.push({ node: to, distance: newDist });
      }
    }
  }

  return distances[end];
}

// API Endpoints

// Add an order to the queue
app.post('/add-order', (req, res) => {
  const { orderId, customerLocation } = req.body;
  ordersQueue.push({ orderId, customerLocation });
  res.json({ message: 'Order added successfully', ordersQueue });
});

// Process the next order
app.post('/process-order', (req, res) => {
  if (ordersQueue.length === 0) {
    return res.json({ message: 'No orders to process' });
  }

  const nextOrder = ordersQueue.shift();
  res.json({ message: 'Processing order', order: nextOrder });
});

// Add a location connection (route)
app.post('/add-route', (req, res) => {
  const { from, to, weight } = req.body;
  addEdge(from, to, weight);
  res.json({ message: 'Route added successfully', graph });
});

// Get shortest delivery route
app.get('/shortest-route', (req, res) => {
  const { start, end } = req.query;
  const shortestDistance = dijkstra(start, end);

  if (shortestDistance === Infinity) {
    return res.json({ message: 'No route available between these locations' });
  }

  res.json({ message: 'Shortest route calculated', distance: shortestDistance });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


