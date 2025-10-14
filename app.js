const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const dbConnect = require('./config/database');
const { initializeRoles } = require('./controllers/authController');

// Import routes (comment out missing ones temporarily)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const machineRoutes = require('./routes/machines');
const refillRoutes = require('./routes/refills');
const planogramRoutes = require('./routes/planograms');
const maintenanceRoutes = require('./routes/maintenance');
const financeRoutes = require('./routes/finance');
const supportRoutes = require('./routes/support');
const inventoryRoutes = require('./routes/inventory'); // Comment out for now
const auditRoutes = require('./routes/audit'); // Comment out for now
 const roleRoutes = require('./routes/roles'); // Comment out for now

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Frovo Backend API is running!' });
});

// Register routes (only the ones that exist)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/refills', refillRoutes);
app.use('/api/planograms', planogramRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/inventory', inventoryRoutes); // Comment out for now
app.use('/api/audit', auditRoutes); // Comment out for now
app.use('/api/roles', roleRoutes); // Comment out for now

// Database connection
dbConnect().then(() => {
  console.log('Database connected, initializing roles...');
  setTimeout(() => {
    initializeRoles();
  }, 2000);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : {}
  });
});

// FIXED: Remove the problematic 404 handler with '*'
// The 404 will be handled by Express automatically for unmatched routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});