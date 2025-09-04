const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected devices and performances
const connectedDevices = new Map();
const performances = new Map();
const deviceStats = new Map();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    connectedDevices: connectedDevices.size,
    activePerformances: performances.size
  });
});

// API Routes
app.get('/api/devices', (req, res) => {
  const devices = Array.from(connectedDevices.entries()).map(([deviceId, ws]) => {
    const stats = deviceStats.get(deviceId) || {};
    return {
      deviceId,
      isConnected: ws.readyState === WebSocket.OPEN,
      ...stats
    };
  });
  res.json(devices);
});
