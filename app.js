const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const dbConnect = require('./config/database');
const { initializeRoles } = require('./controllers/authController');

// Import rate limiting middleware
const {
  apiLimiter,
  authLimiter,
  orderLimiter,
  paymentLimiter,
  createAccountLimiter
} = require('./middleware/rateLimit');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const machineRoutes = require('./routes/machines');
const refillRoutes = require('./routes/refills');
const planogramRoutes = require('./routes/planograms');
const maintenanceRoutes = require('./routes/maintenance');
const financeRoutes = require('./routes/finance');
const supportRoutes = require('./routes/support');
const customerRoutes = require('./routes/customer');
const productRoutes = require('./routes/products');
const rateLimitRoutes = require('./routes/rateLimit');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Apply general rate limiting to all routes
app.use(apiLimiter);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Frovo Backend API is running!',
    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100
    }
  });
});

// Apply specific rate limiters to routes
app.use('/api/auth/register', createAccountLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/customer/orders', orderLimiter);
app.use('/api/finance/payments', paymentLimiter);
app.use('/api/rate-limit', rateLimitRoutes);

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/refills', refillRoutes);
app.use('/api/planograms', planogramRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/products', productRoutes);

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
  
  // Handle rate limit errors specifically
  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(error.msBeforeNext / 1000) + ' seconds'
    });
  }
  
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Rate limiting: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${process.env.RATE_LIMIT_WINDOW_MS || 60000}ms`);
});