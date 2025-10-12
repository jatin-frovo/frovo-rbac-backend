const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const machineRoutes = require('./machines');
const planogramRoutes = require('./planograms');
const refillRoutes = require('./refills');
const maintenanceRoutes = require('./maintenance');
const financeRoutes = require('./finance');
const supportRoutes = require('./support');
const auditRoutes = require('./audit');
const roleRoutes = require('./roles');
const inventoryRoutes = require('./inventory');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/machines', machineRoutes);
router.use('/planograms', planogramRoutes);
router.use('/refills', refillRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/finance', financeRoutes);
router.use('/support', supportRoutes);
router.use('/audit', auditRoutes);
router.use('/roles', roleRoutes);
router.use('/inventory', inventoryRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    message: 'API route not found',
    path: req.originalUrl
  });
});

module.exports = router;