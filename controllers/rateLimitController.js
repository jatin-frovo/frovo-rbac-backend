const getRateLimitStatus = (req, res) => {
  res.json({
    success: true,
    data: {
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        description: 'General API rate limits'
      },
      specificLimits: {
        auth: {
          windowMs: 15 * 60 * 1000,
          maxRequests: 5,
          description: 'Login attempts per 15 minutes'
        },
        registration: {
          windowMs: 60 * 60 * 1000,
          maxRequests: 3,
          description: 'Account registrations per hour'
        },
        orders: {
          windowMs: 60 * 1000,
          maxRequests: 10,
          description: 'Order creations per minute'
        },
        payments: {
          windowMs: 60 * 1000,
          maxRequests: 5,
          description: 'Payment attempts per minute'
        }
      }
    }
  });
};

module.exports = {
  getRateLimitStatus
};